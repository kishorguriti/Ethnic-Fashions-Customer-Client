import axiosInstance from "./axiosInstance";

export interface FaqData {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

export const getFaqs = async (): Promise<FaqData[]> => {
  try {
    const res = await axiosInstance.get("/faqs");
    return res.data?.data?.faqs ?? [];
  } catch {
    return [];
  }
};
