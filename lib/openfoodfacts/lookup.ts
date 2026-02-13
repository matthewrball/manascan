import {
  fetchProduct,
  extractIngredientsText,
  extractProductName,
  extractBrand,
  extractImageUrl,
} from "./client";
import { analyzeIngredients } from "@/lib/ingredients/matcher";
import type { Product, AnalysisResult } from "@/types/product";

export interface LookupResult {
  product: Product;
  categoriesTags?: string[];
}

/**
 * Fetch a product from Open Food Facts, analyze its ingredients,
 * and return a fully constructed Product object.
 */
export async function lookupAndAnalyze(
  barcode: string
): Promise<LookupResult | null> {
  const offProduct = await fetchProduct(barcode);
  if (!offProduct) return null;

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

  const product: Product = {
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return { product, categoriesTags: offProduct.categories_tags };
}
