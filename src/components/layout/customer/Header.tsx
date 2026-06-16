import { Input, Badge, Space, Dropdown, Row, Col, Drawer, Button } from "antd";
import type { MenuProps } from "antd";
import {
  SearchOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  ProfileOutlined,
  MenuOutlined,
  CloseOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Logo from "../../../assets/svg/Aarna.svg";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, useCartSelector, useWishlistSelector } from "../../../hooks";
import { fetchCategories } from "../../../features/category/categorySlice";
import { logoutUser } from "../../../features/auth/authSlice";
import { resetCart } from "../../../features/cart/cartSlice";
import { resetWishlist } from "../../../features/wishlist/wishlistSlice";
import type { RootState } from "../../../store";
import type { Category } from "../../../types/category";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { totalItems: cartCount } = useCartSelector();
  const { total: wishlistCount }  = useWishlistSelector();
  const { tree: categories } = useSelector((state: RootState) => state.categories);
  const user = useSelector((state: RootState) => state.auth.user);

  const [openKey, setOpenKey]             = useState<string | null>(null);
  const [headerHidden, setHeaderHidden]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]       = useState(false);
  const [expandedCategory, setExpandedCategory]   = useState<string | null>(null);
  const lastScrollY  = useRef(0);
  const headerRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Measure real header height and expose as CSS variable used by layout + banner
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        const h = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty("--header-h", `${h}px`);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Hide on scroll-down, reveal on scroll-up
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setHeaderHidden(false);
      } else if (currentY > lastScrollY.current + 4) {
        setHeaderHidden(true);
      } else if (currentY < lastScrollY.current - 4) {
        setHeaderHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setExpandedCategory(null);
  };

  const handleSubcategoryClick = (slug: string) => {
    navigate(`/products?category=${slug}`);
    setOpenKey(null);
    closeMobileMenu();
  };

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      dispatch(resetCart());
      dispatch(resetWishlist());
      navigate("/login");
      closeMobileMenu();
    });
  };

  const userMenuItems: MenuProps["items"] = user
    ? [
        {
          key: "account",
          icon: <ProfileOutlined />,
          label: "My Account",
          onClick: () => navigate("/my-account"),
        },
        { type: "divider" },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Logout",
          onClick: handleLogout,
        },
      ]
    : [
        {
          key: "login",
          label: "Sign In",
          onClick: () => navigate("/login"),
        },
        {
          key: "register",
          label: "Create Account",
          onClick: () => navigate("/register"),
        },
      ];

  // Desktop mega-menu dropdown renderer
  const renderSubcategoryMenu = (category: Category) => {
    const subs = category.subcategories ?? [];
    if (subs.length === 0) return null;

    const colSize = Math.ceil(subs.length / 3);
    const cols: Category[][] = [];
    for (let i = 0; i < subs.length; i += colSize) {
      cols.push(subs.slice(i, i + colSize));
    }

    return (
      <div className="megaMenuCard">
        <Row gutter={32}>
          {cols.map((col, ci) => (
            <Col span={8} key={ci} className="menuColumn">
              {col.map((sub) => (
                <div
                  key={sub._id}
                  className="menuItem"
                  onClick={() => handleSubcategoryClick(sub.slug)}
                >
                  {sub.image?.url && (
                    <img
                      src={sub.image.url}
                      alt={sub.name}
                      className="menuItemThumb"
                    />
                  )}
                  {sub.name}
                </div>
              ))}
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  return (
    <>
      <div ref={headerRef} className={`stickyHeaderGroup${headerHidden ? " header--hidden" : ""}`}>
        {/* Top Banner */}
        <div className="topBanner">
          <div className="container d-flex justify-content-between align-items-center">
            <span>✨ Free Shipping on Orders Above ₹3000</span>
            <Space className="d-none d-sm-flex gap-3">
              <span className="cursor-pointer">
                EN <DownOutlined style={{ fontSize: 10 }} />
              </span>
              <span className="cursor-pointer">
                INR <DownOutlined style={{ fontSize: 10 }} />
              </span>
            </Space>
          </div>
        </div>

        {/* Main Header */}
        <header className="mainHeader">
          <div className="container">
            <div className="d-flex align-items-center justify-content-between">

              {/* Hamburger — mobile/tablet only */}
              <button
                className="mobile-menu-btn d-lg-none"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
              >
                <MenuOutlined />
              </button>

              <div className="logo">
                <NavLink to="/">
                  <img src={Logo} alt="logo" />
                </NavLink>
              </div>

              {/* Search — desktop only */}
              <div className="d-none d-lg-block w-75 px-4">
                <Input
                  size="large"
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Search for sarees, churidars, jewellery..."
                  className="rounded-pill"
                />
              </div>

              {/* Action icons */}
              <div className="header-actions">
                <NavLink to="/wishlist" style={{ color: "#45556C" }}>
                  <Badge count={wishlistCount} color="#f209a2">
                    <HeartOutlined style={{ fontSize: 20 }} />
                  </Badge>
                </NavLink>

                <NavLink to="/cart" style={{ color: "#45556C" }}>
                  <Badge count={cartCount} color="#f209a2">
                    <ShoppingCartOutlined style={{ fontSize: 20 }} />
                  </Badge>
                </NavLink>

                <Dropdown
                  menu={{ items: userMenuItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                  rootClassName="user-profile-dropdown"
                >
                  <span style={{ cursor: "pointer", color: "#45556C", display: "flex", alignItems: "center" }}>
                    <UserOutlined style={{ fontSize: 20 }} />
                    {user && (
                      <span className="d-none d-lg-inline ms-1" style={{ fontSize: 13 }}>
                        Hi, {user.name?.split(" ")[0] || user.phone.slice(-4)}
                      </span>
                    )}
                  </span>
                </Dropdown>
              </div>
            </div>
          </div>

          <span className="nav-links-horizental-line" />

          {/* Category Navigation — desktop only */}
          <div className="container d-none d-lg-block">
            <nav className="navLinks">
              {categories.map((cat) => {
                const hasSubs = (cat.subcategories ?? []).length > 0;
                const menu = renderSubcategoryMenu(cat);

                if (!hasSubs || !menu) {
                  return (
                    <span
                      key={cat._id}
                      className="navItem"
                      onClick={() => navigate(`/products?category=${cat.slug}`)}
                    >
                      {cat.name}
                    </span>
                  );
                }

                return (
                  <Dropdown
                    key={cat._id}
                    dropdownRender={() => menu}
                    trigger={["hover"]}
                    rootClassName="mega-dropdown-width"
                    open={openKey === cat._id}
                    onOpenChange={(flag) => setOpenKey(flag ? cat._id : null)}
                  >
                    <span className="navItem">
                      {cat.name}{" "}
                      <DownOutlined style={{ fontSize: 11 }} className="navlink-down-arrow" />
                    </span>
                  </Dropdown>
                );
              })}

              <NavLink to="/products">
                <span className="navItem">All Products</span>
              </NavLink>
              <NavLink to="/products?sortBy=newest">
                <span className="navItem">New Arrivals</span>
              </NavLink>
              <NavLink to="/customer-support">
                <span className="navItem">Support</span>
              </NavLink>
            </nav>
          </div>
        </header>
      </div>

      {/* ── Mobile Navigation Drawer ─────────────────────────────────────────── */}
      <Drawer
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        placement="left"
        width="85%"
        className="mobile-nav-drawer"
        closable={false}
        zIndex={1200}
        styles={{ body: { padding: 0 }, mask: { background: "rgba(0,0,0,0.55)" } }}
        style={{ maxWidth: 360 }}
      >
        <div className="mobile-drawer-inner">
          {/* Header */}
          <div className="mobile-drawer-header">
            <NavLink to="/" onClick={closeMobileMenu}>
              <img src={Logo} alt="logo" className="mobile-drawer-logo" />
            </NavLink>
            <button
              className="mobile-drawer-close"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <CloseOutlined />
            </button>
          </div>

          {/* Search */}
          <div className="mobile-drawer-search">
            <Input
              size="large"
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Search sarees, jewellery..."
              className="rounded-pill"
            />
          </div>

          {/* User info / Auth buttons */}
          {user ? (
            <div className="mobile-drawer-user">
              <div className="mobile-user-avatar">
                <UserOutlined />
              </div>
              <div>
                <div className="mobile-user-name">
                  Hi, {user.name?.split(" ")[0] || "User"}
                </div>
                <div className="mobile-user-sub">{user.email || user.phone}</div>
              </div>
            </div>
          ) : (
            <div className="mobile-drawer-auth">
              <Button
                type="primary"
                block
                className="mobile-auth-btn"
                onClick={() => { navigate("/login"); closeMobileMenu(); }}
              >
                Sign In
              </Button>
              <Button
                block
                className="mobile-auth-btn-outline"
                onClick={() => { navigate("/register"); closeMobileMenu(); }}
              >
                Create Account
              </Button>
            </div>
          )}

          {/* Category tree */}
          <div className="mobile-nav-list">
            {categories.map((cat) => {
              const hasSubs = (cat.subcategories ?? []).length > 0;
              const isExpanded = expandedCategory === cat._id;

              return (
                <div key={cat._id} className="mobile-nav-item-group">
                  <div
                    className="mobile-nav-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (hasSubs) {
                        setExpandedCategory(isExpanded ? null : cat._id);
                      } else {
                        navigate(`/products?category=${cat.slug}`);
                        closeMobileMenu();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (hasSubs) setExpandedCategory(isExpanded ? null : cat._id);
                        else { navigate(`/products?category=${cat.slug}`); closeMobileMenu(); }
                      }
                    }}
                  >
                    <span>{cat.name}</span>
                    {hasSubs && (
                      <RightOutlined
                        className={`mobile-nav-arrow${isExpanded ? " expanded" : ""}`}
                      />
                    )}
                  </div>

                  {hasSubs && isExpanded && (
                    <div className="mobile-nav-subcategories">
                      {(cat.subcategories ?? []).map((sub) => (
                        <div
                          key={sub._id}
                          className="mobile-nav-subitem"
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSubcategoryClick(sub.slug)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubcategoryClick(sub.slug);
                          }}
                        >
                          {sub.image?.url && (
                            <img
                              src={sub.image.url}
                              alt={sub.name}
                              className="mobile-sub-thumb"
                            />
                          )}
                          <span>{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Static nav items */}
            {[
              { label: "All Products",  path: "/products" },
              { label: "New Arrivals",  path: "/products?sortBy=newest" },
              { label: "Support",       path: "/customer-support" },
            ].map((item) => (
              <div
                key={item.path}
                className="mobile-nav-item"
                role="button"
                tabIndex={0}
                onClick={() => { navigate(item.path); closeMobileMenu(); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { navigate(item.path); closeMobileMenu(); }
                }}
              >
                <span>{item.label}</span>
              </div>
            ))}

            {/* Account link if logged in */}
            {user && (
              <div
                className="mobile-nav-item"
                role="button"
                tabIndex={0}
                onClick={() => { navigate("/my-account"); closeMobileMenu(); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { navigate("/my-account"); closeMobileMenu(); }
                }}
              >
                <span>My Account</span>
              </div>
            )}
          </div>

          {/* Logout */}
          {user && (
            <div className="mobile-drawer-footer">
              <button className="mobile-nav-item mobile-logout-btn" onClick={handleLogout}>
                <LogoutOutlined className="me-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default Header;
