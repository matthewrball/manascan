import type { AnalysisResult } from "@/types/product";

const verdicts: Record<
  AnalysisResult,
  { title: string; description: string; glassClass: string }
> = {
  clean: {
    title: "This product looks clean!",
    description: "No banned ingredients were detected in this product.",
    glassClass: "glass-tint-clean",
  },
  flagged: {
    title: "Ingredients of concern found",
    description:
      "This product contains one or more ingredients on the banned list.",
    glassClass: "glass-tint-flagged",
  },
  unknown: {
    title: "Unable to fully analyze",
    description:
      "Ingredient data is missing or incomplete. Results may not be accurate.",
    glassClass: "glass-tint-caution",
  },
};

export default function IngredientVerdict({
  result,
  flaggedCount,
}: {
  result: AnalysisResult;
  flaggedCount: number;
}) {
  const v = verdicts[result];

  return (
    <div className={`${v.glassClass} rounded-2xl p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">
          {result === "clean" ? "✅" : result === "flagged" ? "🚫" : "⚠️"}
        </span>
        <div>
          <h2 className="font-semibold text-label-primary">{v.title}</h2>
          <p className="mt-0.5 text-sm text-label-secondary">{v.description}</p>
          {result === "flagged" && flaggedCount > 0 && (
            <p className="mt-1 text-sm font-medium text-flagged">
              {flaggedCount} flagged ingredient{flaggedCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
