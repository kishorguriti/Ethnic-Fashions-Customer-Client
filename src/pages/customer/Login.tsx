import { Form, Input, Button, Alert } from "antd";
import { MobileOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { loginUser } from "../../features/auth/authSlice";
import type { RootState, AppDispatch } from "../../store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location  = useLocation();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  // Redirect to where the user was trying to go, or home
  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const onFinish = (values: { identifier: string; password: string }) => {
    const id = values.identifier.trim();
    if (PHONE_RE.test(id)) {
      dispatch(loginUser({ phone: id, password: values.password }));
    } else {
      dispatch(loginUser({ email: id, password: values.password }));
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-2 special-font-cls">Sign In</h2>
      <p className="text-muted mb-4 small">
        New here? <Link to="/register">Create an account</Link>
      </p>

      {error && (
        <Alert message={error} type="error" showIcon className="mb-3" />
      )}

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="identifier"
          label="Email or Mobile Number"
          rules={[
            { required: true, message: "Enter your email or mobile number" },
            {
              validator(_, value) {
                if (!value || EMAIL_RE.test(value.trim()) || PHONE_RE.test(value.trim())) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Enter a valid email or 10-digit mobile number"));
              },
            },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
            suffix={<MobileOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="email@example.com or 9876543210"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Password is required" }]}
        >
          <Input.Password prefix={<LockOutlined />} size="large" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          className="btnPrimary"
        >
          Sign In
        </Button>
      </Form>
    </div>
  );
}
