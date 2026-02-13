import Link from "next/link";
import { lookupAndAnalyze } from "@/lib/openfoodfacts/lookup";
import ProductHeader from "./_components/product-header";
import IngredientVerdict from "./_components/ingredient-verdict";
import IngredientList from "./_components/ingredient-list";
import NotFoundForm from "./_components/not-found-form";
import WaterQualityCard from "./_components/water-quality-card";
import type { Product } from "@/types/product";

const hasSupabase =
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_URL !== "your-supabase-url";

const BEVERAGE_TAGS = [
  "beverages",
  "waters",
  "mineral-waters",
  "spring-waters",
  "flavored-waters",
  "sparkling-waters",
  "carbonated-drinks",
  "sodas",
  "juices",
  "energy-drinks",
  "sports-drinks",
  "teas",
  "iced-teas",
  "coffees",
  "soft-drinks",
];

function isBeverage(categoriesTags?: string[]): boolean {
  if (!categoriesTags) return false;
  return categoriesTags.some((tag) =>
    BEVERAGE_TAGS.some((bev) => tag.toLowerCase().includes(bev))
  );
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ barcode: string }>;
}) {
  const { barcode } = await params;
  let product: Product | null = null;
  let categoriesTags: string[] | undefined;

  // Try Supabase cache first if configured
  if (hasSupabase) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: cached } = await supabase
        .from("products")
        .select("*")
        .eq("barcode", barcode)
        .single();

      if (cached) {
        product = cached as Product;
      }
    } catch {
      // Supabase unavailable, continue
    }
  }

  // Fetch from Open Food Facts if not cached
  if (!product) {
    const result = await lookupAndAnalyze(barcode);
    if (result) {
      categoriesTags = result.categoriesTags;

      // Try to persist if Supabase is available
      if (hasSupabase) {
        try {
          const { createClient } = await import("@/lib/supabase/server");
          const supabase = await createClient();
          const { data: inserted } = await supabase
            .from("products")
            .upsert(result.product, { onConflict: "barcode" })
            .select()
            .single();

          if (inserted) {
            product = inserted as Product;
          }
        } catch {
          // DB write failed
        }
      }

      if (!product) {
        product = result.product;
      }
    }
  }

  if (!product) {
    return <NotFoundForm barcode={barcode} />;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 safe-top">
      {/* Back button — glass pill */}
      <Link
        href="/scan"
        className="glass-subtle glass-interactive mb-4 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-label-secondary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </Link>

      <div className="space-y-5">
        <ProductHeader product={product} />

        <IngredientVerdict
          result={product.analysis_result}
          flaggedCount={product.flagged_ingredients?.length || 0}
        />

        <IngredientList
          flagged={product.flagged_ingredients}
          allIngredients={product.ingredients_text}
        />

        {isBeverage(categoriesTags) && <WaterQualityCard />}

        {/* Share button — glass */}
        <div className="flex justify-center">
          <button
            className="glass-subtle glass-interactive inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-label-secondary"
            data-barcode={barcode}
            data-name={product.product_name}
            id="share-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" x2="12" y1="2" y2="15" />
            </svg>
            Share Result
          </button>
        </div>

        <p className="text-center text-xs text-label-tertiary">
          Data from Open Food Facts · Barcode: {barcode}
        </p>
      </div>
    </div>
  );
}
