
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  const loginTime = localStorage.getItem('adminLoginTime');
  
  // Check if login is still valid (24 hours)
  if (loginTime) {
    const now = Date.now();
    const loginTimestamp = parseInt(loginTime);
    const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60);
    
    if (hoursSinceLogin > 24) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminLoginTime');
      return <Navigate to="/admin/login" replace />;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
