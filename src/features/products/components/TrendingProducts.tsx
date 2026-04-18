import React from "react";
import { Row, Col, Card, Badge, Rate, Button, Tag } from "antd";
// import { ShoppingCartOutlined, HeartOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import SareeImage from "../../../assets/png/EthnicHomePage_1.svg";
import Churidars from "../../../assets/png/EthnicHomePage_2.png";
import JewelleryImage from "../../../assets/png/EthnicHomePage_3.png";
import ProductCard from "../ProductCard";

const products = [
  {
    id: 1,
    title: "Royal Banarasi Silk Saree",
    image: SareeImage,
    price: 8999,
    oldPrice: 12999,
    discount: "31% OFF",
    collection: "Wedding Collection",
    badgeColor: "blue",
    tags: ["Silk", "Banarasi"],
    rating: 0,
    reviewCount: 0,
  },
  {
    id: 2,
    title: "Elegant Paithani Pure Silk",
    image: Churidars,
    price: 15999,
    oldPrice: 19999,
    discount: "20% OFF",
    collection: "Premium Collection",
    badgeColor: "blue",
    tags: ["Silk", "Paithani"],
    rating: 0,
    reviewCount: 0,
  },
  {
    id: 3,
    title: "Pure Cotton Handloom Saree",
    image: SareeImage,
    price: 1899,
    tags: ["Cotton", "Khandwa"],
    rating: 0,
    reviewCount: 0,
  },
  {
    id: 4,
    title: "Designer Georgette Party Wear",
    image: JewelleryImage,
    price: 3499,
    oldPrice: 4999,
    discount: "30% OFF",
    collection: "New",
    badgeColor: "blue",
    tags: ["Georgette", "Banarasi"],
    rating: 0,
    reviewCount: 0,
  },
];

const TrendingProducts: React.FC = () => {
  // This would typically come from Redux via useAppSelector
  // const products = [
  //   {
  //     id: 1,
  //     name: "Silk Saree",
  //     price: 9999,
  //     rating: 4.5,
  //     discount: "30% Off",
  //   },
  //   {
  //     id: 2,
  //     name: "Silk Saree",
  //     price: 9999,
  //     rating: 4.5,
  //     discount: "30% Off",
  //   },
  //   {
  //     id: 3,
  //     name: "Silk Saree",
  //     price: 9999,
  //     rating: 4.5,
  //     discount: "30% Off",
  //   },
  //   {
  //     id: 4,
  //     name: "Silk Saree",
  //     price: 9999,
  //     rating: 4.5,
  //     discount: "30% Off",
  //   },

  //   // ... more items
  // ];

  return (
    <section className="trending-section">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <Button className="best-seller-btn">
            <Icon icon="wpf:like" width="24" height="24" /> Best Sellers
          </Button>
          <h1 className=" special-font-cls mt-2">Trending Now</h1>
          <p className="text-center pb-0 mb-0" style={{ color: "#64748B" }}>
            Most loved pieces by our customers
          </p>
        </div>
        <Button className="veiw-all-btn">
          View All{" "}
          <Icon
            icon="material-symbols:arrow-right-alt-rounded"
            width="24"
            height="24"
          />
        </Button>
      </div>
      {/* <Row gutter={[24, 24]}>
        {products.map((product) => (
          <Col xs={24} sm={12} md={6} key={product.id}>
            <Badge.Ribbon text={product.discount} color="red">
              <Card
                hoverable
                cover={
                  <div
                    className="product-placeholder"
                    style={{ height: 300, background: "#f0f0f0" }}
                  />
                }
                actions={[
                  <HeartOutlined key="wishlist" />,
                  <ShoppingCartOutlined key="cart" />,
                ]}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <div>
                      <div className="fw-bold text-dark">₹{product.price}</div>
                      <Rate
                        disabled
                        defaultValue={4}
                        style={{ fontSize: 12 }}
                      />
                    </div>
                  }
                />
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row> */}
      <div className="row g-4">
        {products.map((product) => (
          <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingProducts;
