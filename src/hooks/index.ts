import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "../store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuthSelector    = () => useAppSelector((s) => s.auth);
export const useCartSelector    = () => useAppSelector((s) => s.cart);
export const useWishlistSelector = () => useAppSelector((s) => s.wishlist);
export const useProductSelector  = () => useAppSelector((s) => s.products);
