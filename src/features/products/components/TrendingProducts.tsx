import React, { useEffect } from "react";
import { Button, Skeleton } from "antd";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../productSlice";
import ProductCard from "../ProductCard";
import type { RootState, AppDispatch } from "../../../store";

const TrendingProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { list, loading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchProducts({ sortBy: "newest", limit: 4 }));
    }
  }, [dispatch, list.length]);

  const trending = list.slice(0, 4);

  return (
    <section className="trending-section">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <Button className="best-seller-btn">
            <Icon icon="wpf:like" width="24" height="24" /> Best Sellers
          </Button>
          <h1 className="special-font-cls mt-2">Trending Now</h1>
          <p className="text-center pb-0 mb-0" style={{ color: "#64748B" }}>
            Most loved pieces by our customers
          </p>
        </div>
        <Button className="veiw-all-btn" onClick={() => navigate("/products")}>
          View All{" "}
          <Icon icon="material-symbols:arrow-right-alt-rounded" width="24" height="24" />
        </Button>
      </div>

      <div className="row g-4">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <Skeleton active />
              </div>
            ))
          : trending.map((product) => (
              <div key={product._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
};

export default TrendingProducts;
