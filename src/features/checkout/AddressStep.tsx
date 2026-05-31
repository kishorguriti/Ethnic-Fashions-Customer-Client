import React, { useState } from "react";
import {
  Card, Radio, Badge, Button, Typography,
  Form, Input, Row, Col, Drawer, Switch, message,
} from "antd";
import {
  TruckOutlined, PlusOutlined, CheckCircleFilled, PhoneOutlined,
} from "@ant-design/icons";
import type { Address, AddressPayload } from "../../types/address";

const { Title, Text } = Typography;

interface Props {
  addresses:  Address[];
  selectedId: string;
  onSelect:   (id: string) => void;
  onAdd:      (payload: AddressPayload) => Promise<void>;
}

const AddressStep: React.FC<Props> = ({ addresses, selectedId, onSelect, onAdd }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      await onAdd({ ...values, isDefault: values.isDefault ?? false });
      message.success("Address added!");
      form.resetFields();
      setDrawerOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card className="selection-main-card" bordered={false}>
        <div className="section-title-row mb-4">
          <TruckOutlined className="blue-icon" />
          <Title level={4} className="m-0 ms-2">Shipping Address</Title>
        </div>

        {addresses.length === 0 ? (
          <Text type="secondary">No saved addresses. Add one below.</Text>
        ) : (
          <div className="address-list">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`address-option-card ${selectedId === addr._id ? "active" : ""}`}
                onClick={() => onSelect(addr._id)}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-start">
                    <Radio checked={selectedId === addr._id} className="mt-1" />
                    <div className="ms-3">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <Text strong className="name-label">{addr.fullName}</Text>
                        {addr.isDefault && (
                          <Badge count="Default" className="default-badge" />
                        )}
                      </div>
                      <div className="addr-details mt-1">
                        <Text type="secondary" className="d-block">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                        </Text>
                        <Text type="secondary" className="d-block">
                          {addr.city}, {addr.state} — {addr.pincode}
                        </Text>
                        <Text type="secondary" className="d-block mt-1">
                          <PhoneOutlined className="me-1" />{addr.phone}
                        </Text>
                      </div>
                    </div>
                  </div>
                  {selectedId === addr._id && (
                    <CheckCircleFilled className="active-check-icon" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          className="add-new-btn mt-3"
          onClick={() => setDrawerOpen(true)}
        >
          Add New Address
        </Button>
      </Card>

      {/* ── Add address drawer ── */}
      <Drawer
        title="Add New Address"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        zIndex={1300}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="fullName" label="Full Name"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="Recipient name" size="large" />
          </Form.Item>

          <Form.Item
            name="phone" label="Phone"
            rules={[
              { required: true, message: "Required" },
              { pattern: /^[6-9]\d{9}$/, message: "10-digit mobile number" },
            ]}
          >
            <Input placeholder="9876543210" size="large" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="addressLine1" label="Address Line 1"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="House no., Street name" size="large" />
          </Form.Item>

          <Form.Item name="addressLine2" label="Address Line 2 (optional)">
            <Input placeholder="Landmark, area" size="large" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="city" label="City"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input placeholder="City" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="state" label="State"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input placeholder="State" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="pincode" label="Pincode"
                rules={[
                  { required: true, message: "Required" },
                  { pattern: /^\d{6}$/, message: "6-digit pincode" },
                ]}
              >
                <Input placeholder="400001" size="large" maxLength={6} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label="Country" initialValue="India">
                <Input size="large" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isDefault" label="Set as default address" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={saving}
            className="btnPrimary"
          >
            Save Address
          </Button>
        </Form>
      </Drawer>
    </>
  );
};

export default AddressStep;
