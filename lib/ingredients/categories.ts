import type { IngredientCategory } from "@/types/ingredient";

export const CATEGORY_META: Record<
  IngredientCategory,
  { label: string; description: string; icon: string }
> = {
  seed_oil: {
    label: "Seed Oil",
    description: "Industrial seed and vegetable oils high in omega-6",
    icon: "🫒",
  },
  artificial_sweetener: {
    label: "Artificial Sweetener",
    description: "Synthetic or highly processed sugar substitutes",
    icon: "🧪",
  },
  preservative: {
    label: "Preservative",
    description: "Chemical preservatives linked to health concerns",
    icon: "🧫",
  },
  synthetic_dye: {
    label: "Synthetic Dye",
    description: "Artificial food colorings derived from petroleum",
    icon: "🎨",
  },
  emulsifier: {
    label: "Emulsifier",
    description: "Additives that may disrupt gut microbiome",
    icon: "🔬",
  },
  processing_agent: {
    label: "Processing Agent",
    description: "Chemicals used in industrial food processing",
    icon: "🏭",
  },
  flavor_enhancer: {
    label: "Flavor Enhancer",
    description: "Additives that artificially enhance taste",
    icon: "👅",
  },
  trans_fat: {
    label: "Trans Fat",
    description: "Artificially created trans fatty acids",
    icon: "⚠️",
  },
  other: {
    label: "Other Additive",
    description: "Other concerning food additives",
    icon: "❓",
  },
};
