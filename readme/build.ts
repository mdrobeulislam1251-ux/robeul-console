// Generates both GitHub profile READMEs and their SVG cards from src/data.ts, in the same
// design system as the console (modelled on outboundrix.io). Run: node readme/build.ts
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as simpleIcons from "simple-icons";
import {
  brandIcons,
  companies,
  experiences,
  metrics,
  pipeline,
  profile,
  projects,
  stack,
  stackProof,
  standards,
  type Company,
  type Experience,
  type Project,
  type Standard,
} from "../src/data.ts";
import { pipelineMotionSvg } from "../src/motion/pipelineMotion.ts";

const root = dirname(fileURLToPath(import.meta.url));
const app = join(root, "..");
const CONSOLE = "https://mdrobeulislam1251-ux.github.io/robeul-console/";
const page = (route: string) => `${CONSOLE}#/${route}`;

// ---------- design tokens (mirror src/styles.css, light theme) ----------
const T = {
  bg: "#ffffff",
  bg2: "#fafafb",
  panel2: "#f6f7f9",
  line: "#e7e8ec",
  line2: "#eef0f3",
  ink: "#0b1220",
  body: "#3d4452",
  muted: "#6b7280",
  dim: "#9aa1ad",
  accent: "#3451e0",
  cyan: "#0ba5d8",
  violet: "#7a4bf0",
  check: "#4f46e5",
  ok: "#15803d",
  okBg: "#ecfdf3",
  okDot: "#16a34a",
  slate: "#2f4a6b",
};
const SANS = "Geist, Inter, 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Geist Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace";
const W = 1200;

// ---------- primitives ----------
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Rough text width for wrapping; system sans averages ~0.53em, semibold ~0.57em, mono 0.6em. */
const measure = (s: string, fs: number, kind: "sans" | "bold" | "mono" = "sans") =>
  s.length * fs * (kind === "mono" ? 0.6 : kind === "bold" ? 0.57 : 0.53);

const wrap = (s: string, maxW: number, fs: number, kind: "sans" | "bold" = "sans", maxLines = 99): string[] => {
  const lines: string[] = [];
  let cur = "";
  for (const word of s.split(/\s+/)) {
    const next = cur ? `${cur} ${word}` : word;
    if (measure(next, fs, kind) > maxW && cur) {
      lines.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s,.;:]*\S*$/, "") + "…";
    return kept;
  }
  return lines;
};

type TextOpts = { fs: number; fill?: string; weight?: number; mono?: boolean; lh?: number; anchor?: string; ls?: number; deco?: string };
const text = (x: number, y: number, lines: string | string[], o: TextOpts) => {
  const arr = Array.isArray(lines) ? lines : [lines];
  const lh = o.lh ?? Math.round(o.fs * 1.5);
  return arr
    .map(
      (l, i) =>
        `<text x="${x}" y="${y + i * lh}" font-size="${o.fs}" fill="${o.fill ?? T.ink}"` +
        `${o.weight ? ` font-weight="${o.weight}"` : ""}${o.mono ? ` font-family="${MONO}"` : ""}` +
        `${o.anchor ? ` text-anchor="${o.anchor}"` : ""}${o.ls ? ` letter-spacing="${o.ls}"` : ""}` +
        `${o.deco ? ` text-decoration="${o.deco}"` : ""}>${esc(l)}</text>`,
    )
    .join("");
};

