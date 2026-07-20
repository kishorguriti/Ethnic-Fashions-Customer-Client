#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Customer client fixes
# Run FROM THE CUSTOMER PROJECT ROOT:  bash update-3-customer-fixes.sh
# Idempotent; does not touch node_modules.
#
# Requires the server script (update-1-server-fixes.sh) to be applied first —
# it provides the return image upload route, order timeline/shipping dates and
# the Razorpay customer id this UI depends on.
#
# Covers:
#   • My Orders redesigned — it was flat white with an unstyled Return button.
#   • Status shown as coloured pills with icons (shipped = van).
#   • Order tracking: Placed → Confirmed → Shipped → Delivered, with dates and
#     an expected-delivery date while in transit.
#   • Return modal: photo upload for reference, and a quantity that cannot
#     exceed what is still returnable.
#   • "Return Item" → "Return" (and the drawer's "Request Return" matches).
#   • Order Confirmed page reworked.
#   • Saved cards offered at checkout.
#   • Logo: Ethnic Style.svg.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

if [ ! -f "package.json" ] || [ ! -d "src/pages/customer" ]; then
  echo "✖ This does not look like the customer project root (expected package.json + src/pages/customer)."
  echo "  cd into Ethnic-Fashions-Customer-Client-develop and re-run."
  exit 1
fi

echo "Applying customer client changes in: $(pwd)"
echo

BACKUP_DIR=".customer-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
for f in \
  src/services/returnApi.ts \
  src/services/orderApi.ts \
  src/services/razorpay.ts \
  src/features/checkout/Checkout.tsx \
  src/features/checkout/OrderConfirmation.tsx \
  src/pages/customer/account/MyOrders.tsx \
  src/components/layout/customer/Header.tsx \
  src/pages/customer/account/ReturnRequest.tsx \
  src/styles/layout/customer/account/_my-orders.scss \
  src/styles/layout/customer/account/_return-request.scss \
  src/styles/page-components/_order-confirmation.scss
do
  if [ -f "$f" ]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$f")"
    cp "$f" "$BACKUP_DIR/$f"
  fi
done
echo "→ Backed up modified files to $BACKUP_DIR/"
echo

# ─────────────────────────────────────────────────────────────────────────────
# 1. returnApi — evidence photos
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/services/returnApi.ts"
node - <<'__CUS_EOF__'
const fs = require('fs');
const p = 'src/services/returnApi.ts';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('uploadReturnImage')) { console.log('   already patched — skipping'); process.exit(0); }

const anchor = `  items?: Array<{ variant: string; quantity: number }>;
}`;
if (!s.includes(anchor)) { console.error('   ✖ anchor not found — aborting'); process.exit(1); }

s = s.replace(anchor, `  items?: Array<{ variant: string; quantity: number }>;
  /** Cloudinary URLs from uploadReturnImage(), shown to the admin on review. */
  customerImages?: string[];
}`);

s += `
/**
 * Uploads one reference photo for a return request and resolves with its URL.
 *
 * Goes to a customer-authorised route: the staff /assets/upload endpoint is
 * role-guarded to admin/partner and would 403 here.
 */
export const uploadReturnImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await axiosInstance.post("/assets/return-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data.asset.url as string;
};
`;
fs.writeFileSync(p, s);
console.log('   patched');
__CUS_EOF__

# ─────────────────────────────────────────────────────────────────────────────
# 2. orderApi — tracking fields, saved-card handshake, invoice
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/services/orderApi.ts"
node - <<'__CUS_EOF__'
const fs = require('fs');
const p = 'src/services/orderApi.ts';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('OrderTimelineEntry')) { console.log('   already patched — skipping'); process.exit(0); }

const fail = (n) => { console.error(`   ✖ anchor not found: ${n} — aborting`); process.exit(1); };
const edits = [];
const edit = (name, from, to) => edits.push({ name, from, to });

edit('timeline fields',
`  // Populated once delivered — the per-product return window deadline (backend).
  returnEligibleUntil?: string | null;`,
`  // Populated once delivered — the per-product return window deadline (backend).
  returnEligibleUntil?: string | null;
  // Fulfilment history, used to draw the tracking steps with real dates.
  timeline?: OrderTimelineEntry[];
  shippedAt?: string | null;
  deliveredAt?: string | null;
  invoice?: { number?: string; url?: string; createdAt?: string | null };`);

edit('timeline type',
`export interface OrderPayment {`,
`export interface OrderTimelineEntry {
  status: string;
  note?: string;
  at: string;
}

export interface OrderPayment {`);

edit('handshake',
`export interface RazorpayHandshake {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}`,
`export interface RazorpayHandshake {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  /** Razorpay customer handle — required for saved cards to be offered. */
  customerId?: string;
  rememberCustomer?: boolean;
}`);

for (const e of edits) if (!s.includes(e.from)) fail(e.name);
for (const e of edits) s = s.replace(e.from, e.to);

s += `
/** Fetches (generating on first request) the tax invoice for a paid order. */
export const getInvoice = async (
  orderId: string,
): Promise<{ number: string; url: string }> => {
  const res = await axiosInstance.get(\`/invoices/\${orderId}\`);
  return res.data.data.invoice;
};
`;
fs.writeFileSync(p, s);
console.log(`   patched (${edits.length} edits)`);
__CUS_EOF__

# ─────────────────────────────────────────────────────────────────────────────
# 3. Razorpay checkout — offer saved cards
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/services/razorpay.ts"
node - <<'__CUS_EOF__'
const fs = require('fs');
const p = 'src/services/razorpay.ts';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('remember_customer')) { console.log('   already patched — skipping'); process.exit(0); }

const fail = (n) => { console.error(`   ✖ anchor not found: ${n} — aborting`); process.exit(1); };
const edits = [];
const edit = (name, from, to) => edits.push({ name, from, to });

edit('options type',
`  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: {`,
`  prefill?: { name?: string; email?: string; contact?: string };
  /**
   * Razorpay customer handle. Checkout only shows a returning buyer's saved
   * cards when the same customer_id is supplied, so without this every payment
   * looks like a first-time visitor.
   */
  customerId?: string;
  /** Asks Checkout to offer "save this card for later". */
  rememberCustomer?: boolean;
  onSuccess: (response: {`);

edit('options object',
`    prefill: opts.prefill,
    theme: { color: "#7c3aed" },`,
`    prefill: opts.prefill,
    ...(opts.customerId ? { customer_id: opts.customerId } : {}),
    ...(opts.rememberCustomer ? { remember_customer: true } : {}),
    theme: { color: "#8e2de2" },`);

for (const e of edits) if (!s.includes(e.from)) fail(e.name);
for (const e of edits) s = s.replace(e.from, e.to);

fs.writeFileSync(p, s);
console.log(`   patched (${edits.length} edits)`);
__CUS_EOF__

