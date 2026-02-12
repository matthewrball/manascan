import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barcode, product_id, analysis_result, device_id } = body;

    if (!barcode || !device_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Record scan event
    const { error: scanError } = await supabase.from("scans").insert({
      device_id,
      product_id,
      barcode,
      analysis_result: analysis_result || "unknown",
    });

    if (scanError) {
      console.error("Scan insert error:", scanError);
    }

    // Add every scanned product to community browse
    if (product_id) {
      const { count } = await supabase
        .from("scans")
        .select("device_id", { count: "exact", head: true })
        .eq("product_id", product_id);

      await supabase
        .from("community_approved")
        .upsert(
          {
            product_id,
            scan_count: count ?? 1,
            last_scanned_at: new Date().toISOString(),
          },
          { onConflict: "product_id" }
        )
        .select();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Scan record error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
