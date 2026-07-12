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
