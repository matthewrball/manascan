import Link from "next/link";
import {
  fetchProduct,
  extractIngredientsText,
  extractProductName,
  extractBrand,
  extractImageUrl,
} from "@/lib/openfoodfacts/client";
import { analyzeIngredients } from "@/lib/ingredients/matcher";
import ProductHeader from "./_components/product-header";
import IngredientVerdict from "./_components/ingredient-verdict";
import IngredientList from "./_components/ingredient-list";
import NotFoundForm from "./_components/not-found-form";
import type { Product, AnalysisResult } from "@/types/product";

const hasSupabase =
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_URL !== "your-supabase-url";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ barcode: string }>;
}) {
  const { barcode } = await params;
  let product: Product | null = null;

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
    const offProduct = await fetchProduct(barcode);
    if (offProduct) {
      const ingredientsText = extractIngredientsText(offProduct);
      let analysisResult: AnalysisResult = "unknown";
      let flaggedIngredients = null;

      if (ingredientsText) {
        const matches = analyzeIngredients(
          ingredientsText,
          offProduct.additives_tags
        );
        analysisResult = matches.length > 0 ? "flagged" : "clean";
        flaggedIngredients = matches.length > 0 ? matches : null;
      }

      const productData: Product = {
        id: crypto.randomUUID(),
        barcode,
        product_name: extractProductName(offProduct),
        brand: extractBrand(offProduct),
        image_url: extractImageUrl(offProduct),
        ingredients_text: ingredientsText,
        ingredients_parsed: offProduct.ingredients || null,
        analysis_result: analysisResult,
        flagged_ingredients: flaggedIngredients,
        source: "openfoodfacts",
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      // Try to persist if Supabase is available
      if (hasSupabase) {
        try {
          const { createClient } = await import("@/lib/supabase/server");
          const supabase = await createClient();
          const { data: inserted } = await supabase
            .from("products")
            .upsert(productData, { onConflict: "barcode" })
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
        product = productData;
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
