"use client";

import { Drawer } from "vaul";
import Image from "next/image";
import Link from "next/link";
import StatusBadge from "@/app/_components/status-badge";
import type { Product } from "@/types/product";
import { CATEGORY_META } from "@/lib/ingredients/categories";
import type { IngredientCategory } from "@/types/ingredient";

interface ProductDrawerProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductDrawer({
  product,
  open,
  onClose,
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
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[60] mx-auto flex h-[85dvh] max-w-lg flex-col rounded-t-3xl outline-none bg-background">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-label-tertiary/30" />
          </div>

          {/* Peek content — always visible at first snap */}
          <div className="px-5 pb-4">
            <Drawer.Title className="sr-only">
              {product.product_name}
            </Drawer.Title>

            {/* Product header */}
            <div className="glass rounded-2xl p-4">
              <div className="flex gap-4">
                {product.image_url ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl glass-subtle">
                    <Image
                      src={product.image_url}
                      alt={product.product_name}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl glass-subtle text-3xl">
                    📦
                  </div>
                )}
                <div className="flex flex-col justify-center gap-2">
                  <h2 className="text-lg font-bold leading-tight text-label-primary">
                    {product.product_name}
                  </h2>
                  {product.brand && (
                    <p className="text-sm text-label-tertiary">
                      {product.brand}
                    </p>
                  )}
                  <StatusBadge result={result} />
                </div>
              </div>
            </div>

            {/* Verdict summary */}
            <div
              className={`mt-3 rounded-2xl p-3 ${
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
                      ? `${flagged?.length || 0} ingredient${(flagged?.length || 0) !== 1 ? "s" : ""} of concern`
                      : "Unable to fully analyze"}
                </span>
              </div>
            </div>

            {/* Swipe hint */}
            <p className="mt-3 text-center text-xs text-label-tertiary">
              Swipe down to dismiss
            </p>
          </div>

          {/* Expanded content — visible when swiped up */}
          <div className="overflow-y-auto px-5 pb-10">
            {/* Flagged ingredients */}
            {flagged && flagged.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-flagged">
                  Flagged Ingredients
                </h3>
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
                          <span className="capitalize">
                            {item.severity} concern
                          </span>
                          <span>·</span>
                          <span>{item.match_type}</span>
                        </div>
                        {item.ingredient !==
                          item.canonical_name.toLowerCase() && (
                          <p className="mt-1 text-xs text-label-tertiary">
                            Found as: &quot;{item.ingredient}&quot;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full ingredients list */}
            {product.ingredients_text && (
              <div className="mb-4">
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

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href={`/result/${product.barcode}`}
                className="glass glass-interactive flex-1 rounded-full py-3 text-center text-sm font-semibold text-label-primary"
              >
                Full Details
              </Link>
              <button
                onClick={onClose}
                className="glass-tint-clean glass-interactive flex-1 rounded-full py-3 text-sm font-semibold text-clean"
              >
                Scan Another
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-label-tertiary">
              Data from Open Food Facts · Barcode: {product.barcode}
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
