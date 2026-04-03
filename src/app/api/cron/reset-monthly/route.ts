import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  // Verificar secret para proteger o endpoint
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Resetar contagem de conversões para todos os usuários
  const { error, count } = await supabase
    .from("profiles")
    .update({
      conversions_this_month: 0,
      conversions_reset_at: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        1
      ).toISOString(),
    })
    .gte("conversions_this_month", 1);

  if (error) {
    console.error("Erro no reset mensal:", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    reset_count: count,
    timestamp: new Date().toISOString(),
  });
}
