
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Shield, Lock } from 'lucide-react';

const SuperAdminLogin = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple delay to simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === 'ntandaPassword') {
      localStorage.setItem('superAdminAuth', 'true');
      localStorage.setItem('superAdminLoginTime', Date.now().toString());
      toast({
        title: "Super Admin Access Granted",
        description: "Welcome to Super Admin panel!",
      });
      navigate('/admin/superadmin');
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password for Super Admin access",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-900">Super Admin Access</CardTitle>
          <p className="text-red-600">Enter password to access Super Admin panel</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-red-600" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter Super Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Access Super Admin'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              className="w-full"
              onClick={() => navigate('/admin/dashboard')}
            >
              Back to Admin Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminLogin;
