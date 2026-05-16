const fs = require("fs");
const path = require("path");

function loadPptxGen() {
  const candidates = [
    "pptxgenjs",
    path.resolve(__dirname, "../node_modules/pptxgenjs"),
    path.resolve(process.cwd(), "node_modules/pptxgenjs"),
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (_) {}
  }

  throw new Error(
    "pptxgenjs not found. Run: npm install pptxgenjs\n" +
    "Install inside the Skill X9 folder or in the project folder from which you run this script."
  );
}

const pptxgen = loadPptxGen();
const [input, output] = process.argv.slice(2);

if (!input || !output) {
  console.error("Usage: node render-pptx-from-ir.js <deck.ir.json> <deck.pptx>");
  process.exit(1);
}

const ir = JSON.parse(fs.readFileSync(input, "utf8").replace(/^\uFEFF/, ""));
const pptx = new pptxgen();

pptx.layout = "LAYOUT_WIDE";
pptx.author = "x9-2-0-14ev";
pptx.subject = "Teste de formatos X9";
pptx.title = `${ir.deck.client} - ${ir.deck.title}`;
pptx.company = "V4 Company";
pptx.lang = "pt-BR";
pptx.theme = {
  headFontFace: ir.deck.font || "Montserrat",
  bodyFontFace: ir.deck.font || "Montserrat",
  lang: "pt-BR"
};

const W = 13.333;
const H = 7.5;
const M = 0.62;
const BG = "050505";
const BG_ALT = "101010";
const CARD = "151515";
const LINE = "343434";
const TEXT = "FFFFFF";
const MUTED = "C9C9C9";
const SUBTLE = "8D8D8D";
const SUCCESS = "21C26B";
const accent = (ir.deck.accent || "#ff3333").replace("#", "").toUpperCase();
const cardTint = mixHex(CARD, accent, 0.12);
const accentDeep = mixHex(BG, accent, 0.2);

const MOJIBAKE_REPLACEMENTS = [
  ["â‰¤", "≤"], ["â‰¥", "≥"],
  ["â€“", "–"], ["â€”", "—"], ["â†’", "→"],
  ["â€¢", "•"], ["â€¦", "…"],
  ["â€˜", "‘"], ["â€™", "’"], ["â€œ", "“"], ["â€�", "”"],
  ["Â·", "·"], ["Âº", "º"], ["Âª", "ª"], ["Â ", " "]
];

function textQuality(value) {
  const s = String(value || "");
  const bad = (s.match(/�|Ã|Â|â[€\u0080-\u00BF]|[\u0080-\u009F]/g) || []).length * 4;
  const good = (s.match(/[áéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ≤≥–—→]/g) || []).length;
  return good - bad;
}

function cleanText(value) {
  let s = String(value ?? "");
  for (const [broken, fixed] of MOJIBAKE_REPLACEMENTS) s = s.split(broken).join(fixed);

  if (/[ÃÂ]|[\u0080-\u009F]/.test(s)) {
    const decoded = Buffer.from(s, "latin1").toString("utf8");
    if (textQuality(decoded) > textQuality(s)) s = decoded;
  }

  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function compactMetricValue(value) {
  return cleanText(value)
    .replace(/([≤≥])\s*R\$\s*/g, "$1\u00A0R$")
    .replace(/R\$\s+/g, "R$")
    .replace(/([≤≥])\s+(\d)/g, "$1\u00A0$2")
    .replace(/\s+min\b/gi, "min");
}

function metricFontSize(value) {
  const length = compactMetricValue(value).replace(/\s/g, "").length;
  if (length > 10) return 25;
  if (length > 7) return 28;
  return 34;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return [r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function mixHex(base, overlay, overlayAmount) {
  const a = hexToRgb(base);
  const b = hexToRgb(overlay);
  const keep = 1 - overlayAmount;
  return rgbToHex({
    r: a.r * keep + b.r * overlayAmount,
    g: a.g * keep + b.g * overlayAmount,
    b: a.b * keep + b.b * overlayAmount
  });
}

function addBg(slide) {
  slide.background = { color: BG };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: BG }, line: { color: BG } });
  // Keep the atmosphere subtle: decorative planes must never compete with the slide content.
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 10.65,
    y: -1.05,
    w: 3.7,
    h: 2.65,
    fill: { color: accent, transparency: 91 },
    line: { color: accent, transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 11.25,
    y: -0.52,
    w: 2.45,
    h: 1.75,
    fill: { color: accent, transparency: 95 },
    line: { color: accent, transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.08, fill: { color: accent }, line: { color: accent } });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0.08,
    w: W,
    h: 0.03,
    fill: { color: accent, transparency: 55 },
    line: { color: accent, transparency: 100 }
  });
}

function text(slide, value, x, y, w, h, opts = {}) {
  slide.addText(cleanText(value), {
    x,
    y,
    w,
    h,
    margin: 0,
    breakLine: false,
    fit: "shrink",
    fontFace: ir.deck.font || "Montserrat",
    color: opts.color || TEXT,
    fontSize: opts.size || 18,
    bold: opts.bold || false,
    italic: opts.italic || false,
    valign: opts.valign || "top",
    align: opts.align || "left",
    paraSpaceAfterPt: opts.after || 0,
    paraSpaceBeforePt: opts.before || 0
  });
}

function header(slide, eyebrow, title, subtitle) {
  const titleText = cleanText(title || "");
  const titleLength = titleText.length;
  const titleSize = titleLength > 72 ? 24 : titleLength > 48 ? 27 : 30;
  const titleHeight = titleLength > 72 ? 1.34 : titleLength > 48 ? 1.16 : 0.72;
  const subtitleY = titleLength > 72 ? 2.14 : titleLength > 48 ? 1.96 : 1.56;
  slide.addShape(pptx.ShapeType.rect, {
    x: M,
    y: 0.34,
    w: 1.2,
    h: 0.02,
    fill: { color: accent, transparency: 35 },
    line: { color: accent, transparency: 100 }
  });
  text(slide, eyebrow || "", M, 0.48, 5.5, 0.24, { size: 10.5, bold: true, color: accent });
  text(slide, titleText, M, 0.8, W - M * 2, titleHeight, { size: titleSize, bold: true });
  text(slide, subtitle || "", M, subtitleY, W - M * 2, 0.42, { size: 14, color: MUTED });
}

function addCard(slide, x, y, w, h, title, items = [], color = accent) {
  const localTint = mixHex(CARD, color, 0.1);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.05,
    y: y + 0.07,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: "000000", transparency: 72 },
    line: { color: "000000", transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: localTint },
    line: { color: mixHex(LINE, color, 0.18), width: 1 }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.08,
    y: y + 0.1,
    w: w - 0.16,
    h: 0.02,
    fill: { color, transparency: 58 },
    line: { color, transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.06, fill: { color }, line: { color } });
  text(slide, title, x + 0.24, y + 0.25, w - 0.48, 0.36, { size: 15.5, bold: true });

  const rowH = Math.min(0.58, (h - 0.9) / Math.max(items.length, 1));
  items.slice(0, 5).forEach((item, i) => {
    const iy = y + 0.82 + i * rowH;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.25,
      y: iy + 0.08,
      w: 0.09,
      h: 0.09,
      fill: { color },
      line: { color }
    });
    text(slide, item, x + 0.43, iy, w - 0.68, rowH, { size: 12.6, color: MUTED });
  });
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function itemTitle(item) {
  return item.title || item.label || item.name || item.stage || "";
}

function itemBody(item) {
  return item.body || item.caption || item.description || item.message || item.note || "";
}

function channelColor(name) {
  const normalized = String(name || "").toLowerCase();
  if (normalized.includes("google")) return "FFB000";
  if (normalized.includes("meta") || normalized.includes("facebook") || normalized.includes("instagram")) return "2F7CFF";
  if (normalized.includes("whatsapp") || normalized.includes("crm")) return SUCCESS;
  return accent;
}

