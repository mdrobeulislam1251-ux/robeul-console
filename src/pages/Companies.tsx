import { useList } from "@refinedev/core";
import type { Company } from "../data";
import { Icon } from "../components/Icon";

export const Companies = () => {
  const { result } = useList<Company>({ resource: "companies" });
  return (
    <div className="page">
      <header className="page-head">
        <span className="eyebrow">Companies and products</span>
        <h1>One data engine, several faces.</h1>
        <p>The agency, the SaaS, the execution engine, the agent runpack and the campaign factory.</p>
      </header>
      <div className="company-grid">
        {result.data.map((c) => (
          <article key={c.id} className="company">
            <div className="company-logo">
              <img src={c.logo} alt="" />
            </div>
            <h3>{c.name}</h3>
            <small>{c.tagline}</small>
            <p>{c.body}</p>
            {c.url && (
              <a href={c.url} target="_blank" rel="noreferrer" className="ext">
                {new URL(c.url).hostname.replace("www.", "")} <Icon name="external" size={14} />
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};
