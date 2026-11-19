const PATHS: Record<string, string> = {
  camera: "M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  printer: "M7 8V3h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v7H7z",
  laptop: "M5 6h14a1 1 0 0 1 1 1v9H4V7a1 1 0 0 1 1-1zM2 19h20",
  check: "M5 12.5l4.5 4.5L19 7.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  phone: "M6.6 3h3l1.4 4-2 1.2a11 11 0 0 0 5.8 5.8L16 12l4 1.4v3a2 2 0 0 1-2 2A15 15 0 0 1 4.6 5a2 2 0 0 1 2-2z",
  mail: "M3 6h18v12H3zM3 7l9 7 9-7",
  pin: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  chevron: "M6 9l6 6 6-6",
  shield: "M12 3l8 3v6c0 4.5-3.2 8.3-8 9-4.8-.7-8-4.5-8-9V6zM9 12l2 2 4-4",
  bolt: "M13 3L5 14h6l-1 7 8-11h-6z",
  users: "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  whatsapp: "M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm4.6 12.3c-.2.6-1.2 1.1-1.7 1.1-.4 0-1 .2-3.2-.7-2.7-1.1-4.4-3.8-4.6-4-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6-.3.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1.9 2 1.2 2.300 1.4.3.1.5.1.7-.1l.7-.8c.2-.3.4-.2.6-.1l1.900.9c.3.1.5.2.5.3.1.2.1.7-.1 1.300z",
  doc: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  download: "M12 4v11m0 0l-4-4m4 4l4-4M5 20h14",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  logout: "M10 4H5v16h5M15 8l4 4-4 4M19 12H9",
};

export function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name] || ""} />
    </svg>
  );
}
