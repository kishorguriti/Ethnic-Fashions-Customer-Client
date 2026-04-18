import React from "react";
import { Card, Typography, Row, Col, Tag, Space, Button } from "antd";
import { CheckOutlined, MobileOutlined } from "@ant-design/icons";
import Image from "../../assets/png/EthnicHomePage_1.svg";

const { Title, Text } = Typography;

const ReviewStep: React.FC = () => {
  return (
    <div className="review-step-container">
      {/* --- Review Order Card --- */}
      <Card className="review-card mb-4" bordered={false}>
        <div className="section-header d-flex align-items-center mb-4">
          <CheckOutlined className="check-icon me-2" />
          <Title level={4} className="serif-title m-0">
            Review Your Order
          </Title>
        </div>

        <div className="product-review-item d-flex align-items-start">
          <div className="product-image-wrapper">
            <img src={Image} alt="Royal Banarasi Silk Saree" />
          </div>

          <div className="product-info-wrapper flex-grow-1 ms-4">
            <div className="d-flex justify-content-between align-items-start">
              <Title level={5} className="product-name">
                Royal Banarasi Silk Saree
              </Title>
              <Title level={4} className="product-price m-0">
                $8999.00
              </Title>
            </div>

            <Space size="middle" className="mt-2">
              <Tag className="pill-outline-tag">Size: </Tag>
              <Tag className="pill-outline-tag">Color: </Tag>
              <Tag className="pill-outline-tag">Qty: 1</Tag>
            </Space>
          </div>
        </div>
      </Card>

      {/* --- Delivery Information Card --- */}
      <Card className="review-card" bordered={false}>
        <Title level={4} className="serif-title mb-4">
          Delivery Information
        </Title>

        <div className="address-display-box px-2">
          <Text strong className="d-block mb-2 fs-6">
            John Doe
          </Text>
          <div className="address-text">
            <Text type="secondary" className="d-block">
              123 Fashion Street
            </Text>
            <Text type="secondary" className="d-block">
              New York, NY 10001
            </Text>
            <Text type="secondary" className="d-block mt-2">
              <MobileOutlined className="me-2" />
              +1 234 567 8900
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReviewStep;
