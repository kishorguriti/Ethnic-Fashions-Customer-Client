import React from "react";
import { Card, Typography, Button, Tag } from "antd";
import { CheckCircleFilled, InboxOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import type { OrderResult } from "../../services/orderApi";

const { Title, Text } = Typography;

const OrderConfirmation: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const order     = (location.state as any)?.order as OrderResult | undefined;

  const orderNumber      = order?.orderNumber ?? "—";
  const status           = order?.status      ?? "Processing";
  const totalAmount      = order?.totalAmount;
  const estimatedDelivery = order?.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "5–7 business days";

  return (
    <div className="order-confirmation-wrapper">
      <div className="container text-center py-5">
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

        {/* Order details card */}
        <Card className="order-info-card mx-auto mb-5" bordered={false}>
          <div className="d-flex align-items-center mb-4">
            <div className="package-icon-box">
              <InboxOutlined />
            </div>
            <div className="ms-3 text-start">
              <Text type="secondary" className="small d-block">Order Number</Text>
              <Text strong className="fs-5">{orderNumber}</Text>
            </div>
          </div>

          <div className="detail-row d-flex justify-content-between mb-2">
            <Text type="secondary">Estimated Delivery</Text>
            <Text strong>{estimatedDelivery}</Text>
          </div>

          <div className="detail-row d-flex justify-content-between mb-2">
            <Text type="secondary">Order Status</Text>
            <Tag color="processing">{status}</Tag>
          </div>

          {totalAmount != null && (
            <div className="detail-row d-flex justify-content-between">
              <Text type="secondary">Amount Paid</Text>
              <Text strong>₹{totalAmount.toLocaleString()}</Text>
            </div>
          )}
        </Card>

        {/* Action buttons */}
        <div className="action-buttons-row d-flex justify-content-center gap-3 mb-5">
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
          A confirmation email has been sent to your registered email address.
        </Text>
      </div>
    </div>
  );
};

export default OrderConfirmation;
