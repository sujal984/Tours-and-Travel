import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Drawer, Avatar, Dropdown, Space } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  CompassOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/userContext";
import LoginModal from "./Auth/LoginModal";
import RegisterModal from "./Auth/RegisterModal";
import { motion, AnimatePresence } from "framer-motion";

const { Header } = Layout;

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useUser();

  // Scroll detection for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const menuItems = [
    { key: "/", label: "Home", icon: <HomeOutlined /> },
    { key: "/tours", label: "Tours", icon: <CompassOutlined /> },
    { key: "/about", label: "About", icon: <InfoCircleOutlined /> },
    { key: "/contact", label: "Contact", icon: <PhoneOutlined /> },
    ...(isAuthenticated
      ? [{ key: "/my-bookings", label: "My Bookings", icon: <UserOutlined /> }]
      : []),
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "my-bookings",
      label: "My Bookings",
      icon: <UserOutlined />,
    },
    {
      key: "my-custom-requests",
      label: "Custom Requests",
      icon: <CompassOutlined />,
    },
    {
      key: "my-inquiries",
      label: "My Inquiries",
      icon: <UserOutlined />,
    },
    ...(user?.role === "ADMIN"
      ? [
        {
          key: "admin-dashboard",
          label: "Admin Dashboard",
          icon: <UserOutlined />,
        },
      ]
      : []),
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }) => {
    switch (key) {
      case "profile":
        navigate("/profile");
        break;
      case "my-bookings":
        navigate("/my-bookings");
        break;
      case "my-custom-requests":
        navigate("/my-custom-requests");
        break;
      case "my-inquiries":
        navigate("/my-inquiries");
        break;
      case "admin-dashboard":
        navigate("/admin/dashboard");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Logo */}
          <div onClick={() => navigate("/")} className="navbar-logo">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="logo-text"
            >
              <h2>Rima Tours</h2>
              {/* <p className="tagline">India ke rang "Rima" ke sang</p> */}
            </motion.div>
          </div>

          {/* Desktop Menu */}
          <div className="desktop-menu-wrapper" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              className="navbar-menu desktop-menu"
              disabledOverflow
            />
          </div>

          {/* Actions (Auth / User) */}
          <div className="navbar-actions">
            {isAuthenticated ? (
              <div className="user-menu">
                <Dropdown
                  menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                  placement="bottomRight"
                  overlayClassName="custom-dropdown"
                >
                  <Space style={{ cursor: "pointer" }}>
                    <Avatar
                      icon={<UserOutlined />}
                      src={user?.avatar}
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    />
                    <span className="user-name" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {user?.username || user?.first_name || "User"}
                    </span>
                  </Space>
                </Dropdown>
              </div>
            ) : (
              <div className="auth-buttons desktop-auth" style={{ display: 'flex', gap: '10px' }}>
                <Button
                  type="text"
                  icon={<LoginOutlined />}
                  onClick={() => setLoginModalOpen(true)}
                  className="login-btn"
                  style={{ color: 'var(--primary-color)', fontWeight: 600 }}
                >
                  Login
                </Button>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => setRegisterModalOpen(true)}
                  className="register-btn btn-primary-gradient"
                  shape="round"
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <MenuOutlined
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              style={{ fontSize: '1.5rem', color: 'var(--primary-color)', display: 'none', marginLeft: '1rem' }}
            />
          </div>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title={<span style={{ color: 'var(--primary-color)' }}>Menu</span>}
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          bodyStyle={{ padding: 0 }}
          width={280}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: "none" }}
          />
          {isAuthenticated ? (
            <div className="mobile-auth-buttons p-md">
              <div className="mb-2" style={{ marginBottom: '10px' }}>
                <Button
                  block
                  type="default"
                  icon={<UserOutlined />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/my-bookings");
                  }}
                >
                  My Bookings
                </Button>
              </div>
              <div className="mb-2" style={{ marginBottom: '10px' }}>
                <Button
                  block
                  type="default"
                  icon={<CompassOutlined />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/my-custom-requests");
                  }}
                >
                  Custom Requests
                </Button>
              </div>
              <div className="mb-2" style={{ marginBottom: '10px' }}>
                <Button
                  block
                  type="default"
                  icon={<UserOutlined />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/my-inquiries");
                  }}
                >
                  My Inquiries
                </Button>
              </div>
              <div>
                <Button
                  block
                  type="primary"
                  danger
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="mobile-auth-buttons p-md">
              <div className="mb-2" style={{ marginBottom: '10px' }}>
                <Button
                  block
                  type="default"
                  icon={<LoginOutlined />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                >
                  Login
                </Button>
              </div>
              <div>
                <Button
                  block
                  type="primary"
                  icon={<UserAddOutlined />}
                  className="btn-primary-gradient"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setRegisterModalOpen(true);
                  }}
                >
                  Register
                </Button>
              </div>
            </div>
          )}
        </Drawer>
      </Header>

      {/* Modals */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onRegisterClick={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onLoginClick={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </>
  );
};

export default Navbar;
