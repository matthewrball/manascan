import { NextResponse } from "next/server";
import {
  fetchProduct,
  extractIngredientsText,
  extractProductName,
  extractBrand,
  extractImageUrl,
} from "@/lib/openfoodfacts/client";
import { analyzeIngredients } from "@/lib/ingredients/matcher";
import type { AnalysisResult } from "@/types/product";

const hasSupabase =
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_URL !== "your-supabase-url";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ barcode: string }> }
) {
  const { barcode } = await params;

  if (!barcode || !/^\d{8,14}$/.test(barcode)) {
    return NextResponse.json(
      { error: "Invalid barcode format" },
      { status: 400 }
    );
  }

  try {
    // Check Supabase cache if configured
    if (hasSupabase) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { data: cached } = await supabase
          .from("products")
          .select("*")
          .eq("barcode", barcode)
          .gte(
            "updated_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          )
          .single();

        if (cached) {
          return NextResponse.json({ product: cached, source: "cache" });
        }
      } catch {
        // Supabase unavailable, continue without cache
      }
    }

    // Fetch from Open Food Facts
    const offProduct = await fetchProduct(barcode);

    if (!offProduct) {
      return NextResponse.json(
        { error: "Product not found", barcode },
        { status: 404 }
      );
    }

    // Extract data
    const ingredientsText = extractIngredientsText(offProduct);
    const productName = extractProductName(offProduct);
    const brand = extractBrand(offProduct);
    const imageUrl = extractImageUrl(offProduct);

    // Analyze ingredients
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

    const productData = {
      id: crypto.randomUUID(),
      barcode,
      product_name: productName,
      brand,
      image_url: imageUrl,
      ingredients_text: ingredientsText,
      ingredients_parsed: offProduct.ingredients || null,
      analysis_result: analysisResult,
      flagged_ingredients: flaggedIngredients,
      source: "openfoodfacts" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try to persist to Supabase if configured
    if (hasSupabase) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { data: product } = await supabase
          .from("products")
          .upsert(productData, { onConflict: "barcode" })
          .select()
          .single();

        if (product) {
          return NextResponse.json({ product, source: "openfoodfacts" });
        }
      } catch {
        // DB write failed, return data anyway
      }
    }

    return NextResponse.json({ product: productData, source: "openfoodfacts" });
  } catch (err) {
    console.error("Product lookup error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
