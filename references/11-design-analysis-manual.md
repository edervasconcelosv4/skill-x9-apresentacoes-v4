# Manual visual design-analysis

Use esta referencia sempre que a apresentacao for executiva, comercial, estrategica ou precisar sair em HTML + PPTX/Google Slides. Ela deixa o `design-analysis.html` de referencia passiva e transforma o arquivo em criterio de geracao e QA.

## Fonte mestre

Arquivo visual completo:

`Skill X9/design-analysis .html`

Ele funciona como manual de direcao de arte, biblioteca de padroes e checklist visual. Nao copie o HTML como slide final; extraia os principios e aplique no IR, HTML, PPTX e Google Slides.

Referencia de qualidade recente:

O melhor deck HTML gerado pelo seu proprio uso da skill — narrativa comercial com contexto de mercado, TAM/SAM/SOM, concorrentes, evidencias do gargalo, distribuicao de midia, funil, ROI, escopo de 45 dias e fechamento de decisao. Use seu ultimo entregavel aprovado como benchmark pessoal. O PPTX nao pode ficar visualmente mais pobre por falta de layout nativo; se ficar, o renderer precisa ser ajustado antes da entrega final.

## Regras atuais

- A assinatura visual do manual segue o padrao dark/premium descrito neste arquivo.
- O deck deve manter estetica dark/premium, mas variar acento por cliente e contexto.
- O efeito Genspark pode existir no fundo, mas texto, cards, barras, funis, linhas, tabelas fake e labels precisam ser editaveis.
- Fundos decorativos devem sustentar a leitura, nao disputar atencao. Halos, elipses e planos diagonais sao aceitaveis apenas quando ficam sutis e fora da area principal de conteudo.
- Todo slide deve ter uma decisao clara: entender, comparar, priorizar, investir, corrigir, aprovar ou executar.

## Familias obrigatorias de layout

Considere estas familias antes de escolher qualquer layout:

| Familia | Usar quando | Layout X9 preferido |
|---|---|---|
| Distribuicao de midia | Comparar 3k, 6k, 10k, canais, Meta, Google e remarketing | `media_budget_compare`, `channel_allocation_bars`, `campaign_structure` |
| Funil e waterfall | Mostrar queda de volume, gargalo, conversao, perda ou venda | `media_funnel_plan`, `pipeline`, `pipeline_split_outcome` |
| Fluxos operacionais | Explicar etapas, bifurcacoes, SLA, ganho/perda, handoff | `drawflow`, `pipeline`, `strategy_map` |
| Organograma e ownership | Mostrar equipe, responsaveis, squads, rotinas e tomada de decisao | `bento`, `executive_action_grid`, `drawflow` |
| Dashboard executivo | Metas, KPIs, forecast, mercado, performance e ROI | `metric_grid`, `bento`, `market_scope_dashboard`, `roi_dashboard` |
| Benchmarking e matriz | Concorrentes, CVBA, BANT, argumentos e posicionamento | `comparison`, `matrix_4x_highlight`, `competitor_map` |
| Proposta e escopo | Implementacao, entregaveis, 30/45/90 dias e compromisso | `proposal_scope_45d`, `timeline`, `executive_action_grid`, `closing` |

## Paridade obrigatoria HTML -> PPTX

Ao gerar dois formatos a partir do mesmo IR:

1. O HTML pode ter efeitos mais vivos, mas a composicao do PPTX precisa preservar densidade, ritmo, hierarquia e padroes do HTML.
2. Se um slide HTML usar dashboard, funil, drawflow, matriz, comparativo ou escopo, o PPTX deve usar renderer nativo equivalente; nao aceite fallback apenas com titulo/subtitulo.
3. Conteudo operacional deve permanecer editavel: textos, cards, barras, conectores, nodes, metricas e decisoes.
4. A diferenca aceitavel e acabamento de browser; a diferenca nao aceitavel e perda de estrutura visual ou slide vazio.

## Escala tipográfica obrigatória

Use estes tamanhos como régua. Não improvise tamanhos fora da escala.

| Nível | Tamanho | Fonte | Cor | Quando usar |
|---|---|---|---|---|
| Display / KPI | 72–104pt | Montserrat 900 | Acento | Números gigantes, métricas hero |
| Título principal | 36–48pt | Montserrat 800 | Branco | Título de slide, letras maiúsculas |
| Subtítulo / Card title | 22–36pt | Montserrat 700 | Branco ou Acento | Cabeçalho de seção e cards |
| Eyebrow / Label | 13–16pt | Montserrat 800 | Acento | UPPERCASE + letter-spacing, sobre-títulos |
| Corpo em projeção | 16–18pt | Roboto / Inter 400–500 | Cinza claro | Mínimo para texto lido pelo público |
| Corpo em card | 10–15pt | Roboto / Calibri | #9CA3AF | Bullets, listas, descrições internas |
| Micro / dados densos | 6–9pt | Calibri | Muted | Só em dashboards de altíssima densidade |

