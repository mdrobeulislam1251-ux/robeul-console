import { Link } from "react-router";
import { pipeline } from "../data";
import { PipelineMotion } from "../components/PipelineMotion";
import { Icon } from "../components/Icon";

export const Pipeline = () => (
  <div className="page">
    <header className="page-head">
      <span className="eyebrow">The pipeline</span>
      <h1>From an ICP to a booked meeting, in one motion.</h1>
      <p>Every list I deliver goes through the same seven stages, so what reaches your inbox is accurate before anyone sends to it.</p>
    </header>

    <PipelineMotion id="pm-page" />

    <ol className="stage-grid">
      {pipeline.map((p, i) => (
        <li key={p.id}>
          <span className="stage-n">{i + 1}</span>
          <h3>{p.label}</h3>
          <p>{p.detail}</p>
        </li>
      ))}
    </ol>

    <div className="callout">
      <strong>Why it holds up:</strong> nothing ships until the row count and the ICP are approved, and every row keeps
      the source it came from. A bad list costs more than a late one.{" "}
      <Link to="/contact" className="ext">
        Start a list <Icon name="arrow" size={14} />
      </Link>
    </div>
  </div>
);
