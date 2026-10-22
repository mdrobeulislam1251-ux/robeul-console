// Generates both GitHub profile READMEs and their SVG cards from src/data.ts,
// using the same design tokens as the console app. Run: node readme/build.ts
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  companies,
  experiences,
  lessons,
  metrics,
  pipeline,
  profile,
  projects,
  rules,
  stack,
  type Company,
  type Experience,
  type Project,
  type Rule,
} from "../src/data.ts";

const root = dirname(fileURLToPath(import.meta.url));
const app = join(root, "..");
const CONSOLE = "https://mdrobeulislam1251-ux.github.io/robeul-console/";
const page = (route: string) => `${CONSOLE}#/${route}`;

// ---------- design tokens (mirror src/styles.css, dark theme) ----------
const T = {
  bg: "#070b16",
  bg2: "#0b1222",
  panel: "#0f172a",
  panel2: "#111c33",
  line: "#1e2a44",
  text: "#e6ecf8",
  muted: "#8b9ab8",
  dim: "#5b6b88",
  accent: "#38bdf8",
  accent2: "#2563eb",
  violet: "#a78bfa",
  ok: "#34d399",
};
const SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace";
const W = 1200;

// ---------- primitives ----------
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Rough text width for wrapping; system sans averages ~0.53em, bold ~0.58em, mono 0.6em. */
const measure = (s: string, fs: number, kind: "sans" | "bold" | "mono" = "sans") =>
  s.length * fs * (kind === "mono" ? 0.6 : kind === "bold" ? 0.58 : 0.53);

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

type TextOpts = { fs: number; fill?: string; weight?: number; mono?: boolean; lh?: number; anchor?: string; ls?: number };
const text = (x: number, y: number, lines: string | string[], o: TextOpts) => {
  const arr = Array.isArray(lines) ? lines : [lines];
  const lh = o.lh ?? Math.round(o.fs * 1.5);
  return arr
    .map(
      (l, i) =>
        `<text x="${x}" y="${y + i * lh}" font-size="${o.fs}" fill="${o.fill ?? T.text}"` +
        `${o.weight ? ` font-weight="${o.weight}"` : ""}${o.mono ? ` font-family="${MONO}"` : ""}` +
        `${o.anchor ? ` text-anchor="${o.anchor}"` : ""}${o.ls ? ` letter-spacing="${o.ls}"` : ""}>${esc(l)}</text>`,
    )
    .join("");
};

const chip = (x: number, y: number, label: string, color = T.muted, bg = T.panel2, fs = 14) => {
  const w = Math.round(measure(label, fs) + 26);
  return {
    w,
    svg:
      `<rect x="${x}" y="${y}" width="${w}" height="${fs + 16}" rx="${(fs + 16) / 2}" fill="${bg}" stroke="${T.line}"/>` +
      text(x + w / 2, y + fs + 4, label, { fs, fill: color, anchor: "middle" }),
  };
};

/** Lays chips out left-to-right, wrapping at maxX. Returns svg and the y below the last row. */
const chipRow = (x0: number, y0: number, maxX: number, labels: string[], color?: string, fs = 14) => {
  let x = x0,
    y = y0,
    out = "";
  for (const l of labels) {
    const c = chip(x, y, l, color, T.panel2, fs);
    if (x + c.w > maxX && x > x0) {
      x = x0;
      y += fs + 26;
      const c2 = chip(x, y, l, color, T.panel2, fs);
      out += c2.svg;
      x += c2.w + 8;
    } else {
      out += c.svg;
      x += c.w + 8;
    }
  }
  return { svg: out, bottom: y + fs + 16 };
};

