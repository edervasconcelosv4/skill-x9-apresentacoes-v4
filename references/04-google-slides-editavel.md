# Google Slides Editável

## Objetivo

Criar slides que o usuário consiga editar: texto, cards, setas, labels, formas, números e caixas. A estética pode vir do HTML, mas a entrega no Google Slides precisa ser reconstruída com elementos nativos.

## Regra Central

Não exporte o slide inteiro como imagem. Isso mata a editabilidade. Imagens podem ser usadas apenas para:

- Fundo.
- Textura.
- Foto.
- Logo.
- Elemento decorativo que não precisa ser editado.

## Como Construir

| Elemento no HTML | Elemento no Google Slides |
|---|---|
| `section` ou fundo | Retângulo nativo |
| Card | Shape `ROUND_RECTANGLE` |
| Texto | Text box |
| Pill | Shape arredondado + texto |
| Linha/divider | Shape linha ou retângulo fino |
| Barra de progresso | Retângulos sobrepostos |
| Métrica | Text box com fonte grande |
| Drawflow | Shapes + linhas/conectores |
| Ícone simples | Texto com símbolo, shape ou imagem isolada |
| Foto/fundo | Imagem posicionada e cortada |

## Fluxo Recomendado

1. Gere ou valide o `deck.ir.json`.
2. Renderize o HTML para aprovar direção visual.
3. Para cada slide, converta layout em uma lista de operações nativas.
4. Insira elementos do fundo para o topo.
5. Nomeie objetos de forma previsível quando a ferramenta permitir.
6. Faça leitura visual e ajuste overflow.

## Ordem de Camadas

1. Fundo sólido.
2. Imagem de fundo, se houver.
3. Overlay escuro.
4. Decorações grandes.
5. Cards e containers.
6. Divisores, barras e linhas.
7. Textos internos.
8. Ícones, badges e pills.
9. Título, eyebrow e rodapé.

## Critérios de Editabilidade

| Critério | Aprovação |
|---|---|
| Título editável | Obrigatório |
| Corpo editável | Obrigatório |
| Cards movíveis | Obrigatório |
| Métricas editáveis | Obrigatório |
| Drawflow editável | Obrigatório para processos |
| Fundo como imagem | Permitido |
| Slide inteiro achatado | Reprovado |

## Fidelidade Visual

Quando o HTML tiver gradientes, brilho ou `color-mix`, não tente exportar o slide como imagem. Use a tradução descrita em `references/08-fidelidade-html-pptx.md`: elipses translúcidas para halos, cores HEX calculadas para tint, retângulos sobrepostos para planos de luz e cards nativos com borda/linha de brilho.

## Estratégia Técnica

Quando houver acesso ao Google Drive/Slides por conector, usar batch updates nativos. Quando não houver, gerar `.pptx` com PptxGenJS ou python-pptx e depois importar no Google Slides.

O critério de sucesso não é apenas "abrir no Google Slides". O critério é "abrir no Google Slides e editar cada bloco relevante".
