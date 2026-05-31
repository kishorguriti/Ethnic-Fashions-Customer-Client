import React from "react";
import { Button, Carousel } from "antd";
import { ArrowRightOutlined, StarFilled, ShoppingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import type { Banner } from "../../types/banner";

// ── API-driven promotional banner ─────────────────────────────────────────────
const PromoBanner = ({ banner }: { banner: Banner }) => {
  const navigate = useNavigate();
  const isVideo  = banner.mediaType === "video" || !!banner.desktopVideo?.url;
  const videoUrl = banner.desktopVideo?.url;
  const imgUrl   = banner.desktopImage?.url;
  const hasMedia = isVideo ? !!videoUrl : !!imgUrl;

  return (
    <div
      className="promo-banner-wrapper"
      style={{
        position:           "relative",
        overflow:           "hidden",
        // Fixed height so absolute-positioned media has something to fill
        minHeight:          400,
        backgroundImage:    !isVideo && imgUrl ? `url(${imgUrl})` : undefined,
        backgroundSize:     "cover",
        backgroundPosition: banner.objectPosition || "center",
      }}
    >
      {/* ── Video background ── */}
      {isVideo && videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position:  "absolute",
            inset:     0,
            width:     "100%",
            height:    "100%",
            objectFit: "cover",
            zIndex:    0,
          }}
        />
      )}

      {/* ── Overlay ── */}
      {banner.overlayOpacity > 0 && (
        <div
          style={{
            position:   "absolute",
            inset:      0,
            background: `rgba(0,0,0,${banner.overlayOpacity})`,
            zIndex:     1,
          }}
        />
      )}

      {/* ── Content — strip the gradient bg when real media is present ── */}
      <section
        className="festive-hero shadow-lg"
        style={{
          position:   "relative",
          zIndex:     2,
          background: hasMedia ? "transparent" : undefined,
        }}
      >
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8" style={{ color: banner.textColor || "#fff" }}>
              <div className="icon-wrapper">
                <ShoppingOutlined />
              </div>

              {banner.badge && (
                <div className="badge-offer">
                  <StarFilled className="sparkle" />
                  <span>{banner.badge}</span>
                </div>
              )}

              <h1 className="title" style={{ color: banner.textColor || "#fff" }}>
                {banner.title}
              </h1>

              {banner.subtitle && (
                <p className="description" style={{ color: banner.textColor || "#fff", opacity: 0.9 }}>
                  {banner.subtitle}
                </p>
              )}

              {banner.ctaText && (
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined style={{ order: 1, marginLeft: 8 }} />}
                  onClick={() => navigate(banner.ctaLink || "/products")}
                >
                  {banner.ctaText}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ── Hardcoded fallback (shown when no promotional banners are active) ──────────
const FallbackPromo = () => {
  const navigate = useNavigate();
  return (
    <div className="container-fluid py-5 px-0">
      <section className="festive-hero shadow-lg">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8">
              <div className="icon-wrapper"><ShoppingOutlined /></div>
              <div className="badge-offer">
                <StarFilled className="sparkle" />
                <span>Limited Time Offer</span>
              </div>
              <h1 className="title">Festive Season Sale</h1>
              <h2 className="discount-text">Up to 30% Off</h2>
              <p className="description">
                Celebrate with style! Explore our exclusive festive collection
                with amazing discounts.
              </p>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined style={{ order: 1, marginLeft: 8 }} />}
                onClick={() => navigate("/products?sortBy=discount")}
              >
                Shop Festive Collection
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
const FestiveSaleBanner: React.FC = () => {
  const promotional = useAppSelector((s) => s.banners.promotional);

  if (!promotional.length) return <FallbackPromo />;

  if (promotional.length === 1) return <PromoBanner banner={promotional[0]} />;

  return (
    <Carousel
      autoplay
      autoplaySpeed={5000}
      infinite
      speed={700}
      pauseOnHover={false}
      dots={{ className: "hero-carousel-dots" }}
    >
      {promotional.map((b) => (
        <PromoBanner key={b._id} banner={b} />
      ))}
    </Carousel>
  );
};

export default FestiveSaleBanner;
