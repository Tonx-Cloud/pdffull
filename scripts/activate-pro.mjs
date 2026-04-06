/**
 * Script para ativar manualmente o plano Pro para um usuário.
 * Uso: node scripts/activate-pro.mjs <email>
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ndckyfnasriciclctpvf.supabase.co";

// Service role key é necessário — pegar do .env.local ou Supabase Dashboard
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY não definida.");
  console.error("   Defina a variável de ambiente antes de executar:");
  console.error(
    '   $env:SUPABASE_SERVICE_ROLE_KEY="sua-key"; node scripts/activate-pro.mjs <email>'
  );
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("❌ Uso: node scripts/activate-pro.mjs <email>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function activatePro() {
  // Buscar perfil pelo email
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, email, plan")
    .eq("email", email)
    .single();

  if (profileErr || !profile) {
    console.error(`❌ Perfil não encontrado para ${email}:`, profileErr?.message);
    process.exit(1);
  }

  console.log(`👤 Usuário encontrado: ${profile.email} (ID: ${profile.id})`);
  console.log(`📋 Plano atual: ${profile.plan}`);

  if (profile.plan === "pro") {
    console.log("✅ Perfil já é Pro! Verificando subscription...");
  }

  // Atualizar perfil para Pro
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ plan: "pro" })
    .eq("id", profile.id);

  if (updateErr) {
    console.error("❌ Erro ao atualizar perfil:", updateErr.message);
    process.exit(1);
  }

  // Criar/atualizar subscription
  // Primeiro tenta update, se não existir faz insert
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", profile.id)
    .single();

  const subData = {
    user_id: profile.id,
    mp_subscription_id: "manual-activation",
    plan: "pro",
    status: "active",
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
  };

  let subErr;
  if (existingSub) {
    ({ error: subErr } = await supabase
      .from("subscriptions")
      .update(subData)
      .eq("id", existingSub.id));
  } else {
    ({ error: subErr } = await supabase
      .from("subscriptions")
      .insert(subData));
  }

  if (subErr) {
    console.error("❌ Erro ao criar subscription:", subErr.message);
    process.exit(1);
  }

  console.log("✅ Plano Pro ativado com sucesso!");
  console.log(`   Email: ${email}`);
  console.log(`   Válido até: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}`);
}

activatePro().catch(console.error);
