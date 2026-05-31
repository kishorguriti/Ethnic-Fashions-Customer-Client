import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import cartReducer from "./features/cart/cartSlice";
import wishlistReducer from "./features/wishlist/wishlistSlice";
import productReducer from "./features/products/productSlice";
import categoryReducer from "./features/category/categorySlice";
import bannerReducer from "./features/banners/bannerSlice";

export const store = configureStore({
  reducer: {
    auth:       authReducer,
    cart:       cartReducer,
    wishlist:   wishlistReducer,
    products:   productReducer,
    categories: categoryReducer,
    banners:    bannerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
