import axiosInstance from "./axiosInstance";
import type { Category } from "../types/category";

export const getCategories = async (): Promise<Category[]> => {
  const res = await axiosInstance.get("/categories");
  return res.data.data.categories;
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const res = await axiosInstance.get(`/categories/${slug}`);
  return res.data.data.category;
};
