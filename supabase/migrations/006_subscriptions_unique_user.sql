-- =============================================
-- PDFfULL — Migration 006: Add unique constraint on subscriptions.user_id
-- =============================================
-- Necessário para que upsert com onConflict: "user_id" funcione.
-- Sem isso, o webhook do Mercado Pago falha silenciosamente ao tentar
-- ativar o plano Pro após o pagamento.

-- Primeiro, remover duplicatas (manter a mais recente)
DELETE FROM public.subscriptions a
USING public.subscriptions b
WHERE a.user_id = b.user_id
  AND a.created_at < b.created_at;

-- Agora adicionar a constraint
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