function addDecision(slide, value, y = 6.14) {
  if (!value) return;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: M,
    y,
    w: W - M * 2,
    h: 0.62,
    rectRadius: 0.08,
    fill: { color: mixHex(CARD, accent, 0.18) },
    line: { color: mixHex(LINE, accent, 0.26), width: 1 }
  });
  text(slide, value, M + 0.28, y + 0.17, W - M * 2 - 0.56, 0.26, { size: 12.2, bold: true, align: "center" });
}

function bulletList(slide, items, x, y, w, h, opts = {}) {
  const max = opts.max || 5;
  const rows = arr(items).slice(0, max);
  const rowH = Math.min(0.48, h / Math.max(rows.length, 1));
  rows.forEach((item, i) => {
    const iy = y + i * rowH;
    const color = opts.color || accent;
    slide.addShape(pptx.ShapeType.ellipse, {
      x,
      y: iy + 0.08,
      w: 0.08,
      h: 0.08,
      fill: { color },
      line: { color }
    });
    text(slide, typeof item === "string" ? item : itemBody(item) || itemTitle(item), x + 0.18, iy, w - 0.18, rowH, {
      size: opts.size || 10.5,
      color: opts.textColor || MUTED
    });
  });
}

function renderSection(slide, c, index) {
  const number = c.section_number || c.number || String(index).padStart(2, "0");
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 8.4,
    y: 0.8,
    w: 5.2,
    h: 5.2,
    fill: { color: accent, transparency: 88 },
    line: { color: accent, transparency: 100 }
  });
  text(slide, number, M, 1.15, 2.5, 0.8, { size: 34, bold: true, color: accent });
  text(slide, c.title, M, 2.1, 10.5, 1.45, { size: 48, bold: true });
  text(slide, c.subtitle, M, 3.82, 8.8, 0.62, { size: 16.5, color: MUTED });
  slide.addShape(pptx.ShapeType.rect, { x: M, y: 5.42, w: 4.2, h: 0.05, fill: { color: accent }, line: { color: accent } });
}

function renderAgenda(slide, c) {
  header(slide, "AGENDA", c.title, c.subtitle);
  const items = arr(c.items || c.blocks || c.actions).slice(0, 9);
  const gap = 0.16;
  const w = (W - M * 2 - gap * 2) / 3;
  const h = 1.16;
  items.forEach((item, i) => {
    const x = M + (i % 3) * (w + gap);
    const y = 2.12 + Math.floor(i / 3) * (h + 0.18);
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      rectRadius: 0.09,
      fill: { color: i === 0 || i === 3 || i === 6 ? mixHex(CARD, accent, 0.16) : cardTint },
      line: { color: mixHex(LINE, accent, 0.18), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.05, fill: { color: accent }, line: { color: accent } });
    text(slide, item.num || String(i + 1).padStart(2, "0"), x + 0.18, y + 0.18, 0.55, 0.2, { size: 9.4, bold: true, color: accent });
    text(slide, itemTitle(item), x + 0.72, y + 0.17, w - 0.9, 0.24, { size: 11.6, bold: true });
    text(slide, itemBody(item), x + 0.72, y + 0.55, w - 0.9, 0.27, { size: 8.6, color: MUTED });
  });
}

function renderPillars(slide, c, count = 4) {
  header(slide, count === 3 ? "TRES FRENTES" : "PILARES", c.title, c.subtitle);
  const items = arr(c.pillars || c.items).slice(0, count);
  const gap = 0.18;
  const w = (W - M * 2 - gap * (items.length - 1)) / Math.max(items.length, 1);
  items.forEach((item, i) => {
    const x = M + i * (w + gap);
    const y = 2.34 + (items.length === 3 && i === 1 ? -0.14 : 0);
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h: 3.75,
      rectRadius: 0.1,
      fill: { color: i === items.length - 1 ? mixHex(CARD, accent, 0.18) : cardTint },
      line: { color: mixHex(LINE, item.color || accent, 0.2), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.08, fill: { color: item.color || accent }, line: { color: item.color || accent } });
    text(slide, item.num || String(i + 1).padStart(2, "0"), x + 0.22, y + 0.32, 0.6, 0.22, { size: 10.5, bold: true, color: item.color || accent });
    text(slide, itemTitle(item), x + 0.22, y + 0.8, w - 0.44, 0.58, { size: 15.2, bold: true });
    text(slide, itemBody(item), x + 0.22, y + 1.62, w - 0.44, 1.15, { size: 10.6, color: MUTED });
    if (item.metric || item.meta) text(slide, item.metric || item.meta, x + 0.22, y + 3.22, w - 0.44, 0.24, { size: 10.2, bold: true, color: SUBTLE });
  });
  addDecision(slide, c.decision || c.commitment);
}

function renderBento(slide, c) {
  header(slide, "DASHBOARD EXECUTIVO", c.title, c.subtitle);
  const items = arr(c.items || c.cards).slice(0, 6);
  const positions = [
    { x: M, y: 2.17, w: 3.8, h: 1.55 },
    { x: 4.58, y: 2.17, w: 3.05, h: 1.55 },
    { x: 7.86, y: 2.17, w: 4.84, h: 1.55 },
    { x: M, y: 3.95, w: 5.1, h: 1.55 },
    { x: 5.34, y: 3.95, w: 3.25, h: 1.55 },
    { x: 8.83, y: 3.95, w: 3.87, h: 1.55 }
  ];
  items.forEach((item, i) => {
    const p = positions[i];
    slide.addShape(pptx.ShapeType.roundRect, {
      ...p,
      rectRadius: 0.1,
      fill: { color: i === 0 ? mixHex(CARD, accent, 0.2) : cardTint },
      line: { color: mixHex(LINE, item.color || accent, 0.18), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x: p.x, y: p.y, w: p.w, h: 0.06, fill: { color: item.color || accent }, line: { color: item.color || accent } });
    text(slide, item.metric || item.kicker || "", p.x + 0.22, p.y + 0.2, p.w - 0.44, 0.2, { size: 9.6, bold: true, color: item.color || accent });
    text(slide, itemTitle(item), p.x + 0.22, p.y + 0.52, p.w - 0.44, 0.3, { size: 12.8, bold: true });
    text(slide, itemBody(item), p.x + 0.22, p.y + 0.92, p.w - 0.44, 0.38, { size: 9.5, color: MUTED });
  });
  addDecision(slide, c.decision || c.commitment);
}

function renderComparison(slide, c) {
  header(slide, c.eyebrow || "ANTES x DEPOIS", c.title, c.subtitle);
  const w = 5.9;
  const y = 2.2;
  const panels = [
    { x: M, label: c.left_label || "Hoje", items: c.left_items || [], color: "777777" },
    { x: 6.8, label: c.right_label || "Como vai ser", items: c.right_items || [], color: accent }
  ];
  panels.forEach((panel, i) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: panel.x,
      y,
      w,
      h: 3.85,
      rectRadius: 0.1,
      fill: { color: i === 1 ? mixHex(CARD, accent, 0.18) : cardTint },
      line: { color: mixHex(LINE, panel.color, 0.2), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x: panel.x, y, w, h: 0.08, fill: { color: panel.color }, line: { color: panel.color } });
    text(slide, panel.label, panel.x + 0.28, y + 0.32, w - 0.56, 0.3, { size: 15.5, bold: true });
    bulletList(slide, panel.items, panel.x + 0.3, y + 0.95, w - 0.6, 2.35, { color: panel.color, max: 6 });
  });
  addDecision(slide, c.decision);
}

