# Setup Google Slides MCP/API

Use este arquivo no primeiro uso da skill, apos instalacao em uma nova maquina ou sempre que a geracao para Google Slides falhar por autenticacao, permissao ou conector ausente.

## Principio

Cada pessoa deve conectar a propria conta Google. A skill nao deve guardar, copiar ou reaproveitar credenciais de outro usuario.

A skill pode automatizar o fluxo de criacao, mas a autorizacao do Drive/Slides e sempre por usuario.

## Setup Assistido Automatico

A skill deve iniciar o processo de conexao sempre que possivel. O usuario nao deve ser orientado a procurar MCP, API key, credenciais JSON ou documentacao tecnica como primeira opcao.

Fluxo esperado:

1. Detectar se ja existe conector, plugin ou MCP de Google Drive/Slides disponivel.
2. Se existir, tentar uma chamada leve de verificacao, como perfil, metadados ou listagem minima.
3. Se a conta nao estiver autenticada, abrir ou solicitar o fluxo de login/autorizacao do conector.
4. O usuario escolhe a conta Google ja logada no navegador ou entra com as credenciais dele.
5. Apos autorizacao, a skill roda novamente o preflight e continua a criacao do deck.

So peca configuracao manual se o ambiente nao tiver nenhum caminho disponivel para instalar, conectar ou autenticar Google Drive/Slides.

## Preflight Obrigatorio

Antes de criar qualquer deck no Google Slides:

1. Verifique se existe conector, plugin ou MCP com acesso a Google Drive/Slides.
2. Verifique se o usuario esta autenticado na conta Google correta.
3. Confirme que ha permissao para criar arquivos no Drive.
4. Confirme que a saida final sera `application/vnd.google-apps.presentation`.
5. Se qualquer etapa falhar, pare e oriente o usuario a conectar a propria conta.

## Caminhos Suportados

### Modo Nativo

Cria tudo diretamente no Google Slides via MCP/API.

Use quando a prioridade for maximo controle do arquivo final no Drive.

Fluxo:

1. Criar apresentacao nativa com Drive/Slides.
2. Ler a apresentacao criada para obter `presentationId` e `slideObjectId`.
3. Criar slides e elementos com batch updates.
4. Usar formas, textos, linhas, tabelas e imagens como elementos nativos.
5. Buscar thumbnails dos slides criticos.
6. Corrigir overflow, corte, desalinhamento ou baixa legibilidade.

### Modo Ponte PPTX

Gera PPTX local e importa para o Drive como Google Slides nativo.

Use quando a prioridade for velocidade, teste visual rapido ou layouts que ja existem no renderizador PPTX.

Fluxo:

1. Gerar `deck.ir.json`.
2. Gerar `preview.html`.
3. Gerar `.pptx` local.
4. Importar o `.pptx` com conversao para Google Slides nativo.
5. Confirmar MIME type `application/vnd.google-apps.presentation`.
6. Validar thumbnails e editabilidade.

## Regra de Decisao

Use `modo nativo` quando:

- O deck precisa nascer diretamente no Drive.
- A fidelidade final no Google Slides e mais importante que velocidade.
- O usuario quer editar cada elemento com menor risco de drift de conversao.
- O layout e simples o suficiente para criar por batch updates.

Use `modo ponte PPTX` quando:

- O usuario quer testar rapido.
- O deck tem muitos layouts ainda mais faceis no `pptxgenjs`.
- A conversao anterior ja foi validada visualmente.
- A entrega precisa de HTML, PPTX e Google Slides no mesmo pacote.

## Primeiro Setup de Um Novo Usuario

Quando uma pessoa instalar a skill:

1. Confirmar se Google Drive/Slides ja aparece como conector, plugin ou MCP disponivel.
2. Se nao aparecer, iniciar o fluxo de instalacao/conexao disponivel no ambiente.
3. Se aparecer mas nao estiver autenticado, iniciar o fluxo de login/autorizacao.
4. O usuario deve apenas escolher a conta Google ou inserir as credenciais dele no navegador/fluxo seguro.
5. Rodar uma verificacao leve de leitura do perfil ou metadados do Drive.
6. Ao criar o primeiro deck real, confirmar por readback que o arquivo nasceu como Google Slides nativo.

Nao crie arquivos de teste no Drive sem avisar o usuario. Se for necessario testar escrita, crie um deck temporario com nome claro, por exemplo `X9 Setup Check - pode apagar`.

## Falhas Comuns

| Falha | Acao |
|---|---|
| Conector Google ausente | Iniciar instalacao/conexao do Google Drive/Slides quando o ambiente permitir |
| Usuario nao autenticado | Abrir ou solicitar fluxo de login da conta Google correta |
| Sem permissao de escrita | Confirmar Drive, conta e escopos autorizados |
| Arquivo importado como PPTX | Refazer importacao com conversao para Google Slides nativo |
| Deck final virou imagem achatada | Refazer conteudo central como formas/textos nativos |
| Thumbnails mostram drift visual | Corrigir no deck nativo ou ajustar renderizador |

## Criterio de Pronto

A integracao esta pronta quando:

- O usuario autenticado e o dono ou editor do arquivo criado.
- O deck final abre no Google Slides.
- O MIME type e `application/vnd.google-apps.presentation`.
- Textos, cards e blocos principais sao editaveis.
- Pelo menos um thumbnail recente foi inspecionado antes da entrega.
