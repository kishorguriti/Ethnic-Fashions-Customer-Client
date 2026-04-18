// import React from "react";
// import { Button, Row, Col } from "antd";
import { Button, Row, Col, Space } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

const Hero: React.FC = () => (
  <main className="heroContainer">
    <Row align="middle" className={"heroBody"}>
      <Col xs={24} lg={12}>
        <div className={"weddingBadge"}>✨ Wedding Collection 2026</div>
        <h1 className={"title"}>
          Your Style,
          <br />
          Redefined
        </h1>
        <p className={"description"}>
          Discover handcrafted ethnic fashion that blends tradition with
          contemporary elegance. From sarees to jewellery, find your perfect
          look.
        </p>

        <Space size="middle" className="mb-5">
          <Button
            type="primary"
            size="large"
            shape="round"
            className={"hero-explore-collection-btn"}
          >
            Explore Collection <ArrowRightOutlined />
          </Button>
          <Button
            ghost
            size="large"
            shape="round"
            className={"new-arrivals-btn"}
          >
            New Arrivals
          </Button>
        </Space>

        <Row className={"stats"}>
          <Col span={8}>
            <h2 className="fw-bold">12+</h2>
            <small>Products</small>
          </Col>
          <Col span={8} className="border-start ps-4">
            <h2 className="fw-bold">100%</h2>
            <small>Authentic</small>
          </Col>
          <Col span={8} className="border-start ps-4">
            <h2 className="fw-bold">4.9★</h2>
            <small>Rated</small>
          </Col>
        </Row>
      </Col>

      <Col xs={0} lg={12} className="text-end">
        <img
          src="/fashion-model.png"
          alt="Fashion Model"
          className={"heroImg"}
        />
      </Col>
    </Row>
  </main>
  //   <section className="hero-section">
  //     <div className="container">
  //       <Row align="middle" className="min-vh-75">
  //         <Col xs={24} md={12} className="text-white">
  //           <span className="badge rounded-pill bg-white text-primary mb-3">
  //             NEW ARRIVALS 2026
  //           </span>
  //           <h1 className="display-2 fw-bold">
  //             Your Style, <br />
  //             <span className="text-accent">Redefined</span>
  //           </h1>
  //           <p className="lead mb-4 opacity-75">
  //             Discover essential ethnic wear defining your elegance.
  //           </p>
  //           <div className="d-flex gap-3">
  //             <Button size="large" shape="round" className="btn-light-custom">
  //               Explore Collection
  //             </Button>
  //             <Button size="large" shape="round" ghost>
  //               Must-Have Looks
  //             </Button>
  //           </div>
  //         </Col>
  //       </Row>
  //     </div>
  //   </section>
);
export default Hero;
