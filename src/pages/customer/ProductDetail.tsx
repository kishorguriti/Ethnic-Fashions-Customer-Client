import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Row, Col, Breadcrumb, Tag, Button, Alert, Divider,
  Skeleton, Result, Tooltip, Image, message,
} from "antd";
import { ShoppingCartOutlined, HeartOutlined, HeartFilled } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { fetchProductBySlug, clearSelected } from "../../features/products/productSlice";
import { addToCart } from "../../features/cart/cartSlice";
import { toggleWishlist } from "../../features/wishlist/wishlistSlice";
import { getCategoryBySlug } from "../../services/categoryApi";
import { useAppDispatch, useAuthSelector, useWishlistSelector } from "../../hooks";
import type { RootState } from "../../store";

interface ParentCategory {
  name: string;
  slug: string;
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { selected: product, loading, error } = useSelector((state: RootState) => state.products);
  const { user }                              = useAuthSelector();
  const { wishlistedIds, toggling }           = useWishlistSelector();

  const [parentCategory, setParentCategory]   = useState<ParentCategory | null>(null);
  const [selectedColor, setSelectedColor]     = useState("");
  const [selectedSize, setSelectedSize]       = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [cartAdded, setCartAdded]             = useState(false);

  useEffect(() => {
    if (slug) dispatch(fetchProductBySlug(slug));
    return () => { dispatch(clearSelected()); };
  }, [slug, dispatch]);

  useEffect(() => {
    if (!product) return;

    const firstVariant = product.variants.find((v) => v.isActive) ?? product.variants[0];
    setSelectedColor(firstVariant?.color ?? "");
    setSelectedSize(firstVariant?.size ?? null);
    setActiveImageIndex(0);

    // Fetch subcategory to resolve the parent for the breadcrumb
    getCategoryBySlug(product.category.slug)
      .then((cat) => {
        // Backend populates parent as { name, slug } when fetching by slug
        const parent = cat.parent as unknown as ParentCategory | null;
        if (parent && typeof parent === "object") setParentCategory(parent);
      })
      .catch(() => {});
  }, [product]);

  const uniqueColors = useMemo(() => {
    if (!product) return [];
    const seen = new Set<string>();
    return product.variants
      .filter((v) => v.isActive)
      .reduce<string[]>((acc, v) => {
        if (!seen.has(v.color)) { seen.add(v.color); acc.push(v.color); }
        return acc;
      }, []);
  }, [product]);

