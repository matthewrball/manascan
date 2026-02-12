interface ScanOverlayProps {
  detected?: boolean;
  barcode?: string | null;
}

export default function ScanOverlay({ detected, barcode }: ScanOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Darkened corners */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Green flash on detection */}
      {detected && (
        <div className="absolute inset-0 animate-pulse bg-clean/20" />
      )}

      {/* Clear scan window */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[160px] w-[300px]">
          {/* Cut out the scan area */}
          <div
            className="absolute inset-0 rounded-3xl bg-transparent"
            style={{
              border: detected
                ? "2px solid rgba(34, 197, 94, 0.8)"
                : "1px solid rgba(255, 255, 255, 0.25)",
              boxShadow: detected
                ? "0 0 0 9999px rgba(0,0,0,0.4), 0 0 20px rgba(34, 197, 94, 0.3)"
                : "0 0 0 9999px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.05)",
            }}
          />

          {/* Corner brackets */}
          {[
            "left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-xl",
            "right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-xl",
            "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl",
            "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl",
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute h-8 w-8 ${pos} ${
                detected ? "border-clean" : "border-white/80"
              } transition-colors duration-200`}
            />
          ))}

          {/* Animated scan line — pauses on detection */}
          {!detected && (
            <div className="absolute left-3 right-3 h-0.5 rounded-full bg-clean/80 scan-line-animate" />
          )}
        </div>
      </div>

      {/* Bottom pill — instruction or detected barcode */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center">
        <div
          className={`rounded-full px-5 py-2 transition-all duration-200 ${
            detected ? "scale-105" : ""
          }`}
          style={{
            background: detected
              ? "rgba(34, 197, 94, 0.25)"
              : "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: detected
              ? "1px solid rgba(34, 197, 94, 0.4)"
              : "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {detected ? (
            <p className="text-sm font-semibold text-clean">
              Barcode found{barcode ? `: ${barcode}` : ""}
            </p>
          ) : (
            <p className="text-sm font-medium text-white/90">
              Point camera at barcode
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
