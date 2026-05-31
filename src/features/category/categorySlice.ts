import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCategories, getCategoryBySlug } from "../../services/categoryApi";
import type { Category } from "../../types/category";

interface CategoryState {
  tree: Category[];
  selected: Category | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  tree: [],
  selected: null,
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getCategories();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load categories");
    }
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  "categories/fetchBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      return await getCategoryBySlug(slug);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Category not found");
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearSelected: (state) => { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.tree = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  },
});

export const { clearSelected } = categorySlice.actions;
export default categorySlice.reducer;
