const LINKS = [
  {
    title: "Oasis Health Top Rated",
    subtitle: "See which bottled water brands scored best",
    href: "https://www.oasishealth.app/top-rated/bottled_water",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-primary"
      >
        <path d="M12 2v6" />
        <path d="M5.2 10a7 7 0 0 0-.2 2 8 8 0 0 0 16 0c0-.7-.1-1.4-.2-2" />
        <path d="M6 10h12" />
      </svg>
    ),
  },
  {
    title: "EWG Tap Water Database",
    subtitle: "Enter your ZIP to check local water quality",
    href: "https://www.ewg.org/tapwater/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-primary"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      </svg>
    ),
  },
] as const;

export default function WaterQualityCard() {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-label-tertiary">
        Water Quality Resources
      </h3>
      <div className="space-y-2">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-subtle glass-interactive flex items-center gap-3 rounded-2xl p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              {link.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-label-primary">
                {link.title}
              </p>
              <p className="text-xs text-label-tertiary">{link.subtitle}</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-label-tertiary"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
