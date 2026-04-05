// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/router/index.jsx
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  LoginPage, SignupPage, DashboardPage, ProductsPage,
  CategoriesPage, FloorsPage, OrdersPage, PaymentsPage,
  CustomersPage, ReportsPage, SettingsPage, FloorViewPage,
  OrderScreenPage, PaymentPage, KitchenDisplayPage,
  CustomerDisplayPage, SelfOrderPage
} from '../pages';

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'floors', element: <FloorsPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/pos/:configId/floor',
    element: (
      <ProtectedRoute>
        <FloorViewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pos/:configId/order/:tableId',
    element: (
      <ProtectedRoute>
        <OrderScreenPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pos/:configId/payment/:orderId',
    element: (
      <ProtectedRoute>
        <PaymentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/kitchen',
    element: <KitchenDisplayPage />,
  },
  {
    path: '/customer-display',
    element: <CustomerDisplayPage />,
  },
  {
    path: '/self-order/:token',
    element: <SelfOrderPage />,
  }
]);
