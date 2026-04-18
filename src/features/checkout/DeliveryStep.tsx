import React, { useState } from "react";
import {
  Card,
  Typography,
  Radio,
  Tag,

} from "antd";
import {
  TruckOutlined,
  WalletOutlined,
  RocketOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const DeliveryStep: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState("standard");

  const methods = [
    {
      id: "standard",
      title: "Standard Shipping",
      time: "5-7 business days",
      price: 0,
      tag: "FREE",
      icon: <TruckOutlined />,
    },
    {
      id: "express",
      title: "Express Shipping",
      time: "2-3 business days",
      price: 20.0,
      tag: "Fast",
      icon: <RocketOutlined />,
    },
  ];

  const subtotal = 8999.0;
  const tax = 719.92;
  const shippingCost = selectedMethod === "express" ? 20.0 : 0;
  const total = subtotal + tax + shippingCost;

  return (
    <div className="delivery-step-wrapper">
      <Card className="delivery-selection-card" bordered={false}>
        <div className="d-flex align-items-center mb-4">
          <WalletOutlined className="blue-icon me-2" />
          <Title level={4} className="m-0">
            Delivery Options
          </Title>
        </div>

        <Radio.Group
          className="w-100"
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
        >
          {methods.map((method) => (
            <div
              key={method.id}
              className={`delivery-option ${selectedMethod === method.id ? "active" : ""}`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="d-flex align-items-center">
                  <Radio value={method.id} />
                  <div className="icon-box ms-3">{method.icon}</div>
                  <div className="ms-3">
                    <div className="d-flex align-items-center gap-2">
                      <Text strong className="method-title">
                        {method.title}
                      </Text>
                      <Tag
                        color={method.id === "standard" ? "success" : "blue"}
                        className="status-tag"
                      >
                        {method.tag}
                      </Tag>
                    </div>
                    <Text type="secondary" className="small d-block">
                      {method.time}
                    </Text>
                  </div>
                </div>
                <Text strong className="price-text">
                  {method.price === 0 ? "FREE" : `$${method.price.toFixed(2)}`}
                </Text>
              </div>
            </div>
          ))}
        </Radio.Group>
      </Card>
    </div>
  );
};

export default DeliveryStep;
