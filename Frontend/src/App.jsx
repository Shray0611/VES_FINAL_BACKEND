import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Auth from "./components/Auth";
import CertificateGenerator from "./components/CertificateGenerator";
import CertificateList from "./components/CertificateList";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminCertificates from "./components/AdminCertificates";
import AdminUsers from "./components/AdminUsers";
import VerifyCertificate from "./components/VerifyCertificate";
import SuperAdminLogin from "./components/SuperAdminLogin";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import IssuerComplaints from "./components/IssuerComplaint";

function App() {
  console.log("App component rendering");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth isLogin={false} />} />
        <Route path="/login" element={<Auth isLogin={true} />} />

        <Route
          path="/certificates"
          element={
            <ProtectedRoute allowedRoles={["student", "admin"]}>
              <CertificateList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/issuer/complaints"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <IssuerComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CertificateGenerator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/certificates"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCertificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route path="/verify/:code" element={<VerifyCertificate />} />

        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
