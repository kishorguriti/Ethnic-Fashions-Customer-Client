import React from "react";
import { Link } from "react-router-dom";
import { Input, Button, Space } from "antd";
import {
  FacebookFilled,
  InstagramOutlined,
  TwitterOutlined,
  YoutubeFilled,
} from "@ant-design/icons";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row">
          {/* Company Column */}
          <div className="col-6 col-md-3 footer-col">
            <h5>Company</h5>
            <ul>
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#careers">Careers</a>
              </li>
              <li>
                <a href="#press">Press</a>
              </li>
              <li>
                <a href="#sustainability">Sustainability</a>
              </li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div className="col-6 col-md-3 footer-col">
            <h5>Customer Service</h5>
            <ul>
              <li>
                <Link to="/customer-support">Contact Us</Link>
              </li>
              <li>
                <a href="#shipping">Shipping Info</a>
              </li>
              <li>
                <a href="#returns">Returns & Exchanges</a>
              </li>
              <li>
                <Link to="/customer-support#faq">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="col-6 col-md-2 footer-col">
            <h5>Legal</h5>
            <ul>
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/shipping">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/returns">Return & Refund Policy</Link>
              </li>
            </ul>
          </div>

          {/* Stay Connected Column */}
          <div className="col-12 col-md-4 footer-col">
            <h5>Stay Connected</h5>
            <p className="newsletter-text">
              Subscribe to our newsletter for exclusive offers and updates.
            </p>
            <Input placeholder="Your email" className="subscribe-input" />
            <Button type="primary" className="subscribe-btn">
              Subscribe
            </Button>

            <div className="social-icons">
              <FacebookFilled />
              <InstagramOutlined />
              <TwitterOutlined />
              <YoutubeFilled />
            </div>
          </div>
        </div>
      </div>
      {/* Copyright Row */}
      <div className="footer-bottom">
        <p>
          © {currentYear}{" "}
          <span className="brand-name">
            <span className="purple">Aar</span>
            <span className="pink">na</span>
          </span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
