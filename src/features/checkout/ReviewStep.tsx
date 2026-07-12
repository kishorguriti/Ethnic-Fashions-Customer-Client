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
  online:     "Pay Online (Razorpay)",
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
