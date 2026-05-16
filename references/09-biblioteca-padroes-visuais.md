# Biblioteca de Padrões Visuais Vencedores

Esta referência consolida padrões extraídos de decks reais do usuário. Use antes de criar ou refinar decks no estilo Genspark/V4, especialmente quando o pedido envolver planejamento estratégico, diagnóstico comercial, mídia paga, CRM, ICP, cronograma, proposta comercial ou apresentação de semana 2/3/4.

## Princípio Central

O padrão mais forte não é apenas "dark + vermelho". O que faz os melhores decks parecerem premium é a combinação de:

- Fundo atmosférico com direção de arte clara.
- Conteúdo editável por cima: títulos, cards, tabelas, números, setas e textos.
- Hierarquia agressiva: título grande, pouco texto solto e blocos com função evidente.
- Ritmo entre slides: capas cinematográficas, seções limpas, tabelas densas, cards executivos e fechamentos fortes.

## Famílias Visuais Encontradas

| Família | Quando usar | Como reconhecer | Opinião para X9 |
|---|---|---|---|
| Cinematográfico de impacto | Capas, aberturas de seção, grandes teses | Foto ou cena de fundo, alto contraste, título enorme, pouco conteúdo | Essencial. É o que mais aproxima do Genspark. Deve entrar como camada raster de fundo, mantendo texto editável. |
| V4 dark premium modular | Diagnósticos, processos, cronogramas, proposta comercial | Fundo preto/vinho, diagonais vermelhas, cards translúcidos, ícones e topbars coloridas | Deve ser o padrão base da skill. Entrega editabilidade e organização. |
| Dashboard executivo | TAM/SAM/SOM, KPIs, forecasts, funis | Números grandes, cards, gráficos simples, etiquetas e comparativos | Muito útil. Precisa de templates nativos no PPTX/Slides. |
| Evidência real | Cliente oculto, auditoria, prints, exemplos de criativos | Prints de WhatsApp, screenshots, imagens reais e bullets laterais | Aumenta credibilidade. Deve aceitar imagens externas como evidência, não como decoração. |
| Processo/pipeline | CRM, follow-up, rotina, jornada, etapas | Colunas numeradas, setas, critérios de saída, cards finais de ganho/perda | Um dos layouts mais recorrentes. Deve virar componente oficial do IR. |
| Matriz conceitual | CVBA, BANT, SWOT, ICP, RACI | 3 a 5 colunas, labels fortes, cards com contraste, CTA final | Bom para conteúdo denso. Precisa limitar texto por card para não virar planilha. |

## Decks e Padrões Extraídos

| Deck | Slide analisado | Padrão útil para a skill | Observação |
|---|---|---|---|
| Movement Academia | Grade semanal de publicações | Tabela escura + card lateral de rotina diária | Excelente para calendário editorial. Usa cor por categoria e uma coluna lateral que transforma tabela em decisão operacional. |
| Tropical Magic / Biesky | Gestão de mídia e design | Timeline horizontal + cards de diretrizes | Forte para proposta comercial e processos recorrentes. Bom equilíbrio entre ícones, card largo e três cards finais. |
| Studio Henrique Hoffman | Próximos passos imediatos | Lista executiva em 2 colunas + frase de fechamento | Ótimo para slide de ação. Muito claro, direto e fácil de editar. |
| Gigaclima 4ª Semana | Capa Growth Plan | Capa tipográfica minimalista com fundo premium | Visual elegante, mas menos memorável que capas com imagem. Bom quando não há asset de marca ou metáfora visual. |
| Espaço Zabeu 3ª Semana | Cliente oculto | Evidência real + diagnóstico lateral | Muito forte para auditoria. Prints reais fazem o slide parecer consultivo e incontestável. |
| Biesky 3ª Semana | Pipeline de vendas | Pipeline horizontal com ganho/perda separados | Excelente layout canônico. Deve entrar como `pipeline_split_outcome`. |
| Laundry Pass | Matriz CVBA | Quatro colunas com última coluna em destaque | Muito bom para copy e proposta de valor. A coluna final vermelha cria fechamento comercial. |
| Espaço Zabeu 2ª Semana | TAM | Diagrama TAM/SAM/SOM + cards numéricos | Forte para mercado. Mistura visual conceitual com números executivos. |
| Fibranet 2ª Semana | Capa cinematic F1 | Fundo 100% imagem + texto central gigante | Melhor referência para impacto de capa. Deve ser modelo de `cinematic_cover`. |
| Gigaclima 2ª Semana | Instagram plano editorial | Três cards verticais com ícones e bullets | Bom para plano de social media. Deve controlar densidade para não ficar burocrático. |

