# Arquitetura X9

## Objetivo

Criar uma linha de produção que replique o ganho estético do Genspark sem perder a editabilidade que o usuário precisa no Google Slides.

## Camadas

| Camada | Função | Artefato |
|---|---|---|
| Briefing | Capturar intenção, fonte e restrições | Prompt do usuário, PDFs, DOCX, imagens, contexto do cliente |
| Narrativa | Organizar tese, capítulos e sequência | Outline editorial |
| IR | Contrato único entre conteúdo e visual | `deck.ir.json` |
| HTML | Preview visual rápido e fiel | `preview.html` |
| Google Slides | Entrega editável | Slides com formas, textos e imagens nativas |
| QA | Proteger qualidade | `qa.md` |

## Por Que IR

O erro recorrente em skills de apresentação é mandar a IA desenhar direto. Isso gera caixas aleatórias, desalinhamento, textos cortados e slides vazios. O IR separa decisões:

- O agente decide o que comunicar.
- O layout decide como estruturar.
- O renderizador decide coordenadas e componentes.
- O QA decide se pode entregar.

## Contrato Mental

Todo slide deve responder a quatro perguntas:

| Pergunta | Exemplo |
|---|---|
| Qual é a ideia principal? | A FibranetBR já venceu no operacional. |
| Que tipo de prova sustenta? | 7.000 clientes, churn estimado em 1%, nota 4,8. |
| Que layout comunica melhor? | Métricas, comparativo, bento, drawflow. |
| O que precisa ser editável? | Todo texto, cards, linhas, números, setas e labels. |

## Estratégia HTML + Google Slides

O HTML deve ser usado para acelerar composição visual. Ele permite testar impacto, hierarquia, ritmo e densidade. Mas a versão editável precisa ser reconstruída com elementos nativos no Google Slides.

Isso cria duas saídas com o mesmo DNA:

- HTML bonito para ver e aprovar.
- Google Slides editável para trabalhar, ajustar e apresentar.

