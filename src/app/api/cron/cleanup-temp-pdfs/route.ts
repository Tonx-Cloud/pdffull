import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

export const runtime = "nodejs";
export const maxDuration = 60;

const TTL_MS = 24 * 60 * 60 * 1000; // 24h
const TEMP_PREFIX = "pdfs/";
const TEMP_MARKER = "temp-";

function isExpiredTempKey(key: string, lastModified: Date | undefined): boolean {
  const filename = key.split("/").pop() || "";
  if (!filename.includes(TEMP_MARKER)) return false;
  const age = lastModified
    ? Date.now() - lastModified.getTime()
    : Number.POSITIVE_INFINITY;
  return age > TTL_MS;
}

async function cleanupR2(): Promise<number> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return 0;

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  let deleted = 0;
  let continuationToken: string | undefined;

  do {
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: TEMP_PREFIX,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      })
    );

    const toDelete = (list.Contents ?? [])
      .filter((o) => o.Key && isExpiredTempKey(o.Key, o.LastModified))
      .map((o) => ({ Key: o.Key! }));

    if (toDelete.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: toDelete, Quiet: true },
        })
      );
      deleted += toDelete.length;
    }

    continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (continuationToken);

  return deleted;
}

async function cleanupSupabase(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return 0;

  const supabase = createClient(url, serviceKey);
  let deleted = 0;
  let offset = 0;
  const pageSize = 100;

  // Supabase Storage lista por pasta; como usamos key "pdfs/<arquivo>" dentro
  // do bucket "pdfs", listamos a raiz do bucket.
  for (;;) {
    const { data, error } = await supabase.storage
      .from("pdfs")
      .list("", { limit: pageSize, offset });

    if (error || !data || data.length === 0) break;

    const expired = data
      .filter((obj) => {
        if (!obj.name.includes(TEMP_MARKER)) return false;
        const modified = obj.updated_at || obj.created_at;
        if (!modified) return false;
        return Date.now() - new Date(modified).getTime() > TTL_MS;
      })
      .map((obj) => obj.name);

    if (expired.length > 0) {
      const { error: delErr } = await supabase.storage
        .from("pdfs")
        .remove(expired);
      if (!delErr) deleted += expired.length;
    }

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return deleted;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [r2Count, supabaseCount] = await Promise.all([
      cleanupR2().catch((e) => {
        console.error("R2 cleanup error:", e);
        return 0;
      }),
      cleanupSupabase().catch((e) => {
        console.error("Supabase cleanup error:", e);
        return 0;
      }),
    ]);

    return NextResponse.json({
      success: true,
      deleted: { r2: r2Count, supabase: supabaseCount },
      total: r2Count + supabaseCount,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Cleanup failed:", e);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
