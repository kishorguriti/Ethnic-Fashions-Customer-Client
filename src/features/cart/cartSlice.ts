import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCart,
  addItemToCart,
  updateCartQuantity,
  removeCartItem,
  clearCartApi,
} from "../../services/cartApi";
import type { CartState } from "../../types/cart";

const emptyCart = { items: [], subtotal: 0, totalItems: 0 };

const initialState: CartState = {
  ...emptyCart,
  loading: false,
  mutating: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try { return await getCart(); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to load cart"); }
  }
);

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ variantId, quantity = 1 }: { variantId: string; quantity?: number }, { rejectWithValue }) => {
    try { return await addItemToCart(variantId, quantity); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to add item"); }
  }
);

export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({ variantId, quantity }: { variantId: string; quantity: number }, { rejectWithValue }) => {
    try { return await updateCartQuantity(variantId, quantity); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to update quantity"); }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (variantId: string, { rejectWithValue }) => {
    try { return await removeCartItem(variantId); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to remove item"); }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try { await clearCartApi(); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to clear cart"); }
  }
);

const setCartData = (state: CartState, payload: { items: CartState["items"]; subtotal: number; totalItems: number }) => {
  state.items      = payload.items;
  state.subtotal   = payload.subtotal;
  state.totalItems = payload.totalItems;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Called on logout to wipe local cart state without an API call
    resetCart: (state) => { Object.assign(state, emptyCart); }
  },
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; setCartData(state, action.payload); })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // add / update / remove — all return the new cart snapshot from server
    const mutationPending   = (state: CartState) => { state.mutating = true; state.error = null; };
    const mutationFulfilled = (state: CartState, action: any) => { state.mutating = false; if (action.payload) setCartData(state, action.payload); };
    const mutationRejected  = (state: CartState, action: any) => { state.mutating = false; state.error = action.payload as string; };

    builder
      .addCase(addToCart.pending, mutationPending)
      .addCase(addToCart.fulfilled, mutationFulfilled)
      .addCase(addToCart.rejected, mutationRejected)
      .addCase(updateQty.pending, mutationPending)
      .addCase(updateQty.fulfilled, mutationFulfilled)
      .addCase(updateQty.rejected, mutationRejected)
      .addCase(removeFromCart.pending, mutationPending)
      .addCase(removeFromCart.fulfilled, mutationFulfilled)
      .addCase(removeFromCart.rejected, mutationRejected)
      .addCase(clearCart.pending, mutationPending)
      .addCase(clearCart.fulfilled, (state) => { state.mutating = false; Object.assign(state, emptyCart); })
      .addCase(clearCart.rejected, mutationRejected);
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
