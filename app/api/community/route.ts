import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_LIMIT = 100;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1") || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20") || 20, 1),
      MAX_LIMIT
    );
    const search = (searchParams.get("search") || "").slice(0, 200);

    const offset = (page - 1) * limit;
    const supabase = await createClient();

    let query = supabase
      .from("community_approved")
      .select(
        "id, product_id, scan_count, upvote_count, last_scanned_at, product:products (id, barcode, product_name, brand, image_url, analysis_result, flagged_ingredients)",
        { count: "exact" }
      )
      .order("upvote_count", { ascending: false });

    // Push search filter into the Supabase query when possible
    if (search) {
      query = query.or(
        `product_name.ilike.%${search}%,brand.ilike.%${search}%`,
        { referencedTable: "products" }
      );
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Community fetch error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch community products" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      products: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (err) {
    console.error("Community API error:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
