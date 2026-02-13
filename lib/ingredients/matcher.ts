import type { BannedIngredient, MatchResult } from "@/types/ingredient";
import { BANNED_INGREDIENTS } from "./banned-list";
import { normalizeIngredientText, normalizeAndSplit } from "./normalizer";

// ─── Pre-computed lookup structures (built once at module load) ───

interface PreparedBanned {
  source: BannedIngredient;
  normalizedNames: string[];      // canonical + aliases, all normalized
  substringRegexes: RegExp[];     // pre-compiled word-boundary regexes
  normalizedENumbers: string[];   // pre-normalized e-numbers
}

// Hash map for O(1) exact match lookups
const exactMatchMap = new Map<string, BannedIngredient>();

// Prepared data for each banned ingredient
const preparedList: PreparedBanned[] = [];

// Build lookup structures once at module initialization
for (const banned of BANNED_INGREDIENTS) {
  const normalizedCanonical = normalizeIngredientText(banned.canonicalName);
  const normalizedAliases = banned.aliases.map(normalizeIngredientText);
  const normalizedNames = [normalizedCanonical, ...normalizedAliases];

  // Register exact matches in the hash map
  for (const name of normalizedNames) {
    if (!exactMatchMap.has(name)) {
      exactMatchMap.set(name, banned);
    }
  }

  // Pre-compile substring regexes (only for names >= 4 chars)
  const substringRegexes: RegExp[] = [];
  for (const name of normalizedNames) {
    if (name.length < 4) continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    substringRegexes.push(
      new RegExp(`(?:^|\\s|,|;|\\()${escaped}(?:$|\\s|,|;|\\))`, "i")
    );
  }

  // Pre-normalize e-numbers
  const normalizedENumbers = (banned.eNumbers || []).map((e) =>
    e.toLowerCase().replace(/\s/g, "")
  );

  preparedList.push({
    source: banned,
    normalizedNames,
    substringRegexes,
    normalizedENumbers,
  });
}

/**
 * Optimized 5-pass ingredient matching algorithm.
 * Pre-computed lookups reduce per-call work dramatically.
 */
export function analyzeIngredients(
  ingredientsText: string,
  additivesTags?: string[]
): MatchResult[] {
  const normalized = normalizeAndSplit(ingredientsText);
  const results: MatchResult[] = [];
  const matchedCanonicals = new Set<string>();

  for (const ingredient of normalized) {
    // Pass 1: O(1) exact match via hash map
    const exactBanned = exactMatchMap.get(ingredient);
    if (exactBanned && !matchedCanonicals.has(exactBanned.canonicalName)) {
      matchedCanonicals.add(exactBanned.canonicalName);
      results.push({
        ingredient,
        matched_against: ingredient,
        canonical_name: exactBanned.canonicalName,
        category: exactBanned.category,
        severity: exactBanned.severity,
        confidence: 1.0,
        match_type: "exact",
      });
      continue;
    }

    // Passes 2-5 for non-exact matches
    for (const prepared of preparedList) {
      if (matchedCanonicals.has(prepared.source.canonicalName)) continue;

      const match = runRemainingPasses(ingredient, prepared, additivesTags);
      if (match) {
        matchedCanonicals.add(prepared.source.canonicalName);
        results.push(match);
        break; // Move to next ingredient once matched
      }
    }
  }

  // Also check e-numbers from additivesTags (they may not appear in ingredient text)
  if (additivesTags) {
    for (const prepared of preparedList) {
      if (matchedCanonicals.has(prepared.source.canonicalName)) continue;
      if (prepared.normalizedENumbers.length === 0) continue;

      const match = eNumberMatch(additivesTags, prepared);
      if (match) {
        matchedCanonicals.add(prepared.source.canonicalName);
        results.push(match);
      }
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

function runRemainingPasses(
  ingredient: string,
  prepared: PreparedBanned,
  additivesTags?: string[]
): MatchResult | null {
  const banned = prepared.source;

  // Pass 2: Pre-compiled substring regex
  for (const regex of prepared.substringRegexes) {
    if (regex.test(ingredient) || regex.test(` ${ingredient} `)) {
      return {
        ingredient,
        matched_against: regex.source,
        canonical_name: banned.canonicalName,
        category: banned.category,
        severity: banned.severity,
        confidence: 0.95,
        match_type: "substring",
      };
    }
  }

  // Pass 3: Pattern match (regexes from banned-list.ts)
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

  // Pass 4: E-number match (inline, only if additivesTags provided)
  if (additivesTags && prepared.normalizedENumbers.length > 0) {
    const match = eNumberMatch(additivesTags, prepared);
    if (match) return match;
  }

  // Pass 5: Fuzzy match with early termination
  for (const name of prepared.normalizedNames) {
    if (name.length < 5) continue;
    // Early termination: if length difference > 2, Levenshtein can't be <= 2
    if (Math.abs(ingredient.length - name.length) > 2) continue;

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

/** E-number match from OFF additives_tags */
function eNumberMatch(
  additivesTags: string[],
  prepared: PreparedBanned
): MatchResult | null {
  const banned = prepared.source;

  for (const normalizedENum of prepared.normalizedENumbers) {
    for (const tag of additivesTags) {
      const normalizedTag = tag
        .toLowerCase()
        .replace("en:", "")
        .replace(/\s/g, "");
      if (
        normalizedTag === normalizedENum ||
        normalizedTag === `e${normalizedENum}`
      ) {
        return {
          ingredient: tag,
          matched_against: normalizedENum,
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

/** Optimized Levenshtein: single-row DP, O(min(a,b)) memory */
function levenshtein(a: string, b: string): number {
  if (a.length < b.length) [a, b] = [b, a]; // Ensure a is longer
  const bLen = b.length;
  const prev = new Array(bLen + 1);
  const curr = new Array(bLen + 1);

  for (let j = 0; j <= bLen; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= bLen; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
      }
    }
    // Swap rows
    for (let j = 0; j <= bLen; j++) prev[j] = curr[j];
  }

  return prev[bLen];
}
