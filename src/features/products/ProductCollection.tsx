import { Row, Col, Select, Switch, Checkbox, Collapse, Skeleton, Empty, Pagination, Card, Drawer, Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "./productSlice";
import { fetchCategoryBySlug, clearSelected } from "../category/categorySlice";
import ProductCard from "./ProductCard";
import type { RootState, AppDispatch } from "../../store";
import type { ProductFilters } from "../../types/product";
import type { Category } from "../../types/category";

// ── Subcategory picker shown when a top-level category is selected ────────────
const SubcategoryPicker = ({ category, onSelect }: { category: Category; onSelect: (slug: string) => void }) => {
  const subs = category.subcategories ?? [];
  return (
    <div className="container collection-container">
      <div className="collection-header">
        <h5>Our Collection</h5>
        <h1>{category.name}</h1>
        <p>Choose a collection to explore</p>
      </div>
      <Row gutter={[24, 24]}>
        {subs.map((sub) => (
          <Col xs={12} sm={8} md={6} key={sub._id}>
            <Card
              hoverable
              onClick={() => onSelect(sub.slug)}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                textAlign: "center",
              }}
              cover={
                sub.image?.url ? (
                  <img
                    src={sub.image.url}
                    alt={sub.name}
                    style={{ height: 180, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      height: 180,
                      background: "linear-gradient(135deg,#8e2de2,#f209a2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 32,
                    }}
                  >
                    {sub.name.charAt(0)}
                  </div>
                )
              }
            >
              <Card.Meta
                title={<span style={{ fontSize: 14, fontWeight: 600 }}>{sub.name}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// ── Main collection page ──────────────────────────────────────────────────────
const ProductCollection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") || "";

  const { list, total, pages, loading: productsLoading } = useSelector((state: RootState) => state.products);
  const { selected: category, loading: catLoading } = useSelector((state: RootState) => state.categories);

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Reset filters when category changes
  useEffect(() => {
    setSelectedFilters({});
    setInStockOnly(false);
    setPage(1);
    dispatch(clearSelected());
  }, [categorySlug, dispatch]);

  // Fetch category details to know if it's top-level or a subcategory
  useEffect(() => {
    if (categorySlug) dispatch(fetchCategoryBySlug(categorySlug));
  }, [categorySlug, dispatch]);

  // Determine if the selected category is top-level (has subcategories, no parent)
  const isTopLevel =
    category &&
    category.slug === categorySlug &&
    (category.subcategories?.length ?? 0) > 0 &&
    !category.parent;

  // Only fetch products if we're on a subcategory or "All Products"
  const loadProducts = useCallback(() => {
    if (isTopLevel) return; // don't fetch — show subcategory picker instead

    const filters: ProductFilters = {
      category: categorySlug || undefined,
      sortBy: sortBy as ProductFilters["sortBy"],
      inStock: inStockOnly || undefined,
      page,
      limit: 12,
    };
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length > 0) filters[key] = values.join(",");
    });
    dispatch(fetchProducts(filters));
  }, [categorySlug, sortBy, inStockOnly, page, selectedFilters, dispatch, isTopLevel]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleFilterChange = (key: string, values: string[]) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: values }));
    setPage(1);
  };

  const clearAll = () => {
    setSelectedFilters({});
    setInStockOnly(false);
    setPage(1);
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length + (inStockOnly ? 1 : 0);

  // ── Top-level category: show subcategory picker ───────────────────────────
  if (catLoading && categorySlug) {
    return (
      <div className="container py-5">
        <Row gutter={[24, 24]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col xs={12} sm={8} md={6} key={i}>
              <Skeleton.Image active style={{ width: "100%", height: 180 }} />
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (isTopLevel && category) {
    return (
      <SubcategoryPicker
        category={category}
        onSelect={(slug) => {
          setSearchParams({ category: slug });
          navigate(`/products?category=${slug}`, { replace: true });
        }}
      />
    );
  }

  // ── Subcategory or All Products: show product grid ────────────────────────
  const filterableAttributes = category?.filterableAttributes || [];
  const categoryTitle = category?.name || (categorySlug ? categorySlug : "All Products");

  return (
    <div className="container collection-container">
      <div className="collection-header">
        <h5>Our Collection</h5>
        <h1>{categoryTitle}</h1>
        <p>Discover timeless elegance in every piece</p>
      </div>

      <Row gutter={40}>
        {/* Dynamic Filter Sidebar */}
        <Col lg={6} md={8} xs={0}>
          <div className="filter-sidebar">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="m-0">Filters</h5>
              <a onClick={clearAll} style={{ fontSize: "12px", cursor: "pointer" }}>Clear All</a>
            </div>
            <div className="border-top" />

            {filterableAttributes.length > 0 ? (
              <Collapse
                ghost
                expandIconPosition="end"
                defaultActiveKey={filterableAttributes.slice(0, 2).map((f) => f.key)}
                className="px-0"
              >
                {filterableAttributes.map((filter) => (
                  <Collapse.Panel header={filter.label} key={filter.key} className="filter-section">
                    <Checkbox.Group
                      className="filter-checkbox-group"
                      value={selectedFilters[filter.key] || []}
                      onChange={(vals) => handleFilterChange(filter.key, vals as string[])}
                    >
                      {filter.options.map((option) => (
                        <Checkbox key={option} value={option}>
                          {filter.type === "color" ? (
                            <span className="d-flex align-items-center gap-2">
                              <span style={{
                                display: "inline-block", width: 14, height: 14,
                                borderRadius: "50%", background: option.toLowerCase(), border: "1px solid #ddd",
                              }} />
                              {option}
                            </span>
                          ) : option}
                        </Checkbox>
                      ))}
                    </Checkbox.Group>
                  </Collapse.Panel>
                ))}
              </Collapse>
            ) : (
              !categorySlug && (
                <p className="text-muted small mt-3">Select a category to see filters</p>
              )
            )}

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <span className="small fw-bold">In Stock Only</span>
              <Switch
                size="small"
                checked={inStockOnly}
                onChange={(v) => { setInStockOnly(v); setPage(1); }}
              />
            </div>
          </div>
        </Col>

        {/* Product Grid */}
        <Col lg={18} md={16} xs={24}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              {/* Mobile filter button — only visible on xs/sm */}
              <button
                className="mobile-filter-btn"
                onClick={() => setMobileFilterOpen(true)}
              >
                <FilterOutlined />
                Filters
                {activeFilterCount > 0 && (
                  <span className="filter-badge">{activeFilterCount}</span>
                )}
              </button>
              <span className="text-muted small">
                {productsLoading ? "Loading..." : `${total} item${total !== 1 ? "s" : ""}`}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="small d-none d-sm-inline">Sort by:</span>
              <Select
                value={sortBy}
                onChange={(v) => { setSortBy(v); setPage(1); }}
                style={{ width: 160 }}
                bordered={false}
                options={[
                  { value: "newest",     label: "Newest First" },
                  { value: "price_asc",  label: "Price: Low to High" },
                  { value: "price_desc", label: "Price: High to Low" },
                  { value: "discount",   label: "Best Discount" },
                ]}
              />
            </div>
          </div>

          {productsLoading ? (
            <Row gutter={[24, 24]}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Col lg={8} sm={12} xs={24} key={i}><Skeleton active /></Col>
              ))}
            </Row>
          ) : list.length === 0 ? (
            <Empty description="No products found" />
          ) : (
            <>
              <Row gutter={[24, 24]}>
                {list.map((product) => (
                  <Col lg={8} sm={12} xs={24} key={product._id}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
              {pages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={12}
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* ── Mobile Filter Drawer ─────────────────────────────────────────────── */}
      <Drawer
        title="Filters"
        placement="bottom"
        height="80vh"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        className="mobile-filter-drawer"
        styles={{ body: { padding: 0 } }}
        extra={
          <Button type="text" size="small" onClick={clearAll} style={{ color: "#888" }}>
            Clear all
          </Button>
        }
      >
        <div className="mobile-filter-content" style={{ overflowY: "auto", height: "calc(80vh - 140px)" }}>
          {filterableAttributes.length > 0 ? (
            <Collapse
              ghost
              expandIconPosition="end"
              defaultActiveKey={filterableAttributes.slice(0, 2).map((f) => f.key)}
            >
              {filterableAttributes.map((filter) => (
                <Collapse.Panel header={filter.label} key={filter.key} className="filter-section">
                  <Checkbox.Group
                    className="filter-checkbox-group"
                    value={selectedFilters[filter.key] || []}
                    onChange={(vals) => handleFilterChange(filter.key, vals as string[])}
                  >
                    {filter.options.map((option) => (
                      <Checkbox key={option} value={option}>
                        {filter.type === "color" ? (
                          <span className="d-flex align-items-center gap-2">
                            <span style={{
                              display: "inline-block", width: 14, height: 14,
                              borderRadius: "50%", background: option.toLowerCase(), border: "1px solid #ddd",
                            }} />
                            {option}
                          </span>
                        ) : option}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </Collapse.Panel>
              ))}
            </Collapse>
          ) : (
            <p className="text-muted small mt-3 px-4">Select a category to see filters</p>
          )}

          <div className="filter-in-stock-row">
            <span className="small fw-bold">In Stock Only</span>
            <Switch
              size="small"
              checked={inStockOnly}
              onChange={(v) => { setInStockOnly(v); setPage(1); }}
            />
          </div>
        </div>

        <div className="mobile-filter-footer">
          <Button className="btn-clear" onClick={clearAll}>Clear All</Button>
          <Button
            type="primary"
            className="btn-apply"
            onClick={() => setMobileFilterOpen(false)}
          >
            Show {total} Results
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default ProductCollection;
