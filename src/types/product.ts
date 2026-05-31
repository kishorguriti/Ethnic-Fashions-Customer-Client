export interface ProductMedia {
  _id: string;
  url: string;
  resourceType: "image" | "video";
  format?: string;
}

export interface AppliedOffer {
  _id: string;
  title: string;
  type: "percentage" | "flat";
  value: number;
}

export interface ProductVariant {
  _id: string;
  product: string;
  color: string;
  size: string | null;
  sku: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  // Offer-adjusted price — equals sellingPrice when no active offer
  effectivePrice: number;
  offerSaving: number;
  totalDiscount: number;
  appliedOffer: AppliedOffer | null;
  stock: number;
  reserved: number;
  available: number;
  inStock: boolean;
  media: ProductMedia[];
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
    filterableAttributes?: import("./category").FilterableAttribute[];
  };
  brand?: string;
  tags: string[];
  attributes: Record<string, string>;
  approvalStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  variants: ProductVariant[];
  createdAt: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface ProductFilters {
  category?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "newest" | "price_asc" | "price_desc" | "discount";
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}
