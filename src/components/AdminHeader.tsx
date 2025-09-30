
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AuthHeader from './AuthHeader';

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('superAdminAuth');
    localStorage.removeItem('superAdminLoginTime');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    navigate('/admin/login');
  };

  const handleSuperAdmin = () => {
    navigate('/admin/superadmin/login');
  };

  return (
    <div className="bg-red-900 text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">New World Ent</h1>
            <p className="text-red-200 mt-1">Admin Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <AuthHeader />
          
          <Button 
            onClick={handleSuperAdmin}
            variant="outline"
            className="border-red-200 text-red-200 hover:bg-red-800 hover:text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            Super Admin
          </Button>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-red-200 text-red-200 hover:bg-red-800 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
