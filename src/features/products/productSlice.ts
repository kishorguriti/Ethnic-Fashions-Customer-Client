import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProducts, getProductBySlug } from "../../services/productApi";
import type { Product, ProductFilters, ProductListResponse } from "../../types/product";

interface ProductState {
  list: Product[];
  total: number;
  pages: number;
  currentPage: number;
  selected: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  list: [],
  total: 0,
  pages: 1,
  currentPage: 1,
  selected: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      return await getProducts(filters);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load products");
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  "products/fetchBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      return await getProductBySlug(slug);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Product not found");
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSelected: (state) => { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload as ProductListResponse;
        state.list = data.products;
        state.total = data.total;
        state.pages = data.pages;
        state.currentPage = data.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  },
});

export const { clearSelected } = productSlice.actions;
export default productSlice.reducer;
