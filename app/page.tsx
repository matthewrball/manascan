import Link from "next/link";
import InstallPrompt from "./_components/install-prompt";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 safe-top">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* App icon with glass */}
        <div className="glass-prominent flex h-20 w-20 items-center justify-center rounded-[22px] text-4xl">
          🌿
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-label-primary">
            Manascan
          </h1>
          <p className="mt-2 text-lg italic text-label-tertiary">
            &quot;Let food be thy medicine&quot;
          </p>
        </div>

        <p className="max-w-sm text-label-secondary">
          Scan food barcodes to instantly check ingredients against 100+ known
          harmful additives.
        </p>

        {/* Primary CTA — glass button */}
        <Link
          href="/scan"
          className="glass-tint-clean glass-interactive mt-4 flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-full text-lg font-semibold text-clean"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" x2="17" y1="12" y2="12" />
          </svg>
          Start Scanning
        </Link>

        {/* Stats — glass cards */}
        <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-3">
          <div className="glass-subtle flex flex-col items-center gap-1 rounded-2xl p-3">
            <span className="text-2xl font-bold text-clean">100+</span>
            <span className="text-[11px] text-label-tertiary">Banned Items</span>
          </div>
          <div className="glass-subtle flex flex-col items-center gap-1 rounded-2xl p-3">
            <span className="text-2xl font-bold text-label-primary">Free</span>
            <span className="text-[11px] text-label-tertiary">& Open</span>
          </div>
        </div>
      </div>
      <InstallPrompt />
    </div>
  );
}
