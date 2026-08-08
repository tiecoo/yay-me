# SDD-0002: Frase e Tags de Celebração Geradas por IA

* **Autor:** Claude (agente de IA)
* **Data:** 2026-08-08
* **Status:** Implementado
* **Tags:** #ia #netlify-functions #celebracao #huggingface #deepseek

---

## 1. Visão Geral e Contexto
Hoje, ao salvar uma conquista, o `CelebrationModalComponent` escolhe uma
frase aleatória de uma lista estática de 8 frases fixas
(`motivational-phrases.ts`) — a frase nunca tem relação com o que a
pessoa efetivamente escreveu, e não há nenhuma categorização das
conquistas na lista. O objetivo desta mudança é gerar, na hora, numa
única chamada de IA: (1) uma frase de celebração com contexto real da
conquista digitada (incluindo uma piadinha específica sobre o que foi
descrito) e (2) até 3 tags curtas que categorizam a conquista, exibidas
como chips no card da lista. Usa o modelo
**`deepseek-ai/DeepSeek-V4-Flash-0731`**, servido de graça pelo provedor
**Novita** através do roteador de Inference Providers da Hugging Face
(`router.huggingface.co`, API compatível com o formato de chat
completions da OpenAI) — escolha do usuário por ser um modelo sem custo.

## 2. Objetivos e Não-Objetivos (Goals & Non-Goals)
- **Objetivos (Goals):**
  - Gerar uma frase curta e personalizada (com piadinha específica) e até
    3 tags de categorização, numa única chamada de IA por conquista.
  - Manter o token de API da IA fora do bundle do cliente (diferente do
    padrão hoje usado pela `GIPHY_API_KEY`).
  - Nunca bloquear o fluxo principal: se a IA falhar, estiver lenta,
    sem token configurado, ou devolver algo que não seja JSON válido, o
    app cai de volta na lista estática de frases e a conquista fica sem
    tags — sem travar o salvamento nem o modal.
- **Não-Objetivos (Non-Goals):**
  - Não altera o fluxo do GIF de celebração (`GifService` continua igual).
  - Não introduz histórico/conversa com a IA — é uma chamada única e sem
    estado por conquista salva.
  - Não persiste o texto enviado à IA em nenhum lugar (nem client, nem
    function, nem logs aplicacionais).
  - Não oferece edição manual de tags nem filtro da lista por tag nesta
    entrega — são só exibidas como metadado no card.

## 3. Arquitetura Proposta

```mermaid
graph TD
    User([Usuário]) -->|digita conquista| Form[AchievementFormComponent]
    Form -->|saved(text)| App[AppComponent]
    App -->|addAchievement salva localmente| Storage[(localStorage)]
    App -->|open(id, text)| Modal[CelebrationModalComponent]
    Modal -->|getCelebrationInsights(text)| PhraseService[CelebrationPhraseService]
    PhraseService -->|POST /.netlify/functions/celebrate-phrase| Function[Netlify Function]
    Function -->|Bearer HF_TOKEN server-side| HF[HF Router - DeepSeek V4 Flash via Novita]
    HF -->|"JSON { phrase, tags }"| Function
    Function -->|"{ phrase, tags }"| PhraseService
    PhraseService -->|timeout/erro| Fallback[Frase estática local + tags vazias]
    PhraseService -->|tags| ModalTags[Modal chama AchievementService.updateTags]
    ModalTags -->|patch tags| Storage
    Storage -->|achievements$| List[AchievementListComponent - chips de tag]
```

## 4. Especificação Técnica

