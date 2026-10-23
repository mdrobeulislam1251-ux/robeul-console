// One continuous animation of the full data motion: ICP → scrape engine → parallel jobs →
// live data preview (verify, dedupe, enrich) → delivery → campaign → meeting booked.
// Pure SVG + SMIL so the same markup runs inline in the console and as an <img> on GitHub.
// Colours read the console's CSS variables when inline, and fall back to the light theme.
import { siGooglemaps, siHubspot } from "simple-icons";

export type MotionOptions = {
  /** Prefix for ids, so two copies can live on one page. */
  id: string;
  /** Resolves a public asset path like "./logos/apollo.png" to a usable href. */
  asset: (path: string) => string;
  /** Draw its own card frame (for use as a standalone image). */
  framed?: boolean;
};

const DUR = 14; // seconds for one full pass
const W = 1160;
const H = 500;
const END = 0.975;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const width = (s: string, fs: number, bold = false) => s.length * fs * (bold ? 0.58 : 0.54);
const f = (n: number) => +n.toFixed(4);

const anim = (attr: string, values: (string | number)[], times: number[]) =>
  `<animate attributeName="${attr}" dur="${DUR}s" repeatCount="indefinite" calcMode="linear" values="${values.join(";")}" keyTimes="${times.map(f).join(";")}"/>`;

/** Fade in at `a`, hold, fade out at `b`. */
const show = (a: number, b = END, e = 0.012) => anim("opacity", [0, 0, 1, 1, 0, 0], [0, a, a + e, b, Math.min(b + e, 0.999), 1]);

const txt = (x: number, y: number, s: string, cls: string, fs: number, extra = "") =>
  `<text x="${x}" y="${y}" class="${cls}" font-size="${fs}"${extra}>${esc(s)}</text>`;

const pill = (x: number, y: number, label: string, tone: "ok" | "warn" | "bad" | "mute" | "accent", fs = 9.5, anchorRight = false) => {
  const w = Math.round(width(label, fs, true) + 14);
  const px = anchorRight ? x - w : x;
  return `<rect x="${px}" y="${y}" width="${w}" height="${fs + 8}" rx="${(fs + 8) / 2}" class="pm-${tone}-bg"/>` +
    txt(px + w / 2, y + fs + 1.6, label, `pm-${tone} pm-b`, fs, ` text-anchor="middle"`);
};

const icon = (path: string, hex: string, x: number, y: number, s: number) =>
  `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="#${hex}" d="${path}"/></svg>`;

const globe = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s / 24})" fill="none" stroke="#3451e0" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></g>`;

const mono = (label: string, x: number, y: number, s: number, color: string) =>
  `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.22}" fill="${color}"/>` +
  `<text x="${x + s / 2}" y="${y + s * 0.7}" font-size="${s * 0.5}" fill="#fff" font-weight="700" text-anchor="middle">${label}</text>`;

const STAGES: [string, number, number][] = [
  ["ICP", 0.005, 0.14],
  ["Scrape", 0.14, 0.31],
  ["Verify", 0.31, 0.47],
  ["Dedupe", 0.47, 0.56],
  ["Enrich", 0.56, 0.66],
  ["Deliver", 0.66, 0.76],
  ["Campaign", 0.76, END],
];

type Row = { name: string; role: string; status: "Verified" | "Catch-all" | "Invalid"; dup?: boolean; dm?: boolean };
const ROWS: Row[] = [
  { name: "Nadia Rahman", role: "VP Sales · Brightline", status: "Verified", dm: true },
  { name: "Owen Clarke", role: "Founder · Harborpoint", status: "Verified", dm: true },
  { name: "Leah Morgan", role: "Ops Lead · Northgate", status: "Catch-all" },
  { name: "Sam Patel", role: "CTO · Kitewell", status: "Invalid" },
  { name: "Mia Torres", role: "Head of RevOps · Lumora", status: "Verified", dm: true },
  { name: "Owen Clarke", role: "Founder · Harborpoint", status: "Verified", dup: true },
  { name: "Ravi Shah", role: "COO · Fjordline", status: "Verified", dm: true },
];

