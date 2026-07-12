import type { ProductMedia, AppliedOffer } from "./product";

export interface CartVariant {
  _id: string;
  color: string;
  size: string | null;
  sku: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  effectivePrice: number;
  offerSaving: number;
  appliedOffer: AppliedOffer | null;
  stock: number;
  reserved: number;
  available: number;
  inStock: boolean;
  media: ProductMedia[];
}

export interface CartProduct {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  category: { _id: string; name: string; slug: string };
}

export interface CartItem {
  product: CartProduct;
  variant: CartVariant;
  quantity: number;
  addedAt: string;
  lineTotal: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  loading: boolean;
  mutating: boolean; // true while add/remove/update is in-flight
  error: string | null;
  // Applied coupon persisted from the cart page so checkout can reuse it.
  couponCode: string | null;
  discount: number;
}
