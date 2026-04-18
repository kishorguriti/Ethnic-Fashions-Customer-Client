import type { MenuProps } from "antd";
import { Input, Badge, Dropdown, Space, Row, Col } from "antd";
import {
  SearchOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DownOutlined,
} from "@ant-design/icons";
import Logo from "../../../assets/svg/Aarna.svg";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCartSelector } from "../../../hooks";

const sareeCategories = [
  {
    title: "By Fabric",
    items: [
      { label: "Silk", icon: "✨" },
      { label: "Cotton", icon: "🌿" },
      { label: "Georgette", icon: "💫" },
      { label: "Chiffon", icon: "🎀" },
      { label: "Organza", icon: "🦋" },
      { label: "Linen", icon: "🌾" },
    ],
  },
  {
    title: "By Occasion",
    items: [
      { label: "Wedding", icon: "🏰" },
      { label: "Festival", icon: "🪔" },
      { label: "Party", icon: "💃" },
      { label: "Casual", icon: "☕" },
    ],
  },
  {
    title: "By Region",
    items: [
      { label: "Banarasi", icon: "🕉️" },
      { label: "Paithani", icon: "👑" },
      { label: "Kanjivaram", icon: "🌸" },
      { label: "Bandhani", icon: "🏮" },
    ],
  },
];
const churidarData = [
  {
    title: "By Style",
    items: [
      { label: "Anarkali", icon: "👗" }, // Replace with your SVG/PNG icons
      { label: "Straight", icon: "📏" },
      { label: "Flared", icon: "💃" },
    ],
  },
  {
    title: "By Fabric",
    items: [
      { label: "Cotton", icon: "🌱" },
      { label: "Silk", icon: "✨" },
      { label: "Georgette", icon: "🧣" },
      { label: "Cotton Silk", icon: "🎀" },
    ],
  },
  {
    title: "By Occasion",
    items: [
      { label: "Casual", icon: "☕" },
      { label: "Party", icon: "🎉" },
      { label: "Wedding", icon: "💍" },
      { label: "Festival", icon: "🪔" },
    ],
  },
];
const jewelleryData = [
  {
    title: "By Type",
    items: [
      { label: "Necklace", icon: "📿" },
      { label: "Earrings", icon: "💎" },
      { label: "Rings", icon: "💍" },
      { label: "Bracelets", icon: "✨" },
    ],
  },
  {
    title: "By Metal",
    items: [
      { label: "Gold", icon: "🪙" },
      { label: "Silver", icon: "🥈" },
      { label: "Platinum", icon: "⚪" },
    ],
  },
  {
    title: "By Collection",
    items: [
      { label: "Bridal", icon: "👰" },
      { label: "Temple", icon: "🛕" },
      { label: "Premium", icon: "⭐" },
      { label: "Festive", icon: "🏮" },
    ],
  },
];

