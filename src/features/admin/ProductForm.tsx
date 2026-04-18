import { Form, Input, Button } from "antd";

export default function ProductForm({ onSubmit, initialValues }: any) {
  return (
    <Form layout="vertical" onFinish={onSubmit} initialValues={initialValues}>
      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="price" label="Price">
        <Input />
      </Form.Item>

      <Form.Item name="image" label="Image URL">
        <Input />
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
}