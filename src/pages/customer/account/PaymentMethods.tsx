import React, { useState } from 'react';
import { Card, Typography, Button, List, Space, Tag, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, CreditCardOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const PaymentMethods: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: '2', type: 'Mastercard', last4: '5555', expiry: '08/26', isDefault: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleDelete = (id: string) => {
    setMethods(prev => prev.filter(m => m.id !== id));
    message.success('Payment method removed');
  };

  const handleAdd = (values: any) => {
    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: 'Visa', // Simplified for demo
      last4: values.cardNumber.slice(-4),
      expiry: values.expiry,
      isDefault: false,
    };
    setMethods([...methods, newCard]);
    setIsModalOpen(false);
    form.resetFields();
    message.success('Card added successfully');
  };

  return (
    <Card className="payment-methods-card" bordered={false}>
      <div className="header-row d-flex justify-content-between align-items-center mb-4">
        <Title level={3} className="section-title m-0">Saved Payment Methods</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="pill-btn add-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Add Payment Method
        </Button>
      </div>

      <List
        dataSource={methods}
        renderItem={(item) => (
          <Card className="payment-item-card mb-3" hoverable={false}>
            <div className="d-flex justify-content-between align-items-center">
              <Space size="large">
                <div className="card-icon-box">
                  <CreditCardOutlined />
                </div>
                <div className="card-info">
                  <Text strong className="d-block">{item.type} •••• {item.last4}</Text>
                  <Text type="secondary" className="d-block">Expires {item.expiry}</Text>
                  {item.isDefault && <Tag className="default-badge mt-1">Default</Tag>}
                </div>
              </Space>
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                className="delete-btn"
                onClick={() => handleDelete(item.id)}
              />
            </div>
          </Card>
        )}
      />

      <Modal
        title="Add New Card"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Save Card"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleAdd} className="mt-3">
          <Form.Item name="cardNumber" label="Card Number" rules={[{ required: true }]}>
            <Input placeholder="0000 0000 0000 0000" maxLength={16} />
          </Form.Item>
          <div className="d-flex gap-3">
            <Form.Item name="expiry" label="Expiry (MM/YY)" className="flex-grow-1" rules={[{ required: true }]}>
              <Input placeholder="MM/YY" />
            </Form.Item>
            <Form.Item name="cvv" label="CVV" className="flex-grow-1" rules={[{ required: true }]}>
              <Input.Password placeholder="123" maxLength={3} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </Card>
  );
};

export default PaymentMethods;
