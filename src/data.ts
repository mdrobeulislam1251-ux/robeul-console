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
  category: "Data" | "Infrastructure" | "AI Agents";
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

export type Rule = {
  id: string;
  n: number;
  title: string;
  detail: string;
};

export type Lesson = { id: string; lesson: string; rule: string };

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
  { value: 17.4, suffix: "M", decimals: 1, label: "B2B contacts searchable", hint: "internal lead search dashboard" },
  { value: 69, suffix: "", decimals: 0, label: "filter fields", hint: "ICP targeting, per customer" },
  { value: 600, suffix: "k", decimals: 0, label: "rows per export", hint: "verified before delivery" },
  { value: 53, suffix: "", decimals: 0, label: "specialist agents", hint: "T-Ex LLM, in 9 teams" },
  { value: 571, suffix: "", decimals: 0, label: "sessions audited", hint: "to write the operating rules" },
  { value: 7, suffix: "", decimals: 0, label: "kill switches", hint: "that stop fake \"done\"" },
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
      "Own the outbound data infrastructure end to end: the extraction engine and the pipeline it feeds.",
    bullets: [
      "ICP-based prospect extraction from Apollo.io, driven by each customer's own targeting rules.",
      "Waterfall email verification across several providers, with the source tracked on every record.",
      "Decision-maker resolution, deduplication against past deliveries, schema-consistent normalisation.",
      "Delivery by webhook and direct API into Smartlead, Instantly and customer CRMs.",
      "Lead the data engineering team and set the schema and verification standards.",
    ],
    stack: ["Python", "PostgreSQL", "Supabase", "n8n", "Docker", "Coolify", "Tailscale", "Cloudflare Tunnels", "Apollo.io"],
  },
  {
    id: "lead-gen-jay",
    role: "Senior Data Engineer",
    company: "Lead Gen Jay",
    url: "https://leadgenjay.com",
    logo: "./logos/leadgenjay.png",
    period: "Aug 2024 – Present",
    meta: "Contract · Remote · St. Petersburg, FL (US)",
    summary:
      "Large-scale prospect extraction, enrichment and verification for a data team that ships lead lists at volume.",
    bullets: [
      "ICP segmentation and list building against each customer's targeting criteria.",
      "Email verification and data-quality checks before delivery, so every list is ready to send.",
      "When a campaign underperforms, find the cause (list building, data accuracy or mailbox health) and fix the pipeline upstream.",
    ],
    stack: ["Python", "PostgreSQL", "n8n", "MillionVerifier", "Reacher", "Smartlead", "Instantly"],
  },
  {
    id: "outboundrix",
    role: "Founder",
    company: "Outboundrix LLC",
    url: "https://outboundrix.io",
    logo: "./logos/outboundrix-192.png",
    period: "2026 – Present",
    meta: "Wyoming, US",
    summary: "Founded and incorporated a US company, and moved its infrastructure without losing a credential.",
    bullets: [
      "Planned and ran a multi-phase move from one overloaded VM to two: a data layer and an application layer.",
      "Migrated the app, auth (Authgear), API gateway (KrakenD), n8n, Elasticsearch, PostgreSQL and PocketBase.",
      "Caught the n8n encryption-key risk before cutover, which would otherwise have wiped every stored credential.",
      "Built email infrastructure on Amazon SES across two regions with full DNS, inside a scaffold that checks before and after each step.",
    ],
    stack: ["Next.js", "TypeScript", "PocketBase", "KrakenD", "Authgear", "Elasticsearch", "AWS SES", "Coolify"],
  },
  {
    id: "tex-llm",
    role: "Builder",
    company: "T-Ex LLM",
    url: "https://github.com/mdrobeulislam1251-ux/T-Ex-LLM-Runpack",
    logo: "./logos/texllm.png",
    period: "2026 – Present",
    meta: "Multi-agent AI systems",
    summary:
      "A company-in-a-box for terminal AI where nothing is reported done until it ran and was observed passing.",
    bullets: [
      "53 specialist agents in 9 teams, 44 doctrine skills, a switchable company brain and hard review gates.",
      "Ships as a Claude Code plugin, a standalone launcher, and a self-hosted runtime with WhatsApp / Telegram channels.",
      "Every agent is verification-gated.",
    ],
    stack: ["Claude Agent SDK", "Claude Code", "TypeScript", "MCP", "Supabase", "Tailscale"],
  },
];