const Header = () => {
  // Custom Mega Menu Renderer
  const navigate = useNavigate();

  const cartList = useCartSelector();
  console.log(cartList, "cartList");

  const [openKey, setOpenKey] = useState<string | null>(null);

  const handleClickMenuItem = () => {
    // 1. Your navigation logic here (e.g., navigate('/path'))
    console.log("Item clicked");
    navigate("/products");
    // 2. Force close the dropdown
    setOpenKey(null);
  };
  // const handleClickMenuItem = () => {
  //   navigate("/products");
  // };
  const renderMegaMenu = (cls: any, data: any) => (
    <div className={`${cls}`}>
      <Row gutter={32}>
        {data?.map((section: any) => (
          <Col span={8} key={section.title} className="menuColumn">
            <h6>{section?.title}</h6>
            {section?.items?.map((item: any) => (
              <div
                key={item?.label}
                className="menuItem"
                onClick={() => handleClickMenuItem()}
              >
                <span className="icon">{item?.icon}</span>
                {item?.label}
              </div>
            ))}
          </Col>
        ))}
      </Row>
    </div>
  );
  // const renderChuridarMenu = () => (
  //   <div className="churidarMegaMenu">
  //     <Row gutter={40}>
  //       {churidarData.map((section) => (
  //         <Col span={8} key={section.title} className="menuColumn">
  //           <h6>{section.title}</h6>
  //           {section.items.map((item) => (
  //             <div key={item.label} className="menuItem">
  //               <span className="icon">{item.icon}</span>
  //               <span>{item.label}</span>
  //             </div>
  //           ))}
  //         </Col>
  //       ))}
  //     </Row>
  //   </div>
  // );
  // const renderJewelleryMenu = () => (
  //   <div className="jewelleryMegaMenu">
  //     <Row gutter={48}>
  //       {jewelleryData.map((section) => (
  //         <Col span={8} key={section.title} className="menuColumn">
  //           <h6>{section.title}</h6>
  //           {section.items.map((item) => (
  //             <div key={item.label} className="menuItem">
  //               <span className="icon">{item.icon}</span>
  //               <span>{item.label}</span>
  //             </div>
  //           ))}
  //         </Col>
  //       ))}
  //     </Row>
  //   </div>
  // );

  return (
    <>
      <div className={"stickyHeaderGroup"}>
        {/* 1. Top Banner */}
        <div className={"topBanner"}>
          <div className="container d-flex justify-content-between align-items-center">
            <span>✨ Free Shipping on Orders Above ₹1000</span>
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

        {/* 2. White Header */}
        <header className={"mainHeader"}>
          <div className="container">
            <div className="d-flex align-items-center justify-content-between">
              <div className={"logo"}>
                <NavLink to="/">
                  <img src={Logo} alt="logo" />
                </NavLink>
              </div>

              <div className=" d-none d-lg-block w-75 px-4">
                <Input
                  size="large"
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Search for sarees, churidars, jewellery..."
                  className="rounded-pill"
                />
              </div>

              <Space size="large" className="text-secondary">
                <NavLink
                  to={"/wishlist"}
                  style={{ color: "#45556C !important" }}
                >
                  <Badge count={0} color="#f209a2" size="small">
                    <HeartOutlined className="fs-6" color="#45556C" />
                  </Badge>
                </NavLink>
                <NavLink to={"/cart"} style={{ color: "#45556C !important" }}>
                  <Badge
                    count={cartList?.length || 0}
                    color="#f209a2"
                    size="small"
                  >
                    <ShoppingCartOutlined className="fs-6" color="#45556C" />
                  </Badge>
                </NavLink>
                <NavLink to={"/my-account"} style={{ color: "#45556C" }}>
                  <UserOutlined
                    className="fs-6 cursor-pointer"
                    color="#45556C"
                  />
                </NavLink>
              </Space>
            </div>
          </div>
          <span className="nav-links-horizental-line" />
          <div className="container">
            {/* Nav with Hover Dropdowns */}
            <nav className={"navLinks"}>
              {/* {["Sarees", "Churidars", "Jewellery"].map((cat) => (
                <Dropdown
                  key={cat}
                  menu={{ items }}
                  trigger={["hover"]}
                  open={true}
                >
                  <span className={"navItem"}>
                    {cat} <DownOutlined style={{ fontSize: 10 }} />
                  </span>
                </Dropdown>
              ))} */}
              {/* <Dropdown
                dropdownRender={() =>
                  renderMegaMenu("megaMenuCard", sareeCategories)
                }
                trigger={["hover"]}
                overlayClassName="mega-dropdown-width"
                // open={true}
              >
                <span className={"navItem"}>
                  Sarees{" "}
                  <DownOutlined
                    style={{ fontSize: 12 }}
                    className="navlink-down-arrow"
                  />
                </span>
              </Dropdown>

              <Dropdown
                dropdownRender={() =>
                  renderMegaMenu("churidarMegaMenu", churidarData)
                }
                trigger={["hover"]}
              >
                <span className="navItem">
                  Churidars{" "}
                  <DownOutlined
                    style={{ fontSize: 12 }}
                    className="navlink-down-arrow"
                  />
                </span>
              </Dropdown>
              <Dropdown
                dropdownRender={() =>
                  renderMegaMenu("jewelleryMegaMenu", jewelleryData)
                }
                trigger={["hover"]}
              >
                <span className="navItem">
                  Jewellery{" "}
                  <DownOutlined
                    style={{ fontSize: 12 }}
                    className="navlink-down-arrow"
                  />
                </span>
              </Dropdown> */}
              <Dropdown
                dropdownRender={() =>
                  renderMegaMenu("megaMenuCard", sareeCategories)
                }
                trigger={["hover"]}
                overlayClassName="mega-dropdown-width"
                // Control the visibility manually
                open={openKey === "sarees"}
                onOpenChange={(flag) => setOpenKey(flag ? "sarees" : null)}
              >
                <span className={"navItem"}>
                  Sarees{" "}
                  <DownOutlined
                    style={{ fontSize: 12 }}
                    className="navlink-down-arrow"
                  />
                </span>
              </Dropdown>

              <Dropdown
                dropdownRender={() =>
                  renderMegaMenu("churidarMegaMenu", churidarData)
                }
                trigger={["hover"]}
                open={openKey === "churidars"}
                onOpenChange={(flag) => setOpenKey(flag ? "churidars" : null)}
              >
                <span className="navItem">
                  Churidars{" "}
                  <DownOutlined
                    style={{ fontSize: 12 }}
                    className="navlink-down-arrow"
                  />
                </span>
              </Dropdown>
              <Dropdown
                dropdownRender={() =>
                  renderMegaMenu("jewelleryMegaMenu", jewelleryData)
                }
                trigger={["hover"]}
                open={openKey === "jewellery"}
                onOpenChange={(flag) => setOpenKey(flag ? "jewellery" : null)}
              >
                <span className="navItem">
                  Jewellery{" "}
                  <DownOutlined
                    style={{ fontSize: 12 }}
                    className="navlink-down-arrow"
                  />
                </span>
              </Dropdown>

              {/* Other items can keep the standard list or unique renders */}
              {/* {["Churidars", "Jewellery"].map((cat) => (
                <Dropdown key={cat} menu={{ items: [] }} trigger={["hover"]}>
                  <span className={"navItem"}>
                    {cat} <DownOutlined style={{ fontSize: 10 }} />
                  </span>
                </Dropdown>
              ))} */}

              <NavLink to={"/products"}>
                <span className={"navItem"}>All Products</span>
              </NavLink>
              <NavLink to={"/products"}>
                <span className={"navItem"}>New Arrivals</span>
              </NavLink>
              <NavLink to={"/customer-support"}>
                <span className={"navItem"}>Support</span>
              </NavLink>
            </nav>
          </div>
        </header>
      </div>
    </>
  );
};

export default Header;
