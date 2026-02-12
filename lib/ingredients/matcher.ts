import type { BannedIngredient, MatchResult } from "@/types/ingredient";
import { BANNED_INGREDIENTS } from "./banned-list";
import { normalizeIngredientText, normalizeAndSplit } from "./normalizer";

/**
 * 5-pass ingredient matching algorithm.
 * Returns all flagged ingredients with confidence scores.
 */
export function analyzeIngredients(
  ingredientsText: string,
  additivesTags?: string[]
): MatchResult[] {
  const normalized = normalizeAndSplit(ingredientsText);
  const results: MatchResult[] = [];
  const seen = new Set<string>();

  for (const ingredient of normalized) {
    for (const banned of BANNED_INGREDIENTS) {
      const key = `${ingredient}::${banned.canonicalName}`;
      if (seen.has(key)) continue;

      const match = runMatchPasses(ingredient, banned, additivesTags);
      if (match) {
        seen.add(key);
        results.push(match);
      }
    }
  }

  // Deduplicate by canonical name, keeping highest confidence
  const best = new Map<string, MatchResult>();
  for (const r of results) {
    const existing = best.get(r.canonical_name);
    if (!existing || r.confidence > existing.confidence) {
      best.set(r.canonical_name, r);
    }
  }

  return Array.from(best.values()).sort((a, b) => b.confidence - a.confidence);
}

function runMatchPasses(
  ingredient: string,
  banned: BannedIngredient,
  additivesTags?: string[]
): MatchResult | null {
  // Pass 1: Exact match
  const exact = exactMatch(ingredient, banned);
  if (exact) return exact;

  // Pass 2: Substring match
  const substring = substringMatch(ingredient, banned);
  if (substring) return substring;

  // Pass 3: Pattern match
  const pattern = patternMatch(ingredient, banned);
  if (pattern) return pattern;

  // Pass 4: E-number match
  if (additivesTags) {
    const enumber = eNumberMatch(additivesTags, banned);
    if (enumber) return enumber;
  }

  // Pass 5: Fuzzy match
  const fuzzy = fuzzyMatch(ingredient, banned);
  if (fuzzy) return fuzzy;

  return null;
}

/** Pass 1: Exact match against canonical name and aliases */
function exactMatch(
  ingredient: string,
  banned: BannedIngredient
): MatchResult | null {
  const normalizedBanned = normalizeIngredientText(banned.canonicalName);
  const allNames = [normalizedBanned, ...banned.aliases.map(normalizeIngredientText)];

  for (const name of allNames) {
    if (ingredient === name) {
      return {
        ingredient,
        matched_against: name,
        canonical_name: banned.canonicalName,
        category: banned.category,
        severity: banned.severity,
        confidence: 1.0,
        match_type: "exact",
      };
    }
  }

  return null;
}

/** Pass 2: Substring match with word boundary checks */
function substringMatch(
  ingredient: string,
  banned: BannedIngredient
): MatchResult | null {
  const normalizedBanned = normalizeIngredientText(banned.canonicalName);
  const allNames = [normalizedBanned, ...banned.aliases.map(normalizeIngredientText)];

  for (const name of allNames) {
    if (name.length < 4) continue; // Skip short names to avoid false positives

    // Word boundary check: the banned name should appear as a complete term
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordBoundaryRegex = new RegExp(`(?:^|\\s|,|;|\\()${escapedName}(?:$|\\s|,|;|\\))`, "i");

    if (wordBoundaryRegex.test(ingredient) || wordBoundaryRegex.test(` ${ingredient} `)) {
      return {
        ingredient,
        matched_against: name,
        canonical_name: banned.canonicalName,
        category: banned.category,
        severity: banned.severity,
        confidence: 0.95,
        match_type: "substring",
      };
    }
  }

  return null;
}

/** Pass 3: Regex pattern match */
function patternMatch(
  ingredient: string,
  banned: BannedIngredient
): MatchResult | null {
  for (const pattern of banned.matchPatterns) {
    if (pattern.test(ingredient)) {
      return {
        ingredient,
        matched_against: pattern.source,
        canonical_name: banned.canonicalName,
        category: banned.category,
        severity: banned.severity,
        confidence: 0.9,
        match_type: "pattern",
      };
    }
  }

  return null;
}

/** Pass 4: E-number match from OFF additives_tags */
function eNumberMatch(
  additivesTags: string[],
  banned: BannedIngredient
): MatchResult | null {
  if (!banned.eNumbers?.length) return null;

  for (const eNum of banned.eNumbers) {
    const normalized = eNum.toLowerCase().replace(/\s/g, "");
    for (const tag of additivesTags) {
      const normalizedTag = tag.toLowerCase().replace("en:", "").replace(/\s/g, "");
      if (normalizedTag === normalized || normalizedTag === `e${normalized}`) {
        return {
          ingredient: tag,
          matched_against: eNum,
          canonical_name: banned.canonicalName,
          category: banned.category,
          severity: banned.severity,
          confidence: 0.95,
          match_type: "e-number",
        };
      }
    }
  }

  return null;
}

/** Pass 5: Fuzzy match using Levenshtein distance */
function fuzzyMatch(
  ingredient: string,
  banned: BannedIngredient
): MatchResult | null {
  const normalizedBanned = normalizeIngredientText(banned.canonicalName);
  const allNames = [normalizedBanned, ...banned.aliases.map(normalizeIngredientText)];

  for (const name of allNames) {
    if (name.length < 5) continue; // Skip short names
    const distance = levenshtein(ingredient, name);
    const maxLen = Math.max(ingredient.length, name.length);
    const similarity = 1 - distance / maxLen;

    if (similarity >= 0.85 && distance <= 2) {
      return {
        ingredient,
        matched_against: name,
        canonical_name: banned.canonicalName,
        category: banned.category,
        severity: banned.severity,
        confidence: 0.7,
        match_type: "fuzzy",
      };
    }
  }

  return null;
}

/** Levenshtein distance between two strings */
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/** Quick check: is a product clean? */
export function isClean(
  ingredientsText: string,
  additivesTags?: string[]
): boolean {
  return analyzeIngredients(ingredientsText, additivesTags).length === 0;
}
