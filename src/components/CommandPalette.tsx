import { useEffect, useMemo, useState } from "react";
import { useList, useMenu, useGo } from "@refinedev/core";
import type { Project, Rule, Experience } from "../data";
import { Icon } from "./Icon";

type Hit = { key: string; label: string; hint: string; to: string };

export const CommandPalette = ({ onClose }: { onClose: () => void }) => {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const go = useGo();
  const { menuItems } = useMenu();
  const filters = [{ field: "q", operator: "contains" as const, value: q }];

  const projects = useList<Project>({ resource: "projects", filters, pagination: { mode: "off" } });
  const roles = useList<Experience>({ resource: "experiences", filters, pagination: { mode: "off" } });
  const rules = useList<Rule>({ resource: "rules", filters, pagination: { mode: "off" } });

  const hits = useMemo<Hit[]>(() => {
    const needle = q.toLowerCase();
    const pages = menuItems
      .filter((m) => !needle || m.label?.toLowerCase().includes(needle))
      .map((m) => ({ key: `page-${m.key}`, label: m.label ?? m.name, hint: "Page", to: m.route ?? "/" }));
    if (!needle) return pages;
    return [
      ...pages,
      ...(projects.result.data ?? []).map((p) => ({ key: p.id, label: p.title, hint: `Case file ${p.chapter}`, to: `/projects/${p.id}` })),
      ...(roles.result.data ?? []).map((r) => ({ key: r.id, label: `${r.role} · ${r.company}`, hint: "Experience", to: `/experience/${r.id}` })),
      ...(rules.result.data ?? []).map((r) => ({ key: r.id, label: r.title, hint: `Rule ${r.n}`, to: "/doctrine" })),
    ];
  }, [q, menuItems, projects.result.data, roles.result.data, rules.result.data]);

  useEffect(() => setActive(0), [q]);

  const open = (hit?: Hit) => {
    if (!hit) return;
    go({ to: hit.to });
    onClose();
  };

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search">
        <div className="palette-input">
          <Icon name="search" />
          <input
            autoFocus
            value={q}
            placeholder="Type to search everything…"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, hits.length - 1));
              if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
              if (e.key === "Enter") open(hits[active]);
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <ul className="palette-list">
          {hits.length === 0 && <li className="palette-empty">No match. Nothing guessed, nothing shown.</li>}
          {hits.map((hit, i) => (
            <li
              key={hit.key}
              className={i === active ? "active" : ""}
              onMouseEnter={() => setActive(i)}
              onClick={() => open(hit)}
            >
              <span>{hit.label}</span>
              <small>{hit.hint}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
