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
