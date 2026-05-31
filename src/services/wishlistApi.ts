import axiosInstance from "./axiosInstance";
import type { WishlistItem } from "../types/wishlist";

interface WishlistResponse {
  items: WishlistItem[];
  total: number;
  page: number;
  pages: number;
}

export const getWishlist = async (page = 1, limit = 50): Promise<WishlistResponse> => {
  const res = await axiosInstance.get("/wishlist", { params: { page, limit } });
  return res.data.data;
};

export const addToWishlist = async (variantId: string): Promise<void> => {
  await axiosInstance.post(`/wishlist/${variantId}`);
};

export const removeFromWishlist = async (variantId: string): Promise<void> => {
  await axiosInstance.delete(`/wishlist/${variantId}`);
};
