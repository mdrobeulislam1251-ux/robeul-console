export type Experience = {
  id: string;
  role: string;
  company: string;
  url?: string;
  logo: string;
  period: string;
  meta: string;
  summary: string;
  bullets: string[];
  stack: string[];
};

export type Project = {
  id: string;
  chapter: number;
  title: string;
  org: string;
  year: string;
  logo: string;
  url?: string;
  category: "Data" | "Infrastructure" | "Automation" | "AI Agents" | "Product";
  problem: string;
  build: string[];
  proof: string;
  stack: string[];
};

export type Company = {
  id: string;
  name: string;
  tagline: string;
  url?: string;
  logo: string;
  body: string;
};

export type Standard = {
  id: string;
  n: number;
  title: string;
  detail: string;
};

export const profile = {
  name: "MD Robeul Islam",
  title: "Head Data Engineer · AI-Native Automation",
  location: "Bogura, Bangladesh",
  hours: "Remote · US hours",
  email: "mdrobeulislam1251@gmail.com",
  linkedin: "https://www.linkedin.com/in/mdrobeulislam1251",
  github: {
    work: "https://github.com/robeul-trusted-leads",
    personal: "https://github.com/mdrobeulislam1251-ux",
  },
  avatar: "./avatar.png",
};

export const metrics = [
  { value: 17.4, suffix: "M", decimals: 1, label: "B2B contacts searchable", hint: "one database, 69 filters" },
  { value: 600, suffix: "k", decimals: 0, label: "rows per export", hint: "verified before delivery" },
  { value: 27.4, suffix: "M", decimals: 1, label: "records migrated", hint: "72 GB, checked before cutover" },
  { value: 62, suffix: " min", decimals: 0, label: "to reprocess 13.4M rows", hint: "down from about 6 hours" },
  { value: 10, suffix: "+", decimals: 0, label: "servers run", hint: "on a private network" },
  { value: 40, suffix: "+", decimals: 0, label: "n8n workflows", hint: "in production" },
];

export const experiences: Experience[] = [
  {
    id: "trusted-leads",
    role: "Head Data Engineer",
    company: "Trusted Leads",
    url: "https://trustedleads.io",
    logo: "./logos/trustedleads.png",
    period: "Aug 2024 – Present",
    meta: "Full-time · Remote · St. Petersburg, FL (US)",
    summary:
      "Own the outbound data infrastructure end to end: the extraction engine, the contact database and the servers they run on.",
    bullets: [
      "ICP-based prospect extraction driven by each customer's own targeting rules, across several sources at once.",
      "Waterfall email verification across several providers, with the source tracked on every record.",
      "Designed and operate the multi-tenant contact database behind the customer app: 17M+ contacts behind one keyed API.",
      "Run the servers it lives on: provisioning, private networking, TLS, backups and deploys that roll back on failure.",
      "Lead the data engineering team, set the schema and verification standards, and direct the AI agents that do the build work.",
    ],
    stack: ["Python", "PostgreSQL", "Node.js", "n8n", "Docker", "Tailscale", "Cloudflare Tunnels", "Caddy", "Apollo.io"],
  },
  {
    id: "lead-gen-jay",
    role: "Senior Data Engineer",
    company: "Lead Gen Jay",
    url: "https://leadgenjay.com",
    logo: "./logos/leadgenjay.png",
    period: "Aug 2024 – Present",
    meta: "Contract · Remote · St. Petersburg, FL (US)",
    summary: "Large-scale prospect extraction, enrichment and verification for a team that ships lead lists at volume.",
    bullets: [
      "ICP segmentation and list building against each customer's targeting criteria.",
      "Email verification and data-quality checks before delivery, so every list is ready to send.",
      "Moved a 27.4M-record contact index (72 GB) to a new server over a private network, verified before cutover.",
      "When a campaign underperforms, find the cause (list building, data accuracy or mailbox health) and fix it upstream.",
    ],
    stack: ["Python", "PostgreSQL", "n8n", "WireGuard", "MillionVerifier", "Reacher", "Smartlead", "Instantly"],
  },
  {
    id: "outboundrix",
    role: "Founder",
    company: "Outboundrix LLC",
    url: "https://outboundrix.io",
    logo: "./logos/outboundrix-192.png",
    period: "2026 – Present",
    meta: "Wyoming, US",
    summary: "Founded a US company and built its products: Outboundrix, the AI sales and outbound CRM, and Datryxen, the self-serve data platform.",
    bullets: [
      "Planned and ran a multi-phase move from one overloaded server to two: a data layer and an application layer.",
      "Migrated the app, auth, API gateway, n8n, the search index, PostgreSQL and PocketBase without losing a stored credential.",
      "Built email infrastructure on Amazon SES across two regions with full DNS: SPF, DKIM and DMARC.",
      "Shipped Datryxen on web and native Android: order a list, track delivery, push it to Instantly, Smartlead or HubSpot.",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "PocketBase", "KrakenD", "Authgear", "AWS SES", "Kotlin", "Coolify"],
  },
  {
    id: "tex-llm",
    role: "Creator",
    company: "T-Ex LLM",
    url: "https://github.com/mdrobeulislam1251-ux/T-Ex-LLM-Runpack",
    logo: "./logos/texllm.png",
    period: "2026 – Present",
    meta: "Multi-agent AI systems",
    summary: "A company-in-a-box for terminal AI: a full team of specialist agents that finish the work instead of describing it.",
    bullets: [
      "53 specialist agents in 9 teams with 44 skills and a switchable company brain.",
      "Ships as a Claude Code plugin, a standalone launcher and a self-hosted runtime with WhatsApp and Telegram channels.",
      "Agents report work as done only after it has actually run.",
    ],
    stack: ["Claude Agent SDK", "Claude Code", "TypeScript", "MCP", "n8n", "Tailscale"],
  },
];

