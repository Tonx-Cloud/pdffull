-- =============================================
-- PDFfULL — Migration 002: Tabela webhook_logs
-- =============================================
-- Auditoria de tentativas de webhook (Mercado Pago, etc)

create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payment_id text,
  status text not null check (status in ('processed', 'rejected', 'ignored', 'error')),
  ip text,
  verified boolean not null default false,
  details text,
  created_at timestamptz not null default now()
);

-- Índices para consultas de auditoria
create index if not exists idx_webhook_logs_created_at on public.webhook_logs(created_at desc);
create index if not exists idx_webhook_logs_status on public.webhook_logs(status);

-- RLS: somente service_role pode acessar (sem acesso client-side)
alter table public.webhook_logs enable row level security;

-- Nenhuma policy = bloqueado para anon/authenticated, apenas service_role (bypass) pode ler/escrever
