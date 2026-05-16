# Teste de Formatos - X9 2.0 14EV

## Arquivos Locais

| Formato | Arquivo |
|---|---|
| IR JSON | `fibranetbr-x9-teste.ir.json` |
| HTML preview | `fibranetbr-x9-teste.html` |
| PPTX editavel | `fibranetbr-x9-teste.pptx` |
| HTML preview vivid | `fibranetbr-x9-teste-vivid.html` |
| PPTX vivid editavel | `fibranetbr-x9-teste-vivid.pptx` |

## Google Slides

Deck nativo criado por importacao do primeiro PPTX:

https://docs.google.com/presentation/d/1UvGHsUTwjKoz6ldof4A6YpmbMQQVZywHvrUkd_uyMCk/edit?usp=drivesdk

Deck nativo vivid, com traducao visual HTML -> PPTX reforcada:

https://docs.google.com/presentation/d/1OWwid89KRrr9ntcSQ8SL7wiqOyuAz8_vY6C8IRuxXM8/edit?usp=drivesdk

## Verificacao

- HTML gerado com sucesso a partir do IR.
- PPTX gerado com sucesso a partir do mesmo IR.
- PPTX importado para Google Slides nativo.
- O conector confirmou o MIME type `application/vnd.google-apps.presentation`.
- O conector leu de volta os textos como elementos editaveis no Google Slides.
- Thumbnails grandes foram solicitadas para os 4 slides importados.
- A versao vivid adiciona halos, tint calculado em HEX, sombras nativas e linhas de brilho sem achatar os slides.
- A versao vivid tambem foi importada para Google Slides nativo e lida de volta com textos editaveis.

