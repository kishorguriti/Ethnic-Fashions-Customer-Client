import axiosInstance from "./axiosInstance";

export interface StaticPageData {
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt: string;
}

export const getStaticPageBySlug = async (slug: string): Promise<StaticPageData | null> => {
  try {
    const res = await axiosInstance.get(`/pages/${slug}`);
    return res.data?.data?.page ?? null;
  } catch {
    return null;
  }
};
