import React from "react";
import {
  CarOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
} from "@ant-design/icons";

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
}

const features: FeatureItem[] = [
  {
    title: "Free Shipping",
    description: "On orders above ₹3000",
    icon: <CarOutlined />,
    colorClass: "blue",
  },
  {
    title: "Easy Returns",
    description: "7-day return policy",
    icon: <ReloadOutlined />,
    colorClass: "purple",
  },
  {
    title: "Secure Payment",
    description: "100% secure transactions",
    icon: <SafetyOutlined />,
    colorClass: "green",
  },
  {
    title: "Authentic",
    description: "Certified products only",
    icon: <SafetyCertificateOutlined />,
    colorClass: "orange",
  },
];

const Features: React.FC = () => {
  return (
    <section className="features-section">
      <div className="container">
        <div className="row g-4">
          {features.map((item, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-3">
              <div className={`feature-card card-${item.colorClass}`}>
                <div className={`icon-box ${item.colorClass}`}>{item.icon}</div>
                <h5>{item.title}</h5>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
