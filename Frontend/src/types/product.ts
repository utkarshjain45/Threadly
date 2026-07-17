export const Category = {
  FASHION: "FASHION",
  ELECTRONICS: "ELECTRONICS",
  BEAUTY: "BEAUTY",
  HOME_APPLIANCES: "HOME_APPLIANCES",
} as const;

export type Category = (typeof Category)[keyof typeof Category];

export interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  brand: string;
  description: string;
  stock: number;
  price: number;
  rating: number;
  ratingCount?: number;
  rating_count?: number;
  isFeatured?: boolean;
  is_featured?: boolean;
  createdAt?: string;

  // New detailed schema fields
  category: Category | string;
  subcategory?: string;
  color?: string;
  size?: string;
  originalPrice?: number;
  discount?: number;
  bestSeller?: boolean;
  newArrival?: boolean;
}