const dataUri = (file: string) => {
  const buf = readFileSync(file);
  const mime = file.endsWith(".svg") ? "image/svg+xml" : "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
};
const logo = (rel: string) => dataUri(join(app, "public", rel.replace(/^\.\//, "")));

// ---------- brand icons (simple-icons paths in their brand colour, or local logos) ----------
const SI: Record<string, { path: string; hex: string }> = {};
for (const v of Object.values(simpleIcons) as { slug?: string; path: string; hex: string }[]) if (v?.slug) SI[v.slug] = v;

const extraBrands: Record<string, string> = {
  Gmail: "gmail",
  GitHub: "github",
  Outboundrix: "./logos/outboundrix-192.png",
  "Trusted Leads": "./logos/trustedleads.png",
  "Lead Gen Jay": "./logos/leadgenjay.png",
  "T-Ex LLM": "./logos/texllm.png",
};

/** Brand mark at (x, y) with size s, or "" when the skill has no known brand. */
const brandMark = (name: string, x: number, y: number, s: number) => {
  const ref = brandIcons[name] ?? extraBrands[name];
  if (!ref) return "";
  if (ref.startsWith("./")) return `<image href="${logo(ref)}" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
  const ic = SI[ref];
  if (!ic) return "";
  return `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="#${ic.hex}" d="${ic.path}"/></svg>`;
};

/** Square monogram for tools with no published brand icon. */
const monogram = (label: string, x: number, y: number, s: number, color = T.ink) =>
  `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.22}" fill="${color}"/>` +
  text(x + s / 2, y + s * 0.68, label, { fs: s * 0.42, fill: "#fff", weight: 700, anchor: "middle" });

/** Outboundrix-style filter chip: white pill, hairline border, optional brand icon. */
const chip = (x: number, y: number, label: string, fs = 13, withIcon = true) => {
  const icon = withIcon ? brandMark(label, 0, 0, 0) : "";
  const pad = icon ? 32 : 22;
  const w = Math.round(measure(label, fs) + pad + 2);
  const h = fs + 15;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#fff" stroke="${T.line}"/>`;
  if (icon) s += brandMark(label, x + 9, y + (h - 14) / 2, 14);
  s += text(x + (icon ? 28 : 11), y + h / 2 + fs * 0.36, label, { fs, fill: T.body, weight: 500 });
  return { w, h, svg: s };
};

/** Lays chips out left-to-right, wrapping at maxX. Returns svg and the y below the last row. */
const chipRow = (x0: number, y0: number, maxX: number, labels: string[], fs = 13, maxRows = 99) => {
  let x = x0,
    y = y0,
    rows = 1,
    out = "";
  for (const l of labels) {
    let c = chip(x, y, l, fs);
    if (x + c.w > maxX && x > x0) {
      if (rows === maxRows) break;
      rows++;
      x = x0;
      y += c.h + 8;
      c = chip(x, y, l, fs);
    }
    out += c.svg;
    x += c.w + 8;
  }
  return { svg: out, bottom: y + fs + 15 };
};

const pill = (x: number, y: number, label: string, color: string, bg: string, fs = 12) => {
  const w = Math.round(measure(label, fs, "bold") + 18);
  return {
    w,
    svg:
      `<rect x="${x}" y="${y}" width="${w}" height="${fs + 10}" rx="${(fs + 10) / 2}" fill="${bg}"/>` +
      text(x + w / 2, y + fs + 2.5, label, { fs, fill: color, weight: 600, anchor: "middle" }),
  };
};

const check = (x: number, y: number, color = T.check) =>
  `<path d="M${x} ${y} l4.5 4.5 l9 -9" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

const dot = (cx: number, cy: number) =>
  `<circle cx="${cx}" cy="${cy}" r="4" fill="${T.okDot}"/><circle class="pulse" cx="${cx}" cy="${cy}" r="4" fill="${T.okDot}"/>`;

const defs = `<defs>
  <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T.cyan}"/><stop offset=".5" stop-color="${T.accent}"/><stop offset="1" stop-color="${T.violet}"/></linearGradient>
  <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2eaf6"/><stop offset=".6" stop-color="#edf0fb"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
  <radialGradient id="cloud"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#0b1220" flood-opacity=".12"/></filter>
  <filter id="sh2" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0b1220" flood-opacity=".06"/></filter>
  <style>
    .pulse { animation: p 2.2s ease-out infinite; } @keyframes p { 0% { opacity: .55; r: 4px; } 100% { opacity: 0; r: 11px; } }
    .row { opacity: 0; animation: in .5s ease forwards; } @keyframes in { to { opacity: 1; } }
  </style>
</defs>`;

/** Card frame. `bare` drops the border so section headings read as page text, not boxes. */
const svg = (w: number, h: number, body: string, label: string, bare = false, fill = T.bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${SANS}" role="img" aria-label="${esc(label)}">${defs}` +
  `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="16" fill="${fill}"${bare ? "" : ` stroke="${T.line}"`}/>` +
  body +
  `</svg>`;

/** Grey header strip across the top of a product-style card. */
const cardHeader = (w: number, h: number) =>
  `<path d="M.5 16.5 a16 16 0 0 1 16 -16 h${w - 33} a16 16 0 0 1 16 16 v${h - 16} h-${w - 1} z" fill="${T.bg2}"/>` +
  `<line x1=".5" y1="${h + 0.5}" x2="${w - 0.5}" y2="${h + 0.5}" stroke="${T.line}"/>`;

// ---------- account variants ----------
type Account = {
  login: string;
  other: string;
  role: string;
  lede: string;
  typing: string[];
  timeline: [string, string, string][];
  experienceIds: string[];
  projectOrgs: string[];
  withCompanies: boolean;
  withLangs: boolean;
  contacts: [string, string][];
};

const accounts: Account[] = [
  {
    login: "robeul-trusted-leads",
    other: "mdrobeulislam1251-ux",
    role: "Head Data Engineer · Trusted Leads",
    lede: "I turn a customer's ICP into an accurate, verified, ready-to-send lead list. At Trusted Leads I own the outbound pipeline end to end: extraction, waterfall verification, decision-maker resolution and delivery.",
    typing: ["Accurate lists drive real growth.", "ICP in → verified leads out.", "Scrape · verify · enrich · deliver", "Every row keeps its source.", "Built to be checked, not trusted."],
    timeline: [
      ["Aug 2024 →", "Head Data Engineer", "Trusted Leads · full-time, remote"],
      ["Aug 2024 →", "Senior Data Engineer", "Lead Gen Jay · contract, remote"],
      ["2025", "Distributed scraping orchestrator", "Trusted Leads · 7 n8n workflows"],
      ["2026 →", "Verification-gated agents", "T-Ex LLM Runpack"],
    ],
    experienceIds: ["trusted-leads", "lead-gen-jay", "tex-llm"],
    projectOrgs: ["Trusted Leads", "Lead Gen Jay", "T-Ex LLM"],
    withCompanies: false,
    withLangs: false,
    contacts: [
      ["Trusted Leads", "https://trustedleads.io"],
      ["Lead Gen Jay", "https://leadgenjay.com"],
      ["T-Ex LLM", "https://github.com/mdrobeulislam1251-ux/T-Ex-LLM-Runpack"],
    ],
  },
  {
    login: "mdrobeulislam1251-ux",
    other: "robeul-trusted-leads",
    role: "AI-Native Data & Automation Engineer",
    lede: "I build the data and automation systems that turn a raw ICP into booked meetings, run the servers and networks they live on, and ship the products around them.",
    typing: ["From ICP to booked meeting, in one motion.", "Scraping · verification · campaigns", "Servers, networks and automations that stay up.", "Data engines, sold as products.", "Built to be checked, not trusted."],
    timeline: [
      ["Aug 2024 →", "Head Data Engineer", "Trusted Leads · full-time, remote"],
      ["Aug 2024 →", "Senior Data Engineer", "Lead Gen Jay · contract, remote"],
      ["2025", "Distributed scraping orchestrator", "7 n8n workflows, versioned job state"],
      ["2026 →", "Founder", "Outboundrix LLC · Wyoming, US"],
      ["2026 →", "Verification-gated agents", "T-Ex LLM Runpack · own project"],
    ],
    experienceIds: ["trusted-leads", "lead-gen-jay", "outboundrix"],
    projectOrgs: ["Trusted Leads", "Lead Gen Jay", "T-Ex LLM", "Datryxen"],
    withCompanies: true,
    withLangs: true,
    contacts: [
      ["Outboundrix", "https://outboundrix.io"],
      ["Trusted Leads", "https://trustedleads.io"],
    ],
  },
];

// ---------- components ----------
const avatarUri = (login: string) => dataUri(join(root, "avatars", `${login}.png`));

const hero = (a: Account) => {
  let b = "";
  // sky wash with soft clouds, like the outboundrix.io hero
  b += `<rect x=".5" y=".5" width="${W - 1}" height="100%" rx="16" fill="url(#wash)"/>`;
  b += `<ellipse cx="120" cy="120" rx="260" ry="140" fill="url(#cloud)"/><ellipse cx="560" cy="60" rx="200" ry="90" fill="url(#cloud)"/>`;

  const x = 56;
  const pw = Math.round(measure("Welcome, thanks for stopping by", 12.5, "mono") + 44);
  b += `<rect x="${x}" y="56" width="${pw}" height="30" rx="15" fill="#fff" fill-opacity=".8" stroke="${T.line}"/>`;
  b += dot(x + 17, 71) + text(x + 30, 75.5, "Welcome, thanks for stopping by", { fs: 12.5, fill: T.body, mono: true });

  b += text(x, 146, "Hi, I'm Robeul.", { fs: 46, weight: 700, ls: -1.4 });
  b += text(x, 200, ["I build systems", "you don't have to", "double-check."], { fs: 46, weight: 700, ls: -1.4, fill: T.slate, lh: 54 });
  const lede = wrap(a.lede, 520, 16.5);
  const ly = 352;
  b += text(x, ly, lede, { fs: 16.5, fill: T.body, lh: 26 });

  const by = ly + (lede.length - 1) * 26 + 32;
  b += `<rect x="${x}" y="${by}" width="186" height="46" rx="10" fill="${T.ink}"/>`;
  b += text(x + 93, by + 29, "Open the console", { fs: 15.5, weight: 600, fill: "#fff", anchor: "middle" });
  b += text(x + 214, by + 29, "See the case files", { fs: 15.5, weight: 500, deco: "underline" });

  let tx = x;
  const ty = by + 82;
  for (const t of ["Verified before it ships", "Private by default", "One owner, end to end"]) {
    b += check(tx, ty - 5, T.ok) + text(tx + 20, ty, t, { fs: 13, fill: T.body });
    tx += measure(t, 13) + 34;
  }

  const iy = ty + 44;
  b += `<clipPath id="me"><circle cx="${x + 20}" cy="${iy + 20}" r="20"/></clipPath>`;
  b += `<circle cx="${x + 20}" cy="${iy + 20}" r="21.5" fill="#fff" stroke="${T.line}"/>`;
  b += `<image href="${avatarUri(a.login)}" x="${x}" y="${iy}" width="40" height="40" clip-path="url(#me)"/>`;
  b += text(x + 54, iy + 17, `${profile.name} · ${a.role}`, { fs: 14.5, weight: 600 });
  b += text(x + 54, iy + 36, "Bogura, Bangladesh · remote on US hours · Bengali, English", { fs: 13, fill: T.muted });
  const H = iy + 76;

  // product window
  const wx = 640,
    wy = 48,
    ww = 520,
    wh = H - wy - 36;
  b += `<g filter="url(#sh)"><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="12" fill="#fff" stroke="${T.line}"/></g>`;
  b += `<path d="M${wx} ${wy + 12} a12 12 0 0 1 12 -12 h${ww - 24} a12 12 0 0 1 12 12 v22 h-${ww} z" fill="${T.bg2}"/>`;
  b += `<line x1="${wx}" y1="${wy + 34}" x2="${wx + ww}" y2="${wy + 34}" stroke="${T.line}"/>`;
  b += [16, 30, 44].map((d) => `<circle cx="${wx + d}" cy="${wy + 17}" r="4.5" fill="#d9dce2"/>`).join("");
  b += `<rect x="${wx + 64}" y="${wy + 7}" width="230" height="20" rx="5" fill="#fff" stroke="${T.line}"/>`;
  b += text(wx + 74, wy + 21, "robeul.console / welcome", { fs: 11, fill: T.muted, mono: true });

  // sidebar
  const sx = wx,
    sw = 132,
    top = wy + 35;
  b += `<rect x="${sx + 0.5}" y="${top}" width="${sw}" height="${wh - 36}" fill="${T.bg2}"/>`;
  b += `<line x1="${sx + sw}" y1="${top}" x2="${sx + sw}" y2="${wy + wh - 1}" stroke="${T.line}"/>`;
  b += `<rect x="${sx + 12}" y="${top + 14}" width="18" height="18" rx="5" fill="url(#brand)"/>`;
  b += text(sx + 21, top + 27, "R", { fs: 10.5, fill: "#fff", weight: 700, anchor: "middle" });
  b += text(sx + 36, top + 27, "Robeul Console", { fs: 11, weight: 600 });
  ["Welcome", "Experience", "Case files", "Pipeline", "Standards", "Stack", "Contact"].forEach((n, i) => {
    const ny = top + 52 + i * 25;
    if (!i) b += `<rect x="${sx + 8}" y="${ny - 4}" width="${sw - 16}" height="22" rx="6" fill="#fff" stroke="${T.line}"/>`;
    b += `<rect x="${sx + 16}" y="${ny + 2.5}" width="9" height="9" rx="2.5" fill="none" stroke="${i ? T.dim : T.accent}" stroke-width="1.4"/>`;
    b += text(sx + 32, ny + 11, n, { fs: 11, fill: i ? T.muted : T.ink, weight: i ? 400 : 500 });
  });
  const cy = top + 52 + 7 * 25 + 8;
  b += `<rect x="${sx + 8}" y="${cy}" width="${sw - 16}" height="36" rx="8" fill="#fff" stroke="${T.line}"/>`;
  b += `<clipPath id="me2"><circle cx="${sx + 26}" cy="${cy + 18}" r="10"/></clipPath>`;
  b += `<image href="${avatarUri(a.login)}" x="${sx + 16}" y="${cy + 8}" width="20" height="20" clip-path="url(#me2)"/>`;
  b += text(sx + 42, cy + 16, "Robeul Islam", { fs: 9.5, weight: 600 });
  b += `<circle cx="${sx + 45}" cy="${cy + 25}" r="2.5" fill="${T.okDot}"/>` + text(sx + 51, cy + 28, "Available", { fs: 8.5, fill: T.muted });

  // main area
  const mx = sx + sw + 16,
    mw = wx + ww - 16 - mx;
  let my = top + 22;
  b += text(mx, my, "Welcome", { fs: 10, fill: T.muted });
  b += dot(mx + 4, my + 15) + text(mx + 14, my + 19, "Pipeline live · 3 jobs running", { fs: 13.5, weight: 600 });
  b += text(mx, my + 36, "From ICP to booked meeting, verified at every step.", { fs: 10, fill: T.muted });
  my += 52;
  const kw = (mw - 16) / 3,
    kh = 64;
  metrics.forEach((m, i) => {
    const kx = mx + (i % 3) * (kw + 8),
      ky = my + Math.floor(i / 3) * (kh + 8);
    b += `<rect x="${kx}" y="${ky}" width="${kw}" height="${kh}" rx="8" fill="#fff" stroke="${T.line}"/>`;
    b += text(kx + 10, ky + 17, wrap(m.label, kw - 18, 9.5)[0], { fs: 9.5, fill: T.muted });
    b += text(kx + 10, ky + 40, `${m.value}${m.suffix}`, { fs: 19, weight: 600, ls: -0.4 });
    b += `<rect x="${kx + 10}" y="${ky + 50}" width="${kw - 20}" height="3" rx="1.5" fill="${T.line2}"/>`;
    b += `<rect x="${kx + 10}" y="${ky + 50}" width="${(kw - 20) * (0.55 + (i % 3) * 0.15)}" height="3" rx="1.5" fill="${T.accent}"/>`;
  });
  my += 2 * (kh + 8) + 6;
  const rows: [string, string, string, string, boolean][] = [
    ["NR", "Nadia Rahman", "VP Sales · Brightline", "Verified", true],
    ["OC", "Owen Clarke", "Founder · Harborpoint", "Verified", true],
    ["LM", "Leah Morgan", "Ops Lead · Northgate", "Catch-all", false],
    ["MT", "Mia Torres", "Head of RevOps · Lumora", "Verified", true],
  ];
  const lh = 30 + rows.length * 30 + 4;
  b += `<rect x="${mx}" y="${my}" width="${mw}" height="${lh}" rx="8" fill="#fff" stroke="${T.line}"/>`;
  b += `<path d="M${mx} ${my + 8} a8 8 0 0 1 8 -8 h${mw - 16} a8 8 0 0 1 8 8 v18 h-${mw} z" fill="${T.bg2}"/>`;
  b += `<line x1="${mx}" y1="${my + 26}" x2="${mx + mw}" y2="${my + 26}" stroke="${T.line}"/>`;
  b += text(mx + 10, my + 17, "People", { fs: 10.5, weight: 600 }) + text(mx + mw - 10, my + 17, "example data", { fs: 9.5, fill: T.muted, mono: true, anchor: "end" });
  rows.forEach(([ini, name, role, st, ok], i) => {
    const ry = my + 26 + i * 30;
    const [fg, bg] = ok ? [T.ok, T.okBg] : ["#b45309", "#fef6e7"];
    b += `<g class="row" style="animation-delay:${0.3 + i * 0.45}s">`;
    if (i) b += `<line x1="${mx + 10}" y1="${ry}" x2="${mx + mw - 10}" y2="${ry}" stroke="${T.line2}"/>`;
    b += `<circle cx="${mx + 20}" cy="${ry + 15}" r="9" fill="${T.line2}"/>` + text(mx + 20, ry + 18, ini, { fs: 7.5, weight: 600, fill: T.body, anchor: "middle" });
    b += text(mx + 36, ry + 13, name, { fs: 10, weight: 600 }) + text(mx + 36, ry + 24, role, { fs: 8.5, fill: T.muted });
    const pw = pill(0, 0, st, fg, bg, 9).w;
    b += pill(mx + mw - 10 - pw, ry + 8, st, fg, bg, 9).svg + `</g>`;
  });

  // floating notification, the signature outboundrix.io move
  const fx = 596,
    fy = wy + wh - 112,
    fw = 296,
    fh = 92;
  b += `<g filter="url(#sh)"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="12" fill="#fff" stroke="${T.line}"/></g>`;
  b += `<rect x="${fx + 14}" y="${fy + 14}" width="22" height="22" rx="6" fill="${T.ink}"/>` + check(fx + 19, fy + 25, "#fff");
  b += text(fx + 46, fy + 30, "Nadia Rahman replied", { fs: 13.5, weight: 600 }) + text(fx + fw - 14, fy + 30, "just now", { fs: 11, fill: T.muted, mono: true, anchor: "end" });
  b += text(fx + 14, fy + 54, "“Thursday works, send the invite.”", { fs: 11.5, fill: T.body });
  const p1 = pill(fx + 14, fy + 63, "Meeting booked", T.ok, T.okBg, 10.5);
  b += p1.svg + text(fx + 22 + p1.w, fy + 77, "from a verified list", { fs: 11, fill: T.muted });

  return svg(W, H, b, `${profile.name}, ${a.role}. Open the console.`);
};

const button = (label: string, primary = false, icon = "") => {
  const mark = icon ? brandMark(icon, 0, 0, 0) : "";
  const iconSvg = icon === "LinkedIn" ? monogram("in", 0, 0, 18, "#0A66C2") : mark;
  const pad = iconSvg ? 62 : 40;
  const w = Math.round(measure(label, 15.5, "bold") + pad);
  let s = `<rect x="1" y="1" width="${w - 2}" height="44" rx="10" fill="${primary ? T.ink : "#fff"}" stroke="${primary ? T.ink : T.line}" stroke-width="1.5"/>`;
  let tx = 20;
  if (icon === "LinkedIn") s += monogram("in", 18, 14, 18, "#0A66C2");
  else if (mark) s += brandMark(icon, 18, 14, 18);
  if (iconSvg) tx = 44;
  s += text(tx, 28.5, label, { fs: 15.5, weight: 500, fill: primary ? "#fff" : T.ink });
  return {
    w,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="46" viewBox="0 0 ${w} 46" font-family="${SANS}" role="img" aria-label="${esc(label)}">${s}</svg>`,
  };
};

const sectionHead = (n: number, eyebrow: string, title: string, sub: string, link = "Open in console  →") => {
  const subLines = wrap(sub, 760, 17);
  const H = 128 + (subLines.length - 1) * 27 + 26;
  let b = "";
  b += text(40, 44, String(n).padStart(2, "0"), { fs: 13, fill: T.dim, mono: true });
  b += text(66, 44, eyebrow, { fs: 14, fill: T.body, weight: 500 });
  b += text(40, 92, title, { fs: 36, weight: 700, ls: -1 });
  b += text(40, 128, subLines, { fs: 17, fill: T.body, lh: 27 });
  if (link) b += text(W - 40, 92, link, { fs: 15, fill: T.accent, weight: 500, anchor: "end", deco: "underline" });
  return svg(W, H, b, `${eyebrow}: ${title}`, true);
};

const experienceCard = (x: Experience) => {
  let b = cardHeader(W, 56);
  b += `<rect x="24" y="12" width="32" height="32" rx="8" fill="#fff" stroke="${T.line}"/>`;
  b += `<image href="${logo(x.logo)}" x="28" y="16" width="24" height="24"/>`;
  b += text(68, 33, x.company, { fs: 14.5, weight: 600 });
  b += text(W - 24, 33, x.period, { fs: 12.5, fill: T.muted, mono: true, anchor: "end" });
  b += text(32, 104, x.role, { fs: 25, weight: 700, ls: -0.6 });
  b += text(32, 130, x.meta, { fs: 14, fill: T.muted });
  const summary = wrap(x.summary, 1120, 16.5);
  let y = 168;
  b += text(32, y, summary, { fs: 16.5, fill: T.ink, lh: 25 });
  y += summary.length * 25 + 8;
  for (const t of x.bullets) {
    const lines = wrap(t, 1080, 15);
    b += check(34, y - 5) + text(58, y, lines, { fs: 15, fill: T.body, lh: 23 });
    y += lines.length * 23 + 7;
  }
  const chips = chipRow(32, y + 6, W - 32, x.stack, 13);
  b += chips.svg;
  return svg(W, chips.bottom + 28, b, `${x.role} at ${x.company}`);
};

const CASE_W = 590,
  CASE_H = 430;
const catColor: Record<Project["category"], [string, string]> = {
  Data: [T.accent, "#eef1fd"],
  Infrastructure: [T.ok, T.okBg],
  Automation: ["#c23a5c", "#fdeef2"],
  "AI Agents": [T.violet, "#f3eefe"],
  Product: ["#0a7ea4", "#e8f6fb"],
};
const caseCard = (p: Project) => {
  let b = cardHeader(CASE_W, 46);
  b += text(22, 29, `Chapter ${String(p.chapter).padStart(2, "0")}`, { fs: 13, weight: 600 });
  const [cc, cb] = catColor[p.category];
  const cat = pill(0, 0, p.category, cc, cb, 11.5);
  b += pill(CASE_W - 22 - cat.w, 12, p.category, cc, cb, 11.5).svg;
  b += text(CASE_W - 32 - cat.w, 29, p.year, { fs: 12, fill: T.muted, mono: true, anchor: "end" });

  b += `<rect x="22" y="68" width="44" height="44" rx="10" fill="#fff" stroke="${T.line}"/>`;
  b += `<image href="${logo(p.logo)}" x="30" y="76" width="28" height="28"/>`;
  const title = wrap(p.title, 470, 20, "bold", 2);
  b += text(80, title.length > 1 ? 85 : 96, title, { fs: 20, weight: 700, lh: 25, ls: -0.4 });
  let y = 140;
  b += text(22, y, p.org, { fs: 13.5, fill: T.muted });
  y += 32;
  b += text(22, y, "The problem", { fs: 12.5, fill: T.muted, weight: 500 });
  b += text(22, y + 23, wrap(p.problem, 540, 15.5, "sans", 4), { fs: 15.5, fill: T.body, lh: 23 });

  const chipsY = CASE_H - 22 - 27;
  b += chipRow(22, chipsY, CASE_W - 22, p.stack, 12, 1).svg;
  const proof = wrap(p.proof, 520, 14, "sans", 2);
  const ph = 44 + proof.length * 20;
  const py = chipsY - 16 - ph;
  b += `<rect x="22" y="${py}" width="${CASE_W - 44}" height="${ph}" rx="10" fill="${T.bg2}" stroke="${T.line}"/>`;
  b += pill(36, py + 12, "Verified", T.ok, T.okBg, 11).svg + text(108, py + 26, "The proof", { fs: 12.5, fill: T.muted, weight: 500 });
  b += text(36, py + 52, proof, { fs: 14, fill: T.ink, lh: 20 });
  return svg(CASE_W, CASE_H, b, `Case file: ${p.title}`);
};

const ctaCard = (eyebrow: string, title: string, sub: string, h: number, w = CASE_W) => {
  let b = `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="16" fill="url(#wash)"/>`;
  b += text(w / 2, h / 2 - 46, eyebrow, { fs: 13.5, fill: T.body, weight: 500, anchor: "middle" });
  b += text(w / 2, h / 2 - 8, title, { fs: 27, weight: 700, ls: -0.6, anchor: "middle" });
  b += text(w / 2, h / 2 + 22, sub, { fs: 15, fill: T.body, anchor: "middle" });
  b += `<rect x="${w / 2 - 95}" y="${h / 2 + 46}" width="190" height="44" rx="10" fill="${T.ink}"/>`;
  b += text(w / 2, h / 2 + 73, "Open the console", { fs: 15, weight: 600, fill: "#fff", anchor: "middle" });
  return svg(w, h, b, title);
};

const timelineCard = (a: Account) => {
  const H = 270,
    n = a.timeline.length,
    m = W / (2 * n),
    step = (W - 2 * m) / (n - 1);
  let b = `<line x1="40" y1="100" x2="${W - 40}" y2="100" stroke="${T.line}" stroke-width="2"/>`;
  b += `<line x1="40" y1="100" x2="${W - 40}" y2="100" stroke="url(#brand)" stroke-width="2" stroke-dasharray="${W}" stroke-dashoffset="${W}"><animate attributeName="stroke-dashoffset" to="0" dur="2s" fill="freeze"/></line>`;
  a.timeline.forEach(([yr, role, org], i) => {
    const cx = m + i * step,
      anchor = "middle",
      tx = cx;
    b += text(tx, 74, yr, { fs: 12.5, fill: T.accent, mono: true, anchor });
    b += `<circle cx="${cx}" cy="100" r="8" fill="#fff" stroke="${T.accent}" stroke-width="2.5"/>`;
    if (yr.endsWith("→")) b += `<circle cx="${cx}" cy="100" r="3.5" fill="${T.accent}"/>`;
    const rl = wrap(role, step - 24, 15.5, "bold", 2);
    b += text(tx, 138, rl, { fs: 15.5, weight: 600, anchor, lh: 20 });
    b += text(tx, 138 + rl.length * 20 + 4, wrap(org, step - 20, 13, "sans", 2), { fs: 13, fill: T.muted, anchor, lh: 18 });
  });
  b += `<line x1="40" y1="${H - 46}" x2="${W - 40}" y2="${H - 46}" stroke="${T.line2}"/>`;
  b += text(W / 2, H - 20, "Bogura, Bangladesh · remote on US hours · Bengali, English", { fs: 13, fill: T.muted, anchor: "middle" });
  return svg(W, H, b, "Career timeline");
};

const pipelineCard = () => {
  const n = pipeline.length,
    cw = (W - 64) / n;
  let b = "";
  pipeline.forEach((p, i) => {
    const x = 32 + i * cw;
    const last = i === n - 1;
    if (!last) b += `<line x1="${x + 34}" y1="52" x2="${x + cw - 2}" y2="52" stroke="${T.line}" stroke-width="1.5"/>`;
    b += `<circle cx="${x + 18}" cy="52" r="15" fill="${last ? T.okBg : "#eef1fd"}"/>`;
    b += text(x + 18, 56.5, String(i + 1), { fs: 12.5, fill: last ? T.ok : T.accent, weight: 600, mono: true, anchor: "middle" });
    b += text(x + 2, 104, p.label, { fs: 17.5, weight: 600, ls: -0.3 });
    b += text(x + 2, 130, wrap(p.detail, cw - 22, 14, "sans", 6), { fs: 14, fill: T.body, lh: 21 });
  });
  return svg(W, 272, b, "The pipeline: ICP in, verified leads out");
};

const standardsCard = (list: Standard[]) => {
  const cols = 3,
    gap = 14,
    cw = (W - 64 - gap * (cols - 1)) / cols,
    ch = 172;
  let b = "";
  list.forEach((r, i) => {
    const cx = 32 + (i % cols) * (cw + gap),
      cy = 28 + Math.floor(i / cols) * (ch + gap);
    b += `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="12" fill="#fff" stroke="#d6d9df" stroke-dasharray="4 3"/>`;
    b += `<circle cx="${cx + 35}" cy="${cy + 35}" r="13" fill="${T.okBg}"/>` + check(cx + 29, cy + 35, T.ok);
    const t = wrap(r.title, cw - 44, 16.5, "bold", 2);
    b += text(cx + 22, cy + 80, t, { fs: 16.5, weight: 600, lh: 22 });
    b += text(cx + 22, cy + 80 + t.length * 22 + 6, wrap(r.detail, cw - 44, 13.5, "sans", 3), { fs: 13.5, fill: T.body, lh: 20 });
  });
  return svg(W, 28 + Math.ceil(list.length / cols) * (ch + gap) + 14, b, "Standards: what you can hold me to");
};

/** The skills card: every track, one line of proof, and every skill as a branded chip. */
const skillsCard = () => {
  let b = "";
  let y = 28;
  Object.entries(stack).forEach(([track, items], i) => {
    if (i) b += `<line x1="32" y1="${y - 14}" x2="${W - 32}" y2="${y - 14}" stroke="${T.line2}"/>`;
    b += text(32, y + 18, track, { fs: 16, weight: 600 });
    const proof = wrap(stackProof[track] ?? "", 230, 12.5, "sans", 3);
    b += text(32, y + 40, proof, { fs: 12.5, fill: T.muted, lh: 18 });
    const chips = chipRow(300, y, W - 32, items, 13);
    b += chips.svg;
    y = Math.max(chips.bottom, y + 40 + proof.length * 18) + 30;
  });
  return svg(W, y - 2, b, "Skills by track, with the tools I actually use");
};

/** "Works with the tools you already run" logo wall. */
const toolsCard = () => {
  const tools: [string, string?][] = [
    ["Apollo.io"], ["Instantly"], ["Smartlead"], ["MillionVerifier", "MV"], ["Reacher", "R"], ["HubSpot"],
    ["n8n"], ["Claude Code"], ["PostgreSQL"], ["Supabase"], ["GitHub Actions"], ["Docker"],
    ["Ubuntu"], ["Tailscale"], ["WireGuard"], ["Cloudflare Tunnels"], ["Caddy"], ["MikroTik RouterOS"],
  ];
  const cols = 6,
    cw = (W - 64) / cols;
  let b = text(W / 2, 40, "GTM, platform and network tools I run every day", { fs: 14, fill: T.body, weight: 500, anchor: "middle" });
  tools.forEach(([name, mono], i) => {
    const x = 32 + (i % cols) * cw,
      y = 66 + Math.floor(i / cols) * 58;
    b += `<rect x="${x + 6}" y="${y}" width="${cw - 12}" height="46" rx="10" fill="#fff" stroke="${T.line}"/>`;
    b += mono ? monogram(mono, x + 18, y + 11, 24) : brandMark(name, x + 18, y + 11, 24);
    const short: Record<string, string> = { "Cloudflare Tunnels": "Cloudflare", "Claude Code": "Claude", "MikroTik RouterOS": "MikroTik", "GitHub Actions": "Actions" };
    b += text(x + 52, y + 28, short[name] ?? name, { fs: 14.5, weight: 600 });
  });
  return svg(W, 66 + Math.ceil(tools.length / cols) * 58 + 18, b, "Tools I run every day");
};

const COMPANY_H = 260;
const companyCard = (c: Company) => {
  let b = "";
  const wide = c.id === "ready-list";
  b += `<rect x="24" y="24" width="${wide ? 150 : 56}" height="56" rx="12" fill="#fff" stroke="${T.line}"/>`;
  b += wide
    ? `<image href="${logo(c.logo)}" x="34" y="32" width="130" height="40"/>`
    : `<image href="${logo(c.logo)}" x="34" y="34" width="36" height="36"/>`;
  b += text(24, 120, c.name, { fs: 23, weight: 700, ls: -0.5 });
  b += text(24, 146, c.tagline, { fs: 14, fill: T.muted, weight: 500 });
  b += text(24, 180, wrap(c.body, 540, 14.5, "sans", 3), { fs: 14.5, fill: T.body, lh: 22 });
  if (c.url) b += text(CASE_W - 24, 56, `${new URL(c.url).hostname.replace("www.", "")}  ↗`, { fs: 13.5, fill: T.accent, anchor: "end", deco: "underline" });
  return svg(CASE_W, COMPANY_H, b, `${c.name}: ${c.tagline}`);
};

const connectCard = (a: Account) => {
  const H = 300;
  let b = `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="url(#wash)"/>`;
  b += `<ellipse cx="200" cy="80" rx="260" ry="120" fill="url(#cloud)"/><ellipse cx="1000" cy="60" rx="240" ry="100" fill="url(#cloud)"/>`;
  b += `<g filter="url(#sh)"><circle cx="600" cy="80" r="44" fill="#fff"/></g>`;
  b += `<clipPath id="av2"><circle cx="600" cy="80" r="40"/></clipPath>`;
  b += `<image href="${avatarUri(a.login)}" x="560" y="40" width="80" height="80" clip-path="url(#av2)"/>`;
  const pw = Math.round(measure("Open to conversations", 12.5, "mono") + 44);
  b += `<rect x="${600 - pw / 2}" y="140" width="${pw}" height="28" rx="14" fill="#fff" fill-opacity=".85" stroke="${T.line}"/>`;
  b += dot(600 - pw / 2 + 17, 154) + text(600 - pw / 2 + 30, 158.5, "Open to conversations", { fs: 12.5, fill: T.body, mono: true });
  b += text(600, 216, "Let's build something you can trust.", { fs: 36, weight: 700, ls: -1, anchor: "middle" });
  b += text(600, 252, `Data engineering, verification pipelines and agent infrastructure. Remote on US hours from ${profile.location}.`, {
    fs: 15.5,
    fill: T.body,
    anchor: "middle",
  });
  return svg(W, H, b, "Contact: let's build something you can trust");
};

// ---------- README assembly ----------
const A = "assets/system";
const img = (file: string, alt: string, href?: string, width = "100%") => {
  const tag = `<img src="${A}/${file}" width="${width}" alt="${esc(alt)}" />`;
  return href ? `<a href="${href}">${tag}</a>` : tag;
};

const build = (a: Account) => {
  const out = join(root, "out", a.login);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, A), { recursive: true });
  const put = (file: string, content: string) => writeFileSync(join(out, A, file), content);

  put("hero.svg", hero(a));
  const nav: [string, string, boolean][] = [
    ["Open the console", "", true],
    ["Experience", "experience", false],
    ["Case files", "projects", false],
    ["Pipeline", "pipeline", false],
    ["Standards", "standards", false],
    ["Stack", "stack", false],
    ["Contact", "contact", false],
  ];
  nav.forEach(([l, , p], i) => put(`nav-${i}.svg`, button(l, p).svg));

  const exps = a.experienceIds.map((id) => experiences.find((e) => e.id === id)!);
  exps.forEach((e) => put(`exp-${e.id}.svg`, experienceCard(e)));
  put("timeline.svg", timelineCard(a));
  const shown = projects.filter((p) => a.projectOrgs.includes(p.org)).map((p, i) => ({ ...p, chapter: i + 1 }));
  shown.forEach((p) => put(`case-${p.id}.svg`, caseCard(p)));
  put("case-cta.svg", ctaCard("The full documentary", "Every chapter, in the console", "Filter, search, and read each act.", CASE_H));
  put("skills.svg", skillsCard());
  put("tools.svg", toolsCard());
  put("pipeline.svg", pipelineCard());
  put("motion.svg", pipelineMotionSvg({ id: "m", asset: logo, framed: true }));
  put("standards.svg", standardsCard(standards));
  if (a.withCompanies) {
    companies.forEach((c) => put(`co-${c.id}.svg`, companyCard(c)));
    put("co-cta.svg", ctaCard("One data engine", "Several faces", "See how they fit together.", COMPANY_H));
  }
  put("connect.svg", connectCard(a));

  let n = 0;
  const head = (eyebrow: string, title: string, sub: string, route: string) => {
    n++;
    const file = `head-${n}.svg`;
    put(file, sectionHead(n, eyebrow, title, sub, route === "-" ? "" : undefined));
    return route === "-" ? img(file, `${eyebrow}: ${title}`) : img(file, `${eyebrow}: ${title}`, page(route));
  };
  const pair = (items: [string, string, string][]) => {
    const rows: string[] = [];
    for (let i = 0; i < items.length; i += 2)
      rows.push(items.slice(i, i + 2).map(([f, alt, href]) => img(f, alt, href, "49%")).join("\n"));
    return rows.join("\n<br/>\n");
  };

  const caseItems: [string, string, string][] = shown.map((p) => [`case-${p.id}.svg`, `Case file: ${p.title}`, page(`projects/${p.id}`)]);
  caseItems.push(["case-cta.svg", "All case files in the console", page("projects")]);

  const typing =
    `https://readme-typing-svg.demolab.com?font=Geist+Mono&weight=500&size=20&duration=3000&pause=900&color=3451E0&center=true&vCenter=true&width=760&lines=` +
    a.typing.map((l) => encodeURIComponent(l).replace(/%20/g, "+")).join(";");
  const stats = `bg_color=ffffff&title_color=0b1220&icon_color=3451e0&text_color=3d4452&border_color=e7e8ec&border_radius=16&show_icons=true`;
  const streak = `background=ffffff&border=e7e8ec&ring=3451e0&fire=7a4bf0&currStreakLabel=3451e0&sideLabels=0b1220&currStreakNum=0b1220&sideNums=0b1220&dates=6b7280&stroke=e7e8ec&border_radius=16`;

  const md: string[] = [];
  md.push(`<!-- Generated by robeul-console/readme/build.ts from src/data.ts. Edit the data, not this file. -->`);
  md.push(`<div align="center">\n\n${img("hero.svg", `${profile.name}, ${a.role}. Open the console.`, CONSOLE)}\n`);
  md.push(nav.map(([l, r], i) => `<a href="${r ? page(r) : CONSOLE}"><img src="${A}/nav-${i}.svg" height="36" alt="${l}" /></a>`).join("\n"));
  md.push(`\n<br/><br/>\n\n<a href="${CONSOLE}"><img src="${typing}" alt="${esc(a.typing[0])}" /></a>\n`);
  md.push(`<br/>\n\n${img("motion.svg", "From ICP to booked meeting: scrape, verify, dedupe, enrich, deliver, campaign", page("pipeline"))}\n`);
  md.push(`</div>\n\n<br/>\n\n<div align="center">\n`);

  md.push(head("Experience", "Where the work happens", a.withCompanies
    ? "Two US lead-generation companies, one founded company, and the tooling built around them."
    : "Two US lead-generation companies, and the tooling built around them.", "experience"));
  md.push("");
  exps.forEach((e) => md.push(img(`exp-${e.id}.svg`, `${e.role} at ${e.company}`, page(`experience/${e.id}`)) + "\n"));
  md.push(img("timeline.svg", "Career timeline", page("experience")));
  md.push(`\n<br/><br/>\n`);

  md.push(head("Case files", "Each project, told as a short documentary", "The problem, what was built, and the proof that it works. Click a chapter to read every act.", "projects"));
  md.push("");
  md.push(pair(caseItems));
  md.push(`\n<br/><br/>\n`);

  md.push(head("Skills", "What I actually use", "Eleven tracks, each backed by work that runs in production today.", "stack"));
  md.push("");
  md.push(img("skills.svg", "Skills by track", page("stack")));
  md.push("");
  md.push(img("tools.svg", "Tools I run every day", page("stack")));
  md.push(`
<br/><br/>

<a href="https://skillicons.dev"><img src="https://skillicons.dev/icons?i=python,ts,js,nextjs,react,nodejs,express,fastapi,graphql,postgres,supabase,elasticsearch,docker,linux,ubuntu,bash,powershell,nginx,cloudflare,aws,vercel,git,github,githubactions,kotlin,androidstudio,swift,vscode&perline=14&theme=light" alt="Tech stack icons" /></a>

</div>

<details>
<summary><b>Every skill, as a table</b></summary>
<br/>

| Track | What I actually use |
|---|---|
${Object.entries(stack).map(([t, items]) => `| **${t}** | ${items.join(", ")} |`).join("\n")}

</details>

<br/>

<div align="center">
`);

  md.push(head("The pipeline", "ICP in, verified leads out", "Every list goes through the same seven stages, so what reaches your inbox is accurate before anyone sends to it.", "pipeline"));
  md.push("");
  md.push(img("pipeline.svg", "The six-stage outbound data pipeline", page("pipeline")));
  md.push(`\n<br/>\n`);

  if (a.withCompanies) {
    const coItems: [string, string, string][] = companies.map((c) => [`co-${c.id}.svg`, `${c.name}: ${c.tagline}`, c.url ?? page("companies")]);
    coItems.push(["co-cta.svg", "Companies in the console", page("companies")]);
    md.push(head("Companies", "One data engine, several faces", "The agency, the SaaS, the execution engine, the agent runpack and the campaign factory.", "companies"));
    md.push("");
    md.push(pair(coItems));
    md.push(`\n<br/><br/>\n`);
  }

  md.push(head("Standards", "What you can hold me to", "Six commitments that come with every list, every server and every automation I deliver.", "standards"));
  md.push("");
  md.push(img("standards.svg", "Standards", page("standards")));
  md.push(`\n</div>\n`);

  md.push(`<br/>\n\n<div align="center">\n`);
  md.push(head("Activity", "Shipping, in public", "Live GitHub stats, styled to match.", "-"));
  md.push(`
<img height="170" src="https://github-readme-stats.vercel.app/api?username=${a.login}&include_all_commits=true&count_private=true&${stats}" alt="GitHub stats" />
${a.withLangs ? `<img height="170" src="https://github-readme-stats.vercel.app/api/top-langs/?username=${a.login}&layout=compact&langs_count=8&${stats}" alt="Top languages" />` : ""}

<img src="https://streak-stats.demolab.com?user=${a.login}&${streak}" alt="Streak" />
${a.withLangs ? `
<br/><br/>

<img src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${a.login}&theme=github" width="100%" alt="Profile details" />

<img height="180" src="https://github-profile-summary-cards.vercel.app/api/cards/productive-time?username=${a.login}&theme=github&utcOffset=6" alt="Productive time" />
<img height="180" src="https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=${a.login}&theme=github" alt="Commit languages" />
` : ""}
<br/><br/>

<img src="https://ghchart.rshah.org/3451e0/${a.login}" width="100%" alt="Contribution chart" />

<br/><br/>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${a.login}/${a.login}/output/github-snake-dark.svg" />
  <img src="https://raw.githubusercontent.com/${a.login}/${a.login}/output/github-snake.svg" width="100%" alt="Contribution snake" />
</picture>

<br/><br/>
`);
  md.push(img("connect.svg", "Let's build something you can trust", page("contact")));
  md.push("");
  const contacts: [string, string, boolean, string][] = [
    ["Email me", `mailto:${profile.email}`, true, "Gmail"],
    ["LinkedIn", profile.linkedin, false, "LinkedIn"],
    [a.other === "robeul-trusted-leads" ? "GitHub · work" : "GitHub · personal", `https://github.com/${a.other}`, false, "GitHub"],
    ...a.contacts.map(([l, href]): [string, string, boolean, string] => [l, href, false, l]),
    ["Open the console", CONSOLE, false, ""],
  ];
  contacts.forEach(([l, , p, icon], i) => put(`contact-${i}.svg`, button(l, p, icon).svg));
  md.push(contacts.map(([l, href], i) => `<a href="${href}"><img src="${A}/contact-${i}.svg" height="40" alt="${l}" /></a>`).join("\n"));
  md.push(`\n<br/><br/>\n<img src="https://komarev.com/ghpvc/?username=${a.login}&style=flat-square&color=3451e0&label=profile+views" alt="views" />\n\n</div>\n`);

  writeFileSync(join(out, "README.md"), md.join("\n"));
  console.log(`${a.login}: README + ${A}/*.svg written`);
};

accounts.forEach(build);
