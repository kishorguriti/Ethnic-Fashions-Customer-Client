import { useEffect } from "react";
import { Button, Carousel, Skeleton } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchAllBanners } from "../../features/banners/bannerSlice";
import type { Banner } from "../../types/banner";

// ── Fallback shown before banners load or if none are seeded ─────────────────
const FallbackSlide = () => {
  const navigate = useNavigate();
  return (
    <div className="heroContainer">
      <div className="heroBody d-flex align-items-center">
        <div className="col-lg-6">
          <div className="weddingBadge">✨ Wedding Collection 2026</div>
          <h1 className="title">Your Style,<br />Redefined</h1>
          <p className="description">
            Discover handcrafted ethnic fashion that blends tradition with
            contemporary elegance. From sarees to jewellery, find your perfect look.
          </p>
          <div className="d-flex gap-3 mb-5">
            <Button
              type="primary" size="large" shape="round"
              className="hero-explore-collection-btn"
              onClick={() => navigate("/products")}
            >
              Explore Collection <ArrowRightOutlined />
            </Button>
            <Button
              ghost size="large" shape="round"
              className="new-arrivals-btn"
              onClick={() => navigate("/products?sortBy=newest")}
            >
              New Arrivals
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Single carousel slide ────────────────────────────────────────────────────
const HeroSlide = ({ banner }: { banner: Banner }) => {
  const navigate = useNavigate();
  const isVideo  = banner.mediaType === "video" || !!banner.desktopVideo?.url;
  const videoUrl = banner.desktopVideo?.url;
  const imgUrl   = banner.desktopImage?.url;

  const objectPos = banner.objectPosition || "center";

  return (
    <div
      className="heroBannerSlide"
      style={{
        position:           "relative",
        height:             "calc(100vh - var(--header-h, 170px))",
        minHeight:          400,
        backgroundImage:    !isVideo && imgUrl ? `url(${imgUrl})` : undefined,
        backgroundSize:     "cover",
        backgroundPosition: objectPos,
        display:            "flex",
        alignItems:         "center",
        overflow:           "hidden",
      }}
    >
      {/* Video background */}
      {isVideo && videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position:       "absolute",
            inset:          0,
            width:          "100%",
            height:         "100%",
            objectFit:      "cover",
            objectPosition: objectPos,
            zIndex:         0,
          }}
        />
      )}

      {/* Dark overlay for text readability */}
      {banner.overlayOpacity > 0 && (
        <div
          style={{
            position:      "absolute",
            inset:         0,
            background:    `rgba(0,0,0,${banner.overlayOpacity})`,
            pointerEvents: "none",
            zIndex:        1,
          }}
        />
      )}

      <div
        className="container"
        style={{ position: "relative", zIndex: 2, color: banner.textColor || "#fff" }}
      >
        <div className="row">
          <div className="col-lg-7 col-md-9">
            {banner.badge && (
              <div
                className="weddingBadge mb-3"
                style={{ color: banner.textColor, borderColor: banner.textColor, opacity: 0.9 }}
              >
                {banner.badge}
              </div>
            )}

            <h1
              className="title mb-3"
              style={{ color: banner.textColor, fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.15 }}
            >
              {banner.title}
            </h1>

            {banner.subtitle && (
              <p
                className="description mb-4"
                style={{ color: banner.textColor, opacity: 0.88, maxWidth: 520 }}
              >
                {banner.subtitle}
              </p>
            )}

            <div className="d-flex gap-3 flex-wrap">
              {banner.ctaText && (
                <Button
                  type="primary" size="large" shape="round"
                  className="hero-explore-collection-btn"
                  onClick={() => navigate(banner.ctaLink || "/products")}
                >
                  {banner.ctaText} <ArrowRightOutlined />
                </Button>
              )}
              {banner.secondaryCtaText && (
                <Button
                  ghost size="large" shape="round"
                  className="new-arrivals-btn"
                  style={{ borderColor: banner.textColor, color: banner.textColor }}
                  onClick={() => navigate(banner.secondaryCtaLink || "/products")}
                >
                  {banner.secondaryCtaText}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const HeroBanner = () => {
  const dispatch = useAppDispatch();
  const { hero, loading } = useAppSelector((s) => s.banners);

  useEffect(() => {
    dispatch(fetchAllBanners());
  }, [dispatch]);

  if (loading) {
    return (
      <Skeleton.Image
        active
        style={{ width: "100%", height: 500, borderRadius: 0 }}
      />
    );
  }

  if (!hero.length) return <FallbackSlide />;

  // Single banner — no need for carousel controls
  if (hero.length === 1) return <HeroSlide banner={hero[0]} />;

  return (
    <Carousel
      autoplay
      autoplaySpeed={6000}
      infinite
      speed={700}
      pauseOnHover={false}
      dots={{ className: "hero-carousel-dots" }}
    >
      {hero.map((b) => (
        <HeroSlide key={b._id} banner={b} />
      ))}
    </Carousel>
  );
};

export default HeroBanner;
