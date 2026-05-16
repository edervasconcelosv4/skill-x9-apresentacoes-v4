/**
 * render-gslides-from-ir.js — Skill X9 2.0
 * Cria/popula uma apresentação Google Slides a partir de deck.ir.json
 * usando a Slides API v1 (googleapis).
 *
 * Usage:
 *   node render-gslides-from-ir.js <deck.ir.json> [presentation-id]
 *
 * ─── AUTH OPÇÃO 1 — Access Token direto (mais simples, sem Cloud Console) ────
 *   1. Acesse https://developers.google.com/oauthplayground/
 *   2. Em "Step 1", selecione "Google Slides API v1" → marque todos os escopos
 *      OU cole manualmente: https://www.googleapis.com/auth/presentations
 *   3. Clique "Authorize APIs" → faça login com sua conta Google
 *   4. Em "Step 2", clique "Exchange authorization code for tokens"
 *   5. Copie o "Access token" mostrado
 *   6. Rode o script com:
 *      $env:GSLIDES_TOKEN = "ya29...." ; node render-gslides-from-ir.js deck.ir.json
 *   NOTA: O access token expira em 1h. Repita o passo 4-6 quando precisar.
 *
 * ─── AUTH OPÇÃO 2 — OAuth persistente (uma vez, automático depois) ──────────
 *   1. Acesse https://console.cloud.google.com/apis/credentials
 *   2. Crie um projeto → Ative a "Google Slides API"
 *   3. Crie credenciais OAuth 2.0 → Tipo: "Aplicativo desktop"
 *   4. Baixe o JSON e salve em: %USERPROFILE%\.x9-credentials.json
 *   5. Execute o script — o navegador abre para autorizar uma vez.
 *   6. Token salvo em ~/.x9-token.json — execuções futuras são automáticas.
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const http = require("http");
const os   = require("os");

// Resolve googleapis from the Skill X9 node_modules
const GAPI_PATH = path.resolve(__dirname, "../node_modules/googleapis");
const { google } = require(GAPI_PATH);

const CREDS_PATH = path.join(os.homedir(), ".x9-credentials.json");
const TOKEN_PATH = path.join(os.homedir(), ".x9-token.json");
const SCOPES = [
  "https://www.googleapis.com/auth/presentations",
  "https://www.googleapis.com/auth/drive.file",
];

// ─── Dimensões (pts → EMU: 1pt = 12700 EMU) ──────────────────────────────────
const W = 720, H = 405;
const pt = (n) => Math.round(n * 12700);
const emu = (x, y, w, h) => ({
  transform: { scaleX: 1, scaleY: 1, translateX: pt(x), translateY: pt(y), unit: "EMU" },
  size: { width: { magnitude: pt(w), unit: "EMU" }, height: { magnitude: pt(h), unit: "EMU" } },
});

// ─── Cores ───────────────────────────────────────────────────────────────────
const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });
const BG     = rgb(13, 13, 13);
const WHITE  = rgb(255, 255, 255);
const GRAY   = rgb(156, 163, 175);
const CARD   = rgb(21, 21, 21);
const GREEN  = rgb(34, 197, 94);
const RED    = rgb(239, 68, 68);
const ORANGE = rgb(251, 146, 60);

function accentRgb(hex) {
  const h = hex.replace("#", "");
  return rgb(parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16));
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function getAuth() {
  // Opção 1: Access token direto via variável de ambiente (OAuth Playground)
  if (process.env.GSLIDES_TOKEN) {
    const oAuth2 = new google.auth.OAuth2();
    oAuth2.setCredentials({ access_token: process.env.GSLIDES_TOKEN });
    console.log("🔑 Usando access token de GSLIDES_TOKEN.");
    return oAuth2;
  }

  // Opção 2: Token armazenado (runs anteriores)
  if (fs.existsSync(TOKEN_PATH) && !fs.existsSync(CREDS_PATH)) {
    // Tem token mas não tem credentials — não consegue renovar. Avisa.
  }

  if (!fs.existsSync(CREDS_PATH)) {
    console.error(`\n❌ Nenhuma auth encontrada. Opções:`);
    console.error(`   1. Defina $env:GSLIDES_TOKEN com um token do OAuth Playground`);
    console.error(`      https://developers.google.com/oauthplayground/`);
    console.error(`   2. Ou coloque credentials.json em: ${CREDS_PATH}`);
    console.error(`      (veja instruções completas no topo do arquivo)\n`);
    process.exit(1);
  }

  const creds = JSON.parse(fs.readFileSync(CREDS_PATH, "utf8"));
  const { client_id, client_secret, redirect_uris } = creds.installed || creds.web;
  const oAuth2 = new google.auth.OAuth2(client_id, client_secret, "http://localhost:3000/oauth2callback");

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2.setCredentials(token);
    if (token.expiry_date && token.expiry_date < Date.now() + 60000) {
      const { credentials } = await oAuth2.refreshAccessToken();
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
      oAuth2.setCredentials(credentials);
    }
    return oAuth2;
  }

  return new Promise((resolve, reject) => {
    const authUrl = oAuth2.generateAuthUrl({ access_type: "offline", scope: SCOPES });
    console.log("\n🔐 Autorização necessária (primeira vez).");
    console.log("   Abrindo navegador... Se não abrir, acesse:");
    console.log("  ", authUrl, "\n");
    try { require("child_process").execSync(`start "" "${authUrl}"`, { stdio: "ignore" }); } catch (_) {}

    const server = http.createServer(async (req, res) => {
      const code = new URL(req.url, "http://localhost:3000").searchParams.get("code");
      if (!code) { res.end("Sem código."); return; }
      res.end("<h2>✅ Autorizado! Pode fechar esta aba.</h2>");
      server.close();
      const { tokens } = await oAuth2.getToken(code);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      oAuth2.setCredentials(tokens);
      resolve(oAuth2);
    });
    server.listen(3000, () => console.log("   Aguardando em http://localhost:3000 ...\n"));
    server.on("error", reject);
  });
}

// ─── ID generator ─────────────────────────────────────────────────────────────
let _seq = 0;
const uid = (prefix) => `${prefix}_${++_seq}`;

// ─── Request builders ─────────────────────────────────────────────────────────
function reqBg(pageId, color) {
  return {
    updatePageProperties: {
      objectId: pageId,
      pageProperties: { pageBackgroundFill: { solidFill: { color: { rgbColor: color } } } },
      fields: "pageBackgroundFill",
    },
  };
}

function reqRect(id, pageId, x, y, w, h, fillColor, borderColor, borderWidth = 0) {
  const reqs = [{
    createShape: {
      objectId: id,
      shapeType: "RECTANGLE",
      elementProperties: { pageObjectId: pageId, ...emu(x, y, w, h) },
    },
  }];

  const shapeProps = {
    objectId: id,
    shapeProperties: {},
    fields: "",
  };

  if (fillColor) {
    shapeProps.shapeProperties.shapeBackgroundFill = { solidFill: { color: { rgbColor: fillColor } } };
    shapeProps.fields += "shapeBackgroundFill";
  } else {
    shapeProps.shapeProperties.shapeBackgroundFill = { propertyState: "NOT_RENDERED" };
    shapeProps.fields += "shapeBackgroundFill";
  }

  if (borderColor && borderWidth > 0) {
    shapeProps.shapeProperties.outline = {
      outlineFill: { solidFill: { color: { rgbColor: borderColor } } },
      weight: { magnitude: pt(borderWidth), unit: "EMU" },
    };
    shapeProps.fields += (shapeProps.fields ? "," : "") + "outline";
  } else {
    shapeProps.shapeProperties.outline = { propertyState: "NOT_RENDERED" };
    shapeProps.fields += (shapeProps.fields ? "," : "") + "outline";
  }

  reqs.push({ updateShapeProperties: shapeProps });
  return reqs;
}

function reqText(id, pageId, text, x, y, w, h, style = {}) {
  const reqs = [
    ...reqRect(id, pageId, x, y, w, h, null, null, 0),
    { insertText: { objectId: id, text: String(text || ""), insertionIndex: 0 } },
  ];

  const textStyleFields = [];
  const textStyle = {};

  if (style.bold !== undefined) { textStyle.bold = style.bold; textStyleFields.push("bold"); }
  if (style.fontSize) { textStyle.fontSize = { magnitude: style.fontSize, unit: "PT" }; textStyleFields.push("fontSize"); }
  if (style.color) { textStyle.foregroundColor = { opaqueColor: { rgbColor: style.color } }; textStyleFields.push("foregroundColor"); }
  if (style.fontFamily) { textStyle.fontFamily = style.fontFamily; textStyleFields.push("fontFamily"); }

  if (textStyleFields.length) {
    reqs.push({
      updateTextStyle: {
        objectId: id,
        style: textStyle,
        fields: textStyleFields.join(","),
        textRange: { type: "ALL" },
      },
    });
  }

  return reqs;
}

// ─── Layout helpers ───────────────────────────────────────────────────────────
function addEyebrow(reqs, pageId, text, accent) {
  const id = uid("eyebrow");
  reqs.push(...reqText(id, pageId, text, 48, 18, 600, 18, { bold: true, fontSize: 11, color: accent, fontFamily: "Montserrat" }));
}

function addTitle(reqs, pageId, text, top, size = 30) {
  const id = uid("title");
  reqs.push(...reqText(id, pageId, text, 48, top, 640, size + 10, { bold: true, fontSize: size, color: WHITE, fontFamily: "Montserrat" }));
}

function addSubtitle(reqs, pageId, text, top) {
  const id = uid("sub");
  reqs.push(...reqText(id, pageId, text, 48, top, 640, 36, { fontSize: 13, color: GRAY, fontFamily: "Inter" }));
}

function addDivider(reqs, pageId, accent) {
  const id = uid("div");
  reqs.push(...reqRect(id, pageId, 48, 60, 56, 3, accent, null, 0));
}

function addSlideNum(reqs, pageId, n, total) {
  const id = uid("num");
  reqs.push(...reqText(id, pageId, `${n} / ${total}`, 650, 380, 58, 14, { fontSize: 9, color: GRAY, fontFamily: "Montserrat" }));
}

function addBullets(reqs, pageId, items, x, y, w, color = GRAY) {
  const id = uid("bullets");
  const text = items.map((i) => `• ${i}`).join("\n");
  reqs.push(...reqText(id, pageId, text, x, y, w, items.length * 22 + 8, { fontSize: 11, color, fontFamily: "Inter" }));
}

function addCard(reqs, pageId, x, y, w, h, headerText, bodyText, kind, accent) {
  const bgColor = kind === "alert"    ? rgb(50, 20, 20)
                : kind === "positive" ? rgb(15, 40, 20)
                : kind === "warning"  ? rgb(40, 35, 10)
                : kind === "info"     ? rgb(15, 25, 50)
                : CARD;
  const border = kind === "positive" ? GREEN
               : kind === "alert"    ? RED
               : kind === "warning"  ? ORANGE
               : accent;

  const bgId = uid("card_bg");
  reqs.push(...reqRect(bgId, pageId, x, y, w, h, bgColor, border, 1));

  const hId = uid("card_h");
  reqs.push(...reqText(hId, pageId, headerText, x+10, y+8, w-20, 20, { bold: true, fontSize: 11, color: WHITE, fontFamily: "Montserrat" }));

  if (bodyText) {
    const bId = uid("card_b");
    reqs.push(...reqText(bId, pageId, bodyText, x+10, y+32, w-20, h-42, { fontSize: 10, color: GRAY, fontFamily: "Inter" }));
  }
}

// ─── Layout renderers ─────────────────────────────────────────────────────────
function renderCover(reqs, pageId, s, accent, n, total) {
  reqs.push(reqBg(pageId, BG));
  const barId = uid("bar");
  reqs.push(...reqRect(barId, pageId, 0, 0, 6, H, accent, null, 0));
  addEyebrow(reqs, pageId, s.eyebrow || "", accent);
  addDivider(reqs, pageId, accent);
  addTitle(reqs, pageId, (s.title || "").replace(/\\n/g, "\n"), 100, 40);
  addSubtitle(reqs, pageId, s.subtitle || "", 210);
  const footId = uid("foot");
  const footText = [s.client, s.footer].filter(Boolean).join("  ·  ");
  reqs.push(...reqText(footId, pageId, footText, 48, 372, 620, 14, { fontSize: 10, color: GRAY, fontFamily: "Inter" }));
  addSlideNum(reqs, pageId, n, total);
}

function renderBigStatement(reqs, pageId, s, accent, n, total) {
  reqs.push(reqBg(pageId, BG));
  const barId = uid("bar");
  reqs.push(...reqRect(barId, pageId, 60, 78, 5, 110, accent, null, 0));
  const stId = uid("st");
  reqs.push(...reqText(stId, pageId, (s.statement || "").replace(/\\n/g, "\n"), 68, 80, 600, 110, { bold: true, fontSize: 38, color: WHITE, fontFamily: "Montserrat" }));
  const supId = uid("sup");
  reqs.push(...reqText(supId, pageId, s.support || "", 68, 210, 580, 50, { fontSize: 13, color: GRAY, fontFamily: "Inter" }));
  const attrId = uid("attr");
  reqs.push(...reqText(attrId, pageId, s.attribution || "", 68, 278, 400, 16, { bold: true, fontSize: 11, color: accent, fontFamily: "Montserrat" }));
  addSlideNum(reqs, pageId, n, total);
}

function renderExecutiveContext(reqs, pageId, s, accent, n, total) {
  reqs.push(reqBg(pageId, BG));
  addEyebrow(reqs, pageId, s.eyebrow || "DIAGNÓSTICO", accent);
  addTitle(reqs, pageId, s.title || "", 36, 26);
  addDivider(reqs, pageId, accent);

  // Left panel
  const lBgId = uid("lpanel");
  reqs.push(...reqRect(lBgId, pageId, 24, 76, 324, 302, rgb(15,40,20), GREEN, 1));
  const lhId = uid("lh");
  reqs.push(...reqText(lhId, pageId, `✅  ${s.left_title || ""}`, 34, 84, 300, 18, { bold: true, fontSize: 11, color: GREEN, fontFamily: "Montserrat" }));
  addBullets(reqs, pageId, s.left_items || [], 34, 108, 304, GRAY);

  // Right panel
  const rBgId = uid("rpanel");
  reqs.push(...reqRect(rBgId, pageId, 372, 76, 324, 302, rgb(50,15,15), RED, 1));
  const rhId = uid("rh");
  reqs.push(...reqText(rhId, pageId, `🚨  ${s.right_title || ""}`, 382, 84, 304, 18, { bold: true, fontSize: 11, color: RED, fontFamily: "Montserrat" }));
  addBullets(reqs, pageId, s.right_items || [], 382, 108, 304, GRAY);

  addSlideNum(reqs, pageId, n, total);
}

function renderBento(reqs, pageId, s, accent, n, total) {
  reqs.push(reqBg(pageId, BG));
  addEyebrow(reqs, pageId, "INVENTÁRIO — SITUAÇÃO ATUAL", accent);
  addTitle(reqs, pageId, s.title || "", 34, 24);
  addDivider(reqs, pageId, accent);

  const items = s.items || [];
  let normalX = 24, normalY = 152, normalW = 158;

  items.forEach((item) => {
    if (item.span === "wide") {
      addCard(reqs, pageId, 24, 72, 672, 72, item.title || "", item.body || "", item.kind, accent);
    } else {
      addCard(reqs, pageId, normalX, normalY, normalW, 100, item.title || "", item.body || "", item.kind, accent);
      normalX += normalW + 8;
    }
  });

  addSlideNum(reqs, pageId, n, total);
}

function renderComparison(reqs, pageId, s, accent, n, total) {
  reqs.push(reqBg(pageId, BG));
  addEyebrow(reqs, pageId, "GAP ESTRATÉGICO", accent);
  addTitle(reqs, pageId, s.title || "", 34, 24);
  addDivider(reqs, pageId, accent);

  const lBgId = uid("lpanel");
  reqs.push(...reqRect(lBgId, pageId, 24, 72, 324, 306, rgb(30,20,20), RED, 1));
  const lhId = uid("lh");
  reqs.push(...reqText(lhId, pageId, s.left_label || "", 34, 80, 304, 16, { bold: true, fontSize: 11, color: RED, fontFamily: "Montserrat" }));
  addBullets(reqs, pageId, s.left_items || [], 34, 102, 304, GRAY);

  const rBgId = uid("rpanel");
  reqs.push(...reqRect(rBgId, pageId, 372, 72, 324, 306, rgb(10,30,15), GREEN, 1));
  const rhId = uid("rh");
  reqs.push(...reqText(rhId, pageId, s.right_label || "", 382, 80, 304, 16, { bold: true, fontSize: 11, color: GREEN, fontFamily: "Montserrat" }));
  addBullets(reqs, pageId, s.right_items || [], 382, 102, 304, GRAY);

  addSlideNum(reqs, pageId, n, total);
}

function renderThreePillars(reqs, pageId, s, accent, n, total) {
  reqs.push(reqBg(pageId, BG));
  addEyebrow(reqs, pageId, "ALERTAS CRÍTICOS", accent);
  addTitle(reqs, pageId, s.title || "", 34, 24);
  addDivider(reqs, pageId, accent);

  (s.pillars || []).forEach((p, i) => {
    const x = 24 + i * 232;
    const bgId = uid("pillar");
    reqs.push(...reqRect(bgId, pageId, x, 76, 218, 292, CARD, accent, 1));
    const iconId = uid("picon");
    reqs.push(...reqText(iconId, pageId, p.icon || "", x+10, 86, 40, 30, { fontSize: 20 }));
    const tId = uid("ptitle");
    reqs.push(...reqText(tId, pageId, p.title || "", x+10, 122, 198, 22, { bold: true, fontSize: 14, color: WHITE, fontFamily: "Montserrat" }));
    const bId = uid("pbody");
    reqs.push(...reqText(bId, pageId, p.body || "", x+10, 148, 198, 200, { fontSize: 10, color: GRAY, fontFamily: "Inter" }));
  });

  addSlideNum(reqs, pageId, n, total);
}

function renderStrategyMap(reqs, pageId, s, accent, n, total) {
  reqs.push(reqBg(pageId, BG));
  addEyebrow(reqs, pageId, "PAUTA — PRÓXIMA SEMANA", accent);
  addTitle(reqs, pageId, s.title || "", 34, 24);
  addDivider(reqs, pageId, accent);

  (s.stages || []).forEach((st, i) => {
    const x = 18 + i * 178;
    const bgId = uid("stage");
    reqs.push(...reqRect(bgId, pageId, x, 76, 166, 292, CARD, accent, 1));

    const pillId = uid("spill");
    reqs.push(...reqRect(pillId, pageId, x+8, 86, 100, 17, accent, null, 0));
    const pTxtId = uid("splbl");
    reqs.push(...reqText(pTxtId, pageId, st.label || "", x+10, 87, 96, 15, { bold: true, fontSize: 8, color: WHITE, fontFamily: "Montserrat" }));

    const tId = uid("stitle");
    reqs.push(...reqText(tId, pageId, st.title || "", x+8, 110, 150, 22, { bold: true, fontSize: 13, color: WHITE, fontFamily: "Montserrat" }));
    const bId = uid("sbody");
    reqs.push(...reqText(bId, pageId, st.body || "", x+8, 136, 150, 200, { fontSize: 10, color: GRAY, fontFamily: "Inter" }));

    if (i < (s.stages.length - 1)) {
      const arrowId = uid("arrow");
      reqs.push(...reqRect(arrowId, pageId, x+168, 160, 10, 16, accent, null, 0));
    }
  });

  addSlideNum(reqs, pageId, n, total);
}

function renderTimeline(reqs, pageId, s, accent, n, total) {
  reqs.push(reqBg(pageId, BG));
  addEyebrow(reqs, pageId, "PLANO — 4 SEMANAS", accent);
  addTitle(reqs, pageId, s.title || "", 34, 24);
  addDivider(reqs, pageId, accent);

  (s.steps || []).forEach((step, i) => {
    const x = 18 + i * 178;
    const isDone = i === 0;
    const cardColor = isDone ? rgb(18,18,18) : CARD;
    const borderColor = isDone ? GRAY : accent;

    const bgId = uid("week");
    reqs.push(...reqRect(bgId, pageId, x, 76, 166, 302, cardColor, borderColor, 1));

    const pillId = uid("wpill");
    reqs.push(...reqRect(pillId, pageId, x+8, 86, 100, 16, borderColor, null, 0));
    const pTxtId = uid("wplbl");
    reqs.push(...reqText(pTxtId, pageId, step.period || "", x+10, 87, 96, 14, { bold: true, fontSize: 8, color: WHITE, fontFamily: "Montserrat" }));

    const labelId = uid("wlbl");
    reqs.push(...reqText(labelId, pageId, step.label || "", x+8, 108, 150, 26, { bold: true, fontSize: 10, color: isDone ? GRAY : WHITE, fontFamily: "Montserrat" }));

    const itemsId = uid("witem");
    const text = (step.items || []).map((it) => `• ${it}`).join("\n");
    reqs.push(...reqText(itemsId, pageId, text, x+8, 138, 150, 220, { fontSize: 10, color: GRAY, fontFamily: "Inter" }));
  });

  addSlideNum(reqs, pageId, n, total);
}

function renderClosing(reqs, pageId, s, accent, n, total) {
  reqs.push(reqBg(pageId, BG));
  addEyebrow(reqs, pageId, "AÇÕES — COM DONO E PRAZO", accent);
  addTitle(reqs, pageId, s.title || "", 34, 24);
  addDivider(reqs, pageId, accent);

  const ownerColors = { Cliente: accent, V4: GREEN, Juscélio: ORANGE, Leandro: ORANGE };

  (s.actions || []).forEach((a, i) => {
    const y = 76 + i * 56;
    const oc = ownerColors[a.owner] || accent;

    const rowId = uid("row");
    reqs.push(...reqRect(rowId, pageId, 24, y, 672, 50, CARD, null, 0));

    const tagId = uid("tag");
    reqs.push(...reqRect(tagId, pageId, 30, y+10, 62, 18, oc, null, 0));
    const tagTxtId = uid("tagtxt");
    reqs.push(...reqText(tagTxtId, pageId, a.owner || "", 32, y+11, 58, 16, { bold: true, fontSize: 9, color: WHITE, fontFamily: "Montserrat" }));

    const actId = uid("act");
    reqs.push(...reqText(actId, pageId, a.action || "", 100, y+10, 490, 30, { fontSize: 11, color: WHITE, fontFamily: "Inter" }));

    const dlId = uid("dl");
    reqs.push(...reqText(dlId, pageId, a.deadline || "", 600, y+14, 80, 18, { bold: true, fontSize: 11, color: oc, fontFamily: "Montserrat" }));
  });

  const footId = uid("foot");
  reqs.push(...reqText(footId, pageId, s.footer || "", 24, 368, 400, 16, { fontSize: 11, color: GRAY, fontFamily: "Inter" }));

  addSlideNum(reqs, pageId, n, total);
}

// ─── Layout dispatcher ────────────────────────────────────────────────────────
function renderSlide(reqs, pageId, slideDef, accent, n, total) {
  const accentColor = accentRgb(accent);
  const dispatch = {
    cover:             renderCover,
    big_statement:     renderBigStatement,
    executive_context: renderExecutiveContext,
    bento:             renderBento,
    comparison:        renderComparison,
    three_pillars:     renderThreePillars,
    strategy_map:      renderStrategyMap,
    timeline:          renderTimeline,
    closing:           renderClosing,
  };
  const fn = dispatch[slideDef.layout];
  if (fn) fn(reqs, pageId, slideDef, accentColor, n, total);
  else {
    // fallback: title slide
    reqs.push(reqBg(pageId, BG));
    addTitle(reqs, pageId, slideDef.title || slideDef.layout, 80, 32);
    addSlideNum(reqs, pageId, n, total);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const [irFile, existingId] = process.argv.slice(2);

  if (!irFile) {
    console.error("Uso: node render-gslides-from-ir.js <deck.ir.json> [presentation-id]");
    process.exit(1);
  }

  const ir = JSON.parse(fs.readFileSync(path.resolve(irFile), "utf8").replace(/^﻿/, ""));
  const slides = ir.slides || [];
  const accent = ir.deck.accent || "#6366F1";
  const title  = ir.deck.title || "Presentation";

  const auth = await getAuth();
  const slidesApi = google.slides({ version: "v1", auth });
  const driveApi  = google.drive ({ version: "v3", auth });

  let presentationId = existingId;

  if (!presentationId) {
    console.log(`📐 Criando apresentação: "${title}"...`);
    const prs = await slidesApi.presentations.create({ requestBody: { title } });
    presentationId = prs.data.presentationId;
  } else {
    console.log(`📐 Populando apresentação existente: ${presentationId}`);
  }

  // Get current slides to find their IDs (we need to delete all default slides)
  const prsData = await slidesApi.presentations.get({ presentationId });
  const existingSlides = prsData.data.slides || [];

  // Build all batchUpdate requests
  const requests = [];

  // Slide IDs to use
  const slideIds = slides.map((_, i) => `slide_${i + 1}`);

  // Delete existing slides (except the first placeholder, which we'll reuse)
  for (let i = existingSlides.length - 1; i > 0; i--) {
    requests.push({ deleteObject: { objectId: existingSlides[i].objectId } });
  }

  // Create additional slides (we'll reuse slide 1)
  for (let i = 1; i < slides.length; i++) {
    requests.push({ createSlide: { objectId: slideIds[i], insertionIndex: i } });
  }

  // Use existing slide 1's ID for the first slide
  const firstPageId = existingSlides[0]?.objectId || slideIds[0];

  // Clear any content from existing slide 1
  if (existingSlides[0]) {
    const elements = existingSlides[0].pageElements || [];
    for (const el of elements) {
      requests.push({ deleteObject: { objectId: el.objectId } });
    }
  }

  // Render each slide
  const totalSlides = slides.length;
  for (let i = 0; i < slides.length; i++) {
    const pageId = i === 0 ? firstPageId : slideIds[i];
    renderSlide(requests, pageId, slides[i], accent, i + 1, totalSlides);
  }

  // Execute all requests in one batch
  console.log(`⚡ Enviando ${requests.length} operações para a Slides API...`);
  await slidesApi.presentations.batchUpdate({
    presentationId,
    requestBody: { requests },
  });

  // Get the link
  const prsInfo = await driveApi.files.get({
    fileId: presentationId,
    fields: "webViewLink,name",
  });

  console.log(`\n✅ Apresentação criada com sucesso!`);
  console.log(`   Título: ${prsInfo.data.name}`);
  console.log(`   Link:   ${prsInfo.data.webViewLink}\n`);
}

main().catch((err) => {
  console.error("\n❌ Erro:", err.message || err);
  if (err.errors) err.errors.forEach((e) => console.error("  -", e.message));
  process.exit(1);
});