export const projects: Project[] = [
  {
    id: "apollo-orchestrator",
    chapter: 1,
    title: "Distributed scraping orchestrator",
    org: "Trusted Leads",
    year: "2025",
    logo: "./logos/apollo.png",
    category: "Data",
    problem: "Large orders stalled the whole queue, and one failed job could hold up every customer behind it.",
    build: [
      "Seven coordinated n8n workflows take an order, split it into parallel jobs and track each one to delivery.",
      "A shared error workflow catches every failure, so nothing fails silently.",
      "Job state is versioned in PostgreSQL, so an order can be replayed or audited at any point.",
    ],
    proof: "Every order has an auditable record from intake to delivery.",
    stack: ["n8n", "PostgreSQL", "Python", "Docker", "Webhooks"],
  },
  {
    id: "lead-search",
    chapter: 2,
    title: "Lead search dashboard",
    org: "Trusted Leads",
    year: "2025",
    logo: "./logos/trustedleads.png",
    category: "Data",
    problem: "The team needed to search millions of contacts by ICP and export clean lists without trusting raw scrape data.",
    build: [
      "Search over 17.4M B2B contacts with 69 filter fields, saved lists and exports up to 600,000 rows.",
      "Order intake, credit-budgeted email reveal and a scrape queue in the same screen.",
      "Ships through pull-based deploys that release only reviewed changes and roll back on failure.",
    ],
    proof: "A list can be built, checked and exported in one place, with every row traceable to its source.",
    stack: ["PostgreSQL", "Node.js", "React", "Python"],
  },
  {
    id: "contacts-core",
    chapter: 3,
    title: "Multi-tenant contacts database",
    org: "Trusted Leads",
    year: "2026",
    logo: "./logos/trustedleads.png",
    category: "Data",
    problem: "Every team and customer needed the same contact data, kept separate, consistent and fast to search.",
    build: [
      "One keyed HTTPS API over a single source of truth, with search kept in sync from it.",
      "Identity-based dedup, a 61-column shared vocabulary and imports up to 500 MB.",
      "Three servers provisioned from one script and deployed by reviewed pull requests.",
    ],
    proof: "25 automated proof suites, including one that proves tenants can never see each other's data.",
    stack: ["PostgreSQL", "Node.js", "Next.js", "Caddy", "Tailscale", "GitHub Actions"],
  },
  {
    id: "index-migration",
    chapter: 4,
    title: "27.4M-record migration",
    org: "Lead Gen Jay",
    year: "2026",
    logo: "./logos/leadgenjay.png",
    category: "Infrastructure",
    problem: "A 72 GB contact index had outgrown an overloaded server, and a bad move would have lost data silently.",
    build: [
      "Snapshot, transfer and restore over a private encrypted network, with resumable parallel streams.",
      "A preflight refuses to start if the source has drifted from the measured numbers.",
      "Network and kernel settings tuned for a long-distance link.",
    ],
    proof: "Cutover is blocked on any difference between source and target, so nothing can be lost silently.",
    stack: ["Docker", "WireGuard", "Tailscale", "Bash", "systemd", "rsync"],
  },
  {
    id: "infra-fleet",
    chapter: 5,
    title: "Self-hosted server fleet",
    org: "Trusted Leads",
    year: "2024",
    logo: "./logos/trustedleads.png",
    category: "Infrastructure",
    problem: "Scraping, data and agents need serious compute without exposing anything to the public internet.",
    build: [
      "10+ Ubuntu servers on a private mesh network, each with a clear role.",
      "TLS at the edge, firewalls by default, and backups that are tested by restoring them.",
      "Regular fleet audits that catch disk, memory and drift problems before they cause outages.",
    ],
    proof: "A five-server platform was built, hardened, monitored and backed up in about three days.",
    stack: ["Ubuntu", "Docker Compose", "Tailscale", "Cloudflare Tunnels", "Caddy", "UFW", "systemd"],
  },
  {
    id: "n8n-platform",
    chapter: 6,
    title: "Production automation platform",
    org: "T-Ex LLM",
    year: "2026",
    logo: "./logos/n8n.svg",
    category: "Automation",
    problem: "Dozens of business workflows needed to run reliably at volume, not one at a time on a laptop.",
    build: [
      "Self-hosted n8n in queue mode with dedicated webhook processors and four parallel workers.",
      "Verification, billing, reporting and order-to-invoice workflows wired to every data store.",
      "Found and patched an upstream Google Sheets bug that broke past about 124,600 rows.",
    ],
    proof: "40+ workflows running in production, kept in Git and restorable from backup.",
    stack: ["n8n", "PostgreSQL", "Docker Compose", "Caddy", "Google Sheets"],
  },
  {
    id: "datryxen",
    chapter: 7,
    title: "Datryxen, the self-serve data platform",
    org: "Datryxen",
    year: "2026",
    logo: "./logos/datryxen-mark.svg",
    category: "Product",
    problem: "Customers wanted to order and track lead lists themselves, without waiting on email threads.",
    build: [
      "A customer dashboard to order ICP, Google Maps and LinkedIn lists, track runs and manage credits.",
      "Delivery straight into Instantly, Smartlead, HubSpot or the customer's own database.",
      "A native Android app for runs, orders and leads, with automatic updates.",
    ],
    proof: "Live on web and Android, with the Android app shipped through 145 commits.",
    stack: ["Next.js", "React", "PostgreSQL", "Kotlin", "Android"],
  },
  {
    id: "verification-gated-agents",
    chapter: 8,
    title: "AI agents that finish the job",
    org: "T-Ex LLM",
    year: "2026",
    logo: "./logos/texllm.png",
    category: "AI Agents",
    problem: "AI coding agents report work as complete when it never ran.",
    build: [
      "Agents must show the work running before they can report it done.",
      "A second model reviews every result before it reaches a person.",
      "Spending limits stop a runaway job before it costs money.",
    ],
    proof: "\"Done\" means the result was observed working, not just written.",
    stack: ["Claude Agent SDK", "TypeScript", "Supabase", "MCP"],
  },
  {
    id: "tex-runpack",
    chapter: 9,
    title: "T-Ex LLM Runpack",
    org: "T-Ex LLM",
    year: "2026",
    logo: "./logos/texllm.png",
    url: "https://github.com/mdrobeulislam1251-ux/T-Ex-LLM-Runpack",
    category: "AI Agents",
    problem: "New engineers lose days to setup, and one project's assumptions leak into another.",
    build: [
      "A ready-to-deploy AI agent environment each engineer runs on their own server.",
      "Per-project context, so every project starts with the right knowledge.",
      "53 specialist agents and 44 skills, installable into any project.",
    ],
    proof: "New engineers are productive on day one.",
    stack: ["Claude Code", "Tailscale", "Git", "Linux"],
  },
];

