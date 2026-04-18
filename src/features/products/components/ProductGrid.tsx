import React from 'react';
import { Row, Col, Card, Badge, Rate } from 'antd';
import { HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const ProductGrid: React.FC = () => {
  const products = [1, 2, 3, 4]; // Mock data
  return (
    <Row gutter={[16, 24]}>
      {products.map(i => (
        <Col xs={12} lg={6} key={i}>
          <Badge.Ribbon text="20% OFF" color="#eb2f96">
            <Card
              hoverable
              cover={<img alt="product" src={`https://placehold.co{i}`} />}
              actions={[<HeartOutlined key="wish" />, <ShoppingCartOutlined key="cart" />]}
            >
              <div className="text-muted small">Brand Name</div>
              <div className="fw-bold">Designer Silk Saree</div>
              <div className="mt-2">
                <span className="fw-bold text-dark h5">₹4,999</span>
                <span className="text-decoration-line-through text-muted ms-2">₹5,999</span>
              </div>
              <Rate disabled defaultValue={4} style={{ fontSize: 12 }} />
            </Card>
          </Badge.Ribbon>
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;
