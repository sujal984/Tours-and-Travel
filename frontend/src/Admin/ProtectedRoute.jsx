import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import { Spin } from "antd";

const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useUser();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
