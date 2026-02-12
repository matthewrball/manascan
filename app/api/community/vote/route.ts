import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { community_product_id, device_id, vote_type } = body;

    if (!community_product_id || !device_id || !vote_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["upvote", "downvote"].includes(vote_type)) {
      return NextResponse.json(
        { error: "Invalid vote type" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Upsert vote (one per device per product)
    const { error: voteError } = await supabase
      .from("community_votes")
      .upsert(
        {
          community_product_id,
          device_id,
          vote_type,
        },
        { onConflict: "community_product_id,device_id" }
      );

    if (voteError) {
      console.error("Vote error:", voteError);
      return NextResponse.json(
        { error: "Failed to record vote" },
        { status: 500 }
      );
    }

    // Update vote count
    const { count } = await supabase
      .from("community_votes")
      .select("*", { count: "exact", head: true })
      .eq("community_product_id", community_product_id)
      .eq("vote_type", "upvote");

    await supabase
      .from("community_approved")
      .update({ upvote_count: count || 0 })
      .eq("id", community_product_id);

    return NextResponse.json({ success: true, upvote_count: count || 0 });
  } catch (err) {
    console.error("Vote API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
