"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { Drawer } from "vaul";
import { useProductLookup } from "@/hooks/use-product-lookup";
import ManualEntry from "./_components/manual-entry";
import ProductDrawer from "./_components/product-drawer";
import ScanOverlay from "./_components/scan-overlay";

const BarcodeScanner = dynamic(
  () => import("./_components/barcode-scanner"),
  { ssr: false }
);

type ScanState = "scanning" | "detected" | "loading" | "error";

export default function ScanPage() {
  const { product, lookup, loading } = useProductLookup();
  const [showManual, setShowManual] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [state, setState] = useState<ScanState>("scanning");
  const [error, setError] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);

  const handleBarcode = useCallback(
    async (barcode: string) => {
      setDetectedBarcode(barcode);
      setState("detected");

      // Run animation delay and lookup in parallel
      const [result] = await Promise.all([
        lookup(barcode),
        new Promise((r) => setTimeout(r, 400)),
      ]);
      setState("loading");
      if (result) {
        setShowDrawer(true);
        setState("scanning");
      } else {
        setDetectedBarcode(null);
        setState("scanning");
      }
    },
    [lookup]
  );

  const handleCloseDrawer = useCallback(() => {
    setShowDrawer(false);
    setDetectedBarcode(null);
  }, []);

  const handleCameraError = (err: string) => {
    setError(err);
    setState("error");
  };

  const isCamera = state !== "error";

  useEffect(() => {
    const html = document.documentElement;
    if (isCamera) {
      html.classList.add("camera-active");
    } else {
      html.classList.remove("camera-active");
    }
    return () => {
      html.classList.remove("camera-active");
    };
  }, [isCamera]);

  return (
    <div
      className={isCamera ? "fixed inset-0 z-40 bg-black" : "relative flex h-full flex-col bg-background"}
    >
      {/* Header */}
      <div
        className={`safe-top z-20 px-4 py-6 ${
          isCamera ? "absolute top-0 left-0 right-0" : "relative"
        }`}
      >
        <div className="flex items-center justify-between">
          <h1
            className={`text-2xl font-bold ${isCamera ? "text-white drop-shadow-md" : "text-label-primary"}`}
          >
            Scan
          </h1>
          <button
            onClick={() => setShowManual(true)}
            className={`glass-interactive rounded-full px-4 py-1.5 text-sm font-medium ${
              isCamera
                ? "bg-black/30 backdrop-blur-xl text-white/90 border border-white/15"
                : "glass text-label-secondary"
            }`}
            style={
              isCamera
                ? {
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                  }
                : undefined
            }
          >
            Enter Manually
          </button>
        </div>
        {!isCamera && (
          <p className="mt-1 text-sm text-label-tertiary">
            Scan a barcode to check ingredients
          </p>
        )}
      </div>

      {/* Main area */}
      <div className={`relative ${isCamera ? "h-full" : "flex-1"}`}>
        {/* Active scanner — stays running behind the drawer */}
        {state !== "error" && (
          <>
            <BarcodeScanner
              onScan={handleBarcode}
              onError={handleCameraError}
              active={!showManual && state === "scanning"}
            />
            <ScanOverlay
              detected={state === "detected"}
              barcode={detectedBarcode}
            />
          </>
        )}

        {/* Loading drawer */}
        <Drawer.Root
          open={state === "loading" || loading}
          dismissible={false}
        >
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-[60]" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[60] mx-auto flex max-w-lg flex-col items-center rounded-t-3xl bg-background px-5 pb-12 pt-5 outline-none">
              <div className="mb-3 h-1 w-10 rounded-full bg-label-tertiary/30" />
              <Drawer.Title className="sr-only">Looking up product</Drawer.Title>
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-label-tertiary/20 border-t-primary" />
                <div>
                  <p className="text-sm font-semibold text-label-primary">
                    Looking up product...
                  </p>
                  {detectedBarcode && (
                    <p className="mt-0.5 font-mono text-xs text-label-tertiary">
                      {detectedBarcode}
                    </p>
                  )}
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

        {/* Error state */}
        {state === "error" && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
            <div className="glass-tint-flagged flex h-16 w-16 items-center justify-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-8 w-8 text-flagged"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
            </div>
            <p className="text-center text-lg font-semibold text-label-primary">
              Camera access denied
            </p>
            <p className="max-w-xs text-center text-sm text-label-tertiary">
              {error?.includes("NotAllowed") || error?.includes("denied")
                ? "Go to Settings → Safari → Camera and allow access, then try again."
                : "Could not access the camera."}
            </p>
            {error && (
              <p className="mt-2 max-w-xs break-all rounded-xl bg-border px-3 py-2 text-center font-mono text-xs text-label-tertiary">
                {error}
              </p>
            )}
            <button
              onClick={() => { setError(null); setState("scanning"); }}
              className="glass-tint-primary glass-interactive mt-2 rounded-full px-6 py-3 font-semibold text-primary"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Manual entry modal */}
      {showManual && (
        <ManualEntry
          onSubmit={(barcode) => {
            setShowManual(false);
            handleBarcode(barcode);
          }}
          onCancel={() => setShowManual(false)}
        />
      )}

      {/* Product result drawer */}
      <ProductDrawer
        product={product}
        open={showDrawer}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
