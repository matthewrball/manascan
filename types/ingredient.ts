export type IngredientCategory =
  | "seed_oil"
  | "artificial_sweetener"
  | "preservative"
  | "synthetic_dye"
  | "emulsifier"
  | "processing_agent"
  | "flavor_enhancer"
  | "trans_fat"
  | "other";

export type Severity = "high" | "medium" | "low";

export interface BannedIngredient {
  canonicalName: string;
  category: IngredientCategory;
  aliases: string[];
  severity: Severity;
  matchPatterns: RegExp[];
  eNumbers?: string[];
}

export interface MatchResult {
  ingredient: string;
  matched_against: string;
  canonical_name: string;
  category: IngredientCategory;
  severity: Severity;
  confidence: number;
  match_type: "exact" | "substring" | "pattern" | "e-number" | "fuzzy";
}