export const companies: Company[] = [
  {
    id: "trusted-leads",
    name: "Trusted Leads",
    tagline: "The agency brand",
    url: "https://trustedleads.io",
    logo: "./logos/trustedleads.png",
    body: "Apollo-grade B2B contact and company lists as a service, verified before they ship.",
  },
  {
    id: "datryxen",
    name: "Datryxen",
    tagline: "The self-serve SaaS face",
    logo: "./logos/datryxen-mark.svg",
    body: "The same GTM data engine, sold as a product: submit an ICP, track delivery, manage credits, push to integrations.",
  },
  {
    id: "outboundrix",
    name: "Outboundrix",
    tagline: "GTM execution engine",
    url: "https://outboundrix.io",
    logo: "./logos/outboundrix-192.png",
    body: "Prospecting and cold-email outreach in one product: sending, warmup, sequences, AI personalisation, unified inbox.",
  },
  {
    id: "tex-llm",
    name: "T-Ex LLM",
    tagline: "Company-in-a-box for terminal AI",
    url: "https://github.com/mdrobeulislam1251-ux/T-Ex-LLM-Runpack",
    logo: "./logos/texllm.png",
    body: "53 specialist agents in 9 teams, 44 skills and a switchable company brain, with review built in.",
  },
  {
    id: "ready-list",
    name: "Ready List",
    tagline: "Campaign factory",
    url: "https://www.readylist.ai",
    logo: "./logos/readylist.png",
    body: "Brief in, reviewed campaign out as a PR on the customer's own repo. One customer, one repo, one VPS.",
  },
];

