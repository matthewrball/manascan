import type { IngredientCategory } from "@/types/ingredient";

export const CATEGORY_META: Record<
  IngredientCategory,
  { label: string; description: string; icon: string }
> = {
  seed_oil: {
    label: "Seed Oils",
    description: "Industrial seed and vegetable oils high in omega-6",
    icon: "🫒",
  },
  artificial_sweetener: {
    label: "Artificial Sweeteners",
    description: "Synthetic or highly processed sugar substitutes",
    icon: "🧪",
  },
  preservative: {
    label: "Preservatives",
    description: "Chemical preservatives linked to health concerns",
    icon: "🧫",
  },
  synthetic_dye: {
    label: "Synthetic Dyes",
    description: "Artificial food colorings derived from petroleum",
    icon: "🎨",
  },
  emulsifier: {
    label: "Emulsifiers",
    description: "Additives that may disrupt gut microbiome",
    icon: "🔬",
  },
  processing_agent: {
    label: "Processing Agents",
    description: "Chemicals used in industrial food processing",
    icon: "🏭",
  },
  flavor_enhancer: {
    label: "Flavor Enhancers",
    description: "Additives that artificially enhance taste",
    icon: "👅",
  },
  trans_fat: {
    label: "Trans Fats",
    description: "Artificially created trans fatty acids",
    icon: "⚠️",
  },
  other: {
    label: "Other Additives",
    description: "Other concerning food additives",
    icon: "❓",
  },
};
