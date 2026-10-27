# SPEC — Encruzilhada (MVP)

## 1. Visão

**Longo prazo:** um "RPG da vida real". Um personagem representa o usuário, com finanças, projetos, contatos, problemas, XP e atributos, e uma IA ajuda nas decisões usando todo esse contexto.

**MVP:** um app onde a IA recebe um problema, sugere opções para resolvê-lo e analisa em detalhe cada opção escolhida ou escrita pelo usuário.

**Diferencial em relação a um chat comum:**

1. A IA conhece o perfil do usuário.
2. A análise segue uma estrutura fixa.
3. As decisões ficam registradas e são revisadas depois.

## 2. Objetivo do MVP e métrica de sucesso

- O usuário consegue ir de "tenho um problema" até "decisão confirmada" em poucos minutos, pelo celular.
- **Sucesso:** o próprio criador usa o app em pelo menos 5 problemas reais em 2 semanas, sem se forçar.

## 3. Escopo

**Entra no MVP:**

- Cadastro e login (e-mail + senha)
- Perfil mínimo (objetivos, situação atual, restrições)
- Problemas: criar, listar, ver detalhe, mudar status
- Perguntas de esclarecimento da IA (opcional, até 3)
- Geração de 3 a 4 opções pela IA
- Opção escrita pelo usuário
- Análise estruturada de qualquer opção
- Comparação lado a lado das opções já analisadas
- Confirmar decisão (expectativa, confiança, data de revisão)
- Revisão da decisão (como foi, nota)

**Fora do MVP** (não implementar agora): ver seção 10.

## 4. Histórias de usuário

1. Como usuário, quero criar uma conta e entrar para que meus dados fiquem privados.
2. Como usuário, quero preencher um perfil curto para que a IA entenda meu contexto.
3. Como usuário, quero descrever um problema em texto livre.
4. Como usuário, quero responder perguntas da IA quando faltar informação, para receber opções melhores.
5. Como usuário, quero receber de 3 a 4 opções de solução, cada uma com título e resumo.
6. Como usuário, quero escrever minha própria opção quando nenhuma me servir.
7. Como usuário, quero ver uma análise detalhada de uma opção antes de decidir.
8. Como usuário, quero comparar as opções analisadas lado a lado.
9. Como usuário, quero confirmar uma decisão registrando o que espero que aconteça.
10. Como usuário, quero ser lembrado, ao abrir o app, das decisões com revisão pendente e registrar como foi.

## 5. Fluxo principal

```
Novo problema (título + descrição)
   │
   ▼
IA verifica se falta informação ──sim──► mostra até 3 perguntas ──► usuário responde (ou pula)
   │ não                                                                    │
   ▼◄───────────────────────────────────────────────────────────────────────┘
IA gera 3–4 opções
   │
   ▼
Usuário escolhe uma opção  OU  escreve a própria
   │
   ▼
IA analisa a opção (pode repetir para outras opções)
   │
   ▼
Comparar opções analisadas (opcional)
   │
   ▼
Confirmar decisão: expectativa + confiança (1–5) + data de revisão
   │  status do problema → "decided"
   ▼
Na data de revisão: "Como foi?" → resultado + nota (1–5)
      status → "resolved"
```

Status do problema: `open` → `decided` → `resolved`.

## 6. Telas

| Rota | Conteúdo |
|---|---|
| `/login` | Login e cadastro (abas). Redireciona para `/problemas` se já estiver logado. |
| `/perfil` | Formulário com 3 campos de texto: objetivos, situação atual, restrições. Se o perfil estiver vazio, o usuário é levado para cá após o primeiro login. |
| `/problemas` | Lista de problemas com filtro por status (Abertos / Decididos / Resolvidos). Banner no topo com "Revisões pendentes" quando `review_date <= hoje` e ainda não revisado. Botão "Novo problema". |
| `/problemas/novo` | Título + descrição. Ao enviar: cria o problema e chama a IA para checar se precisa de esclarecimento. |
| `/problemas/[id]` | Página principal, em seções: descrição e respostas de esclarecimento; lista de opções (com origem IA/usuário); botão "Analisar" em cada opção; campo "Escrever minha opção"; análises expandíveis; botão "Comparar"; botão "Decidir por esta opção"; formulário de revisão quando aplicável. |

Navegação: barra inferior no mobile (Problemas, Perfil) e menu simples no desktop.

## 7. Modelo de dados (Supabase / PostgreSQL)

Todas as tabelas têm `user_id` para simplificar o RLS.

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  goals text default '',
  current_situation text default '',
  constraints text default '',
  updated_at timestamptz not null default now()
);