const dataUri = (file: string) => {
  const buf = readFileSync(file);
  const mime = file.endsWith(".svg") ? "image/svg+xml" : "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
};
const logo = (rel: string) => dataUri(join(app, "public", rel.replace(/^\.\//, "")));

const defs = `<defs>
  <linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T.accent}"/><stop offset="1" stop-color="${T.violet}"/></linearGradient>
  <linearGradient id="btn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.accent2}"/><stop offset="1" stop-color="${T.accent}"/></linearGradient>
  <linearGradient id="bgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.bg2}"/><stop offset="1" stop-color="${T.bg}"/></linearGradient>
  <radialGradient id="glow" cx="0.85" cy="0.2" r="0.6"><stop offset="0" stop-color="${T.accent}" stop-opacity="0.16"/><stop offset="1" stop-color="${T.accent}" stop-opacity="0"/></radialGradient>
  <clipPath id="avatar"><circle cx="0" cy="0" r="1"/></clipPath>
  <style>
    .pulse { animation: p 2.2s ease-out infinite; } @keyframes p { 0% { opacity: .7; r: 6px; } 100% { opacity: 0; r: 16px; } }
    .row { opacity: 0; animation: in .5s ease forwards; } @keyframes in { to { opacity: 1; } }
    .blink { animation: b 1.1s steps(1) infinite; } @keyframes b { 50% { opacity: 0; } }
  </style>
</defs>`;

const svg = (w: number, h: number, body: string, label: string, glow = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${SANS}" role="img" aria-label="${esc(label)}">${defs}` +
  `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="20" fill="url(#bgg)" stroke="${T.line}" stroke-width="2"/>` +
  (glow ? `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="20" fill="url(#glow)"/>` : "") +
  body +
  `</svg>`;

const pulseDot = (cx: number, cy: number) =>
  `<circle cx="${cx}" cy="${cy}" r="6" fill="${T.ok}"/><circle class="pulse" cx="${cx}" cy="${cy}" r="6" fill="${T.ok}"/>`;

const check = (x: number, y: number) =>
  `<path d="M${x} ${y} l5 5 l10 -10" fill="none" stroke="${T.ok}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;

// ---------- account variants ----------
type Account = {
  login: string;
  other: string;
  role: string;
  tagline: string;
  lede: string;
  experienceIds: string[];
  ruleIds: string[];
  withCompanies: boolean;
  withBrain: boolean;
};

const accounts: Account[] = [
  {
    login: "robeul-trusted-leads",
    other: "mdrobeulislam1251-ux",
    role: "Head Data Engineer · Trusted Leads",
    tagline: "B2B lead data · verification pipelines · AI automation",
    lede: "I turn a customer's ICP into an accurate, verified, ready-to-send lead list. At Trusted Leads I own the outbound pipeline end to end: extraction, waterfall verification, decision-maker resolution and delivery.",
    experienceIds: ["trusted-leads", "lead-gen-jay", "tex-llm"],
    ruleIds: ["r1", "r3", "r4", "r5", "r7"],
    withCompanies: false,
    withBrain: false,
  },
  {
    login: "mdrobeulislam1251-ux",
    other: "robeul-trusted-leads",
    role: "AI-Native Data & Automation Engineer",
    tagline: "GTM data systems · agent infrastructure · self-hosted ops",
    lede: "I build the data and automation systems that turn a raw ICP into booked meetings, plus the self-hosted infrastructure they run on, and multi-agent AI that is verified before it may say \"done\".",
    experienceIds: ["trusted-leads", "lead-gen-jay", "outboundrix"],
    ruleIds: rules.map((r) => r.id),
    withCompanies: true,
    withBrain: true,
  },
];

// ---------- components ----------
const avatarUri = (login: string) => dataUri(join(root, "avatars", `${login}.png`));

const hero = (a: Account) => {
  let b = "";
  // window chrome
  b += `<rect x="1" y="1" width="${W - 2}" height="52" rx="20" fill="${T.panel2}"/><rect x="1" y="34" width="${W - 2}" height="19" fill="${T.panel2}"/>`;
  b += `<line x1="1" y1="53" x2="${W - 1}" y2="53" stroke="${T.line}" stroke-width="2"/>`;
  b += [28, 48, 68].map((x) => `<circle cx="${x}" cy="27" r="6" fill="${T.line}"/>`).join("");
  b += `<rect x="420" y="12" width="360" height="30" rx="9" fill="${T.panel}" stroke="${T.line}"/>`;
  b += text(600, 32, "robeul.console  /  welcome", { fs: 13, fill: T.muted, mono: true, anchor: "middle" });
  b += `<rect x="1012" y="13" width="166" height="28" rx="14" fill="${T.ok}" fill-opacity=".1" stroke="${T.ok}" stroke-opacity=".45"/>`;
  b += check(1028, 27) + text(1110, 32, "all checks green", { fs: 13, fill: T.ok, anchor: "middle" });

  // left column
  const x = 56;
  b += pulseDot(x + 6, 104) + text(x + 22, 109, "WELCOME, THANKS FOR STOPPING BY", { fs: 14, fill: T.accent, weight: 700, ls: 2 });
  b += text(x, 168, profile.name, { fs: 54, weight: 800 });
  b += text(x, 204, a.role, { fs: 20, fill: T.muted });
  b += text(x, 262, ["I build systems you don't", "have to double-check."], { fs: 38, weight: 800, fill: "url(#ac)", lh: 46 });
  const lede = wrap(a.lede, 640, 17);
  b += text(x, 350, lede, { fs: 17, fill: T.muted, lh: 26 });
  const noteY = 350 + lede.length * 26 + 8;
  const note = wrap(
    "Trust is the product. Status 200 is not correct work, so I show the check, not just the claim. If something here isn't true, it shouldn't be here.",
    600,
    15.5,
  );
  const noteH = 48 + note.length * 23 + 26;
  b += `<rect x="${x}" y="${noteY}" width="660" height="${noteH}" rx="14" fill="${T.panel}" stroke="${T.line}"/>`;
  b += `<rect x="${x}" y="${noteY}" width="4" height="${noteH}" rx="2" fill="${T.accent}"/>`;
  b += text(x + 24, noteY + 32, "A note before you scroll.", { fs: 16, weight: 700 });
  b += text(x + 24, noteY + 58, note, { fs: 15.5, fill: T.muted, lh: 23 });
  b += text(x + 24, noteY + 58 + note.length * 23 + 6, `— ${profile.name}`, { fs: 15, fill: T.text });
  const btnY = noteY + noteH + 26;
  b += `<rect x="${x}" y="${btnY}" width="260" height="52" rx="13" fill="url(#btn)"/>`;
  b += text(x + 130, btnY + 33, "Open the console  →", { fs: 18, weight: 700, fill: "#fff", anchor: "middle" });
  let cx = x + 280;
  for (const l of ["Bogura, Bangladesh", "Remote · US hours", "Bengali · English"]) {
    const c = chip(cx, btnY + 11, l, T.muted, T.panel, 13.5);
    b += c.svg;
    cx += c.w + 8;
  }

  // right column: avatar + live log
  const ax = 958,
    ay = 168,
    r = 82;
  b += `<circle cx="${ax}" cy="${ay}" r="${r + 7}" fill="none" stroke="url(#ac)" stroke-width="4"/>`;
  b += `<clipPath id="av"><circle cx="${ax}" cy="${ay}" r="${r}"/></clipPath>`;
  b += `<image href="${avatarUri(a.login)}" x="${ax - r}" y="${ay - r}" width="${r * 2}" height="${r * 2}" clip-path="url(#av)"/>`;
  b += pulseDot(ax - 92, 296) + text(ax - 76, 301, "Available for conversations", { fs: 15, fill: T.text });
  b += text(ax, 326, a.tagline, { fs: 13.5, fill: T.muted, anchor: "middle" });

  const lx = 770,
    ly = 350,
    lw = 384,
    lh = 238;
  b += `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="14" fill="${T.panel}" stroke="${T.line}"/>`;
  b += `<path d="M${lx} ${ly + 14} a14 14 0 0 1 14 -14 h${lw - 28} a14 14 0 0 1 14 14 v20 h-${lw} z" fill="${T.panel2}"/>`;
  b += [18, 34, 50].map((d) => `<circle cx="${lx + d}" cy="${ly + 17}" r="5" fill="${T.line}"/>`).join("");
  b += text(lx + 70, ly + 22, "verify.log", { fs: 12.5, fill: T.muted, mono: true });
  const log: [string, string, string][] = [
    ["$", "claim issue", "edits unlocked"],
    ["✓", "typecheck · drift · contract", "pass"],
    ["✓", "waterfall verify", "source tracked"],
    ["✓", "dedupe vs past deliveries", "dropped"],
    ["✓", "reviewer model", "approved"],
    ["●", "observed passing · done", ""],
  ];
  log.forEach(([m, s, o], i) => {
    const y = ly + 66 + i * 30;
    const final = m === "●";
    b += `<g class="row" style="animation-delay:${0.3 + i * 0.55}s">`;
    b += text(lx + 18, y, m, { fs: 13, fill: T.ok, mono: true });
    b += text(lx + 40, y, s, { fs: 13, fill: final ? T.ok : T.text, mono: true });
    if (o) b += text(lx + lw - 18, y, o, { fs: 12.5, fill: T.muted, mono: true, anchor: "end" });
    if (final) b += `<rect class="blink" x="${lx + 230}" y="${y - 12}" width="8" height="15" fill="${T.accent}"/>`;
    b += `</g>`;
  });

  // metrics strip
  const my = btnY + 52 + 36,
    H = my + 96 + 40,
    gap = 12,
    mw = (W - 112 - gap * 5) / 6;
  metrics.forEach((m, i) => {
    const mx = 56 + i * (mw + gap);
    b += `<rect x="${mx}" y="${my}" width="${mw}" height="96" rx="14" fill="${T.panel}" stroke="${T.line}"/>`;
    b += text(mx + 18, my + 40, `${m.value}${m.suffix}`, { fs: 28, weight: 800 });
    b += text(mx + 18, my + 64, m.label, { fs: 13.5, weight: 600 });
    b += text(mx + 18, my + 83, wrap(m.hint, mw - 30, 11.5, "sans", 1), { fs: 11.5, fill: T.muted });
  });
  return svg(W, H, b, `${profile.name}, ${a.role}. Open the console.`, true);
};

const button = (label: string, primary = false) => {
  const w = Math.round(measure(label, 16, "bold") + 48);
  return {
    w,
    svg:
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="46" viewBox="0 0 ${w} 46" font-family="${SANS}" role="img" aria-label="${esc(label)}">${defs}` +
      `<rect x="1" y="1" width="${w - 2}" height="44" rx="12" fill="${primary ? "url(#btn)" : T.panel}" stroke="${primary ? "none" : T.line}" stroke-width="2"/>` +
      text(w / 2, 29, label, { fs: 16, weight: 600, fill: primary ? "#fff" : T.text, anchor: "middle" }) +
      `</svg>`,
  };
};

const sectionHead = (n: number, eyebrow: string, title: string, sub: string, link = "Open in console  →") => {
  const subLines = wrap(sub, 820, 16);
  const H = 110 + (subLines.length - 1) * 24 + 30;
  let b = "";
  b += text(40, 44, `${String(n).padStart(2, "0")} · ${eyebrow.toUpperCase()}`, { fs: 14, fill: T.accent, weight: 700, mono: true, ls: 1.5 });
  b += text(40, 84, title, { fs: 32, weight: 800 });
  b += text(40, 110, subLines, { fs: 16, fill: T.muted, lh: 24 });
  if (link) b += text(W - 40, 84, link, { fs: 16, fill: T.accent, weight: 600, anchor: "end" });
  return svg(W, H, b, `${eyebrow}: ${title}`);
};

const experienceCard = (x: Experience) => {
  const bullets = x.bullets.slice(0, 3).map((t) => wrap(t, 960, 16));
  const summary = wrap(x.summary, 1000, 17);
  let y = 150;
  let b = "";
  b += `<rect x="36" y="34" width="72" height="72" rx="16" fill="${T.panel2}" stroke="${T.line}"/>`;
  b += `<image href="${logo(x.logo)}" x="46" y="44" width="52" height="52"/>`;
  b += text(132, 52, x.period.toUpperCase(), { fs: 13, fill: T.violet, mono: true, ls: 1 });
  b += text(132, 86, `${x.role} · ${x.company}`, { fs: 26, weight: 800 });
  b += text(132, 112, x.meta, { fs: 15, fill: T.muted });
  b += text(W - 40, 52, "Open  →", { fs: 15, fill: T.accent, weight: 600, anchor: "end" });
  b += text(132, y, summary, { fs: 17, lh: 25 });
  y += summary.length * 25 + 10;
  for (const lines of bullets) {
    b += check(134, y - 6) + text(162, y, lines, { fs: 16, fill: T.muted, lh: 24 });
    y += lines.length * 24 + 10;
  }
  const chips = chipRow(132, y + 2, W - 40, x.stack, T.muted, 13);
  b += chips.svg;
  return svg(W, chips.bottom + 34, b, `${x.role} at ${x.company}`);
};

const CASE_W = 590,
  CASE_H = 400;
const caseCard = (p: Project) => {
  let b = "";
  const cat = { Data: T.accent, Infrastructure: T.ok, "AI Agents": T.violet }[p.category];
  b += text(30, 46, `CHAPTER ${String(p.chapter).padStart(2, "0")}`, { fs: 13, fill: T.violet, weight: 700, mono: true, ls: 1.5 });
  b += `<rect x="${CASE_W - 76}" y="26" width="48" height="48" rx="12" fill="${T.panel2}" stroke="${T.line}"/>`;
  b += `<image href="${logo(p.logo)}" x="${CASE_W - 68}" y="34" width="32" height="32"/>`;
  const title = wrap(p.title, 450, 24, "bold", 2);
  b += text(30, 88, title, { fs: 24, weight: 800, lh: 30 });
  let y = 88 + title.length * 30 + 6;
  b += text(30, y, `${p.org} · ${p.year}`, { fs: 14, fill: T.muted });
  const c = chip(30 + measure(`${p.org} · ${p.year}`, 14) + 14, y - 17, p.category, cat, T.panel2, 12.5);
  b += c.svg;
  y += 34;
  b += text(30, y, "THE PROBLEM", { fs: 11.5, fill: T.accent, weight: 700, mono: true, ls: 1.5 });
  b += text(30, y + 24, wrap(p.problem, 520, 15.5, "sans", 3), { fs: 15.5, fill: T.text, lh: 23 });
  const proof = wrap(p.proof, 500, 14.5, "sans", 2);
  const py = CASE_H - 46 - proof.length * 21 - 30;
  b += `<rect x="30" y="${py}" width="${CASE_W - 60}" height="${proof.length * 21 + 46}" rx="12" fill="${T.ok}" fill-opacity=".08" stroke="${T.ok}" stroke-opacity=".35"/>`;
  b += text(48, py + 24, "THE PROOF", { fs: 11.5, fill: T.ok, weight: 700, mono: true, ls: 1.5 });
  b += text(48, py + 46, proof, { fs: 14.5, fill: T.text, lh: 21 });
  return svg(CASE_W, CASE_H, b, `Case file: ${p.title}`);
};

const ctaCard = (eyebrow: string, title: string, sub: string, h: number) => {
  let b = "";
  b += `<rect x="1" y="1" width="${CASE_W - 2}" height="${h - 2}" rx="20" fill="url(#glow)"/>`;
  b += text(CASE_W / 2, h / 2 - 40, eyebrow, { fs: 13, fill: T.accent, weight: 700, mono: true, ls: 1.5, anchor: "middle" });
  b += text(CASE_W / 2, h / 2, title, { fs: 26, weight: 800, anchor: "middle" });
  b += text(CASE_W / 2, h / 2 + 30, sub, { fs: 15, fill: T.muted, anchor: "middle" });
  b += `<rect x="${CASE_W / 2 - 110}" y="${h / 2 + 56}" width="220" height="46" rx="12" fill="url(#btn)"/>`;
  b += text(CASE_W / 2, h / 2 + 85, "Open the console  →", { fs: 16, weight: 700, fill: "#fff", anchor: "middle" });
  return svg(CASE_W, h, b, title, true);
};

const pipelineCard = () => {
  const H = 300,
    n = pipeline.length,
    gap = 14,
    nw = (W - 80 - gap * (n - 1)) / n;
  let b = "";
  b += `<rect x="40" y="38" width="${W - 80}" height="5" rx="2.5" fill="${T.line}"/>`;
  b += `<rect x="40" y="38" width="${W - 80}" height="5" rx="2.5" fill="url(#ac)"/>`;
  pipeline.forEach((p, i) => {
    const x = 40 + i * (nw + gap);
    b += `<rect x="${x}" y="68" width="${nw}" height="${H - 104}" rx="14" fill="${T.panel}" stroke="${i === n - 1 ? T.ok : T.line}"/>`;
    b += text(x + 18, 100, String(i + 1).padStart(2, "0"), { fs: 13, fill: i === n - 1 ? T.ok : T.accent, mono: true, weight: 700 });
    b += text(x + 18, 130, p.label, { fs: 18, weight: 800 });
    b += text(x + 18, 160, wrap(p.detail, nw - 32, 13.5, "sans", 5), { fs: 13.5, fill: T.muted, lh: 20 });
    if (i < n - 1) b += text(x + nw + gap / 2, 132, "›", { fs: 22, fill: T.dim, anchor: "middle" });
  });
  return svg(W, H, b, "The pipeline: ICP in, verified leads out");
};

const doctrineCard = (ruleList: Rule[], withLessons: boolean) => {
  const words = ["NO GUESS", "NO TRUST", "GREEN CHECK", "STOP ON RED", "IDEMPOTENT", "NO FAKE DONE"];
  let b = "";
  let x = 40;
  for (const w of words) {
    const cw = Math.round(measure(w, 14, "mono") + 30);
    b += `<rect x="${x}" y="34" width="${cw}" height="38" rx="10" fill="${T.panel}" stroke="${T.line}"/>`;
    b += text(x + cw / 2, 58, w, { fs: 14, fill: T.accent, weight: 700, mono: true, anchor: "middle" });
    x += cw + 10;
  }
  const cols = 3,
    gap = 14,
    cw = (W - 80 - gap * (cols - 1)) / cols,
    ch = 168;
  ruleList.forEach((r, i) => {
    const cx = 40 + (i % cols) * (cw + gap),
      cy = 96 + Math.floor(i / cols) * (ch + gap);
    b += `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="14" fill="${T.panel}" stroke="${T.line}"/>`;
    b += text(cx + cw - 20, cy + 70, String(r.n), { fs: 64, weight: 800, fill: T.line, anchor: "end" });
    const t = wrap(r.title, cw - 90, 18, "bold", 2);
    b += text(cx + 22, cy + 40, t, { fs: 18, weight: 800, lh: 24 });
    b += text(cx + 22, cy + 40 + t.length * 24 + 12, wrap(r.detail, cw - 44, 14, "sans", 3), { fs: 14, fill: T.muted, lh: 20 });
  });
  let y = 96 + Math.ceil(ruleList.length / cols) * (ch + gap) + 10;
  if (withLessons) {
    b += text(40, y + 26, "LESSONS THAT BECAME RULES", { fs: 13, fill: T.violet, weight: 700, mono: true, ls: 1.5 });
    y += 44;
    b += `<rect x="40" y="${y}" width="${W - 80}" height="${lessons.length * 44 + 8}" rx="14" fill="${T.panel}" stroke="${T.line}"/>`;
    lessons.forEach((l, i) => {
      const ry = y + 32 + i * 44;
      if (i) b += `<line x1="56" y1="${ry - 28}" x2="${W - 56}" y2="${ry - 28}" stroke="${T.line}"/>`;
      b += text(62, ry, wrap(l.lesson, 520, 14.5, "sans", 1), { fs: 14.5, fill: T.muted });
      b += text(620, ry, "→", { fs: 15, fill: T.dim });
      b += text(650, ry, wrap(l.rule, 500, 14.5, "bold", 1), { fs: 14.5, weight: 700 });
    });
    y += lessons.length * 44 + 8 + 10;
  }
  return svg(W, y + 30, b, "Doctrine: six words, then the kill switches");
};

const stackCard = () => {
  const entries = Object.entries(stack);
  const cols = 2,
    gap = 14,
    cw = (W - 80 - gap) / cols;
  let b = "";
  let rowY = 30;
  for (let i = 0; i < entries.length; i += cols) {
    let rowH = 0;
    const parts: string[] = [];
    entries.slice(i, i + cols).forEach(([track, items], j) => {
      const cx = 40 + j * (cw + gap);
      const chips = chipRow(cx + 20, rowY + 54, cx + cw - 20, items, T.text, 13.5);
      rowH = Math.max(rowH, chips.bottom - rowY + 22);
      parts.push(`__RECT${j}__` + text(cx + 20, rowY + 36, track, { fs: 17, weight: 800 }) + chips.svg);
    });
    b += parts
      .map((p, j) =>
        p.replace(`__RECT${j}__`, `<rect x="${40 + j * (cw + gap)}" y="${rowY}" width="${cw}" height="${rowH}" rx="14" fill="${T.panel}" stroke="${T.line}"/>`),
      )
      .join("");
    rowY += rowH + gap;
  }
  return svg(W, rowY + 16, b, "Stack: what I actually use");
};

const COMPANY_H = 250;
const companyCard = (c: Company) => {
  let b = "";
  b += `<rect x="30" y="30" width="${c.id === "ready-list" ? 150 : 64}" height="64" rx="14" fill="${T.panel2}" stroke="${T.line}"/>`;
  b +=
    c.id === "ready-list"
      ? `<image href="${logo(c.logo)}" x="40" y="42" width="130" height="43"/>`
      : `<image href="${logo(c.logo)}" x="40" y="40" width="44" height="44"/>`;
  b += text(30, 132, c.name, { fs: 24, weight: 800 });
  b += text(30, 158, c.tagline, { fs: 14.5, fill: T.accent, weight: 600 });
  b += text(30, 188, wrap(c.body, 520, 15, "sans", 2), { fs: 15, fill: T.muted, lh: 22 });
  if (c.url) b += text(CASE_W - 30, 58, `${new URL(c.url).hostname.replace("www.", "")}  ↗`, { fs: 14, fill: T.accent, anchor: "end" });
  return svg(CASE_W, COMPANY_H, b, `${c.name}: ${c.tagline}`);
};

const brainCard = () => {
  const stats: [string, string][] = [
    ["541", "curated notes"],
    ["3,141", "archived session logs"],
    ["571", "sessions audited"],
    ["7", "kill switches"],
    ["53 / 44", "agents / doctrine skills"],
  ];
  const principles: [string, string][] = [
    ["Live beats notes.", "Every fact carries the command that proved it, and the date."],
    ["Decisions, not diaries.", "Git records the doing. The brain records the why and what was rejected."],
    ["An emotion governor.", "Each message is classified (Frustrated, Correction, Build, Ask, Focus) and the agent adapts."],
    ["Per-project brains.", "Boundaries, verified state and a verification recipe, loaded at session start."],
  ];
  const gap = 12,
    sw = (W - 80 - gap * 4) / 5;
  let b = "";
  stats.forEach(([v, l], i) => {
    const x = 40 + i * (sw + gap);
    b += `<rect x="${x}" y="30" width="${sw}" height="90" rx="14" fill="${T.panel}" stroke="${T.line}"/>`;
    b += text(x + 20, 72, v, { fs: 30, weight: 800 });
    b += text(x + 20, 98, l, { fs: 13.5, fill: T.muted });
  });
  const cw = (W - 80 - 14) / 2;
  principles.forEach(([h, d], i) => {
    const x = 40 + (i % 2) * (cw + 14),
      y = 140 + Math.floor(i / 2) * 104;
    b += `<rect x="${x}" y="${y}" width="${cw}" height="90" rx="14" fill="${T.panel}" stroke="${T.line}"/>`;
    b += check(x + 22, y + 32) + text(x + 50, y + 38, h, { fs: 17, weight: 800 });
    b += text(x + 50, y + 64, wrap(d, cw - 80, 14, "sans", 2), { fs: 14, fill: T.muted, lh: 20 });
  });
  return svg(W, 140 + 2 * 104 + 20, b, "The second brain");
};

const devLoopCard = () => {
  const g: [string, string][] = [
    ["Commits only through gates", "typecheck · API drift · sweep contract. Fail = no commit, error posted to the issue."],
    ["The dev server cannot push", "No token, no helper, no gh. git push denied in settings."],
    ["Server → laptop only on request", "No cron, no watcher, no timer."],
    ["Laptop → GitHub on one branch", "Branch hardcoded in the publisher; protected branches refused."],
    ["The owner merges", "main is read-only to the whole system."],
    ["No credentials reach GitHub", "A content-scanning guard aborts on JWTs, keys and tokens."],
  ];
  const cols = 3,
    gap = 14,
    cw = (W - 80 - gap * 2) / cols,
    ch = 136;
  let b = "";
  g.forEach(([h, d], i) => {
    const x = 40 + (i % cols) * (cw + gap),
      y = 30 + Math.floor(i / cols) * (ch + gap);
    b += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="14" fill="${T.panel}" stroke="${T.line}"/>`;
    b += text(x + 22, y + 36, `GUARANTEE ${i + 1}`, { fs: 12, fill: T.violet, weight: 700, mono: true, ls: 1.5 });
    b += text(x + 22, y + 64, wrap(h, cw - 44, 17, "bold", 1), { fs: 17, weight: 800 });
    b += text(x + 22, y + 90, wrap(d, cw - 44, 13.5, "sans", 2), { fs: 13.5, fill: T.muted, lh: 20 });
  });
  return svg(W, 30 + 2 * (ch + gap) + 16, b, "The dev loop and its six guarantees");
};

const connectCard = (a: Account) => {
  const H = 300;
  let b = "";
  const ax = 600,
    r = 54;
  b += `<circle cx="${ax}" cy="84" r="${r + 6}" fill="none" stroke="url(#ac)" stroke-width="4"/>`;
  b += `<clipPath id="av2"><circle cx="${ax}" cy="84" r="${r}"/></clipPath>`;
  b += `<image href="${avatarUri(a.login)}" x="${ax - r}" y="${84 - r}" width="${r * 2}" height="${r * 2}" clip-path="url(#av2)"/>`;
  b += pulseDot(470, 177) + text(486, 182, "OPEN TO CONVERSATIONS", { fs: 13, fill: T.accent, weight: 700, ls: 2 });
  b += text(600, 228, "Let's build something you can trust.", { fs: 32, weight: 800, anchor: "middle" });
  b += text(600, 262, `Data engineering, verification pipelines, agent infrastructure · remote on US hours from ${profile.location}`, {
    fs: 15.5,
    fill: T.muted,
    anchor: "middle",
  });
  return svg(W, H, b, "Contact: let's build something you can trust", true);
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
    ["Doctrine", "doctrine", false],
    ["Stack", "stack", false],
    ["Contact", "contact", false],
  ];
  nav.forEach(([l, , p], i) => put(`nav-${i}.svg`, button(l, p).svg));

  const exps = a.experienceIds.map((id) => experiences.find((e) => e.id === id)!);
  exps.forEach((e) => put(`exp-${e.id}.svg`, experienceCard(e)));
  projects.forEach((p) => put(`case-${p.id}.svg`, caseCard(p)));
  put("case-cta.svg", ctaCard("THE FULL DOCUMENTARY", "Every chapter, in the console", "Filter, search, and read each act.", CASE_H));
  put("pipeline.svg", pipelineCard());
  const ruleList = rules.filter((r) => a.ruleIds.includes(r.id));
  put("doctrine.svg", doctrineCard(ruleList, a.withBrain));
  put("stack.svg", stackCard());
  if (a.withCompanies) {
    companies.forEach((c) => put(`co-${c.id}.svg`, companyCard(c)));
    put("co-cta.svg", ctaCard("ONE DATA ENGINE", "Several faces", "See how they fit together.", COMPANY_H));
  }
  if (a.withBrain) {
    put("brain.svg", brainCard());
    put("devloop.svg", devLoopCard());
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

  const caseItems: [string, string, string][] = projects.map((p) => [`case-${p.id}.svg`, `Case file: ${p.title}`, page(`projects/${p.id}`)]);
  caseItems.push(["case-cta.svg", "All case files in the console", page("projects")]);

  const statsQ = `bg_color=0f172a&title_color=38bdf8&icon_color=a78bfa&text_color=8b9ab8&border_color=1e2a44&border_radius=20&show_icons=true`;

  const md: string[] = [];
  md.push(`<!-- Generated by robeul-console/readme/build.ts from src/data.ts. Edit the data, not this file. -->`);
  md.push(`<div align="center">\n\n${img("hero.svg", `${profile.name}, ${a.role}. Open the console.`, CONSOLE)}\n`);
  md.push(nav.map(([l, r], i) => `<a href="${r ? page(r) : CONSOLE}"><img src="${A}/nav-${i}.svg" height="36" alt="${l}" /></a>`).join("\n"));
  md.push(`\n</div>\n\n<br/>\n`);

  md.push(`<div align="center">\n`);
  md.push(head("Experience", "Where the work happens", "Two US lead-generation companies and the systems I build to keep the work honest.", "experience"));
  md.push("");
  exps.forEach((e) => md.push(img(`exp-${e.id}.svg`, `${e.role} at ${e.company}`, page(`experience/${e.id}`)) + "\n"));
  md.push(`<br/>\n`);

  md.push(head("Case files", "Each project, told as a short documentary", "The problem, what was built, and the proof that it works. Click a chapter to read every act.", "projects"));
  md.push("");
  md.push(pair(caseItems));
  md.push(`\n<br/><br/>\n`);

  md.push(head("The pipeline", "ICP in, verified leads out", "Every list goes through the same six stages. No client file ships until the row count and ICP are approved.", "pipeline"));
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

  md.push(
    head(
      "Doctrine",
      a.withBrain ? "Six words, then seven kill switches" : "How I work",
      "These live in the brain every agent loads before it touches my work. They came from auditing 571 real sessions.",
      "doctrine",
    ),
  );
  md.push("");
  md.push(img("doctrine.svg", "Doctrine and kill switches", page("doctrine")));
  md.push(`\n</div>\n`);

  if (a.withBrain) {
    md.push(`<details>
<summary><b>Operating rules, distilled from a 571-session audit</b></summary>

\`\`\`text
1  NO FALSE DONE                      5  REMOVE, DON'T ADD
2  BUILD ONLY THE NAMED NOUN + PATH   6  ONE WORKSPACE, DEPLOY IT
3  STOP GAZING, LOAD STATE FIRST      7  ON ANGER -> KILL, THEN ACT
4  FOLLOW HIS DOCUMENTED PATTERN
\`\`\`

Default to execution, not questions. Minimum-viable-correct: do it natively, don't over-build. Finish one layer before the next. Stuck means "tried X, saw Y, stuck at Z". Three failed attempts or two repeated corrections is a hard stop.

</details>

<details>
<summary><b>In my own words</b>: what I actually typed into agent sessions</summary>
<br/>

> "The agent should behave like my real worker."

> "If something is actually not possible with the current resources, say so honestly, rather than trying it with a 0% chance of winning."

> "Stop the circling. Complete the config, done, or say not possible."

</details>
`);
    md.push(`<br/>\n\n<div align="center">\n`);
    md.push(head("Second brain", "The brain is a file system, not a chat history", "Versioned, so it survives machines. One machine + GitHub, nothing else.", "-"));
    md.push("");
    md.push(img("brain.svg", "The second brain"));
    md.push(`\n<br/>\n`);
    md.push(head("Dev loop", "Six guarantees, enforced by the system", "Gates decide what gets committed. The owner decides what gets merged.", "-"));
    md.push("");
    md.push(img("devloop.svg", "The dev loop and its six guarantees"));
    md.push(`\n</div>\n`);
  }

  md.push(`<br/>\n\n<div align="center">\n`);
  md.push(head("Stack", "What I actually use", "Only tools that run in production today.", "stack"));
  md.push("");
  md.push(img("stack.svg", "Tech stack", page("stack")));
  md.push(`\n<br/>\n`);

  md.push(head("Activity", "Shipping, in public", "Live GitHub stats, styled to match.", "-"));
  md.push(`
<img height="170" src="https://github-readme-stats.vercel.app/api?username=${a.login}&include_all_commits=true&count_private=true&${statsQ}" alt="GitHub stats" />
${a.withBrain ? `<img height="170" src="https://github-readme-stats.vercel.app/api/top-langs/?username=${a.login}&layout=compact&langs_count=8&${statsQ}" alt="Top languages" />` : ""}

<img src="https://streak-stats.demolab.com?user=${a.login}&background=0f172a&border=1e2a44&ring=38bdf8&fire=a78bfa&currStreakLabel=38bdf8&sideLabels=e6ecf8&currStreakNum=e6ecf8&sideNums=e6ecf8&dates=8b9ab8&stroke=1e2a44&border_radius=20" alt="Streak" />

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${a.login}/${a.login}/output/github-snake-dark.svg" />
  <img src="https://raw.githubusercontent.com/${a.login}/${a.login}/output/github-snake.svg" width="100%" alt="contribution snake" />
</picture>

<br/><br/>
`);
  md.push(img("connect.svg", "Let's build something you can trust", page("contact")));
  md.push("");
  const contacts: [string, string, boolean][] = [
    ["Email me", `mailto:${profile.email}`, true],
    ["LinkedIn", profile.linkedin, false],
    [a.other === "robeul-trusted-leads" ? "GitHub · work" : "GitHub · personal", `https://github.com/${a.other}`, false],
    ["Open the console", CONSOLE, false],
  ];
  contacts.forEach(([l, , p], i) => put(`contact-${i}.svg`, button(l, p).svg));
  md.push(contacts.map(([l, href], i) => `<a href="${href}"><img src="${A}/contact-${i}.svg" height="40" alt="${l}" /></a>`).join("\n"));
  md.push(`\n<br/><br/>\n<img src="https://komarev.com/ghpvc/?username=${a.login}&style=flat-square&color=0f172a&label=profile+views" alt="views" />\n\n</div>\n`);

  writeFileSync(join(out, "README.md"), md.join("\n"));
  console.log(`${a.login}: README + ${A}/*.svg written`);
};

accounts.forEach(build);
