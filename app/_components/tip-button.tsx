"use client";

import { useState, useCallback } from "react";
import { Drawer } from "vaul";

const STRIKE_URL = "https://strike.me/matthewrball";
const LIGHTNING_ADDRESS = "matthewrball@strike.me";
const TIP_AMOUNTS = ["$1", "$3", "$5"];

export default function TipButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(LIGHTNING_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass-prominent glass-interactive flex h-10 items-center gap-1.5 rounded-full px-3 shadow-lg shadow-black/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-[#f7931a]"
        >
          <path d="M9.5 2V4M9.5 20V22M13.5 2V4M13.5 20V22M7.5 4H14C16.2091 4 18 5.79086 18 8C18 10.2091 16.2091 12 14 12H7.5H15C17.2091 12 19 13.7909 19 16C19 18.2091 17.2091 20 15 20H7.5M7.5 4H5.5M7.5 4V20M7.5 20H5.5" />
        </svg>
        <span className="text-xs font-semibold text-label-secondary">Tip me</span>
      </button>

      <Drawer.Root open={open} onOpenChange={setOpen} snapPoints={[1]}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[60] mx-auto max-h-[90dvh] max-w-lg flex flex-col rounded-t-3xl outline-none bg-background">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-label-tertiary/30" />
            </div>

            <div className="px-5 pb-10">
              <Drawer.Title className="text-xl font-bold text-label-primary">
                Tip the Developer
              </Drawer.Title>
              <p className="mt-2 text-sm text-label-tertiary">
                If you find Manascan useful, consider sending a tip via Bitcoin Lightning Network.
              </p>

              {/* Tip amount buttons */}
              <div className="mt-6 flex gap-3">
                {TIP_AMOUNTS.map((amount) => (
                  <a
                    key={amount}
                    href={STRIKE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-tint-primary glass-interactive flex-1 rounded-xl py-3 text-center text-base font-semibold text-[#f7931a]"
                  >
                    {amount}
                  </a>
                ))}
                <a
                  href={STRIKE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-tint-primary glass-interactive flex-1 rounded-xl py-3 text-center text-base font-semibold text-[#f7931a]"
                >
                  Custom
                </a>
              </div>

              {/* Lightning address */}
              <div className="mt-6 rounded-xl glass p-4">
                <p className="text-xs font-medium text-label-tertiary mb-2">
                  Lightning Address
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate text-sm font-medium text-[#f7931a]">
                    {LIGHTNING_ADDRESS}
                  </code>
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="glass-interactive shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200"
                    style={{ color: copied ? "var(--color-clean)" : "rgba(235, 235, 245, 0.6)" }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-label-tertiary">
                  You can also pay directly from any Lightning wallet using this address.
                </p>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
