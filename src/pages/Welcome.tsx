import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useList } from "@refinedev/core";
import { metrics, profile, type Project } from "../data";
import { Icon } from "../components/Icon";

const Counter = ({ value, decimals, suffix }: { value: number; decimals: number; suffix: string }) => {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setShown(value);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1400, 1);
      setShown(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <span ref={ref}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const log = [
  ["$", "claim issue", "edits unlocked"],
  ["✓", "typecheck · API drift · contract", "gates pass"],
  ["✓", "waterfall verify", "source tracked per row"],
  ["✓", "dedupe vs past deliveries", "duplicates dropped"],
  ["✓", "reviewer model", "approved"],
  ["●", "status", "observed passing · done"],
];

export const Welcome = () => {
  const [lines, setLines] = useState(0);
  const { result } = useList<Project>({ resource: "projects", sorters: [{ field: "chapter", order: "asc" }] });

  useEffect(() => {
    if (lines >= log.length) return;
    const t = setTimeout(() => setLines((n) => n + 1), lines === 0 ? 400 : 650);
    return () => clearTimeout(t);
  }, [lines]);

  return (
    <div className="page welcome">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="pulse" /> Welcome, thanks for stopping by
          </span>
          <h1>
            Hi, I'm Robeul. <br />
            <span className="grad">I build systems you don't have to double-check.</span>
          </h1>
          <p className="lede">
            I turn a customer's ICP into a verified, ready-to-send lead list, and I build AI agents that aren't
            allowed to say "done" until the work actually ran. Everything here is something I shipped and run in
            production today, not a mockup.
          </p>
          <div className="note">
            <strong>A note before you scroll.</strong> Trust is the product. Status 200 is not correct work, so I
            show the check, not just the claim. If something here isn't true, it shouldn't be here.
            <span className="sig">— {profile.name}</span>
          </div>
          <div className="cta-row">
            <Link to="/projects" className="btn primary">
              Watch the case files <Icon name="arrow" size={16} />
            </Link>
            <Link to="/contact" className="btn ghost">
              Work with me
            </Link>
          </div>
        </div>

        <div className="hero-panel" aria-label="verification log">
          <div className="panel-bar">
            <i />
            <i />
            <i />
            <span>verify.log</span>
          </div>
          <ul className="log">
            {log.slice(0, lines).map(([mark, step, outcome]) => (
              <li key={step} className={mark === "●" ? "final" : ""}>
                <b>{mark}</b>
                <span>{step}</span>
                <em>{outcome}</em>
              </li>
            ))}
            {lines < log.length && <li className="cursor">▍</li>}
          </ul>
        </div>
      </section>

      <section className="metrics">
        {metrics.map((m) => (
          <div className="metric" key={m.label}>
            <strong>
              <Counter value={m.value} decimals={m.decimals} suffix={m.suffix} />
            </strong>
            <span>{m.label}</span>
            <small>{m.hint}</small>
          </div>
        ))}
      </section>

      <section className="now">
        <div>
          <span className="eyebrow">What I'm building right now</span>
          <h2>Agents that have to prove it.</h2>
          <p>
            AI coding agents love to report work as complete when it never ran. In T-Ex LLM, stop hooks hold the
            agent until a verification gate passes, role locks stop a builder approving its own work, and a separate
            reviewer model checks every result. 53 agents, 9 teams, 44 doctrine skills, and one rule: no fake done.
          </p>
          <Link to="/projects/verification-gated-agents" className="btn ghost">
            Open the case file <Icon name="arrow" size={16} />
          </Link>
        </div>
        <ol className="gates">
          {["Claim an issue", "Build → run → observe", "Gate: typecheck · drift · contract", "Reviewer model", "Owner merges"].map(
            (g, i) => (
              <li key={g}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {g}
              </li>
            ),
          )}
        </ol>
      </section>

      <section>
        <div className="section-head">
          <h2>The documentary, in chapters</h2>
          <Link to="/projects">All case files →</Link>
        </div>
        <div className="chapter-grid">
          {result.data.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="chapter-card">
              <span className="chapter-no">Chapter {String(p.chapter).padStart(2, "0")}</span>
              <img src={p.logo} alt="" />
              <h3>{p.title}</h3>
              <p>{p.problem}</p>
              <small>
                {p.org} · {p.year}
              </small>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
