-- =============================================
-- PDFfULL — Migration 001: Tabelas iniciais
-- =============================================
-- Executar no SQL Editor do Supabase Dashboard

-- 1. Tabela profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  conversions_this_month integer not null default 0,
  conversions_reset_at timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  mp_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabela conversions
create table if not exists public.conversions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  filename text not null,
  pdf_url text,
  pages integer not null default 1,
  size_bytes bigint not null default 0,
  shared boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Tabela subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mp_subscription_id text,
  plan text not null default 'pro' check (plan in ('pro')),
  status text not null default 'pending' check (status in ('active', 'cancelled', 'pending')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- 4. Índices
create index if not exists idx_conversions_user_id on public.conversions(user_id);
create index if not exists idx_conversions_created_at on public.conversions(created_at desc);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);

-- 5. RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.conversions enable row level security;
alter table public.subscriptions enable row level security;

-- Profiles: usuário só acessa seu próprio perfil
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Conversions: usuário só vê suas próprias conversões
create policy "Users can view own conversions"
  on public.conversions for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversions"
  on public.conversions for insert
  with check (auth.uid() = user_id);

-- Subscriptions: usuário só vê suas próprias assinaturas
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- 6. Trigger: criar profile automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. Trigger: atualizar updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
