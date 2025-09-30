
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Hash, Home, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LoadingchargeFilters from '@/components/LoadingChargeFilters';
import LoadingchargeCards from '@/components/LoadingChargeCards';
import AuthHeader from '@/components/AuthHeader';

const Transit = () => {
  const navigate = useNavigate();
  const [allchargesFilters, setAllchargesFilters] = useState({
    transaction_id: '',
    user_id: '',
    driver_name: '',
    vehicle_number: '',
    loading_charge: '',
    net_mass: '',
    location: ''
  });

  const { data: loadingcharges, isLoading, error } = useQuery({
    queryKey: ['loading-charges-in-transit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loading_charge')
        .select('*')
        .eq('status', 'In transit')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loading charges:', error);
        throw new Error('Failed to fetch loading charges');
      }

      return data;
    }
  });

  const handleAllchargesFilterChange = (key: string, value: string) => {
    setAllchargesFilters(prev => ({ ...prev, [key]: value }));
  };

  const filtercharges = (charges: any[], filters: typeof allchargesFilters) => {
    return charges.filter(charge => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        
        const chargeValue = key === 'location' 
          ? (typeof charge[key] === 'object' && charge[key].displayName ? charge[key].displayName : charge[key])
          : charge[key];
        
        return chargeValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  };

  const filteredcharges = useMemo(() => {
    if (!loadingcharges) {
      return [];
    }

    return filtercharges(loadingcharges, allchargesFilters);
  }, [loadingcharges, allchargesFilters]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-blue-900">Loading transit data...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <AuthHeader />
      
      {/* Header */}
      <div className="bg-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">New World Ent</h1>
            <p className="text-blue-200 mt-1">Transit Dashboard</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="border-blue-200 text-blue-200 hover:bg-blue-800 hover:text-white"
            >
              <Home className="h-4 w-4 mr-2" />
              Back Home
            </Button>
            
            <Button 
              onClick={() => navigate('/admin')}
              variant="outline"
              className="border-blue-200 text-blue-200 hover:bg-blue-800 hover:text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">In Transit charges</CardTitle>
              <Hash className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {loadingcharges?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Filtered Results</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {filteredcharges?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* In Transit Loading charges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
              <Truck className="h-6 w-6" />
              In Transit Loading charges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingchargeFilters 
              filters={allchargesFilters}
              onFilterChange={handleAllchargesFilterChange}
            />
            <LoadingchargeCards 
              charges={filteredcharges}
              emptyMessage="No loading charges in transit found"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transit;
