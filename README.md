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
- `netlify/functions/celebrate-phrase.js`: Netlify Function que gera a frase de celebração com Claude, mantendo a chave de API fora do bundle do cliente.
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
  - `NEW_RELIC_APPLICATION_ID`, `NEW_RELIC_ACCOUNT_ID`, `NEW_RELIC_TRUST_KEY`
  - `NEW_RELIC_AGENT_ID` — **pendente**: mesmo valor do Application ID
    nesta conta. Pegue em New Relic → Browser → (o app) → Application
    settings → "Copy/Paste JavaScript code", no objeto
    `NREUM.loader_config`.
- Sem `NEW_RELIC_LICENSE_KEY` configurada (ex.: build local/dev), o
  agente simplesmente não é carregado — nenhum erro, nenhuma chamada de
  rede desnecessária.

## 📐 Convenção para SDDs

Todos os novos documentos de design de software devem ser adicionados na pasta `docs/sdd/` utilizando o formato numérico sequencial:

```text
docs/sdd/XXXX-nome-do-recurso.md
```
Exemplo: `docs/sdd/0002-modulo-notificacoes.md`

