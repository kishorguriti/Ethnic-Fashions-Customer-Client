import { useState } from "react";
import { Form, Input, Button, Alert, Steps } from "antd";
import { MobileOutlined, LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { sendOtp } from "../../services/authApi";
import { registerUser } from "../../features/auth/authSlice";
import type { RootState, AppDispatch } from "../../store";

type Step1Values = { phone: string };
type Step2Values = { otp: string; password: string; confirmPassword: string; email?: string; name?: string };

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSendOtp = async (values: Step1Values) => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await sendOtp(values.phone);
      setPhone(values.phone);
      // Backend returns OTP in response body when NODE_ENV=development
      if (res?.OTP) setDevOtp(res.OTP);
      setStep(1);
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = (values: Step2Values) => {
    dispatch(
      registerUser({
        phone,
        otp: values.otp,
        password: values.password,
        email: values.email || undefined,
        name: values.name || undefined,
      })
    );
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h2 className="mb-2 special-font-cls">Create Account</h2>
      <p className="text-muted mb-4 small">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>

      <Steps
        current={step}
        size="small"
        className="mb-4"
        items={[
          { title: "Phone" },
          { title: "Verify & Set Password" },
        ]}
      />

      {/* ── Step 1: Phone number ── */}
      {step === 0 && (
        <Form form={form1} layout="vertical" onFinish={handleSendOtp}>
          {otpError && (
            <Alert message={otpError} type="error" showIcon className="mb-3" />
          )}

          <Form.Item
            name="phone"
            label="Mobile Number"
            rules={[
              { required: true, message: "Enter your mobile number" },
              { pattern: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit Indian mobile number" },
            ]}
          >
            <Input
              prefix={<MobileOutlined />}
              placeholder="9876543210"
              size="large"
              maxLength={10}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={otpLoading}
            block
            size="large"
            className="btnPrimary"
          >
            Send OTP
          </Button>
        </Form>
      )}

      {/* ── Step 2: OTP + credentials ── */}
      {step === 1 && (
        <Form form={form2} layout="vertical" onFinish={handleRegister}>
          <p className="text-muted small mb-3">
            OTP sent to <strong>+91 {phone}</strong>.{" "}
            <a
              onClick={() => { setStep(0); setOtpError(null); setDevOtp(null); }}
              style={{ cursor: "pointer" }}
            >
              Change
            </a>
          </p>

          {devOtp && (
            <Alert
              type="warning"
              showIcon
              className="mb-3"
              message={<span>Dev mode — your OTP is <strong style={{ letterSpacing: 2 }}>{devOtp}</strong></span>}
            />
          )}

          {error && (
            <Alert message={error} type="error" showIcon className="mb-3" />
          )}

          <Form.Item
            name="otp"
            label="OTP"
            rules={[
              { required: true, message: "Enter the OTP" },
              { len: 6, message: "OTP must be 6 digits" },
            ]}
          >
            <Input
              prefix={<LockOutlined />}
              placeholder="6-digit OTP"
              size="large"
              maxLength={6}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Full Name (optional)"
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Your name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email (optional)"
            rules={[{ type: "email", message: "Enter a valid email" }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 6, message: "Minimum 6 characters" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
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
            Create Account
          </Button>
        </Form>
      )}
    </div>
  );
}
