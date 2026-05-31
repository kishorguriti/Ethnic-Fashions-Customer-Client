import axiosInstance from "./axiosInstance";
import type { WishlistItem } from "../types/wishlist";

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
}

/** Extract wishlist items from any common backend response shape. */
const extractWishlist = (body: any): WishlistResponse => {
  // Response shape: { items: [...], total: N, page: N, pages: N }
  const data = body?.data ?? body;
  const items: WishlistItem[] = Array.isArray(data?.items) ? data.items : [];
  const total: number = data?.total ?? items.length;
  return { items, total };
};

export const getWishlist = async (page = 1, limit = 50): Promise<WishlistResponse> => {
  const res = await axiosInstance.get("/wishlist", { params: { page, limit } });
  return extractWishlist(res.data);
};

export const addToWishlist = async (variantId: string): Promise<void> => {
  await axiosInstance.post(`/wishlist/${variantId}`);
};

export const removeFromWishlist = async (variantId: string): Promise<void> => {
  await axiosInstance.delete(`/wishlist/${variantId}`);
};