export const standards: Standard[] = [
  { id: "s1", n: 1, title: "Verified before it ships", detail: "Every email is checked by more than one provider. Nothing unverified reaches your sending tool." },
  { id: "s2", n: 2, title: "Approved before delivery", detail: "You sign off on the row count and the ICP before a single file is sent." },
  { id: "s3", n: 3, title: "No spend without your go", detail: "No paid credits, tools or API calls are used on your behalf without a clear yes." },
  { id: "s4", n: 4, title: "Proof, not promises", detail: "Every row keeps its source, and you get samples to check the work yourself." },
  { id: "s5", n: 5, title: "Private by default", detail: "Your lists are built and stored on private infrastructure, not public tools." },
  { id: "s6", n: 6, title: "Fixed at the source", detail: "When a campaign underperforms, I find the cause and fix it upstream so it does not repeat." },
];

export const pipeline = [
  { id: "icp", label: "ICP", detail: "Your brief becomes a precise filter: titles, industries, company size and location." },
  { id: "scrape", label: "Scrape", detail: "Contacts are pulled from several sources at once and merged into one list." },
  { id: "verify", label: "Verify", detail: "Every email is checked by more than one provider before anyone sends to it." },
  { id: "dedupe", label: "Dedupe", detail: "Bad addresses, duplicates and people you already have are removed." },
  { id: "enrich", label: "Enrich", detail: "The real decision-maker is found and the missing fields are filled in." },
  { id: "deliver", label: "Deliver", detail: "The list lands where you work: your sending tool, your CRM or a clean file." },
  { id: "campaign", label: "Campaign", detail: "Sequences go out from your own mailboxes, and replies turn into meetings." },
];

