import type { OFFResponse, OFFProduct } from "@/types/openfoodfacts";

const OFF_BASE_URL = "https://world.openfoodfacts.org/api/v2";
const USER_AGENT =
  process.env.OFF_USER_AGENT || "Manascan/1.0 (https://manascan.app)";

export async function fetchProduct(
  barcode: string
): Promise<OFFProduct | null> {
  try {
    const res = await fetch(`${OFF_BASE_URL}/product/${barcode}`, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) return null;

    const data: OFFResponse = await res.json();

    if (data.status === 0 || !data.product) {
      return null;
    }

    return data.product;
  } catch {
    return null;
  }
}

export function extractIngredientsText(product: OFFProduct): string | null {
  return (
    product.ingredients_text_en ||
    product.ingredients_text ||
    null
  );
}

export function extractProductName(product: OFFProduct): string {
  return product.product_name || "Unknown Product";
}

export function extractBrand(product: OFFProduct): string | null {
  return product.brands || null;
}

export function extractImageUrl(product: OFFProduct): string | null {
  return product.image_front_url || product.image_url || null;
}
