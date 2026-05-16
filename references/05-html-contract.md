# Contrato HTML

## Objetivo

O HTML é a bancada de composição visual. Ele deve parecer próximo ao Genspark: escuro, moderno, organizado, com cards, contraste forte e ritmo visual.

## Estrutura

Cada slide deve ser uma `section.slide` com tamanho fixo de 1280 x 720 px.

```html
<section class="slide layout-cover">
  ...
</section>
```

## CSS Base

- `body`: fundo preto, sem margem, fonte Montserrat ou fallback.
- `.deck`: coluna de slides, gap de 32 px.
- `.slide`: 1280 x 720 px, posição relativa, overflow hidden, background escuro.
- `.safe`: área interna com margem de 64 px.
- `.card`: fundo `#151515`, borda `#343434`, raio 8 px, padding 24 px.
- `.accent`: cor de acento do cliente.

## Regras de Composição

- Todo slide precisa ter grid claro.
- Cards devem alinhar por colunas e linhas.
- Títulos não devem ocupar mais que duas linhas.
- Corpo de card deve ser curto e escaneável.
- Use `text-transform: uppercase` em labels, não em parágrafos longos.
- Nunca coloque texto colado nas bordas.
- Nunca use fundo branco liso para esse padrão.

## HTML Não É a Entrega Editável

O HTML pode ser lindo, mas não resolve sozinho a necessidade operacional. Ele serve para validar:

- Direção visual.
- Hierarquia.
- Ritmo.
- Quantidade de conteúdo.
- Paleta.
- Densidade.

A versão final editável deve seguir `04-google-slides-editavel.md`.

