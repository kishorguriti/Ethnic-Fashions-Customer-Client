import React, { useState } from 'react';
import { Card, Typography, Radio, Input, Row, Col, Space, Tag, Form } from 'antd';
import { 
  LockOutlined, CreditCardOutlined, MobileOutlined, 
  BankOutlined, WalletOutlined, SafetyCertificateOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentStep: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');

  return (
    <Card className="payment-selection-card" bordered={false}>
      <div className="section-header mb-3">
        <Title level={4} className="serif-title d-flex align-items-center">
          <LockOutlined className="me-2 blue-icon" /> Payment Method
        </Title>
      </div>

      <div className="security-info-bar mb-4">
        <SafetyCertificateOutlined className="me-2" />
        <Text type="secondary">Your payment is secured with 256-bit SSL encryption</Text>
      </div>

      <Radio.Group 
        className="w-100" 
        value={paymentMethod} 
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <Space direction="vertical" className="w-100" size={16}>
          
          {/* Credit / Debit Card Section */}
          <div className={`payment-option-container ${paymentMethod === 'card' ? 'active' : ''}`}>
            <Radio value="card" className="p-4 w-100">
              <Space className="ms-2">
                <CreditCardOutlined className="fs-5" />
                <Text strong>Credit / Debit Card</Text>
              </Space>
            </Radio>

            {paymentMethod === 'card' && (
              <div className="card-form-expand px-4 pb-4">
                <Form layout="vertical">
                  <Form.Item label="Card Number">
                    <Input placeholder="1234 5678 9012 3456" className="pill-input" />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Expiry Date">
                        <Input placeholder="MM/YY" className="pill-input" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="CVV">
                        <Input.Password placeholder="123" className="pill-input" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Cardholder Name">
                    <Input placeholder="John Doe" className="pill-input" />
                  </Form.Item>
                  <div className="accepted-cards mt-2">
                    <Text type="secondary" className="small me-3">We accept:</Text>
                    <Text type="secondary" className="small me-2">Visa</Text>
                    <Text type="secondary" className="small me-2">Mastercard</Text>
                    <Text type="secondary" className="small">Amex</Text>
                  </div>
                </Form>
              </div>
            )}
          </div>

          {/* UPI Section */}
          <div className={`payment-option-container ${paymentMethod === 'upi' ? 'active' : ''}`}>
            <Radio value="upi" className="p-4 w-100">
              <Space className="ms-2">
                <MobileOutlined className="fs-5" />
                <Text strong>UPI</Text>
                <Tag color="cyan" className="instant-tag">Instant</Tag>
              </Space>
            </Radio>
          </div>

          {/* Net Banking Section */}
          <div className={`payment-option-container ${paymentMethod === 'netbanking' ? 'active' : ''}`}>
            <Radio value="netbanking" className="p-4 w-100">
              <Space className="ms-2">
                <BankOutlined className="fs-5" />
                <Text strong>Net Banking</Text>
              </Space>
            </Radio>
          </div>

          {/* Wallet Section */}
          <div className={`payment-option-container ${paymentMethod === 'wallet' ? 'active' : ''}`}>
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
};

export default PaymentStep;
