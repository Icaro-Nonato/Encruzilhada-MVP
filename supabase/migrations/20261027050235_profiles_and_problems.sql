-- Fatia 2: perfil do usuário e problemas.

-- Atualiza updated_at automaticamente em todo UPDATE.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Perfil -------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  goals text not null default '',
  current_situation text not null default '',
  constraints text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o perfil vazio quando alguém se cadastra. "security definer" porque
-- quem dispara o trigger é o Supabase Auth, não o usuário logado.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Contas criadas antes desta migration também ganham um perfil.
insert into public.profiles (id)
select id from auth.users
on conflict do nothing;

-- Problemas ----------------------------------------------------------------

create table public.problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  description text not null,
  clarifications jsonb not null default '[]', -- [{ "question": "...", "answer": "..." }]
  status text not null default 'open' check (status in ('open', 'decided', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.problems enable row level security;

create policy "own rows" on public.problems
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger problems_set_updated_at
  before update on public.problems
  for each row execute function public.set_updated_at();

-- Usado pela lista com filtro por status.
create index problems_user_status_created_idx
  on public.problems (user_id, status, created_at desc);
