import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAppDispatch, useAuthSelector } from "../../../hooks";
import { fetchCart, resetCart } from "../../../features/cart/cartSlice";
import { fetchWishlist, resetWishlist } from "../../../features/wishlist/wishlistSlice";
import { fetchCurrentUser } from "../../../features/auth/authSlice";

const CustomerLayout = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuthSelector();
  const { pathname } = useLocation();

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
      {/* key=pathname re-mounts the wrapper on every route change, re-triggering
          the fadeSlideUp CSS animation defined in _animations.scss */}
      <main key={pathname} className="page-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
