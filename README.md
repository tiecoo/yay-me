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
  `/.netlify/functions/celebrate-phrase`, que usa o **Claude (Anthropic,
  modelo `claude-haiku-4-5-20251001`)** para gerar uma frase curta com
  contexto do que foi digitado.
- A chave `ANTHROPIC_API_KEY` fica **apenas no servidor** (variável de
  ambiente do site no Netlify) — nunca é incluída no bundle publicado,
  ao contrário da `GIPHY_API_KEY` que já é client-side hoje.
- Se a chave não estiver configurada, a IA falhar ou demorar mais de 5s,
  o app cai automaticamente na lista estática de frases já existente
  (`motivational-phrases.ts`) — nenhuma funcionalidade fica bloqueada.
- **Configuração necessária:** criar uma API key em
  [console.anthropic.com](https://console.anthropic.com) e cadastrá-la
  em **Netlify → Site settings → Environment variables** como
  `ANTHROPIC_API_KEY`.

## 📐 Convenção para SDDs

Todos os novos documentos de design de software devem ser adicionados na pasta `docs/sdd/` utilizando o formato numérico sequencial:

```text
docs/sdd/XXXX-nome-do-recurso.md
```
Exemplo: `docs/sdd/0002-modulo-notificacoes.md`

