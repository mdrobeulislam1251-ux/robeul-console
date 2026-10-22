import { useEffect, useState } from "react";
import { pipeline } from "../data";

export const Pipeline = () => {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setStep((s) => (s + 1) % pipeline.length), 2200);
    return () => clearInterval(t);
  }, [auto]);

  const current = pipeline[step];

  return (
    <div className="page">
      <header className="page-head">
        <span className="eyebrow">The pipeline</span>
        <h1>ICP in, verified leads out.</h1>
        <p>Every list I deliver goes through the same six stages. Click a stage to stop the tour and read it.</p>
      </header>

      <div className="pipe">
        {pipeline.map((p, i) => (
          <button
            key={p.id}
            className={`pipe-node ${i === step ? "on" : ""} ${i < step ? "done" : ""}`}
            onClick={() => {
              setAuto(false);
              setStep(i);
            }}
          >
            <span className="mono">{String(i + 1).padStart(2, "0")}</span>
            {p.label}
          </button>
        ))}
      </div>
      <div className="progress">
        <div style={{ width: `${((step + 1) / pipeline.length) * 100}%` }} />
      </div>

      <div className="pipe-detail" key={current.id}>
        <span className="eyebrow">
          Stage {step + 1} of {pipeline.length}
        </span>
        <h2>{current.label}</h2>
        <p className="big">{current.detail}</p>
        {!auto && (
          <button className="btn ghost" onClick={() => setAuto(true)}>
            Resume tour
          </button>
        )}
      </div>

      <div className="callout">
        <strong>Why it holds up:</strong> no client file ships until the row count and ICP are approved, and only the
        verifier may mark a row valid. A bad list costs more than a late one.
      </div>
    </div>
  );
};
