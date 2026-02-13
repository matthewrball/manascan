import { NextResponse } from "next/server";
import { lookupAndAnalyze } from "@/lib/openfoodfacts/lookup";

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
    const result = await lookupAndAnalyze(barcode);

    if (!result) {
      return NextResponse.json(
        { error: "Product not found", barcode },
        { status: 404 }
      );
    }

    // Try to persist to Supabase if configured
    if (hasSupabase) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { data: product } = await supabase
          .from("products")
          .upsert(result.product, { onConflict: "barcode" })
          .select()
          .single();

        if (product) {
          return NextResponse.json({ product, source: "openfoodfacts" });
        }
      } catch {
        // DB write failed, return data anyway
      }
    }

    return NextResponse.json({ product: result.product, source: "openfoodfacts" });
  } catch (err) {
    console.error("Product lookup error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