function renderStrategyMap(slide, c) {
  header(slide, c.eyebrow || "MAPA ESTRATEGICO", c.title, c.subtitle);
  const stages = arr(c.stages || c.steps).slice(0, 6);
  const gap = stages.length > 4 ? 0.12 : 0.16;
  const w = (W - M * 2 - gap * (stages.length - 1)) / Math.max(stages.length, 1);
  stages.forEach((stage, i) => {
    const x = M + i * (w + gap);
    const y = 2.34;
    const h = stages.length > 4 ? 3.32 : 3.55;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      rectRadius: 0.1,
      fill: { color: i === stages.length - 1 ? mixHex(CARD, accent, 0.2) : cardTint },
      line: { color: mixHex(LINE, stage.color || accent, 0.18), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.06, fill: { color: stage.color || accent }, line: { color: stage.color || accent } });
    text(slide, stage.num || String(i + 1).padStart(2, "0"), x + 0.18, y + 0.3, 0.54, 0.22, { size: stages.length > 4 ? 9.4 : 10.2, bold: true, color: stage.color || accent });
    text(slide, itemTitle(stage), x + 0.18, y + 0.76, w - 0.36, 0.42, { size: stages.length > 4 ? 11.6 : 14.1, bold: true });
    text(slide, itemBody(stage), x + 0.18, y + 1.34, w - 0.36, stages.length > 4 ? 1.2 : 1.38, { size: stages.length > 4 ? 8.8 : 11.15, color: MUTED });
    if (stage.kpi) text(slide, stage.kpi, x + 0.18, y + h - 0.54, w - 0.36, 0.24, { size: stages.length > 4 ? 8.4 : 9.4, bold: true, color: SUBTLE });
    if (i < stages.length - 1) {
      slide.addShape(pptx.ShapeType.line, { x: x + w, y: y + 1.78, w: gap, h: 0, line: { color: accent, width: 1.3, endArrowType: "triangle" } });
    }
  });
  addDecision(slide, c.decision);
}

function renderCampaignStructure(slide, c) {
  header(slide, c.eyebrow || "ESTRUTURA DE CAMPANHAS", c.title, c.subtitle);
  const items = arr(c.channels || c.items || c.campaigns).slice(0, 8);
  const cols = items.length <= 4 ? 2 : 4;
  const gap = 0.16;
  const w = (W - M * 2 - gap * (cols - 1)) / cols;
  const h = items.length <= 4 ? 1.55 : 1.25;
  items.forEach((item, i) => {
    const x = M + (i % cols) * (w + gap);
    const y = 2.18 + Math.floor(i / cols) * (h + 0.17);
    const color = item.color || channelColor(itemTitle(item));
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      rectRadius: 0.09,
      fill: { color: mixHex(CARD, color, 0.11) },
      line: { color: mixHex(LINE, color, 0.22), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.05, fill: { color }, line: { color } });
    text(slide, itemTitle(item), x + 0.18, y + 0.2, w - 0.36, 0.28, { size: cols === 4 ? 10.2 : 12.2, bold: true });
    text(slide, itemBody(item), x + 0.18, y + 0.58, w - 0.36, 0.38, { size: cols === 4 ? 7.8 : 9.3, color: MUTED });
    if (item.metric || item.budget) text(slide, item.metric || item.budget, x + 0.18, y + h - 0.3, w - 0.36, 0.16, { size: 8.2, bold: true, color: SUBTLE });
  });
  addDecision(slide, c.notes || c.decision);
}

function renderPipeline(slide, c) {
  header(slide, c.eyebrow || "PIPELINE", c.title, c.subtitle);
  const steps = arr(c.steps || c.items).slice(0, 7);
  const gap = 0.1;
  const w = (W - M * 2 - gap * (steps.length - 1)) / Math.max(steps.length, 1);
  steps.forEach((step, i) => {
    const x = M + i * (w + gap);
    const y = 2.36 + (steps.length > 4 ? (i % 2) * 0.24 : 0);
    const h = steps.length > 4 ? 3.22 : 3.45;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      rectRadius: 0.09,
      fill: { color: i === steps.length - 1 ? mixHex(CARD, accent, 0.17) : cardTint },
      line: { color: mixHex(LINE, step.color || accent, 0.2), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.05, fill: { color: step.color || accent }, line: { color: step.color || accent } });
    text(slide, step.num || String(i + 1).padStart(2, "0"), x + 0.13, y + 0.24, w - 0.26, 0.2, { size: 8.5, bold: true, color: step.color || accent });
    text(slide, itemTitle(step), x + 0.13, y + 0.62, w - 0.26, 0.42, { size: steps.length > 4 ? 8.8 : 12.2, bold: true });
    text(slide, itemBody(step), x + 0.13, y + 1.18, w - 0.26, 1.12, { size: steps.length > 4 ? 7.3 : 9.2, color: MUTED });
    if (step.owner) text(slide, step.owner, x + 0.13, y + h - 0.42, w - 0.26, 0.18, { size: 7.3, bold: true, color: SUBTLE });
    if (i < steps.length - 1) {
      slide.addShape(pptx.ShapeType.line, { x: x + w, y: y + 1.68, w: gap, h: 0, line: { color: accent, width: 1.15, endArrowType: "triangle" } });
    }
  });
  addDecision(slide, c.decision);
}

function normalizeCoord(value, start, span, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  if (n >= 0 && n <= 1) return start + n * span;
  if (n >= 0 && n <= 100) return start + (n / 100) * span;
  return n;
}

function drawflowVariantContent(variant) {
  const normalized = String(variant || "").toLowerCase();
  if (normalized === "acquisition") {
    return {
      nodes: [
        { id: "ads", x: 38, y: 0, title: "TRAFEGO PAGO", body: "Meta Ads + Google Ads + organico", type: "meta" },
        { id: "lp", x: 38, y: 20, title: "LANDING PAGE", body: "Nome, telefone, cidade e beneficio" },
        { id: "wa", x: 38, y: 40, title: "WHATSAPP BUSINESS", body: "Mensagem automatica D0 em ate 5 min", type: "whatsapp" },
        { id: "check", x: 38, y: 60, title: "RESPONDEU?", body: "Bifurcacao clara do fluxo" },
        { id: "yes", x: 6, y: 75, title: "SIM: TRIAGEM BCHT", body: "Patricia qualifica e agenda consulta", type: "whatsapp" },
        { id: "no", x: 70, y: 75, title: "NAO: D3 > D5 > D7", body: "Texto, audio humanizado e encerramento" }
      ],
      edges: [
        { from: "ads", to: "lp" },
        { from: "lp", to: "wa" },
        { from: "wa", to: "check" },
        { from: "check", to: "yes", label: "sim", color: SUCCESS },
        { from: "check", to: "no", label: "nao" }
      ],
      decision: "O fluxo precisa mostrar de forma nitida como midia vira conversa, triagem e consulta."
    };
  }
  if (normalized === "pipeline") {
    return {
      nodes: [
        { id: "lead", x: 0, y: 8, title: "LEAD NO CRM", body: "Tag: digital, indicado ou organico", type: "crm" },
        { id: "triagem", x: 19, y: 8, title: "TRIAGEM", body: "Patricia aplica BCHT no WhatsApp" },
        { id: "consulta", x: 39, y: 3, title: "CONSULTA AGENDADA", body: "Confirmacao 24h + 1h antes", type: "whatsapp" },
        { id: "icaro", x: 59, y: 3, title: "CONSULTA", body: "Icaro analisa e apresenta proposta", type: "whatsapp" },
        { id: "contrato", x: 78, y: 3, title: "CONTRATO", body: "Juridico assume documentos", type: "whatsapp" },
        { id: "semperfil", x: 39, y: 45, title: "SEM PERFIL", body: "Tag + retorno em 90 dias" },
        { id: "negociacao", x: 59, y: 45, title: "NEGOCIACAO", body: "Patricia D+1/D+2 tira duvidas" },
        { id: "exito", x: 78, y: 72, title: "EXITO", body: "Honorarios + indicacao", type: "whatsapp" }
      ],
      edges: [
        { from: "lead", to: "triagem" },
        { from: "triagem", to: "consulta", color: SUCCESS },
        { from: "triagem", to: "semperfil" },
        { from: "consulta", to: "icaro", color: SUCCESS },
        { from: "icaro", to: "contrato", color: SUCCESS },
        { from: "icaro", to: "negociacao" },
        { from: "contrato", to: "exito", color: SUCCESS }
      ],
      decision: "O pipeline separa venda, juridico e follow-up sem depender da memoria do fundador."
    };
  }
  return {
    nodes: [
      { id: "contrato", x: 38, y: 0, title: "CONTRATO ASSINADO", body: "Inicio da experiencia pos-venda", type: "whatsapp" },
      { id: "juridico", x: 38, y: 20, title: "JURIDICO", body: "Documentos, analise e protocolo INSS", type: "crm" },
      { id: "acompanha", x: 38, y: 40, title: "ACOMPANHAMENTO", body: "Atualizacao mensal via WhatsApp" },
      { id: "resultado", x: 38, y: 60, title: "RESULTADO INSS", body: "Aprovado ou negado" },
      { id: "aprovado", x: 6, y: 75, title: "APROVADO", body: "Administrativo calcula honorarios", type: "whatsapp" },
      { id: "negado", x: 70, y: 75, title: "NEGADO", body: "Recurso administrativo ou acao judicial" }
    ],
    edges: [
      { from: "contrato", to: "juridico", color: SUCCESS },
      { from: "juridico", to: "acompanha" },
      { from: "acompanha", to: "resultado" },
      { from: "resultado", to: "aprovado", label: "sim", color: SUCCESS },
      { from: "resultado", to: "negado", label: "nao" }
    ],
    decision: "Retencao aqui e acompanhamento ativo, indicacao futura e reducao de inseguranca do cliente."
  };
}

