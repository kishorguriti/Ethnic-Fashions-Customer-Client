#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Razorpay integration installer — CUSTOMER CLIENT
# Run this FROM THE ROOT of the project folder:  bash apply-2-customer.sh
# Safe to re-run (idempotent). Does NOT touch .env or node_modules.
# ─────────────────────────────────────────────────────────────
set -euo pipefail
echo "Applying changes in: $(pwd)"
echo
mkdir -p 'src/features/cart'
cat > 'src/features/cart/CartPage.tsx' <<'__RZP_EOF_7f3a__'
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, Typography, Button, Input, Row, Col,
  Divider, message, Alert, Spin, Tag,
} from "antd";
import { DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, GiftOutlined } from "@ant-design/icons";
import { useAppDispatch, useCartSelector } from "../../hooks";
import { updateQty, removeFromCart, clearCart, setCoupon, clearCoupon } from "./cartSlice";
import { validateCoupon } from "../../services/couponApi";
import type { AppliedCoupon } from "../../types/coupon";
import AvailableCoupons from "./AvailableCoupons";

const { Title, Text } = Typography;

const CartPage: React.FC = () => {
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();
  const { items, subtotal, totalItems, loading, mutating } = useCartSelector();

  const [couponCode, setCouponCode]         = useState("");
  const [couponLoading, setCouponLoading]   = useState(false);
  const [couponError, setCouponError]       = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon]   = useState<AppliedCoupon | null>(null);
  const [couponsOpen, setCouponsOpen]       = useState(false);

  const shipping     = 0;
  const tax          = subtotal * 0.08;
  const couponSaving = appliedCoupon?.discountAmount ?? 0;
  const total        = subtotal - couponSaving + shipping + tax;

  const handleUpdateQty = (variantId: string, val: number) => {
    if (val < 1) return;
    dispatch(updateQty({ variantId, quantity: val }));
  };

  const handleRemove = (variantId: string) => {
    dispatch(removeFromCart(variantId)).then(() => message.success("Item removed"));
    // If a coupon was applied, its validity may change — clear it so user re-validates
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponCode("");
    }
  };

  // Shared apply logic — called by both the inline input and the coupons drawer
  const applyCode = async (code: string) => {
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(code.trim().toUpperCase(), subtotal);
      setAppliedCoupon(result);
      setCouponCode(result.code);
      // Persist to the cart slice so the checkout flow can apply the same coupon.
      dispatch(setCoupon({ code: result.code, discount: result.discountAmount }));
      message.success(`Coupon applied! You save ₹${result.discountAmount.toLocaleString()}`);
    } catch (err: any) {
      setCouponError(err.response?.data?.message || "Invalid or expired coupon");
      setAppliedCoupon(null);
      throw err; // re-throw so the drawer can handle loading state
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    applyCode(couponCode);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
    dispatch(clearCoupon());
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="wishlist-container container d-flex flex-column align-items-center justify-content-center">
        <div className="text-start w-100 py-4">
          <Title level={2}>Shopping Cart</Title>
        </div>
        <div className="empty-state-content text-center d-flex flex-column align-items-center my-4 py-4">
          <p className="empty-message mb-4">Your Cart is empty</p>
          <Button type="primary" size="large" onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper py-4">
      <div className="container">
        <Title level={2} className="page-header mb-4">
          Shopping Cart
          <Text type="secondary" className="ms-2 fs-6 fw-normal">
            ({totalItems} item{totalItems !== 1 ? "s" : ""})
          </Text>
        </Title>

        <Row gutter={24}>
          {/* ── Cart Items ── */}
          <Col xs={24} lg={16}>
            {items.map((item) => {
              const v   = item.variant;
              const pid = v._id;

              return (
                <Card key={pid} className="cart-item-card mb-3" bordered={false}>
                  <div className="d-flex align-items-start">
                    <img
                      src={v.media[0]?.url}
                      alt={item.product.name}
                      style={{ width: 100, height: 120, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                    />

                    <div className="item-details flex-grow-1 ms-4">
                      <Text
                        strong className="d-block fs-5 cursor-pointer"
                        onClick={() => navigate(`/products/${item.product.slug}`)}
                      >
                        {item.product.name}
                      </Text>
                      <Text type="secondary" className="d-block mb-2">
                        {v.size ? `Size: ${v.size} | ` : ""}Color: {v.color}
                      </Text>

                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <Title level={4} className="m-0">
                          ₹{v.effectivePrice.toLocaleString()}
                        </Title>
                        {v.mrp > v.effectivePrice && (
                          <Text delete type="secondary" className="small">
                            ₹{v.mrp.toLocaleString()}
                          </Text>
                        )}
                        {v.appliedOffer && (
                          <Tag color="volcano" className="m-0">{v.appliedOffer.title}</Tag>
                        )}
                        {v.offerSaving > 0 && (
                          <Text type="success" className="small">
                            Save ₹{v.offerSaving.toLocaleString()}
                          </Text>
                        )}
                      </div>

                      {!v.inStock && <Tag color="warning" className="mt-1">Out of Stock</Tag>}

                      <div className="mt-3">
                        <div className="qty-control">
                          <button
                            className="qty-btn"
                            aria-label="Decrease quantity"
                            disabled={mutating || item.quantity <= 1}
                            onClick={() => handleUpdateQty(pid, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="qty-display">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            aria-label="Increase quantity"
                            disabled={mutating || item.quantity >= v.available}
                            onClick={() => handleUpdateQty(pid, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-column align-items-end ms-3">
                      <Text strong>₹{item.lineTotal.toLocaleString()}</Text>
                      <Button
                        type="text" danger icon={<DeleteOutlined />}
                        className="mt-2" disabled={mutating}
                        onClick={() => handleRemove(pid)}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}

            <Button danger type="text" disabled={mutating} onClick={() => dispatch(clearCart())}>
              Clear Cart
            </Button>
          </Col>

          {/* ── Order Summary ── */}
          <Col xs={24} lg={8}>
            <Card className="summary-card" bordered={false}>
              <Title level={4} className="mb-4">Order Summary</Title>

              {/* ── Coupon section ── */}
              <div className="coupon-section mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Text strong>Have a coupon?</Text>
                  <Button
                    type="link"
                    size="small"
                    icon={<GiftOutlined />}
                    style={{ padding: 0, fontSize: 12 }}
                    onClick={() => setCouponsOpen(true)}
                  >
                    View offers
                  </Button>
                </div>

                {appliedCoupon ? (
                  <div
                    className="d-flex align-items-center justify-content-between p-2"
                    style={{ background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 6 }}
                  >
                    <div>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} className="me-2" />
                      <Text strong style={{ color: "#52c41a" }}>{appliedCoupon.code}</Text>
                      <Text type="secondary" className="small ms-2">
                        — Save ₹{appliedCoupon.discountAmount.toLocaleString()}
                      </Text>
                    </div>
                    <Button
                      type="text" size="small" danger
                      icon={<CloseCircleOutlined />}
                      onClick={handleRemoveCoupon}
                    />
                  </div>
                ) : (
                  <>
                    <div className="d-flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                        onPressEnter={handleApplyCoupon}
                        className="custom-input"
                        style={{ textTransform: "uppercase" }}
                      />
                      <Button
                        className="apply-btn"
                        loading={couponLoading}
                        disabled={!couponCode.trim()}
                        onClick={handleApplyCoupon}
                      >
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <Text type="danger" className="small d-block mt-1">{couponError}</Text>
                    )}
                  </>
                )}
              </div>

              {/* ── Price breakdown ── */}
              <div className="price-breakdown">
                <div className="d-flex justify-content-between mb-2">
                  <Text type="secondary">Subtotal</Text>
                  <Text strong>₹{subtotal.toLocaleString()}</Text>
                </div>

                {couponSaving > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <Text type="secondary">Coupon ({appliedCoupon!.code})</Text>
                    <Text type="success">− ₹{couponSaving.toLocaleString()}</Text>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-2">
                  <Text type="secondary">Shipping</Text>
                  <Text type="success">FREE</Text>
                </div>
                <div className="d-flex justify-content-between mb-4">
                  <Text type="secondary">Tax (8%)</Text>
                  <Text strong>₹{tax.toFixed(0)}</Text>
                </div>

                <Divider className="my-3" />

                <div className="d-flex justify-content-between mb-4">
                  <Text strong className="fs-6">Total</Text>
                  <Text strong className="fs-6">₹{Math.max(0, total).toFixed(0)}</Text>
                </div>

                {couponSaving > 0 && (
                  <Alert
                    type="success"
                    showIcon
                    className="mb-3"
                    message={<span>You're saving <strong>₹{couponSaving.toLocaleString()}</strong> on this order!</span>}
                  />
                )}

                <Button
                  type="primary" block className="checkout-btn"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <AvailableCoupons
        open={couponsOpen}
        onClose={() => setCouponsOpen(false)}
        cartSubtotal={subtotal}
        appliedCoupon={appliedCoupon}
        onApply={applyCode}
      />
    </div>
  );
};

export default CartPage;
__RZP_EOF_7f3a__
echo "  ✓ src/features/cart/CartPage.tsx"
mkdir -p 'src/features/cart'
cat > 'src/features/cart/cartSlice.ts' <<'__RZP_EOF_7f3a__'
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCart,
  addItemToCart,
  updateCartQuantity,
  removeCartItem,
  clearCartApi,
} from "../../services/cartApi";
import type { CartState } from "../../types/cart";

const emptyCart = { items: [], subtotal: 0, totalItems: 0, couponCode: null, discount: 0 };

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
    resetCart: (state) => { Object.assign(state, emptyCart); },
    // Persist / clear the coupon applied on the cart page so checkout can reuse it.
    setCoupon: (state, action: { payload: { code: string; discount: number } }) => {
      state.couponCode = action.payload.code;
      state.discount   = action.payload.discount;
    },
    clearCoupon: (state) => { state.couponCode = null; state.discount = 0; },
  },
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; setCartData(state, action.payload); })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // add / update / remove — all return the new cart snapshot from server
    const mutationPending   = (state: CartState) => { state.mutating = true; state.error = null; };
    const mutationFulfilled = (state: CartState, action: any) => {
      state.mutating = false;
      if (action.payload) setCartData(state, action.payload);
      // Contents changed → a previously applied coupon may no longer be valid.
      state.couponCode = null;
      state.discount = 0;
    };
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

export const { resetCart, setCoupon, clearCoupon } = cartSlice.actions;
export default cartSlice.reducer;
__RZP_EOF_7f3a__
echo "  ✓ src/features/cart/cartSlice.ts"
mkdir -p 'src/features/checkout'
cat > 'src/features/checkout/Checkout.tsx' <<'__RZP_EOF_7f3a__'
import React, { useEffect, useState } from "react";
import {
  Card, Steps, Typography, Button, Row, Col,
  Divider, Space, Skeleton, Tag, message,
} from "antd";
import {
  TruckOutlined, CreditCardOutlined, LockOutlined,
  CheckCircleFilled, SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks";
import { getAddresses, addAddressApi } from "../../services/customerApi";
import { createOrder, verifyPayment } from "../../services/orderApi";
import { fetchCart } from "../cart/cartSlice";
import { loadRazorpayScript, openRazorpayCheckout } from "../../services/razorpay";
import type { Address, AddressPayload } from "../../types/address";
import type { PlaceOrderPayload } from "../../services/orderApi";
import DeliveryStep from "./DeliveryStep";
import PaymentStep from "./PaymentStep";
import ReviewStep from "./ReviewStep";
import AddressStep from "./AddressStep";

const { Title, Text } = Typography;

const STEPS = ["Shipping", "Delivery", "Payment", "Review"];

const CheckoutPage: React.FC = () => {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const cartState = useAppSelector((s) => s.cart);
  const { items, subtotal, totalItems, couponCode, discount } = cartState as any;

  // ── Step state ────────────────────────────────────────────────────────────
  const [step, setStep]           = useState(0);

  // ── Address state ─────────────────────────────────────────────────────────
  const [addresses, setAddresses]         = useState<Address[]>([]);
  const [addrLoading, setAddrLoading]     = useState(true);
  const [selectedAddrId, setSelectedAddrId] = useState<string>("");

  // ── Delivery / payment ────────────────────────────────────────────────────
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [shippingCost, setShippingCost]     = useState(0);
  const [paymentMethod, setPaymentMethod]   = useState<PlaceOrderPayload["paymentMethod"]>("cod");

  // ── Place order ───────────────────────────────────────────────────────────
  const [placing, setPlacing] = useState(false);

  // ── Load addresses on mount ───────────────────────────────────────────────
  useEffect(() => {
    getAddresses()
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) setSelectedAddrId(def._id);
      })
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  }, []);

  const handleAddAddress = async (payload: AddressPayload) => {
    const updated = await addAddressApi(payload);
    setAddresses(updated);
    const newest = updated[updated.length - 1];
    if (newest) setSelectedAddrId(newest._id);
  };

  // ── Step validation ───────────────────────────────────────────────────────
  const canContinue = () => {
    if (step === 0) return !!selectedAddrId;
    return true;
  };

  const handleContinue = () => {
    if (!canContinue()) {
      message.warning("Please select a delivery address");
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  // ── Place order (Razorpay online OR COD) ────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddrId) { message.error("No address selected"); return; }
    setPlacing(true);

    const payload: PlaceOrderPayload = {
      addressId:      selectedAddrId,
      deliveryMethod,
      paymentMethod,
      couponCode:     couponCode || undefined,
    };

    try {
      const { order, razorpay } = await createOrder(payload);

      // ── COD: order already confirmed on the server ──
      if (paymentMethod === "cod" || !razorpay) {
        dispatch(fetchCart());               // server cleared the cart
        navigate("/order-placed", { state: { order } });
        return;
      }

      // ── Online: open Razorpay hosted checkout ──
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        message.error("Could not load the payment gateway. Please try again.");
        setPlacing(false);
        return;
      }

      openRazorpayCheckout({
        key:         razorpay.key,
        orderId:     razorpay.orderId,
        amount:      razorpay.amount,
        currency:    razorpay.currency,
        name:        razorpay.name,
        description: razorpay.description,
        prefill:     razorpay.prefill,
        onSuccess: async (resp) => {
          try {
            const verified = await verifyPayment({
              razorpayOrderId:   resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            });
            dispatch(fetchCart());
            navigate("/order-placed", { state: { order: verified } });
          } catch (err: any) {
            message.error(err.response?.data?.message || "Payment verification failed. If money was deducted it will be refunded.");
            setPlacing(false);
          }
        },
        onDismiss: () => {
          message.info("Payment cancelled. Your order is saved and can be paid from your orders.");
          setPlacing(false);
        },
      });
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to place order. Try again.");
      setPlacing(false);
    }
  };

  // ── Derived totals (mirrors the server: tax on the post-discount amount) ────
  const orderDiscount = discount ?? 0;
  const taxable = Math.max(0, (subtotal ?? 0) - orderDiscount);
  const tax     = Math.round(taxable * 0.08);
  const total   = taxable + shippingCost + tax;

  const selectedAddress = addresses.find((a) => a._id === selectedAddrId) ?? null;

  return (
    <div className="secure-checkout-container">
      <div className="container py-5">
        {/* Header */}
        <header className="checkout-header mb-4">
          <Title level={2}>Secure Checkout</Title>
          <Text type="secondary">
            <LockOutlined /> Your payment information is encrypted and secure
          </Text>
        </header>

        {/* Progress Steps */}
        <Card className="steps-outer-card mb-4" bordered={false}>
          <Steps
            current={step}
            responsive={false}
            items={STEPS.map((title, i) => ({
              title,
              icon: (
                <div className="step-icon-inner">
                  {i === 0 && <TruckOutlined />}
                  {i === 1 && <TruckOutlined />}
                  {i === 2 && <CreditCardOutlined />}
                  {i === 3 && <CheckCircleFilled />}
                </div>
              ),
            }))}
          />
        </Card>

        <Row gutter={24}>
          {/* ── Left: active step ── */}
          <Col xs={24} lg={16}>
            {step === 0 && (
              addrLoading
                ? <Card bordered={false}><Skeleton active paragraph={{ rows: 4 }} /></Card>
                : <AddressStep
                    addresses={addresses}
                    selectedId={selectedAddrId}
                    onSelect={setSelectedAddrId}
                    onAdd={handleAddAddress}
                  />
            )}
            {step === 1 && (
              <DeliveryStep
                selected={deliveryMethod}
                onChange={(method, cost) => { setDeliveryMethod(method as any); setShippingCost(cost); }}
              />
            )}
            {step === 2 && (
              <PaymentStep
                selected={paymentMethod}
                onChange={(m) => setPaymentMethod(m as any)}
              />
            )}
            {step === 3 && (
              <ReviewStep
                address={selectedAddress}
                deliveryMethod={deliveryMethod}
                shippingCost={shippingCost}
                paymentMethod={paymentMethod}
                items={items ?? []}
                subtotal={subtotal ?? 0}
                discount={orderDiscount}
                couponCode={couponCode ?? ""}
              />
            )}

            {/* Nav buttons */}
            <div className={`action-row mt-4 d-flex ${step > 0 ? "justify-content-between" : "justify-content-end"}`}>
              {step > 0 && (
                <Button className="back-btn" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="primary"
                  className="checkout-continue-btn"
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="primary"
                  className="checkout-continue-btn"
                  loading={placing}
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>
              )}
            </div>
          </Col>

          {/* ── Right: order summary sidebar ── */}
          <Col xs={24} lg={8}>
            <Card className="order-summary-card" bordered={false}>
              <Title level={4} className="mb-3">
                Order Summary
                {totalItems > 0 && (
                  <Tag color="purple" className="ms-2" style={{ fontSize: 12 }}>
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </Tag>
                )}
              </Title>

              {/* Cart items preview */}
              <div style={{ maxHeight: 280, overflowY: "auto" }} className="mb-3">
                {(items ?? []).map((item: any) => (
                  <div key={item.variant._id} className="cart-preview-item d-flex gap-3 mb-3">
                    <div className="product-img-box" style={{ flexShrink: 0 }}>
                      <img
                        src={item.variant.media[0]?.url}
                        alt={item.product.name}
                        style={{ width: 60, height: 72, objectFit: "cover", borderRadius: 8 }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <Text strong className="d-block" style={{ fontSize: 13, lineHeight: 1.3 }}>
                        {item.product.name}
                      </Text>
                      <Text type="secondary" className="small d-block">
                        {item.variant.size ? `Size: ${item.variant.size} · ` : ""}
                        Color: {item.variant.color}
                      </Text>
                      <Text type="secondary" className="small">Qty: {item.quantity}</Text>
                    </div>
                    <Text strong style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                      ₹{item.lineTotal.toLocaleString()}
                    </Text>
                  </div>
                ))}
              </div>

              <Divider className="my-2" />

              {/* Price breakdown */}
              <div className="price-details">
                <div className="price-line">
                  <Text type="secondary">Subtotal</Text>
                  <Text strong>₹{(subtotal ?? 0).toLocaleString()}</Text>
                </div>
                {orderDiscount > 0 && (
                  <div className="price-line">
                    <Text type="secondary">Discount{couponCode ? ` (${couponCode})` : ""}</Text>
                    <Text type="success" strong>−₹{orderDiscount.toLocaleString()}</Text>
                  </div>
                )}
                <div className="price-line">
                  <Text type="secondary">Shipping</Text>
                  {shippingCost > 0
                    ? <Text strong>₹{shippingCost.toLocaleString()}</Text>
                    : <Text type="success" strong>FREE</Text>}
                </div>
                <div className="price-line">
                  <Text type="secondary">Tax (8%)</Text>
                  <Text strong>₹{tax.toFixed(0)}</Text>
                </div>
                <Divider className="my-3" />
                <div className="total-line d-flex justify-content-between">
                  <Title level={4} className="m-0">Total</Title>
                  <Title level={4} className="m-0 total-amount">₹{total.toFixed(0)}</Title>
                </div>
              </div>

              <div className="trust-info-footer mt-4">
                <Space direction="vertical" size="small" className="w-100">
                  <Text type="secondary" className="small">
                    <LockOutlined className="me-2" /> Secure SSL Encryption
                  </Text>
                  <Text type="secondary" className="small">
                    <TruckOutlined className="me-2" /> Free Returns within 30 days
                  </Text>
                  <Text type="secondary" className="small">
                    <SafetyCertificateOutlined className="me-2" /> 100% Authentic Products
                  </Text>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutPage;
__RZP_EOF_7f3a__
echo "  ✓ src/features/checkout/Checkout.tsx"
mkdir -p 'src/features/checkout'
cat > 'src/features/checkout/ReviewStep.tsx' <<'__RZP_EOF_7f3a__'
import React from "react";
import { Card, Typography, Tag, Space, Divider } from "antd";
import {
  CheckOutlined, EnvironmentOutlined, TruckOutlined,
  CreditCardOutlined, PhoneOutlined,
} from "@ant-design/icons";
import type { Address } from "../../types/address";

const { Title, Text } = Typography;

const PAYMENT_LABELS: Record<string, string> = {
  cod:        "Cash on Delivery",
  card:       "Credit / Debit Card",
  upi:        "UPI",
  netbanking: "Net Banking",
  wallet:     "Digital Wallet",
};

interface Props {
  address:        Address | null;
  deliveryMethod: string;
  shippingCost:   number;
  paymentMethod:  string;
  items:          any[];
  subtotal:       number;
  discount?:      number;
  couponCode?:    string;
}

const ReviewStep: React.FC<Props> = ({
  address, deliveryMethod, shippingCost, paymentMethod, items, subtotal,
  discount = 0, couponCode = "",
}) => {
  const taxable = Math.max(0, subtotal - discount);
  const tax     = Math.round(taxable * 0.08);
  const total   = taxable + shippingCost + tax;

  return (
    <div className="review-step-container">
      {/* ── Items ── */}
      <Card className="review-card mb-4" bordered={false}>
        <div className="section-header d-flex align-items-center mb-4">
          <CheckOutlined className="check-icon me-2" />
          <Title level={4} className="m-0">Review Your Order</Title>
        </div>

        {items.map((item: any) => (
          <div key={item.variant._id} className="product-review-item d-flex align-items-start mb-4">
            <div className="product-image-wrapper" style={{ flexShrink: 0 }}>
              <img
                src={item.variant.media[0]?.url}
                alt={item.product.name}
                style={{ width: 80, height: 96, objectFit: "cover", borderRadius: 8 }}
              />
            </div>
            <div className="product-info-wrapper flex-grow-1 ms-4">
              <div className="d-flex justify-content-between align-items-start">
                <Title level={5} className="product-name m-0">{item.product.name}</Title>
                <Text strong>₹{item.lineTotal.toLocaleString()}</Text>
              </div>
              <Space size="small" className="mt-2 flex-wrap">
                {item.variant.size && <Tag>{`Size: ${item.variant.size}`}</Tag>}
                <Tag>{`Color: ${item.variant.color}`}</Tag>
                <Tag>{`Qty: ${item.quantity}`}</Tag>
                {item.variant.appliedOffer && (
                  <Tag color="volcano">{item.variant.appliedOffer.title}</Tag>
                )}
              </Space>
            </div>
          </div>
        ))}

        <Divider className="my-2" />

        {/* Mini totals */}
        <div className="d-flex flex-column gap-1">
          <div className="d-flex justify-content-between">
            <Text type="secondary">Subtotal</Text>
            <Text>₹{subtotal.toLocaleString()}</Text>
          </div>
          {discount > 0 && (
            <div className="d-flex justify-content-between">
              <Text type="secondary">Discount{couponCode ? ` (${couponCode})` : ""}</Text>
              <Text type="success">−₹{discount.toLocaleString()}</Text>
            </div>
          )}
          <div className="d-flex justify-content-between">
            <Text type="secondary">Shipping ({deliveryMethod})</Text>
            {shippingCost > 0
              ? <Text>₹{shippingCost}</Text>
              : <Text type="success">FREE</Text>}
          </div>
          <div className="d-flex justify-content-between">
            <Text type="secondary">Tax (8%)</Text>
            <Text>₹{tax.toFixed(0)}</Text>
          </div>
          <Divider className="my-2" />
          <div className="d-flex justify-content-between">
            <Text strong className="fs-6">Total</Text>
            <Text strong className="fs-6">₹{total.toFixed(0)}</Text>
          </div>
        </div>
      </Card>

      {/* ── Delivery address ── */}
      <Card className="review-card mb-4" bordered={false}>
        <div className="d-flex align-items-center mb-3">
          <EnvironmentOutlined className="blue-icon me-2" />
          <Title level={5} className="m-0">Delivery Address</Title>
        </div>
        {address ? (
          <div className="address-display-box px-2">
            <Text strong className="d-block mb-1">{address.fullName}</Text>
            <Text type="secondary" className="d-block">{address.addressLine1}</Text>
            {address.addressLine2 && (
              <Text type="secondary" className="d-block">{address.addressLine2}</Text>
            )}
            <Text type="secondary" className="d-block">
              {address.city}, {address.state} — {address.pincode}
            </Text>
            <Text type="secondary" className="d-block mt-1">
              <PhoneOutlined className="me-1" />{address.phone}
            </Text>
          </div>
        ) : (
          <Text type="secondary">No address selected</Text>
        )}
      </Card>

      {/* ── Delivery + payment summary ── */}
      <Card className="review-card" bordered={false}>
        <div className="d-flex align-items-center mb-3">
          <TruckOutlined className="blue-icon me-2" />
          <Title level={5} className="m-0">Delivery & Payment</Title>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <Text type="secondary">Delivery method</Text>
          <Text strong style={{ textTransform: "capitalize" }}>
            {deliveryMethod} {shippingCost === 0 ? "(FREE)" : `(₹${shippingCost})`}
          </Text>
        </div>
        <div className="d-flex justify-content-between">
          <Text type="secondary">Payment method</Text>
          <div className="d-flex align-items-center gap-1">
            <CreditCardOutlined />
            <Text strong>{PAYMENT_LABELS[paymentMethod] ?? paymentMethod}</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReviewStep;
__RZP_EOF_7f3a__
echo "  ✓ src/features/checkout/ReviewStep.tsx"
mkdir -p 'src/pages/customer/account'
cat > 'src/pages/customer/account/MyOrders.tsx' <<'__RZP_EOF_7f3a__'
import React, { useEffect, useState } from "react";
import { Card, Typography, Tag, Button, Space, Empty, Skeleton, Drawer, Descriptions, Divider, message, Popconfirm, Modal, Form, Select, Input, Checkbox, InputNumber } from "antd";
import { getMyOrders, getOrder, cancelOrder } from "../../../services/orderApi";
import type { Order, OrderItem } from "../../../services/orderApi";
import { requestReturn, REASON_OPTIONS, type ReturnReason } from "../../../services/returnApi";

const { Title, Text } = Typography;

const statusColor = (status: string) => {
  switch (status) {
    case "delivered": return "success";
    case "shipped":
    case "processing":
    case "confirmed": return "processing";
    case "cancelled":
    case "returned": return "error";
    default: return "default";
  }
};

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

const paymentLabel = (o: Order) => {
  if (o.payment.method === "cod") return o.payment.status === "paid" ? "COD · Paid" : "Cash on Delivery";
  switch (o.payment.status) {
    case "paid": return "Paid online";
    case "refunded": return "Refunded";
    case "partially_refunded": return "Partially refunded";
    case "failed": return "Payment failed";
    default: return "Payment pending";
  }
};

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Return request modal
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnForm] = Form.useForm();
  // Per-line selection: keyed by variant id → { checked, quantity }
  const [returnSel, setReturnSel] = useState<Record<string, { checked: boolean; quantity: number }>>({});

  const openReturn = (order: Order) => {
    returnForm.resetFields();
    const sel: Record<string, { checked: boolean; quantity: number }> = {};
    order.items.forEach((it) => {
      if (it.variant) sel[it.variant] = { checked: true, quantity: it.quantity };
    });
    setReturnSel(sel);
    setReturnOpen(true);
  };

  const setLineChecked = (variant: string, checked: boolean) =>
    setReturnSel((prev) => ({ ...prev, [variant]: { ...prev[variant], checked } }));

  const setLineQty = (variant: string, quantity: number) =>
    setReturnSel((prev) => ({ ...prev, [variant]: { ...prev[variant], quantity } }));

  // Live refund estimate from the current selection.
  const returnEstimate = (order: Order | null) =>
    !order ? 0 : order.items.reduce((sum, it) => {
      const s = it.variant ? returnSel[it.variant] : undefined;
      return s?.checked ? sum + it.unitPrice * s.quantity : sum;
    }, 0);

  const load = () => {
    setLoading(true);
    getMyOrders({ limit: 50 })
      .then((res) => setOrders(res.orders))
      .catch((err: any) => message.error(err.response?.data?.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openDetails = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const order = await getOrder(id);
      setDetail(order);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to load order");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelling(true);
    try {
      const updated = await cancelOrder(id);
      message.success("Order cancelled");
      setDetail(updated);
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Could not cancel this order");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (o: Order) => !["shipped", "delivered", "cancelled", "returned"].includes(o.status);
  const canReturn = (o: Order) => o.status === "delivered";

  const submitReturn = async () => {
    if (!detail) return;
    try {
      const values = await returnForm.validateFields();

      // Collect the selected lines.
      const selectedItems = detail.items
        .filter((it) => it.variant && returnSel[it.variant]?.checked && returnSel[it.variant]?.quantity > 0)
        .map((it) => ({ variant: it.variant as string, quantity: returnSel[it.variant!].quantity }));

      if (selectedItems.length === 0) {
        message.warning("Select at least one item to return");
        return;
      }

      // If every line is fully selected, omit `items` for a clean whole-order return.
      const allFull =
        selectedItems.length === detail.items.length &&
        detail.items.every((it) => it.variant && returnSel[it.variant]?.quantity === it.quantity);

      setReturnLoading(true);
      await requestReturn({
        orderId: detail._id,
        reason: values.reason as ReturnReason,
        reasonText: values.reasonText || undefined,
        items: allFull ? undefined : selectedItems,
      });
      message.success("Return request submitted. We'll review it shortly.");
      setReturnOpen(false);
      returnForm.resetFields();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation
      message.error(err.response?.data?.message || "Could not submit return request");
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <Card className="orders-container-card" bordered={false}>
      <Title level={3} className="section-title mb-4">My Orders</Title>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : orders.length === 0 ? (
        <Empty description="You haven't placed any orders yet" />
      ) : (
        orders.map((order) => (
          <Card key={order._id} className="order-item-card mb-4" bordered>
            <div className="order-header d-flex justify-content-between align-items-start mb-3">
              <div>
                <Title level={5} className="m-0">Order #{order.orderNumber}</Title>
                <Text type="secondary">Placed on {fmtDate(order.createdAt)}</Text>
              </div>
              <Tag color={statusColor(order.status)} className="status-tag">{cap(order.status)}</Tag>
            </div>

            <div className="product-thumbnails mb-4">
              <Space size="middle">
                {order.items.slice(0, 4).map((it, idx) =>
                  it.image ? (
                    <div key={idx} className="thumb-wrapper">
                      <img src={it.image} alt={it.name} />
                    </div>
                  ) : null
                )}
                {order.items.length > 4 && <Text type="secondary">+{order.items.length - 4} more</Text>}
              </Space>
            </div>

            <div className="order-footer d-flex justify-content-between align-items-center pt-3">
              <div>
                <Text type="secondary" className="d-block small">Total Amount</Text>
                <Text strong className="total-price">₹{order.total.toLocaleString("en-IN")}</Text>
                <Text type="secondary" className="d-block small">{paymentLabel(order)}</Text>
              </div>
              <Button className="view-details-btn" onClick={() => openDetails(order._id)}>View Details</Button>
            </div>
          </Card>
        ))
      )}

      <Drawer
        title={detail ? `Order #${detail.orderNumber}` : "Order details"}
        open={detailLoading || !!detail}
        onClose={() => setDetail(null)}
        width={480}
      >
        {detailLoading || !detail ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Status"><Tag color={statusColor(detail.status)}>{cap(detail.status)}</Tag></Descriptions.Item>
              <Descriptions.Item label="Placed on">{fmtDate(detail.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Estimated delivery">{fmtDate(detail.estimatedDelivery)}</Descriptions.Item>
              <Descriptions.Item label="Payment">{paymentLabel(detail)}</Descriptions.Item>
            </Descriptions>

            <Divider>Items</Divider>
            {detail.items.map((it, idx) => (
              <div key={idx} className="d-flex justify-content-between align-items-center mb-3" style={{ gap: 12 }}>
                {it.image && <img src={it.image} alt={it.name} style={{ width: 48, height: 58, objectFit: "cover", borderRadius: 6 }} />}
                <div className="flex-grow-1">
                  <Text strong className="d-block" style={{ fontSize: 13 }}>{it.name}</Text>
                  <Text type="secondary" className="small">
                    {it.size ? `Size: ${it.size} · ` : ""}Color: {it.color} · Qty: {it.quantity}
                  </Text>
                </div>
                <Text strong>₹{it.lineTotal.toLocaleString("en-IN")}</Text>
              </div>
            ))}

            <Divider />
            <div className="d-flex justify-content-between"><Text type="secondary">Subtotal</Text><Text>₹{detail.subtotal.toLocaleString("en-IN")}</Text></div>
            {detail.discount > 0 && (
              <div className="d-flex justify-content-between"><Text type="secondary">Discount{detail.couponCode ? ` (${detail.couponCode})` : ""}</Text><Text type="success">−₹{detail.discount.toLocaleString("en-IN")}</Text></div>
            )}
            <div className="d-flex justify-content-between"><Text type="secondary">Shipping</Text><Text>{detail.shippingFee > 0 ? `₹${detail.shippingFee}` : "FREE"}</Text></div>
            <div className="d-flex justify-content-between"><Text type="secondary">Tax</Text><Text>₹{detail.tax.toLocaleString("en-IN")}</Text></div>
            <div className="d-flex justify-content-between mt-2"><Text strong>Total</Text><Text strong>₹{detail.total.toLocaleString("en-IN")}</Text></div>

            {detail.shippingAddress && (
              <>
                <Divider>Delivery Address</Divider>
                <Text className="d-block">{detail.shippingAddress.fullName}</Text>
                <Text type="secondary" className="d-block">{detail.shippingAddress.addressLine1}</Text>
                {detail.shippingAddress.addressLine2 && <Text type="secondary" className="d-block">{detail.shippingAddress.addressLine2}</Text>}
                <Text type="secondary" className="d-block">{detail.shippingAddress.city}, {detail.shippingAddress.state} — {detail.shippingAddress.pincode}</Text>
                <Text type="secondary" className="d-block">{detail.shippingAddress.phone}</Text>
              </>
            )}

            {canCancel(detail) && (
              <Popconfirm title="Cancel this order?" description="Paid online orders are automatically refunded." okText="Yes, cancel" onConfirm={() => handleCancel(detail._id)}>
                <Button danger block className="mt-4" loading={cancelling}>Cancel Order</Button>
              </Popconfirm>
            )}

            {canReturn(detail) && (
              <Button block className="mt-3" onClick={() => openReturn(detail)}>
                Request Return
              </Button>
            )}
          </>
        )}
      </Drawer>

      <Modal
        open={returnOpen}
        title={detail ? `Return — Order #${detail.orderNumber}` : "Request Return"}
        okText="Submit Request"
        confirmLoading={returnLoading}
        onCancel={() => { setReturnOpen(false); returnForm.resetFields(); }}
        onOk={submitReturn}
        destroyOnClose
      >
        <Text type="secondary" className="d-block mb-3">
          Select the items you want to return. Approved returns are refunded to your original payment method.
        </Text>

        {detail && (
          <div className="return-items-list mb-3">
            {detail.items.map((it: OrderItem, idx) => {
              const key = it.variant || String(idx);
              const sel = it.variant ? returnSel[it.variant] : undefined;
              const disabled = !it.variant;
              return (
                <div key={key} className="d-flex align-items-center gap-2 mb-2" style={{ opacity: disabled ? 0.5 : 1 }}>
                  <Checkbox
                    checked={!!sel?.checked}
                    disabled={disabled}
                    onChange={(e) => it.variant && setLineChecked(it.variant, e.target.checked)}
                  />
                  {it.image && <img src={it.image} alt={it.name} style={{ width: 40, height: 48, objectFit: "cover", borderRadius: 6 }} />}
                  <div className="flex-grow-1">
                    <Text strong className="d-block" style={{ fontSize: 13 }}>{it.name}</Text>
                    <Text type="secondary" className="small">
                      {it.size ? `Size: ${it.size} · ` : ""}Color: {it.color} · ₹{it.unitPrice.toLocaleString("en-IN")}
                    </Text>
                  </div>
                  <InputNumber
                    size="small"
                    min={1}
                    max={it.quantity}
                    value={sel?.quantity ?? it.quantity}
                    disabled={disabled || !sel?.checked}
                    onChange={(v) => it.variant && setLineQty(it.variant, Number(v) || 1)}
                    style={{ width: 64 }}
                  />
                  <Text type="secondary" className="small" style={{ whiteSpace: "nowrap" }}>/ {it.quantity}</Text>
                </div>
              );
            })}
          </div>
        )}

        <Form form={returnForm} layout="vertical">
          <Form.Item name="reason" label="Reason for return" rules={[{ required: true, message: "Please choose a reason" }]}>
            <Select placeholder="Select a reason" options={REASON_OPTIONS} />
          </Form.Item>
          <Form.Item name="reasonText" label="Additional details (optional)">
            <Input.TextArea rows={3} placeholder="Tell us more about the issue" maxLength={500} />
          </Form.Item>
        </Form>

        <Divider className="my-2" />
        <div className="d-flex justify-content-between">
          <Text strong>Estimated refund</Text>
          <Text strong>₹{returnEstimate(detail).toLocaleString("en-IN")}</Text>
        </div>
      </Modal>
    </Card>
  );
};

export default MyOrders;
__RZP_EOF_7f3a__
echo "  ✓ src/pages/customer/account/MyOrders.tsx"
mkdir -p 'src/services'
cat > 'src/services/orderApi.ts' <<'__RZP_EOF_7f3a__'
import axiosInstance from "./axiosInstance";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PlaceOrderPayload {
  addressId:      string;
  deliveryMethod: "standard" | "express";
  paymentMethod:  "cod" | "card" | "upi" | "netbanking" | "wallet";
  couponCode?:    string;
}

export interface OrderItem {
  variant?: string; // variant id — needed to reference the line in a return request
  name: string;
  sku?: string;
  color?: string;
  size?: string;
  image?: string;
  unitPrice: number;
  mrp?: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderPayment {
  method: "razorpay" | "cod";
  status: "created" | "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  channel?: string;
  amountPaid: number;
  amountRefunded: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  shippingAddress: Record<string, string>;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  deliveryMethod: "standard" | "express";
  estimatedDelivery: string | null;
  payment: OrderPayment;
  createdAt: string;
  // Convenience alias used by the confirmation screen.
  totalAmount?: number;
}

export interface RazorpayHandshake {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface CreateOrderResult {
  order: Order;
  razorpay?: RazorpayHandshake; // present only for online payments
}

export interface OrderQuote {
  items: Array<{ name: string; image?: string; color?: string; size?: string; quantity: number; unitPrice: number; lineTotal: number }>;
  subtotal: number;
  discount: number;
  couponCode: string;
  shippingFee: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: string;
}

// Legacy shape still consumed by OrderConfirmation.tsx.
export interface OrderResult {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  estimatedDelivery: string | null;
}

const withTotalAmount = (order: Order): Order => ({ ...order, totalAmount: order.total });

// ─── API ────────────────────────────────────────────────────────────────────

// Authoritative price preview for the current cart.
export const getQuote = async (payload: { deliveryMethod: "standard" | "express"; couponCode?: string }): Promise<OrderQuote> => {
  const res = await axiosInstance.post("/orders/quote", payload);
  return res.data.data;
};

// Create an order. For online payments the result carries a `razorpay` handshake
// to open checkout; for COD the order is already confirmed.
export const createOrder = async (payload: PlaceOrderPayload): Promise<CreateOrderResult> => {
  const res = await axiosInstance.post("/orders", payload);
  const data = res.data.data;
  return { order: withTotalAmount(data.order), razorpay: data.razorpay };
};

// Verify the Razorpay handshake after a successful checkout.
export const verifyPayment = async (payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<Order> => {
  const res = await axiosInstance.post("/orders/verify", payload);
  return withTotalAmount(res.data.data.order);
};

export const getMyOrders = async (params?: { page?: number; limit?: number; status?: string }): Promise<{ orders: Order[]; total: number; page: number; pages: number }> => {
  const res = await axiosInstance.get("/orders", { params });
  return res.data.data;
};

export const getOrder = async (id: string): Promise<Order> => {
  const res = await axiosInstance.get(`/orders/${id}`);
  return withTotalAmount(res.data.data.order);
};

export const cancelOrder = async (id: string, reason?: string): Promise<Order> => {
  const res = await axiosInstance.post(`/orders/${id}/cancel`, { reason });
  return withTotalAmount(res.data.data.order);
};

// ─── Backwards-compatible helper (single-call place, no online handshake) ─────
// Kept so any older imports keep type-checking. New code should use createOrder.
export const placeOrder = async (payload: PlaceOrderPayload): Promise<Order> => {
  const { order } = await createOrder(payload);
  return order;
};
__RZP_EOF_7f3a__
echo "  ✓ src/services/orderApi.ts"
mkdir -p 'src/services'
cat > 'src/services/razorpay.ts' <<'__RZP_EOF_7f3a__'
// Loads Razorpay's hosted checkout script on demand and opens the payment modal.
// The script is injected once and cached; subsequent calls resolve immediately.

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export interface RazorpayCheckoutOptions {
  key: string;
  orderId: string;      // Razorpay order id (order_...)
  amount: number;       // in paise
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
}

// Opens the Razorpay checkout modal. Assumes loadRazorpayScript() already resolved true.
export const openRazorpayCheckout = (opts: RazorpayCheckoutOptions) => {
  const rzp = new window.Razorpay({
    key: opts.key,
    order_id: opts.orderId,
    amount: opts.amount,
    currency: opts.currency,
    name: opts.name,
    description: opts.description,
    prefill: opts.prefill,
    theme: { color: "#7c3aed" },
    handler: opts.onSuccess,
    modal: {
      ondismiss: () => opts.onDismiss?.(),
    },
  });
  rzp.open();
};
__RZP_EOF_7f3a__
echo "  ✓ src/services/razorpay.ts"
mkdir -p 'src/services'
cat > 'src/services/returnApi.ts' <<'__RZP_EOF_7f3a__'
import axiosInstance from "./axiosInstance";

export type ReturnReason =
  | "size_issue"
  | "defective"
  | "wrong_item"
  | "changed_mind"
  | "color_mismatch"
  | "not_as_described"
  | "other";

export interface ReturnRequestPayload {
  orderId: string;
  reason: ReturnReason;
  reasonText?: string;
  type?: "return" | "exchange";
  items?: Array<{ variant: string; quantity: number }>;
}

export interface ReturnRecord {
  _id: string;
  returnNumber: string;
  orderNumber: string;
  reason: string;
  reasonText?: string;
  type: "return" | "exchange";
  amount: number;
  status: "pending" | "approved" | "rejected" | "processing" | "refunded";
  createdAt: string;
}

export const REASON_OPTIONS: { value: ReturnReason; label: string }[] = [
  { value: "size_issue", label: "Size issue" },
  { value: "defective", label: "Defective / damaged" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "color_mismatch", label: "Colour mismatch" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "other", label: "Other" },
];

export const requestReturn = async (payload: ReturnRequestPayload): Promise<ReturnRecord> => {
  const res = await axiosInstance.post("/returns", payload);
  return res.data.data.return;
};

export const getMyReturns = async (): Promise<{ returns: ReturnRecord[]; total: number }> => {
  const res = await axiosInstance.get("/returns");
  return res.data.data;
};

export const getMyReturn = async (id: string): Promise<ReturnRecord> => {
  const res = await axiosInstance.get(`/returns/${id}`);
  return res.data.data.return;
};
__RZP_EOF_7f3a__
echo "  ✓ src/services/returnApi.ts"
mkdir -p 'src/types'
cat > 'src/types/cart.ts' <<'__RZP_EOF_7f3a__'
import type { ProductMedia, AppliedOffer } from "./product";

export interface CartVariant {
  _id: string;
  color: string;
  size: string | null;
  sku: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  effectivePrice: number;
  offerSaving: number;
  appliedOffer: AppliedOffer | null;
  stock: number;
  reserved: number;
  available: number;
  inStock: boolean;
  media: ProductMedia[];
}

export interface CartProduct {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  category: { _id: string; name: string; slug: string };
}

export interface CartItem {
  product: CartProduct;
  variant: CartVariant;
  quantity: number;
  addedAt: string;
  lineTotal: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  loading: boolean;
  mutating: boolean; // true while add/remove/update is in-flight
  error: string | null;
  // Applied coupon persisted from the cart page so checkout can reuse it.
  couponCode: string | null;
  discount: number;
}
__RZP_EOF_7f3a__
echo "  ✓ src/types/cart.ts"
echo
echo "Done — all files written."
