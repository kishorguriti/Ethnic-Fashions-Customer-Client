import React from "react";
import { Card, Typography, Button, Space, Result } from "antd";
// import { CheckCircleFilled, PackageOutlined } from '@ant-design/icons';
import { CheckCircleFilled, InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();

  const orderDetails = {
    orderNumber: "ORD-2024-9731",
    deliveryDate: "April 15, 2026",
    status: "Processing",
  };
  const handleNavigation = () => {
    navigate("/products");
  };
  return (
    <div className="order-confirmation-wrapper">
      <div className="container text-center py-5">
        {/* Success Icon */}
        <div className="success-icon-container mb-4">
          <div className="outer-circle">
            <div className="inner-circle">
              <CheckCircleFilled className="check-icon" />
            </div>
          </div>
        </div>

        <Title level={1} className="serif-title mb-3">
          Order Confirmed!
        </Title>
        <Text type="secondary" className="sub-message d-block mb-5">
          Thank you for your purchase. Your order has been confirmed and will be
          shipped soon.
        </Text>

        {/* Order Details Card */}
        <Card className="order-info-card mx-auto mb-5" bordered={false}>
          <div className="d-flex align-items-center mb-4">
            <div className="package-icon-box">
              <InboxOutlined />
            </div>
            <div className="ms-3 text-start">
              <Text type="secondary" className="small d-block">
                Order Number
              </Text>
              <Text strong className="fs-5">
                {orderDetails.orderNumber}
              </Text>
            </div>
          </div>

          <div className="detail-row d-flex justify-content-between mb-2">
            <Text type="secondary">Estimated Delivery</Text>
            <Text strong>{orderDetails.deliveryDate}</Text>
          </div>
          <div className="detail-row d-flex justify-content-between">
            <Text type="secondary">Order Status</Text>
            <Text type="success" strong>
              {orderDetails.status}
            </Text>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="action-buttons-row d-flex justify-content-center gap-3 mb-5">
          <Button type="primary" className="track-btn">
            Track Order
          </Button>
          <Button className="continue-btn" onClick={() => handleNavigation()}>
            Continue Shopping
          </Button>
        </div>

        <Text type="secondary" className="email-footer small">
          A confirmation email has been sent to your email address.
        </Text>
      </div>
    </div>
  );
};

export default OrderConfirmation;
