import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useMenu } from "@refinedev/core";
import { profile } from "../data";
import { Icon } from "./Icon";
import { CommandPalette } from "./CommandPalette";

const readTheme = (): "dark" | "light" => {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* storage blocked */
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export const Layout = ({ children }: { children: ReactNode }) => {
  const { menuItems, selectedKey } = useMenu();
  const [theme, setTheme] = useState(readTheme);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* storage blocked */
    }
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setNavOpen(false);
    document.querySelector(".main")?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className={`shell ${navOpen ? "nav-open" : ""}`}>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark">R</span>
          <span>
            <strong>Robeul Console</strong>
            <small>v1 · verified build</small>
          </span>
        </Link>

        <nav className="nav">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              to={item.route ?? "/"}
              className={`nav-item ${item.key === selectedKey ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-card">
          <img src={profile.avatar} alt="" />
          <div>
            <strong>{profile.name}</strong>
            <small>
              <span className="pulse" /> Available · {profile.hours}
            </small>
          </div>
        </div>
      </aside>

      <div className="scrim" onClick={() => setNavOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn mobile-only" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <button className="search" onClick={() => setPaletteOpen(true)}>
            <Icon name="search" size={16} />
            <span>Search projects, rules, stack…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="topbar-right">
            <span className="status-chip">
              <Icon name="check" size={14} /> all checks green
            </span>
            <button
              className="icon-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
        <footer className="footer">
          Built with Refine + React · content is read through a Refine data provider · © {new Date().getFullYear()}{" "}
          {profile.name}
        </footer>
      </div>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
};
