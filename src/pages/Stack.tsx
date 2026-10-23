import { stack, stackProof } from "../data";
import { Brand } from "../components/Brand";

export const Stack = () => (
  <div className="page">
    <header className="page-head">
      <span className="eyebrow">Stack</span>
      <h1>What I actually use.</h1>
      <p>Eleven tracks, each backed by work that runs in production today.</p>
    </header>
    <div className="stack-grid">
      {Object.entries(stack).map(([track, items]) => (
        <section key={track} className="stack-card">
          <h3>{track}</h3>
          <p>{stackProof[track]}</p>
          <div className="chips">
            {items.map((s) => (
              <span key={s} className="chip">
                <Brand name={s} /> {s}
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
);
