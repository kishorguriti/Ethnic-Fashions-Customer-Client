import axiosInstance from "./axiosInstance";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PlaceOrderPayload {
  addressId:      string;
  deliveryMethod: "standard" | "express";
  paymentMethod:  "cod" | "card" | "upi" | "netbanking" | "wallet";
  couponCode?:    string;
}

export interface OrderItem {
  variant?: string; // variant id — needed to reference the line in a return request
  name: string;
  sku?: string;
  color?: string;
  size?: string;
  image?: string;
  unitPrice: number;
  mrp?: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderPayment {
  method: "razorpay" | "cod";
  status: "created" | "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  channel?: string;
  amountPaid: number;
  amountRefunded: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  shippingAddress: Record<string, string>;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  deliveryMethod: "standard" | "express";
  estimatedDelivery: string | null;
  payment: OrderPayment;
  createdAt: string;
  // Convenience alias used by the confirmation screen.
  totalAmount?: number;
}

export interface RazorpayHandshake {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface CreateOrderResult {
  order: Order;
  razorpay?: RazorpayHandshake; // present only for online payments
}

export interface OrderQuote {
  items: Array<{ name: string; image?: string; color?: string; size?: string; quantity: number; unitPrice: number; lineTotal: number }>;
  subtotal: number;
  discount: number;
  couponCode: string;
  shippingFee: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: string;
}

// Legacy shape still consumed by OrderConfirmation.tsx.
export interface OrderResult {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  estimatedDelivery: string | null;
}

const withTotalAmount = (order: Order): Order => ({ ...order, totalAmount: order.total });

// ─── API ────────────────────────────────────────────────────────────────────

// Authoritative price preview for the current cart.
export const getQuote = async (payload: { deliveryMethod: "standard" | "express"; couponCode?: string }): Promise<OrderQuote> => {
  const res = await axiosInstance.post("/orders/quote", payload);
  return res.data.data;
};

// Create an order. For online payments the result carries a `razorpay` handshake
// to open checkout; for COD the order is already confirmed.
export const createOrder = async (payload: PlaceOrderPayload): Promise<CreateOrderResult> => {
  const res = await axiosInstance.post("/orders", payload);
  const data = res.data.data;
  return { order: withTotalAmount(data.order), razorpay: data.razorpay };
};

// Verify the Razorpay handshake after a successful checkout.
export const verifyPayment = async (payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<Order> => {
  const res = await axiosInstance.post("/orders/verify", payload);
  return withTotalAmount(res.data.data.order);
};

export const getMyOrders = async (params?: { page?: number; limit?: number; status?: string }): Promise<{ orders: Order[]; total: number; page: number; pages: number }> => {
  const res = await axiosInstance.get("/orders", { params });
  return res.data.data;
};

export const getOrder = async (id: string): Promise<Order> => {
  const res = await axiosInstance.get(`/orders/${id}`);
  return withTotalAmount(res.data.data.order);
};

export const cancelOrder = async (id: string, reason?: string): Promise<Order> => {
  const res = await axiosInstance.post(`/orders/${id}/cancel`, { reason });
  return withTotalAmount(res.data.data.order);
};

// ─── Backwards-compatible helper (single-call place, no online handshake) ─────
// Kept so any older imports keep type-checking. New code should use createOrder.
export const placeOrder = async (payload: PlaceOrderPayload): Promise<Order> => {
  const { order } = await createOrder(payload);
  return order;
};
