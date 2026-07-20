import axiosInstance from "./axiosInstance";

export type ReturnReason =
  | "size_issue"
  | "defective"
  | "wrong_item"
  | "changed_mind"
  | "color_mismatch"
  | "not_as_described"
  | "other";

export interface ReturnRequestPayload {
  orderId: string;
  reason: ReturnReason;
  reasonText?: string;
  type?: "return" | "exchange";
  items?: Array<{ variant: string; quantity: number }>;
}

export interface ReturnRecord {
  _id: string;
  returnNumber: string;
  orderNumber: string;
  reason: string;
  reasonText?: string;
  type: "return" | "exchange";
  amount: number;
  status: "pending" | "approved" | "rejected" | "processing" | "refunded";
  createdAt: string;
}

export const REASON_OPTIONS: { value: ReturnReason; label: string }[] = [
  { value: "size_issue", label: "Size issue" },
  { value: "defective", label: "Defective / damaged" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "color_mismatch", label: "Colour mismatch" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "other", label: "Other" },
];

export const requestReturn = async (payload: ReturnRequestPayload): Promise<ReturnRecord> => {
  const res = await axiosInstance.post("/returns", payload);
  return res.data.data.return;
};

export const getMyReturns = async (): Promise<{ returns: ReturnRecord[]; total: number }> => {
  const res = await axiosInstance.get("/returns");
  return res.data.data;
};

export const getMyReturn = async (id: string): Promise<ReturnRecord> => {
  const res = await axiosInstance.get(`/returns/${id}`);
  return res.data.data.return;
};
