import axiosInstance from "./axiosInstance";

export const loginCustomer = async (data: {
  email?: string;
  phone?: string;
  password: string;
}) => {
  const res = await axiosInstance.post("/customer/login", data);
  // Return the full response body — thunk extracts user from wherever it sits
  return res.data;
};

export const logoutCustomer = async () => {
  await axiosInstance.post("/auth/logout");
};

export const sendOtp = async (phone: string) => {
  const res = await axiosInstance.post("/customer/otp/send", { phone });
  return res.data;
};

export const registerCustomer = async (data: {
  phone: string;
  otp: string;
  password: string;
  email?: string;
  name?: string;
}) => {
  const res = await axiosInstance.post("/customer/register", data);
  return res.data;
};

export const getCustomerProfile = async () => {
  const res = await axiosInstance.get("/customer/profile");
  return res.data;
};

export const updateCustomerProfile = async (data: {
  name?: string;
  email?: string;
}) => {
  const res = await axiosInstance.patch("/customer/profile", data);
  return res.data;
};
