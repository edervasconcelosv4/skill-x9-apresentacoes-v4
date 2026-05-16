# Biblioteca de Layouts X9

Use apenas estes layouts no `deck.ir.json`.

## `cover`

Abertura do deck. Título monumental, subtítulo, cliente, semana, fundo com imagem ou textura escura.

Campos: `eyebrow`, `title`, `subtitle`, `client`, `footer`.

## `section`

Separador de capítulo. Deve dar respiro e marcar mudança de assunto.

Campos: `section_number`, `title`, `subtitle`.

## `agenda`

Indice visual do deck. Use em apresentacoes longas para mostrar blocos, sequencia da reuniao e expectativa de duracao.

Campos: `title`, `subtitle`, `items[]` com `num`, `title`, `body`.

## `executive_context`

Diagnóstico com forças e gargalos. Ideal para "momento atual".

Campos: `title`, `subtitle`, `left_title`, `left_items`, `right_title`, `right_items`.

## `metric_grid`

Painel de métricas. Use para números como clientes, churn, ticket, prazo, notas e maturidade.

Campos: `title`, `subtitle`, `metrics[]`.

## `four_pillars`

Quatro pilares simétricos. Ideal para 4 Ps, produto/preço/praça/promoção, pilares de conteúdo.

Campos: `title`, `subtitle`, `pillars[]` com 4 itens.

## `three_pillars`

Três frentes estratégicas. Bom para marketing, comercial e crescimento.

Campos: `title`, `subtitle`, `pillars[]` com 3 itens.

## `bento`

Dashboard visual com cards em tamanhos diferentes. Use para sínteses executivas.

Campos: `title`, `subtitle`, `items[]` com `span`, `kind`, `title`, `body`, `metric`.

## `comparison`

Antes/depois, hoje/futuro, problema/ação.

Campos: `title`, `subtitle`, `left_label`, `left_items`, `right_label`, `right_items`.

## `strategy_map`

Mapa de estratégia com blocos encadeados. Ideal para método V4, aquisição, CRM e vendas.

Campos: `title`, `subtitle`, `stages[]`.

## `campaign_structure`

Estrutura de campanha por canal. Bom para Google Ads, Meta Ads, social e budget.

Campos: `title`, `subtitle`, `channels[]`, `budget[]`, `notes`.

## `market_scope_dashboard`

TAM/SAM/SOM, mercado e oportunidade. Use quando precisar provar tamanho de mercado, potencial regional, potencial atendivel ou prioridade de segmento.

Campos: `title`, `subtitle`, `scopes[]` com `title`, `value`, `body`, `insight`.

## `competitor_map`

Mapa competitivo em dois blocos. Use para comparar concorrentes locais vs digitais, players nacionais vs regionais, ou lacuna de posicionamento.

Campos: `title`, `subtitle`, `columns[]` com `title` e `items[]`, ou `local[]`, `digital[]`, `opportunity`.

## `roi_dashboard`

Projecao financeira ou racional de investimento. Use para conectar verba, CPL, volume, contratos, ticket e receita esperada.

Campos: `title`, `subtitle`, `metrics[]`, `scenarios[]` ou `bars[]`, `decision`.

## `proposal_scope_45d`

Escopo de implementacao em 45 dias. Use para proposta comercial, plano de onboarding, entregaveis e fases de execucao.

Campos: `title`, `subtitle`, `phases[]`, `deliverables[]`, `decision`.

## `media_budget_compare`

Comparacao de cenarios de verba. Use para 3k vs 6k, Meta vs Google, canal principal vs apoio e recomendacao de investimento.

Campos: `title`, `subtitle`, `scenarios[]`, `decision`.

## `channel_allocation_bars`

Distribuicao visual de midia por canal. Use barras nativas para explicar percentuais, verba, prioridade e papel de cada canal.

Campos: `title`, `subtitle`, `scenarios[]` com `channels[]`, valor, percentual, papel do canal e nota.

## `media_funnel_plan`

Funil de midia e vendas. Use quando o slide precisa mostrar descoberta, intencao, prova, conversao e retencao.

Campos: `title`, `subtitle`, `stages[]`, `channel_roles[]`, `bottlenecks[]`, `decision`.

## Observacao de QA para metricas

Valores de `metric_grid` devem caber em uma linha no PPTX/Google Slides. Prefira `<= R$45`, `>=30`, `<=5min` ou equivalentes com sinal correto e texto compacto.

## `pipeline`

Fluxo comercial ou CRM em etapas. Use para inbound, hunter, guardião e follow-up.

Campos: `title`, `subtitle`, `steps[]`, `exceptions[]`.

## `drawflow`

Fluxo visual mais complexo. Use para jornada de lead, triagem, instalação, suporte e retenção.

Campos: `title`, `subtitle`, `nodes[]`, `edges[]`, `legend[]`.

Tambem use para organogramas, ownership, squads e fluxos com bifurcacao quando ainda nao houver renderer dedicado de `org_chart`.

## `timeline`

Plano em horizontes. Ideal para imediato, 30 dias, 90 dias.

Campos: `title`, `subtitle`, `steps[]`.

## `big_statement`

Slide manifesto. Uma frase forte e curta.

Campos: `statement`, `support`, `attribution`.

## `closing`

Fechamento executivo com próximos passos.

Campos: `title`, `subtitle`, `actions[]`, `footer`.
