export interface OFFProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  image_front_url?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  ingredients?: OFFIngredient[];
  additives_tags?: string[];
  categories_tags?: string[];
  nutriments?: Record<string, number | string>;
}

export interface OFFIngredient {
  id: string;
  text: string;
  percent_estimate?: number;
  vegan?: string;
  vegetarian?: string;
}

export interface OFFResponse {
  code: string;
  product?: OFFProduct;
  status: number;
  status_verbose: string;
}
