import { useList } from "@refinedev/core";
import type { Standard } from "../data";
import { Icon } from "../components/Icon";

export const Standards = () => {
  const { result } = useList<Standard>({ resource: "standards", sorters: [{ field: "n", order: "asc" }] });

  return (
    <div className="page">
      <header className="page-head">
        <span className="eyebrow">Standards</span>
        <h1>What you can hold me to.</h1>
        <p>Six commitments that come with every list, every server and every automation I deliver.</p>
      </header>

      <div className="rule-grid">
        {result.data.map((s) => (
          <article key={s.id} className="rule">
            <span className="rule-n">
              <Icon name="check" size={14} />
            </span>
            <h3>{s.title}</h3>
            <p>{s.detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
};
