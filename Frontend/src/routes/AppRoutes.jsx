import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Auth/Login';
import InventoryList from '../pages/Inventory/InventoryList';
import FinanceDashboard from '../pages/Finance/Dashboard';
import VehicleManagement from '../pages/Vehicle/Vehicle_management';
import UserManagement from '../pages/User/User_management';
import DashboardLayout from '../layouts/DashboardLayout';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <InventoryList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance"
        element={
          <ProtectedRoute>
            <FinanceDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <VehicleManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}