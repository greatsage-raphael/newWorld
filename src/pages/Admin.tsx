
import React from 'react';
import { Navigate } from 'react-router-dom';

const Admin = () => {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <Navigate to="/admin/login" replace />;
};

export default Admin;
