import { useEffect, useState } from "react";
import { Form, Input, Button, Card, Row, Col, Typography, Alert, Divider, Avatar, Tag } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../hooks";
import { updateProfile, clearAuthError } from "../../../features/auth/authSlice";
import { changePasswordApi } from "../../../services/customerApi";
import type { RootState } from "../../../store";

const { Title, Text } = Typography;

const CustomerProfile = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const [profileForm] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Populate form when user data is available
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name:  user.name  || "",
        email: user.email || "",
      });
    }
  }, [user, profileForm]);

  const handleSave = async (values: { name: string; email: string }) => {
    const result = await dispatch(updateProfile({ name: values.name, email: values.email }));
    if (updateProfile.fulfilled.match(result)) {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleCancel = () => {
    profileForm.setFieldsValue({ name: user?.name || "", email: user?.email || "" });
    setEditing(false);
    dispatch(clearAuthError());
  };

  const displayName = user?.name || user?.phone || "Customer";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="customer-profile-page">
      {/* ── Profile Header Card ── */}
      <Card className="mb-4" bordered={false} style={{ borderRadius: 12 }}>
        <div className="d-flex align-items-center gap-4 flex-wrap">
          <Avatar
            size={80}
            style={{ background: "linear-gradient(135deg, #8e2de2, #f209a2)", fontSize: 32, flexShrink: 0 }}
          >
            {initials}
          </Avatar>
          <div>
            <Title level={4} className="m-0">{displayName}</Title>
            <div className="d-flex gap-2 flex-wrap mt-1">
              {user?.phone && (
                <Tag icon={<PhoneOutlined />} color="blue">+91 {user.phone}</Tag>
              )}
              {user?.email && (
                <Tag icon={<MailOutlined />} color="purple">{user.email}</Tag>
              )}
              {user?.isPhoneVerified && (
                <Tag color="success">Phone Verified</Tag>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Edit Profile Card ── */}
      <Card
        bordered={false}
        style={{ borderRadius: 12 }}
        title={
          <div className="d-flex justify-content-between align-items-center">
            <span>Profile Details</span>
            {!editing && (
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            )}
          </div>
        }
      >
        {saved && (
          <Alert message="Profile updated successfully!" type="success" showIcon className="mb-3" />
        )}
        {error && (
          <Alert message={error} type="error" showIcon className="mb-3" />
        )}

        <Form form={profileForm} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Full Name" name="name">
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Your full name"
                  disabled={!editing}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Enter a valid email" }]}>
                <Input
                  prefix={<MailOutlined />}
                  placeholder="your@email.com"
                  disabled={!editing}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Phone is read-only — cannot be changed without OTP */}
          <Form.Item label="Mobile Number">
            <Input
              prefix={<PhoneOutlined />}
              value={user?.phone ? `+91 ${user.phone}` : ""}
              disabled
              size="large"
              suffix={user?.isPhoneVerified ? <Tag color="success" style={{ marginRight: 0 }}>Verified</Tag> : null}
            />
          </Form.Item>

          {editing && (
            <div className="d-flex gap-2 mt-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                className="btnPrimary"
              >
                Save Changes
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </div>
          )}
        </Form>
      </Card>

      <Divider />

      {/* ── Change Password Card ── */}
      <Card bordered={false} style={{ borderRadius: 12 }} title="Change Password">
        <Text type="secondary" className="d-block mb-3 small">
          Use your current password to set a new one.
        </Text>
        <PasswordForm />
      </Card>
    </div>
  );
};

// Separate component to keep form state isolated
const PasswordForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (values: { currentPassword: string; newPassword: string }) => {
    setLoading(true);
    setStatus("idle");
    try {
      await changePasswordApi({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      setStatus("success");
      form.resetFields();
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 400 }}>
      {status === "success" && (
        <Alert message="Password updated successfully!" type="success" showIcon className="mb-3" />
      )}
      {status === "error" && (
        <Alert message={errorMsg} type="error" showIcon className="mb-3" />
      )}
      <Form.Item
        name="currentPassword"
        label="Current Password"
        rules={[{ required: true, message: "Enter your current password" }]}
      >
        <Input.Password size="large" />
      </Form.Item>
      <Form.Item
        name="newPassword"
        label="New Password"
        rules={[{ required: true, min: 6, message: "Minimum 6 characters" }]}
      >
        <Input.Password size="large" />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label="Confirm New Password"
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: "Confirm your new password" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
              return Promise.reject(new Error("Passwords do not match"));
            },
          }),
        ]}
      >
        <Input.Password size="large" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading} className="btnPrimary">
        Update Password
      </Button>
    </Form>
  );
};

export default CustomerProfile;
