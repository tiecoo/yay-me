# yay-me

[![Netlify Status](https://api.netlify.com/api/v1/badges/0d8b9204-a595-46a0-a30c-042d7cf0bf49/deploy-status?branch=main)](https://app.netlify.com/projects/yay-me/deploys)

Projeto criado para aprender mais sobre IA e agentes.

## 📁 Estrutura do Repositório

- `_bmad-output/`:
  - `planning-artifacts/`:
    - `prds/prd-yay-me-2026-08-08/`: PRD oficial (**prd.md** e **addendum.md**).
    - `architecture/architecture-yay-me-2026-08-08/`: Arquitetura oficial (**ARCHITECTURE-SPINE.md**).
    - `epics.md`: Breakdown completo de Epics e User Stories.
  - `implementation-artifacts/`:
    - `sprint-status.yaml`: Rastreamento de status das User Stories e Epics.
- `docs/sdd/`: Contém os documentos de design de software (Software Design Documents).
  - `0000-template.md`: Template padrão reutilizável para novos SDDs.
  - `0001-yay-me-arquitetura-inicial.md`: SDD oficial da arquitetura da aplicação (Angular, PrimeNG, Netlify, GIPHY).
  - `0002-celebracao-com-ia.md`: SDD da frase de celebração gerada por IA (Claude + Netlify Function).
  - `0003-streak-e-backup-local.md`: SDD do dashboard de streak/estatísticas e do backup local (exportar/importar).
  - `0004-autenticacao-banco-categorias.md`: SDD de autenticação (email/senha e Google), persistência em banco de dados (Netlify DB) e categorias padrão.
- `netlify/functions/celebrate-phrase.js`: Netlify Function que gera a frase de celebração com Claude, mantendo a chave de API fora do bundle do cliente.
- `netlify/functions/auth-*.mjs`, `categories.mjs`, `achievements*.mjs`: Netlify Functions de autenticação e dados, conversando com o Netlify DB (Postgres).
- `netlify/database/migrations/`: migrations do banco (usuários, sessões, categorias com seed padrão, conquistas).
- `AGENTS.md`: Diretrizes e convenções para desenvolvimento e agentes de IA.

## 🎨 UI / Design System

- **PrimeNG** (tema `lara-light-indigo`), **PrimeIcons** e tokens de design
  próprios (`src/styles.css`) — cores leves, cantos arredondados e sombras
  suaves aplicados de forma consistente em todos os componentes.
- Layout **mobile-first e responsivo**, com app bar fixa, `safe-area` para
  notch de iOS e área de toque confortável nos botões.
- Fluxo de exclusão de conquista com **confirmação inline em dois toques**
  (evita apagar por engano).
- Modal de celebração com animação de entrada, GIF, frase motivacional e
  CTA de fechamento claro para uso no celular.

## 🤖 Frase de celebração com IA

- Ao salvar uma conquista, o front-end chama a Netlify Function
  `/.netlify/functions/celebrate-phrase`, que usa o modelo gratuito
  **`deepseek-ai/DeepSeek-V4-Flash-0731` (via provedor Novita)**, servido
  pelo roteador de Inference Providers da Hugging Face
  (`router.huggingface.co`, API compatível com OpenAI), para gerar em uma
  única chamada: (1) uma frase curta com uma piadinha específica sobre o
  que foi digitado, e (2) até 3 tags que categorizam a conquista (ex.:
  `trabalho`, `saúde`, `família`), exibidas como chips no card da lista.
- O token `HF_TOKEN` fica **apenas no servidor** (variável de ambiente do
  site no Netlify) — nunca é incluído no bundle publicado, ao contrário
  da `GIPHY_API_KEY` que já é client-side hoje.
- O modal **não espera a IA pra celebrar**: abre na hora com um GIF e
  uma frase da lista estática já existente, e só troca a frase pela
  piadinha personalizada da IA quando (e se) ela chegar, sem travar nem
  atrasar a experiência — a resposta da IA é sempre um "upgrade", nunca
  um bloqueio.
- Se o token não estiver configurado, a IA falhar ou demorar mais de 8s,
  o app simplesmente mantém a frase estática que já estava mostrando e a
  conquista fica sem tags — nenhuma
  funcionalidade fica bloqueada.
- **Configuração necessária:** criar um token em
  [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
  e cadastrá-lo em **Netlify → Site settings → Environment variables**
  como `HF_TOKEN`.

## 📈 Monitoramento (New Relic Browser)

- O agente do New Relic é inicializado em `src/main.ts` (não em
  `index.html`) — `NREUM.loader_config` e `NREUM.info` (com a license key
  já resolvida do build) são montados **antes** do `<script>` do agente
  ser criado e inserido no `<head>`, evitando o bug anterior de o agente
  carregar antes da chave estar disponível (a chave sempre chegava vazia).
- Variáveis necessárias no Netlify (Site settings → Environment
  variables), mesmo padrão do `GIPHY_API_KEY`/`HF_TOKEN` — todas já
  configuradas exceto onde indicado:
  - `NEW_RELIC_LICENSE_KEY` — a **license key específica de Browser**
    (formato `NRJS-...`), não a license key geral de ingest/APM da conta.
  - `NEW_RELIC_APPLICATION_ID`, `NEW_RELIC_ACCOUNT_ID`, `NEW_RELIC_TRUST_KEY`,
    `NEW_RELIC_AGENT_ID` (todas configuradas)
- Sem `NEW_RELIC_LICENSE_KEY` configurada (ex.: build local/dev), o
  agente simplesmente não é carregado — nenhum erro, nenhuma chamada de
  rede desnecessária.

## 🔥 Streak e estatísticas

- Dashboard no topo do app, no estilo de "complicações" de relógio de
  saúde: um anel circular central com a **sequência atual de dias
  seguidos** (progresso visual até 7 dias) e dois indicadores menores ao
  lado com o **recorde de sequência** e o **total de conquistas**.
  Fica escondido enquanto não há nenhuma conquista registrada.
- Cálculo em `src/app/core/services/streak.util.ts`
  (`computeStreakStats`), puro e testável: agrupa conquistas por dia
  (fuso local), soma dias consecutivos a partir de hoje — se hoje ainda
  não tem registro, a sequência continua "viva" contando a partir de
  ontem, só quebra depois de um dia inteiro sem nada.

## 🔐 Autenticação e persistência em banco de dados

- Login por **email/senha** ou **"Entrar com Google"** (Google Identity
  Services). Sessão via cookie `httpOnly` opaco, validado contra uma
  tabela `sessions` no banco — permite logout com revogação real, sem
  depender de JWT.
- Conquistas deixaram de viver só no `localStorage`: agora ficam em
  **Postgres**, provisionado automaticamente pelo **Netlify DB**
  (`@netlify/database`), um por usuário. As Netlify Functions
  `netlify/functions/auth-*.mjs`, `categories.mjs` e `achievements*.mjs`
  implementam o backend, com as migrations em
  `netlify/database/migrations/`.
- Senhas usam hash `scrypt` (`node:crypto`, sem dependência nativa); o
  token do Google é verificado no servidor com `jose` antes de criar a
  sessão.
- **Configuração necessária:** criar um OAuth Client ID em
  [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  (tipo "Web application", com as origens autorizadas do site) e
  cadastrar `GOOGLE_CLIENT_ID` em **Netlify → Site settings →
  Environment variables**. O Netlify DB não precisa de configuração
  manual — é provisionado ao instalar `@netlify/database` e fazer deploy
  (ou rodar `netlify dev`).

## 🏷️ Categorias padrão

- Ao registrar uma conquista, dá pra escolher uma categoria numa lista já
  pré-cadastrada (seed das migrations): trabalho, saúde, família,
  estudos, exercício, casa, financeiro, social, autocuidado e
  criatividade — mesmo vocabulário usado pelas tags geradas por IA.
- Categoria (escolhida pela pessoa) e tags de IA (geradas automaticamente
  pela frase de celebração) são conceitos independentes e aparecem juntos
  como chips no card da conquista.

## 💾 Backup local (exportar/importar) e migração de dados antigos

- Os botões **"Exportar backup"** e **"Importar backup"** (rodapé do app)
  continuam funcionando do mesmo jeito: exporta um `.json` com as
  conquistas da conta, e importa mesclando por `id` (nunca sobrescreve,
  nunca duplica ao reimportar o mesmo arquivo).
- Quem já usava o app antes da conta com login: ao fazer login pela
  primeira vez num navegador que ainda tem conquistas salvas no
  `localStorage` de antes, o app oferece importá-las automaticamente para
  a conta (uma vez só, com opção de ignorar).
- Implementado em `AchievementService` (`exportBackup()`,
  `importBackup()`, `importLegacyLocalAchievements()`); validação de
  formato antes de enviar qualquer coisa ao servidor — arquivo inválido
  mostra erro e não altera os dados existentes.

## 📐 Convenção para SDDs

Todos os novos documentos de design de software devem ser adicionados na pasta `docs/sdd/` utilizando o formato numérico sequencial:

```text
docs/sdd/XXXX-nome-do-recurso.md
```
Exemplo: `docs/sdd/0002-modulo-notificacoes.md`

