const paths: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  briefcase: "M9 6V4h6v2m-12 1h18v12H3zm0 5h18",
  film: "M4 4h16v16H4zM8 4v16M16 4v16M4 9h4M4 15h4M16 9h4M16 15h4",
  flow: "M4 6h5v4H4zM15 14h5v4h-5zM9 8h3a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2",
  shield: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z M9 12l2 2 4-4",
  building: "M4 21V5l8-2v18M12 7h8v14M7 8h2M7 12h2M7 16h2M15 11h2M15 15h2",
  layers: "m12 3 9 5-9 5-9-5zM3 13l9 5 9-5",
  mail: "M3 6h18v12H3zm0 0 9 7 9-7",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.35-4.35",
  sun: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "M19 12H5m6-6-6 6 6 6",
  check: "M5 12l5 5L20 7",
  external: "M14 4h6v6m0-6L10 14M19 14v6H4V5h6",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6 6 18",
};

export const Icon = ({ name, size = 18 }: { name: keyof typeof paths | string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={paths[name] ?? paths.layers} />
  </svg>
);
