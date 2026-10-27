-- Fatia 3: opções de solução de um problema (geradas pela IA ou escritas pelo usuário).

create table public.options (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  summary text not null,
  source text not null check (source in ('ai', 'user')),
  created_at timestamptz not null default now()
);

alter table public.options enable row level security;

-- Além de a linha ser do usuário, o problema também precisa ser dele.
-- Sem isso, daria para pendurar uma opção no problema de outra pessoa.
create policy "own rows" on public.options
  for all
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.problems
      where problems.id = problem_id and problems.user_id = auth.uid()
    )
  );

create index options_problem_created_idx
  on public.options (problem_id, created_at);
