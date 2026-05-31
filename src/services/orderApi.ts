import axiosInstance from "./axiosInstance";

export interface PlaceOrderPayload {
  addressId:      string;
  deliveryMethod: "standard" | "express";
  paymentMethod:  "cod" | "card" | "upi" | "netbanking" | "wallet";
  couponCode?:    string;
}

export interface OrderResult {
  _id:               string;
  orderNumber:       string;
  status:            string;
  totalAmount:       number;
  estimatedDelivery: string | null;
}

export const placeOrder = async (payload: PlaceOrderPayload): Promise<OrderResult> => {
  const res = await axiosInstance.post("/orders", payload);
  const data = res.data?.data;
  return data?.order ?? data;
};
