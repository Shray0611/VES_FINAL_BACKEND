import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  console.log("ProtectedRoute rendering at path:", location.pathname);
  console.log("ProtectedRoute rendering with allowedRoles:", allowedRoles);

  const token = localStorage.getItem("token");
  console.log("Token exists:", !!token);

  useEffect(() => {
    // Check token validity on mount
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          console.log("Token expired, clearing localStorage");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
        }
      } catch (error) {
        console.error("Token validation error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }
    }
  }, [token]);

  if (!token) {
    console.log("No token found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded token:", decoded);
    console.log(
      "Decoded token role:",
      decoded.role,
      "Allowed roles:",
      allowedRoles
    );

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime) {
      console.log("Token expired, redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return <Navigate to="/login" replace />;
    }

    // Check if token has valid role
    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      console.log(
        "Role not allowed, redirecting to home. User role:",
        decoded.role,
        "Required roles:",
        allowedRoles
      );

      // Redirect based on actual role
      if (decoded.role === "admin") {
        return <Navigate to="/generate" replace />;
      } else if (decoded.role === "superadmin") {
        return <Navigate to="/superadmin/dashboard" replace />;
      } else {
        return <Navigate to="/certificates" replace />;
      }
    }

    console.log("Role authorized, rendering protected content");
    return children;
  } catch (error) {
    console.error("Token decoding error:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