**Regra inquebrável:** corpo que será lido em projeção nunca abaixo de 16pt. Labels de tabela ≥ 14pt. Métricas de destaque ≥ 36pt. Fontes 9pt, 10pt e 12pt só existem em micro-dados — nunca em conteúdo principal.

## Regra 60/30/10 de cores

Todo slide respeita essa proporção:
- **60%** — fundo escuro profundo (#0D0D0D, #131313, #1A1A1A)
- **30%** — texto em escala de cinza (#FFFFFF, #E0E0E0, #CCCCCC, #9CA3AF)
- **10%** — cor de acento do cliente (bordas, eyebrows, ícones, tags)

O acento não é exclusivamente vermelho. É um token dinâmico: respeita o brandbook do cliente. Exemplos validados: `#E50914` V4 Company, `#FF6B00` Movement, `#C9A227` Óticas, `#2196F3` Biesky.

## Tint obrigatório nos cards

Nunca usar `#1E1E1E` puro ou qualquer cinza sólido como fundo de card em decks premium. Todo card deve ter vibrância visual com pelo menos um dos recursos:
- Fundo tintado misturando o acento com o escuro (ex: `cardTint = mixHex(CARD, accent, 0.12)`)
- Borda lateral ou superior com cor de acento (6–10px)
- Ícone emoji antes do título
- Tag / pill de status com cor semântica

Card cinza sem acento = slide morto.

## Regras de densidade e dead zones

- Nunca mais de 30% de espaço morto dentro de um card.
- Se sobrou espaço: aumentar corpo (17–18pt), adicionar dado da fonte ou reduzir a altura do card.
- Altura dinâmica de card: `n_itens × 0.65in + 0.4in padding`. Máximo 8 linhas por container.
- Slide opaco sem nenhum elemento de vibrância reprovado automaticamente no QA.

## Anti-padrões curados (relevantes para X9)

| ❌ Antipadrão | ✅ Correto | Por quê |
|---|---|---|
| Card com 50%+ de espaço vazio | Aumentar fonte ou reduzir altura | Parece amador, desperdiça comunicação |
| Body 13–14pt em slide de apresentação | Mínimo 16pt para conteúdo projetado | Ilegível em projetor |
| Cards `#1E1E1E` puro sem acento | Fundo tintado + borda colorida + ícone | Slide morto — sem hierarquia visual |
| Nomes longos em colunas estreitas | Abreviar: "Meta Ads" não "Meta Awareness" | Wrap de texto quebra alinhamento |
| Cores sem significado em fluxos | Verde=sucesso · Vermelho=perda · Azul=informação | Perde semântica visual do drawflow |
| Espaço morto em mais de 1 slide seguido | Aumentar hierarquia, reorganizar grid ou dividir raciocínio | Ritmo quebra — apresentação parece incompleta |

## Higiene obrigatória de texto

- Preserve português profissional com acentos quando o texto final for PT-BR. `MIDIA`, `DISTRIBUICAO`, `cenarios`, `intencao` e similares só são aceitáveis se forem escolha consciente do cliente; por padrão, entregue `MÍDIA`, `DISTRIBUIÇÃO`, `cenários`, `intenção`.
- Corrija encoding antes de gerar os formatos. Sinais como `â‰¤`, `â‰¥`, `â€”`, `Â·`, `MÃ­dia` ou `CenÃ¡rio` indicam falha, nao estilo.
- Metricas com sinal e unidade devem ser compactas para caber no card: `<= R$45`, `>=30`, `<=5min` ou simbolo correto com espaco nao quebravel.
- Em Google Slides, revise especialmente slides de `metric_grid`, `pipeline` e `drawflow`; eles concentram textos pequenos e sao os primeiros a denunciar quebra de fonte ou encoding.
- Se o titulo quebrar em duas linhas, o subtitulo precisa descer. Sobreposicao de titulo/subtitulo reprova o slide.

## Padrao para referencias visuais

Quando usar modelos importados de PPTX reais:

1. Extraia a estrutura, nao o print inteiro.
2. Prefira mockups vetoriais e componentes nativos quando a miniatura ficar cortada ou confusa.
3. Se uma referencia tiver dois slides bons, nao force os dois dentro do mesmo thumbnail. Transforme em um desenho sintetico.
4. A miniatura serve para explicar o padrao; o slide final deve nascer editavel.
