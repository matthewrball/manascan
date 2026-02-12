import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const offset = (page - 1) * limit;
    const supabase = await createClient();

    let query = supabase
      .from("community_approved")
      .select(
        `
        *,
        product:products (*)
      `,
        { count: "exact" }
      )
      .order("upvote_count", { ascending: false })
      .range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Community fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch community products" },
        { status: 500 }
      );
    }

    // Filter by search/category in-memory (Supabase join filtering is limited)
    let filtered = data || [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.product?.product_name?.toLowerCase().includes(s) ||
          item.product?.brand?.toLowerCase().includes(s)
      );
    }

    return NextResponse.json({
      products: filtered,
      total: count || 0,
      page,
      limit,
    });
  } catch (err) {
    console.error("Community API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
