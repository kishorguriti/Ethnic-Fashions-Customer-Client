// import React from 'react';
// import { Card, Button, Typography, Tag, List, Space } from 'antd';
// import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

// const { Title, Text } = Typography;

// interface Address {
//   id: string;
//   name: string;
//   street: string;
//   cityStateZip: string;
//   country: string;
//   phone: string;
//   isDefault?: boolean;
// }

// const addresses: Address[] = [
//   {
//     id: '1',
//     name: 'John Doe',
//     street: '123 Fashion Street',
//     cityStateZip: 'New York, NY 10001',
//     country: 'USA',
//     phone: '+1 234 567 8900',
//     isDefault: true,
//   },
//   {
//     id: '2',
//     name: 'John Doe',
//     street: '456 Style Avenue',
//     cityStateZip: 'Los Angeles, CA 90001',
//     country: 'USA',
//     phone: '+1 234 567 8901',
//   },
// ];

// const AddressBook: React.FC = () => {
//   return (
//     <Card className="address-book-card" bordered={false}>
//       <div className="address-header d-flex justify-content-between align-items-center mb-4">
//         <Title level={3} className="section-title m-0">Address Book</Title>
//         <Button type="primary" icon={<PlusOutlined />} className="add-address-btn">
//           Add Address
//         </Button>
//       </div>

//       <List
//         dataSource={addresses}
//         renderItem={(item) => (
//           <List.Item className="address-item-wrapper mb-3 p-0 border-0">
//             <div className="address-entry-card w-100 p-4">
//               <div className="d-flex justify-content-between align-items-start">
//                 <div className="address-details">
//                   <Text strong className="d-block mb-1 fs-6">{item.name}</Text>
//                   <Text type="secondary" className="d-block">{item.street}</Text>
//                   <Text type="secondary" className="d-block">{item.cityStateZip}</Text>
//                   <Text type="secondary" className="d-block">{item.country}</Text>
//                   <Text type="secondary" className="d-block mb-2">{item.phone}</Text>

//                   {item.isDefault && (
//                     <Tag className="default-tag">Default Address</Tag>
//                   )}
//                 </div>

//                 <Space size="middle" className="action-icons">
//                   <Button type="text" icon={<EditOutlined />} className="icon-btn" />
//                   <Button type="text" icon={<DeleteOutlined />} className="icon-btn" />
//                 </Space>
//               </div>
//             </div>
//           </List.Item>
//         )}
//       />
//     </Card>
//   );
// };

// export default AddressBook;

import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Tag,
  List,
  Space,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Address {
  id: string;
  name: string;
  street: string;
  cityStateZip: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

const AddressBook: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "John Doe",
      street: "123 Fashion Street",
      cityStateZip: "New York, NY 10001",
      country: "USA",
      phone: "+1 234 567 8900",
      isDefault: true,
    },
    {
      id: "2",
      name: "John Doe",
      street: "456 Style Avenue",
      cityStateZip: "Los Angeles, CA 90001",
      country: "USA",
      phone: "+1 234 567 8901",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form] = Form.useForm();

  // --- Functions ---
  const showModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      form.setFieldsValue(address);
    } else {
      setEditingAddress(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this address?",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: () => {
        setAddresses((prev) => prev.filter((item) => item.id !== id));
        message.success("Address deleted");
      },
    });
  };

  const handleFinish = (values: any) => {
    if (editingAddress) {
      // Edit logic
      setAddresses((prev) =>
        prev.map((item) =>
          item.id === editingAddress.id ? { ...item, ...values } : item,
        ),
      );
      message.success("Address updated");
    } else {
      // Add logic
      const newAddress = {
        ...values,
        id: Date.now().toString(),
        isDefault: false,
      };
      setAddresses((prev) => [...prev, newAddress]);
      message.success("New address added");
    }
    setIsModalOpen(false);
  };

  return (
    <Card className="address-book-card" bordered={false}>
      <div className="address-header d-flex justify-content-between align-items-center mb-4">
        <Title level={3} className="section-title m-0">
          Address Book
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="add-address-btn"
          onClick={() => showModal()}
        >
          Add Address
        </Button>
      </div>

      <List
        dataSource={addresses}
        renderItem={(item) => (
          <List.Item className="address-item-wrapper mb-3 p-0 border-0">
            <div className="address-entry-card w-100 p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="address-details">
                  <Text strong className="d-block mb-1 fs-6">
                    {item.name}
                  </Text>
                  <Text type="secondary" className="d-block">
                    {item.street}
                  </Text>
                  <Text type="secondary" className="d-block">
                    {item.cityStateZip}
                  </Text>
                  <Text type="secondary" className="d-block">
                    {item.country}
                  </Text>
                  <Text type="secondary" className="d-block mb-2">
                    {item.phone}
                  </Text>
                  {item.isDefault && (
                    <Tag className="default-tag">Default Address</Tag>
                  )}
                </div>
                <Space size="middle">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showModal(item)}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(item.id)}
                  />
                </Space>
              </div>
            </div>
          </List.Item>
        )}
      />

      {/* --- Add/Edit Modal --- */}
      <Modal
        title={editingAddress ? "Edit Address" : "Add New Address"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Save Address"
        className="custom-address-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="pt-3"
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="John Doe" />
          </Form.Item>
          <Form.Item
            name="street"
            label="Street Address"
            rules={[{ required: true }]}
          >
            <Input placeholder="123 Fashion St" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cityStateZip"
                label="City, State, Zip"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AddressBook;
