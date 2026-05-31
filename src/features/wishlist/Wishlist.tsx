import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Tag, Typography, Spin, message } from "antd";
import { HeartFilled, ShoppingCartOutlined } from "@ant-design/icons";
import { useAppDispatch, useWishlistSelector } from "../../hooks";
import { toggleWishlist } from "./wishlistSlice";
import { addToCart } from "../cart/cartSlice";

const { Text, Title } = Typography;

const Wishlist: React.FC = () => {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const { items, total, loading, toggling } = useWishlistSelector();

  const handleRemove = (variantId: string) => {
    dispatch(toggleWishlist({ variantId, isWishlisted: true }))
      .then(() => message.success("Removed from wishlist"));
  };

  const handleAddToCart = (variantId: string) => {
    dispatch(addToCart({ variantId, quantity: 1 }))
      .unwrap()
      .then(() => message.success("Added to cart!"))
      .catch((err: string) => message.error(err || "Failed to add to cart"));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="wishlist-container container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <Title level={2} className="m-0">
          My Wishlist
          <Text type="secondary" className="ms-2 fs-6 fw-normal">({total} item{total !== 1 ? "s" : ""})</Text>
        </Title>
      </div>

      {!items.length ? (
        <div className="empty-state-content text-center d-flex flex-column align-items-center my-4 py-4">
          <p className="empty-message mb-4">Your wishlist is empty</p>
          <Button type="primary" size="large" onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="row g-3">
          {items.map((item) => {
            const v          = item.variant;
            const hasOffer   = v.offerSaving > 0;
            const isRemoving = toggling === v._id;

            return (
              <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={item._id}>
                <Card
                  className="h-100"
                  bordered={false}
                  cover={
                    <div style={{ position: "relative" }}>
                      <img
                        src={v.media[0]?.url}
                        alt={item.product.name}
                        style={{ width: "100%", height: 240, objectFit: "cover", cursor: "pointer" }}
                        onClick={() => navigate(`/products/${item.product.slug}`)}
                      />
                      {hasOffer && (
                        <div
                          className="discount-badge"
                          style={{ position: "absolute", top: 8, left: 8 }}
                        >
                          {v.offerSaving > 0 ? `Save ₹${v.offerSaving}` : `${v.totalDiscount ?? v.discount}% OFF`}
                        </div>
                      )}
                      <Button
                        type="text"
                        className="wishlist-btn"
                        style={{ position: "absolute", top: 8, right: 8, background: "white", borderRadius: "50%" }}
                        loading={isRemoving}
                        icon={<HeartFilled style={{ color: "#f209a2" }} />}
                        onClick={() => handleRemove(v._id)}
                      />
                    </div>
                  }
                  actions={[
                    <Button
                      key="cart"
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      disabled={!v.inStock}
                      onClick={() => handleAddToCart(v._id)}
                    >
                      {v.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>,
                  ]}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => navigate(`/products/${item.product.slug}`)}
                  >
                    <Text strong className="d-block" style={{ fontSize: 14 }}>
                      {item.product.name}
                    </Text>
                    <Text type="secondary" className="small d-block mb-1">
                      {v.size ? `${v.size} | ` : ""}{v.color}
                    </Text>
                    {item.product.brand && (
                      <Tag className="mb-2">{item.product.brand}</Tag>
                    )}

                    <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                      <Text strong>₹{v.effectivePrice?.toLocaleString() ?? v.sellingPrice.toLocaleString()}</Text>
                      {v.mrp > (v.effectivePrice ?? v.sellingPrice) && (
                        <Text delete type="secondary" className="small">
                          ₹{v.mrp.toLocaleString()}
                        </Text>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