function drawNode(slide, node, geom) {
  const color = node.color || channelColor(node.type || node.title || node.label);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: geom.x,
    y: geom.y,
    w: geom.w,
    h: geom.h,
    rectRadius: 0.08,
    fill: { color: mixHex(CARD, color, 0.13) },
    line: { color: mixHex(LINE, color, 0.24), width: 1 }
  });
  slide.addShape(pptx.ShapeType.rect, { x: geom.x, y: geom.y, w: geom.w, h: 0.045, fill: { color }, line: { color } });
  text(slide, itemTitle(node), geom.x + 0.14, geom.y + 0.16, geom.w - 0.28, 0.22, { size: geom.w < 2 ? 8.6 : 9.8, bold: true });
  text(slide, itemBody(node), geom.x + 0.14, geom.y + 0.47, geom.w - 0.28, geom.h - 0.58, { size: geom.w < 2 ? 6.9 : 7.8, color: MUTED });
}

function renderDrawflow(slide, c) {
  const variantContent = !arr(c.nodes).length && c.variant ? drawflowVariantContent(c.variant) : {};
  c = { ...variantContent, ...c, nodes: arr(c.nodes).length ? c.nodes : variantContent.nodes, edges: arr(c.edges).length ? c.edges : variantContent.edges, decision: c.decision || variantContent.decision };
  const nodes = arr(c.nodes);
  if (!nodes.length) {
    return renderPipeline(slide, { ...c, steps: c.steps || c.items || [] });
  }
  header(slide, c.eyebrow || "DRAWFLOW", c.title, c.subtitle);

  const area = { x: M, y: 2.12, w: W - M * 2, h: 4.28 };
  const defaultW = nodes.length > 7 ? 1.82 : 2.2;
  const defaultH = nodes.length > 7 ? 0.68 : 0.78;
  const cols = Math.min(4, Math.ceil(Math.sqrt(nodes.length)));
  const geoms = new Map();

  nodes.forEach((node, i) => {
    const fallbackX = area.x + (i % cols) * (area.w / Math.max(cols, 1));
    const fallbackY = area.y + Math.floor(i / cols) * 1.18;
    const w = Number(node.w || node.width) || defaultW;
    const h = Number(node.h || node.height) || defaultH;
    const x = normalizeCoord(node.x ?? node.left, area.x, area.w - w, fallbackX);
    const y = normalizeCoord(node.y ?? node.top, area.y, area.h - h, fallbackY);
    geoms.set(node.id || node.key || itemTitle(node) || String(i), { x, y, w, h, node });
  });

  arr(c.edges || c.links).forEach((edge) => {
    const from = geoms.get(edge.from || edge.source || edge.a);
    const to = geoms.get(edge.to || edge.target || edge.b);
    if (!from || !to) return;
    const color = edge.color || accent;
    const sameColumn = Math.abs(from.x - to.x) < 0.25;
    const goingLeft = to.x < from.x;
    const x1 = sameColumn ? from.x + from.w / 2 : goingLeft ? from.x : from.x + from.w;
    const y1 = sameColumn ? from.y + from.h : from.y + from.h / 2;
    const x2 = sameColumn ? to.x + to.w / 2 : goingLeft ? to.x + to.w : to.x;
    const y2 = sameColumn ? to.y : to.y + to.h / 2;
    slide.addShape(pptx.ShapeType.line, {
      x: x1,
      y: y1,
      w: x2 - x1,
      h: y2 - y1,
      line: { color, width: 1.4, endArrowType: "triangle", transparency: 6 }
    });
    if (edge.label) text(slide, edge.label, (x1 + x2) / 2 - 0.45, (y1 + y2) / 2 - 0.12, 0.9, 0.16, { size: 7.2, color: SUBTLE, align: "center" });
  });

  geoms.forEach((geom) => drawNode(slide, geom.node, geom));
  if (arr(c.legend).length) {
    arr(c.legend).slice(0, 4).forEach((item, i) => {
      const x = M + i * 3.05;
      slide.addShape(pptx.ShapeType.roundRect, { x, y: 6.54, w: 2.75, h: 0.28, rectRadius: 0.08, fill: { color: mixHex(CARD, item.color || accent, 0.15) }, line: { color: item.color || accent, transparency: 45 } });
      text(slide, item.label || itemTitle(item), x + 0.13, 6.61, 2.49, 0.1, { size: 7.4, bold: true, color: MUTED, align: "center" });
    });
  } else {
    addDecision(slide, c.decision, 6.36);
  }
}

function renderTimeline(slide, c) {
  header(slide, c.eyebrow || "LINHA DO TEMPO", c.title, c.subtitle);
  const steps = arr(c.steps || c.items).slice(0, 5);
  const gap = 0.16;
  const w = (W - M * 2 - gap * (steps.length - 1)) / Math.max(steps.length, 1);
  slide.addShape(pptx.ShapeType.line, { x: M, y: 3.0, w: W - M * 2, h: 0, line: { color: accent, width: 2 } });
  steps.forEach((step, i) => {
    const x = M + i * (w + gap);
    slide.addShape(pptx.ShapeType.ellipse, { x: x + w / 2 - 0.08, y: 2.92, w: 0.16, h: 0.16, fill: { color: accent }, line: { color: accent } });
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 3.28,
      w,
      h: 2.55,
      rectRadius: 0.09,
      fill: { color: cardTint },
      line: { color: mixHex(LINE, step.color || accent, 0.2), width: 1 }
    });
    text(slide, itemTitle(step), x + 0.18, 3.58, w - 0.36, 0.34, { size: 11.5, bold: true });
    text(slide, itemBody(step), x + 0.18, 4.1, w - 0.36, 0.86, { size: 8.9, color: MUTED });
    text(slide, step.owner || step.date || "", x + 0.18, 5.3, w - 0.36, 0.18, { size: 7.8, bold: true, color: SUBTLE });
  });
  addDecision(slide, c.decision, 6.16);
}

