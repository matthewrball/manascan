"use client";

import { useState, useEffect, useRef } from "react";

interface ManualEntryProps {
  onSubmit: (barcode: string) => void;
  onCancel: () => void;
}

export default function ManualEntry({ onSubmit, onCancel }: ManualEntryProps) {
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Enter animation
  useEffect(() => {
    const overlay = overlayRef.current;
    const sheet = sheetRef.current;
    if (!overlay || !sheet) return;

    overlay.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      easing: "ease-out",
      fill: "forwards",
    });

    sheet.animate(
      [
        { transform: "translateY(100%)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      {
        duration: 350,
        easing: "cubic-bezier(0.32, 0.72, 0, 1)",
        fill: "forwards",
      }
    );
  }, []);

  const animateOut = (callback: () => void) => {
    const overlay = overlayRef.current;
    const sheet = sheetRef.current;
    if (!overlay || !sheet) {
      callback();
      return;
    }

    sheet.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: "translateY(40px)", opacity: 0 },
      ],
      { duration: 200, easing: "ease-in", fill: "forwards" }
    );
    overlay
      .animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 200,
        easing: "ease-in",
        fill: "forwards",
      })
      .finished.then(callback);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = barcode.replace(/\D/g, "");

    if (![8, 12, 13, 14].includes(cleaned.length)) {
      setError("Enter a valid barcode (8, 12, or 13 digits)");
      return;
    }

    animateOut(() => onSubmit(cleaned));
  };

  const handleCancel = () => {
    animateOut(onCancel);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      style={{ opacity: 0 }}
    >
      <div
        ref={sheetRef}
        className="glass-prominent w-full max-w-lg rounded-t-3xl px-6 pb-8 pt-4 safe-bottom"
        style={{ transform: "translateY(100%)" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-label-tertiary/30" />
        <h3 className="text-lg font-semibold text-label-primary">
          Enter Barcode Manually
        </h3>
        <p className="mt-1 text-sm text-label-tertiary">
          Type the numbers below the barcode
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={barcode}
            onChange={(e) => {
              setBarcode(e.target.value);
              setError("");
            }}
            placeholder="e.g. 049000006346"
            className="glass-subtle w-full rounded-2xl px-4 py-3 text-lg tracking-widest outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
            maxLength={14}
          />
          {error && <p className="mt-2 text-sm text-flagged">{error}</p>}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="glass-subtle glass-interactive flex-1 rounded-full py-3 font-medium text-label-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="glass-tint-primary glass-interactive flex-1 rounded-full py-3 font-medium text-primary"
            >
              Look Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
