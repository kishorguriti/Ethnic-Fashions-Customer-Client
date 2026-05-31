import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllBanners } from "../../services/bannerApi";
import type { Banner, BannerState } from "../../types/banner";

const initialState: BannerState = {
  hero:        [],
  promotional: [],
  sub_banner:  [],
  loading:     false,
  error:       null,
};

/** Filter banners that are currently active (within their date window). */
const isActive = (b: Banner): boolean => {
  const now = Date.now();
  if (b.startsAt && new Date(b.startsAt).getTime() > now) return false;
  if (b.endsAt   && new Date(b.endsAt).getTime()   < now) return false;
  return true;
};

export const fetchAllBanners = createAsyncThunk(
  "banners/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const all = await getAllBanners();
      const active = all.filter(isActive);

      return {
        hero:        active.filter((b) => b.placement === "hero")
                           .sort((a, b) => a.displayOrder - b.displayOrder),
        promotional: active.filter((b) => b.placement === "promotional")
                           .sort((a, b) => a.displayOrder - b.displayOrder),
        sub_banner:  active.filter((b) => b.placement === "sub_banner")
                           .sort((a, b) => a.displayOrder - b.displayOrder),
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to load banners"
      );
    }
  }
);

const bannerSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBanners.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAllBanners.fulfilled, (state, action) => {
        state.loading      = false;
        state.hero         = action.payload.hero;
        state.promotional  = action.payload.promotional;
        state.sub_banner   = action.payload.sub_banner;
      })
      .addCase(fetchAllBanners.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export default bannerSlice.reducer;
