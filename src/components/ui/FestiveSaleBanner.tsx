import React from "react";
import { Button } from "antd";
import {
  ShoppingOutlined,
  ArrowRightOutlined,
  StarFilled,
} from "@ant-design/icons";

const FestiveSale: React.FC = () => {
  return (
    <div className="container-fluid py-5 px-0">
      <section className="festive-hero shadow-lg">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8">
              {/* Icon Top */}
              <div className="icon-wrapper">
                <ShoppingOutlined />
              </div>

              {/* Limited Time Badge */}
              <div className="badge-offer">
                <StarFilled className="sparkle" />
                <span>Limited Time Offer</span>
              </div>

              {/* Main Text Content */}
              <h1 className="title">Festive Season Sale</h1>
              <h2 className="discount-text">Up to 30% Off</h2>

              <p className="description">
                Celebrate with style! Explore our exclusive festive collection
                with amazing discounts
              </p>

              {/* Call to Action */}
              <Button
                type="primary"
                size="large"
                icon={
                  <ArrowRightOutlined style={{ order: 1, marginLeft: 8 }} />
                }
              >
                Shop Festive Collection
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FestiveSale;
