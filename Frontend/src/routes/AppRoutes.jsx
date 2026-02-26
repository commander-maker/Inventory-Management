import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import AgentDashboard from '../pages/Dashboard/AgentDashboard';
import InventoryList from '../pages/Inventory/InventoryList';
import FinanceDashboard from '../pages/Finance/Dashboard';
import VehicleManagement from '../pages/Vehicle/Vehicle_management';
import UserManagement from '../pages/User/User_management';
import Settings from '../pages/Settings/Settings';
import MyVehicle from '../pages/Vehicle/MyVehicle';
import MyDeliveries from '../pages/Delivery/MyDeliveries';
import AdminDeliveries from '../pages/Delivery/AdminDeliveries';
import CustomerList from '../pages/Customer/CustomerList';
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
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
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
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomerList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deliveries"
        element={
          <ProtectedRoute>
            <AdminDeliveries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-deliveries"
        element={
          <ProtectedRoute>
            <MyDeliveries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-vehicle"
        element={
          <ProtectedRoute>
            <MyVehicle />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent-dashboard"
        element={
          <ProtectedRoute>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}