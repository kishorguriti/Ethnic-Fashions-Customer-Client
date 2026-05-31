import React, { useEffect, useState } from "react";
import {
  Card, Button, Typography, Tag, List, Space,
  Modal, Form, Input, message, Row, Col, Spin, Checkbox,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from "@ant-design/icons";
import {
  getAddresses, addAddressApi, updateAddressApi,
  deleteAddressApi, setDefaultAddressApi,
} from "../../../services/customerApi";
import type { Address, AddressPayload } from "../../../types/address";

const { Title, Text } = Typography;

const AddressBook: React.FC = () => {
  const [addresses, setAddresses]       = useState<Address[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    try {
      setLoading(true);
      setAddresses(await getAddresses());
    } catch {
      message.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr._id);
    form.setFieldsValue({ ...addr });
    setIsModalOpen(true);
  };

  const handleDelete = (addr: Address) => {
    Modal.confirm({
      title: "Delete this address?",
      content: addr.isDefault ? "This is your default address. Another address will be set as default." : undefined,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          setAddresses(await deleteAddressApi(addr._id));
          message.success("Address deleted");
        } catch (err: any) {
          message.error(err.response?.data?.message || "Failed to delete");
        }
      },
    });
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      setAddresses(await setDefaultAddressApi(addr._id));
      message.success("Default address updated");
    } catch {
      message.error("Failed to update default");
    }
  };

  const handleFinish = async (values: AddressPayload) => {
    setSaving(true);
    try {
      if (editingId) {
        setAddresses(await updateAddressApi(editingId, values));
        message.success("Address updated");
      } else {
        setAddresses(await addAddressApi(values));
        message.success("Address added");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card className="address-book-card" bordered={false}>
      <div className="address-header d-flex justify-content-between align-items-center mb-4">
        <Title level={3} className="section-title m-0">Address Book</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Add Address
        </Button>
      </div>

      {!addresses.length ? (
        <div className="text-center py-5 text-muted">
          <EnvironmentOutlined style={{ fontSize: 40, opacity: 0.3 }} />
          <p className="mt-3">No saved addresses yet</p>
          <Button type="primary" onClick={openAdd}>Add your first address</Button>
        </div>
      ) : (
        <List
          dataSource={addresses}
          renderItem={(addr) => (
            <List.Item className="address-item-wrapper mb-3 p-0 border-0">
              <div
                className="address-entry-card w-100 p-4"
                style={{
                  border: addr.isDefault ? "1.5px solid #8e2de2" : "1px solid #f0f0f0",
                  borderRadius: 10,
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="address-details">
                    <Text strong className="d-block mb-1 fs-6">{addr.fullName}</Text>
                    <Text type="secondary" className="d-block">{addr.addressLine1}</Text>
                    {addr.addressLine2 && (
                      <Text type="secondary" className="d-block">{addr.addressLine2}</Text>
                    )}
                    <Text type="secondary" className="d-block">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </Text>
                    <Text type="secondary" className="d-block">{addr.country}</Text>
                    <Text type="secondary" className="d-block mb-2">📞 {addr.phone}</Text>

                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      {addr.isDefault && <Tag color="purple">Default Address</Tag>}
                      {!addr.isDefault && (
                        <Button
                          type="link"
                          size="small"
                          className="p-0"
                          onClick={() => handleSetDefault(addr)}
                        >
                          Set as Default
                        </Button>
                      )}
                    </div>
                  </div>

                  <Space size="middle">
                    <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(addr)} />
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(addr)} />
                  </Space>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        title={editingId ? "Edit Address" : "Add New Address"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Save Address"
        confirmLoading={saving}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} className="pt-2">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="Priya Sharma" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[
                  { required: true, message: "Required" },
                  { pattern: /^[6-9]\d{9}$/, message: "Valid 10-digit number" },
                ]}
              >
                <Input placeholder="9876543210" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="addressLine1" label="Address Line 1" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="Flat / House No., Street, Area" />
          </Form.Item>
          <Form.Item name="addressLine2" label="Address Line 2 (optional)">
            <Input placeholder="Landmark, Colony (optional)" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="city" label="City" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="Hyderabad" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" label="State" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="Telangana" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="pincode"
                label="Pincode"
                rules={[
                  { required: true, message: "Required" },
                  { pattern: /^\d{6}$/, message: "6 digits" },
                ]}
              >
                <Input placeholder="500001" maxLength={6} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="country" label="Country" initialValue="India">
            <Input placeholder="India" />
          </Form.Item>

          {/* Only show "set as default" checkbox when adding a new address or editing a non-default one */}
          {(!editingId || !addresses.find((a) => a._id === editingId)?.isDefault) && (
            <Form.Item name="isDefault" valuePropName="checked">
              <Checkbox>Set as default address</Checkbox>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default AddressBook;