echo "→ src/features/checkout/Checkout.tsx (forward saved-card fields)"
node - <<'__CUS_EOF__'
const fs = require('fs');
const p = 'src/features/checkout/Checkout.tsx';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('rememberCustomer')) { console.log('   already patched — skipping'); process.exit(0); }

const from = `        prefill:     razorpay.prefill,
        onSuccess: async (resp) => {`;
const to = `        prefill:     razorpay.prefill,
        customerId:       razorpay.customerId,
        rememberCustomer: razorpay.rememberCustomer,
        onSuccess: async (resp) => {`;

if (!s.includes(from)) { console.error('   ✖ anchor not found — aborting'); process.exit(1); }
s = s.replace(from, to);
fs.writeFileSync(p, s);
console.log('   patched');
__CUS_EOF__

# ─────────────────────────────────────────────────────────────────────────────
# 4. Logo
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/components/layout/customer/Header.tsx (logo)"
node - <<'__CUS_EOF__'
const fs = require('fs');
const p = 'src/components/layout/customer/Header.tsx';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('Ethnic Style.svg')) { console.log('   already patched — skipping'); process.exit(0); }

const from = `import Logo from "../../../assets/svg/Aarna.svg";`;
if (!s.includes(from)) { console.error('   ✖ anchor not found — aborting'); process.exit(1); }
s = s.replace(from, `import Logo from "../../../assets/svg/Ethnic Style.svg";`);
fs.writeFileSync(p, s);
console.log('   patched');
__CUS_EOF__

# ─────────────────────────────────────────────────────────────────────────────
# 5. My Orders — redesign, status pills, tracking, return with photos
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/pages/customer/account/MyOrders.tsx"
cat > 'src/pages/customer/account/MyOrders.tsx' <<'__CUS_EOF__'
import React, { useEffect, useState } from "react";
import {
  Card, Typography, Button, Empty, Skeleton, Drawer, Descriptions, Divider,
  message, Popconfirm, Modal, Form, Select, Input, Checkbox, InputNumber,
  Upload, Image,
} from "antd";
import type { UploadFile } from "antd";
import {
  ClockCircleOutlined, CheckCircleOutlined, SyncOutlined, CarOutlined,
  HomeOutlined, CloseCircleOutlined, RollbackOutlined, FileDoneOutlined,
  PlusOutlined, DownloadOutlined,
} from "@ant-design/icons";
import { getMyOrders, getOrder, cancelOrder, getInvoice } from "../../../services/orderApi";
import type { Order, OrderItem } from "../../../services/orderApi";
import {
  requestReturn, uploadReturnImage, REASON_OPTIONS, type ReturnReason,
} from "../../../services/returnApi";

const { Title, Text } = Typography;

/**
 * Every status rendered as an icon + colour, so the state of an order is
 * legible at a glance rather than as a word in a grey tag.
 */
const STATUS_META: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pending:          { label: "Pending",            icon: <ClockCircleOutlined />, cls: "pill-pending" },
  confirmed:        { label: "Confirmed",          icon: <CheckCircleOutlined />, cls: "pill-confirmed" },
  processing:       { label: "Processing",         icon: <SyncOutlined spin />,   cls: "pill-processing" },
  shipped:          { label: "Shipped",            icon: <CarOutlined />,         cls: "pill-shipped" },
  delivered:        { label: "Delivered",          icon: <HomeOutlined />,        cls: "pill-delivered" },
  cancelled:        { label: "Cancelled",          icon: <CloseCircleOutlined />, cls: "pill-cancelled" },
  return_requested: { label: "Return Requested",   icon: <RollbackOutlined />,    cls: "pill-return" },
  return_approved:  { label: "Return Approved",    icon: <RollbackOutlined />,    cls: "pill-return" },
  return_received:  { label: "Return Received",    icon: <RollbackOutlined />,    cls: "pill-return" },
  returned:         { label: "Returned",           icon: <RollbackOutlined />,    cls: "pill-returned" },
};

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const statusMeta = (s: string) =>
  STATUS_META[s] ?? { label: cap((s || "").replace(/_/g, " ")), icon: <ClockCircleOutlined />, cls: "pill-pending" };

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const m = statusMeta(status);
  return (
    <span className={`order-status-pill ${m.cls}`}>
      {m.icon}
      <span>{m.label}</span>
    </span>
  );
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

const fmtShort = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

const paymentLabel = (o: Order) => {
  if (o.payment.method === "cod") return o.payment.status === "paid" ? "COD · Paid" : "Cash on Delivery";
  switch (o.payment.status) {
    case "paid": return "Paid online";
    case "refunded": return "Refunded";
    case "partially_refunded": return "Partially refunded";
    case "failed": return "Payment failed";
    default: return "Payment pending";
  }
};

/**
 * Fulfilment tracker.
 *
 * Dates come from the order's own timeline where the backend recorded them, so
 * this reflects what actually happened rather than a guess. While an order is in
 * transit the courier is not yet integrated, so the promised date is the
 * server's estimate (shipped + 7 days) and is labelled as expected, not known.
 */
