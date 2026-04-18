import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const Wishlist: React.FC = () => {
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    // Navigate to your shop page
    console.log("Navigating to shop...");
    navigate("/products");
  };

  return (
    <div className="wishlist-container container d-flex flex-column align-items-center justify-content-center">
      <div className="text-start w-100 py-4">
        <h1 className="wishlist-title">My Wishlist</h1>
      </div>

      <div className="empty-state-content text-center d-flex flex-column align-items-center my-4 py-4">
        <p className="empty-message mb-4">Your wishlist is empty</p>
        <Button
          type="primary"
          size="large"
          className="continue-shopping-btn"
          onClick={handleContinueShopping}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};

export default Wishlist;
