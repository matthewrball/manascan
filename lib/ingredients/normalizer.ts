/**
 * Normalizes ingredient text for consistent matching.
 * Handles common OCR artifacts, formatting inconsistencies, and variations.
 */
export function normalizeIngredientText(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Normalize unicode
      .normalize("NFKD")
      // Remove percentage values like "sugar (5%)"
      .replace(/\(\s*\d+(\.\d+)?%?\s*\)/g, "")
      .replace(/\d+(\.\d+)?%/g, "")
      // Normalize hyphens and dashes
      .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-")
      // Collapse multiple spaces/whitespace
      .replace(/\s+/g, " ")
      // Remove leading/trailing punctuation
      .replace(/^[,;.\s]+|[,;.\s]+$/g, "")
      // Normalize common abbreviations
      .replace(/\bvit\.\s*/g, "vitamin ")
      .replace(/\bvit\s+/g, "vitamin ")
      // Remove "contains" prefix
      .replace(/^contains\s*:?\s*/i, "")
      .trim()
  );
}

/**
 * Splits an ingredients string into individual ingredients.
 * Handles nested parentheses, brackets, and common separators.
 */
export function splitIngredients(text: string): string[] {
  const ingredients: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "(" || char === "[") {
      depth++;
      current += char;
    } else if (char === ")" || char === "]") {
      depth--;
      current += char;
    } else if ((char === "," || char === ";") && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) ingredients.push(trimmed);
      current = "";
    } else {
      current += char;
    }
  }

  const trimmed = current.trim();
  if (trimmed) ingredients.push(trimmed);

  return ingredients;
}

/**
 * Extracts parenthetical sub-ingredients as separate terms.
 * "sugar (cane sugar, molasses)" → ["sugar", "cane sugar", "molasses"]
 */
export function extractSubIngredients(ingredient: string): string[] {
  const results: string[] = [];
  const parenMatch = ingredient.match(/^(.+?)\s*\((.+)\)\s*$/);

  if (parenMatch) {
    const main = parenMatch[1].trim();
    const sub = parenMatch[2];
    results.push(main);
    results.push(...splitIngredients(sub));
  } else {
    results.push(ingredient);
  }

  return results.map(normalizeIngredientText).filter(Boolean);
}

/**
 * Full normalization pipeline: split, extract sub-ingredients, normalize each.
 */
export function normalizeAndSplit(ingredientsText: string): string[] {
  const raw = splitIngredients(ingredientsText);
  const all: string[] = [];

  for (const ingredient of raw) {
    all.push(...extractSubIngredients(ingredient));
  }

  return [...new Set(all)].filter(Boolean);
}
