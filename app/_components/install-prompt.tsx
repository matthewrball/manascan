"use client";

import { useInstallPrompt } from "@/hooks/use-install-prompt";

export default function InstallPrompt() {
  const { isIOS, isStandalone, dismissed, dismiss } = useInstallPrompt();

  if (!isIOS || isStandalone || dismissed) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 glass-prominent rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass-tint-clean text-xl">
          🌿
        </div>
        <div className="flex-1">
          <p className="font-semibold text-label-primary">Install Manascan</p>
          <p className="mt-0.5 text-sm text-label-tertiary">
            Tap{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="inline h-4 w-4 align-text-bottom"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" x2="12" y1="2" y2="15" />
            </svg>{" "}
            then &quot;Add to Home Screen&quot;
          </p>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 text-label-tertiary hover:text-label-primary"
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
          >
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
