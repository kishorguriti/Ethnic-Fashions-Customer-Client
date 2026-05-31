import axiosInstance from "./axiosInstance";
import type { Address, AddressPayload } from "../types/address";

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getProfile = async () => {
  const res = await axiosInstance.get("/customer/profile");
  return res.data.data.user;
};

export const updateProfileApi = async (data: { name?: string; email?: string }) => {
  const res = await axiosInstance.patch("/customer/profile", data);
  return res.data.data.user;
};

export const changePasswordApi = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  await axiosInstance.post("/customer/change-password", data);
};

// ─── Addresses ────────────────────────────────────────────────────────────────

export const getAddresses = async (): Promise<Address[]> => {
  const res = await axiosInstance.get("/customer/addresses");
  return res.data.data.addresses;
};

export const addAddressApi = async (data: AddressPayload): Promise<Address[]> => {
  const res = await axiosInstance.post("/customer/addresses", data);
  return res.data.data.addresses;
};

export const updateAddressApi = async (addressId: string, data: Partial<AddressPayload>): Promise<Address[]> => {
  const res = await axiosInstance.patch(`/customer/addresses/${addressId}`, data);
  return res.data.data.addresses;
};

export const deleteAddressApi = async (addressId: string): Promise<Address[]> => {
  const res = await axiosInstance.delete(`/customer/addresses/${addressId}`);
  return res.data.data.addresses;
};

export const setDefaultAddressApi = async (addressId: string): Promise<Address[]> => {
  const res = await axiosInstance.patch(`/customer/addresses/${addressId}/default`);
  return res.data.data.addresses;
};
