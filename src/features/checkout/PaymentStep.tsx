import React from "react";
import { Card, Typography, Radio, Space, Tag } from "antd";
import {
  LockOutlined, SafetyCertificateOutlined, DollarOutlined, GlobalOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  selected: string;                       // "cod" | "online"
  onChange: (method: string) => void;
}

// The storefront offers just two choices. "Pay Online Now" hands off to Razorpay's
// hosted checkout, where the customer picks UPI / Card / Net Banking / Wallet.
const PaymentStep: React.FC<Props> = ({ selected, onChange }) => (
  <Card className="payment-selection-card" bordered={false}>
    <div className="section-header mb-3">
      <Title level={4} className="d-flex align-items-center">
        <LockOutlined className="me-2 blue-icon" /> Payment Method
      </Title>
    </div>

    <div className="security-info-bar mb-4">
      <SafetyCertificateOutlined className="me-2" />
      <Text type="secondary">Your payment is secured with 256-bit SSL encryption</Text>
    </div>

    <Radio.Group className="w-100" value={selected} onChange={(e) => onChange(e.target.value)}>
      <Space direction="vertical" className="w-100" size={16}>

        {/* Pay Online (Razorpay) */}
        <div className={`payment-option-container ${selected === "online" ? "active" : ""}`}>
          <Radio value="online" className="p-4 w-100">
            <Space className="ms-2" align="start">
              <GlobalOutlined className="fs-5" />
              <div>
                <div className="d-flex align-items-center gap-2">
                  <Text strong>Pay Online Now</Text>
                  <Tag color="cyan">Instant</Tag>
                </div>
                <Text type="secondary" className="small d-block">
                  UPI · Cards · Net Banking · Wallets — securely via Razorpay
                </Text>
              </div>
            </Space>
          </Radio>
        </div>

        {/* Cash on Delivery */}
        <div className={`payment-option-container ${selected === "cod" ? "active" : ""}`}>
          <Radio value="cod" className="p-4 w-100">
            <Space className="ms-2" align="start">
              <DollarOutlined className="fs-5" />
              <div>
                <div className="d-flex align-items-center gap-2">
                  <Text strong>Cash on Delivery</Text>
                  <Tag color="green">Popular</Tag>
                </div>
                <Text type="secondary" className="small d-block">
                  Pay in cash when your order arrives
                </Text>
              </div>
            </Space>
          </Radio>
        </div>

      </Space>
    </Radio.Group>
  </Card>
);

export default PaymentStep;
