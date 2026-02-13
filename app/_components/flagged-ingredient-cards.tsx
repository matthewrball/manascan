import type { FlaggedIngredient } from "@/types/product";
import { CATEGORY_META } from "@/lib/ingredients/categories";
import type { IngredientCategory } from "@/types/ingredient";

export default function FlaggedIngredientCards({
  flagged,
}: {
  flagged: FlaggedIngredient[];
}) {
  return (
    <div className="space-y-2">
      {flagged.map((item, i) => {
        const cat =
          CATEGORY_META[item.category as IngredientCategory] ||
          CATEGORY_META.other;
        return (
          <div
            key={i}
            className="glass-tint-flagged rounded-2xl px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-label-primary">
                {item.canonical_name}
              </span>
              <span className="text-xs text-label-tertiary">
                {Math.round(item.confidence * 100)}% match
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-label-tertiary">
              <span>
                {cat.icon} {cat.label}
              </span>
              <span>·</span>
              <span className="capitalize">{item.severity} concern</span>
              <span>·</span>
              <span>{item.match_type}</span>
            </div>
            {item.ingredient !== item.canonical_name.toLowerCase() && (
              <p className="mt-1 text-xs text-label-tertiary">
                Found as: &quot;{item.ingredient}&quot;
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
