#!/usr/bin/env node
/**
 * setup-google-auth.js
 * Fluxo OAuth 2.0 para autorizar acesso ao Google Drive/Slides.
 * Roda UMA VEZ por usuário — salva o token em google-token.json.
 *
 * PRÉ-REQUISITO (10 minutos, só na primeira vez):
 *   1. Acesse: https://console.cloud.google.com/
 *   2. Crie um projeto (ex: "X9 Skill")
 *   3. APIs & Services → Library → habilite "Google Drive API"
 *   4. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
 *      → Application type: "Desktop app" → Name: "X9 Skill Local"
 *   5. Download JSON → renomeie para client_secret.json → coloque nesta pasta (scripts/)
 *   6. Execute: node setup-google-auth.js
 *
 * Depois de autorizar, o token fica salvo em google-token.json.
 * O upload-to-gslides.js usa esse token automaticamente.
 */

const fs   = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { execSync } = require("child_process");

const DIR         = __dirname;
const CREDS_FILE  = path.join(DIR, "client_secret.json");
const TOKEN_FILE  = path.join(DIR, "google-token.json");
const REDIRECT    = "http://localhost:3939/callback";
const SCOPES      = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/presentations",
].join(" ");

// ── Verificar credentials ─────────────────────────────────────────────────────
if (!fs.existsSync(CREDS_FILE)) {
  console.error(`\n❌  Arquivo não encontrado: ${CREDS_FILE}`);
  console.error("\nSiga os passos:");
  console.error("  1. https://console.cloud.google.com/");
  console.error("  2. APIs & Services → Credentials → Create OAuth 2.0 Client ID");
  console.error("  3. Application type: Desktop app");
  console.error(`  4. Download JSON → renomeie para client_secret.json → salve em:\n     ${DIR}`);
  console.error("  5. Rode novamente: node setup-google-auth.js\n");
  process.exit(1);
}

const raw   = JSON.parse(fs.readFileSync(CREDS_FILE, "utf8"));
const creds = raw.installed || raw.web;
if (!creds) {
  console.error("❌  Formato inválido em client_secret.json. Baixe novamente do Google Cloud Console.");
  process.exit(1);
}

const { client_id, client_secret } = creds;

// ── Gerar URL de autorização ──────────────────────────────────────────────────
const authUrl = "https://accounts.google.com/o/oauth2/auth?" + new URLSearchParams({
  client_id,
  redirect_uri: REDIRECT,
  response_type: "code",
  scope: SCOPES,
  access_type: "offline",
  prompt: "consent",
}).toString();

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(" X9 Skill — Autorização Google Drive/Slides");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("\nAbrindo o navegador para autorização...");
console.log("Se não abrir automaticamente, acesse:");
console.log(`\n  ${authUrl}\n`);

// Abre o navegador automaticamente
try {
  if (process.platform === "win32") execSync(`start "" "${authUrl}"`);
  else if (process.platform === "darwin") execSync(`open "${authUrl}"`);
  else execSync(`xdg-open "${authUrl}"`);
} catch (_) { /* ignora se não conseguir abrir */ }

// ── Servidor local para capturar o callback ───────────────────────────────────
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost:3939");
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<h2>❌ Autorização negada: ${error}</h2><p>Feche esta aba e tente novamente.</p>`);
    server.close();
    console.error("\n❌ Autorização negada pelo usuário.");
    process.exit(1);
  }

  if (!code) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h2>Aguardando autorização...</h2>");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`
    <html><body style="font-family:sans-serif;max-width:500px;margin:80px auto;text-align:center">
      <h2>✅ Autorização concluída!</h2>
      <p>Você já pode fechar esta aba.</p>
      <p style="color:#888;font-size:12px">A skill x9 está configurada para esta conta Google.</p>
    </body></html>
  `);
  server.close();

  // Troca o code pelo access_token + refresh_token
  console.log("✓ Código recebido. Obtendo token...");
  exchangeCode(code);
});

server.listen(3939, "localhost", () => {
  console.log("Aguardando autorização no navegador...\n");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error("❌ Porta 3939 em uso. Feche outro processo que esteja usando-a e tente novamente.");
  } else {
    console.error("Erro no servidor:", err);
  }
  process.exit(1);
});

// ── Troca o authorization code pelo token ─────────────────────────────────────
function exchangeCode(code) {
  const body = new URLSearchParams({
    code,
    client_id,
    client_secret,
    redirect_uri: REDIRECT,
    grant_type: "authorization_code",
  }).toString();

  const options = {
    hostname: "oauth2.googleapis.com",
    path: "/token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  const req = https.request(options, (res) => {
    let raw = "";
    res.on("data", c => (raw += c));
    res.on("end", () => {
      try {
        const token = JSON.parse(raw);
        if (token.error) {
          console.error("❌ Erro ao obter token:", token.error_description || token.error);
          process.exit(1);
        }
        token.obtained_at = Date.now();
        token.client_id = client_id;
        token.client_secret = client_secret;
        fs.writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2));
        console.log(`\n✓ Token salvo em: ${TOKEN_FILE}`);
        console.log("✓ Tudo pronto! Agora rode:\n");
        console.log("  node upload-to-gslides.js <arquivo.pptx> --title \"Título da Apresentação\"\n");
      } catch (e) {
        console.error("❌ Resposta inesperada:", raw);
        process.exit(1);
      }
    });
  });

  req.on("error", err => {
    console.error("Erro de rede:", err.message);
    process.exit(1);
  });

  req.write(body);
  req.end();
}
