import React from "react";
import { Card, Typography, Button, Divider } from "antd";
import {
  CheckCircleFilled, InboxOutlined, ShoppingOutlined, CarOutlined,
  FileDoneOutlined, HomeOutlined, MailOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import type { OrderResult } from "../../services/orderApi";

const { Title, Text } = Typography;

// The raw status is an API value ("confirmed"); printing it unmapped showed
// lowercase machine text on the customer's receipt screen.
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

const OrderConfirmation: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const order     = (location.state as any)?.order as OrderResult | undefined;

  const orderNumber       = order?.orderNumber ?? "—";
  const rawStatus         = order?.status ?? "confirmed";
  const status            = STATUS_LABELS[rawStatus] ?? rawStatus;
  const totalAmount       = order?.totalAmount;
  const estimatedDelivery = order?.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "5–7 business days";

  return (
    <div className="order-confirmation-wrapper">
      <div className="container py-5">
        <div className="confirmation-inner mx-auto text-center">
          {/* Success icon */}
          <div className="success-icon-container mb-4">
            <div className="outer-circle">
              <div className="inner-circle">
                <CheckCircleFilled className="check-icon" />
              </div>
            </div>
          </div>

          <Title level={1} className="serif-title mb-2">Order Confirmed!</Title>
          <Text type="secondary" className="sub-message d-block mb-5">
            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
          </Text>

          {/* Order summary */}
          <Card className="order-info-card mx-auto mb-4" variant="borderless">
            <div className="order-number-row d-flex align-items-center mb-4">
              <div className="package-icon-box">
                <InboxOutlined />
              </div>
              <div className="ms-3 text-start">
                <Text type="secondary" className="small d-block">Order Number</Text>
                <Text strong className="fs-5 order-number-value">{orderNumber}</Text>
              </div>
            </div>

            <Divider className="my-3" />

            <div className="detail-row d-flex justify-content-between align-items-center mb-3">
              <Text type="secondary">Order Status</Text>
              <span className="confirm-status-pill">
                <CheckCircleFilled />
                <span>{status}</span>
              </span>
            </div>

            <div className="detail-row d-flex justify-content-between align-items-center mb-3">
              <Text type="secondary">Estimated Delivery</Text>
              <Text strong>{estimatedDelivery}</Text>
            </div>

            {totalAmount != null && (
              <div className="detail-row total-row d-flex justify-content-between align-items-center">
                <Text type="secondary">Amount Paid</Text>
                <Text strong className="amount-paid">₹{totalAmount.toLocaleString("en-IN")}</Text>
              </div>
            )}
          </Card>

          {/* What happens next — sets expectations instead of leaving a dead end */}
          <Card className="next-steps-card mx-auto mb-5" variant="borderless">
            <Text strong className="d-block text-start mb-3">What happens next</Text>
            <div className="next-steps d-flex justify-content-between">
              <div className="next-step">
                <span className="next-step-icon is-done"><FileDoneOutlined /></span>
                <span className="next-step-label">Order placed</span>
              </div>
              <div className="next-step">
                <span className="next-step-icon"><InboxOutlined /></span>
                <span className="next-step-label">Packed</span>
              </div>
              <div className="next-step">
                <span className="next-step-icon"><CarOutlined /></span>
                <span className="next-step-label">Shipped</span>
              </div>
              <div className="next-step">
                <span className="next-step-icon"><HomeOutlined /></span>
                <span className="next-step-label">Delivered</span>
              </div>
            </div>
          </Card>

          {/* Action buttons */}
          <div className="action-buttons-row d-flex justify-content-center gap-3 mb-4 flex-wrap">
            <Button
              type="primary"
              className="track-btn"
              icon={<ShoppingOutlined />}
              onClick={() => navigate("/my-account/orders")}
            >
              Track Order
            </Button>
            <Button className="continue-btn" onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
          </div>

          <Text type="secondary" className="email-footer small">
            <MailOutlined /> A confirmation email has been sent to your registered email address.
          </Text>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
