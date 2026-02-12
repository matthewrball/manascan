"use client";

import { useInstallPrompt } from "@/hooks/use-install-prompt";

export default function InstallPrompt() {
  const { isIOS, isStandalone, dismissed, dismiss } = useInstallPrompt();

  if (!isIOS || isStandalone || dismissed) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[70]"
      style={{ animation: "slideUp 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards" }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="mx-4 mb-3 relative">
        {/* Main banner */}
        <div className="relative z-10 glass-prominent rounded-2xl p-3 shadow-lg shadow-black/30">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl glass-tint-primary">
              <img src="/icons/mana-icon.png" alt="Manascan" className="h-full w-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-label-primary">Install Manascan</p>
              <p className="text-xs text-label-tertiary">
                Tap the share button, then &quot;Add to Home Screen&quot;
              </p>
            </div>
            <button
              onClick={dismiss}
              className="shrink-0 text-label-tertiary hover:text-label-primary p-1"
              aria-label="Dismiss"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Arrow — rotated square tucked under the banner */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] z-[9] w-[18px] h-[18px] rotate-45 shadow-lg shadow-black/30"
          style={{
            background: "rgba(44, 44, 46, 0.65)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderTop: "none",
            borderLeft: "none",
          }}
        />
      </div>
    </div>
  );
}
