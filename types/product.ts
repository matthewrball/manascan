export interface Product {
  id: string;
  barcode: string;
  product_name: string;
  brand: string | null;
  image_url: string | null;
  ingredients_text: string | null;
  ingredients_parsed: ParsedIngredient[] | null;
  analysis_result: AnalysisResult;
  flagged_ingredients: FlaggedIngredient[] | null;
  source: "openfoodfacts" | "manual";
  created_at: string;
  updated_at: string;
}

export type AnalysisResult = "clean" | "flagged" | "unknown";

export interface ParsedIngredient {
  id: string;
  text: string;
  percent_estimate?: number;
}

export interface FlaggedIngredient {
  ingredient: string;
  matched_against: string;
  canonical_name: string;
  category: string;
  severity: "high" | "medium" | "low";
  confidence: number;
  match_type: "exact" | "substring" | "pattern" | "e-number" | "fuzzy";
}

export interface ScanRecord {
  id: string;
  device_id: string;
  product_id: string;
  barcode: string;
  analysis_result: AnalysisResult;
  scanned_at: string;
}

export interface CommunityProduct {
  id: string;
  product_id: string;
  scan_count: number;
  upvote_count: number;
  first_scanned_at: string;
  last_scanned_at: string;
  product?: Product;
}

export interface CommunityVote {
  id: string;
  community_product_id: string;
  device_id: string;
  vote_type: "upvote" | "downvote";
}
