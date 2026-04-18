// import { Card, Button } from "antd";
// import { useAppDispatch } from "../../hooks";
// import { addToCart } from "../cart/cartSlice";

// const ProductCard = ({ product }: any) => {
//   const dispatch = useAppDispatch();

//   return (
//     <Card
//       hoverable
//       cover={<img src={product.image} height={200} />}
//     >
//       <h6>{product.title}</h6>
//       <p>₹{product.price}</p>

//       <Button
//         type="primary"
//         block
//         onClick={() => dispatch(addToCart(product))}
//       >
//         Add to Cart
//       </Button>
//     </Card>
//   );
// };

// export default ProductCard;

import { Rate, Tag } from "antd";
import { HeartOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { useDispatch } from "react-redux";
import { addToCart } from "../cart/cartSlice";

interface Product {
  id: number;
  title: string;
  image: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  collection?: string;
  tags: string[];
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddItem = (item: any) => {
    dispatch(addToCart(item));
  };
  return (
    <div className="product-card">
      <div className="image-container">
        <img src={product.image} alt={product.title} />

        <div className="badge-container">
          {product.discount && (
            <div className="discount-badge">{product.discount}</div>
          )}
          {product.collection && (
            <div className="collection-badge">{product.collection}</div>
          )}
        </div>

        <button className="wishlist-btn">
          <HeartOutlined style={{ fontSize: "16px", color: "#666" }} />
        </button>
        <div className="quick-add-container px-3">
          <button
            className="add-to-cart-btn"
            onClick={() => handleAddItem(product)}
          >
            <Icon
              icon="system-uicons:cart"
              width="24"
              height="24"
              className="me-2"
            />{" "}
            {"  "} Quick Add
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="tags">
          {product.tags.map((tag, i) => (
            <Tag
              key={tag}
              className={`product-tags-cls ${i == 0 ? "first-child-tag" : ""}`}
            >
              {tag}
            </Tag>
          ))}
        </div>
        <div className="title special-font-cls fw-500">{product.title}</div>
        <Rate
          // disabled
          defaultValue={0}
          style={{ fontSize: 12, marginBottom: 8 }}
        />
        <span style={{ color: "#999", fontSize: 12, marginLeft: 4 }}>(0)</span>

        <div className="price-section">
          <span className="current-price">
            ₹{product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="old-price">
              ₹{product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
