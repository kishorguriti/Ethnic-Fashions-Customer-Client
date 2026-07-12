import React, { useEffect, useState } from "react";
import { Card, Typography, Tag, Button, Space, Empty, Skeleton, Drawer, Descriptions, Divider, message, Popconfirm, Modal, Form, Select, Input, Checkbox, InputNumber } from "antd";
import { getMyOrders, getOrder, cancelOrder } from "../../../services/orderApi";
import type { Order, OrderItem } from "../../../services/orderApi";
import { requestReturn, REASON_OPTIONS, type ReturnReason } from "../../../services/returnApi";

const { Title, Text } = Typography;

const statusColor = (status: string) => {
  switch (status) {
    case "delivered": return "success";
    case "shipped":
    case "processing":
    case "confirmed": return "processing";
    case "cancelled":
    case "returned": return "error";
    default: return "default";
  }
};

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

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

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Return request modal
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnForm] = Form.useForm();
  // Per-line selection: keyed by variant id → { checked, quantity }
  const [returnSel, setReturnSel] = useState<Record<string, { checked: boolean; quantity: number }>>({});

  const openReturn = (order: Order) => {
    returnForm.resetFields();
    const sel: Record<string, { checked: boolean; quantity: number }> = {};
    order.items.forEach((it) => {
      if (it.variant) sel[it.variant] = { checked: true, quantity: it.quantity };
    });
    setReturnSel(sel);
    setReturnOpen(true);
  };

  const setLineChecked = (variant: string, checked: boolean) =>
    setReturnSel((prev) => ({ ...prev, [variant]: { ...prev[variant], checked } }));

  const setLineQty = (variant: string, quantity: number) =>
    setReturnSel((prev) => ({ ...prev, [variant]: { ...prev[variant], quantity } }));

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

  const canCancel = (o: Order) => !["shipped", "delivered", "cancelled", "returned"].includes(o.status);
  const canReturn = (o: Order) => o.status === "delivered";

  const submitReturn = async () => {
    if (!detail) return;
    try {
      const values = await returnForm.validateFields();

      // Collect the selected lines.
      const selectedItems = detail.items
        .filter((it) => it.variant && returnSel[it.variant]?.checked && returnSel[it.variant]?.quantity > 0)
        .map((it) => ({ variant: it.variant as string, quantity: returnSel[it.variant!].quantity }));

      if (selectedItems.length === 0) {
        message.warning("Select at least one item to return");
        return;
      }

      // If every line is fully selected, omit `items` for a clean whole-order return.
      const allFull =
        selectedItems.length === detail.items.length &&
        detail.items.every((it) => it.variant && returnSel[it.variant]?.quantity === it.quantity);

      setReturnLoading(true);
      await requestReturn({
        orderId: detail._id,
        reason: values.reason as ReturnReason,
        reasonText: values.reasonText || undefined,
        items: allFull ? undefined : selectedItems,
      });
      message.success("Return request submitted. We'll review it shortly.");
      setReturnOpen(false);
      returnForm.resetFields();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation
      message.error(err.response?.data?.message || "Could not submit return request");
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <Card className="orders-container-card" bordered={false}>
      <Title level={3} className="section-title mb-4">My Orders</Title>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : orders.length === 0 ? (
        <Empty description="You haven't placed any orders yet" />
      ) : (
        orders.map((order) => (
          <Card key={order._id} className="order-item-card mb-4" bordered>
            <div className="order-header d-flex justify-content-between align-items-start mb-3">
              <div>
                <Title level={5} className="m-0">Order #{order.orderNumber}</Title>
                <Text type="secondary">Placed on {fmtDate(order.createdAt)}</Text>
              </div>
              <Tag color={statusColor(order.status)} className="status-tag">{cap(order.status)}</Tag>
            </div>

            <div className="product-thumbnails mb-4">
              <Space size="middle">
                {order.items.slice(0, 4).map((it, idx) =>
                  it.image ? (
                    <div key={idx} className="thumb-wrapper">
                      <img src={it.image} alt={it.name} />
                    </div>
                  ) : null
                )}
                {order.items.length > 4 && <Text type="secondary">+{order.items.length - 4} more</Text>}
              </Space>
            </div>

            <div className="order-footer d-flex justify-content-between align-items-center pt-3">
              <div>
                <Text type="secondary" className="d-block small">Total Amount</Text>
                <Text strong className="total-price">₹{order.total.toLocaleString("en-IN")}</Text>
                <Text type="secondary" className="d-block small">{paymentLabel(order)}</Text>
              </div>
              <Button className="view-details-btn" onClick={() => openDetails(order._id)}>View Details</Button>
            </div>
          </Card>
        ))
      )}

      <Drawer
        title={detail ? `Order #${detail.orderNumber}` : "Order details"}
        open={detailLoading || !!detail}
        onClose={() => setDetail(null)}
        width={480}
      >
        {detailLoading || !detail ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Status"><Tag color={statusColor(detail.status)}>{cap(detail.status)}</Tag></Descriptions.Item>
              <Descriptions.Item label="Placed on">{fmtDate(detail.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Estimated delivery">{fmtDate(detail.estimatedDelivery)}</Descriptions.Item>
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

            {canCancel(detail) && (
              <Popconfirm title="Cancel this order?" description="Paid online orders are automatically refunded." okText="Yes, cancel" onConfirm={() => handleCancel(detail._id)}>
                <Button danger block className="mt-4" loading={cancelling}>Cancel Order</Button>
              </Popconfirm>
            )}

            {canReturn(detail) && (
              <Button block className="mt-3" onClick={() => openReturn(detail)}>
                Request Return
              </Button>
            )}
          </>
        )}
      </Drawer>

      <Modal
        open={returnOpen}
        title={detail ? `Return — Order #${detail.orderNumber}` : "Request Return"}
        okText="Submit Request"
        confirmLoading={returnLoading}
        onCancel={() => { setReturnOpen(false); returnForm.resetFields(); }}
        onOk={submitReturn}
        destroyOnClose
      >
        <Text type="secondary" className="d-block mb-3">
          Select the items you want to return. Approved returns are refunded to your original payment method.
        </Text>

        {detail && (
          <div className="return-items-list mb-3">
            {detail.items.map((it: OrderItem, idx) => {
              const key = it.variant || String(idx);
              const sel = it.variant ? returnSel[it.variant] : undefined;
              const disabled = !it.variant;
              return (
                <div key={key} className="d-flex align-items-center gap-2 mb-2" style={{ opacity: disabled ? 0.5 : 1 }}>
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
                    onChange={(v) => it.variant && setLineQty(it.variant, Number(v) || 1)}
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

        <Divider className="my-2" />
        <div className="d-flex justify-content-between">
          <Text strong>Estimated refund</Text>
          <Text strong>₹{returnEstimate(detail).toLocaleString("en-IN")}</Text>
        </div>
      </Modal>
    </Card>
  );
};

export default MyOrders;