function renderClosing(slide, c) {
  text(slide, c.eyebrow || "PROXIMO PASSO", M, 0.86, 5.6, 0.28, { size: 11.5, bold: true, color: accent });
  text(slide, c.title, M, 1.28, 9.6, 1.18, { size: 42, bold: true });
  text(slide, c.subtitle, M, 2.74, 8.6, 0.52, { size: 15.5, color: MUTED });
  const actions = arr(c.actions).slice(0, 4);
  actions.forEach((action, i) => {
    const x = M + i * 3.05;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 4.05,
      w: 2.84,
      h: 1.25,
      rectRadius: 0.09,
      fill: { color: cardTint },
      line: { color: mixHex(LINE, accent, 0.2), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x, y: 4.05, w: 2.84, h: 0.05, fill: { color: accent }, line: { color: accent } });
    text(slide, itemTitle(action), x + 0.18, 4.3, 2.48, 0.25, { size: 11.2, bold: true });
    text(slide, itemBody(action), x + 0.18, 4.69, 2.48, 0.34, { size: 8.6, color: MUTED });
  });
  addDecision(slide, c.footer || c.decision, 5.85);
}

function renderMarketScopeDashboard(slide, c) {
  header(slide, "TAM / SAM / SOM", c.title, c.subtitle);
  const scopes = arr(c.scopes || c.metrics || c.items).slice(0, 3);
  const cx = 3.1;
  const cy = 4.18;
  const sizes = [3.5, 2.55, 1.65];
  scopes.forEach((scope, i) => {
    const size = sizes[i] || 1.4;
    const color = i === 0 ? "4A4A4A" : i === 1 ? mixHex(CARD, accent, 0.38) : accent;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - size / 2 + i * 0.25,
      y: cy - size / 2 + i * 0.2,
      w: size,
      h: size,
      fill: { color, transparency: i === 2 ? 18 : 38 },
      line: { color: i === 0 ? LINE : accent, width: 1 }
    });
  });
  scopes.forEach((scope, i) => {
    const x = 6.45;
    const y = 2.18 + i * 1.22;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 5.95,
      h: 0.98,
      rectRadius: 0.09,
      fill: { color: i === 2 ? mixHex(CARD, accent, 0.22) : cardTint },
      line: { color: mixHex(LINE, accent, 0.2), width: 1 }
    });
    text(slide, itemTitle(scope), x + 0.24, y + 0.18, 2.55, 0.22, { size: 11.2, bold: true, color: i === 2 ? accent : SUBTLE });
    text(slide, scope.value || scope.metric || "", x + 3.1, y + 0.12, 2.55, 0.34, { size: 18, bold: true, align: "right" });
    text(slide, itemBody(scope), x + 0.24, y + 0.54, 5.42, 0.22, { size: 8.6, color: MUTED });
  });
  addDecision(slide, c.insight || c.decision, 6.22);
}

function renderWeeklyCalendarPlusRoutine(slide, c) {
  header(slide, c.eyebrow || "CALENDARIO + ROTINA", c.title, c.subtitle);
  const days = arr(c.days || c.calendar || c.items).slice(0, 5);
  const gap = 0.12;
  const w = 1.72;
  days.forEach((day, i) => {
    const x = M + i * (w + gap);
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.22, w, h: 3.65, rectRadius: 0.08, fill: { color: cardTint }, line: { color: LINE, width: 1 } });
    slide.addShape(pptx.ShapeType.rect, { x, y: 2.22, w, h: 0.06, fill: { color: day.color || accent }, line: { color: day.color || accent } });
    text(slide, itemTitle(day), x + 0.16, 2.48, w - 0.32, 0.26, { size: 10.2, bold: true });
    bulletList(slide, day.items || day.posts || [itemBody(day)], x + 0.18, 3.02, w - 0.36, 2.2, { size: 7.6, max: 4, color: day.color || accent });
  });
  slide.addShape(pptx.ShapeType.roundRect, { x: 10.18, y: 2.22, w: 2.52, h: 3.65, rectRadius: 0.08, fill: { color: mixHex(CARD, accent, 0.17) }, line: { color: mixHex(LINE, accent, 0.22), width: 1 } });
  text(slide, c.routine_title || "Rotina", 10.42, 2.52, 2.05, 0.28, { size: 13.2, bold: true });
  bulletList(slide, c.routine || c.checklist || [], 10.42, 3.05, 1.95, 2.2, { size: 8.2, max: 5 });
  addDecision(slide, c.decision, 6.18);
}

function renderCompetitorMap(slide, c) {
  header(slide, "MAPA COMPETITIVO", c.title, c.subtitle);
  const columns = arr(c.columns || c.groups).length ? arr(c.columns || c.groups).slice(0, 2) : [
    { title: c.left_label || "Concorrentes locais", items: c.local || c.left_items || [] },
    { title: c.right_label || "Concorrentes digitais", items: c.digital || c.right_items || [] }
  ];
  columns.forEach((col, i) => {
    const x = M + i * 6.12;
    const color = i === 0 ? "777777" : accent;
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.2, w: 5.92, h: 3.55, rectRadius: 0.1, fill: { color: i === 1 ? mixHex(CARD, accent, 0.18) : cardTint }, line: { color: mixHex(LINE, color, 0.22), width: 1 } });
    slide.addShape(pptx.ShapeType.rect, { x, y: 2.2, w: 5.92, h: 0.07, fill: { color }, line: { color } });
    text(slide, itemTitle(col), x + 0.28, 2.52, 5.36, 0.28, { size: 14.3, bold: true });
    bulletList(slide, col.items || col.competitors || [], x + 0.3, 3.08, 5.2, 2.05, { color, max: 5 });
  });
  addDecision(slide, c.opportunity || c.decision, 6.13);
}

function renderRoiDashboard(slide, c) {
  header(slide, "PROJECAO DE ROI", c.title, c.subtitle);
  const metrics = arr(c.metrics || c.kpis).slice(0, 4);
  const gap = 0.18;
  const w = (W - M * 2 - gap * 3) / 4;
  metrics.forEach((m, i) => {
    const x = M + i * (w + gap);
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.12, w, h: 1.38, rectRadius: 0.09, fill: { color: i === 3 ? mixHex(CARD, accent, 0.22) : cardTint }, line: { color: mixHex(LINE, accent, 0.2), width: 1 } });
    text(slide, m.label || itemTitle(m), x + 0.2, 2.38, w - 0.4, 0.2, { size: 8.6, bold: true, color: SUBTLE });
    text(slide, m.value || m.metric, x + 0.2, 2.72, w - 0.4, 0.34, { size: 18.5, bold: true, color: i === 3 ? accent : TEXT, align: "center" });
  });
  const bars = arr(c.scenarios || c.bars || c.assumptions).slice(0, 4);
  bars.forEach((bar, i) => {
    const y = 4.0 + i * 0.48;
    const percent = Math.max(4, Math.min(100, Number(bar.percent || bar.value_percent || (25 + i * 18))));
    text(slide, itemTitle(bar), M, y, 2.6, 0.18, { size: 9.4, bold: true });
    slide.addShape(pptx.ShapeType.roundRect, { x: 3.05, y: y + 0.03, w: 7.2, h: 0.16, rectRadius: 0.07, fill: { color: "FFFFFF", transparency: 92 }, line: { color: "FFFFFF", transparency: 100 } });
    slide.addShape(pptx.ShapeType.roundRect, { x: 3.05, y: y + 0.03, w: 7.2 * (percent / 100), h: 0.16, rectRadius: 0.07, fill: { color: bar.color || accent }, line: { color: bar.color || accent } });
    text(slide, bar.value || bar.amount || `${percent}%`, 10.45, y - 0.02, 1.85, 0.2, { size: 9.2, color: MUTED, align: "right" });
  });
  addDecision(slide, c.decision || c.insight, 6.14);
}