## Regras Para O Gerador X9

- Para capas, escolher primeiro a metáfora visual. Exemplo: velocidade, fábrica, arquitetura, celebração, saúde, tecnologia, luxo, logística.
- Quando a capa precisar parecer Genspark, permitir fundo raster premium. Texto, logos e pequenas linhas devem continuar editáveis.
- Para slides densos, não usar apenas tabela. Adicionar sempre uma camada de decisão: card lateral, insight final, recomendação, status ou CTA.
- Reutilizar diagonais vermelhas como assinatura V4, mas variar intensidade por segmento. Luxo pede menos vermelho chapado; indústria aceita contraste mais duro.
- Usar cards com borda/topbar colorida para organizar temas. Evitar todos os cards iguais se houver categorias distintas.
- Prints e screenshots devem ser tratados como evidência, com legenda/diagnóstico ao lado.
- Todo slide deve responder: "o que o cliente deve entender ou decidir em 5 segundos?"

## Novos Layouts Recomendados Para O IR

| Layout | Uso | Componentes |
|---|---|---|
| `cinematic_cover` | Capa premium com alto impacto | Fundo raster, overlay escuro, título gigante, logo, subtítulo curto |
| `evidence_diagnosis` | Auditoria com prints ou exemplos reais | Coluna de bullets, 2-4 imagens, destaque do achado principal |
| `pipeline_split_outcome` | Funil com ganho/perda ou decisão final | Etapas horizontais, setas, blocos finais em verde/vermelho |
| `matrix_4x_highlight` | CVBA, BANT, argumentos e frameworks | 4 colunas, última coluna em destaque, CTA ou insight |
| `executive_action_grid` | Próximos passos e planos imediatos | 2 colunas numeradas, frase final ou box de compromisso |
| `market_scope_dashboard` | TAM/SAM/SOM, mercado, KPIs | Diagrama grande + cards numéricos + insight financeiro |
| `weekly_calendar_plus_routine` | Calendário editorial e rotinas | Tabela semanal + card lateral de rotina/frequência |
| `media_budget_compare` | Cenários de verba e canais | Cards 3k/6k/10k + barras Meta/Google/remarketing + recomendação |
| `channel_allocation_bars` | Distribuição de investimento | Barras nativas por canal, percentual, verba e papel do canal |
| `media_funnel_plan` | Plano de funil de mídia e venda | Etapas descoberta/intenção/prova/conversão/retenção + gargalos |
| `drawflow` para organograma | Time, ownership, squads e fluxo de decisão | Nodes de papel, conexões, handoffs e responsáveis |

| `competitor_map` | Benchmarking e leitura de posicionamento | Dois blocos comparativos + oportunidade comercial final |
| `roi_dashboard` | Justificar investimento e meta | KPIs grandes + barras de cenario + decisao financeira |
| `proposal_scope_45d` | Transformar estrategia em proposta | Tres fases + entregaveis + compromisso de execucao |

## Aprendizado do HTML Icaro Braga

O `index.html` de Icaro Braga mostrou um padrao melhor para decks longos: a narrativa nao fica so em diagnostico, ela constroi uma venda consultiva. Sempre que houver planejamento de aquisicao ou proposta, tente incluir pelo menos alguns destes blocos:

- `market_scope_dashboard`: mostra tamanho de oportunidade antes de falar de campanha.
- `competitor_map`: prova por que o cliente precisa ocupar uma lacuna de posicionamento.
- `media_budget_compare`: traduz 3k vs 6k em escolhas visuais, nao em texto solto.
- `media_funnel_plan`: mostra como midia, WhatsApp, CRM e venda se conectam.
- `drawflow`: desenha a jornada completa com nodes e setas nativas.
- `roi_dashboard`: conecta investimento a CPL, leads, contratos e receita potencial.
- `proposal_scope_45d`: fecha com execucao concreta, nao apenas recomendacao.

## Veredito

A skill deve seguir um caminho híbrido: fundos premium podem ser rasterizados quando isso melhora muito o impacto visual, mas o conteúdo operacional precisa continuar nativo/editável. Tentar recriar tudo apenas com shapes reduz a força visual; achatar tudo em imagem destrói a utilidade no Google Slides. O meio certo é: arte de fundo como cena, conteúdo como sistema editável.
