import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, UserX, Search, Shield, Truck, Tally3, Image as ImageIcon, Phone, Edit, Trash2, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminHeader from './AdminHeader';
import TruckInfoForm from './TruckInfoForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
// CORRECTED: No ['Row'] needed when using Tables
import { Tables } from '@/integrations/supabase/types';
import EditTruckDriverModal from './EditTruckDriverModal';


interface User {
  user_id: string;
  username: string;
  firstname: string;
  lastname: string;
  imageurl: string;
  phonenumbers: any[];
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

const SuperAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // CORRECTED: Use Tables<'truck_drivers'> directly for the row type
  const [editingDriver, setEditingDriver] = useState<Tables<'truck_drivers'> | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<Tables<'truck_drivers'> | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }

      return data as User[];
    }
  });

  const { data: truckDrivers, isLoading: isLoadingDrivers, error: driversError } = useQuery({
    queryKey: ['truck_drivers'],
    queryFn: async () => {
        const { data, error } = await supabase
            .from('truck_drivers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching truck drivers:', error);
            throw new Error('Failed to fetch truck drivers');
        }
        return data;
    }
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: !isBlocked, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to ${isBlocked ? 'unblock' : 'block'} user`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
      toast({
        title: "Success",
        description: `User ${variables.isBlocked ? 'unblocked' : 'blocked'} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteTruckDriverMutation = useMutation({
    // CORRECTED: The parameter is of type Tables<'truck_drivers'>
    mutationFn: async (driver: Tables<'truck_drivers'>) => {
      if (driver.license_photo_url) {
        const photoName = driver.license_photo_url.split('/').pop();
        if (photoName) {
          const { error: storageError } = await supabase.storage.from('driver-licenses').remove([photoName]);
          if (storageError) {
            console.warn("Could not delete photo, but proceeding with DB deletion:", storageError.message);
          }
        }
      }
      
      const { error: dbError } = await supabase.from('truck_drivers').delete().eq('id', driver.id);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Truck driver deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ['truck_drivers'] });
      setDriverToDelete(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: `Failed to delete driver: ${error.message}`, variant: "destructive" });
    }
  });


  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => 
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const stats = useMemo(() => {
    if (!users) return { total: 0, blocked: 0, active: 0 };
    
    const blocked = users.filter(user => user.is_blocked).length;
    return {
      total: users.length,
      blocked,
      active: users.length - blocked
    };
  }, [users]);

  const handleToggleBlock = (userId: string, isBlocked: boolean) => {
    toggleBlockMutation.mutate({ userId, isBlocked });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <AdminHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-900 mx-auto"></div>
            <p className="mt-4 text-red-900">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load users. Please try again.",
      variant: "destructive"
    });
  }
  
  if (driversError) {
    toast({
      title: "Error",
      description: "Failed to load truck drivers. Please try again.",
      variant: "destructive"
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        <TruckInfoForm />
        
        <Card className="my-8">
          <CardHeader>
            <CardTitle className="text-2xl text-red-900 flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Registered Truck Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDrivers ? (
              <div className="text-center p-4">Loading drivers...</div>
            ) : driversError ? (
              <div className="text-center p-4 text-red-600">Failed to load drivers.</div>
            ) : !truckDrivers || truckDrivers.length === 0 ? (
              <div className="text-center py-8 text-red-700">
                No truck drivers have been registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {truckDrivers.map(driver => (
                  <Card key={driver.id} className="flex flex-col justify-between overflow-hidden border-red-200 shadow-md hover:shadow-lg transition-shadow">
                    <div>
                      {driver.license_photo_url ? (
                        <img src={driver.license_photo_url} alt={driver.driver_name} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="w-full h-48 bg-red-50 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-red-300" />
                        </div>
                      )}
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-red-700 flex-shrink-0" />
                          <p className="font-semibold text-red-900 truncate">{driver.driver_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-red-700 flex-shrink-0" />
                          <p className="text-sm text-red-800">{driver.contact || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-red-700 flex-shrink-0" />
                          <Badge variant="outline" className="font-mono">{driver.number_plate}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tally3 className="h-4 w-4 text-red-700 flex-shrink-0" />
                          <p className="text-sm text-red-800">{driver.cubic_meters} m³</p>
                        </div>
                      </CardContent>
                    </div>
                    <CardFooter className="p-2 bg-red-50/50 border-t border-red-100 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingDriver(driver)}>
                        <Edit className="h-3 w-3 mr-1"/> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDriverToDelete(driver)} disabled={deleteTruckDriverMutation.isPending}>
                        <Trash2 className="h-3 w-3 mr-1"/> Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{stats.active}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Blocked Users</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{stats.blocked}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-900 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              User Management
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-red-700">
                Showing {filteredUsers.length} of {users?.length || 0} users
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div className="flex items-center gap-4">
                    {user.imageurl && (
                      <img 
                        src={user.imageurl} 
                        alt={user.firstname || ''}
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.firstname} {user.lastname}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {user.user_id}
                      </div>
                      {user.username && (
                        <div className="text-sm text-gray-500">
                          Username: {user.username}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={user.is_blocked ? "destructive" : "default"}>
                      {user.is_blocked ? "Blocked" : "Active"}
                    </Badge>
                    
                    <Button
                      variant={user.is_blocked ? "default" : "destructive"}
                      size="sm"
                      onClick={() => handleToggleBlock(user.user_id, !!user.is_blocked)}
                      disabled={toggleBlockMutation.isPending}
                    >
                      {user.is_blocked ? "Unblock" : "Block"}
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No users found matching your search criteria
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <EditTruckDriverModal 
        isOpen={!!editingDriver}
        onClose={() => setEditingDriver(null)}
        driver={editingDriver}
      />
      
      <AlertDialog open={!!driverToDelete} onOpenChange={(open) => !open && setDriverToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the driver 
              <strong> {driverToDelete?.driver_name} ({driverToDelete?.number_plate}) </strong> 
              and their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDriverToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => driverToDelete && deleteTruckDriverMutation.mutate(driverToDelete)} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteTruckDriverMutation.isPending}
            >
              {deleteTruckDriverMutation.isPending ? 'Deleting...' : 'Yes, delete driver'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default SuperAdmin;
