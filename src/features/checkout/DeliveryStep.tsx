import React from "react";
import { Card, Typography, Radio, Tag } from "antd";
import { TruckOutlined, RocketOutlined, WalletOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  selected: string;
  onChange: (method: string, cost: number) => void;
}

const METHODS = [
  {
    id:    "standard",
    title: "Standard Shipping",
    time:  "5–7 business days",
    cost:  0,
    tag:   "FREE",
    tagColor: "success" as const,
    icon:  <TruckOutlined />,
  },
  {
    id:    "express",
    title: "Express Shipping",
    time:  "2–3 business days",
    cost:  199,
    tag:   "Fast",
    tagColor: "blue" as const,
    icon:  <RocketOutlined />,
  },
];

const DeliveryStep: React.FC<Props> = ({ selected, onChange }) => (
  <div className="delivery-step-wrapper">
    <Card className="delivery-selection-card" bordered={false}>
      <div className="d-flex align-items-center mb-4">
        <WalletOutlined className="blue-icon me-2" />
        <Title level={4} className="m-0">Delivery Options</Title>
      </div>

      <Radio.Group className="w-100" value={selected}>
        {METHODS.map((m) => (
          <div
            key={m.id}
            className={`delivery-option ${selected === m.id ? "active" : ""}`}
            onClick={() => onChange(m.id, m.cost)}
          >
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="d-flex align-items-center">
                <Radio value={m.id} />
                <div className="icon-box ms-3">{m.icon}</div>
                <div className="ms-3">
                  <div className="d-flex align-items-center gap-2">
                    <Text strong className="method-title">{m.title}</Text>
                    <Tag color={m.tagColor} className="status-tag">{m.tag}</Tag>
                  </div>
                  <Text type="secondary" className="small d-block">{m.time}</Text>
                </div>
              </div>
              <Text strong className="price-text">
                {m.cost === 0 ? "FREE" : `₹${m.cost}`}
              </Text>
            </div>
          </div>
        ))}
      </Radio.Group>
    </Card>
  </div>
);

export default DeliveryStep;
