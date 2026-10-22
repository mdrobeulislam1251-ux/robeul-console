import { Link, useParams } from "react-router";
import { useList, useOne } from "@refinedev/core";
import type { Experience } from "../data";
import { Icon } from "../components/Icon";

export const ExperienceList = () => {
  const { result } = useList<Experience>({ resource: "experiences" });
  return (
    <div className="page">
      <header className="page-head">
        <span className="eyebrow">Experience</span>
        <h1>Where the work happens.</h1>
        <p>Two US lead-generation companies, one company of my own, and the agent system that keeps it all honest.</p>
      </header>
      <div className="timeline">
        {result.data.map((x) => (
          <Link key={x.id} to={`/experience/${x.id}`} className="role-card">
            <img src={x.logo} alt="" />
            <div>
              <small className="mono">{x.period}</small>
              <h3>
                {x.role} · {x.company}
              </h3>
              <p>{x.summary}</p>
              <div className="chips">
                {x.stack.slice(0, 5).map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
                {x.stack.length > 5 && <span className="chip muted">+{x.stack.length - 5}</span>}
              </div>
            </div>
            <span className="go">
              <Icon name="arrow" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const ExperienceShow = () => {
  const { id } = useParams();
  const { result: x, query } = useOne<Experience>({ resource: "experiences", id: id ?? "" });
  if (query.isLoading) return <div className="page">Loading…</div>;
  if (!x) return <div className="page empty">That role does not exist.</div>;
  return (
    <div className="page doc">
      <Link to="/experience" className="back">
        <Icon name="back" size={16} /> All experience
      </Link>
      <header className="doc-hero">
        <span className="chapter-no">{x.period}</span>
        <h1>
          {x.role} · {x.company}
        </h1>
        <div className="doc-meta">
          <img src={x.logo} alt="" />
          <span>{x.meta}</span>
          {x.url && (
            <a href={x.url} target="_blank" rel="noreferrer" className="ext">
              Visit <Icon name="external" size={14} />
            </a>
          )}
        </div>
      </header>
      <p className="big">{x.summary}</p>
      <ul className="checks">
        {x.bullets.map((b) => (
          <li key={b}>
            <Icon name="check" size={16} />
            {b}
          </li>
        ))}
      </ul>
      <div className="chips">
        {x.stack.map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
};