export const pipelineMotionSvg = ({ id, asset, framed = false }: MotionOptions) => {
  const P = (s: string) => `${id}-${s}`;
  let b = framed ? `<rect x=".5" y="-11.5" width="${W - 1}" height="${H + 23}" rx="16" class="pm-panel pm-stroke"/>` : "";

  // ---------- stage rail ----------
  const railY = 22;
  const chipW = STAGES.map(([l]) => Math.round(width(l, 12, true) + 30));
  const step = (W - 80) / (STAGES.length - 1);
  b += `<line x1="40" y1="${railY + 14}" x2="${W - 40}" y2="${railY + 14}" class="pm-line" stroke-width="1.5"/>`;
  b += `<line x1="40" y1="${railY + 14}" x2="${W - 40}" y2="${railY + 14}" stroke="url(#${P("brand")})" stroke-width="2" stroke-dasharray="${W}" stroke-dashoffset="${W}">` +
    anim("stroke-dashoffset", [W, W, 0, 0, W], [0, 0.005, 0.96, END, 1]) + `</line>`;
  STAGES.forEach(([label, a, z], i) => {
    const cx = 40 + i * step;
    const w = chipW[i];
    const x = Math.min(Math.max(cx - w / 2, 8), W - 8 - w);
    b += `<rect x="${x}" y="${railY}" width="${w}" height="28" rx="14" class="pm-panel pm-stroke"/>`;
    b += txt(x + w / 2, railY + 18.5, label, "pm-muted pm-b", 12, ` text-anchor="middle"`);
    b += `<g opacity="0">${show(a, z, 0.008)}<rect x="${x}" y="${railY}" width="${w}" height="28" rx="14" fill="url(#${P("brand")})"/>` +
      txt(x + w / 2, railY + 18.5, label, "pm-white pm-b", 12, ` text-anchor="middle"`) + `</g>`;
  });

  // ---------- column labels ----------
  ([["Sources", 20], ["Scrape engine", 258], ["Parallel jobs", 380], ["Data preview", 580], ["Deliver", 920]] as [string, number][]).forEach(
    ([l, x]) => (b += txt(x, 92, l, "pm-muted", 11.5)),
  );

  // ---------- sources ----------
  const sources: [string, string][] = [["Apollo", "apollo"], ["Google Maps", "maps"], ["LinkedIn", "in"], ["Company sites", "web"]];
  sources.forEach(([label, kind], i) => {
    const y = 106 + i * 54;
    b += `<rect x="20" y="${y}" width="150" height="42" rx="10" class="pm-panel pm-stroke" filter="url(#${P("sh2")})"/>`;
    if (kind === "apollo") b += `<image href="${asset("./logos/apollo.png")}" x="32" y="${y + 10}" width="22" height="22"/>`;
    if (kind === "maps") b += icon(siGooglemaps.path, siGooglemaps.hex, 32, y + 10, 22);
    if (kind === "in") b += mono("in", 32, y + 10, 22, "#0A66C2");
    if (kind === "web") b += globe(32, y + 10, 22);
    b += txt(64, y + 25.5, label, "pm-ink pm-b", 12.5);
  });

  // ICP filter card
  b += `<rect x="20" y="334" width="320" height="96" rx="12" class="pm-panel pm-stroke" filter="url(#${P("sh2")})"/>`;
  b += txt(36, 358, "ICP filter", "pm-ink pm-b", 12.5) + txt(324, 358, "from your brief", "pm-muted", 10, ` text-anchor="end"`);
  let cx = 36;
  ["VP Sales", "SaaS", "11–200 staff", "United States"].forEach((c, i) => {
    const w = Math.round(width(c, 10.5) + 18);
    const x = i < 3 ? cx : 36;
    const y = i < 3 ? 372 : 400;
    b += `<g opacity="0">${show(0.01 + i * 0.025)}<rect x="${x}" y="${y}" width="${w}" height="22" rx="11" class="pm-panel pm-stroke"/>` +
      txt(x + w / 2, y + 15, c, "pm-body", 10.5, ` text-anchor="middle"`) + `</g>`;
    cx += w + 6;
  });

  // ---------- engine ----------
  const ex = 258,
    ey = 184;
  const srcPaths = [127, 181, 235, 289].map((y) => `M170 ${y} C214 ${y} 214 226 ${ex} 226`);
  const icpPath = `M300 334 C300 310 300 290 300 ${ey + 84}`;
  [...srcPaths, icpPath].forEach((d) => (b += `<path d="${d}" fill="none" class="pm-line" stroke-width="1.5"/>`));
  b += `<g opacity="0">${show(0.12, 0.34)}<circle cx="300" cy="226" r="54" fill="url(#${P("glow")})"/></g>`;
  b += `<rect x="${ex}" y="${ey}" width="84" height="84" rx="20" fill="url(#${P("engine")})" filter="url(#${P("sh")})"/>`;
  b += `<g transform="translate(${ex + 22} ${ey + 22}) scale(1.67)"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" fill="url(#${P("brand")})" fill-opacity=".18" stroke="url(#${P("brand")})" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 7.5 12 12l8-4.5M12 12v9" fill="none" stroke="url(#${P("brand")})" stroke-width="1.6" stroke-linejoin="round"/></g>`;
  b += `<g opacity="0">${show(0.14, 0.31)}<rect x="${ex - 3}" y="${ey - 3}" width="90" height="90" rx="23" fill="none" stroke="#3451e0" stroke-width="1.5">` +
    `<animate attributeName="stroke-opacity" values=".8;.1;.8" dur="1.2s" repeatCount="indefinite"/></rect></g>`;

  // ---------- parallel jobs ----------
  const lanes: [number, string, number, number][] = [
    [168, "Job 1 · 2,400 rows", 0.15, 0.27],
    [226, "Job 2 · 2,400 rows", 0.16, 0.3],
    [284, "Job 3 · 1,900 rows", 0.17, 0.25],
  ];
  lanes.forEach(([ly, label, a, z]) => {
    b += `<path d="M342 226 C362 226 360 ${ly} 380 ${ly}" fill="none" class="pm-line" stroke-width="1.5"/>`;
    b += `<path d="M540 ${ly} C560 ${ly} 560 226 580 226" fill="none" class="pm-line" stroke-width="1.5"/>`;
    b += `<rect x="380" y="${ly - 21}" width="160" height="42" rx="10" class="pm-panel pm-stroke" filter="url(#${P("sh2")})"/>`;
    b += txt(392, ly - 3, label, "pm-ink pm-b", 10.5);
    b += `<rect x="392" y="${ly + 7}" width="136" height="5" rx="2.5" class="pm-track"/>`;
    b += `<rect x="392" y="${ly + 7}" width="0" height="5" rx="2.5" fill="url(#${P("brand")})">${anim("width", [0, 0, 136, 136, 0], [0, a, z, END, 1])}</rect>`;
    b += `<g opacity="0">${show(z)}<circle cx="528" cy="${ly - 7}" r="5" class="pm-ok-bg"/><path d="M525.5 ${ly - 7} l2 2 l3.5 -3.5" fill="none" class="pm-ok-stroke" stroke-width="1.5"/></g>`;
  });

  // ---------- data preview ----------
  const tx = 580,
    ty = 100,
    tw = 300,
    rowH = 38;
  b += `<rect x="${tx}" y="${ty}" width="${tw}" height="370" rx="12" class="pm-panel pm-stroke" filter="url(#${P("sh")})"/>`;
  b += `<path d="M${tx} ${ty + 12} a12 12 0 0 1 12 -12 h${tw - 24} a12 12 0 0 1 12 12 v24 h-${tw} z" class="pm-bg2"/>`;
  b += `<line x1="${tx}" y1="${ty + 36}" x2="${tx + tw}" y2="${ty + 36}" class="pm-line"/>`;
  b += txt(tx + 14, ty + 23, "People", "pm-ink pm-b", 12.5) + txt(tx + tw - 14, ty + 23, "example data", "pm-muted pm-mono", 10, ` text-anchor="end"`);
  b += txt(tx + 14, ty + 54, "Contact", "pm-muted", 10) + txt(tx + tw - 14, ty + 54, "Email", "pm-muted", 10, ` text-anchor="end"`);
  ROWS.forEach((r, i) => {
    const y = ty + 64 + i * rowH;
    const appear = 0.165 + i * 0.02;
    const verify = 0.315 + i * 0.021;
    const removed = r.status === "Invalid" || r.dup;
    const initials = r.name.split(" ").map((p) => p[0]).join("");
    b += `<g opacity="0">${show(appear)}`;
    if (removed) b += `<g>${anim("opacity", [1, 1, 0.38, 0.38, 1], [0, 0.49, 0.52, END, 1])}`;
    b += `<line x1="${tx}" y1="${y}" x2="${tx + tw}" y2="${y}" class="pm-line2"/>`;
    b += `<circle cx="${tx + 26}" cy="${y + 19}" r="11" class="pm-track"/>` + txt(tx + 26, y + 22.5, initials, "pm-body pm-b", 9, ` text-anchor="middle"`);
    b += txt(tx + 44, y + 16, r.name, "pm-ink pm-b", 11.5) + txt(tx + 44, y + 29.5, r.role, "pm-muted", 9.5);
    // status: checking → result (→ duplicate)
    b += `<g opacity="0">${show(appear + 0.004, verify)}${pill(tx + tw - 14, y + 11, "checking…", "mute", 9, true)}</g>`;
    const tone = r.status === "Verified" ? "ok" : r.status === "Catch-all" ? "warn" : "bad";
    b += `<g opacity="0">${show(verify, r.dup ? 0.5 : END)}${pill(tx + tw - 14, y + 11, r.status, tone, 9, true)}</g>`;
    if (r.dup) b += `<g opacity="0">${show(0.5)}${pill(tx + tw - 14, y + 11, "Duplicate", "mute", 9, true)}</g>`;
    if (r.dm) b += `<g opacity="0">${show(0.575 + i * 0.008)}${pill(tx + 186, y + 11, "+ DM", "accent", 9)}</g>`;
    if (removed)
      b += `<line x1="${tx + 44}" y1="${y + 12}" x2="${tx + 44}" y2="${y + 12}" class="pm-bad-stroke" stroke-width="1.2">${anim("x2", [tx + 44, tx + 44, tx + 160, tx + 160, tx + 44], [0, 0.49, 0.53, END, 1])}</line>`;
    if (removed) b += `</g>`;
    b += `</g>`;
  });
  const fy = ty + 64 + ROWS.length * rowH;
  b += `<line x1="${tx}" y1="${fy}" x2="${tx + tw}" y2="${fy}" class="pm-line"/>`;
  b += `<g opacity="0">${show(0.17, 0.47)}` + txt(tx + 14, fy + 25, "Scraping 6,700 rows across 3 jobs…", "pm-body", 10.5) + `</g>`;
  b += `<g opacity="0">${show(0.47, 0.575)}` + txt(tx + 14, fy + 25, "4 verified · 1 catch-all · 2 removed", "pm-body", 10.5) + `</g>`;
  b += `<g opacity="0">${show(0.575)}` + txt(tx + 14, fy + 25, "4 decision-makers · source kept on every row", "pm-body", 10.5) + `</g>`;

  // ---------- deliver ----------
  const dest: [string, number, number][] = [["Smartlead", 920, 104], ["Instantly", 1034, 104], ["HubSpot", 920, 152], ["Outboundrix", 1034, 152]];
  b += `<path d="M880 190 C900 190 900 125 920 125" fill="none" class="pm-line" stroke-width="1.5"/>`;
  b += `<path d="M880 190 C900 190 900 173 920 173" fill="none" class="pm-line" stroke-width="1.5"/>`;
  dest.forEach(([name, x, y], i) => {
    b += `<rect x="${x}" y="${y}" width="106" height="42" rx="10" class="pm-panel pm-stroke" filter="url(#${P("sh2")})"/>`;
    if (name === "HubSpot") b += icon(siHubspot.path, siHubspot.hex, x + 10, y + 12, 18);
    else b += `<image href="${asset(`./logos/${name === "Outboundrix" ? "outboundrix-192" : name.toLowerCase()}.png`)}" x="${x + 10}" y="${y + 12}" width="18" height="18"/>`;
    b += txt(x + 34, y + 25.5, name, "pm-ink pm-b", 11);
    b += `<g opacity="0">${show(0.68 + i * 0.018)}<circle cx="${x + 100}" cy="${y + 6}" r="7" class="pm-ok-solid"/><path d="M${x + 96.8} ${y + 6} l2.2 2.2 l4 -4" fill="none" stroke="#fff" stroke-width="1.6"/></g>`;
  });

  // ---------- campaign ----------
  const kx = 920,
    ky = 210,
    kw = 220;
  b += `<rect x="${kx}" y="${ky}" width="${kw}" height="260" rx="12" class="pm-panel pm-stroke" filter="url(#${P("sh")})"/>`;
  b += `<path d="M${kx} ${ky + 12} a12 12 0 0 1 12 -12 h${kw - 24} a12 12 0 0 1 12 12 v22 h-${kw} z" class="pm-bg2"/>`;
  b += `<line x1="${kx}" y1="${ky + 34}" x2="${kx + kw}" y2="${ky + 34}" class="pm-line"/>`;
  b += txt(kx + 14, ky + 22, "Campaign", "pm-ink pm-b", 12.5) + txt(kx + kw - 14, ky + 22, "4 steps", "pm-muted pm-mono", 10, ` text-anchor="end"`);
  const steps: [string, string, string][] = [["Intro", "Personalised opener", "Day 0"], ["Follow-up", "Same thread", "Day 3"], ["Case for change", "A/B: 2 variants", "Day 7"], ["Breakup", "Stops on reply", "Day 12"]];
  b += `<line x1="${kx + 24}" y1="${ky + 56}" x2="${kx + 24}" y2="${ky + 56 + 3 * 38}" class="pm-line" stroke-width="1.5"/>`;
  steps.forEach(([t, s, d], i) => {
    const y = ky + 56 + i * 38;
    b += `<circle cx="${kx + 24}" cy="${y}" r="10" class="pm-accent-bg"/>` + txt(kx + 24, y + 3.5, String(i + 1), "pm-accent pm-b pm-mono", 9.5, ` text-anchor="middle"`);
    b += txt(kx + 42, y - 1, t, "pm-ink pm-b", 11) + txt(kx + 42, y + 12, s, "pm-muted", 9.5);
    b += txt(kx + kw - 14, y + 3, d, "pm-muted pm-mono", 9.5, ` text-anchor="end"`);
  });
  const sendTimes = [0, 0.78, 0.82, 0.86, 0.9, 0.94, 0.98, 1];
  b += `<g opacity="0">${show(0.775, 0.955)}<circle cx="${kx + 24}" cy="${ky + 56}" r="5" fill="url(#${P("brand")})">` +
    anim("cy", [ky + 56, ky + 56, ky + 56, ky + 94, ky + 132, ky + 170, ky + 170, ky + 56], sendTimes) + `</circle></g>`;
  const stats: [string, string][] = [["Sent", "1,180"], ["Opened", "54%"], ["Replied", "6.1%"], ["Meetings", "9"]];
  const sw = (kw - 28) / 4;
  b += `<line x1="${kx}" y1="${ky + 210}" x2="${kx + kw}" y2="${ky + 210}" class="pm-line"/>`;
  stats.forEach(([l, v], i) => {
    const x = kx + 14 + i * sw;
    b += txt(x, ky + 228, l, "pm-muted", 9);
    b += `<g opacity="0">${show(0.8 + i * 0.03)}` + txt(x, ky + 247, v, "pm-ink pm-b", 14) + `</g>`;
  });

  // ---------- the payoff: a reply becomes a meeting ----------
  const mx = 360,
    my = 352;
  b += `<path d="M${kx} ${ky + 236} C820 ${ky + 300} 640 ${my + 40} ${mx + 214} ${my + 36}" fill="none" class="pm-line" stroke-width="1.5" stroke-dasharray="3 4"><animate attributeName="stroke-opacity" values="0;0;1;1;0" keyTimes="0;.88;.9;${END};1" dur="${DUR}s" repeatCount="indefinite"/></path>`;
  b += `<g opacity="0">${show(0.9)}<g filter="url(#${P("sh")})"><rect x="${mx}" y="${my}" width="214" height="76" rx="12" class="pm-panel pm-stroke"/></g>` +
    `<rect x="${mx + 12}" y="${my + 12}" width="20" height="20" rx="6" class="pm-dark"/><path d="M${mx + 17} ${my + 22} l3 3 l6 -6" fill="none" stroke="#fff" stroke-width="1.6"/>` +
    txt(mx + 40, my + 26, "Nadia Rahman replied", "pm-ink pm-b", 11.5) +
    txt(mx + 12, my + 50, "“Thursday works, send the invite.”", "pm-body", 10) +
    pill(mx + 12, my + 56, "Meeting booked", "ok", 9) + `</g>`;

  // ---------- particles ----------
  const dots = (d: string, a: number, z: number, n: number, dur: number, color: string) => {
    let s = `<g opacity="0">${show(a, z, 0.01)}`;
    for (let k = 0; k < n; k++)
      s += `<circle r="3" fill="${color}"><animateMotion dur="${dur}s" begin="-${f((k * dur) / n)}s" repeatCount="indefinite" path="${d}"/></circle>`;
    return s + `</g>`;
  };
  const C = ["#0ba5d8", "#3451e0", "#7a4bf0", "#3451e0"];
  srcPaths.forEach((d, i) => (b += dots(d, 0.02, 0.33, 2, 1.6 + i * 0.15, C[i])));
  b += dots(icpPath, 0.03, 0.16, 1, 1.4, "#7a4bf0");
  lanes.forEach(([ly], i) => {
    b += dots(`M342 226 C362 226 360 ${ly} 380 ${ly}`, 0.14, 0.3, 1, 0.9, C[i]);
    b += dots(`M540 ${ly} C560 ${ly} 560 226 580 226`, 0.16, 0.34, 2, 1.1, C[i + 1]);
  });
  b += dots("M880 190 C900 190 900 125 920 125", 0.665, 0.79, 2, 1, "#3451e0");
  b += dots("M880 190 C900 190 900 173 920 173", 0.665, 0.79, 2, 1.1, "#7a4bf0");

  const style = `
    .pm-panel{fill:var(--panel,#fff)} .pm-bg2{fill:var(--bg-2,#fafafb)} .pm-track{fill:var(--line-2,#eef0f3)}
    .pm-stroke{stroke:var(--line,#e7e8ec)} .pm-line{stroke:var(--line,#e7e8ec)} .pm-line2{stroke:var(--line-2,#eef0f3)}
    .pm-ink{fill:var(--text,#0b1220)} .pm-body{fill:var(--body,#3d4452)} .pm-muted{fill:var(--muted,#6b7280)} .pm-white{fill:#fff}
    .pm-dark{fill:var(--text,#0b1220)} .pm-b{font-weight:600} .pm-mono{font-family:'Geist Mono',ui-monospace,Consolas,monospace}
    .pm-ok{fill:var(--ok,#15803d)} .pm-ok-bg{fill:var(--ok-bg,#ecfdf3)} .pm-ok-stroke{stroke:var(--ok,#15803d)} .pm-ok-solid{fill:#16a34a}
    .pm-warn{fill:var(--warn,#b45309)} .pm-warn-bg{fill:var(--warn-bg,#fef6e7)}
    .pm-bad{fill:#b91c1c} .pm-bad-bg{fill:#fdecec} .pm-bad-stroke{stroke:#b91c1c}
    .pm-mute{fill:var(--muted,#6b7280)} .pm-mute-bg{fill:var(--line-2,#eef0f3)}
    .pm-accent{fill:var(--accent,#3451e0)} .pm-accent-bg{fill:#eef1fd}
    text{font-family:Geist,Inter,'Segoe UI',-apple-system,Arial,sans-serif}`;

  const defs = `<defs>
    <linearGradient id="${P("brand")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0ba5d8"/><stop offset=".5" stop-color="#3451e0"/><stop offset="1" stop-color="#7a4bf0"/></linearGradient>
    <linearGradient id="${P("engine")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#232a3b"/><stop offset="1" stop-color="#0b1220"/></linearGradient>
    <radialGradient id="${P("glow")}"><stop offset="0" stop-color="#3451e0" stop-opacity=".22"/><stop offset="1" stop-color="#3451e0" stop-opacity="0"/></radialGradient>
    <filter id="${P("sh")}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0b1220" flood-opacity=".1"/></filter>
    <filter id="${P("sh2")}" x="-10%" y="-20%" width="120%" height="160%"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#0b1220" flood-opacity=".06"/></filter>
    <style>${style}</style>
  </defs>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${framed ? -12 : 0} ${W} ${framed ? H + 24 : H}" width="${W}" height="${framed ? H + 24 : H}" role="img" aria-label="From ICP to booked meeting: scrape, verify, dedupe, enrich, deliver, campaign">${defs}${b}</svg>`;
};

export const MOTION_SIZE = { width: W, height: H, duration: DUR };
