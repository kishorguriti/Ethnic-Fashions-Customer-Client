import type { ProductMedia } from "./product";

export interface WishlistVariant {
  _id: string;
  color: string;
  size: string | null;
  mrp: number;
  sellingPrice: number;
  discount: number;
  effectivePrice: number;
  offerSaving: number;
  available: number;
  inStock: boolean;
  media: ProductMedia[];
  isActive: boolean;
}

export interface WishlistProduct {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  attributes: Record<string, string>;
  category: { _id: string; name: string; slug: string };
}

export interface WishlistItem {
  _id: string;
  product: WishlistProduct;
  variant: WishlistVariant;
  createdAt: string;
}

export interface WishlistState {
  items: WishlistItem[];
  // Flat set of wishlisted variant IDs — used for O(1) heart icon state in product cards
  wishlistedIds: string[];
  total: number;
  loading: boolean;
  // Tracks which variantId is currently being toggled to prevent double-clicks
  toggling: string | null;
  error: string | null;
}
