import React from "react";
import {  Card, Menu, Row, Col, Typography } from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  UndoOutlined,
  HeartOutlined,
  BellOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const AccountPage: React.FC = () => {
  // const [profileForm] = Form.useForm();
  // const [passwordForm] = Form.useForm();

  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuNavigation = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <div className="account-page-wrapper">
      <div className="container">
        <Title level={2} className="page-header">
          My Account
        </Title>
        <Row gutter={[24, 24]}>
          {/* Sidebar - Responsive (Stacks on mobile) */}
          <Col xs={24} lg={6}>
            <Card className="sidebar-card shadow-sm">
              <Menu
                mode="inline"
                // defaultSelectedKeys={["1"]}
                selectedKeys={[location.pathname]}
                className="custom-menu"
                onClick={(key) => handleMenuNavigation(key)}
                items={[
                  {
                    key: "/my-account",
                    icon: <UserOutlined />,
                    label: "My Profile",
                  },
                  {
                    key: "/my-account/address",
                    icon: <EnvironmentOutlined />,
                    label: "Address Book",
                  },
                  {
                    key: "/my-account/orders",
                    icon: <ShoppingOutlined />,
                    label: "My Orders",
                  },
                  {
                    key: "/my-account/return-requests",
                    icon: <UndoOutlined />,
                    label: "Returns",
                  },
                  {
                    key: "/wishlist",
                    icon: <HeartOutlined />,
                    label: "Wishlist",
                  },
                  {
                    key: "/my-account/notifications",
                    icon: <BellOutlined />,
                    label: "Notifications",
                  },
                  {
                    key: "/my-account/payment-methods",
                    icon: <CreditCardOutlined />,
                    label: "Payment Methods",
                  },
                ]}
              />
            </Card>
          </Col>

          {/* Main Content Area */}
          <Col xs={24} lg={18}>
            <Outlet />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AccountPage;
