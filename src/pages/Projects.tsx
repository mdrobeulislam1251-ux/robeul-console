import { useState } from "react";
import { Link, useParams } from "react-router";
import { useList, useOne } from "@refinedev/core";
import type { Project } from "../data";
import { Icon } from "../components/Icon";
import { Brand } from "../components/Brand";

const categories = ["All", "Data", "Infrastructure", "AI Agents"] as const;

export const ProjectList = () => {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [q, setQ] = useState("");
  const { result, query } = useList<Project>({
    resource: "projects",
    filters: [
      { field: "category", operator: "eq", value: category === "All" ? undefined : category },
      { field: "q", operator: "contains", value: q },
    ],
    sorters: [{ field: "chapter", order: "asc" }],
  });

  return (
    <div className="page">
      <header className="page-head">
        <span className="eyebrow">Case files</span>
        <h1>Each project, told as a short documentary.</h1>
        <p>The problem, what was built, and the proof that it works. Filter by track or search any detail.</p>
      </header>

      <div className="toolbar">
        <div className="segmented">
          {categories.map((c) => (
            <button key={c} className={c === category ? "on" : ""} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <label className="field">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search case files…" />
        </label>
        <span className="count">{query.isFetching ? "…" : `${result.total} records`}</span>
      </div>

      <div className="table">
        <div className="tr th">
          <span>#</span>
          <span>Project</span>
          <span>Track</span>
          <span>Year</span>
          <span />
        </div>
        {result.data.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`} className="tr">
            <span className="mono">{String(p.chapter).padStart(2, "0")}</span>
            <span className="cell-title">
              <img src={p.logo} alt="" />
              <span>
                <strong>{p.title}</strong>
                <small>{p.org}</small>
              </span>
            </span>
            <span>
              <span className={`tag tag-${p.category.replace(/\s/g, "").toLowerCase()}`}>{p.category}</span>
            </span>
            <span className="mono">{p.year}</span>
            <span className="go">
              <Icon name="arrow" size={16} />
            </span>
          </Link>
        ))}
        {result.data.length === 0 && <div className="empty">No case file matches that search.</div>}
      </div>
    </div>
  );
};

export const ProjectShow = () => {
  const { id } = useParams();
  const { result: p, query } = useOne<Project>({ resource: "projects", id: id ?? "" });
  const { result: all } = useList<Project>({ resource: "projects", sorters: [{ field: "chapter", order: "asc" }] });

  if (query.isLoading) return <div className="page">Loading…</div>;
  if (!p) return <div className="page empty">That case file does not exist.</div>;

  const idx = all.data.findIndex((x) => x.id === p.id);
  const next = all.data[idx + 1];

  return (
    <div className="page doc">
      <Link to="/projects" className="back">
        <Icon name="back" size={16} /> All case files
      </Link>
      <header className="doc-hero">
        <span className="chapter-no">Chapter {String(p.chapter).padStart(2, "0")}</span>
        <h1>{p.title}</h1>
        <div className="doc-meta">
          <img src={p.logo} alt="" />
          <span>{p.org}</span>
          <span>·</span>
          <span>{p.year}</span>
          <span className={`tag tag-${p.category.replace(/\s/g, "").toLowerCase()}`}>{p.category}</span>
          {p.url && (
            <a href={p.url} target="_blank" rel="noreferrer" className="ext">
              Source <Icon name="external" size={14} />
            </a>
          )}
        </div>
      </header>

      <ol className="story">
        <li>
          <span className="act">Act I · The problem</span>
          <p className="big">{p.problem}</p>
        </li>
        <li>
          <span className="act">Act II · What I built</span>
          <ul className="checks">
            {p.build.map((b) => (
              <li key={b}>
                <Icon name="check" size={16} />
                {b}
              </li>
            ))}
          </ul>
        </li>
        <li>
          <span className="act">Act III · The proof</span>
          <blockquote>{p.proof}</blockquote>
        </li>
      </ol>

      <div className="chips">
        {p.stack.map((s) => (
          <span key={s} className="chip">
            <Brand name={s} /> {s}
          </span>
        ))}
      </div>

      {next && (
        <Link to={`/projects/${next.id}`} className="next-card">
          <small>Next chapter</small>
          <strong>{next.title}</strong>
          <Icon name="arrow" />
        </Link>
      )}
    </div>
  );
};
