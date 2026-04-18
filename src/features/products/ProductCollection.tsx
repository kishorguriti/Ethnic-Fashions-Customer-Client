import { Row, Col, Collapse, Tag, Select, Rate, Switch, Checkbox } from "antd";
import SareeImage from "../../assets/png/EthnicHomePage_1.svg";
import Churidars from "../../assets/png/EthnicHomePage_2.png";
import JewelleryImage from "../../assets/png/EthnicHomePage_3.png";
import ProductCard from "./ProductCard";
import { useMemo, useState } from "react";

const { Panel } = Collapse;

// const filters = [
//   {
//     name: "Fabric",
//     options: ["Silk", "Cotton", "Georgette", "Chiffon", "Organza"],
//   },
//   { name: "Occasion", options: ["Wedding", "Festival", "Party", "Casual"] },
//   { name: "Region", options: ["Banarasi", "Paithani", "Kanjivaram"] },
// ];
const FILTER_DATA = [
  {
    id: "fabric",
    name: "Fabric",
    options: ["Silk", "Cotton", "Georgette", "Chiffon", "Organza", "Linen"],
  },
  {
    id: "occasion",
    name: "Occasion",
    options: ["Wedding", "Festival", "Party", "Casual"],
  },
  {
    id: "region",
    name: "Region",
    options: ["Banarasi", "Paithani", "Kanjivaram", "Bandhani"],
  },
];

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
    size: "",
    color: "white",
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
    size: "",
    color: "white",
  },
  {
    id: 3,
    title: "Pure Cotton Handloom Saree",
    image: SareeImage,
    price: 1899,
    tags: ["Cotton", "Khandwa"],
    rating: 0,
    reviewCount: 0,
    size: "",
    color: "white",
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
    size: "",
    color: "white",
  },
];

const ProductCollection = () => {
  // State for active filters: { fabric: ['Silk'], occasion: [], ... }
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({
    fabric: [],
    occasion: [],
    region: [],
  });
  const [inStockOnly, setInStockOnly] = useState(false);

  // Handle Checkbox Change
  const handleFilterChange = (category: string, value: string[]) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  // Filter Logic (Memoized for performance)
  //   const filteredProducts = useMemo(() => {
  //     return products?.filter(product => {
  //       const fabricMatch = selectedFilters.fabric.length === 0 || selectedFilters.fabric.includes(product?.fabric);
  //       const occasionMatch = selectedFilters.occasion.length === 0 || selectedFilters.occasion.includes(product?.occasion);
  //       const regionMatch = selectedFilters.region.length === 0 || selectedFilters.region.includes(product?.region);

  //       return fabricMatch && occasionMatch && regionMatch;
  //     });
  //   }, [selectedFilters]);

  return (
    <div className="container collection-container">
      {/* Header */}
      <div className="collection-header">
        <h5>Our Collection</h5>
        <h1>Saree Collection</h1>
        <p>Discover timeless elegance in every drape</p>
      </div>

      <Row gutter={40}>
        {/* Sidebar Filters */}
        {/* <Col lg={6} md={8} xs={0}>
          <div className="filter-sidebar">
            <h5 className="mb-4">Filters</h5>
            <Collapse
              ghost
              expandIconPosition="end"
              defaultActiveKey={["0", "1"]}
            >
              {filters.map((filter, index) => (
                <Panel
                  header={filter.name}
                  key={index}
                  className="filter-section"
                >
                  {filter.options.map((opt) => (
                    <div key={opt} className="filter-item">
                      {opt}
                    </div>
                  ))}
                </Panel>
              ))}
            </Collapse>
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span>In Stock Only</span>
              <Switch size="small" />
            </div>
          </div>
        </Col> */}
        <Col lg={6} md={8} xs={0} className="">
          <div className="filter-sidebar">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="m-0">Filters</h5>
              <a
                onClick={() =>
                  setSelectedFilters({ fabric: [], occasion: [], region: [] })
                }
                style={{ fontSize: "12px" }}
              >
                Clear All
              </a>
            </div>
            <div className="border-top"></div>
            <Collapse
              ghost
              expandIconPosition="end"
              defaultActiveKey={["fabric", "occasion"]}
              className="px-0"
            >
              {FILTER_DATA.map((filter) => (
                <Panel
                  header={filter.name}
                  key={filter.id}
                  className="filter-section"
                >
                  <Checkbox.Group
                    className="filter-checkbox-group"
                    value={selectedFilters[filter.id]}
                    onChange={(checkedValues) =>
                      handleFilterChange(filter.id, checkedValues as string[])
                    }
                  >
                    {filter.options.map((option) => (
                      <Checkbox key={option} value={option}>
                        {option}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </Panel>
              ))}
            </Collapse>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <span className="small font-weight-bold">In Stock Only</span>
              <Switch
                size="small"
                checked={inStockOnly}
                onChange={setInStockOnly}
              />
            </div>
          </div>
        </Col>

        {/* Product Grid */}
        <Col lg={18} md={16} xs={24}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="text-muted small">8 items</span>
            <div className="d-flex align-items-center gap-2">
              <span className="small">Sort by:</span>
              <Select
                defaultValue="newest"
                style={{ width: 140 }}
                bordered={false}
              >
                <Select.Option value="newest">Newest First</Select.Option>
                <Select.Option value="price-low">
                  Price Low to High
                </Select.Option>
              </Select>
            </div>
          </div>

          <Row gutter={[24, 24]}>
            {products?.map((product) => (
              <Col lg={8} sm={12} xs={24} key={product.id}>
                <ProductCard product={product} />
                {/* <div className="product-card">
                  <div className="image-wrapper">
                    <div className="badge-group">
                      <Tag color="#eb2f96" className="m-0">
                        {product.badge}
                      </Tag>
                    </div>
                    <div className="wishlist-btn">
                      <HeartOutlined />
                    </div>
                    <img src={product.img} alt={product.title} />
                  </div>
                  <div className="product-info">
                    <div className="tags">
                      {product.tags.map((t) => (
                        <Tag key={t} color="blue">
                          {t}
                        </Tag>
                      ))}
                    </div>
                    <h3>{product.title}</h3>
                    <Rate
                      disabled
                      defaultValue={product.rating}
                      style={{ fontSize: 12 }}
                    />
                    <div className="price-row mt-2">
                      <span className="current-price">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <span className="old-price">
                        ₹{product.oldPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div> */}
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default ProductCollection;
