export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: "percentage" | "flat";
  value: number;
  maxDiscountCap: number | null;
  minOrderValue: number;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export interface AppliedCoupon {
  couponId:       string;
  code:           string;
  description:    string;
  type:           "percentage" | "flat";
  value:          number;
  maxDiscountCap: number | null;
  discountAmount: number;
  finalAmount:    number;
}
