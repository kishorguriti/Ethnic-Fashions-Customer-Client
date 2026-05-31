import axiosInstance from "./axiosInstance";
import type { Product, ProductListResponse, ProductFilters } from "../types/product";

export const getProducts = async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const res = await axiosInstance.get("/products", { params });
  return res.data.data;
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const res = await axiosInstance.get(`/products/${slug}`);
  return res.data.data.product;
};
