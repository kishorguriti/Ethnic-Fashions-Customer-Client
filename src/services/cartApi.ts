import axiosInstance from "./axiosInstance";
import type { CartItem } from "../types/cart";

interface CartResponse {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

export const getCart = async (): Promise<CartResponse> => {
  const res = await axiosInstance.get("/cart");
  return res.data.data;
};

export const addItemToCart = async (variantId: string, quantity = 1): Promise<CartResponse> => {
  const res = await axiosInstance.post(`/cart/${variantId}`, { quantity });
  return res.data.data;
};

export const updateCartQuantity = async (variantId: string, quantity: number): Promise<CartResponse> => {
  const res = await axiosInstance.patch(`/cart/${variantId}`, { quantity });
  return res.data.data;
};

export const removeCartItem = async (variantId: string): Promise<CartResponse> => {
  const res = await axiosInstance.delete(`/cart/${variantId}`);
  return res.data.data;
};

export const clearCartApi = async (): Promise<void> => {
  await axiosInstance.delete("/cart");
};
