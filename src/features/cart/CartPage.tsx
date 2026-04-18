// import { useAppDispatch, useAppSelector } from "../../hooks";
// import { updateQty, removeFromCart } from "./cartSlice";

// export default function CartPage() {
//   const cart = useAppSelector((s) => s.cart);
//   const dispatch = useAppDispatch();

//   const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

//   return (
//     <div className="container mt-4">
//       <h2>Cart</h2>

//       {cart.map((item) => (
//         <div className="d-flex justify-content-between mb-3" key={item.id}>
//           <div>{item.title}</div>

//           <input
//             type="number"
//             value={item.qty}
//             onChange={(e) =>
//               dispatch(updateQty({ id: item.id, qty: +e.target.value }))
//             }
//           />

//           <button
//             className="btn btn-danger"
//             onClick={() => dispatch(removeFromCart(item.id))}
//           >
//             Remove
//           </button>
//         </div>
//       ))}

//       <h4>Total: ₹{total}</h4>
//     </div>
//   );
// }

import { useNavigate } from "react-router-dom";
import React, { useState, useMemo } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Row,
  Col,
  Space,
  InputNumber,
  Divider,
  message,
  Alert,
} from "antd";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
// import './ShoppingCart.scss';
import Image from "../../assets/png/EthnicHomePage_1.svg";
import Image2 from "../../assets/png/EthnicHomePage_2.png";
import { useCartSelector } from "../../hooks";
import { removeFromCart, updateQty } from "./cartSlice";
import { useDispatch } from "react-redux";

const { Title, Text } = Typography;

interface CartItem {
  id: string;
  title: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

// const initialItems = [
//   {
//     id: "1",
//     title: "Royal Banarasi Silk Saree",
//     image: Image,
//     price: 8999,
//     oldPrice: 12999,
//     discount: "31% OFF",
//     collection: "Wedding Collection",
//     badgeColor: "blue",
//     tags: ["Silk", "Banarasi"],
//     rating: 0,
//     reviewCount: 0,
//     quantity: 1,
//     color: "#000",
//     size: "100",
//   },
//   {
//     id: "2",
//     title: "Elegant Paithani Pure Silk",
//     image: Image2,
//     price: 15999,
//     oldPrice: 19999,
//     discount: "20% OFF",
//     collection: "Premium Collection",
//     badgeColor: "blue",
//     tags: ["Silk", "Paithani"],
//     rating: 0,
//     reviewCount: 0,
//     quantity: 1,
//     color: "#000",
//     size: "100",
//   },
//   {
//     id: "3",
//     title: "Royal Banarasi Silk Saree",
//     image: Image,
//     price: 8999,
//     oldPrice: 12999,
//     discount: "31% OFF",
//     collection: "Wedding Collection",
//     badgeColor: "blue",
//     tags: ["Silk", "Banarasi"],
//     rating: 0,
//     reviewCount: 0,
//     quantity: 1,
//     color: "#000",
//     size: "100",
//   },
//   {
//     id: "5",
//     title: "Elegant Paithani Pure Silk",
//     image: Image2,
//     price: 15999,
//     oldPrice: 19999,
//     discount: "20% OFF",
//     collection: "Premium Collection",
//     badgeColor: "blue",
//     tags: ["Silk", "Paithani"],
//     rating: 0,
//     reviewCount: 0,
//     quantity: 1,
//     color: "#000",
//     size: "100",
//   },
// ];
const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const cartList = useCartSelector();
  console.log(cartList, "CartPage cartList");
  const dispatch = useDispatch();
  const handleContinueShopping = () => {
    // Navigate to your shop page
    // console.log("Navigating to shop...");
    navigate("/products");
  };
  const [items, setItems] = useState<CartItem[]>(cartList);

  const [couponCode, setCouponCode] = useState("");
  const [isCouponInvalid, setIsCouponInvalid] = useState(false);

  // --- Calculations ---
  //   const subtotal:any = useMemo(() => items?.reduce((acc, item) => acc + (item.price * item.quantity), 0), [items]);
  //   const shipping = 0; // Free as per image
  //   const tax = subtotal * 0.08; // 8% Tax example
  //   const total = subtotal + shipping + tax;
  // --- Calculations ---
  const subtotal = useMemo(() => {
    // Ensure we return 0 if items is empty
    return (
      items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0
    );
  }, [items]);

