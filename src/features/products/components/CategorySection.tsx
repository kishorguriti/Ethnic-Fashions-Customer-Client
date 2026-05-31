import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { Row, Col, Card, Button, Skeleton } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCategories } from "../../category/categorySlice";
import type { RootState, AppDispatch } from "../../../store";
import EthnicGradientTitle from "../../../assets/svg/Ethnic Style.svg";

const OVERLAY =
  "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)";

const CategoryCards = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { tree, loading } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    if (tree.length === 0) dispatch(fetchCategories());
  }, [dispatch, tree.length]);

  const topLevel = tree.slice(0, 3); // show first 3 top-level categories

  return (
    <>
      <div className="row d-flex flex-column align-items-center text-center py-4 g-2">
        <Button
          type="primary"
          size="large"
          shape="round"
          className="btnPrimary shop-by-category-btn"
          style={{ maxWidth: "200px" }}
        >
          <Icon icon="iconamoon:trend-up-light" width="24" height="24" /> Shop by
          Category
        </Button>
        <h1 className="fw-600 text-center special-font-cls">Find Your Perfect</h1>
        <img
          src={EthnicGradientTitle}
          alt="EthnicGradientTitle"
          style={{ width: "273px" }}
          className="ethnic-gradient-title"
        />
        <p className="text-center" style={{ color: "#64748B" }}>
          Explore our curated collections of traditional and contemporary fashion
        </p>
      </div>

      <Row gutter={[24, 24]}>
        {loading
          ? [1, 2, 3].map((i) => (
              <Col xs={24} md={8} key={i}>
                <Skeleton.Image active style={{ width: "100%", height: 430 }} />
              </Col>
            ))
          : topLevel.map((cat) => (
              <Col xs={24} md={8} key={cat._id}>
                <Card
                  hoverable
                  className="category-card text-white border-0"
                  style={{
                    backgroundImage: cat.image?.url
                      ? `url(${cat.image.url})`
                      : undefined,
                    backgroundColor: cat.image?.url ? undefined : "#1a2a6c",
                    height: "430px",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  onClick={() => navigate(`/products?category=${cat.slug}`)}
                >
                  <div
                    className="overlay"
                    style={{ background: OVERLAY }}
                  >
                    <span className="badge rounded-pill custom-pill-cls mb-2">
                      {cat.subcategories?.length || 0} Collections
                    </span>
                    <h3 className="fw-500 special-font-cls">{cat.name}</h3>
                  </div>
                </Card>
              </Col>
            ))}
      </Row>
    </>
  );
};

export default CategoryCards;
