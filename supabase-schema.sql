create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  apelido text,
  email text not null unique,
  telefone text,
  cep text,
  endereco text,
  numero text,
  bairro text,
  cidade text,
  uf char(2),
  complemento text,
  foto_perfil text,
  tipo text not null default 'tutor' check (tipo in ('tutor', 'veterinario')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.veterinarians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  crmv text not null unique,
  telefone text,
  clinica text,
  cidade text,
  uf char(2),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  nome text not null,
  especie_valor text,
  especie text not null,
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  veterinarian_id uuid references public.veterinarians(id) on delete set null,
  servico_valor text,
  servico text not null,
  observacoes_tutor text,
  observacoes_veterinario text,
  status text not null default 'Aguardando análise'
    check (status in ('Aguardando análise','Em atendimento','Atendimento agendado','Procedimento realizado','Finalizado','Cancelado')),
  data_agendada timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger veterinarians_set_updated_at before update on public.veterinarians for each row execute function public.set_updated_at();
create trigger appointments_set_updated_at before update on public.appointments for each row execute function public.set_updated_at();

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

alter table public.profiles enable row level security;
alter table public.veterinarians enable row level security;
alter table public.pets enable row level security;
alter table public.appointments enable row level security;

create policy "Usuário cria o próprio perfil" on public.profiles for insert with check (id = auth.uid());
create policy "Usuário vê o próprio perfil" on public.profiles for select using (id = auth.uid() or public.is_veterinarian());
create policy "Usuário atualiza o próprio perfil" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Veterinário cria o próprio cadastro" on public.veterinarians for insert with check (user_id = auth.uid());
create policy "Veterinário vê cadastros veterinários" on public.veterinarians for select using (user_id = auth.uid() or public.is_veterinarian());
create policy "Todos veem veterinarios ativos por localidade" on public.veterinarians for select using (ativo = true or user_id = auth.uid() or public.is_veterinarian());
create policy "Veterinário atualiza o próprio cadastro" on public.veterinarians for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Tutor cria pet próprio" on public.pets for insert with check (tutor_id = auth.uid());
create policy "Tutor ou veterinário vê pets" on public.pets for select using (tutor_id = auth.uid() or public.is_veterinarian());

create policy "Tutor cria agendamento próprio" on public.appointments for insert with check (tutor_id = auth.uid());
create policy "Tutor vê seus agendamentos e veterinário vê todos" on public.appointments for select using (tutor_id = auth.uid() or public.is_veterinarian());
create policy "Tutor atualiza seus agendamentos" on public.appointments for update using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy "Veterinário atualiza agendamentos" on public.appointments for update using (public.is_veterinarian()) with check (public.is_veterinarian());

-- ==========================
-- Arrecadação CastraPrev
-- ==========================
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
