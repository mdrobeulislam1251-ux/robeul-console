import { useEffect, useMemo, useRef } from "react";
import { MOTION_SIZE, pipelineMotionSvg } from "../motion/pipelineMotion";

/** The full scrape-to-campaign motion, inline so it follows the console theme. */
export const PipelineMotion = ({ id = "pm", caption = true }: { id?: string; caption?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  // Static markup generated from our own data; nothing user-supplied reaches it.
  const html = useMemo(() => pipelineMotionSvg({ id, asset: (p) => p }), [id]);

  useEffect(() => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      svg.pauseAnimations();
      svg.setCurrentTime(MOTION_SIZE.duration * 0.93);
    }
  }, [html]);

  return (
    <figure className="motion">
      <div className="motion-frame">
        <div className="panel-bar">
          <i />
          <i />
          <i />
          <span>robeul.console / pipeline · live</span>
        </div>
        <div className="motion-scroll">
          <div ref={ref} className="motion-svg" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
      {caption && <figcaption>One pass of the pipeline, from an ICP to a booked meeting. Rendered with example data.</figcaption>}
    </figure>
  );
};