create table problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  description text not null,
  clarifications jsonb not null default '[]',  -- [{ "question": "...", "answer": "..." }]
  status text not null default 'open' check (status in ('open','decided','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table options (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references problems on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  summary text not null,
  source text not null check (source in ('ai','user')),
  created_at timestamptz not null default now()
);

create table analyses (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references options on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  content jsonb not null,   -- formato definido em 8.3
  model text not null,
  created_at timestamptz not null default now()
);

create table decisions (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null unique references problems on delete cascade,
  option_id uuid not null references options on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  expectation text not null,
  confidence int not null check (confidence between 1 and 5),
  review_date date not null,
  outcome text,
  outcome_rating int check (outcome_rating between 1 and 5),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS (repetir para problems, options, analyses, decisions)
alter table problems enable row level security;
create policy "own rows" on problems
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- profiles usa id em vez de user_id
alter table profiles enable row level security;
create policy "own profile" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
```

Criação do perfil: um trigger em `auth.users` cria a linha vazia em `profiles` no cadastro.

## 8. IA

### 8.1 Contexto enviado em toda chamada

- Perfil do usuário (goals, current_situation, constraints)
- Data de hoje
- O problema (título, descrição, clarifications)

Mantenha o contexto enxuto e não envie dados de outros problemas no MVP.

### 8.2 Diretrizes gerais do prompt de sistema (`src/lib/ai/prompts.ts`)

- Responder em português do Brasil.
- Ser honesto e direto, incluindo apontar riscos e pontos fracos da opção do usuário.
- Considerar o perfil e as restrições do usuário. Opções inviáveis para ele não devem aparecer.
- Não decidir pelo usuário: apresentar análise e trade-offs.
- Responder **apenas** com JSON no formato pedido.

### 8.3 Chamadas

**1. `POST /api/ai/clarify`**: modelo FAST

Entrada: problem_id. Saída:

```json
{
  "needs_clarification": true,
  "questions": ["string"]
}
```

`questions` tem no máximo 3 itens e fica vazio se `needs_clarification` for `false`. As respostas do usuário são salvas em `problems.clarifications`, e o usuário pode pular as perguntas.

**2. `POST /api/ai/options`**: modelo FAST

Entrada: problem_id. Saída:

```json
{
  "options": [
    { "title": "string (até 60 caracteres)", "summary": "string (1–3 frases)" }
  ]
}
```

São de 3 a 4 opções, diferentes entre si de verdade (não variações da mesma ideia), e ficam salvas em `options` com `source = 'ai'`. Um botão "Gerar mais opções" pode chamar de novo, enviando as opções existentes para evitar repetição.

**3. `POST /api/ai/analyze`**: modelo SMART

Entrada: option_id. Saída (salva em `analyses.content`):

```json
{
  "overview": "string — resumo da análise em 2–3 frases",
  "pros": ["string"],
  "cons": ["string"],
  "risks": ["string — imprevistos possíveis"],
  "consequences": {
    "short_term": ["string"],
    "long_term": ["string"]
  },
  "reversibility": {
    "level": "high | medium | low",
    "explanation": "string"
  },
  "cost": {
    "time": "string",
    "money": "string",
    "energy": "string"
  },
  "scenarios": {
    "best": "string",
    "likely": "string",
    "worst": "string"
  },
  "goal_alignment": "string — como a opção se relaciona com os objetivos do perfil",
  "questions_to_consider": ["string — perguntas que o usuário deveria se fazer antes de decidir"]
}
```

Se a opção já tiver análise, mostrar a existente, com botão "Analisar novamente".

### 8.4 Comparação

A comparação não faz chamada à IA. É uma tabela montada a partir das análises existentes (linhas: reversibilidade, custos, cenário provável, número de prós, contras e riscos; colunas: opções).

## 9. Fatias de desenvolvimento

Cada fatia termina com lint, typecheck e testes passando, commit e status atualizado.

| # | Fatia | Pronto quando |
|---|---|---|
| 1 | **Base** — Next.js, Tailwind, shadcn/ui, Supabase, auth, layout com navegação, rotas protegidas, `.env.example`, deploy na Vercel | Consigo me cadastrar, entrar e sair pelo celular, no site publicado. |
| 2 | **Perfil + problemas** — migrations e RLS, trigger do perfil, tela de perfil, CRUD de problemas, lista com filtro | Crio e vejo problemas, e outro usuário não vê os meus. |
| 3 | **Esclarecimento + opções** — cliente de IA (AI SDK, provedor via .env, modo mock), prompts, schemas Zod, `/api/ai/clarify`, `/api/ai/options`, opção escrita pelo usuário | Crio um problema, respondo as perguntas, recebo opções e adiciono a minha. |
| 4 | **Análise + comparação** — `/api/ai/analyze`, exibição da análise, tabela de comparação | Analiso 2 opções e as comparo lado a lado. |
| 5 | **Decisão + revisão** — confirmar decisão, mudança de status, banner de revisões pendentes, formulário de revisão | Decido, e na data marcada consigo registrar como foi. |
| 6 | **Acabamento** — PWA (manifest, ícone, instalação), estados vazios, tratamento de erros, revisão de responsividade | Instalo na tela inicial do celular e uso o fluxo completo sem travar. |

## 10. Fora do MVP (backlog)

Não implementar agora. Fica registrado para orientar decisões de arquitetura:

- Personagem com XP, nível e atributos (Finanças, Saúde, Social, Carreira, Felicidade)
- Controle financeiro (entradas e saídas, reserva, orçamento por projeto)
- Projetos por categoria, com métricas criadas pela IA
- Problemas pessoais separados dos projetos
- Contatos (mini-CRM)
- Missões diárias e semanais
- Registro rápido em linguagem natural
- Resumos semanais, mensais e anuais (memória em pirâmide) e ferramentas de consulta para a IA
- Busca de decisões parecidas (pgvector)
- IA alterando métricas com confirmação e histórico
- Notificações (push ou e-mail) de revisão

## 11. Status

| Fatia | Status |
|---|---|
| 1 — Base | ✅ concluída — publicada em https://encruzilhada-mvp-5jsq.vercel.app |
| 2 — Perfil + problemas | ⬜ não iniciada |
| 3 — Esclarecimento + opções | ⬜ não iniciada |
| 4 — Análise + comparação | ⬜ não iniciada |
| 5 — Decisão + revisão | ⬜ não iniciada |
| 6 — Acabamento | ⬜ não iniciada |
