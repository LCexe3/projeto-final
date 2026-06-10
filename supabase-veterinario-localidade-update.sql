-- Atualização para a área "Clínicas da localidade"
-- Rode este arquivo no SQL Editor do Supabase se os veterinários cadastrados não aparecerem na página inicial.

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

alter table public.veterinarians enable row level security;

drop policy if exists "Todos veem veterinarios ativos por localidade" on public.veterinarians;
create policy "Todos veem veterinarios ativos por localidade"
on public.veterinarians
for select
using (ativo = true or user_id = auth.uid() or public.is_veterinarian());
