const fs = require("fs");
const path = require("path");

const [input, output] = process.argv.slice(2);

if (!input || !output) {
  console.error("Usage: node render-html-from-ir.js <deck.ir.json> <preview.html>");
  process.exit(1);
}

const ir = JSON.parse(fs.readFileSync(input, "utf8").replace(/^\uFEFF/, ""));
const accent = ir.deck.accent || "#ff3333";

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
    .replace(/\s+/g, " ")
    .trim();
}

function esc(value) {
  return cleanText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function list(items = []) {
  return items.map((item) => `<li>${esc(item)}</li>`).join("");
}

function card(title, body) {
  return `<article class="card"><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`;
}

function itemTitle(item) {
  return esc(item.title || item.label || item.name || "");
}

function itemBody(item) {
  return esc(item.body || item.caption || item.description || "");
}

function drawflowVariantContent(variant) {
  const normalized = String(variant || "").toLowerCase();
  if (normalized === "acquisition") {
    return {
      nodes: [
        { id: "ads", x: 38, y: 0, title: "Trafego Pago", body: "Meta Ads + Google Ads + organico", type: "midia" },
        { id: "lp", x: 38, y: 20, title: "Landing Page", body: "Nome, telefone, cidade e beneficio" },
        { id: "wa", x: 38, y: 40, title: "WhatsApp Business", body: "Resposta automatica D0 em ate 5 min" },
        { id: "check", x: 38, y: 60, title: "Respondeu?", body: "Bifurcacao clara do fluxo" },
        { id: "yes", x: 6, y: 75, title: "Sim: Triagem BCHT", body: "Patricia qualifica e agenda consulta" },
        { id: "no", x: 70, y: 75, title: "Nao: D3 > D5 > D7", body: "Texto, audio humanizado e encerramento" }
      ],
      decision: "O fluxo precisa mostrar de forma nitida como midia vira conversa, triagem e consulta."
    };
  }
  if (normalized === "pipeline") {
    return {
      nodes: [
        { id: "lead", x: 0, y: 8, title: "Lead no CRM", body: "Tag: digital, indicado ou organico" },
        { id: "triagem", x: 19, y: 8, title: "Triagem", body: "Patricia aplica BCHT no WhatsApp" },
        { id: "consulta", x: 39, y: 3, title: "Consulta agendada", body: "Confirmacao 24h + 1h antes" },
        { id: "icaro", x: 59, y: 3, title: "Consulta", body: "Icaro analisa e apresenta proposta" },
        { id: "contrato", x: 78, y: 3, title: "Contrato", body: "Juridico assume documentos" },
        { id: "semperfil", x: 39, y: 45, title: "Sem perfil", body: "Tag + retorno em 90 dias" },
        { id: "negociacao", x: 59, y: 45, title: "Negociacao", body: "Patricia D+1/D+2 tira duvidas" },
        { id: "exito", x: 78, y: 72, title: "Exito", body: "Honorarios + indicacao" }
      ],
      decision: "O pipeline separa venda, juridico e follow-up sem depender da memoria do fundador."
    };
  }
  return {
    nodes: [
      { id: "contrato", x: 38, y: 0, title: "Contrato assinado", body: "Inicio da experiencia pos-venda" },
      { id: "juridico", x: 38, y: 20, title: "Juridico", body: "Documentos, analise e protocolo INSS" },
      { id: "acompanha", x: 38, y: 40, title: "Acompanhamento", body: "Atualizacao mensal via WhatsApp" },
      { id: "resultado", x: 38, y: 60, title: "Resultado INSS", body: "Aprovado ou negado" },
      { id: "aprovado", x: 6, y: 75, title: "Aprovado", body: "Administrativo calcula honorarios" },
      { id: "negado", x: 70, y: 75, title: "Negado", body: "Recurso administrativo ou acao judicial" }
    ],
    decision: "Retencao aqui e acompanhamento ativo, indicacao futura e reducao de inseguranca do cliente."
  };
}

function renderSlide(slide, index) {
  const c = slide.content || {};
  switch (slide.layout) {
    case "cinematic_cover":
      return `
        <section class="slide cinematic-cover">
          <div class="speed-field"></div>
          <div class="topbar"></div>
          <div class="safe cinematic-inner">
            <p class="eyebrow">${esc(c.eyebrow)}</p>
            <h1>${esc(c.title)}</h1>
            <p class="subtitle">${esc(c.subtitle)}</p>
            <div class="cover-footer"><span>${esc(c.client)}</span><span>${esc(c.footer)}</span></div>
          </div>
        </section>`;

    case "evidence_diagnosis":
      return `
        <section class="slide evidence">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">DIAGNOSTICO COM EVIDENCIA</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="evidence-grid">
              <article class="diagnosis-card">
                <strong>${esc(c.finding)}</strong>
                <ul>${list(c.bullets)}</ul>
              </article>
              <div class="evidence-shots">
                ${(c.evidence || []).slice(0, 3).map((e) => `
                  <article class="phone-shot">
                    <span>${esc(e.tag)}</span>
                    <p>${esc(e.text)}</p>
                    <small>${esc(e.caption)}</small>
                  </article>`).join("")}
              </div>
            </div>
          </div>
        </section>`;

    case "pipeline_split_outcome":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">PIPELINE COMERCIAL</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="pipeline-row">
              ${(c.steps || []).slice(0, 4).map((s, i) => `
                <article class="pipeline-step">
                  <span>0${i + 1}</span>
                  <h3>${itemTitle(s)}</h3>
                  <p>${itemBody(s)}</p>
                </article>`).join("")}
            </div>
            <div class="outcome-row">
              ${(c.outcomes || []).slice(0, 2).map((o, i) => `
                <article class="outcome ${i === 0 ? "win" : "loss"}">
                  <h3>${itemTitle(o)}</h3>
                  <p>${itemBody(o)}</p>
                </article>`).join("")}
            </div>
          </div>
        </section>`;

    case "matrix_4x_highlight":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">MATRIZ ESTRATEGICA</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="matrix-4">
              ${(c.columns || []).slice(0, 4).map((col, i) => `
                <article class="matrix-card ${i === 3 ? "highlight" : ""}">
                  <span>${esc(col.kicker || "")}</span>
                  <h3>${itemTitle(col)}</h3>
                  <p>${itemBody(col)}</p>
                </article>`).join("")}
            </div>
            <div class="decision-strip">${esc(c.decision)}</div>
          </div>
        </section>`;

    case "media_budget_compare":
      return `
        <section class="slide media-budget">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">${esc(c.eyebrow || "DISTRIBUIÇÃO DE MÍDIA")}</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="budget-compare">
              ${(c.scenarios || []).slice(0, 2).map((s) => `
                <article class="budget-scenario ${s.featured ? "featured" : ""}">
                  <div class="scenario-head">
                    <span>${esc(s.label)}</span>
                    <strong>${esc(s.total)}</strong>
                  </div>
                  <p class="scenario-role">${esc(s.role)}</p>
                  <div class="channel-split">
                    ${(s.channels || []).slice(0, 2).map((ch) => `
                      <div class="channel-card ${String(ch.name || "").toLowerCase().includes("google") ? "google" : "meta"}">
                        <span>${esc(ch.name)}</span>
                        <strong>${esc(ch.amount)}</strong>
                        <small>${esc(ch.percent)}% · ${esc(ch.purpose)}</small>
                      </div>`).join("")}
                  </div>
                  <ul>${list(s.bullets)}</ul>
                </article>`).join("")}
            </div>
            <div class="decision-strip">${esc(c.decision)}</div>
          </div>
        </section>`;

    case "channel_allocation_bars":
      return `
        <section class="slide media-bars">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">MIX META + GOOGLE ADS</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="allocation-board">
              ${(c.scenarios || []).slice(0, 2).map((s) => `
                <article class="allocation-panel">
                  <div class="allocation-title"><span>${esc(s.label)}</span><strong>${esc(s.total)}</strong></div>
                  ${(s.channels || []).slice(0, 3).map((ch) => `
                    <div class="bar-row">
                      <div class="bar-copy">
                        <strong>${esc(ch.name)}</strong>
                        <span>${esc(ch.amount)} · ${esc(ch.percent)}%</span>
                      </div>
                      <div class="bar-track">
                        <i class="${String(ch.name || "").toLowerCase().includes("google") ? "google" : "meta"}" style="width:${Math.max(2, Math.min(100, Number(ch.percent || 0)))}%"></i>
                      </div>
                      <p>${esc(ch.purpose)}</p>
                    </div>`).join("")}
                  <div class="allocation-note">${esc(s.note)}</div>
                </article>`).join("")}
            </div>
          </div>
        </section>`;

    case "media_funnel_plan":
      return `
        <section class="slide media-funnel">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">PLANO POR FUNIL</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="funnel-stack">
              ${(c.stages || []).slice(0, 4).map((stage, i) => `
                <article class="funnel-stage">
                  <span>0${i + 1}</span>
                  <h3>${esc(stage.name)}</h3>
                  <p>${esc(stage.message)}</p>
                  <div><b>${esc(stage.channel)}</b><small>${esc(stage.kpi)}</small></div>
                </article>`).join("")}
            </div>
            <div class="decision-strip">${esc(c.decision)}</div>
          </div>
        </section>`;

    case "executive_action_grid":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">PROXIMOS PASSOS</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="action-grid">
              ${(c.actions || []).slice(0, 6).map((a, i) => `
                <article class="action-card">
                  <span>${String(i + 1).padStart(2, "0")}</span>
                  <h3>${itemTitle(a)}</h3>
                  <p>${itemBody(a)}</p>
                </article>`).join("")}
            </div>
            <div class="decision-strip">${esc(c.commitment)}</div>
          </div>
        </section>`;

    case "section":
      return `
        <section class="slide section-slide">
          <div class="topbar"></div>
          <div class="safe section-inner">
            <strong>${esc(c.section_number || String(index).padStart(2, "0"))}</strong>
            <h2>${esc(c.title)}</h2>
            <p>${esc(c.subtitle)}</p>
          </div>
        </section>`;

    case "agenda":
      return `
        <section class="slide agenda-slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">AGENDA</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="agenda-grid">
              ${(c.items || c.blocks || c.actions || []).slice(0, 9).map((item, i) => `
                <article>
                  <span>${esc(item.num || String(i + 1).padStart(2, "0"))}</span>
                  <h3>${itemTitle(item)}</h3>
                  <p>${itemBody(item)}</p>
                </article>`).join("")}
            </div>
          </div>
        </section>`;

    case "four_pillars":
    case "three_pillars":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">${slide.layout === "three_pillars" ? "TRES FRENTES" : "PILARES"}</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="pillar-row ${slide.layout}">
              ${(c.pillars || c.items || []).map((p, i) => `
                <article class="pillar-card">
                  <span>${esc(p.num || String(i + 1).padStart(2, "0"))}</span>
                  <h3>${itemTitle(p)}</h3>
                  <p>${itemBody(p)}</p>
                  ${p.metric || p.meta ? `<small>${esc(p.metric || p.meta)}</small>` : ""}
                </article>`).join("")}
            </div>
            ${c.decision ? `<div class="decision-strip">${esc(c.decision)}</div>` : ""}
          </div>
        </section>`;

    case "bento":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">DASHBOARD EXECUTIVO</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="bento-grid">
              ${(c.items || c.cards || []).slice(0, 6).map((item, i) => `
                <article class="bento-card ${i === 0 ? "featured" : ""}">
                  <span>${esc(item.metric || item.kicker || "")}</span>
                  <h3>${itemTitle(item)}</h3>
                  <p>${itemBody(item)}</p>
                </article>`).join("")}
            </div>
            ${c.decision ? `<div class="decision-strip">${esc(c.decision)}</div>` : ""}
          </div>
        </section>`;

    case "comparison":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">${esc(c.eyebrow || "ANTES x DEPOIS")}</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="compare-panels">
              <article class="compare-panel muted-panel"><h3>${esc(c.left_label || "Hoje")}</h3><ul>${list(c.left_items)}</ul></article>
              <article class="compare-panel accent-panel"><h3>${esc(c.right_label || "Como vai ser")}</h3><ul>${list(c.right_items)}</ul></article>
            </div>
            ${c.decision ? `<div class="decision-strip">${esc(c.decision)}</div>` : ""}
          </div>
        </section>`;

    case "strategy_map":
      return `
        <section class="slide strategy-slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">${esc(c.eyebrow || "MAPA ESTRATEGICO")}</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="strategy-row">
              ${(c.stages || c.steps || []).slice(0, 6).map((stage, i) => `
                <article class="strategy-card">
                  <span>${esc(stage.num || String(i + 1).padStart(2, "0"))}</span>
                  <h3>${itemTitle(stage)}</h3>
                  <p>${itemBody(stage)}</p>
                  ${stage.kpi ? `<small>${esc(stage.kpi)}</small>` : ""}
                </article>`).join("")}
            </div>
            ${c.decision ? `<div class="decision-strip">${esc(c.decision)}</div>` : ""}
          </div>
        </section>`;

    case "campaign_structure":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">${esc(c.eyebrow || "ESTRUTURA DE CAMPANHAS")}</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="campaign-grid">
              ${(c.channels || c.items || c.campaigns || []).slice(0, 8).map((item) => `
                <article class="campaign-card">
                  <h3>${itemTitle(item)}</h3>
                  <p>${itemBody(item)}</p>
                  ${item.metric || item.budget ? `<small>${esc(item.metric || item.budget)}</small>` : ""}
                </article>`).join("")}
            </div>
            ${c.notes || c.decision ? `<div class="decision-strip">${esc(c.notes || c.decision)}</div>` : ""}
          </div>
        </section>`;

    case "pipeline":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">${esc(c.eyebrow || "PIPELINE")}</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="pipeline-row dense">
              ${(c.steps || c.items || []).slice(0, 7).map((s, i) => `
                <article class="pipeline-step">
                  <span>${esc(s.num || String(i + 1).padStart(2, "0"))}</span>
                  <h3>${itemTitle(s)}</h3>
                  <p>${itemBody(s)}</p>
                  ${s.owner ? `<small>${esc(s.owner)}</small>` : ""}
                </article>`).join("")}
            </div>
            ${c.decision ? `<div class="decision-strip">${esc(c.decision)}</div>` : ""}
          </div>
        </section>`;

    case "drawflow":
      const flow = (c.nodes || []).length ? c : { ...drawflowVariantContent(c.variant), ...c, nodes: drawflowVariantContent(c.variant).nodes, decision: c.decision || drawflowVariantContent(c.variant).decision };
      return `
        <section class="slide drawflow-slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">${esc(c.eyebrow || "DRAWFLOW")}</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="drawflow-board">
              ${(flow.edges || []).map((e) => `<i class="flow-edge" data-from="${esc(e.from || e.source || "")}" data-to="${esc(e.to || e.target || "")}"></i>`).join("")}
              ${(flow.nodes || flow.steps || flow.items || []).slice(0, 10).map((node, i) => `
                <article class="flow-node" style="--x:${Number(node.x ?? ((i % 4) * 30))}%;--y:${Number(node.y ?? (Math.floor(i / 4) * 34))}%">
                  <span>${esc(node.type || node.tag || String(i + 1).padStart(2, "0"))}</span>
                  <h3>${itemTitle(node)}</h3>
                  <p>${itemBody(node)}</p>
                </article>`).join("")}
            </div>
            ${flow.decision ? `<div class="decision-strip">${esc(flow.decision)}</div>` : ""}
          </div>
        </section>`;

    case "timeline":
      return `
        <section class="slide timeline-slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">${esc(c.eyebrow || "LINHA DO TEMPO")}</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="timeline-row">
              ${(c.steps || c.items || []).slice(0, 5).map((step) => `
                <article class="timeline-card">
                  <h3>${itemTitle(step)}</h3>
                  <p>${itemBody(step)}</p>
                  ${step.owner || step.date ? `<small>${esc(step.owner || step.date)}</small>` : ""}
                </article>`).join("")}
            </div>
            ${c.decision ? `<div class="decision-strip">${esc(c.decision)}</div>` : ""}
          </div>
        </section>`;

    case "market_scope_dashboard":
      return `
        <section class="slide market-slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">TAM / SAM / SOM</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="market-grid">
              <div class="scope-orbit">${(c.scopes || c.metrics || c.items || []).slice(0, 3).map((s, i) => `<b class="scope-${i}">${esc(s.value || s.metric || itemTitle(s))}</b>`).join("")}</div>
              <div class="scope-cards">
                ${(c.scopes || c.metrics || c.items || []).slice(0, 3).map((s) => `
                  <article><span>${itemTitle(s)}</span><strong>${esc(s.value || s.metric || "")}</strong><p>${itemBody(s)}</p></article>`).join("")}
              </div>
            </div>
            ${c.insight || c.decision ? `<div class="decision-strip">${esc(c.insight || c.decision)}</div>` : ""}
          </div>
        </section>`;

    case "weekly_calendar_plus_routine":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">${esc(c.eyebrow || "CALENDARIO + ROTINA")}</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="calendar-layout">
              <div class="calendar-grid">
                ${(c.days || c.calendar || c.items || []).slice(0, 5).map((day) => `<article><h3>${itemTitle(day)}</h3><ul>${list(day.items || day.posts || [itemBody(day)])}</ul></article>`).join("")}
              </div>
              <article class="routine-card"><h3>${esc(c.routine_title || "Rotina")}</h3><ul>${list(c.routine || c.checklist)}</ul></article>
            </div>
            ${c.decision ? `<div class="decision-strip">${esc(c.decision)}</div>` : ""}
          </div>
        </section>`;

    case "competitor_map":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">MAPA COMPETITIVO</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="compare-panels">
              ${(c.columns || c.groups || [
                { title: c.left_label || "Concorrentes locais", items: c.local || c.left_items || [] },
                { title: c.right_label || "Concorrentes digitais", items: c.digital || c.right_items || [] }
              ]).slice(0, 2).map((col, i) => `
                <article class="compare-panel ${i ? "accent-panel" : "muted-panel"}"><h3>${itemTitle(col)}</h3><ul>${list(col.items || col.competitors)}</ul></article>`).join("")}
            </div>
            ${c.opportunity || c.decision ? `<div class="decision-strip">${esc(c.opportunity || c.decision)}</div>` : ""}
          </div>
        </section>`;

    case "roi_dashboard":
      return `
        <section class="slide roi-slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">PROJECAO DE ROI</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="roi-metrics">
              ${(c.metrics || c.kpis || []).slice(0, 4).map((m) => `<article><span>${esc(m.label || itemTitle(m))}</span><strong>${esc(m.value || m.metric)}</strong></article>`).join("")}
            </div>
            <div class="roi-bars">
              ${(c.scenarios || c.bars || c.assumptions || []).slice(0, 4).map((bar, i) => `<div><span>${itemTitle(bar)}</span><i style="width:${Math.max(4, Math.min(100, Number(bar.percent || 25 + i * 18)))}%"></i><b>${esc(bar.value || bar.amount || "")}</b></div>`).join("")}
            </div>
            ${c.decision || c.insight ? `<div class="decision-strip">${esc(c.decision || c.insight)}</div>` : ""}
          </div>
        </section>`;

    case "proposal_scope_45d":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header compact">
              <p class="eyebrow">ESCOPO 45 DIAS</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="phase-row">
              ${(c.phases || c.timeline || []).slice(0, 3).map((phase) => `<article><h3>${itemTitle(phase)}</h3><p>${itemBody(phase)}</p></article>`).join("")}
            </div>
            <div class="action-grid compact-actions">
              ${(c.deliverables || c.actions || c.items || []).slice(0, 6).map((a, i) => `<article class="action-card"><span>${String(i + 1).padStart(2, "0")}</span><h3>${itemTitle(a)}</h3><p>${itemBody(a)}</p></article>`).join("")}
            </div>
            ${c.decision || c.commitment ? `<div class="decision-strip">${esc(c.decision || c.commitment)}</div>` : ""}
          </div>
        </section>`;

    case "cover":
      return `
        <section class="slide cover">
          <div class="topbar"></div>
          <div class="safe cover-inner">
            <p class="eyebrow">${esc(c.eyebrow)}</p>
            <h1>${esc(c.title)}</h1>
            <p class="subtitle">${esc(c.subtitle)}</p>
            <div class="cover-footer"><span>${esc(c.client)}</span><span>${esc(c.footer)}</span></div>
          </div>
        </section>`;

    case "executive_context":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header">
              <p class="eyebrow">${String(index + 1).padStart(2, "0")}. CONTEXTO</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="two-col">
              <article class="card strong"><h3>${esc(c.left_title)}</h3><ul>${list(c.left_items)}</ul></article>
              <article class="card alert"><h3>${esc(c.right_title)}</h3><ul>${list(c.right_items)}</ul></article>
            </div>
          </div>
        </section>`;

    case "metric_grid":
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header">
              <p class="eyebrow">DADOS VALIDADOS</p>
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.subtitle)}</p>
            </header>
            <div class="metric-grid">
              ${(c.metrics || []).map((m) => `
                <article class="metric">
                  <strong>${esc(m.value)}</strong>
                  <span>${esc(m.label)}</span>
                  <p>${esc(m.caption)}</p>
                </article>`).join("")}
            </div>
          </div>
        </section>`;

    case "big_statement":
      return `
        <section class="slide statement">
          <div class="topbar"></div>
          <div class="statement-inner">
            <h2>${esc(c.statement)}</h2>
            <p>${esc(c.support)}</p>
            <span>${esc(c.attribution)}</span>
          </div>
        </section>`;

    case "closing":
      return `
        <section class="slide closing-slide">
          <div class="topbar"></div>
          <div class="safe cover-inner">
            <p class="eyebrow">${esc(c.eyebrow || "PROXIMO PASSO")}</p>
            <h1>${esc(c.title)}</h1>
            <p class="subtitle">${esc(c.subtitle)}</p>
            <div class="closing-actions">
              ${(c.actions || []).slice(0, 4).map((a) => `<article><h3>${itemTitle(a)}</h3><p>${itemBody(a)}</p></article>`).join("")}
            </div>
            ${c.footer || c.decision ? `<div class="decision-strip">${esc(c.footer || c.decision)}</div>` : ""}
          </div>
        </section>`;

    default:
      return `
        <section class="slide">
          <div class="topbar"></div>
          <div class="safe">
            <header class="slide-header">
              <p class="eyebrow">${esc(slide.layout)}</p>
              <h2>${esc(c.title || slide.id)}</h2>
              <p>${esc(c.subtitle || "")}</p>
            </header>
            <div class="grid">${(c.items || c.pillars || c.steps || []).map((item) => card(item.title || item.label, item.body || item.caption || "")).join("")}</div>
          </div>
        </section>`;
  }
}

const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(ir.deck.client)} - ${esc(ir.deck.title)}</title>
  <style>
    :root { --accent: ${accent}; --bg: #050505; --card: #151515; --line: #343434; --text: #fff; --muted: #c9c9c9; --subtle: #8d8d8d; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #111; color: var(--text); font-family: Montserrat, Arial, Helvetica, sans-serif; }
    .deck { display: grid; gap: 32px; padding: 32px; justify-content: center; }
    .slide { width: 1280px; height: 720px; position: relative; overflow: hidden; background:
      radial-gradient(circle at 92% 7%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 22%),
      linear-gradient(135deg, #050505 0%, #0d0d0d 62%, #050505 100%); }
    .safe { position: absolute; inset: 64px; }
    .topbar { position: absolute; left: 0; top: 0; width: 100%; height: 8px; background: var(--accent); }
    .eyebrow { margin: 0 0 12px; color: var(--accent); font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
    h1, h2, h3, p { margin: 0; }
    h1 { max-width: 920px; font-size: 72px; line-height: 0.96; font-weight: 850; }
    h2 { max-width: 980px; font-size: 42px; line-height: 1.05; font-weight: 800; }
    h3 { font-size: 21px; line-height: 1.12; font-weight: 800; }
    .subtitle, .slide-header p:not(.eyebrow) { max-width: 900px; color: var(--muted); font-size: 20px; line-height: 1.45; margin-top: 14px; }
    .cover-inner { display: flex; flex-direction: column; justify-content: center; }
    .cover h1 { text-transform: uppercase; }
    .cinematic-cover { background:
      radial-gradient(circle at 78% 40%, color-mix(in srgb, var(--accent) 46%, transparent), transparent 19%),
      linear-gradient(118deg, #020202 0%, #080808 42%, color-mix(in srgb, var(--accent) 32%, #090909) 100%); }
    .speed-field { position: absolute; inset: -10%; opacity: .9; background:
      repeating-linear-gradient(116deg, transparent 0 36px, rgba(255,255,255,.08) 37px 39px, transparent 40px 84px),
      linear-gradient(90deg, rgba(0,0,0,.9), transparent 55%, rgba(255,255,255,.08)); transform: skewX(-12deg); }
    .cinematic-inner { display: flex; flex-direction: column; justify-content: center; text-shadow: 0 18px 46px rgba(0,0,0,.65); }
    .cinematic-cover h1 { max-width: 1040px; font-size: 86px; letter-spacing: -3px; text-transform: uppercase; }
    .cover-footer { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; color: var(--subtle); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .slide-header { margin-bottom: 34px; }
    .slide-header.compact { margin-bottom: 24px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; height: 420px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .card, .metric { background: color-mix(in srgb, var(--card) 88%, var(--accent)); border: 1px solid var(--line); border-top: 5px solid var(--accent); border-radius: 8px; padding: 24px; }
    .card ul { margin: 22px 0 0; padding: 0; list-style: none; display: grid; gap: 16px; }
    .card li { color: var(--muted); font-size: 18px; line-height: 1.35; padding-left: 22px; position: relative; }
    .card li:before { content: ""; position: absolute; left: 0; top: 0.62em; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
    .evidence-grid { display: grid; grid-template-columns: .9fr 1.55fr; gap: 26px; align-items: stretch; }
    .diagnosis-card { min-height: 420px; background: rgba(16,16,16,.9); border: 1px solid var(--line); border-left: 7px solid var(--accent); border-radius: 12px; padding: 28px; }
    .diagnosis-card strong { display: block; font-size: 30px; line-height: 1.05; margin-bottom: 24px; }
    .diagnosis-card ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 16px; }
    .diagnosis-card li { color: var(--muted); font-size: 17px; line-height: 1.35; }
    .evidence-shots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: end; }
    .phone-shot { min-height: 360px; border-radius: 24px; background: linear-gradient(180deg, #f7f7f7, #d9d9d9); color: #101010; padding: 22px; box-shadow: 0 22px 60px rgba(0,0,0,.42); display: flex; flex-direction: column; justify-content: space-between; transform: rotate(-1deg); }
    .phone-shot:nth-child(2) { transform: rotate(1.5deg) translateY(-18px); }
    .phone-shot span { color: var(--accent); font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .phone-shot p { font-size: 19px; line-height: 1.22; font-weight: 800; }
    .phone-shot small { color: #555; font-size: 12px; line-height: 1.25; }
    .pipeline-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 28px; }
    .pipeline-step { position: relative; min-height: 245px; background: color-mix(in srgb, var(--card) 90%, var(--accent)); border: 1px solid var(--line); border-radius: 12px; padding: 24px; }
    .pipeline-step:after { content: ""; position: absolute; right: -15px; top: 50%; width: 28px; height: 2px; background: var(--accent); opacity: .75; }
    .pipeline-step:last-child:after { display: none; }
    .pipeline-step span, .action-card span { color: var(--accent); font-size: 13px; font-weight: 900; letter-spacing: 1px; }
    .pipeline-step h3, .matrix-card h3, .action-card h3 { margin-top: 14px; }
    .pipeline-step p, .matrix-card p, .action-card p, .outcome p { margin-top: 13px; color: var(--muted); font-size: 15.5px; line-height: 1.35; }
    .outcome-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
    .outcome { border-radius: 12px; padding: 18px 22px; border: 1px solid var(--line); background: rgba(18,18,18,.88); }
    .outcome.win { border-left: 7px solid #21c26b; }
    .outcome.loss { border-left: 7px solid var(--accent); }
    .matrix-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px; }
    .matrix-card { min-height: 310px; background: rgba(18,18,18,.9); border: 1px solid var(--line); border-top: 5px solid #4d4d4d; border-radius: 12px; padding: 24px; }
    .matrix-card.highlight { background: color-mix(in srgb, var(--accent) 28%, #151515); border-top-color: var(--accent); }
    .matrix-card span { color: var(--subtle); font-size: 12px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
    .decision-strip { margin-top: 18px; border-radius: 12px; padding: 16px 22px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.13); color: var(--text); font-size: 18px; font-weight: 800; }
    .action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 22px; }
    .action-card { min-height: 150px; background: rgba(18,18,18,.9); border: 1px solid var(--line); border-radius: 12px; padding: 20px; }
    .section-slide { display: grid; place-items: center; }
    .section-inner { display: flex; flex-direction: column; justify-content: center; }
    .section-inner:after { content: ""; width: 420px; height: 5px; margin-top: 36px; background: var(--accent); }
    .section-inner strong { color: var(--accent); font-size: 46px; line-height: 1; }
    .section-inner h2 { margin-top: 28px; max-width: 990px; font-size: 64px; letter-spacing: -2px; }
    .section-inner p { margin-top: 24px; max-width: 840px; color: var(--muted); font-size: 21px; line-height: 1.4; }
    .agenda-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 18px; }
    .agenda-grid article { min-height: 112px; border-radius: 14px; background: rgba(18,18,18,.92); border: 1px solid var(--line); border-top: 5px solid var(--accent); padding: 18px; }
    .agenda-grid span { color: var(--accent); font-size: 12px; font-weight: 900; letter-spacing: 1px; }
    .agenda-grid h3 { margin-top: 8px; font-size: 17px; }
    .agenda-grid p { margin-top: 8px; color: var(--muted); font-size: 12.5px; line-height: 1.25; }
    .pillar-row { display: grid; gap: 16px; margin-top: 22px; }
    .pillar-row.four_pillars { grid-template-columns: repeat(4, 1fr); }
    .pillar-row.three_pillars { grid-template-columns: repeat(3, 1fr); }
    .pillar-card { min-height: 335px; background: rgba(18,18,18,.92); border: 1px solid var(--line); border-top: 6px solid var(--accent); border-radius: 15px; padding: 22px; }
    .pillar-card span, .bento-card span, .campaign-card small, .pipeline-step small, .timeline-card small { color: var(--accent); font-size: 12px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
    .pillar-card h3 { margin-top: 18px; }
    .pillar-card p { margin-top: 18px; color: var(--muted); font-size: 15.5px; line-height: 1.36; }
    .pillar-card small { display: block; margin-top: 24px; color: var(--subtle); font-weight: 800; }
    .bento-grid { display: grid; grid-template-columns: 1.2fr 1fr 1.35fr; gap: 16px; margin-top: 22px; }
    .bento-card { min-height: 142px; background: rgba(18,18,18,.92); border: 1px solid var(--line); border-top: 5px solid var(--accent); border-radius: 15px; padding: 20px; }
    .bento-card.featured { background: color-mix(in srgb, var(--accent) 20%, #151515); }
    .bento-card h3 { margin-top: 10px; font-size: 18px; }
    .bento-card p { margin-top: 10px; color: var(--muted); font-size: 14px; line-height: 1.32; }
    .compare-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 22px; }
    .compare-panel { min-height: 345px; border-radius: 16px; padding: 26px; background: rgba(18,18,18,.92); border: 1px solid var(--line); border-top: 6px solid #666; }
    .compare-panel.accent-panel { background: color-mix(in srgb, var(--accent) 18%, #151515); border-top-color: var(--accent); }
    .compare-panel h3 { margin-bottom: 22px; }
    .compare-panel ul, .calendar-grid ul, .routine-card ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 12px; }
    .compare-panel li, .calendar-grid li, .routine-card li { color: var(--muted); font-size: 15px; line-height: 1.32; padding-left: 18px; position: relative; }
    .compare-panel li:before, .calendar-grid li:before, .routine-card li:before { content: ""; position: absolute; left: 0; top: .55em; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }
    .strategy-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-top: 24px; }
    .strategy-card, .campaign-card, .timeline-card { min-height: 300px; border-radius: 14px; background: rgba(18,18,18,.92); border: 1px solid var(--line); border-top: 5px solid var(--accent); padding: 22px; position: relative; }
    .strategy-card:after { content: ""; position: absolute; right: -13px; top: 50%; width: 24px; height: 2px; background: var(--accent); opacity: .75; }
    .strategy-card:last-child:after { display: none; }
    .strategy-card h3, .campaign-card h3, .timeline-card h3 { margin-top: 16px; font-size: 21px; }
    .strategy-card p, .campaign-card p, .timeline-card p { margin-top: 16px; color: var(--muted); font-size: 16px; line-height: 1.38; }
    .strategy-card small { position: absolute; left: 22px; right: 22px; bottom: 22px; color: var(--subtle); font-size: 13px; font-weight: 800; }
    .campaign-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 22px; }
    .campaign-card { min-height: 124px; }
    .campaign-card h3 { margin-top: 0; font-size: 16px; }
    .campaign-card small { display: block; margin-top: 12px; color: var(--subtle); }
    .pipeline-row.dense { grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 10px; }
    .pipeline-row.dense .pipeline-step { min-height: 305px; padding: 18px; }
    .pipeline-row.dense .pipeline-step h3 { font-size: 15px; }
    .pipeline-row.dense .pipeline-step p { font-size: 12.5px; }
    .drawflow-board { position: relative; height: 330px; margin-top: 14px; border-radius: 18px; border: 1px solid rgba(255,255,255,.11); background: radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 50%); }
    .flow-node { position: absolute; left: var(--x); top: var(--y); width: 230px; min-height: 76px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--line)); border-top: 5px solid var(--accent); background: rgba(18,18,18,.94); padding: 12px; }
    .flow-node span { color: var(--accent); font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
    .flow-node h3 { margin-top: 6px; font-size: 13px; }
    .flow-node p { margin-top: 6px; color: var(--muted); font-size: 11px; line-height: 1.25; }
    .flow-edge { position: absolute; left: 8%; right: 8%; top: 50%; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: .26; }
    .timeline-row { position: relative; display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-top: 72px; }
    .timeline-row:before { content: ""; position: absolute; left: 0; right: 0; top: -30px; height: 2px; background: var(--accent); }
    .timeline-card { min-height: 250px; }
    .market-grid { display: grid; grid-template-columns: .9fr 1.25fr; gap: 36px; align-items: center; margin-top: 10px; }
    .scope-orbit { position: relative; height: 360px; }
    .scope-orbit:before, .scope-orbit:after { content: ""; position: absolute; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--accent) 48%, var(--line)); background: color-mix(in srgb, var(--accent) 12%, transparent); }
    .scope-orbit:before { width: 330px; height: 330px; left: 40px; top: 16px; }
    .scope-orbit:after { width: 220px; height: 220px; left: 96px; top: 72px; background: color-mix(in srgb, var(--accent) 22%, transparent); }
    .scope-orbit b { position: absolute; z-index: 2; color: var(--text); font-size: 18px; }
    .scope-0 { left: 72px; top: 52px; } .scope-1 { left: 136px; top: 134px; } .scope-2 { left: 176px; top: 204px; color: var(--accent) !important; }
    .scope-cards { display: grid; gap: 14px; }
    .scope-cards article, .roi-metrics article, .phase-row article { border-radius: 14px; background: rgba(18,18,18,.92); border: 1px solid var(--line); border-left: 6px solid var(--accent); padding: 18px; }
    .scope-cards span, .roi-metrics span { color: var(--subtle); font-size: 12px; font-weight: 900; text-transform: uppercase; }
    .scope-cards strong, .roi-metrics strong { display: block; margin-top: 8px; font-size: 27px; }
    .scope-cards p { margin-top: 7px; color: var(--muted); font-size: 13px; line-height: 1.3; }
    .calendar-layout { display: grid; grid-template-columns: 1fr 250px; gap: 18px; margin-top: 16px; }
    .calendar-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
    .calendar-grid article, .routine-card { min-height: 300px; border-radius: 14px; background: rgba(18,18,18,.92); border: 1px solid var(--line); border-top: 5px solid var(--accent); padding: 16px; }
    .calendar-grid h3, .routine-card h3 { margin-bottom: 16px; font-size: 16px; }
    .roi-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 18px; }
    .roi-bars { display: grid; gap: 17px; margin-top: 40px; }
    .roi-bars div { display: grid; grid-template-columns: 220px 1fr 120px; gap: 18px; align-items: center; }
    .roi-bars span, .roi-bars b { font-size: 14px; font-weight: 800; }
    .roi-bars i { height: 16px; border-radius: 999px; background: linear-gradient(90deg, var(--accent), #ffb000); }
    .phase-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 8px; }
    .phase-row h3 { font-size: 18px; }
    .phase-row p { margin-top: 8px; color: var(--muted); font-size: 13px; }
    .compact-actions { margin-top: 16px; }
    .compact-actions .action-card { min-height: 105px; padding: 16px; }
    .closing-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 52px; }
    .closing-actions article { min-height: 112px; border-radius: 14px; border: 1px solid var(--line); border-top: 5px solid var(--accent); background: rgba(18,18,18,.9); padding: 18px; }
    .closing-actions p { margin-top: 10px; color: var(--muted); font-size: 13px; line-height: 1.3; }
    .budget-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 20px; }
    .budget-scenario { min-height: 365px; border: 1px solid var(--line); border-radius: 18px; background: rgba(18,18,18,.9); padding: 24px; }
    .budget-scenario.featured { background: color-mix(in srgb, var(--accent) 24%, #141414); border-color: color-mix(in srgb, var(--accent) 55%, var(--line)); }
    .scenario-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 18px; }
    .scenario-head span, .allocation-title span { color: var(--subtle); font-size: 13px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
    .scenario-head strong { color: var(--text); font-size: 46px; line-height: 1; letter-spacing: -1px; }
    .scenario-role { margin-top: 10px; color: var(--muted); font-size: 16px; line-height: 1.35; }
    .channel-split { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 22px; }
    .channel-card { border-radius: 14px; padding: 16px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); }
    .channel-card.meta { border-top: 5px solid #2f7cff; }
    .channel-card.google { border-top: 5px solid #ffb000; }
    .channel-card span { display: block; color: var(--subtle); font-size: 12px; font-weight: 900; text-transform: uppercase; }
    .channel-card strong { display: block; margin-top: 7px; font-size: 28px; }
    .channel-card small { display: block; margin-top: 8px; color: var(--muted); font-size: 12px; line-height: 1.25; }
    .budget-scenario ul { list-style: none; padding: 0; margin: 22px 0 0; display: grid; gap: 10px; }
    .budget-scenario li { color: var(--muted); font-size: 15px; line-height: 1.28; padding-left: 18px; position: relative; }
    .budget-scenario li:before { content: ""; position: absolute; left: 0; top: .55em; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }
    .allocation-board { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 26px; }
    .allocation-panel { min-height: 410px; border-radius: 18px; background: rgba(18,18,18,.9); border: 1px solid var(--line); padding: 26px; }
    .allocation-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .allocation-title strong { font-size: 30px; }
    .bar-row { margin-bottom: 24px; }
    .bar-copy { display: flex; justify-content: space-between; color: var(--text); font-size: 15px; font-weight: 800; margin-bottom: 9px; }
    .bar-copy span { color: var(--muted); }
    .bar-track { height: 18px; border-radius: 999px; background: rgba(255,255,255,.08); overflow: hidden; border: 1px solid rgba(255,255,255,.1); }
    .bar-track i { display: block; height: 100%; border-radius: 999px; }
    .bar-track i.meta { background: linear-gradient(90deg, #145eff, #59b8ff); }
    .bar-track i.google { background: linear-gradient(90deg, #ff7a00, #ffd45a); }
    .bar-row p { margin-top: 8px; color: var(--subtle); font-size: 13px; line-height: 1.3; }
    .allocation-note { margin-top: 14px; padding: 15px 17px; border-radius: 12px; background: rgba(255,255,255,.07); color: var(--muted); font-size: 15px; line-height: 1.35; }
    .funnel-stack { display: grid; grid-template-columns: .85fr 1fr 1fr .85fr; gap: 14px; margin-top: 26px; align-items: stretch; }
    .funnel-stage { min-height: 320px; border-radius: 16px; background: rgba(18,18,18,.92); border: 1px solid var(--line); padding: 22px; position: relative; overflow: hidden; }
    .funnel-stage:before { content: ""; position: absolute; left: 0; top: 0; width: 100%; height: 7px; background: var(--accent); opacity: .85; }
    .funnel-stage:nth-child(1), .funnel-stage:nth-child(4) { transform: translateY(32px); }
    .funnel-stage span { color: var(--accent); font-size: 13px; font-weight: 900; letter-spacing: 1px; }
    .funnel-stage h3 { margin-top: 16px; font-size: 24px; }
    .funnel-stage p { margin-top: 18px; color: var(--muted); font-size: 16px; line-height: 1.38; }
    .funnel-stage div { position: absolute; left: 22px; right: 22px; bottom: 22px; display: flex; justify-content: space-between; gap: 14px; align-items: end; }
    .funnel-stage b { color: var(--text); font-size: 15px; }
    .funnel-stage small { color: var(--subtle); font-size: 12px; text-align: right; line-height: 1.2; }
    .strong { border-top-color: #21c26b; }
    .alert { border-top-color: var(--accent); }
    .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .metric { min-height: 280px; display: flex; flex-direction: column; justify-content: center; }
    .metric strong { color: var(--accent); font-size: 58px; line-height: 1; font-weight: 850; }
    .metric span { margin-top: 18px; color: var(--text); font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .metric p { margin-top: 14px; color: var(--muted); font-size: 16px; line-height: 1.45; }
    .statement { display: grid; place-items: center; text-align: center; }
    .statement-inner { max-width: 980px; }
    .statement h2 { max-width: none; font-size: 70px; }
    .statement p { margin-top: 22px; color: var(--muted); font-size: 27px; line-height: 1.32; }
    .statement span { display: inline-block; margin-top: 38px; color: var(--accent); font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
    @media print { body { background: #000; } .deck { padding: 0; gap: 0; } .slide { break-after: page; } }
  </style>
</head>
<body>
  <main class="deck">
    ${ir.slides.map(renderSlide).join("\n")}
  </main>
</body>
</html>`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html, "utf8");
console.log(`HTML generated: ${output}`);
