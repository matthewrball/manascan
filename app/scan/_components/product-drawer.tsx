"use client";

import { Drawer } from "vaul";
import Image from "next/image";
import StatusBadge from "@/app/_components/status-badge";
import FlaggedIngredientCards from "@/app/_components/flagged-ingredient-cards";
import type { Product } from "@/types/product";

interface ProductDrawerProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  closeLabel?: string;
}

export default function ProductDrawer({
  product,
  open,
  onClose,
  closeLabel = "Scan Another",
}: ProductDrawerProps) {
  if (!product) return null;

  const flagged = product.flagged_ingredients;
  const result = product.analysis_result;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      snapPoints={[1]}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[60] mx-auto max-h-[90dvh] max-w-lg flex flex-col rounded-t-3xl outline-none bg-background">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-full bg-label-tertiary/30" />
          </div>

          {/* Peek content */}
          <div className="px-5 pb-4">
            <Drawer.Title className="sr-only">
              {product.product_name}
            </Drawer.Title>

            {/* Product image + info centered */}
            <div className="flex flex-col items-center text-center">
              {product.image_url ? (
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl glass-subtle">
                  <Image
                    src={product.image_url}
                    alt={product.product_name}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl glass-subtle text-4xl">
                  📦
                </div>
              )}
              <div className="mt-2">
                <StatusBadge result={result} size="lg" />
              </div>
              <h2 className="mt-3 text-xl font-bold leading-tight text-label-primary">
                {product.product_name}
              </h2>
              {product.brand && (
                <p className="mt-1 text-sm text-label-tertiary">
                  {product.brand}
                </p>
              )}
            </div>

            {/* Verdict summary */}
            <div
              className={`mt-4 rounded-2xl p-3 ${
                result === "clean"
                  ? "glass-tint-clean"
                  : result === "flagged"
                    ? "glass-tint-flagged"
                    : "glass-tint-caution"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {result === "clean"
                    ? "✅"
                    : result === "flagged"
                      ? "🚫"
                      : "⚠️"}
                </span>
                <span className="text-sm font-semibold text-label-primary">
                  {result === "clean"
                    ? "This product looks clean!"
                    : result === "flagged"
                      ? `${flagged?.length || 0} slop ingredient${(flagged?.length || 0) !== 1 ? "s" : ""}`
                      : "Unable to fully analyze"}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-label-tertiary/10" />

          {/* Scrollable content */}
          <div className="overflow-y-auto px-5 pt-4 pb-10">
            {/* Flagged ingredients */}
            {flagged && flagged.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-flagged">
                  Slop Ingredients
                </h3>
                <FlaggedIngredientCards flagged={flagged} />
              </div>
            )}

            {/* Full ingredients list */}
            {product.ingredients_text && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-label-tertiary">
                  All Ingredients
                </h3>
                <div className="glass-subtle rounded-2xl p-4">
                  <p className="text-sm leading-relaxed text-label-secondary">
                    {product.ingredients_text}
                  </p>
                </div>
              </div>
            )}

            {/* Action */}
            <button
              onClick={onClose}
              className="glass-prominent glass-interactive w-full rounded-full py-3 text-sm font-semibold text-label-primary"
            >
              {closeLabel}
            </button>

            <p className="mt-4 text-center text-xs text-label-tertiary">
              Data from Open Food Facts · Barcode: {product.barcode}
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
