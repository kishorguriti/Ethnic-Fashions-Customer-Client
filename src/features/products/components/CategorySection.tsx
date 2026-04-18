import { Icon } from "@iconify/react";
import { Row, Col, Card, Button } from "antd";
import EthnicGradientTitle from "../../../assets/svg/Ethnic Style.svg";
import SareeImage from "../../../assets/png/EthnicHomePage_1.svg";
import Churidars from "../../../assets/png/EthnicHomePage_2.png";
import JewelleryImage from "../../../assets/png/EthnicHomePage_3.png";

const categories = [
  { title: "Sarees", img: SareeImage, color: "#1a2a6c", products: 4 },
  { title: "Churidars", img: Churidars, color: "#b21f1f", products: 4 },
  { title: "Jewellery", img: JewelleryImage, color: "#fdbb2d", products: 4 },
];

const CategoryCards = () => (
  <>
    <div className="row d-flex flex-column align-items-center text-center py-4 g-2">
      <Button
        type="primary"
        size="large"
        shape="round"
        className={"btnPrimary shop-by-category-btn"}
        style={{ maxWidth: "200px" }}
      >
        <Icon icon="iconamoon:trend-up-light" width="24" height="24" /> Shop by
        Category
      </Button>
      <h1 className="fw-600 text-center special-font-cls">Find Your Perfect</h1>
      {/* <h2 className="fw-bold text-center gradient-title">Ethnic Style</h2> */}
      <img
        src={EthnicGradientTitle}
        alt="EthnicGradientTitle"
        style={{ width: "273px !important" }}
        className="ethnic-gradient-title"
      />
      <p className="text-center" style={{ color: "#64748B" }}>
        Explore our curated collections of traditional and contemporary fashion
      </p>
    </div>
    <Row gutter={[24, 24]}>
      {categories.map((cat) => (
        <Col xs={24} md={8} key={cat.title}>
          <Card
            hoverable
            className="category-card text-white border-0"
            style={{
              // background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${cat.img})`,
              backgroundImage: ` url(${cat.img})`,
              height: "430px",
            }}
          >
            <div
              className="overlay"
              style={{
                background:
                  `linear-gradient(180deg, rgba(43, 127, 255, 0.2) 0%, rgba(0, 184, 219, 0.65) 0%, rgba(0, 0, 0, 0.8) 95%,)`,
              }}
            >
              <span className="badge rounded-pill custom-pill-cls mb-2">
                {cat.products || 0} Products
              </span>
              <h3 className="fw-500 special-font-cls">{cat.title}</h3>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  </>
);

export default CategoryCards;
