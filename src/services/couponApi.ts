import axiosInstance from "./axiosInstance";
import type { Coupon, AppliedCoupon } from "../types/coupon";

export const getAvailableCoupons = async (): Promise<Coupon[]> => {
  const res = await axiosInstance.get("/coupons/available");
  return res.data.data.coupons ?? [];
};

export const validateCoupon = async (
  code: string,
  cartSubtotal: number
): Promise<AppliedCoupon> => {
  const res = await axiosInstance.post("/coupons/validate", { code, cartSubtotal });
  return res.data.data;
};
