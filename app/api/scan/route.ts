import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BARCODE_RE = /^\d{8,14}$/;
const VALID_RESULTS = ["clean", "flagged", "unknown"];

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

    if (!BARCODE_RE.test(barcode)) {
      return NextResponse.json(
        { error: "Invalid barcode format" },
        { status: 400 }
      );
    }

    if (typeof device_id !== "string" || !UUID_RE.test(device_id)) {
      return NextResponse.json(
        { error: "Invalid device_id format" },
        { status: 400 }
      );
    }

    const sanitizedResult = VALID_RESULTS.includes(analysis_result)
      ? analysis_result
      : "unknown";

    const supabase = await createClient();

    // Record scan event
    const { error: scanError } = await supabase.from("scans").insert({
      device_id,
      product_id,
      barcode,
      analysis_result: sanitizedResult,
    });

    if (scanError) {
      console.error("Scan insert error:", scanError.message);
    }

    // Fire community upsert in background — client doesn't need the result
    if (product_id) {
      supabase
        .from("scans")
        .select("device_id", { count: "exact", head: true })
        .eq("product_id", product_id)
        .then(({ count }) => {
          supabase
            .from("community_approved")
            .upsert(
              {
                product_id,
                scan_count: count ?? 1,
                last_scanned_at: new Date().toISOString(),
              },
              { onConflict: "product_id" }
            )
            .select()
            .then(() => {});
        });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Scan record error:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
