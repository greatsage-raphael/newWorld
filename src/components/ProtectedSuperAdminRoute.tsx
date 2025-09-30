
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedSuperAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedSuperAdminRoute: React.FC<ProtectedSuperAdminRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('superAdminAuth') === 'true';
  const loginTime = localStorage.getItem('superAdminLoginTime');
  
  // Check if login is still valid (24 hours)
  if (loginTime) {
    const now = Date.now();
    const loginTimestamp = parseInt(loginTime);
    const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60);
    
    if (hoursSinceLogin > 24) {
      localStorage.removeItem('superAdminAuth');
      localStorage.removeItem('superAdminLoginTime');
      return <Navigate to="/admin/superadmin/login" replace />;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/superadmin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedSuperAdminRoute;
