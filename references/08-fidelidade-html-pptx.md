# Fidelidade HTML -> PPTX/Google Slides

## Problema

O HTML consegue usar efeitos de navegador que o PPTX e o Google Slides nao reproduzem da mesma forma: `radial-gradient`, `linear-gradient`, `color-mix`, blur, glow, blend modes e filtros. Se o PPTX tentar copiar isso literalmente, ele perde fidelidade ou vira imagem achatada.

## Principio

O HTML e a referencia estetica. O PPTX/Google Slides e uma traducao editavel. A traducao precisa preservar:

- Hierarquia visual.
- Cores de marca.
- Atmosfera.
- Densidade.
- Editabilidade de textos, cards, metricas, linhas e blocos.

## Traducao Visual

| Efeito no HTML | Traducao editavel no PPTX/Google Slides |
|---|---|
| `radial-gradient` | Elipses grandes com alta transparencia |
| `linear-gradient` | Retangulos sobrepostos, faixas ou planos rotacionados |
| `color-mix` | Cor intermediaria calculada em HEX |
| Glow/blur | Elipses ou shapes translucidos atras do conteudo |
| Card com tint | Fundo solido calculado a partir de `card + accent` |
| Glass card | Card escuro, borda clara, linha de brilho superior |
| Topbar viva | Duas faixas: acento solido + brilho translucido |
| Sombra | Shape escuro deslocado atras do card |

## Regras

- Nunca use screenshot do slide inteiro para resolver fidelidade.
- Prefira perder um pouco de suavidade a perder editabilidade.
- Cada camada decorativa precisa ser movivel/removivel no Google Slides.
- Cards devem ter tint calculado, nao apenas `#151515` puro.
- O acento deve aparecer em poucos pontos fortes: topbar, numeros, eyebrows, linhas de brilho e halos.
- Se a importacao para Google Slides apagar um efeito, substitua por shape mais simples.
- Se o HTML estiver rico e o PPTX sair com apenas titulo/subtitulo, isso nao e diferenca aceitavel de formato; e falha de renderer ou de escolha de layout.
- Para layouts comerciais recorrentes, use sempre renderer nativo: `drawflow`, `pipeline`, `strategy_map`, `market_scope_dashboard`, `competitor_map`, `roi_dashboard`, `proposal_scope_45d`, `media_budget_compare`, `channel_allocation_bars`, `media_funnel_plan`.
- Antes de renderizar, saneie texto vindo de prompt, Markdown ou HTML. Nao aceite `MÃ­dia`, `â‰¤`, `â€”`, `Â·` ou caracteres quebrados no HTML/PPTX.
- Em português, preserve acentos e cedilha no material final. Deck comercial sem acento (`MIDIA`, `DISTRIBUICAO`, `intencao`) parece rascunho técnico, não entrega para cliente.
- Em cards de metricas, use valores compactos para nao quebrar linha: `<= R$45`, `>=30`, `<=5min` ou equivalentes com simbolo correto e espaco nao quebravel.
- Titulos longos precisam de caixa maior no PPTX/Slides; nunca deixe subtitulo invadir a segunda linha do titulo.

## QA Minimo

1. Gerar HTML e PPTX do mesmo `deck.ir.json`.
2. Importar PPTX como Google Slides nativo.
3. Ler a apresentacao de volta e confirmar textos editaveis.
4. Solicitar thumbnails dos slides principais.
5. Comparar: fundo, acento, cards, contraste, densidade e alinhamento.

## Referencias Uteis em `open-design`

| Referencia | Uso |
|---|---|
| `open-design/design-templates/html-ppt` | Motor de temas/layouts para inspiracao HTML |
| `open-design/skills/pptx-html-fidelity-audit` | Processo de auditoria HTML vs PPTX |
| `open-design/craft/color.md` | Disciplina de cor e contraste |
| `open-design/craft/anti-ai-slop.md` | Checklist contra visual generico de IA |
