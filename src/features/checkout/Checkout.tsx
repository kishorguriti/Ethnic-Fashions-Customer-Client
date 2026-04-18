import React, { useState } from "react";
import {
  Card,
  Steps,
  Typography,
  Button,
  Row,
  Col,
  Badge,
  Radio,
  Divider,
  Space,
} from "antd";
import {
  TruckOutlined,
  WalletOutlined,
  LockOutlined,
  CheckCircleFilled,
  PlusOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import DeliveryStep from "./DeliveryStep";
import PaymentStep from "./PaymentStep";
import Image from "../../assets/png/EthnicHomePage_1.svg";
import ReviewStep from "./ReviewStep";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const CheckoutPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAddr, setSelectedAddr] = useState("1");
  const navigate = useNavigate();
  const addresses = [
    {
      id: "1",
      name: "John Doe",
      isDefault: true,
      address: "123 Fashion Street, New York, NY 10001",
      phone: "+1 234 567 8900",
    },
    {
      id: "2",
      name: "John Doe",
      isDefault: false,
      address: "456 Style Avenue, Los Angeles, CA 90001",
      phone: "+1 234 567 8901",
    },
  ];

  const handlePlaceOrder = () => {
    navigate('/order-placed')
  };

  return (
    <div className="secure-checkout-container">
      <div className="container py-5">
        <header className="checkout-header mb-4">
          <Title level={2}>Secure Checkout</Title>
          <Text type="secondary">
            <LockOutlined /> Your payment information is encrypted and secure
          </Text>
        </header>

        {/* --- Progress Steps --- */}
        <Card className="steps-outer-card mb-4" bordered={false}>
          <Steps
            current={currentStep}
            responsive={false}
            items={[
              {
                title: "Shipping",
                icon: (
                  <div className="step-icon-inner">
                    <TruckOutlined />
                  </div>
                ),
              },
              {
                title: "Delivery",
                icon: (
                  <div className="step-icon-inner">
                    <WalletOutlined />
                  </div>
                ),
              },
              {
                title: "Payment",
                icon: (
                  <div className="step-icon-inner">
                    <LockOutlined />
                  </div>
                ),
              },
              {
                title: "Review",
                icon: (
                  <div className="step-icon-inner">
                    <CheckCircleFilled />
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* {currentStep === 0 && ( */}
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            {currentStep === 0 && (
              <Card className="selection-main-card" bordered={false}>
                <div className="section-title-row mb-4">
                  <TruckOutlined className="blue-icon" />
                  <Title level={4} className="m-0 ms-2">
                    Shipping Address
                  </Title>
                </div>

                {/* --- Address Selection Logic --- */}
                <div className="address-list">
                  {addresses.map((item) => (
                    <div
                      key={item.id}
                      className={`address-option-card ${selectedAddr === item.id ? "active" : ""}`}
                      onClick={() => setSelectedAddr(item.id)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center">
                          <Radio checked={selectedAddr === item.id} />
                          <div className="ms-3">
                            <Text strong className="name-label">
                              {item.name}
                            </Text>
                            {item.isDefault && (
                              <Badge
                                count="Default"
                                className="ms-2 default-badge"
                              />
                            )}
                            <div className="addr-details mt-1">
                              <Text type="secondary" className="d-block">
                                {item.address}
                              </Text>
                              <Text type="secondary" className="d-block mt-1">
                                <span className="phone-icon">✆</span>{" "}
                                {item.phone}
                              </Text>
                            </div>
                          </div>
                        </div>
                        {selectedAddr === item.id && (
                          <CheckCircleFilled className="active-check-icon" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  className="add-new-btn mt-3"
                >
                  Add New Address
                </Button>
              </Card>
            )}
            {currentStep === 1 && <DeliveryStep />}
            {currentStep === 2 && <PaymentStep />}
            {currentStep === 3 && <ReviewStep />}

            <div
              className={`action-row mt-4 d-flex ${currentStep !== 0 ? "justify-content-between" : "justify-content-end"}`}
            >
              {currentStep !== 0 && (
                <Button
                  className="back-btn"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                >
                  Back
                </Button>
              )}
              {currentStep !== 3 && (
                <Button
                  type="primary"
                  className="checkout-continue-btn"
                  onClick={() =>
                    setCurrentStep((prev) => Math.min(prev + 1, 3))
                  }
                >
                  Continue
                </Button>
              )}
              {currentStep === 3 && (
                <Button
                  type="primary"
                  className="checkout-continue-btn"
                  onClick={() => handlePlaceOrder()}
                >
                  Place Order
                </Button>
              )}
            </div>
          </Col>

          {/* --- Summary Sidebar --- */}
          <Col xs={24} lg={8}>
            <Card className="order-summary-card" bordered={false}>
              <Title level={4} className="mb-4">
                Order Summary
              </Title>

              <div className="cart-preview-item d-flex gap-3 mb-4">
                <div className="product-img-box">
                  <img src={Image} alt="item" />
                </div>
                <div className="flex-grow-1">
                  <Text strong className="d-block">
                    Royal Banarasi Silk Saree
                  </Text>
                  <Text type="secondary" className="small">
                    Qty: 1
                  </Text>
                </div>
                <Text strong>$8999.00</Text>
              </div>

              <div className="price-details">
                <div className="price-line">
                  <Text type="secondary">Subtotal</Text>
                  <Text strong>$8999.00</Text>
                </div>
                <div className="price-line">
                  <Text type="secondary">Shipping</Text>
                  <Text type="success" strong>
                    FREE
                  </Text>
                </div>
                <div className="price-line">
                  <Text type="secondary">Tax (8%)</Text>
                  <Text strong>$719.92</Text>
                </div>
                <Divider className="my-3" />
                <div className="total-line d-flex justify-content-between">
                  <Title level={3} className="m-0">
                    Total
                  </Title>
                  <Title level={3} className="m-0 total-amount">
                    $9718.92
                  </Title>
                </div>
              </div>

              <div className="trust-info-footer mt-4">
                <Space direction="vertical" size="small" className="w-100">
                  <Text type="secondary" className="small">
                    <LockOutlined className="me-2" /> Secure SSL Encryption
                  </Text>
                  <Text type="secondary" className="small">
                    <TruckOutlined className="me-2" /> Free Returns within 30
                    days
                  </Text>
                  <Text type="secondary" className="small">
                    <SafetyCertificateOutlined className="me-2" /> 100%
                    Authentic Products
                  </Text>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
        {/* )} */}
        {/* {currentStep === 1 && <DeliveryStep />} */}
      </div>
    </div>
  );
};

export default CheckoutPage;
