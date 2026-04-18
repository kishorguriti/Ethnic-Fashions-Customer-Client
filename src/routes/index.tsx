// src/routes/index.tsx
import { Routes, Route } from "react-router-dom";
import Home from "../pages/customer/Home";
import AdminDashboard from "../pages/admin/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import CartPage from "../features/cart/CartPage";
import CustomerLayout from "../components/layout/customer/CustomerLayout";
import ProductCollection from "../features/products/ProductCollection";
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
// import ShoppingCart from "../features/cart/ShoppingCart";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Routes */}

      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="products" element={<ProductCollection />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="customer-support" element={<CustomerSupport />} />
        <Route path="my-account" element={<MyAccount />}>
          <Route index element={<CustomerProfile />} />
          <Route path="address" element={<AddressBook />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="return-requests" element={<ReturnRequest />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
        </Route>
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-placed" element={<OrderConfirmation />} />
        
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
