/**
 * upload-to-gdrive.js
 * Uploads a PPTX file to Google Drive, converting it to Google Slides.
 *
 * Usage:
 *   node upload-to-gdrive.js <deck.pptx> [folder-id]
 *
 * On first run: opens browser for OAuth consent.
 * Credentials stored at ~/.x9-gdrive-token.json for future runs.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const { google } = require(path.resolve(__dirname, "../node_modules/googleapis"));

const TOKEN_PATH = path.join(require("os").homedir(), ".x9-gdrive-token.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// ── OAuth client (installed app / OOB flow) ──────────────────────────────────
// These are public "installed app" credentials — safe to commit.
// Users must authorize their own Google account the first time.
const CLIENT_ID     = "YOUR_CLIENT_ID";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";
const REDIRECT_URI  = "http://localhost:3000/oauth2callback";

function getOAuth2Client() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

async function authorize() {
  const oAuth2Client = getOAuth2Client();

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
    // Refresh if expired
    if (token.expiry_date && token.expiry_date < Date.now()) {
      const { credentials } = await oAuth2Client.refreshAccessToken();
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
      oAuth2Client.setCredentials(credentials);
    }
    return oAuth2Client;
  }

  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    console.log("\n📂 Autorização necessária (primeira vez apenas).");
    console.log("   Abrindo navegador... Se não abrir, acesse:");
    console.log("  ", authUrl, "\n");

    // Try to open browser
    try {
      const { execSync } = require("child_process");
      execSync(`start "" "${authUrl}"`, { stdio: "ignore" });
    } catch (_) {}

    // Local callback server
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, "http://localhost:3000");
      const code = url.searchParams.get("code");
      if (!code) { res.end("Erro: código não recebido."); return; }

      res.end("<h2>✅ Autorizado! Pode fechar esta aba.</h2>");
      server.close();

      const { tokens } = await oAuth2Client.getToken(code);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      oAuth2Client.setCredentials(tokens);
      resolve(oAuth2Client);
    });

    server.listen(3000, () => {
      console.log("   Aguardando autorização em http://localhost:3000 ...\n");
    });

    server.on("error", reject);
  });
}

async function uploadPptx(auth, pptxPath, folderId) {
  const drive = google.drive({ version: "v3", auth });
  const fileName = path.basename(pptxPath, ".pptx");

  const meta = {
    name: fileName,
    mimeType: "application/vnd.google-apps.presentation",
    ...(folderId ? { parents: [folderId] } : {}),
  };

  const media = {
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    body: fs.createReadStream(pptxPath),
  };

  console.log(`⬆️  Enviando "${fileName}" para o Google Drive...`);
  const res = await drive.files.create({
    requestBody: meta,
    media,
    fields: "id,name,webViewLink",
  });

  return res.data;
}

async function main() {
  const [pptxArg, folderArg] = process.argv.slice(2);

  if (!pptxArg) {
    console.error("Uso: node upload-to-gdrive.js <deck.pptx> [folder-id]");
    process.exit(1);
  }

  const pptxPath = path.resolve(pptxArg);
  if (!fs.existsSync(pptxPath)) {
    console.error(`Arquivo não encontrado: ${pptxPath}`);
    process.exit(1);
  }

  if (CLIENT_ID === "YOUR_CLIENT_ID") {
    console.error(
      "\n❌ Credenciais OAuth não configuradas.\n" +
      "   Configure CLIENT_ID e CLIENT_SECRET neste script.\n" +
      "   Veja: https://console.cloud.google.com/apis/credentials\n"
    );
    process.exit(1);
  }

  const auth = await authorize();
  const file = await uploadPptx(auth, pptxPath, folderArg);

  console.log(`\n✅ Slide criado no Google Slides!`);
  console.log(`   Nome:  ${file.name}`);
  console.log(`   ID:    ${file.id}`);
  console.log(`   Link:  ${file.webViewLink}\n`);
}

main().catch((err) => {
  console.error("Erro:", err.message || err);
  process.exit(1);
});