# Design System X9 Genspark/V4

## Canvas

| Token | Valor |
|---|---|
| Proporção | 16:9 |
| Base HTML | 1280 x 720 px |
| Google Slides | widescreen 16:9 |
| Grid | 12 colunas |
| Margem segura | 56 a 72 px |

## Direção Visual

O padrão deve parecer executivo, denso e moderno. O slide não é uma folha de texto. Ele deve parecer uma interface estratégica: cards, blocos, métricas, labels, barras, fluxos e capítulos.

## Paleta Base

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#050505` | Fundo principal |
| `bg_alt` | `#0d0d0d` | Fundo secundário |
| `card` | `#151515` | Cards |
| `card_tint` | `#1b1111` | Cards com leve tint do acento |
| `line` | `#343434` | Divisores e bordas |
| `text` | `#ffffff` | Títulos |
| `muted` | `#c9c9c9` | Corpo |
| `subtle` | `#8d8d8d` | Labels auxiliares |
| `accent` | `#ff3333` | Acento padrão |
| `success` | `#21c26b` | Avanço, ganho, retenção |
| `warning` | `#ffb020` | Alerta e atenção |
| `info` | `#3b82f6` | Educação, nutrição, dados |

## Cores por Cliente

O acento deve respeitar a marca do cliente quando houver sinal claro. Para V4, vermelho é padrão. Para clientes com identidade própria, usar o acento da marca em bordas, tags, números e highlights.

## Tipografia

| Papel | Tamanho HTML | Peso | Uso |
|---|---:|---:|---|
| Hero title | 64 a 78 px | 800 | Capa e statements |
| Título de slide | 34 a 46 px | 750 | Topo do slide |
| Subtítulo | 18 a 23 px | 400 | Contexto curto |
| Card title | 17 a 22 px | 700 | Títulos de cards |
| Body | 15 a 18 px | 400 | Texto principal |
| Label | 12 a 14 px | 700 | Eyebrows, tags, seções |
| Métrica | 42 a 76 px | 800 | Números de impacto |

Fonte preferencial: Montserrat. Fallback: Arial, Helvetica, sans-serif.

## Componentes

| Componente | Como usar |
|---|---|
| Topbar | Linha fina ou faixa de acento no topo para dar assinatura visual |
| Eyebrow | Label curto acima do título, sempre em caixa alta |
| Card | Container com fundo escuro, borda sutil e acento superior ou lateral |
| Metric tile | Número grande, label curto, legenda pequena |
| Pill | Tag arredondada para fase, prazo, status ou canal |
| Divider | Linha fina `#343434` para separar blocos internos |
| Alert bar | Bloco horizontal com borda esquerda colorida |
| Drawflow node | Caixa pequena conectada por linhas/setas |
| Quote block | Frase de impacto com hierarquia grande |
| Bento card | Card com tamanho variável dentro do grid |

## Densidade Ideal

| Tipo | Regra |
|---|---|
| Slide leve | 1 ideia central + 2 a 3 apoios |
| Slide médio | 3 a 5 cards |
| Slide denso | 6 a 9 blocos, mas com grid claro |
| Slide técnico | Fluxo, matriz ou tabela visual, com labels curtos |

Evite mais de 90 palavras visíveis por slide, exceto quando for tabela visual ou drawflow.

