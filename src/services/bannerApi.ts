import axiosInstance from "./axiosInstance";
import type { Banner } from "../types/banner";

const extractBanners = (body: any): Banner[] => {
  if (Array.isArray(body?.data?.banners)) return body.data.banners;
  if (Array.isArray(body?.data))          return body.data;
  if (Array.isArray(body?.banners))       return body.banners;
  if (Array.isArray(body))                return body;
  return [];
};

const fetchByPlacement = async (
  placement: "hero" | "promotional" | "sub_banner"
): Promise<Banner[]> => {
  try {
    const res = await axiosInstance.get("/banners", { params: { placement } });
    return extractBanners(res.data);
  } catch {
    return [];
  }
};

export const getAllBanners = async (): Promise<Banner[]> => {
  const [hero, promotional, sub_banner] = await Promise.all([
    fetchByPlacement("hero"),
    fetchByPlacement("promotional"),
    fetchByPlacement("sub_banner"),
  ]);
  return [...hero, ...promotional, ...sub_banner];
};