function renderProposalScope45d(slide, c) {
  header(slide, "ESCOPO 45 DIAS", c.title, c.subtitle);
  const phases = arr(c.phases || c.timeline || [
    { title: "D0-D15", body: "Fundacao e setup" },
    { title: "D16-D30", body: "Campanhas e rotina" },
    { title: "D31-D45", body: "Otimizacao e escala" }
  ]).slice(0, 3);
  phases.forEach((phase, i) => {
    const x = M + i * 4.1;
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.16, w: 3.85, h: 1.15, rectRadius: 0.09, fill: { color: i === 2 ? mixHex(CARD, accent, 0.2) : cardTint }, line: { color: mixHex(LINE, accent, 0.22), width: 1 } });
    text(slide, itemTitle(phase), x + 0.22, 2.42, 3.4, 0.24, { size: 13.2, bold: true, color: i === 2 ? accent : TEXT });
    text(slide, itemBody(phase), x + 0.22, 2.78, 3.4, 0.2, { size: 8.8, color: MUTED });
  });
  const deliverables = arr(c.deliverables || c.actions || c.items).slice(0, 6);
  deliverables.forEach((item, i) => {
    const x = M + (i % 3) * 4.1;
    const y = 3.65 + Math.floor(i / 3) * 1.15;
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.85, h: 0.92, rectRadius: 0.08, fill: { color: cardTint }, line: { color: LINE, width: 1 } });
    text(slide, itemTitle(item), x + 0.18, y + 0.16, 3.49, 0.2, { size: 10.4, bold: true });
    text(slide, itemBody(item), x + 0.18, y + 0.48, 3.49, 0.18, { size: 7.8, color: MUTED });
  });
  addDecision(slide, c.decision || c.commitment, 6.16);
}

function renderCover(slide, c) {
  slide.addShape(pptx.ShapeType.rect, {
    x: M,
    y: 1.0,
    w: 1.7,
    h: 0.03,
    fill: { color: accent },
    line: { color: accent }
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 7.25,
    y: 1.2,
    w: 5.5,
    h: 3.7,
    fill: { color: accent, transparency: 90 },
    line: { color: accent, transparency: 100 }
  });
  text(slide, c.eyebrow, M, 1.2, 4.5, 0.26, { size: 12, bold: true, color: accent });
  text(slide, c.title, M, 1.65, 9.6, 1.65, { size: 45, bold: true });
  text(slide, c.subtitle, M, 3.48, 8.4, 0.72, { size: 16, color: MUTED });
  text(slide, c.client, M, 6.72, 3.2, 0.24, { size: 10.5, bold: true, color: SUBTLE });
  text(slide, c.footer, 10.1, 6.72, 2.6, 0.24, { size: 10.5, bold: true, color: SUBTLE, align: "right" });
}

function renderCinematicCover(slide, c) {
  slide.addShape(pptx.ShapeType.rect, {
    x: -0.7,
    y: 0.3,
    w: 14.8,
    h: 1.05,
    rotate: -12,
    fill: { color: accent, transparency: 76 },
    line: { color: accent, transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.7,
    y: 0.5,
    w: 7.6,
    h: 6.4,
    rotate: -18,
    fill: { color: accent, transparency: 86 },
    line: { color: accent, transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: -0.5,
    y: 5.55,
    w: 14.5,
    h: 0.18,
    rotate: -5,
    fill: { color: "FFFFFF", transparency: 74 },
    line: { color: "FFFFFF", transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: M,
    y: 1.0,
    w: 1.7,
    h: 0.03,
    fill: { color: accent },
    line: { color: accent }
  });
  text(slide, c.eyebrow, M, 1.18, 4.8, 0.27, { size: 12, bold: true, color: accent });
  text(slide, c.title, M, 1.62, 10.6, 1.95, { size: 53, bold: true });
  text(slide, c.subtitle, M, 3.78, 8.7, 0.7, { size: 16, color: MUTED });
  text(slide, c.client, M, 6.72, 3.2, 0.24, { size: 10.5, bold: true, color: SUBTLE });
  text(slide, c.footer, 10.1, 6.72, 2.6, 0.24, { size: 10.5, bold: true, color: SUBTLE, align: "right" });
}

function renderExecutiveContext(slide, c, index) {
  header(slide, `${String(index + 1).padStart(2, "0")}. CONTEXTO`, c.title, c.subtitle);
  addCard(slide, M, 2.35, 5.82, 4.25, c.left_title, c.left_items || [], SUCCESS);
  addCard(slide, 6.88, 2.35, 5.82, 4.25, c.right_title, c.right_items || [], accent);
}

function renderMetricGrid(slide, c) {
  header(slide, "DADOS VALIDADOS", c.title, c.subtitle);
  const metrics = (c.metrics || []).slice(0, 4);
  const gap = 0.22;
  const w = (W - M * 2 - gap * 3) / 4;
  metrics.forEach((m, i) => {
    const x = M + i * (w + gap);
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.55,
      w,
      h: 3.55,
      rectRadius: 0.08,
      fill: { color: cardTint },
      line: { color: mixHex(LINE, accent, 0.18), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: x + 0.08,
      y: 2.66,
      w: w - 0.16,
      h: 0.02,
      fill: { color: accent, transparency: 58 },
      line: { color: accent, transparency: 100 }
    });
    slide.addShape(pptx.ShapeType.rect, { x, y: 2.55, w, h: 0.06, fill: { color: accent }, line: { color: accent } });
    const value = compactMetricValue(m.value);
    text(slide, value, x + 0.16, 3.12, w - 0.32, 0.62, { size: metricFontSize(value), bold: true, color: accent, align: "center" });
    text(slide, m.label, x + 0.22, 4.0, w - 0.44, 0.36, { size: 11.5, bold: true, align: "center" });
    text(slide, m.caption, x + 0.28, 4.62, w - 0.56, 0.72, { size: 11.5, color: MUTED, align: "center" });
  });
}

function renderStatement(slide, c) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 2.4,
    y: 1.15,
    w: 8.6,
    h: 4.6,
    fill: { color: accent, transparency: 90 },
    line: { color: accent, transparency: 100 }
  });
  text(slide, c.statement, 1.4, 2.25, 10.5, 1.05, { size: 43, bold: true, align: "center" });
  text(slide, c.support, 2.0, 3.55, 9.35, 0.46, { size: 19, color: MUTED, align: "center" });
  text(slide, c.attribution, 3.35, 4.62, 6.65, 0.25, { size: 10.5, bold: true, color: accent, align: "center" });
}

function renderEvidenceDiagnosis(slide, c) {
  header(slide, "DIAGNOSTICO COM EVIDENCIA", c.title, c.subtitle);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: M,
    y: 2.12,
    w: 3.55,
    h: 4.6,
    rectRadius: 0.08,
    fill: { color: cardTint },
    line: { color: mixHex(LINE, accent, 0.18), width: 1 }
  });
  slide.addShape(pptx.ShapeType.rect, { x: M, y: 2.12, w: 0.08, h: 4.6, fill: { color: accent }, line: { color: accent } });
  text(slide, c.finding, M + 0.28, 2.45, 2.9, 1.28, { size: 18.8, bold: true });
  (c.bullets || []).slice(0, 4).forEach((item, i) => {
    const y = 4.03 + i * 0.56;
    slide.addShape(pptx.ShapeType.ellipse, { x: M + 0.3, y: y + 0.11, w: 0.09, h: 0.09, fill: { color: accent }, line: { color: accent } });
    text(slide, item, M + 0.5, y, 2.55, 0.42, { size: 10.5, color: MUTED });
  });

  (c.evidence || []).slice(0, 3).forEach((ev, i) => {
    const x = 4.75 + i * 2.68;
    const y = 2.35 + (i === 1 ? -0.18 : 0.05);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.06,
      y: y + 0.08,
      w: 2.28,
      h: 4.05,
      rectRadius: 0.15,
      fill: { color: "000000", transparency: 72 },
      line: { color: "000000", transparency: 100 }
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 2.28,
      h: 4.05,
      rectRadius: 0.15,
      fill: { color: "EFEFEF" },
      line: { color: "CFCFCF", width: 1 }
    });
    text(slide, ev.tag, x + 0.18, y + 0.25, 1.85, 0.22, { size: 9, bold: true, color: accent });
    text(slide, ev.text, x + 0.18, y + 1.18, 1.9, 1.05, { size: 13.5, bold: true, color: "111111" });
    text(slide, ev.caption, x + 0.18, y + 3.32, 1.85, 0.35, { size: 8.5, color: "666666" });
  });
}

