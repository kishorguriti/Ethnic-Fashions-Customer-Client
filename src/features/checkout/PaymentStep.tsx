import React from "react";
import { Card, Typography, Radio, Space, Tag, Input, Form } from "antd";
import {
  LockOutlined, CreditCardOutlined, MobileOutlined,
  BankOutlined, WalletOutlined, SafetyCertificateOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  selected: string;
  onChange: (method: string) => void;
}

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

        {/* Cash on Delivery */}
        <div className={`payment-option-container ${selected === "cod" ? "active" : ""}`}>
          <Radio value="cod" className="p-4 w-100">
            <Space className="ms-2">
              <DollarOutlined className="fs-5" />
              <Text strong>Cash on Delivery</Text>
              <Tag color="green">Popular</Tag>
            </Space>
          </Radio>
        </div>

        {/* UPI */}
        <div className={`payment-option-container ${selected === "upi" ? "active" : ""}`}>
          <Radio value="upi" className="p-4 w-100">
            <Space className="ms-2">
              <MobileOutlined className="fs-5" />
              <Text strong>UPI</Text>
              <Tag color="cyan">Instant</Tag>
            </Space>
          </Radio>
          {selected === "upi" && (
            <div className="card-form-expand px-4 pb-4">
              <Form layout="vertical">
                <Form.Item label="UPI ID">
                  <Input placeholder="yourname@upi" size="large" />
                </Form.Item>
              </Form>
            </div>
          )}
        </div>

        {/* Credit / Debit Card */}
        <div className={`payment-option-container ${selected === "card" ? "active" : ""}`}>
          <Radio value="card" className="p-4 w-100">
            <Space className="ms-2">
              <CreditCardOutlined className="fs-5" />
              <Text strong>Credit / Debit Card</Text>
            </Space>
          </Radio>
          {selected === "card" && (
            <div className="card-form-expand px-4 pb-4">
              <Form layout="vertical">
                <Form.Item label="Card Number">
                  <Input placeholder="1234 5678 9012 3456" size="large" maxLength={19} />
                </Form.Item>
                <Row gutter={16} component="div" style={{ display: "flex", gap: 0 }}>
                  <div style={{ flex: 1, paddingRight: 8 }}>
                    <Form.Item label="Expiry Date">
                      <Input placeholder="MM/YY" size="large" maxLength={5} />
                    </Form.Item>
                  </div>
                  <div style={{ flex: 1, paddingLeft: 8 }}>
                    <Form.Item label="CVV">
                      <Input.Password placeholder="123" size="large" maxLength={4} />
                    </Form.Item>
                  </div>
                </Row>
                <Form.Item label="Cardholder Name">
                  <Input placeholder="As on card" size="large" />
                </Form.Item>
                <Text type="secondary" className="small">We accept: Visa · Mastercard · RuPay · Amex</Text>
              </Form>
            </div>
          )}
        </div>

        {/* Net Banking */}
        <div className={`payment-option-container ${selected === "netbanking" ? "active" : ""}`}>
          <Radio value="netbanking" className="p-4 w-100">
            <Space className="ms-2">
              <BankOutlined className="fs-5" />
              <Text strong>Net Banking</Text>
            </Space>
          </Radio>
        </div>

        {/* Wallet */}
        <div className={`payment-option-container ${selected === "wallet" ? "active" : ""}`}>
          <Radio value="wallet" className="p-4 w-100">
            <Space className="ms-2">
              <WalletOutlined className="fs-5" />
              <Text strong>Digital Wallet</Text>
            </Space>
          </Radio>
        </div>

      </Space>
    </Radio.Group>
  </Card>
);

// Needed for the inline row inside card form
const Row = ({ children, component: Comp = "div", style, gutter }: any) => (
  <Comp style={{ display: "flex", ...style }}>{children}</Comp>
);

export default PaymentStep;
