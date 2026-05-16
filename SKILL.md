---
name: x9-2-0-14ev
description: Cria apresentações estratégicas no padrão visual Genspark/V4, com saída em HTML de alta fidelidade e plano de conversão para Google Slides editável. Use quando o usuário pedir decks, apresentações, slides, Google Slides, PPTX, HTML deck, planejamento estratégico, semana 2/3/4, ou quiser transformar um arquivo consolidado de cliente em apresentação visual editável.
---

# X9 2.0 14EV - Apresentações Genspark/V4

## Detecção de Ambiente — Execute Primeiro

Antes de qualquer ação, identifique em qual ambiente você está e siga o caminho correspondente:

| Você é | Como identificar | O que fazer |
|---|---|---|
| **Claude Code** | Tem ferramentas de arquivo e terminal, pode executar Node.js | Continue lendo este SKILL.md |
| **Claude.ai web / API** | É Claude, mas sem acesso a terminal ou arquivos locais | Leia `PROMPT_CLAUDE.md` |
| **ChatGPT / GPT-4o** | É modelo da OpenAI | Leia `PROMPT_GPT.md` |
| **Gemini** | É modelo do Google | Leia `PROMPT_GEMINI.md` |
| **Outro modelo** | Qualquer outro caso | Leia `PROMPT_UNIVERSAL.md` |

---

## Princípio

Use uma representação intermediária chamada `X9 Deck IR`. O agente primeiro transforma o briefing em JSON. Depois usa o JSON para produzir:

- `HTML`: preview visual, storytelling, aprovação rápida e fidelidade estética.
- `Google Slides`: versão editável com caixas, textos, formas, cards, linhas e elementos nativos.

Nunca trate o HTML como destino final único quando o usuário precisa editar no Google Slides. O HTML é a referência visual; o Google Slides é o artefato operacional.

## Setup Google Slides

No primeiro uso em uma nova conta ou maquina, leia `references/10-setup-google-slides-mcp.md` antes de tentar criar um deck no Drive.

A skill deve confirmar que existe conector, plugin ou MCP com acesso a Google Drive/Slides, que o usuario esta autenticado na propria conta Google e que o arquivo final pode nascer como Google Slides nativo. Se a autenticacao ou permissao nao estiver pronta, inicie o fluxo de conexao/login disponivel; o usuario deve apenas escolher a conta Google ou inserir as credenciais no navegador/fluxo seguro.

## Fluxo

Antes do passo 1, se o deck precisar ir para Google Slides, rode o preflight de `references/10-setup-google-slides-mcp.md`.

1. Entenda o pedido: cliente, semana, objetivo, quantidade de slides, arquivo fonte, tom e fundo desejado.
2. Extraia a narrativa: tese central, capítulos, métricas, gargalos, recomendações e próximos passos.
3. Gere o `X9 Deck IR` usando `schemas/x9-deck-ir.schema.json`.
4. Escolha layouts em `references/03-layouts.md`. Para decks comerciais/estrategicos, consulte obrigatoriamente `references/11-design-analysis-manual.md` antes de fechar o IR.
5. Gere o HTML com `scripts/render-html-from-ir.js`.
6. Gere o PPTX editavel com `scripts/render-pptx-from-ir.js`, usando `references/08-fidelidade-html-pptx.md` para traduzir efeitos visuais sem achatar o slide. Se um layout cair em fallback simples, ajuste o IR ou o renderer antes de entregar.
7. Para Google Slides, siga `references/04-google-slides-editavel.md` e construa tudo como elementos nativos.
8. Rode QA visual e estrutural com `references/06-qa-antipadroes.md`.

## Quando Ler Cada Referência

| Situação | Arquivo |
|---|---|
| Entender a arquitetura da skill | `references/01-arquitetura.md` |
| Definir cores, fontes, espaçamentos e estética | `references/02-design-system.md` |
| Escolher layouts por tipo de slide | `references/03-layouts.md` |
| Criar saída editável no Google Slides | `references/04-google-slides-editavel.md` |
| Gerar HTML fiel ao estilo | `references/05-html-contract.md` |
| Revisar qualidade e evitar erros recorrentes | `references/06-qa-antipadroes.md` |
| Usar a apresentação FibranetBR como referência | `references/07-analise-fibranetbr-v2.md` |
| Reduzir diferença visual entre HTML, PPTX e Google Slides | `references/08-fidelidade-html-pptx.md` |
| Aplicar biblioteca de padrões vencedores de decks reais | `references/09-biblioteca-padroes-visuais.md` |

| Configurar ou validar Google Slides MCP/API por usuario | `references/10-setup-google-slides-mcp.md` |
| Aplicar o manual visual completo do `design-analysis.html` e do HTML benchmark | `references/11-design-analysis-manual.md` |

## Comandos Base

Gerar HTML a partir de um IR:

```powershell
node "Skill X9\scripts\render-html-from-ir.js" `
  "Skill X9\templates\fibranetbr-semana4.sample.json" `
  "Skill X9\assets\fibranetbr-semana4.sample.html"
```

Gerar PPTX editável a partir de um IR:

```powershell
node "Skill X9\scripts\render-pptx-from-ir.js" `
  "Skill X9\templates\fibranetbr-semana4.sample.json" `
  "Skill X9\assets\fibranetbr-semana4.sample.pptx"
```

## Regras Inquebráveis

- Um slide deve ter uma função narrativa clara: abrir, contextualizar, provar, comparar, explicar, decidir ou fechar.
- Cada slide precisa usar um layout catalogado. Não invente estruturas improvisadas no meio da geração.
- No Google Slides, textos e componentes de conteúdo devem ser editáveis. Imagem achatada só pode ser fundo, textura ou elemento decorativo.
- Cards, grids, timelines, drawflows e tabelas devem virar formas nativas, não screenshots.
- Distribuicao de midia, funis, fluxos operacionais e organogramas sao familias obrigatorias de layout. Antes de inventar uma estrutura, verifique se uma delas resolve melhor a decisao.
- Evite espaço morto. Se sobrou muito vazio, aumente hierarquia, reorganize grid ou divida o raciocínio.
- Não use bullets longos como corpo principal. Transforme listas em cards, colunas, etapas, métricas ou comparativos.
- Faça QA antes de entregar: legibilidade, alinhamento, densidade, contraste, overflow, consistência e editabilidade.

## Saída Recomendada

Para cada entrega, gere uma pasta de trabalho com:

- `deck.ir.json`: contrato completo da apresentação.
- `preview.html`: versão HTML navegável.
- `google-slides-plan.md`: plano de criação nativa no Google Slides.
- `qa.md`: checklist preenchido.
- Artefatos finais exportados, quando gerados.
