import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useList } from "@refinedev/core";
import { companies, metrics, profile, type Project } from "../data";
import { Icon } from "../components/Icon";
import { PipelineMotion } from "../components/PipelineMotion";

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

export const Welcome = () => {
  const { result } = useList<Project>({ resource: "projects", sorters: [{ field: "chapter", order: "asc" }] });
  const building = companies.filter((c) => ["outboundrix", "tex-llm", "datryxen", "ready-list"].includes(c.id));

  return (
    <div className="page welcome">
      <section className="hero">
        <div className="hero-copy">
          <span className="pill">
            <span className="pulse" /> Welcome, thanks for stopping by
          </span>
          <h1>
            Hi, I'm Robeul. <span className="grad">
              I build systems you don't have to <span className="nowrap">double-check.</span>
            </span>
          </h1>
          <p className="lede">
            I turn a customer's ICP into a verified, ready-to-send lead list, run the servers and automations behind it,
            and carry it all the way to a booked meeting. Everything here is something I shipped and run today.
          </p>
          <div className="cta-row">
            <Link to="/pipeline" className="btn primary">
              Watch the pipeline <Icon name="arrow" size={16} />
            </Link>
            <Link to="/contact" className="btn link">
              Work with me
            </Link>
          </div>
          <div className="trust-row">
            {["Verified before it ships", "Your data stays yours", "One owner, end to end"].map((t) => (
              <span key={t}>
                <Icon name="check" size={15} /> {t}
              </span>
            ))}
          </div>
        </div>
        <div className="note">
          <strong>A note before you scroll.</strong> Trust is the product. A green status code is not correct work, so I
          show the result, not just the claim. If something here isn't true, it shouldn't be here.
          <span className="sig">— {profile.name}</span>
        </div>
      </section>

      <PipelineMotion id="pm-home" />

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
          <h2>The same data engine, carried all the way to revenue.</h2>
          <p>
            Lists are only the start. I'm building the products around them: an outbound CRM that sends from your own
            mailboxes, a self-serve data platform, a campaign factory, and AI agents that finish the work instead of
            describing it.
          </p>
          <Link to="/companies" className="btn ghost">
            See the companies <Icon name="arrow" size={16} />
          </Link>
        </div>
        <ul className="building">
          {building.map((c) => (
            <li key={c.id}>
              <img src={c.logo} alt="" />
              <div>
                <strong>{c.name}</strong>
                <small>{c.tagline}</small>
              </div>
              <span className="live">
                <span className="pulse" /> Live
              </span>
            </li>
          ))}
        </ul>
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