### Componentes e Arquivos
- `netlify/functions/celebrate-phrase.js`: Netlify Function
  (`exports.handler`) que recebe `{ text }`, chama
  `https://router.huggingface.co/v1/chat/completions` (formato chat
  completions compatível com OpenAI) com
  `model: 'deepseek-ai/DeepSeek-V4-Flash-0731:novita'` e um `system
  prompt` pedindo duas coisas na mesma resposta: uma frase com piadinha
  específica sobre a conquista (nunca sarcástica) e até 3 tags curtas de
  categorização — em **JSON estrito**
  (`{"phrase": "...", "tags": ["...", "..."]}`). A mensagem do usuário
  enviada ao modelo sempre começa com um prefixo de contexto fixo ("Isso
  é para apoiar e animar a pessoa... faça uma piadinha bem-humorada e
  específica... categorize com tags curtas... A conquista descrita é:
  ...") — reforça a intenção diretamente no turno do usuário, além do
  `system prompt`, já que modelos pequenos/gratuitos tendem a seguir
  menos fielmente instruções apenas no `system`.
  - `parseModelJson`/`extractResult`: parsing tolerante da resposta —
    tenta `JSON.parse` direto, remove blocos de code fence
    (` ```json…``` `) se existirem, e por fim extrai o primeiro trecho
    `{...}` da string via regex antes de tentar de novo. `tags` é
    validado como array de strings, normalizado (`trim`, `toLowerCase`,
    até 24 caracteres) e limitado a 3 itens; `phrase` é limitado a 140
    caracteres. Se o parsing falhar ou `phrase` vier vazio, retorna
    `{ phrase: null, tags: [] }` — nunca lança exceção pro cliente.
  - Timeout interno de 6s via `AbortController`. Qualquer erro (token
    ausente, timeout, resposta vazia/inválida, erro HTTP) retorna
    `{ phrase: null, tags: [] }` com status 200 — nunca propaga erro 5xx.
- `netlify.toml`: declara `build.command`, `build.publish` e
  `functions.directory = "netlify/functions"`.
- `src/app/core/services/celebration-phrase.service.ts`: expõe
  `getCelebrationInsights(text): Observable<{ phrase, tags }>`, chamando
  a function via `HttpClient` com `timeout(5000)` e `catchError`,
  caindo para `{ phrase: <sorteio de MOTIVATIONAL_PHRASES>, tags: [] }`
  em qualquer falha — mesmo padrão de resiliência já usado pelo
  `GifService`.
- `src/app/shared/models/achievement.model.ts`: `Achievement` ganha
  `tags?: string[]`.
- `src/app/core/services/achievement.service.ts`: novo
  `updateTags(id, tags)` — faz um patch imutável no item pelo `id` e
  persiste; no-op se `tags` vier vazio (evita escrita desnecessária no
  `localStorage` quando a IA não retornou tags).
- `celebration-modal.component.ts`: `open(achievementId, achievementText)`
  passa a receber também o `id` da conquista já salva; dispara
  `GifService` e `CelebrationPhraseService` em paralelo; ao resolver a
  frase, chama `AchievementService.updateTags(achievementId, tags)` para
  "enriquecer" a conquista já persistida assim que as tags chegam. O
  loading do modal aguarda GIF + frase (`*ngIf="gifUrl && phrase"`) — as
  tags chegam de forma independente e não bloqueiam o modal.
- `app.component.ts`: `onSaved(text)` salva a conquista primeiro (fica
  visível na lista imediatamente, sem esperar IA) e abre o modal
  passando `achievement.id` e `achievement.text`.
- `achievement-list.component.ts`: cada card renderiza `item.tags` (se
  houver) como chips (`pill`), no mesmo estilo visual do resto do app.

### Interfaces e Contratos
- Request (cliente → function): `POST /.netlify/functions/celebrate-phrase`
  ```json
  { "text": "terminei o relatório chato do trabalho" }
  ```
- Response (function → cliente): sempre HTTP 200 no caminho feliz e no
  caminho de fallback controlado.
  ```json
  { "phrase": "Relatório chato zerado — mais um obstáculo pra trás!", "tags": ["trabalho", "produtividade"] }
  ```
  ou, quando não há token/erro/timeout/JSON inválido:
  ```json
  { "phrase": null, "tags": [] }
  ```
- Segredo: `HF_TOKEN` — variável de ambiente do **site no Netlify** (Site
  settings → Environment variables), lida apenas em runtime da function.
  Não passa pelo `generate-environment.js` e não é incluída em nenhum
  `environment.*.ts` — nunca chega ao bundle público.

## 5. Alternativas Consideradas
- **Chamar o roteador da Hugging Face direto do navegador**, com o token
  injetado em build-time (mesmo padrão hoje usado pra `GIPHY_API_KEY`):
  descartada. Isso vazaria o token de IA no bundle público — mais
  sensível (custo/abuso/rate limit da conta) do que uma chave GIPHY.
- **Claude (Anthropic) como provedor**: considerada e implementada
  inicialmente, mas trocada por decisão do usuário em favor de um modelo
  gratuito (`deepseek-ai/DeepSeek-V4-Flash-0731` via Novita/HF). A troca
  ficou restrita ao corpo da function (endpoint, header de auth, formato
  do body/response) — o resto da arquitetura (Netlify Function como
  proxy, fallback local, contrato `{ phrase }`) não mudou.
- **Backend dedicado (Node/Express) separado do front-end**: descartado
  por excesso de infraestrutura para um app single-user já hospedado no
  Netlify — uma Netlify Function resolve com escopo mínimo, reaproveitando
  o hosting existente.

## 6. Plano de Validação e Testes
- `npm run build` para garantir que o Angular compila normalmente (a
  Netlify Function não entra no build do Angular, é publicada à parte
  pelo Netlify).
- Teste unitário manual do handler da function via Node (`require` +
  chamada direta), cobrindo: método não permitido, JSON inválido, texto
  vazio e token ausente (retorna `{ phrase: null, tags: [] }`).
- `extractResult`/`parseModelJson` testados isoladamente com JSON limpo,
  JSON envolto em code fence, JSON com prosa antes/depois, texto não-JSON
  e string vazia — todos os casos extraem corretamente `phrase`/`tags`
  quando possível ou caem no resultado vazio sem lançar exceção.
- Payload e parsing de resposta validados contra o exemplo de código
  oficial (`curl`) mostrado na página do modelo na Hugging Face — não foi
  possível fazer uma chamada real de ponta a ponta durante o
  desenvolvimento porque `huggingface.co`/`router.huggingface.co` está
  bloqueado pela política de rede do ambiente de execução do agente (ao
  contrário de `api.anthropic.com`, que está numa lista de exceção); a
  validação completa de conectividade real deve ser feita após configurar
  o `HF_TOKEN` no Netlify.
- Teste end-to-end via Playwright: submeter uma conquista e verificar que
  ela aparece imediatamente na lista (sem tags), o modal abre, aguarda o
  carregamento e, na ausência da function (ambiente local sem
  `netlify dev`), cai corretamente na frase estática sem travar — e sem
  tags no card (comportamento esperado do fallback). Também validado
  visualmente o estilo dos chips de tag com dados semeados no
  `localStorage` simulando uma resposta de IA com tags.
- Após configurar `HF_TOKEN` no Netlify, validar em produção que a frase
  exibida referencia o texto da conquista digitada e que as tags
  aparecem no card pouco depois de fechar o modal.

## 7. Riscos e Questões Abertas
- [x] Enviar o texto da conquista para uma API externa é uma exceção
      pontual ao posicionamento de privacidade "100% local" do app — o
      usuário confirmou que está de acordo, dado que nada é persistido
      no servidor.
- [ ] O modelo é servido de graça por um provedor terceiro (Novita, via
      Hugging Face) — não há SLA/garantia de disponibilidade contínua, e
      o provedor pode mudar limites de uso ou deixar de oferecer o
      modelo gratuitamente no futuro. O fallback para a lista estática
      cobre esse risco na prática, mas vale revisitar periodicamente se
      o modelo/provedor continuam disponíveis.
- [ ] Sem `netlify dev`, a function não roda localmente durante
      `ng serve` — o fallback cobre isso na prática, mas para depurar a
      geração de frase de verdade em ambiente local é preciso rodar via
      Netlify CLI.
