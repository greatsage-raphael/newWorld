
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Hash, Users, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LoadingchargeFilters from '@/components/LoadingChargeFilters';
import LoadingchargeCards from '@/components/LoadingChargeCards';
import AdminHeader from '@/components/AdminHeader';

interface FilterState {
  transaction_id: string;
  user_id: string;
  driver_name: string;
  vehicle_number: string;
  loading_charge: string;
  net_mass: string;
  location: string;
}

const AdminDashboard = () => {
  const [filters, setFilters] = useState<FilterState>({
    transaction_id: '',
    user_id: '',
    driver_name: '',
    vehicle_number: '',
    loading_charge: '',
    net_mass: '',
    location: ''
  });

  const { data: loadingcharges, isLoading, error } = useQuery({
    queryKey: ['admin-loading-charges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loading_charge')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loading charges:', error);
        throw new Error('Failed to fetch loading charges');
      }

      return data;
    }
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filtercharges = (charges: any[], filters: FilterState) => {
    return charges.filter(charge => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        
        const chargeValue = key === 'location' 
          ? (typeof charge[key] === 'object' && charge[key]?.displayName ? charge[key].displayName : charge[key])
          : charge[key];
        
        return chargeValue?.toString()?.toLowerCase()?.includes(filterValue.toLowerCase());
      });
    });
  };

  const filteredcharges = useMemo(() => {
    if (!loadingcharges) {
      return [];
    }
    return filtercharges(loadingcharges, filters);
  }, [loadingcharges, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!loadingcharges) return { total: 0, inTransit: 0, completed: 0, uniqueDrivers: 0 };
    
    const inTransit = loadingcharges.filter(charge => 
      charge.status.toLowerCase().includes('transit')
    ).length;
    
    const completed = loadingcharges.filter(charge => 
      charge.status.toLowerCase().includes('completed') || 
      charge.status.toLowerCase().includes('delivered')
    ).length;
    
    const uniqueDrivers = new Set(loadingcharges.map(charge => charge.driver_name)).size;
    
    return {
      total: loadingcharges.length,
      inTransit,
      completed,
      uniqueDrivers
    };
  }, [loadingcharges]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <AdminHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-900 mx-auto"></div>
            <p className="mt-4 text-red-900">Loading admin data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load loading charges. Please try again.",
      variant: "destructive"
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Total Orders</CardTitle>
              <Hash className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{stats.inTransit}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Completed</CardTitle>
              <MapPin className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Active Drivers</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{stats.uniqueDrivers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-900 flex items-center gap-2">
              <Truck className="h-6 w-6" />
              All Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingchargeFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            
            <div className="mt-4">
              <div className="text-sm text-red-700 mb-4">
                Showing {filteredcharges?.length || 0} of {loadingcharges?.length || 0} orders
              </div>
              <LoadingchargeCards 
                charges={filteredcharges}
                emptyMessage="No orders found matching your filters"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
