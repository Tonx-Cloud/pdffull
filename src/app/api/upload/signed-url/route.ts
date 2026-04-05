import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { z } from "zod";

const signedUrlSchema = z.object({
  filename: z.string().max(200).default("documento.pdf"),
});

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 200);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = signedUrlSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const filename = sanitizeFilename(parsed.data.filename);
  const storageKey = `pdfs/${Date.now()}-${filename}`;

  // Usar service_role para gerar signed URL (bypass RLS)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminClient.storage
    .from("pdfs")
    .createSignedUploadUrl(storageKey);

  if (error || !data) {
    console.error("Erro ao gerar signed URL:", error);
    return NextResponse.json(
      { error: "Erro ao preparar upload" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    storageKey,
    filename,
  });
}
