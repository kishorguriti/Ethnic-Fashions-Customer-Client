import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";

export const fetchProducts = createAsyncThunk("products/get", async () => {
  const res = await axiosInstance.get("/products");
  return res.data;
});

const slice = createSlice({
  name: "products",
  initialState: { list: [], loading: false } as any,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (s) => {
      s.loading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (s, a) => {
      s.loading = false;
      s.list = a.payload;
    });
  },
});

export default slice.reducer;