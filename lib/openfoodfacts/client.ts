import type { OFFResponse, OFFProduct } from "@/types/openfoodfacts";

const OFF_BASE_URL = "https://world.openfoodfacts.org/api/v2";
const USER_AGENT =
  process.env.OFF_USER_AGENT || "Manascan/1.0 (https://manascan.app)";
const FETCH_TIMEOUT_MS = 8000;
const OFF_FIELDS =
  "product_name,brands,image_front_url,image_url,ingredients_text,ingredients_text_en,ingredients,additives_tags,categories_tags";

export async function fetchProduct(
  barcode: string
): Promise<OFFProduct | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `${OFF_BASE_URL}/product/${barcode}?fields=${OFF_FIELDS}`,
      {
        headers: { "User-Agent": USER_AGENT },
        signal: controller.signal,
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) return null;

    const data: OFFResponse = await res.json();

    if (data.status === 0 || !data.product) {
      return null;
    }

    return data.product;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
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