const OrderTracking: React.FC<{ order: Order }> = ({ order }) => {
  const STEPS = [
    { key: "placed",    label: "Order Placed", icon: <FileDoneOutlined /> },
    { key: "confirmed", label: "Confirmed",    icon: <CheckCircleOutlined /> },
    { key: "shipped",   label: "Shipped",      icon: <CarOutlined /> },
    { key: "delivered", label: "Delivered",    icon: <HomeOutlined /> },
  ];

  // First timeline entry for a status wins — later duplicates are corrections.
  const dateFor = (key: string): string | null => {
    const hit = order.timeline?.find((t) => t.status === key);
    if (hit) return hit.at;
    if (key === "placed") return order.createdAt;
    if (key === "shipped") return order.shippedAt ?? null;
    if (key === "delivered") return order.deliveredAt ?? null;
    return null;
  };

  const reached: Record<string, number> = {
    pending: 0, confirmed: 1, processing: 1, shipped: 2, delivered: 3,
    return_requested: 3, return_approved: 3, return_received: 3, returned: 3,
  };
  const currentIdx = reached[order.status] ?? 0;

  if (order.status === "cancelled") {
    return (
      <div className="order-tracking cancelled-note">
        <CloseCircleOutlined />
        <span>This order was cancelled{order.timeline?.find((t) => t.status === "cancelled")?.at
          ? ` on ${fmtShort(order.timeline.find((t) => t.status === "cancelled")!.at)}`
          : ""}.</span>
      </div>
    );
  }

  return (
    <div className="order-tracking">
      {STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const at = dateFor(step.key);
        return (
          <div key={step.key} className={`track-step ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
            <div className="track-marker">
              <span className="track-icon">{step.icon}</span>
              {idx < STEPS.length - 1 && <span className="track-line" />}
            </div>
            <div className="track-body">
              <div className="track-label">{step.label}</div>
              <div className="track-date">
                {at ? fmtShort(at) : active ? "In progress" : "Pending"}
              </div>
            </div>
          </div>
        );
      })}

      {order.status === "shipped" && order.estimatedDelivery && (
        <div className="track-eta">
          <CarOutlined />
          <span>Expected delivery by <strong>{fmtShort(order.estimatedDelivery)}</strong></span>
        </div>
      )}
    </div>
  );
};

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Return request modal — can be opened from the list card OR the details drawer.
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState<Order | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnForm] = Form.useForm();
  // Per-line selection: keyed by variant id → { checked, quantity }
  const [returnSel, setReturnSel] = useState<Record<string, { checked: boolean; quantity: number }>>({});
  // Evidence photos already uploaded for this request.
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const openReturn = (order: Order) => {
    returnForm.resetFields();
    const sel: Record<string, { checked: boolean; quantity: number }> = {};
    order.items.forEach((it) => {
      if (it.variant) sel[it.variant] = { checked: true, quantity: it.quantity };
    });
    setReturnSel(sel);
    setReturnImages([]);
    setReturnOrder(order);
    setReturnOpen(true);
  };

  const setLineChecked = (variant: string, checked: boolean) =>
    setReturnSel((prev) => ({ ...prev, [variant]: { ...prev[variant], checked } }));

  // Clamped here as well as on the input: a typed value can otherwise land in
  // state above the ordered quantity, and the server rejects it outright.
  const setLineQty = (variant: string, quantity: number, max: number) =>
    setReturnSel((prev) => ({
      ...prev,
      [variant]: { ...prev[variant], quantity: Math.max(1, Math.min(quantity, max)) },
    }));

  // Live refund estimate from the current selection.
  const returnEstimate = (order: Order | null) =>
    !order ? 0 : order.items.reduce((sum, it) => {
      const s = it.variant ? returnSel[it.variant] : undefined;
      return s?.checked ? sum + it.unitPrice * s.quantity : sum;
    }, 0);

  const load = () => {
    setLoading(true);
    getMyOrders({ limit: 50 })
      .then((res) => setOrders(res.orders))
      .catch((err: any) => message.error(err.response?.data?.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openDetails = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const order = await getOrder(id);
      setDetail(order);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to load order");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelling(true);
    try {
      const updated = await cancelOrder(id);
      message.success("Order cancelled");
      setDetail(updated);
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Could not cancel this order");
    } finally {
      setCancelling(false);
    }
  };

  const handleInvoice = async (id: string) => {
    setInvoiceLoading(true);
    try {
      const invoice = await getInvoice(id);
      window.open(invoice.url, "_blank", "noopener");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Invoice is not available yet");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const canCancel = (o: Order) => !["shipped", "delivered", "cancelled", "returned"].includes(o.status);

  // Return is allowed only for delivered orders that are still inside the return
  // window. The window is per-product (returnPeriodDays) and the backend supplies
  // `returnEligibleUntil`; if it's absent we allow (delivered).
  const returnWindowOpen = (o: Order) =>
    !o.returnEligibleUntil || Date.now() <= new Date(o.returnEligibleUntil).getTime();
  const canReturn = (o: Order) => o.status === "delivered" && returnWindowOpen(o);
  const windowClosed = (o: Order) => o.status === "delivered" && !returnWindowOpen(o);
  const hasInvoice = (o: Order) => o.payment.status === "paid";

  // Uploads immediately and keeps only the resulting URL — the request payload
  // carries URLs, not files.
  const handleUpload = async (file: File) => {
    if (returnImages.length >= 5) {
      message.warning("You can attach up to 5 photos");
      return false;
    }
    setUploading(true);
    try {
      const url = await uploadReturnImage(file);
      setReturnImages((prev) => [...prev, url]);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Could not upload that photo");
    } finally {
      setUploading(false);
    }
    return false; // stop antd's own upload
  };

  const submitReturn = async () => {
    if (!returnOrder) return;
    try {
      const values = await returnForm.validateFields();

      // Collect the selected lines.
      const selectedItems = returnOrder.items
        .filter((it) => it.variant && returnSel[it.variant]?.checked && returnSel[it.variant]?.quantity > 0)
        .map((it) => ({ variant: it.variant as string, quantity: returnSel[it.variant!].quantity }));

      if (selectedItems.length === 0) {
        message.warning("Select at least one item to return");
        return;
      }

      // If every line is fully selected, omit `items` for a clean whole-order return.
      const allFull =
        selectedItems.length === returnOrder.items.length &&
        returnOrder.items.every((it) => it.variant && returnSel[it.variant]?.quantity === it.quantity);

      setReturnLoading(true);
      await requestReturn({
        orderId: returnOrder._id,
        reason: values.reason as ReturnReason,
        reasonText: values.reasonText || undefined,
        items: allFull ? undefined : selectedItems,
        customerImages: returnImages.length ? returnImages : undefined,
      });
      message.success("Return request submitted. We'll review it shortly.");
      setReturnOpen(false);
      returnForm.resetFields();
      setReturnImages([]);
      setDetail(null);       // close the drawer if it was open
      load();                // refresh so the order shows its new return status
    } catch (err: any) {
      if (err?.errorFields) return; // form validation
      message.error(err.response?.data?.message || "Could not submit return request");
    } finally {
      setReturnLoading(false);
    }
  };

  const uploadFileList: UploadFile[] = returnImages.map((url, idx) => ({
    uid: String(idx),
    name: `photo-${idx + 1}.jpg`,
    status: "done",
    url,
  }));

  return (
    <Card className="orders-container-card" variant="borderless">
      <div className="orders-head d-flex justify-content-between align-items-center mb-4">
        <Title level={3} className="section-title m-0">My Orders</Title>
        {!loading && orders.length > 0 && (
          <Text type="secondary" className="small">{orders.length} order{orders.length === 1 ? "" : "s"}</Text>
        )}
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : orders.length === 0 ? (
        <Empty description="You haven't placed any orders yet" />
      ) : (
        orders.map((order) => (
          <Card key={order._id} className="order-item-card mb-4" variant="outlined">
            <div className="order-header d-flex justify-content-between align-items-start mb-3">
              <div>
                <Title level={5} className="m-0 order-number">Order #{order.orderNumber}</Title>
                <Text type="secondary" className="small">Placed on {fmtDate(order.createdAt)}</Text>
              </div>
              <StatusPill status={order.status} />
            </div>

            <div className="product-thumbnails mb-3 d-flex align-items-center gap-2 flex-wrap">
              {order.items.slice(0, 4).map((it, idx) =>
                it.image ? (
                  <div key={idx} className="thumb-wrapper">
                    <img src={it.image} alt={it.name} />
                  </div>
                ) : null
              )}
              {order.items.length > 4 && (
                <span className="thumb-more">+{order.items.length - 4}</span>
              )}
            </div>

            {/* Compact tracker on the card; the drawer carries the full one. */}
            {!["cancelled"].includes(order.status) && <OrderTracking order={order} />}

            <div className="order-footer d-flex justify-content-between align-items-center flex-wrap gap-3 pt-3">
              <div>
                <Text type="secondary" className="d-block small">Total Amount</Text>
                <Text strong className="total-price">₹{order.total.toLocaleString("en-IN")}</Text>
                <Text type="secondary" className="d-block small">{paymentLabel(order)}</Text>
              </div>
              <div className="order-actions d-flex align-items-center gap-2 flex-wrap">
                {canReturn(order) && (
                  <Button className="return-order-btn" icon={<RollbackOutlined />} onClick={() => openReturn(order)}>
                    Return
                  </Button>
                )}
                <Button className="view-details-btn" onClick={() => openDetails(order._id)}>
                  View Details
                </Button>
              </div>
            </div>

            {["return_requested", "return_approved", "return_received", "returned"].includes(order.status) && (
              <div className="return-status-note mt-3">
                <RollbackOutlined />
                <span>Return status: <b>{statusMeta(order.status).label}</b></span>
              </div>
            )}
          </Card>
        ))
      )}

      <Drawer
        title={detail ? `Order #${detail.orderNumber}` : "Order details"}
        open={detailLoading || !!detail}
        onClose={() => setDetail(null)}
        width={480}
        className="order-detail-drawer"
        // Site header is position:fixed z-index:1100 — keep the drawer above it
        // so its title isn't hidden behind the header on mobile.
        zIndex={1300}
      >
        {detailLoading || !detail ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <>
            <div className="drawer-status-row mb-3">
              <StatusPill status={detail.status} />
            </div>

            <div className="drawer-tracking-panel mb-3">
              <OrderTracking order={detail} />
            </div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Placed on">{fmtDate(detail.createdAt)}</Descriptions.Item>
              <Descriptions.Item label={detail.status === "delivered" ? "Delivered on" : "Estimated delivery"}>
                {fmtDate(detail.status === "delivered" ? detail.deliveredAt : detail.estimatedDelivery)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment">{paymentLabel(detail)}</Descriptions.Item>
            </Descriptions>

            <Divider>Items</Divider>
            {detail.items.map((it, idx) => (
              <div key={idx} className="d-flex justify-content-between align-items-center mb-3" style={{ gap: 12 }}>
                {it.image && <img src={it.image} alt={it.name} style={{ width: 48, height: 58, objectFit: "cover", borderRadius: 6 }} />}
                <div className="flex-grow-1">
                  <Text strong className="d-block" style={{ fontSize: 13 }}>{it.name}</Text>
                  <Text type="secondary" className="small">
                    {it.size ? `Size: ${it.size} · ` : ""}Color: {it.color} · Qty: {it.quantity}
                  </Text>
                </div>
                <Text strong>₹{it.lineTotal.toLocaleString("en-IN")}</Text>
              </div>
            ))}

            <Divider />
            <div className="d-flex justify-content-between"><Text type="secondary">Subtotal</Text><Text>₹{detail.subtotal.toLocaleString("en-IN")}</Text></div>
            {detail.discount > 0 && (
              <div className="d-flex justify-content-between"><Text type="secondary">Discount{detail.couponCode ? ` (${detail.couponCode})` : ""}</Text><Text type="success">−₹{detail.discount.toLocaleString("en-IN")}</Text></div>
            )}
            <div className="d-flex justify-content-between"><Text type="secondary">Shipping</Text><Text>{detail.shippingFee > 0 ? `₹${detail.shippingFee}` : "FREE"}</Text></div>
            <div className="d-flex justify-content-between"><Text type="secondary">Tax</Text><Text>₹{detail.tax.toLocaleString("en-IN")}</Text></div>
            <div className="d-flex justify-content-between mt-2"><Text strong>Total</Text><Text strong>₹{detail.total.toLocaleString("en-IN")}</Text></div>

            {detail.shippingAddress && (
              <>
                <Divider>Delivery Address</Divider>
                <Text className="d-block">{detail.shippingAddress.fullName}</Text>
                <Text type="secondary" className="d-block">{detail.shippingAddress.addressLine1}</Text>
                {detail.shippingAddress.addressLine2 && <Text type="secondary" className="d-block">{detail.shippingAddress.addressLine2}</Text>}
                <Text type="secondary" className="d-block">{detail.shippingAddress.city}, {detail.shippingAddress.state} — {detail.shippingAddress.pincode}</Text>
                <Text type="secondary" className="d-block">{detail.shippingAddress.phone}</Text>
              </>
            )}

            {hasInvoice(detail) && (
              <Button
                block
                className="mt-4 invoice-btn"
                icon={<DownloadOutlined />}
                loading={invoiceLoading}
                onClick={() => handleInvoice(detail._id)}
              >
                Download Invoice
              </Button>
            )}

            {canCancel(detail) && (
              <Popconfirm title="Cancel this order?" description="Paid online orders are automatically refunded." okText="Yes, cancel" onConfirm={() => handleCancel(detail._id)}>
                <Button danger block className="mt-3" loading={cancelling}>Cancel Order</Button>
              </Popconfirm>
            )}

            {canReturn(detail) && (
              <Button block className="mt-3 return-order-btn" icon={<RollbackOutlined />} onClick={() => openReturn(detail)}>
                Return
              </Button>
            )}

            {windowClosed(detail) && (
              <Text type="secondary" className="d-block text-center mt-3">
                The return window for this order has closed.
              </Text>
            )}

            {["return_requested", "return_approved", "return_received", "returned"].includes(detail.status) && (
              <div className="return-status-note mt-3">
                <RollbackOutlined />
                <span>Return status: <b>{statusMeta(detail.status).label}</b></span>
              </div>
            )}
          </>
        )}
      </Drawer>

      <Modal
        open={returnOpen}
        title={returnOrder ? `Return — Order #${returnOrder.orderNumber}` : "Request Return"}
        okText="Submit Request"
        confirmLoading={returnLoading}
        onCancel={() => { setReturnOpen(false); returnForm.resetFields(); }}
        onOk={submitReturn}
        destroyOnHidden
        className="return-request-modal"
        // Must sit above the details drawer (zIndex 1300) when opened from within it.
        zIndex={1400}
      >
        <Text type="secondary" className="d-block mb-3">
          Select the items you want to return. Approved returns are refunded to your original payment method.
        </Text>

        {returnOrder && (
          <div className="return-items-list mb-3">
            {returnOrder.items.map((it: OrderItem, idx) => {
              const key = it.variant || String(idx);
              const sel = it.variant ? returnSel[it.variant] : undefined;
              const disabled = !it.variant;
              return (
                <div key={key} className="return-line d-flex align-items-center gap-2 mb-2" style={{ opacity: disabled ? 0.5 : 1 }}>
                  <Checkbox
                    checked={!!sel?.checked}
                    disabled={disabled}
                    onChange={(e) => it.variant && setLineChecked(it.variant, e.target.checked)}
                  />
                  {it.image && <img src={it.image} alt={it.name} style={{ width: 40, height: 48, objectFit: "cover", borderRadius: 6 }} />}
                  <div className="flex-grow-1">
                    <Text strong className="d-block" style={{ fontSize: 13 }}>{it.name}</Text>
                    <Text type="secondary" className="small">
                      {it.size ? `Size: ${it.size} · ` : ""}Color: {it.color} · ₹{it.unitPrice.toLocaleString("en-IN")}
                    </Text>
                  </div>
                  <InputNumber
                    size="small"
                    min={1}
                    max={it.quantity}
                    value={sel?.quantity ?? it.quantity}
                    disabled={disabled || !sel?.checked}
                    onChange={(v) => it.variant && setLineQty(it.variant, Number(v) || 1, it.quantity)}
                    style={{ width: 64 }}
                  />
                  <Text type="secondary" className="small" style={{ whiteSpace: "nowrap" }}>/ {it.quantity}</Text>
                </div>
              );
            })}
          </div>
        )}

        <Form form={returnForm} layout="vertical">
          <Form.Item name="reason" label="Reason for return" rules={[{ required: true, message: "Please choose a reason" }]}>
            <Select placeholder="Select a reason" options={REASON_OPTIONS} />
          </Form.Item>
          <Form.Item name="reasonText" label="Additional details (optional)">
            <Input.TextArea rows={3} placeholder="Tell us more about the issue" maxLength={500} />
          </Form.Item>
        </Form>

        {/* Photos make a damage or wrong-item claim reviewable rather than a
            judgement call on wording alone. */}
        <div className="return-photos mb-3">
          <Text strong className="d-block mb-1">Add photos (optional)</Text>
          <Text type="secondary" className="d-block small mb-2">
            Up to 5 photos. These help us approve your request faster.
          </Text>
          <Image.PreviewGroup>
            <Upload
              listType="picture-card"
              fileList={uploadFileList}
              beforeUpload={(file) => handleUpload(file as unknown as File)}
              onRemove={(file) => {
                setReturnImages((prev) => prev.filter((_, i) => String(i) !== file.uid));
              }}
              accept="image/png,image/jpeg,image/webp"
            >
              {returnImages.length >= 5 ? null : (
                <div>
                  {uploading ? <SyncOutlined spin /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Image.PreviewGroup>
        </div>

        <Divider className="my-2" />
        <div className="d-flex justify-content-between refund-estimate-row">
          <Text strong>Estimated refund</Text>
          <Text strong>₹{returnEstimate(returnOrder).toLocaleString("en-IN")}</Text>
        </div>
      </Modal>
    </Card>
  );
};

export default MyOrders;
__CUS_EOF__
echo "   written"

# ─────────────────────────────────────────────────────────────────────────────
# 6. Order Confirmed page
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/features/checkout/OrderConfirmation.tsx"
cat > 'src/features/checkout/OrderConfirmation.tsx' <<'__CUS_EOF__'
import React from "react";
import { Card, Typography, Button, Divider } from "antd";
import {
  CheckCircleFilled, InboxOutlined, ShoppingOutlined, CarOutlined,
  FileDoneOutlined, HomeOutlined, MailOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import type { OrderResult } from "../../services/orderApi";

const { Title, Text } = Typography;

// The raw status is an API value ("confirmed"); printing it unmapped showed
// lowercase machine text on the customer's receipt screen.
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

const OrderConfirmation: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const order     = (location.state as any)?.order as OrderResult | undefined;

  const orderNumber       = order?.orderNumber ?? "—";
  const rawStatus         = order?.status ?? "confirmed";
  const status            = STATUS_LABELS[rawStatus] ?? rawStatus;
  const totalAmount       = order?.totalAmount;
  const estimatedDelivery = order?.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "5–7 business days";

  return (
    <div className="order-confirmation-wrapper">
      <div className="container py-5">
        <div className="confirmation-inner mx-auto text-center">
          {/* Success icon */}
          <div className="success-icon-container mb-4">
            <div className="outer-circle">
              <div className="inner-circle">
                <CheckCircleFilled className="check-icon" />
              </div>
            </div>
          </div>

          <Title level={1} className="serif-title mb-2">Order Confirmed!</Title>
          <Text type="secondary" className="sub-message d-block mb-5">
            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
          </Text>

          {/* Order summary */}
          <Card className="order-info-card mx-auto mb-4" variant="borderless">
            <div className="order-number-row d-flex align-items-center mb-4">
              <div className="package-icon-box">
                <InboxOutlined />
              </div>
              <div className="ms-3 text-start">
                <Text type="secondary" className="small d-block">Order Number</Text>
                <Text strong className="fs-5 order-number-value">{orderNumber}</Text>
              </div>
            </div>

            <Divider className="my-3" />

            <div className="detail-row d-flex justify-content-between align-items-center mb-3">
              <Text type="secondary">Order Status</Text>
              <span className="confirm-status-pill">
                <CheckCircleFilled />
                <span>{status}</span>
              </span>
            </div>

            <div className="detail-row d-flex justify-content-between align-items-center mb-3">
              <Text type="secondary">Estimated Delivery</Text>
              <Text strong>{estimatedDelivery}</Text>
            </div>

            {totalAmount != null && (
              <div className="detail-row total-row d-flex justify-content-between align-items-center">
                <Text type="secondary">Amount Paid</Text>
                <Text strong className="amount-paid">₹{totalAmount.toLocaleString("en-IN")}</Text>
              </div>
            )}
          </Card>

          {/* What happens next — sets expectations instead of leaving a dead end */}
          <Card className="next-steps-card mx-auto mb-5" variant="borderless">
            <Text strong className="d-block text-start mb-3">What happens next</Text>
            <div className="next-steps d-flex justify-content-between">
              <div className="next-step">
                <span className="next-step-icon is-done"><FileDoneOutlined /></span>
                <span className="next-step-label">Order placed</span>
              </div>
              <div className="next-step">
                <span className="next-step-icon"><InboxOutlined /></span>
                <span className="next-step-label">Packed</span>
              </div>
              <div className="next-step">
                <span className="next-step-icon"><CarOutlined /></span>
                <span className="next-step-label">Shipped</span>
              </div>
              <div className="next-step">
                <span className="next-step-icon"><HomeOutlined /></span>
                <span className="next-step-label">Delivered</span>
              </div>
            </div>
          </Card>

          {/* Action buttons */}
          <div className="action-buttons-row d-flex justify-content-center gap-3 mb-4 flex-wrap">
            <Button
              type="primary"
              className="track-btn"
              icon={<ShoppingOutlined />}
              onClick={() => navigate("/my-account/orders")}
            >
              Track Order
            </Button>
            <Button className="continue-btn" onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
          </div>

          <Text type="secondary" className="email-footer small">
            <MailOutlined /> A confirmation email has been sent to your registered email address.
          </Text>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
__CUS_EOF__
echo "   written"

# ─────────────────────────────────────────────────────────────────────────────
# 7. Styles
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/styles/layout/customer/account/_my-orders.scss"
cat > 'src/styles/layout/customer/account/_my-orders.scss' <<'__CUS_EOF__'
// My Orders — rebuilt.
//
// The previous version had no fills, shadows or accents anywhere, so every card
// rendered white-on-white and the Return button had no rule at all. This picks
// up the vocabulary already used by the checkout flow (tinted surfaces, soft
// shadows, 16-20px radii, an accented active state) so the account area matches
// the rest of the site.

$mo-primary: #8e2de2;
$mo-blue: #3b82f6;
$mo-surface: #f8fafc;
$mo-border: #eef2f6;
$mo-text: #111827;
$mo-muted: #6b7280;

.orders-container-card {
  background: transparent;

  .orders-head .section-title {
    font-weight: 600;
    color: $mo-text;
  }
}

// ─── Order card ─────────────────────────────────────────────────────────────
.order-item-card {
  border: 1px solid $mo-border !important;
  border-radius: 18px !important;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease;

  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
    border-color: rgba($mo-primary, 0.25) !important;
    transform: translateY(-2px);
  }

  .order-number {
    font-weight: 600;
    color: $mo-text;
  }

  .order-header {
    border-bottom: 1px dashed $mo-border;
    padding-bottom: 12px;
  }

  .order-footer {
    border-top: 1px solid $mo-border;
  }

  .total-price {
    font-size: 1.15rem;
    color: $mo-text;
  }
}

// ─── Thumbnails ─────────────────────────────────────────────────────────────
.product-thumbnails {
  .thumb-wrapper {
    width: 68px;
    height: 68px;
    border-radius: 12px;
    overflow: hidden;
    background: $mo-surface;
    border: 1px solid $mo-border;

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .thumb-more {
    width: 68px;
    height: 68px;
    border-radius: 12px;
    background: $mo-surface;
    border: 1px dashed #d8dee6;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $mo-muted;
    font-size: 0.85rem;
    font-weight: 600;
  }
}

// ─── Status pills ───────────────────────────────────────────────────────────
.order-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;

  .anticon { font-size: 0.85rem; }

  &.pill-pending    { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }
  &.pill-confirmed  { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
  &.pill-processing { background: #f5f3ff; color: #6d28d9; border-color: #ddd6fe; }
  &.pill-shipped    { background: #ecfeff; color: #0e7490; border-color: #a5f3fc; }
  &.pill-delivered  { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
  &.pill-cancelled  { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
  &.pill-return     { background: #fefce8; color: #a16207; border-color: #fde68a; }
  &.pill-returned   { background: #f3f4f6; color: #374151; border-color: #e5e7eb; }
}

// ─── Tracking ───────────────────────────────────────────────────────────────
.order-tracking {
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: 16px 4px 4px;

  &.cancelled-note {
    align-items: center;
    gap: 8px;
    color: #b91c1c;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 0.85rem;
  }

  .track-step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    min-width: 0;

    .track-marker {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .track-icon {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #f1f3f6;
      color: #9ca3af;
      border: 2px solid #fff;
      box-shadow: 0 0 0 1px $mo-border;
      z-index: 1;
      font-size: 0.9rem;
      transition: background 0.25s ease, color 0.25s ease;
    }

    // The connector sits behind the icons, running to the next step.
    .track-line {
      position: absolute;
      top: 50%;
      left: calc(50% + 20px);
      right: calc(-50% + 20px);
      height: 2px;
      background: #e8ebef;
      transform: translateY(-50%);
    }

    .track-label {
      margin-top: 8px;
      font-size: 0.76rem;
      font-weight: 600;
      color: $mo-muted;
    }

    .track-date {
      font-size: 0.7rem;
      color: #9ca3af;
    }

    &.is-done {
      .track-icon { background: rgba($mo-primary, 0.1); color: $mo-primary; box-shadow: 0 0 0 1px rgba($mo-primary, 0.25); }
      .track-line { background: rgba($mo-primary, 0.35); }
      .track-label { color: $mo-text; }
    }

    &.is-active .track-icon {
      background: $mo-primary;
      color: #fff;
      box-shadow: 0 0 0 4px rgba($mo-primary, 0.15);
    }
  }

  .track-eta {
    display: none;
  }
}

// ETA sits below the row rather than inside it.
.order-item-card .track-eta,
.drawer-tracking-panel .track-eta {
  display: inline-flex !important;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 14px;
  border-radius: 10px;
  background: #ecfeff;
  border: 1px solid #a5f3fc;
  color: #0e7490;
  font-size: 0.8rem;
  width: 100%;
}

.drawer-tracking-panel {
  background: $mo-surface;
  border: 1px solid $mo-border;
  border-radius: 14px;
  padding: 4px 8px 12px;
}

// ─── Buttons ────────────────────────────────────────────────────────────────
.return-order-btn {
  height: 40px;
  border-radius: 12px;
  font-weight: 600;
  color: $mo-primary;
  border-color: rgba($mo-primary, 0.4);
  background: rgba($mo-primary, 0.04);
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: #fff !important;
    background: $mo-primary !important;
    border-color: $mo-primary !important;
  }
}

.view-details-btn {
  height: 40px;
  border-radius: 12px;
  font-weight: 600;
  color: $mo-blue;
  border-color: rgba($mo-blue, 0.45);

  &:hover {
    color: #fff !important;
    background: $mo-blue !important;
    border-color: $mo-blue !important;
  }
}

.invoice-btn {
  height: 42px;
  border-radius: 12px;
  font-weight: 600;
}

// ─── Return status note ─────────────────────────────────────────────────────
.return-status-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #fefce8;
  border: 1px solid #fde68a;
  color: #a16207;
  font-size: 0.82rem;
}

// ─── Return modal ───────────────────────────────────────────────────────────
.return-request-modal {
  .return-line {
    padding: 8px;
    border: 1px solid $mo-border;
    border-radius: 12px;
    background: $mo-surface;
  }

  .return-photos {
    padding: 14px;
    border: 1px dashed #d8dee6;
    border-radius: 14px;
    background: $mo-surface;
  }

  .refund-estimate-row {
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba($mo-primary, 0.06);
    border: 1px solid rgba($mo-primary, 0.15);
  }
}

// ─── Responsive ─────────────────────────────────────────────────────────────
@media (max-width: 767.98px) {
  .order-item-card {
    border-radius: 14px !important;

    .order-footer { gap: 12px; }
  }

  .product-thumbnails {
    .thumb-wrapper,
    .thumb-more { width: 56px; height: 56px; }
  }

  .order-tracking {
    .track-step {
      .track-icon { width: 28px; height: 28px; font-size: 0.78rem; }
      .track-line { left: calc(50% + 17px); right: calc(-50% + 17px); }
      .track-label { font-size: 0.68rem; }
      .track-date { font-size: 0.64rem; }
    }
  }

  .order-actions {
    width: 100%;

    .return-order-btn,
    .view-details-btn { flex: 1; }
  }
}
__CUS_EOF__

echo "→ src/styles/page-components/_order-confirmation.scss"
cat > 'src/styles/page-components/_order-confirmation.scss' <<'__CUS_EOF__'
// Order Confirmed — reworked to match the checkout card language.

$oc-primary: #8e2de2;
$oc-green: #22c55e;
$oc-surface: #f8fafc;
$oc-border: #eef2f6;
$oc-text: #111827;
$oc-muted: #6b7280;

.order-confirmation-wrapper {
  min-height: 70vh;
  background: linear-gradient(180deg, #faf5ff 0%, #ffffff 45%);

  .confirmation-inner { max-width: 620px; }

  // ─── Success mark ─────────────────────────────────────────────────────────
  .success-icon-container {
    display: flex;
    justify-content: center;

    .outer-circle {
      width: 112px;
      height: 112px;
      border-radius: 50%;
      background: #f0fdf4;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: oc-pop 0.4s ease-out both;
    }

    .inner-circle {
      width: 78px;
      height: 78px;
      border-radius: 50%;
      background: #dcfce7;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .check-icon {
      font-size: 40px;
      color: $oc-green;
    }
  }

  .serif-title {
    font-weight: 600;
    color: $oc-text;
  }

  .sub-message {
    font-size: 1rem;
    color: $oc-muted;
  }

  // ─── Summary card ─────────────────────────────────────────────────────────
  .order-info-card {
    max-width: 520px;
    border-radius: 18px;
    background: #fff;
    border: 1px solid $oc-border !important;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.05);
    text-align: left;

    .package-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: rgba($oc-primary, 0.08);
      color: $oc-primary;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .order-number-value {
      color: $oc-text;
      letter-spacing: 0.4px;
    }

    .amount-paid {
      font-size: 1.1rem;
      color: $oc-text;
    }

    .total-row {
      padding-top: 12px;
      border-top: 1px dashed $oc-border;
    }
  }

  .confirm-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    background: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
  }

  // ─── What happens next ────────────────────────────────────────────────────
  .next-steps-card {
    max-width: 520px;
    border-radius: 18px;
    background: $oc-surface;
    border: 1px solid $oc-border !important;

    .next-steps { gap: 8px; }

    .next-step {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .next-step-icon {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border: 1px solid $oc-border;
      color: #9ca3af;

      &.is-done {
        background: rgba($oc-primary, 0.1);
        border-color: rgba($oc-primary, 0.3);
        color: $oc-primary;
      }
    }

    .next-step-label {
      font-size: 0.72rem;
      color: $oc-muted;
      text-align: center;
    }
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  .track-btn,
  .continue-btn {
    height: 48px;
    border-radius: 24px;
    padding-inline: 28px;
    font-weight: 600;
  }

  .track-btn {
    background: $oc-primary;
    border-color: $oc-primary;
    box-shadow: 0 6px 16px rgba($oc-primary, 0.28);

    // Literal rather than darken(): that function is deprecated in Dart Sass
    // and removed in 2.0, so this keeps the build warning-free.
    &:hover {
      background: #7a27c2 !important;
      border-color: #7a27c2 !important;
    }
  }

  .continue-btn {
    border-color: #d8dee6;
    color: $oc-text;

    &:hover {
      border-color: $oc-primary !important;
      color: $oc-primary !important;
    }
  }

  .email-footer {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: $oc-muted;
  }
}

@keyframes oc-pop {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

@media (max-width: 575.98px) {
  .order-confirmation-wrapper {
    .success-icon-container .outer-circle { width: 92px; height: 92px; }
    .success-icon-container .inner-circle { width: 64px; height: 64px; }
    .success-icon-container .check-icon { font-size: 32px; }

    .action-buttons-row .track-btn,
    .action-buttons-row .continue-btn { width: 100%; }

    .next-steps-card .next-step-label { font-size: 0.66rem; }
  }
}
__CUS_EOF__

# ─────────────────────────────────────────────────────────────────────────────
# 8. Returns page — replace the mock that never called the API
#
# The sidebar's "Returns" link pointed at a form that console.log'd and showed a
# success toast without submitting anything. Its reason values didn't even match
# the backend enum, and it advertised a 30-day policy against a 14-day default.
# Replaced with the customer's actual return history.
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/services/returnApi.ts (return history fields)"
node - <<'__CUS_EOF__'
const fs = require('fs');
const p = 'src/services/returnApi.ts';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('ReturnRecordItem')) { console.log('   already patched — skipping'); process.exit(0); }

const anchor = `export interface ReturnRecord {
  _id: string;
  returnNumber: string;
  orderNumber: string;
  reason: string;
  reasonText?: string;
  type: "return" | "exchange";
  amount: number;
  status: "pending" | "approved" | "rejected" | "processing" | "refunded";
  createdAt: string;
}`;
if (!s.includes(anchor)) { console.error('   ✖ anchor not found — aborting'); process.exit(1); }

s = s.replace(anchor, `export interface ReturnRecordItem {
  name: string;
  color?: string;
  size?: string;
  image?: string;
  quantity: number;
  lineTotal: number;
}

export interface ReturnRecord {
  _id: string;
  returnNumber: string;
  orderNumber: string;
  reason: string;
  reasonText?: string;
  type: "return" | "exchange";
  amount: number;
  // 'received' is a real backend state that was missing from this union.
  status: "pending" | "approved" | "received" | "rejected" | "processing" | "refunded";
  items?: ReturnRecordItem[];
  customerImages?: string[];
  refund?: { method?: string; amount?: number; at?: string | null };
  adminNote?: string;
  createdAt: string;
}`);

fs.writeFileSync(p, s);
console.log('   patched');
__CUS_EOF__

echo "→ src/pages/customer/account/ReturnRequest.tsx (now a real returns list)"
cat > 'src/pages/customer/account/ReturnRequest.tsx' <<'__CUS_EOF__'
import React, { useEffect, useState } from "react";
import { Card, Typography, Empty, Skeleton, message, Divider, Image, Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  ClockCircleOutlined, CheckCircleOutlined, SyncOutlined,
  CloseCircleOutlined, InboxOutlined, WalletOutlined,
} from "@ant-design/icons";
import { getMyReturns, type ReturnRecord } from "../../../services/returnApi";

const { Title, Text } = Typography;

/**
 * The customer's return history.
 *
 * This route previously rendered a mock form that never reached the API — it
 * logged to the console and reported success regardless. Returns are actually
 * raised from My Orders (where the order context lives), so the useful thing
 * here is the status of requests already made.
 */
const RETURN_STATUS_META: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pending:    { label: "Under review",      icon: <ClockCircleOutlined />, cls: "rpill-pending" },
  approved:   { label: "Approved",          icon: <CheckCircleOutlined />, cls: "rpill-approved" },
  received:   { label: "Item received",     icon: <InboxOutlined />,       cls: "rpill-approved" },
  processing: { label: "Refund in progress",icon: <SyncOutlined spin />,   cls: "rpill-processing" },
  refunded:   { label: "Refunded",          icon: <WalletOutlined />,      cls: "rpill-refunded" },
  rejected:   { label: "Not approved",      icon: <CloseCircleOutlined />, cls: "rpill-rejected" },
};

const statusMeta = (s: string) =>
  RETURN_STATUS_META[s] ?? { label: s, icon: <ClockCircleOutlined />, cls: "rpill-pending" };

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

const money = (n?: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

const ReturnRequest: React.FC = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReturns()
      .then((res) => setReturns(res.returns))
      .catch((err: any) =>
        message.error(err.response?.data?.message || "Failed to load your returns"),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="returns-container-card" variant="borderless">
      <div className="returns-head d-flex justify-content-between align-items-center mb-4">
        <Title level={3} className="section-title m-0">My Returns</Title>
        {!loading && returns.length > 0 && (
          <Text type="secondary" className="small">
            {returns.length} request{returns.length === 1 ? "" : "s"}
          </Text>
        )}
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : returns.length === 0 ? (
        <div className="returns-empty text-center py-4">
          <Empty description="You haven't requested any returns" />
          <Text type="secondary" className="d-block mt-2 mb-3 small">
            Returns are raised from a delivered order.
          </Text>
          <Button type="primary" onClick={() => navigate("/my-account/orders")}>
            Go to My Orders
          </Button>
        </div>
      ) : (
        returns.map((r) => {
          const meta = statusMeta(r.status);
          return (
            <Card key={r._id} className="return-item-card mb-4" variant="outlined">
              <div className="return-header d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Title level={5} className="m-0 return-number">{r.returnNumber}</Title>
                  <Text type="secondary" className="small">
                    Order #{r.orderNumber} · Requested {fmtDate(r.createdAt)}
                  </Text>
                </div>
                <span className={`return-status-pill ${meta.cls}`}>
                  {meta.icon}
                  <span>{meta.label}</span>
                </span>
              </div>

              {!!r.items?.length && (
                <div className="return-item-lines mb-3">
                  {r.items.map((it, idx) => (
                    <div key={idx} className="return-item-line d-flex align-items-center gap-3 mb-2">
                      {it.image && (
                        <img src={it.image} alt={it.name} className="return-line-thumb" />
                      )}
                      <div className="flex-grow-1">
                        <Text strong className="d-block" style={{ fontSize: 13 }}>{it.name}</Text>
                        <Text type="secondary" className="small">
                          {[it.color, it.size].filter(Boolean).join(" / ")} · Qty {it.quantity}
                        </Text>
                      </div>
                      <Text strong>{money(it.lineTotal)}</Text>
                    </div>
                  ))}
                </div>
              )}

              {!!r.customerImages?.length && (
                <div className="return-photos-row mb-3">
                  <Text type="secondary" className="small d-block mb-2">Your photos</Text>
                  <Image.PreviewGroup>
                    <div className="d-flex flex-wrap gap-2">
                      {r.customerImages.map((url, idx) => (
                        <Image
                          key={idx}
                          src={url}
                          alt={`Return photo ${idx + 1}`}
                          width={64}
                          height={64}
                          style={{ objectFit: "cover", borderRadius: 8 }}
                        />
                      ))}
                    </div>
                  </Image.PreviewGroup>
                </div>
              )}

              <Divider className="my-2" />

              <div className="return-footer d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <Text type="secondary" className="d-block small">Reason</Text>
                  <Text>{r.reason}</Text>
                </div>
                <div className="text-end">
                  <Text type="secondary" className="d-block small">
                    {r.status === "refunded" ? "Refunded" : "Expected refund"}
                  </Text>
                  <Text strong className="return-amount">
                    {money(r.status === "refunded" ? r.refund?.amount ?? r.amount : r.amount)}
                  </Text>
                </div>
              </div>

              {r.adminNote && (
                <div className="return-admin-note mt-3">
                  <Text type="secondary" className="small d-block mb-1">Note from our team</Text>
                  <Text>{r.adminNote}</Text>
                </div>
              )}
            </Card>
          );
        })
      )}
    </Card>
  );
};

export default ReturnRequest;
__CUS_EOF__
echo "   written"

echo "→ src/styles/layout/customer/account/_return-request.scss"
cat > 'src/styles/layout/customer/account/_return-request.scss' <<'__CUS_EOF__'
// My Returns — styled to match the rebuilt My Orders cards.

$rr-primary: #8e2de2;
$rr-surface: #f8fafc;
$rr-border: #eef2f6;
$rr-text: #111827;
$rr-muted: #6b7280;

.returns-container-card {
  background: transparent;

  .returns-head .section-title {
    font-weight: 600;
    color: $rr-text;
  }
}

.return-item-card {
  border: 1px solid $rr-border !important;
  border-radius: 18px !important;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
    border-color: rgba($rr-primary, 0.25) !important;
  }

  .return-number {
    font-weight: 600;
    color: $rr-text;
  }

  .return-header {
    border-bottom: 1px dashed $rr-border;
    padding-bottom: 12px;
  }

  .return-line-thumb {
    width: 44px;
    height: 52px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid $rr-border;
  }

  .return-amount { font-size: 1.05rem; }

  .return-admin-note {
    padding: 10px 14px;
    border-radius: 12px;
    background: $rr-surface;
    border: 1px solid $rr-border;
  }
}

.return-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;

  .anticon { font-size: 0.85rem; }

  &.rpill-pending    { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }
  &.rpill-approved   { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
  &.rpill-processing { background: #f5f3ff; color: #6d28d9; border-color: #ddd6fe; }
  &.rpill-refunded   { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
  &.rpill-rejected   { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
}

.returns-empty {
  background: $rr-surface;
  border: 1px dashed #d8dee6;
  border-radius: 16px;
}

@media (max-width: 767.98px) {
  .return-item-card {
    border-radius: 14px !important;

    .return-footer { gap: 12px; }
  }
}
__CUS_EOF__

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "✔ Customer client changes applied."
echo

cat <<'__NOTES__'
─────────────────────────────────────────────────────────────────────────
NOTES

  • Apply update-1-server-fixes.sh FIRST — this UI calls endpoints it adds
    (/assets/return-upload, /invoices/:orderId, order timeline + shippedAt,
     Razorpay customerId on the checkout handshake).

  • Saved cards additionally require card-saving to be enabled on your
    Razorpay account (Dashboard → Settings → Configuration). Passing
    customer_id is necessary but not sufficient on its own.

  • Expected-delivery dates are the server's estimate (shipped + 7 days),
    not courier data — swap SHIPPING_TRANSIT_DAYS for real Bluedart
    tracking when that integration lands.

  VERIFY THE BUILD:
     npm install && npm run build

  Rollback: original files are in the .customer-backup-* directory above.
─────────────────────────────────────────────────────────────────────────
__NOTES__
