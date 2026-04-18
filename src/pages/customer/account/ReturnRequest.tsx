import React from "react";
import {
  Card,
  Typography,
  Form,
  Input,
  Radio,
  Button,
  message,
  Space,
} from "antd";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ReturnRequest: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Return Request Data:", values);
    message.success("Your return request has been submitted successfully!");
    form.resetFields();
  };

  return (
    <Card className="return-request-card" bordered={false}>
      <Title level={3} className="section-title mb-4">
        Request Return or Refund
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        {/* Order ID */}
        <Form.Item
          name="orderId"
          label={<Text strong>Order ID</Text>}
          rules={[{ required: true, message: "Please enter your Order ID" }]}
        >
          <Input placeholder="e.g., ORD-2024-001" className="custom-input" />
        </Form.Item>

        {/* Reason for Return */}
        <Form.Item
          name="reason"
          label={<Text strong>Reason for Return</Text>}
          rules={[{ required: true, message: "Please select a reason" }]}
        >
          <Radio.Group className="custom-radio-group">
            <Space direction="vertical">
              <Radio value="wrong-size">Wrong Size</Radio>
              <Radio value="defective">Defective Product</Radio>
              <Radio value="not-described">Not as Described</Radio>
              <Radio value="changed-mind">Changed Mind</Radio>
              <Radio value="other">Other</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {/* Additional Comments */}
        <Form.Item
          name="comments"
          label={<Text strong>Additional Comments</Text>}
        >
          <TextArea
            placeholder="Please provide any additional details..."
            rows={4}
            className="custom-textarea"
          />
        </Form.Item>

        {/* Return Policy Box */}
        <div className="policy-info-box mb-4">
          <Text strong className="d-block mb-2">
            Return Policy
          </Text>
          <ul>
            <li>Items must be returned within 30 days of delivery</li>
            <li>Products must be unused and in original packaging</li>
            <li>Refunds will be processed within 5-7 business days</li>
            <li>Original shipping costs are non-refundable</li>
          </ul>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="submit-return-btn"
          >
            Submit Return Request
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ReturnRequest;
