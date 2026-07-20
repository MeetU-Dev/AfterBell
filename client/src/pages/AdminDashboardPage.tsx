import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
  return <Navigate to="/parent/dashboard" replace />;
};

export default AdminDashboardPage;