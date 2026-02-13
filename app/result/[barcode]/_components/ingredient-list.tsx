import type { FlaggedIngredient } from "@/types/product";
import FlaggedIngredientCards from "@/app/_components/flagged-ingredient-cards";

export default function IngredientList({
  flagged,
  allIngredients,
}: {
  flagged: FlaggedIngredient[] | null;
  allIngredients: string | null;
}) {
  return (
    <div className="space-y-4">
      {flagged && flagged.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-flagged">
            Slop Ingredients
          </h3>
          <FlaggedIngredientCards flagged={flagged} />
        </div>
      )}

      {allIngredients && (
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-label-tertiary">
            All Ingredients
          </h3>
          <div className="glass-subtle rounded-2xl p-4">
            <p className="text-sm leading-relaxed text-label-secondary">
              {allIngredients}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
