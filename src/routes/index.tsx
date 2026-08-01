// src/routes/index.tsx
import { Routes, Route } from "react-router-dom";
import Home from "../pages/customer/Home";
import AdminDashboard from "../pages/admin/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import CartPage from "../features/cart/CartPage";
import CustomerLayout from "../components/layout/customer/CustomerLayout";
import ProductCollection from "../features/products/ProductCollection";
import ProductDetail from "../pages/customer/ProductDetail";
import Login from "../pages/customer/Login";
import Register from "../pages/customer/Register";
import Wishlist from "../features/wishlist/Wishlist";
import CustomerSupport from "../features/customer-support/CustomerSupport";
import MyAccount from "../pages/customer/account";
import CustomerProfile from "../pages/customer/account/CustomerProfile";
import AddressBook from "../pages/customer/account/Address";
import MyOrders from "../pages/customer/account/MyOrders";
import ReturnRequest from "../pages/customer/account/ReturnRequest";
import Notifications from "../pages/customer/account/Notifications";
import PaymentMethods from "../pages/customer/account/PaymentMethods";
import Checkout from "../features/checkout/Checkout";
import OrderConfirmation from "../features/checkout/OrderConfirmation";
import StaticPage from "../pages/customer/StaticPage";
import { usePageTracking } from "../hooks/usePageTracking";
// import ShoppingCart from "../features/cart/ShoppingCart";

export default function AppRoutes() {
  usePageTracking()
  return (
    <Routes>
      {/* Customer Routes */}

      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="products" element={<ProductCollection />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="customer-support" element={<CustomerSupport />} />
        <Route
          path="my-account"
          element={
            <ProtectedRoute role="customer">
              <MyAccount />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerProfile />} />
          <Route path="address" element={<AddressBook />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="return-requests" element={<ReturnRequest />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
        </Route>
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-placed" element={<OrderConfirmation />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="privacy-policy" element={<StaticPage slug="privacy-policy" />} />
        <Route path="terms" element={<StaticPage slug="terms" />} />
        <Route path="shipping" element={<StaticPage slug="shipping" />} />
        <Route path="returns" element={<StaticPage slug="returns" />} />
      </Route>
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
