import React from 'react';
import { Input, Button, Form } from 'antd';
import { StarFilled } from '@ant-design/icons';

const Newsletter: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: { email: string }) => {
    console.log('Subscription Email:', values.email);
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        {/* Badge */}
        <div className="badge-stay-updated">
          <StarFilled style={{ fontSize: '12px' }} />
          <span>Stay Updated</span>
        </div>

        {/* Heading */}
        <h2>Join Our Newsletter</h2>
        
        {/* Description */}
        <p className="sub-text">
          Get exclusive offers, styling tips, and be the first to know about new arrivals
        </p>

        {/* Subscription Form */}
        <Form 
          form={form} 
          onFinish={onFinish} 
          className="input-group-container"
        >
          <Form.Item 
            name="email" 
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Input 
              placeholder="Enter your email" 
              size="large" 
            />
          </Form.Item>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            className="btn-subscribe"
          >
            Subscribe
          </Button>
        </Form>
      </div>
    </section>
  );
};

export default Newsletter;