function renderPipelineSplitOutcome(slide, c) {
  header(slide, "PIPELINE COMERCIAL", c.title, c.subtitle);
  const steps = (c.steps || []).slice(0, 4);
  const gap = 0.16;
  const w = (W - M * 2 - gap * 3) / 4;
  steps.forEach((step, i) => {
    const x = M + i * (w + gap);
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.38,
      w,
      h: 2.55,
      rectRadius: 0.08,
      fill: { color: cardTint },
      line: { color: mixHex(LINE, accent, 0.18), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x, y: 2.38, w, h: 0.06, fill: { color: accent }, line: { color: accent } });
    text(slide, `0${i + 1}`, x + 0.18, 2.68, 0.6, 0.22, { size: 10.5, bold: true, color: accent });
    text(slide, step.title || step.label, x + 0.18, 3.02, w - 0.36, 0.42, { size: 15, bold: true });
    text(slide, step.body || step.caption, x + 0.18, 3.65, w - 0.36, 0.68, { size: 11.2, color: MUTED });
    if (i < steps.length - 1) {
      slide.addShape(pptx.ShapeType.rect, { x: x + w - 0.02, y: 3.58, w: gap + 0.04, h: 0.03, fill: { color: accent }, line: { color: accent } });
    }
  });

  (c.outcomes || []).slice(0, 2).forEach((outcome, i) => {
    const x = M + i * 6.13;
    const color = i === 0 ? SUCCESS : accent;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 5.35,
      w: 5.95,
      h: 0.98,
      rectRadius: 0.08,
      fill: { color: mixHex(CARD, color, 0.13) },
      line: { color: mixHex(LINE, color, 0.2), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x, y: 5.35, w: 0.08, h: 0.98, fill: { color }, line: { color } });
    text(slide, outcome.title || outcome.label, x + 0.25, 5.52, 2.4, 0.28, { size: 14, bold: true });
    text(slide, outcome.body || outcome.caption, x + 2.55, 5.5, 3.08, 0.42, { size: 10.6, color: MUTED });
  });
}

function renderMatrix4Highlight(slide, c) {
  header(slide, "MATRIZ ESTRATEGICA", c.title, c.subtitle);
  const cols = (c.columns || []).slice(0, 4);
  const gap = 0.18;
  const w = (W - M * 2 - gap * 3) / 4;
  cols.forEach((col, i) => {
    const x = M + i * (w + gap);
    const color = i === 3 ? accent : "555555";
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.32,
      w,
      h: 3.45,
      rectRadius: 0.08,
      fill: { color: i === 3 ? mixHex(CARD, accent, 0.28) : cardTint },
      line: { color: mixHex(LINE, color, 0.2), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x, y: 2.32, w, h: 0.07, fill: { color }, line: { color } });
    text(slide, col.kicker || "", x + 0.2, 2.68, w - 0.4, 0.22, { size: 9, bold: true, color: i === 3 ? TEXT : SUBTLE });
    text(slide, col.title || col.label, x + 0.2, 3.1, w - 0.4, 0.55, { size: 15.5, bold: true });
    text(slide, col.body || col.caption, x + 0.2, 3.92, w - 0.4, 0.95, { size: 11.4, color: MUTED });
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: M,
    y: 5.95,
    w: W - M * 2,
    h: 0.75,
    rectRadius: 0.08,
    fill: { color: "FFFFFF", transparency: 92 },
    line: { color: "FFFFFF", transparency: 85 }
  });
  text(slide, c.decision, M + 0.25, 6.12, W - M * 2 - 0.5, 0.42, { size: 12.4, bold: true });
}

function renderExecutiveActionGrid(slide, c) {
  header(slide, "PROXIMOS PASSOS", c.title, c.subtitle);
  const actions = (c.actions || []).slice(0, 6);
  const gap = 0.18;
  const w = (W - M * 2 - gap * 2) / 3;
  actions.forEach((action, i) => {
    const x = M + (i % 3) * (w + gap);
    const y = 2.22 + Math.floor(i / 3) * 1.52;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h: 1.28,
      rectRadius: 0.08,
      fill: { color: cardTint },
      line: { color: mixHex(LINE, accent, 0.18), width: 1 }
    });
    text(slide, String(i + 1).padStart(2, "0"), x + 0.18, y + 0.18, 0.45, 0.22, { size: 10, bold: true, color: accent });
    text(slide, action.title || action.label, x + 0.72, y + 0.16, w - 0.9, 0.28, { size: 13.4, bold: true });
    text(slide, action.body || action.caption, x + 0.72, y + 0.57, w - 0.9, 0.38, { size: 10.3, color: MUTED });
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: M,
    y: 5.55,
    w: W - M * 2,
    h: 0.78,
    rectRadius: 0.08,
    fill: { color: mixHex(CARD, accent, 0.18) },
    line: { color: mixHex(LINE, accent, 0.25), width: 1 }
  });
  text(slide, c.commitment, M + 0.25, 5.8, W - M * 2 - 0.5, 0.3, { size: 16, bold: true, align: "center" });
}

function renderMediaBudgetCompare(slide, c) {
  header(slide, c.eyebrow || "DISTRIBUIÇÃO DE MÍDIA", c.title, c.subtitle);
  const scenarios = (c.scenarios || []).slice(0, 2);
  scenarios.forEach((scenario, i) => {
    const x = M + i * 6.13;
    const fill = scenario.featured ? mixHex(CARD, accent, 0.24) : cardTint;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.26,
      w: 5.95,
      h: 3.8,
      rectRadius: 0.1,
      fill: { color: fill },
      line: { color: mixHex(LINE, scenario.featured ? accent : "555555", 0.22), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x,
      y: 2.26,
      w: 5.95,
      h: 0.08,
      fill: { color: scenario.featured ? accent : "555555" },
      line: { color: scenario.featured ? accent : "555555" }
    });
    text(slide, scenario.label, x + 0.28, 2.58, 2.5, 0.24, { size: 10.2, bold: true, color: SUBTLE });
    text(slide, scenario.total, x + 3.2, 2.48, 2.45, 0.5, { size: 27, bold: true, align: "right" });
    text(slide, scenario.role, x + 0.28, 3.05, 5.35, 0.38, { size: 11.2, color: MUTED });

    (scenario.channels || []).slice(0, 2).forEach((channel, j) => {
      const cx = x + 0.28 + j * 2.76;
      const color = String(channel.name || "").toLowerCase().includes("google") ? "FFB000" : "2F7CFF";
      slide.addShape(pptx.ShapeType.roundRect, {
        x: cx,
        y: 3.62,
        w: 2.54,
        h: 0.98,
        rectRadius: 0.08,
        fill: { color: mixHex(CARD, color, 0.2) },
        line: { color: mixHex(LINE, color, 0.24), width: 1 }
      });
      slide.addShape(pptx.ShapeType.rect, { x: cx, y: 3.62, w: 2.54, h: 0.06, fill: { color }, line: { color } });
      text(slide, channel.name, cx + 0.16, 3.82, 1.1, 0.2, { size: 9.2, bold: true, color: SUBTLE });
      text(slide, channel.amount, cx + 1.05, 3.78, 1.28, 0.32, { size: 16, bold: true, align: "right" });
      text(slide, `${channel.percent}% - ${channel.purpose}`, cx + 0.16, 4.2, 2.2, 0.28, { size: 8.9, color: MUTED });
    });

    (scenario.bullets || []).slice(0, 3).forEach((item, j) => {
      const y = 4.87 + j * 0.34;
      slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.3, y: y + 0.08, w: 0.07, h: 0.07, fill: { color: accent }, line: { color: accent } });
      text(slide, item, x + 0.48, y, 5.1, 0.26, { size: 9.3, color: MUTED });
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: M,
    y: 6.25,
    w: W - M * 2,
    h: 0.5,
    rectRadius: 0.08,
    fill: { color: "FFFFFF", transparency: 92 },
    line: { color: "FFFFFF", transparency: 86 }
  });
  text(slide, c.decision, M + 0.22, 6.39, W - M * 2 - 0.44, 0.22, { size: 11.4, bold: true, align: "center" });
}

