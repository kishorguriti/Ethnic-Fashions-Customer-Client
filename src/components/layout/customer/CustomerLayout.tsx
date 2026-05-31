import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAppDispatch, useAuthSelector } from "../../../hooks";
import { fetchCart, resetCart } from "../../../features/cart/cartSlice";
import { fetchWishlist, resetWishlist } from "../../../features/wishlist/wishlistSlice";
import { fetchCurrentUser } from "../../../features/auth/authSlice";

const CustomerLayout = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuthSelector();

  // On login: sync fresh profile + cart + wishlist from server
  useEffect(() => {
    if (user) {
      dispatch(fetchCurrentUser());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    } else {
      dispatch(resetCart());
      dispatch(resetWishlist());
    }
  }, [user?.id, user?.phone, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="customer-layout-container">
      <Header />
      <Outlet />
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default CustomerLayout;
