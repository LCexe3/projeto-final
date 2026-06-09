-- Atualização isolada para restaurar a Arrecadação no Supabase
-- Use este arquivo se as tabelas profiles, veterinarians, pets e appointments já existem.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_veterinarian()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.veterinarians
    where user_id = auth.uid() and ativo = true
  );
$$;

create table if not exists public.fundraising_contributions (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references public.profiles(id) on delete set null,
  nome text not null,
  email text,
  telefone text,
  valor numeric(10,2) not null check (valor > 0),
  forma_pagamento text not null default 'Pix',
  mensagem text,
  status text not null default 'Registrada'
    check (status in ('Registrada','Confirmada','Cancelada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fundraising_contributions enable row level security;

drop trigger if exists fundraising_contributions_set_updated_at on public.fundraising_contributions;
create trigger fundraising_contributions_set_updated_at
before update on public.fundraising_contributions
for each row execute function public.set_updated_at();

drop policy if exists "Visitante ou tutor registra arrecadacao" on public.fundraising_contributions;
create policy "Visitante ou tutor registra arrecadacao"
on public.fundraising_contributions
for insert
with check (true);

drop policy if exists "Todos acompanham arrecadacao registrada" on public.fundraising_contributions;
create policy "Todos acompanham arrecadacao registrada"
on public.fundraising_contributions
for select
using (status in ('Registrada','Confirmada') or public.is_veterinarian() or tutor_id = auth.uid());

drop policy if exists "Veterinario atualiza arrecadacao" on public.fundraising_contributions;
create policy "Veterinario atualiza arrecadacao"
on public.fundraising_contributions
for update
using (public.is_veterinarian())
with check (public.is_veterinarian());
