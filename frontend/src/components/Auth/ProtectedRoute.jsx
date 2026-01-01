import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useUser } from "../../context/userContext";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useUser();
    const location = useLocation();

    // Not authenticated -> redirect based on current path
    if (!isAuthenticated) {
        // If trying to access admin area, redirect to admin login
        if (location.pathname.startsWith("/admin")) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        // For customer areas, redirect to home page (they can use login modal)
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Admin-only area
    if (location.pathname.startsWith("/admin")) {
        if (!user || user.role !== "ADMIN") {
            return <Navigate to="/forbidden" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
