import React from "react";
import { Card, Typography, Tag, Button, Row, Col, Space } from "antd";
import image1 from "../../../assets/png/EthnicHomePage_1.svg";
import image2 from "../../../assets/png/EthnicHomePage_2.png";
import image3 from "../../../assets/png/EthnicHomePage_3.png";

const { Title, Text } = Typography;

interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled";
  totalAmount: number;
  images: string[];
}

const orders: OrderItem[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    date: "2/20/2024",
    status: "Delivered",
    totalAmount: 129.98,
    images: [image1, image2],
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    date: "2/25/2024",
    status: "Shipped",
    totalAmount: 89.99,
    images: [image3],
  },
];

const MyOrders: React.FC = () => {
  const handleViewDetails = (orderId: string) => {
    console.log(`Navigating to details for order: ${orderId}`);
    // Add your navigation logic here (e.g., router.push(`/orders/${orderId}`))
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Shipped":
        return "processing";
      default:
        return "default";
    }
  };

  return (
    <Card className="orders-container-card" bordered={false}>
      <Title level={3} className="section-title mb-4">
        My Orders
      </Title>

      {orders.map((order) => (
        <Card key={order.id} className="order-item-card mb-4" bordered>
          <div className="order-header d-flex justify-content-between align-items-start mb-3">
            <div>
              <Title level={5} className="m-0">
                Order #{order.orderNumber}
              </Title>
              <Text type="secondary">Placed on {order.date}</Text>
            </div>
            <Tag color={getStatusColor(order.status)} className="status-tag">
              {order.status}
            </Tag>
          </div>

          <div className="product-thumbnails mb-4">
            <Space size="middle">
              {order.images.map((img, idx) => (
                <div key={idx} className="thumb-wrapper">
                  <img src={img} alt="product" />
                </div>
              ))}
            </Space>
          </div>

          <div className="order-footer d-flex justify-content-between align-items-center pt-3">
            <div>
              <Text type="secondary" className="d-block small">
                Total Amount
              </Text>
              <Text strong className="total-price">
                ${order.totalAmount.toFixed(2)}
              </Text>
            </div>
            <Button
              className="view-details-btn"
              onClick={() => handleViewDetails(order.id)}
            >
              View Details
            </Button>
          </div>
        </Card>
      ))}
    </Card>
  );
};

export default MyOrders;
