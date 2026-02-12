import type { AnalysisResult } from "@/types/product";

const config: Record<
  AnalysisResult,
  { label: string; className: string }
> = {
  clean: {
    label: "CLEAN",
    className: "glass-tint-clean text-clean",
  },
  flagged: {
    label: "FLAGGED",
    className: "glass-tint-flagged text-flagged",
  },
  unknown: {
    label: "UNKNOWN",
    className: "glass-tint-caution text-caution",
  },
};

export default function StatusBadge({
  result,
  size = "md",
}: {
  result: AnalysisResult;
  size?: "sm" | "md" | "lg";
}) {
  const c = config[result];
  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wider rounded-full ${c.className} ${sizeClasses[size]}`}
    >
      {c.label}
    </span>
  );
}
