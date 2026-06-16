import React from "react";
import { Rate, Tag } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAuthSelector, useWishlistSelector } from "../../hooks";
import { addToCart } from "../cart/cartSlice";
import { toggleWishlist } from "../wishlist/wishlistSlice";
import type { Product } from "../../types/product";
import { message } from "antd";

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user }          = useAuthSelector();
  const { wishlistedIds, toggling } = useWishlistSelector();

  const displayVariant = product.variants?.[0];
  const displayImage   = displayVariant?.media?.[0]?.url;
  const tags           = Object.values(product.attributes || {})
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .slice(0, 2);

  const isWishlisted  = displayVariant ? wishlistedIds.includes(displayVariant._id) : false;
  const isToggling    = displayVariant ? toggling === displayVariant._id : false;

  // Use effectivePrice when available (offer applied), fall back to sellingPrice
  const displayPrice    = displayVariant?.effectivePrice ?? displayVariant?.sellingPrice ?? 0;
  const displayDiscount = displayVariant?.totalDiscount  ?? displayVariant?.discount ?? 0;

  // If the product has size variants, Quick Add should go to the detail page
  // so the customer can choose their size — not blindly add the first variant.
  const hasSizes = product.variants.some((v) => v.size);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!displayVariant) return;
    if (hasSizes) { navigate(`/products/${product.slug}`); return; }
    if (!user) { navigate("/login"); return; }
    dispatch(addToCart({ variantId: displayVariant._id, quantity: 1 }))
      .unwrap()
      .then(() => message.success("Added to cart!"))
      .catch((err: string) => message.error(err || "Failed to add to cart"));
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!displayVariant) return;
    if (!user) { navigate("/login"); return; }
    dispatch(toggleWishlist({ variantId: displayVariant._id, isWishlisted }));
  };

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.slug}`)}>
      <div className="image-container">
        {displayImage ? (
          <img src={displayImage} alt={product.name} />
        ) : (
          <div style={{ height: 280, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon icon="mdi:image-off" width="48" color="#ccc" />
          </div>
        )}

        <div className="badge-container">
          {displayDiscount > 0 && (
            <div className="discount-badge">{displayDiscount}% OFF</div>
          )}
          {displayVariant?.appliedOffer && (
            <div className="collection-badge" style={{ background: "#f209a2" }}>
              {displayVariant.appliedOffer.title}
            </div>
          )}
          {!displayVariant?.inStock && (
            <div className="collection-badge" style={{ background: "#999" }}>Out of Stock</div>
          )}
        </div>

        <button
          className="wishlist-btn"
          onClick={handleWishlist}
          disabled={isToggling}
          style={{ opacity: isToggling ? 0.5 : 1 }}
        >
          {isWishlisted
            ? <HeartFilled style={{ fontSize: "16px", color: "#f209a2" }} />
            : <HeartOutlined style={{ fontSize: "16px", color: "#666" }} />
          }
        </button>

        {displayVariant?.inStock && (
          <div className="quick-add-container px-3">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <Icon icon="system-uicons:cart" width="24" height="24" className="me-2" />
              {hasSizes ? "Select Size" : "Quick Add"}
            </button>
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="tags">
          {tags.map((tag, i) => (
            <Tag key={tag} className={`product-tags-cls ${i === 0 ? "first-child-tag" : ""}`}>
              {tag}
            </Tag>
          ))}
        </div>
        <div className="title special-font-cls fw-500">{product.name}</div>
        <Rate disabled defaultValue={0} style={{ fontSize: 12, marginBottom: 8 }} />
        <span style={{ color: "#999", fontSize: 12, marginLeft: 4 }}>(0)</span>

        {displayVariant && (
          <div className="price-section">
            <span className="current-price">₹{displayPrice.toLocaleString()}</span>
            {displayVariant.mrp > displayPrice && (
              <span className="old-price">₹{displayVariant.mrp.toLocaleString()}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
