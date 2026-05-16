# Analise comparativa: referencias Google Slides vs X9 vivid

Data: 2026-05-14

## Arquivos comparados

| Item | Origem | Evidencia visual local | Observacao |
| --- | --- | --- | --- |
| FibranetBR referencia | Google Slides `16Y3nsGxHJ-nQjiPyDRkPPByZjGrjXxJYYPY_7l8EFVU` | `comparacao-thumbnails/fibranet_cover.png`, `comparacao-thumbnails/fibranet_p2.png` | Estilo mais proximo de peca final/campanha: imagem, luz, atmosfera e narrativa visual. |
| OFOS referencia | Google Slides `1GtKdjUNNPRjCRneWxeoF5t9i421tLD0N4QWpgCmRtdU` | `comparacao-thumbnails/ofos_cover.png`, `comparacao-thumbnails/ofos_p4.png` | Estilo V4 corporativo forte: grafismos diagonais, cards horizontais, contraste e estrutura. |
| X9 vivid HTML | `fibranetbr-x9-teste-vivid.html` | Analise de CSS e estrutura | HTML usa gradientes e `color-mix`, entao tende a parecer mais vivo que o PPTX. |
| X9 vivid PPTX/Slides | Google Slides `1OWwid89KRrr9ntcSQ8SL7wiqOyuAz8_vY6C8IRuxXM8` | `comparacao-thumbnails/vivid_cover.png`, `comparacao-thumbnails/vivid_p2.png` | Mais editavel e leve, porem ainda mais limpo/sistemico que as referencias. |

## Comparacao lado a lado

| Criterio | FibranetBR referencia | OFOS referencia | X9 vivid HTML | X9 vivid PPTX/Slides |
| --- | --- | --- | --- | --- |
| Direcao visual | Cinematografica, com foto/arte de fundo e metafora visual clara. | Corporativa premium, com grafismos V4 e composicao editorial. | Sistema dark com gradiente e cards; bom ponto de partida. | Sistema dark editavel com halos e shapes; ainda mais plano que as referencias. |
| Fundo | Fundo e luz contam historia; vermelho cria tensao e profundidade. | Fundo grafico com diagonais e textura sutil. | `radial-gradient` + `linear-gradient`; mais vivo no navegador. | Shapes nativos simulam gradiente, mas sem textura fina/blur real. |
| Composicao | Grandes massas visuais, assimetria e foco dramatico. | Layout muito bem ancorado: titulo forte + cards largos + diagonais. | Boa hierarquia, mas composicao ainda basica. | Boa hierarquia, mas muito ar vazio e cards grandes demais para pouco texto. |
| Tipografia | Grande, pesada, limpa, com contraste alto. | Forte e consistente; bons pesos e tamanhos. | Boa, mas precisa de escala mais editorial por layout. | Boa leitura, mas falta refinamento de caixa, tracking e contraste secundario. |
| Cores | Vermelho profundo, com variacao de luz e sombra. | Laranja/vermelho vivo com baixa saturacao no fundo. | Vermelho vivo e mais saturado. | Vermelho vivo, mas aplicado como faixa/shape mais literal. |
| Cards | Cards aparecem como apoio, nao como todo o slide. | Cards horizontais com icones e texto bem calibrado. | Cards simples com bullet points. | Cards grandes, limpos, editaveis, mas com pouca riqueza interna. |
| Iconografia/imagem | Imagem principal guia a narrativa. | Icones ajudam leitura e densidade. | Sem imagem/icone. | Sem imagem/icone; perde parte da percepcao premium. |
| Editabilidade | Texto editavel, mas varios fundos/elementos sao imagens. | Texto editavel, mas varios detalhes visuais sao imagens. | Editavel como HTML, nao como Google Slides. | Melhor editabilidade: shapes e textos nativos. |
| Percepcao final | Mais impactante e memoravel. | Mais pronto para cliente e consultoria. | Bonito como prototipo rapido. | Funcional e editavel, mas ainda parece template interno. |

## Percepcao principal

O X9 vivid acertou a base tecnica: gera um deck nativo, editavel, coerente e com uma camada visual melhor que a primeira versao. Mas ele ainda nao chegou no "efeito Genspark" porque as referencias nao dependem apenas de cor viva; elas dependem de direcao de arte.

As referencias usam tres camadas que ainda faltam no X9:

1. Uma cena visual dominante, como foto, textura ou grafismo de marca.
2. Micro-hierarquia dentro dos blocos, com icones, subtitulos, pesos e textos de apoio.
3. Assimetria intencional, com massas visuais que fazem o slide parecer desenhado e nao apenas montado.

## Diagnostico por formato

### HTML vivid

O HTML e o mais facil de deixar bonito rapidamente, porque o navegador entrega gradientes, mistura de cor, suavidade e glow com mais naturalidade. O risco e ele virar uma peca bonita que nao converte bem para Google Slides editavel se a traducao for feita direto.

### PPTX/Slides vivid

O PPTX vivid e o caminho certo para editabilidade. O problema atual nao e tecnico; e de direcao visual. Ele precisa receber mais vocabulario visual: fundos por tema, diagonais, texturas discretas, icones, composicoes assimetricas e variacoes de layout.

## Recomendacao

Nao devemos tentar copiar pixel a pixel o HTML no PPTX. O melhor caminho e criar dois motores coordenados:

1. `visual_theme`: define estilo de fundo, textura, metafora visual, acento, nivel de contraste e tipo de grafismo.
2. `slide_layout`: define a arquitetura editavel do slide, com regras diferentes para capa, contexto, cards, metricas, tese e timeline.

Para ficar perto do Genspark, a proxima versao do X9 precisa gerar cada slide com uma "cena" antes de gerar os cards. Cards devem entrar como camada secundaria.