export const stack: Record<string, string[]> = {
  "Server management": ["Server management", "Ubuntu fleet operations", "Provisioning from one script", "Pull-based deploys with rollback", "Fleet audits", "Disk & capacity management", "Monitoring & health checks", "Coolify", "Docker", "Docker Compose"],
  "System administration": ["System administration", "Linux", "Ubuntu", "systemd services & timers", "Backups tested by restore", "PostgreSQL administration", "Access control & least privilege", "PM2", "Windows automation", "KVM"],
  "Networking engineering": ["Networking engineering", "Tailscale", "WireGuard", "Cloudflare Tunnels", "DNS", "Caddy", "Nginx", "Let's Encrypt TLS", "UFW firewalls", "MikroTik RouterOS", "SPF · DKIM · DMARC", "Host-to-host migrations"],
  "Automation workflows": ["Automation workflows", "n8n", "n8n queue mode", "Custom n8n nodes", "Webhooks", "Scheduled jobs", "GitHub Actions", "Google Sheets", "Asana", "Linear"],
  "Pattern understanding": ["Pattern understanding", "Root-cause diagnosis", "Data-quality auditing", "Dedup & identity resolution", "Taxonomy normalisation", "Intent scoring", "ICP analysis", "Drift & parity checks"],
  "AI & Agents": ["Claude Agent SDK", "Claude Code", "Multi-agent orchestration", "MCP", "Prompt & context engineering", "Retrieval & vector search", "vLLM", "Qwen", "Chat-ops agents"],
  Data: ["Python", "PostgreSQL", "Supabase", "Elasticsearch", "OpenSearch", "ClickHouse", "ETL / ELT", "Scraping at scale", "Waterfall verification", "Schema design", "Warehouse modelling"],
  "APIs & Integrations": ["REST / RPC API design", "GraphQL", "OpenAPI", "MCP servers", "FastAPI", "Express", "KrakenD", "Authgear", "Stripe"],
  "GTM Systems": ["Apollo.io", "ICP design & segmentation", "B2B list building", "Enrichment", "MillionVerifier", "Reacher", "Deliverability", "Smartlead", "Instantly", "HubSpot", "RevOps data modelling"],
  "Apps & Languages": ["Python", "TypeScript", "JavaScript", "SQL", "Bash", "Next.js", "React", "Node.js", "Kotlin", "Android", "Swift"],
  Professional: ["Team leadership", "Directing AI build agents", "Client-facing problem solving", "Technical documentation & standards", "Founding a business", "Async remote work with US teams"],
};

/** One line of proof shown under each skill track. */
export const stackProof: Record<string, string> = {
  "Server management": "10+ Ubuntu servers; a 5-server platform built in about 3 days",
  "System administration": "Hardened services, tested restores, measured resource limits",
  "Networking engineering": "Private mesh networks, TLS edges and a 72 GB move over WireGuard",
  "Automation workflows": "40+ n8n workflows in production, queue mode with 4 workers",
  "Pattern understanding": "1,972 raw industry names mapped to 148; root causes traced from evidence",
  "AI & Agents": "53 specialist agents, 9 teams, 44 skills",
  Data: "17.4M contacts searchable; 13.4M rows reprocessed in 62 minutes",
  "APIs & Integrations": "Keyed APIs, generated SDKs and MCP tools",
  "GTM Systems": "ICP in, verified leads out, straight into the sending tool",
  "Apps & Languages": "Next.js dashboards and a native Android app",
  Professional: "Leads a remote data team across time zones",
};

/** Brand icon for a skill: a simple-icons slug, or a local logo under public/. */
export const brandIcons: Record<string, string> = {
  "Claude Agent SDK": "claude", "Claude Code": "claude", MCP: "modelcontextprotocol", "MCP servers": "modelcontextprotocol", vLLM: "vllm", Qwen: "qwen",
  Python: "python", PostgreSQL: "postgresql", "PostgreSQL administration": "postgresql", Supabase: "supabase", Elasticsearch: "elasticsearch", OpenSearch: "opensearch", ClickHouse: "clickhouse",
  n8n: "n8n", "n8n queue mode": "n8n", "Custom n8n nodes": "n8n", FastAPI: "fastapi", Express: "express", GraphQL: "graphql", OpenAPI: "openapiinitiative", Stripe: "stripe",
  "Apollo.io": "./logos/apollo.png", Smartlead: "./logos/smartlead.png", Instantly: "./logos/instantly.png", HubSpot: "hubspot",
  Docker: "docker", "Docker Compose": "docker", Ubuntu: "ubuntu", "Ubuntu fleet operations": "ubuntu", Linux: "linux", Coolify: "coolify", Tailscale: "tailscale",
  WireGuard: "wireguard", "Cloudflare Tunnels": "cloudflare", DNS: "cloudflare", Caddy: "caddy", Nginx: "nginx", "Let's Encrypt TLS": "letsencrypt", "MikroTik RouterOS": "mikrotik",
  "GitHub Actions": "githubactions", "Google Sheets": "googlesheets", Asana: "asana", Linear: "linear", Vercel: "vercel",
  TypeScript: "typescript", JavaScript: "javascript", Bash: "gnubash", "Next.js": "nextdotjs", React: "react", "Node.js": "nodedotjs", Kotlin: "kotlin", Android: "android", Swift: "swift",
  Git: "git", GitHub: "github",
};

export const datasets = {
  experiences,
  projects,
  companies,
  standards,
} as const;
