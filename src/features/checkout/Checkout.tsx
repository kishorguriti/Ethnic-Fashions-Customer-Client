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