export const projects: Project[] = [
  {
    id: "apollo-orchestrator",
    chapter: 1,
    title: "Distributed Apollo scraping orchestrator",
    org: "Trusted Leads",
    year: "2025",
    logo: "./logos/apollo.png",
    category: "Data",
    problem:
      "Large orders against a pool of authenticated sessions: sessions expire, accounts get flagged, and one big job can stall the whole queue.",
    build: [
      "Seven n8n workflows: session intake, keep-alive probing, account warm-up promotion, order intake, job splitting, scrape dispatch, worker callbacks.",
      "A shared error-handling workflow that every other workflow reports to.",
      "Warmed accounts get promoted, failed ones retired, and large orders split into parallel jobs.",
    ],
    proof:
      "Job state lives in versioned PostgreSQL tables, so every order has an auditable record from intake to delivery.",
    stack: ["n8n", "PostgreSQL", "Python", "Docker", "webhooks"],
  },
  {
    id: "lead-search",
    chapter: 2,
    title: "Lead search dashboard",
    org: "Trusted Leads",
    year: "2025",
    logo: "./logos/trustedleads.png",
    category: "Data",
    problem:
      "The team needed to search millions of contacts by ICP and export clean lists without trusting raw scrape data.",
    build: [
      "Internal search over ~17.4M B2B contacts with 69 filter fields and exports up to 600k rows.",
      "Elasticsearch for raw scrape, Postgres as the system of record, OpenSearch fed via an outbox.",
    ],
    proof: "A single verifier is the only component allowed to mark a row valid.",
    stack: ["PostgreSQL", "Elasticsearch", "OpenSearch", "Python"],
  },
  {
    id: "infra-fleet",
    chapter: 3,
    title: "Self-hosted infrastructure fleet",
    org: "Trusted Leads",
    year: "2024",
    logo: "./logos/trustedleads.png",
    category: "Infrastructure",
    problem: "Scraping, agents and document processing need compute without exposing anything to the public internet.",
    build: [
      "Servers split by role across several regions, plus a main container host.",
      "All server-to-server traffic goes over a private Tailscale network.",
      "Containers bind to the private address, and boot order brings the network up before them.",
    ],
    proof: "No service is public unless it was deliberately published.",
    stack: ["Docker Compose", "Ubuntu", "Tailscale", "Cloudflare", "UFW", "systemd", "Caddy", "KVM"],
  },
  {
    id: "verification-gated-agents",
    chapter: 4,
    title: "Verification-gated multi-agent system",
    org: "T-Ex LLM",
    year: "2026",
    logo: "./logos/texllm.png",
    category: "AI Agents",
    problem: "AI coding agents report work as complete when it never ran.",
    build: [
      "Stop hooks keep an agent from ending its turn until a verification gate passes.",
      "Guards catch destructive commands before they run. Role locks stop a builder approving its own work.",
      "A separate reviewer model checks the builder, and a budget circuit breaker kills runaway loops.",
    ],
    proof: "Runs the full loop: issue, code, error monitoring, deploy. \"Done\" means observed passing.",
    stack: ["Claude Agent SDK", "TypeScript", "Supabase", "MCP", "Coolify", "Vercel"],
  },
  {
    id: "tex-runpack",
    chapter: 5,
    title: "T-Ex LLM Runpack",
    org: "T-Ex LLM",
    year: "2026",
    logo: "./logos/texllm.png",
    url: "https://github.com/mdrobeulislam1251-ux/T-Ex-LLM-Runpack",
    category: "AI Agents",
    problem: "New engineers lose days to setup, and one project's assumptions leak into another.",
    build: [
      "Per-engineer AI agent environments, each on its own server with a private network and individually issued keys.",
      "Remote SSH development and one branch per engineer.",
      "Per-project context files, 53 specialist agents and 44 doctrine skills.",
    ],
    proof: "New engineers are productive on day one.",
    stack: ["Claude Code", "Tailscale", "Git", "Linux", "VS Code Remote-SSH"],
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
    body: "53 specialist agents in 9 teams, 44 doctrine skills, a switchable company brain, hard review gates.",
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

export const rules: Rule[] = [
  { id: "r1", n: 1, title: "Stop at the endpoint", detail: "count ≠ pull ≠ deliver. fix ≠ commit ≠ push. Do the named step, then stop." },
  { id: "r2", n: 2, title: "Was this action named?", detail: "A request is the approval for that request, and nothing adjacent to it." },
  { id: "r3", n: 3, title: "No auto-spend", detail: "No credits, no paid API calls, no purchases without a named go." },
  { id: "r4", n: 4, title: "No client file until approved", detail: "Row count and ICP are approved first. A bad list costs more than a late one." },
  { id: "r5", n: 5, title: "No paid recommendation without a test", detail: "Prove it on a sample before proposing the spend." },
  { id: "r6", n: 6, title: "No identical essays", detail: "A repeated explanation is a sign the work is not being done." },
  { id: "r7", n: 7, title: "Verify before claim", detail: "\"Done\" means it ran and was observed passing. Exit code 0 means compiled, never works." },
];

export const lessons: Lesson[] = [
  { id: "l1", lesson: "A test was run against live accounts instead of a sandbox", rule: "Never test against production identities" },
  { id: "l2", lesson: "A destructive mistake was quietly repaired", rule: "Never hide it. Postmortem first, then fix" },
  { id: "l3", lesson: "The preferred tool got built instead of the one asked for", rule: "Build the named noun, not the preferred one" },
  { id: "l4", lesson: "A search cluster was overloaded by an unthrottled batch", rule: "Throttle, measure, then scale" },
  { id: "l5", lesson: "A process kill took out its own SSH shell", rule: "Never cut your own access" },
  { id: "l6", lesson: "A session asked to inspect one host changed another", rule: "Touch only the host named in the request" },
  { id: "l7", lesson: "Sessions ended with plans instead of working config", rule: "One small goal, verify from the client side, record, expand" },
];

export const pipeline = [
  { id: "icp", label: "ICP", detail: "Customer targeting rules become a query: titles, industries, size, geo." },
  { id: "extract", label: "Extract", detail: "Apollo sessions pulled through the orchestrator, split into parallel jobs." },
  { id: "verify", label: "Waterfall verify", detail: "Several providers in sequence. The source is stored on every record." },
  { id: "resolve", label: "Resolve", detail: "Find the actual decision-maker, not just any contact at the company." },
  { id: "dedupe", label: "Dedupe", detail: "Checked against every past delivery, normalised to one schema." },
  { id: "deliver", label: "Deliver", detail: "Webhook or API into Smartlead, Instantly or the customer's CRM." },
];

export const stack: Record<string, string[]> = {
  "AI & Agents": ["Claude Agent SDK", "Claude Code", "Multi-agent orchestration", "MCP", "Enforcement hooks", "Prompt & context engineering", "vLLM", "Qwen", "Retrieval & personalisation", "AI-assisted prototyping"],
  Data: ["Python", "PostgreSQL", "Supabase", "Elasticsearch", "OpenSearch", "ETL / ELT", "Scraping at scale", "Waterfall verification", "Dedup & identity resolution", "Schema design", "Data-quality auditing"],
  "Automation & APIs": ["n8n", "REST / RPC API design", "Webhooks", "Next.js API routes", "FastAPI", "Express", "KrakenD", "Authgear", "Rate limiting & retries"],
  "GTM Systems": ["Apollo.io", "ICP design & segmentation", "B2B list building", "Enrichment", "MillionVerifier", "Reacher", "Deliverability", "Smartlead", "Instantly", "CRM integration", "RevOps data modelling"],
  Infrastructure: ["Docker", "Docker Compose", "Ubuntu", "Linux", "Coolify", "Tailscale", "Cloudflare Tunnels", "Caddy", "Nginx", "AWS SES", "DNS", "UFW", "systemd", "KVM", "Vercel", "Server migration"],
  Languages: ["Python", "TypeScript", "JavaScript", "SQL", "Bash", "Next.js", "React", "Node.js", "Kotlin"],
  Professional: ["Team leadership", "Root-cause diagnosis", "Client-facing problem solving", "Technical documentation & standards", "Founding a business", "Async remote work with US teams"],
};

/** Brand icon for a skill: a simple-icons slug, or a local logo under public/. */
export const brandIcons: Record<string, string> = {
  "Claude Agent SDK": "claude", "Claude Code": "claude", MCP: "modelcontextprotocol", vLLM: "vllm", Qwen: "qwen",
  Python: "python", PostgreSQL: "postgresql", Supabase: "supabase", Elasticsearch: "elasticsearch", OpenSearch: "opensearch",
  n8n: "n8n", "Next.js API routes": "nextdotjs", FastAPI: "fastapi", Express: "express",
  "Apollo.io": "./logos/apollo.png", Smartlead: "./logos/smartlead.png", Instantly: "./logos/instantly.png",
  Docker: "docker", "Docker Compose": "docker", Ubuntu: "ubuntu", Linux: "linux", Coolify: "coolify", Tailscale: "tailscale",
  "Cloudflare Tunnels": "cloudflare", Caddy: "caddy", Nginx: "nginx", Vercel: "vercel",
  TypeScript: "typescript", JavaScript: "javascript", Bash: "gnubash", "Next.js": "nextdotjs", React: "react", "Node.js": "nodedotjs", Kotlin: "kotlin",
  Git: "git", GitHub: "github", "GitHub Actions": "githubactions",
};

export const datasets = {
  experiences,
  projects,
  companies,
  rules,
  lessons,
} as const;
