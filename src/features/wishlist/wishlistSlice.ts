import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../services/wishlistApi";
import type { WishlistState } from "../../types/wishlist";

const initialState: WishlistState = {
  items: [],
  wishlistedIds: [],
  total: 0,
  loading: false,
  toggling: null,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try { return await getWishlist(); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to load wishlist"); }
  }
);

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (
    { variantId, isWishlisted }: { variantId: string; isWishlisted: boolean },
    { rejectWithValue }
  ) => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(variantId);
        return { variantId, action: "removed" as const };
      } else {
        await addToWishlist(variantId);
        return { variantId, action: "added" as const };
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Wishlist action failed");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlist: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const allItems = action.payload?.items ?? [];
        // Filter out orphaned entries where product or variant was deleted
        const validItems = allItems.filter((i) => i.product !== null && i.variant !== null);
        state.items         = validItems;
        state.total         = validItems.length;          // show real count, not API total
        state.wishlistedIds = validItems.map((i) => i.variant!._id);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      .addCase(toggleWishlist.pending, (state, action) => {
        state.toggling = action.meta.arg.variantId;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.toggling = null;
        const { variantId, action: act } = action.payload;
        if (act === "removed") {
          state.items         = state.items.filter((i) => i.variant._id !== variantId);
          state.wishlistedIds = state.wishlistedIds.filter((id) => id !== variantId);
          state.total         = Math.max(0, state.total - 1);
        } else {
          state.wishlistedIds = [...state.wishlistedIds, variantId];
          state.total         = state.total + 1;
          // Full item details will appear on next fetchWishlist — no need to construct here
        }
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.toggling = null;
        state.error    = action.payload as string;
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
