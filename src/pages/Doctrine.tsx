import { useList } from "@refinedev/core";
import type { Lesson, Rule } from "../data";

const words = ["NO GUESS", "NO TRUST", "GREEN CHECK", "STOP ON RED", "IDEMPOTENT", "NO FAKE DONE"];

export const Doctrine = () => {
  const { result: rules } = useList<Rule>({ resource: "rules", sorters: [{ field: "n", order: "asc" }] });
  const { result: lessons } = useList<Lesson>({ resource: "lessons" });

  return (
    <div className="page">
      <header className="page-head">
        <span className="eyebrow">Doctrine</span>
        <h1>Six words, then seven kill switches.</h1>
        <p>
          These live in the brain every agent loads before it touches my work. They came from auditing 571 real
          sessions, not from a whiteboard.
        </p>
      </header>

      <div className="words">
        {words.map((w) => (
          <code key={w}>{w}</code>
        ))}
      </div>

      <div className="rule-grid">
        {rules.data.map((r) => (
          <article key={r.id} className="rule">
            <span className="rule-n">{r.n}</span>
            <h3>{r.title}</h3>
            <p>{r.detail}</p>
          </article>
        ))}
      </div>

      <h2 className="sub">Lessons that became rules</h2>
      <div className="table">
        <div className="tr th two">
          <span>What happened</span>
          <span>The rule it produced</span>
        </div>
        {lessons.data.map((l) => (
          <div key={l.id} className="tr two static">
            <span>{l.lesson}</span>
            <strong>{l.rule}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};
