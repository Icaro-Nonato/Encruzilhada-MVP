# CLAUDE.md

## Projeto

**Nome provisório:** Encruzilhada (pode mudar — não espalhar o nome pelo código; usar uma constante `APP_NAME` em `src/lib/config.ts`).

App web (PWA, mobile-first) onde o usuário descreve um problema, a IA faz perguntas de esclarecimento, gera opções de solução e analisa em detalhe cada opção escolhida ou escrita pelo usuário. O usuário confirma uma decisão e revisa o resultado depois.

**A especificação completa está em `SPEC.md`. Leia antes de qualquer tarefa.**

## Sobre o desenvolvedor

- Desenvolvedor iniciante (conhece o básico de React), aprendendo enquanto constrói.
- Ao final de cada tarefa, explique em linguagem simples o que foi feito e por quê (decisões técnicas, conceitos novos).
- Prefira sempre a solução mais simples que funcione. Não adicione bibliotecas sem justificar o motivo.
- Se algo no SPEC estiver ambíguo, pergunte antes de implementar.

## Stack

- **Next.js** (App Router) + **TypeScript** (`strict: true`)
- **Tailwind CSS** + **shadcn/ui**
- **Supabase**: PostgreSQL, Auth (e-mail + senha), Row Level Security — via `@supabase/ssr`
- **IA via Vercel AI SDK** (`ai` + provedores `@ai-sdk/google`, `@ai-sdk/anthropic`, etc.) — chamadas **somente no servidor**. Provedor inicial: **Google Gemini (plano gratuito)**. Trocar de provedor deve exigir apenas mudar variáveis de ambiente.
- **Zod** para validar formulários e as respostas da IA
- **Vitest** para testes
- **npm** como gerenciador de pacotes
- Deploy na **Vercel**

## Estrutura de pastas

```
src/
  app/
    (auth)/login/            # login e cadastro
    (app)/                   # rotas protegidas (exigem login)
      problemas/             # lista
      problemas/novo/        # criar problema
      problemas/[id]/        # detalhe: opções, análises, decisão
      perfil/
    api/                     # route handlers (chamadas à IA)
  components/                # componentes reutilizáveis
  components/ui/             # shadcn/ui
  lib/
    config.ts                # APP_NAME e constantes
    supabase/client.ts       # cliente do navegador
    supabase/server.ts       # cliente do servidor
    ai/client.ts             # escolhe provedor/modelo a partir do .env (e o modo mock)
    ai/mock.ts               # respostas falsas para desenvolvimento (AI_MOCK=true)
    ai/prompts.ts            # prompts do sistema
    ai/schemas.ts            # schemas Zod das respostas da IA
  types/
supabase/
  migrations/                # SQL versionado
```

## Regras

- **Segurança:** chaves de API de IA nunca vão para o cliente. Toda chamada à IA acontece em Route Handlers ou Server Actions, e verifica se o usuário está logado.
- **RLS em todas as tabelas.** Cada usuário só lê e escreve os próprios dados.
- **Banco:** toda mudança de schema é uma migration SQL em `supabase/migrations/`. Nunca alterar o banco manualmente.
- **IA:** usar `generateObject` do AI SDK com schemas Zod para respostas estruturadas. Em caso de erro (JSON inválido, timeout, limite de requisições do plano gratuito), mostrar mensagem amigável e botão "Tentar de novo".
- **Provedor e modelos:** vêm das variáveis `AI_PROVIDER`, `AI_MODEL_FAST` e `AI_MODEL_SMART`. Nunca fixar no código. Consulte a documentação do provedor para os IDs atuais dos modelos.
- **Modo mock:** com `AI_MOCK=true`, as rotas de IA retornam respostas falsas válidas (de `ai/mock.ts`) sem chamar nenhuma API. Usar durante o desenvolvimento das telas para não gastar o limite gratuito.
- **Idioma:** interface em português do Brasil; código (variáveis, funções, tabelas, colunas) em inglês.
- **Mobile-first:** toda tela deve funcionar bem a partir de 360px de largura.
- **Escopo:** implemente apenas o que está na fatia atual do SPEC. Não adiantar funcionalidades da seção "Fora do MVP".
- **Estados de carregamento:** chamadas à IA demoram; sempre mostrar loading e desabilitar o botão durante a chamada.

## Fluxo de trabalho

1. Comece cada funcionalidade em modo plano: apresente o plano e espere aprovação.
2. Trabalhe uma fatia (ver `SPEC.md`) por vez.
3. Ao terminar: rode `npm run lint`, `npm run typecheck` e `npm test`; corrija o que falhar.
4. Atualize a seção **Status** do `SPEC.md`.
5. Sugira uma mensagem de commit em português, no formato `feat: ...`, `fix: ...`, `chore: ...`.

## Comandos

```
npm run dev         # servidor local
npm run build       # build de produção
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest
```

## Variáveis de ambiente (`.env.local`, nunca commitar)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # ou a "publishable key" do painel do Supabase
AI_PROVIDER=google                  # google | anthropic | groq | openrouter
AI_MODEL_FAST=                      # modelo leve — perguntas e opções
AI_MODEL_SMART=                     # modelo mais forte disponível — análise
AI_MOCK=false                       # true = respostas falsas, sem chamar API
GOOGLE_GENERATIVE_AI_API_KEY=       # chave do Google AI Studio (gratuita)
ANTHROPIC_API_KEY=                  # opcional, para o futuro
```

Manter um `.env.example` atualizado com as chaves (sem valores).