  const shipping = 0;
  // Calculate tax based on the safe subtotal
  const tax = (subtotal || 0) * 0.08;
  const total = subtotal + shipping + tax;

  // --- Handlers ---
  const updateQuantity = (id: string, val: number | null) => {
    if (val === null) return;
    dispatch(updateQty({ id: id, quantity: val }));
    setItems((prev: any) =>
      prev.map((item: any) =>
        item.id === id ? { ...item, quantity: val } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    dispatch(removeFromCart(id));
    setItems((prev: any) => prev.filter((item: any) => item?.id !== id));
    message.success("Item removed from cart");
  };

  const handleApplyCoupon = () => {
    if (couponCode !== "SAVE10") {
      setIsCouponInvalid(true);
    } else {
      setIsCouponInvalid(false);
      message.success("Coupon applied!");
    }
  };

  return (
    <div className="cart-page-wrapper py-4">
      <div className="container">
        <Title level={2} className="page-header mb-4">
          Shopping Cart
        </Title>
        {items?.length > 0 ? (
          <Row gutter={24}>
            {/* Cart Items List */}
            <Col xs={24} lg={16}>
              {items?.map((item) => (
                <Card
                  key={item.id}
                  className="cart-item-card mb-3"
                  bordered={false}
                >
                  <div className="d-flex align-items-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="item-thumb"
                    />
                    <div className="item-details flex-grow-1 ms-4">
                      <Text strong className="d-block fs-5">
                        {item.title}
                      </Text>
                      <Text type="secondary" className="d-block mb-2">
                        Size: {item.size} | Color: {item.color}
                      </Text>
                      <Title level={4} className="m-0">
                        ${item.price.toFixed(2)}
                      </Title>
                      <div className="mt-3">
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={(val) => updateQuantity(item.id, val)}
                          className="qty-selector"
                        />
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(item.id)}
                    />
                  </div>
                </Card>
              ))}
            </Col>

            {/* Order Summary */}
            <Col xs={24} lg={8}>
              <Card className="summary-card" bordered={false}>
                <Title level={4} className="mb-4">
                  Order Summary
                </Title>

                <div className="coupon-section mb-4">
                  <Text strong className="d-block mb-2">
                    Have a coupon?
                  </Text>
                  <div className="d-flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="custom-input"
                    />
                    <Button className="apply-btn" onClick={handleApplyCoupon}>
                      Apply
                    </Button>
                  </div>
                  <Text type="secondary" className="small mt-1 d-block">
                    Try: SAVE10
                  </Text>
                </div>

                <div className="price-breakdown">
                  <div className="d-flex justify-content-between mb-2">
                    <Text type="secondary">Subtotal</Text>
                    <Text strong>${subtotal.toFixed(2)}</Text>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <Text type="secondary">Shipping</Text>
                    <Text type="success">FREE</Text>
                  </div>
                  <div className="d-flex justify-content-between mb-4">
                    <Text type="secondary">Tax</Text>
                    <Text strong>${tax.toFixed(2)}</Text>
                  </div>

                  {isCouponInvalid && (
                    <Alert
                      message="Invalid coupon code"
                      type="error"
                      showIcon
                      className="mb-3"
                    />
                  )}

                  <Button type="primary" block className="checkout-btn">
                    Proceed to Checkout
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          <div className="empty-state-content text-center d-flex flex-column align-items-center my-4 py-4">
            <p className="empty-message mb-4">Your Cart is empty</p>
            <Button
              type="primary"
              size="large"
              className="continue-shopping-btn"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // return (
  //   <div className="wishlist-container container d-flex flex-column align-items-center justify-content-center">
  //     <div className="text-start w-100 py-4">
  //       <h1 className="wishlist-title">Shopping Cart</h1>
  //     </div>

  //     <div className="empty-state-content text-center d-flex flex-column align-items-center my-4 py-4">
  //       <p className="empty-message mb-4">Your Cart is empty</p>
  //       <Button
  //         type="primary"
  //         size="large"
  //         className="continue-shopping-btn"
  //         onClick={handleContinueShopping}
  //       >
  //         Continue Shopping
  //       </Button>
  //     </div>
  //   </div>
  // );
};

export default CartPage;
