import { Form, Input, Button, Card, Row, Col, Typography } from "antd";

const { Title } = Typography;

const CustomerProfile = () => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  return (
    <>
      <Card className="main-content-card shadow-sm">
        <div className="form-section">
          <Title level={3} className="section-title">
            My Profile
          </Title>
          <Form
            layout="vertical"
            form={profileForm}
            initialValues={{
              firstName: "John",
              lastName: "Doe",
              email: "john.doe@example.com",
              phone: "+1 234 567 8900",
            }}
          >
            <Row gutter={16}>
              <Col span={12} xs={24} sm={12}>
                <Form.Item label="First Name">
                  <Input defaultValue="John" />
                </Form.Item>
              </Col>
              <Col span={12} xs={24} sm={12}>
                <Form.Item label="Last Name">
                  <Input defaultValue="Doe" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Email">
              <Input defaultValue="john.doe@example.com" />
            </Form.Item>
            <Form.Item label="Phone">
              <Input defaultValue="+1 234 567 8900" />
            </Form.Item>
            <Form.Item label="Date of Birth">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Button type="primary" className="pill-btn primary-action">
              Save Changes
            </Button>
          </Form>
        </div>

        <div className="divider-line" />

        <section className="change-password-section">
          <h2 className="section-title">Change Password</h2>
          <Form form={passwordForm} layout="vertical">
            <Form.Item name="currentPassword" label="Current Password">
              <Input.Password />
            </Form.Item>
            <Form.Item name="newPassword" label="New Password">
              <Input.Password />
            </Form.Item>
            <Form.Item name="confirmPassword" label="Confirm New Password">
              <Input.Password />
            </Form.Item>
            <Button type="primary" className="pill-btn primary-action">
              Update Password
            </Button>
          </Form>
        </section>
      </Card>
    </>
  );
};

export default CustomerProfile;