function renderChannelAllocationBars(slide, c) {
  header(slide, "MIX META + GOOGLE ADS", c.title, c.subtitle);
  const scenarios = (c.scenarios || []).slice(0, 2);
  scenarios.forEach((scenario, i) => {
    const x = M + i * 6.13;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.24,
      w: 5.95,
      h: 4.25,
      rectRadius: 0.1,
      fill: { color: cardTint },
      line: { color: mixHex(LINE, accent, 0.16), width: 1 }
    });
    text(slide, scenario.label, x + 0.28, 2.58, 2.5, 0.24, { size: 10.2, bold: true, color: SUBTLE });
    text(slide, scenario.total, x + 3.2, 2.5, 2.42, 0.34, { size: 20, bold: true, align: "right" });

    (scenario.channels || []).slice(0, 3).forEach((channel, j) => {
      const y = 3.12 + j * 1.05;
      const percent = Math.max(2, Math.min(100, Number(channel.percent || 0)));
      const color = String(channel.name || "").toLowerCase().includes("google") ? "FFB000" : "2F7CFF";
      text(slide, channel.name, x + 0.3, y, 1.6, 0.22, { size: 11.2, bold: true });
      text(slide, `${channel.amount} | ${channel.percent}%`, x + 3.7, y, 1.9, 0.22, { size: 10.2, color: MUTED, align: "right" });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.3,
        y: y + 0.34,
        w: 5.25,
        h: 0.18,
        rectRadius: 0.07,
        fill: { color: "FFFFFF", transparency: 92 },
        line: { color: "FFFFFF", transparency: 100 }
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.3,
        y: y + 0.34,
        w: 5.25 * (percent / 100),
        h: 0.18,
        rectRadius: 0.07,
        fill: { color },
        line: { color }
      });
      text(slide, channel.purpose, x + 0.3, y + 0.66, 5.25, 0.24, { size: 9.2, color: SUBTLE });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.3,
      y: 5.67,
      w: 5.35,
      h: 0.46,
      rectRadius: 0.08,
      fill: { color: "FFFFFF", transparency: 93 },
      line: { color: "FFFFFF", transparency: 88 }
    });
    text(slide, scenario.note, x + 0.48, 5.78, 5.0, 0.24, { size: 9.5, color: MUTED });
  });
}

function renderMediaFunnelPlan(slide, c) {
  header(slide, "PLANO POR FUNIL", c.title, c.subtitle);
  const stages = (c.stages || []).slice(0, 4);
  const gap = 0.16;
  const w = (W - M * 2 - gap * 3) / 4;
  stages.forEach((stage, i) => {
    const x = M + i * (w + gap);
    const y = 2.48 + (i === 0 || i === 3 ? 0.28 : 0);
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h: 3.35,
      rectRadius: 0.1,
      fill: { color: i === 1 || i === 2 ? mixHex(CARD, accent, 0.14) : cardTint },
      line: { color: mixHex(LINE, accent, 0.16), width: 1 }
    });
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.08, fill: { color: accent }, line: { color: accent } });
    text(slide, `0${i + 1}`, x + 0.2, y + 0.32, 0.5, 0.22, { size: 10.5, bold: true, color: accent });
    text(slide, stage.name, x + 0.2, y + 0.76, w - 0.4, 0.42, { size: 15.2, bold: true });
    text(slide, stage.message, x + 0.2, y + 1.42, w - 0.4, 0.72, { size: 10.8, color: MUTED });
    text(slide, stage.channel, x + 0.2, y + 2.64, 1.38, 0.28, { size: 10.4, bold: true });
    text(slide, stage.kpi, x + 1.45, y + 2.63, w - 1.65, 0.32, { size: 8.7, color: SUBTLE, align: "right" });
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: M,
    y: 6.2,
    w: W - M * 2,
    h: 0.5,
    rectRadius: 0.08,
    fill: { color: mixHex(CARD, accent, 0.16) },
    line: { color: mixHex(LINE, accent, 0.25), width: 1 }
  });
  text(slide, c.decision, M + 0.24, 6.34, W - M * 2 - 0.48, 0.22, { size: 11.8, bold: true, align: "center" });
}

ir.slides.forEach((slideDef, index) => {
  const slide = pptx.addSlide();
  addBg(slide);
  const c = slideDef.content || {};

  if (slideDef.layout === "cinematic_cover") renderCinematicCover(slide, c);
  else if (slideDef.layout === "cover") renderCover(slide, c);
  else if (slideDef.layout === "agenda") renderAgenda(slide, c);
  else if (slideDef.layout === "section") renderSection(slide, c, index + 1);
  else if (slideDef.layout === "executive_context") renderExecutiveContext(slide, c, index);
  else if (slideDef.layout === "metric_grid") renderMetricGrid(slide, c);
  else if (slideDef.layout === "four_pillars") renderPillars(slide, c, 4);
  else if (slideDef.layout === "three_pillars") renderPillars(slide, c, 3);
  else if (slideDef.layout === "bento") renderBento(slide, c);
  else if (slideDef.layout === "comparison") renderComparison(slide, c);
  else if (slideDef.layout === "strategy_map") renderStrategyMap(slide, c);
  else if (slideDef.layout === "campaign_structure") renderCampaignStructure(slide, c);
  else if (slideDef.layout === "pipeline") renderPipeline(slide, c);
  else if (slideDef.layout === "drawflow") renderDrawflow(slide, c);
  else if (slideDef.layout === "timeline") renderTimeline(slide, c);
  else if (slideDef.layout === "evidence_diagnosis") renderEvidenceDiagnosis(slide, c);
  else if (slideDef.layout === "pipeline_split_outcome") renderPipelineSplitOutcome(slide, c);
  else if (slideDef.layout === "matrix_4x_highlight") renderMatrix4Highlight(slide, c);
  else if (slideDef.layout === "executive_action_grid") renderExecutiveActionGrid(slide, c);
  else if (slideDef.layout === "market_scope_dashboard") renderMarketScopeDashboard(slide, c);
  else if (slideDef.layout === "weekly_calendar_plus_routine") renderWeeklyCalendarPlusRoutine(slide, c);
  else if (slideDef.layout === "competitor_map") renderCompetitorMap(slide, c);
  else if (slideDef.layout === "roi_dashboard") renderRoiDashboard(slide, c);
  else if (slideDef.layout === "proposal_scope_45d") renderProposalScope45d(slide, c);
  else if (slideDef.layout === "media_budget_compare") renderMediaBudgetCompare(slide, c);
  else if (slideDef.layout === "channel_allocation_bars") renderChannelAllocationBars(slide, c);
  else if (slideDef.layout === "media_funnel_plan") renderMediaFunnelPlan(slide, c);
  else if (slideDef.layout === "big_statement") renderStatement(slide, c);
  else if (slideDef.layout === "closing") renderClosing(slide, c);
  else {
    header(slide, slideDef.layout, c.title || slideDef.id, c.subtitle || "");
  }

  slide.addNotes(slideDef.notes || "");
});

fs.mkdirSync(path.dirname(output), { recursive: true });
pptx
  .write({ outputType: "nodebuffer", compression: true })
  .then((buf) => {
    fs.writeFileSync(output, buf);
    console.log(`PPTX generated: ${output}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