  // Standard size order — variants come back in DB insertion order, not size order
  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  const sizesForColor = useMemo(() => {
    if (!product) return [];
    const seen = new Set<string>();
    const sizes: string[] = [];
    product.variants
      .filter((v) => v.isActive && v.color === selectedColor && v.size)
      .forEach((v) => {
        if (!seen.has(v.size!)) { seen.add(v.size!); sizes.push(v.size!); }
      });
    return sizes.sort((a, b) => {
      const ai = SIZE_ORDER.indexOf(a);
      const bi = SIZE_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    if (sizesForColor.length > 0) {
      return (
        product.variants.find(
          (v) => v.isActive && v.color === selectedColor && v.size === selectedSize
        ) ?? null
      );
    }
    return product.variants.find((v) => v.isActive && v.color === selectedColor) ?? null;
  }, [product, selectedColor, selectedSize, sizesForColor]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Keep current size if available in the new color, otherwise fall back to first available
    const sameSize = selectedSize
      ? product?.variants.find((v) => v.isActive && v.color === color && v.size === selectedSize)?.size
      : null;
    const fallback = product?.variants.find((v) => v.isActive && v.color === color && v.size)?.size ?? null;
    setSelectedSize(sameSize ?? fallback);
    setActiveImageIndex(0);
  };

  const isWishlisted = selectedVariant ? wishlistedIds.includes(selectedVariant._id) : false;
  const isToggling   = selectedVariant ? toggling === selectedVariant._id : false;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    if (!user) { navigate("/login"); return; }
    dispatch(addToCart({ variantId: selectedVariant._id, quantity: 1 }))
      .unwrap()
      .then(() => { setCartAdded(true); message.success("Added to cart!"); setTimeout(() => setCartAdded(false), 2000); })
      .catch((err: string) => message.error(err || "Failed to add to cart"));
  };

  const handleWishlist = () => {
    if (!selectedVariant) return;
    if (!user) { navigate("/login"); return; }
    dispatch(toggleWishlist({ variantId: selectedVariant._id, isWishlisted }))
      .unwrap()
      .then(() => message.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist!"))
      .catch((err: string) => message.error(err || "Wishlist action failed"));
  };

  if (loading) {
    return (
      <div className="container py-5">
        <Row gutter={40}>
          <Col lg={12} xs={24}><Skeleton.Image active style={{ width: "100%", height: 480 }} /></Col>
          <Col lg={12} xs={24}><Skeleton active paragraph={{ rows: 10 }} /></Col>
        </Row>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Result
        status="404"
        title="Product not found"
        subTitle="This product may no longer be available."
        extra={<Button type="primary" onClick={() => navigate("/products")}>Browse Products</Button>}
      />
    );
  }

  const media = selectedVariant?.media ?? [];

  const breadcrumbItems = [
    { title: <Link to="/">Home</Link> },
    ...(parentCategory
      ? [{ title: <Link to={`/products?category=${parentCategory.slug}`}>{parentCategory.name}</Link> }]
      : []),
    { title: <Link to={`/products?category=${product.category.slug}`}>{product.category.name}</Link> },
    { title: product.name },
  ];

  return (
    <div className="container product-detail-container py-4">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />

      <Row gutter={[40, 32]}>
        {/* ── Image Gallery ── */}
        <Col lg={12} md={12} xs={24}>
          <div className="product-gallery">
            <div className="gallery-main">
              {media.length === 0 ? (
                <div className="gallery-placeholder">
                  <Icon icon="mdi:image-off" width="64" color="#ccc" />
                </div>
              ) : media[activeImageIndex]?.resourceType === "video" ? (
                <video
                  src={media[activeImageIndex].url}
                  controls
                  className="gallery-main-media"
                />
              ) : (
                <Image
                  src={media[activeImageIndex]?.url}
                  alt={product.name}
                  className="gallery-main-media"
                  preview={{ mask: "Zoom" }}
                />
              )}
            </div>

            {media.length > 1 && (
              <div className="gallery-thumbs">
                {media.map((m, i) => (
                  <div
                    key={m._id}
                    className={`gallery-thumb ${i === activeImageIndex ? "active" : ""}`}
                    onClick={() => setActiveImageIndex(i)}
                  >
                    {m.resourceType === "video" ? (
                      <Icon icon="mdi:play-circle-outline" width="36" color="#666" />
                    ) : (
                      <img src={m.url} alt={`view ${i + 1}`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>

        {/* ── Product Info ── */}
        <Col lg={12} md={12} xs={24}>
          <div className="product-info-panel">
            <h1 className="product-detail-name special-font-cls">{product.name}</h1>

            {selectedVariant && (
              <p className="text-muted small mb-1">SKU: {selectedVariant.sku}</p>
            )}

            {/* Price block */}
            {selectedVariant && (
              <div className="product-detail-price">
                <span className="price-current">
                  ₹{(selectedVariant.effectivePrice ?? selectedVariant.sellingPrice).toLocaleString()}
                </span>
                {selectedVariant.mrp > (selectedVariant.effectivePrice ?? selectedVariant.sellingPrice) && (
                  <>
                    <span className="price-mrp">₹{selectedVariant.mrp.toLocaleString()}</span>
                    <Tag color="volcano">
                      {selectedVariant.totalDiscount ?? selectedVariant.discount}% OFF
                    </Tag>
                  </>
                )}
                {selectedVariant.appliedOffer && (
                  <Tag color="magenta" className="ms-1">{selectedVariant.appliedOffer.title}</Tag>
                )}
                {(selectedVariant.offerSaving ?? 0) > 0 && (
                  <div style={{ fontSize: 13, color: "#52c41a", marginTop: 4 }}>
                    You save ₹{selectedVariant.offerSaving!.toLocaleString()} with this offer
                  </div>
                )}
              </div>
            )}

            {/* Stock alert */}
            {selectedVariant && !selectedVariant.inStock && (
              <Alert message="Out of Stock" type="warning" showIcon className="mt-2 mb-1" />
            )}

            <Divider />

            {/* Color swatches */}
            <div className="selector-section">
              <p className="selector-label">
                Color: <strong>{selectedColor}</strong>
              </p>
              <div className="color-swatches">
                {uniqueColors.map((color) => {
                  const variant = product.variants.find((v) => v.color === color && v.isActive);
                  return (
                    <Tooltip title={color} key={color}>
                      <div
                        className={`color-swatch ${selectedColor === color ? "active" : ""} ${!variant?.inStock ? "out-of-stock" : ""}`}
                        style={{ background: color.toLowerCase() }}
                        onClick={() => handleColorSelect(color)}
                      />
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Size selector */}
            {sizesForColor.length > 0 && (
              <div className="selector-section">
                <p className="selector-label">
                  Size: <strong>{selectedSize}</strong>
                </p>
                <div className="size-options">
                  {sizesForColor.map((size) => {
                    const v = product.variants.find(
                      (x) => x.color === selectedColor && x.size === size
                    );
                    return (
                      <div
                        key={size}
                        className={`size-chip ${selectedSize === size ? "active" : ""} ${!v?.inStock ? "out-of-stock" : ""}`}
                        onClick={() => v?.inStock && setSelectedSize(size)}
                      >
                        {size}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="cta-row mt-4">
              <Button
                type="primary"
                size="large"
                className="btnPrimary btn-add-cart"
                disabled={!selectedVariant?.inStock}
                onClick={handleAddToCart}
                icon={<ShoppingCartOutlined />}
              >
                {cartAdded ? "Added to Cart!" : "Add to Cart"}
              </Button>
              <Button
                size="large"
                icon={isWishlisted
                  ? <HeartFilled style={{ color: "#f209a2" }} />
                  : <HeartOutlined />
                }
                className="btn-wishlist"
                loading={isToggling}
                onClick={handleWishlist}
              />
            </div>

            <Divider />

            {/* Product attributes table */}
            {Object.keys(product.attributes).length > 0 && (
              <div className="product-attributes">
                <h6 className="mb-3">Product Details</h6>
                <table className="attributes-table">
                  <tbody>
                    {Object.entries(product.attributes).map(([key, value]) => (
                      <tr key={key}>
                        <td className="attr-key">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </td>
                        <td className="attr-value">
                          {Array.isArray(value) ? value.join(", ") : value}
                        </td>
                      </tr>
                    ))}
                    {product.brand && (
                      <tr>
                        <td className="attr-key">Brand</td>
                        <td className="attr-value">{product.brand}</td>
                      </tr>
                    )}
                    {product.tags.length > 0 && (
                      <tr>
                        <td className="attr-key">Tags</td>
                        <td className="attr-value">
                          <div className="d-flex flex-wrap gap-1">
                            {product.tags.map((t) => (
                              <Tag key={t}>{t}</Tag>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mt-3">
                <h6>Description</h6>
                <p className="text-muted lh-lg">{product.description}</p>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail;
