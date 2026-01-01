import React from "react";
import { Row, Col, Divider } from "antd";
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-container">
        <Row className="footer-content">
          {/* Company Info */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h3 className="footer-title">About Us</h3>
              <div className="company-info">
                <div className="company-name">Rima Tours & Travels</div>
                <p className="tagline">India ke rang "Rima" ke sang</p>
                <p className="company-description">
                  Discover India's beauty with our curated tour packages and
                  customized travel experiences.
                </p>
              </div>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li>
                  <a onClick={() => navigate("/")} className="link">
                    Home
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate("/about")} className="link">
                    About Us
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate("/contact")} className="link">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </Col>

          {/* Tour Types */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h3 className="footer-title">Tour Types</h3>
              <ul className="footer-links">
                <li>
                  <a
                    onClick={() => navigate("/tours?type=family")}
                    className="link"
                  >
                    Family Tours
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => navigate("/tours?type=couple")}
                    className="link"
                  >
                    Couple Tours
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate("/customization")} className="link">
                    Customize Tours
                  </a>
                </li>
              </ul>
            </div>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h3 className="footer-title">Contact Info</h3>
              <ul className="contact-list">
                <li>
                  <EnvironmentOutlined className="icon" />
                  <span>
                    G-4, Navrang Complex, Swastik Cross Rd, opp. Asia House,
                    Shrimali Society, Navrangpura, Ahmedabad, Gujarat 380009
                  </span>
                </li>
                <li>
                  <PhoneOutlined className="icon" />
                  <a href="tel:+919876543210">+91 98765 43210</a>
                </li>
                <li>
                  <MailOutlined className="icon" />
                  <a href="mailto:info@rimatomandtravels.com">
                    info@rimatomandtravels.com
                  </a>
                </li>
              </ul>
            </div>
          </Col>
        </Row>

        {/* <Divider style={{ margin: "2rem 0", borderColor: "rgba(255,255,255,0.2)" }} /> */}

        {/* Footer Bottom */}
        <Row align="middle" justify="space-between" className="footer-bottom">
          <Col xs={24} sm={12} className="copyright">
            <p>
              &copy; {new Date().getFullYear()} Rima Tours & Travels. All
              rights reserved.
            </p>
          </Col>
          <Col xs={24} sm={12} className="footer-links-bottom">
            <ul>
              <li>
                <a href="#privacy" className="link">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="link">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#refund" className="link">
                  Refund Policy
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </div>
    </footer>
  );
};

export default Footer;
