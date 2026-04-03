import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const isR2Configured =
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY;

const r2Client = isR2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function uploadToR2(
  file: Buffer,
  filename: string,
  contentType: string = "application/pdf"
): Promise<string> {
  const key = `pdfs/${Date.now()}-${filename}`;

  if (r2Client) {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    );
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }

  // Fallback: Supabase Storage
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from("pdfs")
      .upload(key, file, { contentType, upsert: false });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return `local://${key}`;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("pdfs")
      .getPublicUrl(key);

    return publicUrl;
  } catch (e) {
    console.error("Storage fallback error:", e);
    return `local://${key}`;
  }
}
