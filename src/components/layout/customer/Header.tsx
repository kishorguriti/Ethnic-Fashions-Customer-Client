import { Input, Badge, Space, Dropdown, Row, Col } from "antd";
import type { MenuProps } from "antd";
import {
  SearchOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  ProfileOutlined,
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

  const [openKey, setOpenKey]   = useState<string | null>(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Hide on scroll-down, reveal on scroll-up
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setHeaderHidden(false);                          // always show near top
      } else if (currentY > lastScrollY.current + 4) {
        setHeaderHidden(true);                           // scrolling down
      } else if (currentY < lastScrollY.current - 4) {
        setHeaderHidden(false);                          // scrolling up
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubcategoryClick = (slug: string) => {
    navigate(`/products?category=${slug}`);
    setOpenKey(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      dispatch(resetCart());
      dispatch(resetWishlist());
      navigate("/login");
    });
  };

  // Build user account dropdown
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

  // Render subcategory dropdown for a top-level category
  const renderSubcategoryMenu = (category: Category) => {
    const subs = category.subcategories ?? [];
    if (subs.length === 0) return null;

    // Split into columns of 4
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
    <div className={`stickyHeaderGroup${headerHidden ? " header--hidden" : ""}`}>
      {/* Top Banner */}
      <div className="topBanner">
        <div className="container d-flex justify-content-between align-items-center">
          <span>✨ Free Shipping on Orders Above ₹3000</span>
          <Space className="d-flex gap-3">
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
            <div className="logo">
              <NavLink to="/">
                <img src={Logo} alt="logo" />
              </NavLink>
            </div>

            <div className="d-none d-lg-block w-75 px-4">
              <Input
                size="large"
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Search for sarees, churidars, jewellery..."
                className="rounded-pill"
              />
            </div>

            <Space size="large" className="text-secondary">
              <NavLink to="/wishlist" style={{ color: "#45556C" }}>
                <Badge count={wishlistCount} color="#f209a2" size="small">
                  <HeartOutlined className="fs-6" />
                </Badge>
              </NavLink>

              <NavLink to="/cart" style={{ color: "#45556C" }}>
                <Badge count={cartCount} color="#f209a2" size="small">
                  <ShoppingCartOutlined className="fs-6" />
                </Badge>
              </NavLink>

              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
                rootClassName="user-profile-dropdown"
              >
                <span style={{ cursor: "pointer", color: "#45556C" }}>
                  <UserOutlined className="fs-6" />
                  {user && (
                    <span className="d-none d-lg-inline ms-1" style={{ fontSize: 13 }}>
                      Hi, {user.name?.split(" ")[0] || user.phone.slice(-4)}
                    </span>
                  )}
                </span>
              </Dropdown>
            </Space>
          </div>
        </div>

        <span className="nav-links-horizental-line" />

        {/* Category Navigation */}
        <div className="container">
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
  );
};

export default Header;
