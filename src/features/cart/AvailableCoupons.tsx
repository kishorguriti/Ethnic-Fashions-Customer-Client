import { useEffect, useState } from "react";
import {
  Drawer, Spin, Empty, Tag, Button, Typography,
  Tooltip, message, Badge,
} from "antd";
import {
  CopyOutlined, CheckOutlined, GiftOutlined,
  CalendarOutlined, ShoppingOutlined, TagOutlined, CloseOutlined,
} from "@ant-design/icons";
import { getAvailableCoupons } from "../../services/couponApi";
import type { Coupon, AppliedCoupon } from "../../types/coupon";

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  cartSubtotal: number;
  appliedCoupon: AppliedCoupon | null;
  onApply: (code: string) => Promise<void>;
}

const AvailableCoupons = ({ open, onClose, cartSubtotal, appliedCoupon, onApply }: Props) => {
  const [coupons, setCoupons]     = useState<Coupon[]>([]);
  const [loading, setLoading]     = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getAvailableCoupons()
      .then(setCoupons)
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, [open]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      message.success(`Copied: ${code}`);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleApply = async (code: string) => {
    setApplyingCode(code);
    try {
      await onApply(code);
      onClose();
    } finally {
      setApplyingCode(null);
    }
  };

  const discountLabel = (c: Coupon) =>
    c.type === "percentage"
      ? `${c.value}% OFF${c.maxDiscountCap ? ` (max ₹${c.maxDiscountCap.toLocaleString()})` : ""}`
      : `₹${c.value.toLocaleString()} OFF`;

  const isEligible = (c: Coupon) => cartSubtotal >= c.minOrderValue;

  const isApplied = (c: Coupon) =>
    appliedCoupon?.code === c.code;

  const expiryText = (c: Coupon) => {
    if (!c.expiresAt) return null;
    const d = new Date(c.expiresAt);
    const diffDays = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
    if (diffDays < 0)  return { text: "Expired", color: "red" };
    if (diffDays === 0) return { text: "Expires today", color: "orange" };
    if (diffDays <= 3)  return { text: `Expires in ${diffDays}d`, color: "orange" };
    return { text: `Valid till ${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`, color: "default" };
  };

  // Sort: eligible first, then ineligible
  const sorted = [...coupons].sort((a, b) => {
    if (isEligible(a) === isEligible(b)) return 0;
    return isEligible(a) ? -1 : 1;
  });

  return (
    <Drawer
      title={
        <div className="d-flex align-items-center gap-2">
          <GiftOutlined style={{ color: "#8e2de2" }} />
          <span>Available Coupons</span>
          {coupons.length > 0 && (
            <Badge count={coupons.length} color="#8e2de2" />
          )}
        </div>
      }
      open={open}
      onClose={onClose}
      width={420}
      placement="right"
      zIndex={1300}
      closeIcon={
        <CloseOutlined
          style={{
            fontSize: 16,
            color: "#555",
            background: "#f0f0f0",
            borderRadius: "50%",
            padding: 6,
          }}
        />
      }
      styles={{ body: { padding: "16px 20px", background: "#f8f8fb" } }}
    >
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <Spin size="large" />
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="d-flex flex-column align-items-center justify-content-center text-center"
          style={{ minHeight: 300, padding: "40px 24px" }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#f3e8ff,#fce7f3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <GiftOutlined style={{ fontSize: 32, color: "#8e2de2" }} />
          </div>
          <Title level={5} style={{ marginBottom: 8, color: "#1a1a2e" }}>
            No coupons available
          </Title>
          <Text type="secondary" style={{ fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>
            There are no active coupons right now. Check back later or shop more to unlock exclusive offers.
          </Text>
          <Button
            type="primary"
            className="btnPrimary mt-4"
            style={{ borderRadius: 20, paddingInline: 28 }}
            onClick={onClose}
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {sorted.map((coupon) => {
            const eligible = isEligible(coupon);
            const applied  = isApplied(coupon);
            const expiry   = expiryText(coupon);

            return (
              <div
                key={coupon._id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: applied
                    ? "1.5px solid #52c41a"
                    : eligible
                    ? "1.5px solid #d9d9d9"
                    : "1.5px dashed #e0e0e0",
                  opacity: eligible ? 1 : 0.65,
                  overflow: "hidden",
                }}
              >
                {/* Coupon header band */}
                <div
                  style={{
                    background: applied
                      ? "linear-gradient(90deg,#52c41a,#73d13d)"
                      : "linear-gradient(90deg,#8e2de2,#f209a2)",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <TagOutlined style={{ color: "#fff", fontSize: 16 }} />
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
                      {coupon.code}
                    </span>
                  </div>
                  <Tooltip title={copiedCode === coupon.code ? "Copied!" : "Copy code"}>
                    <Button
                      type="text"
                      size="small"
                      icon={copiedCode === coupon.code ? <CheckOutlined /> : <CopyOutlined />}
                      style={{ color: "#fff" }}
                      onClick={() => handleCopy(coupon.code)}
                    />
                  </Tooltip>
                </div>

                {/* Coupon body */}
                <div style={{ padding: "12px 16px" }}>
                  <Title level={5} style={{ margin: 0, color: "#8e2de2" }}>
                    {discountLabel(coupon)}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {coupon.description}
                  </Text>

                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {coupon.minOrderValue > 0 && (
                      <Tag icon={<ShoppingOutlined />} color="blue" style={{ fontSize: 11 }}>
                        Min. order ₹{coupon.minOrderValue.toLocaleString()}
                      </Tag>
                    )}
                    {expiry && (
                      <Tag icon={<CalendarOutlined />} color={expiry.color} style={{ fontSize: 11 }}>
                        {expiry.text}
                      </Tag>
                    )}
                    {coupon.usageLimit && (
                      <Tag color="purple" style={{ fontSize: 11 }}>
                        {Math.max(0, coupon.usageLimit - coupon.usedCount)} uses left
                      </Tag>
                    )}
                  </div>

                  {!eligible && (
                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 6 }}>
                      Add ₹{(coupon.minOrderValue - cartSubtotal).toLocaleString()} more to use this
                    </Text>
                  )}

                  <Button
                    type={applied ? "default" : "primary"}
                    size="small"
                    block
                    className="mt-3"
                    disabled={!eligible || applied}
                    loading={applyingCode === coupon.code}
                    style={
                      applied
                        ? { borderColor: "#52c41a", color: "#52c41a" }
                        : undefined
                    }
                    onClick={() => !applied && handleApply(coupon.code)}
                  >
                    {applied ? "✓ Applied" : eligible ? "Apply" : "Not eligible"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
};

export default AvailableCoupons;
