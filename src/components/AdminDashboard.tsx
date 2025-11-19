import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Hash, Users, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LoadingchargeFilters from '@/components/LoadingChargeFilters';
import LoadingchargeCards from '@/components/LoadingChargeCards';
import AdminHeader from '@/components/AdminHeader';
import LiveTransitMap from '@/components/LiveTransitMap'; // Import the new map component

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

  // Query for all loading charges (used for stats and the "All Orders" list)
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

  // New query specifically for trucks in transit, joined with driver details for the map
  const { data: activeTrucksData, isLoading: isLoadingTrucks } = useQuery({
    queryKey: ['active-trucks-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loading_charge')
        .select(`
          transaction_id,
          transaction_uuid,
          driver_name,
          vehicle_number,
          location,
          offloading_destination,
          created_at,
          truck_drivers (
            contact,
            license_photo_url
          )
        `)
        .eq('status', 'In transit');

      if (error) {
        toast({ title: "Map Error", description: "Could not fetch active truck data. Check table relationships.", variant: "destructive" });
        throw new Error('Failed to fetch active trucks');
      }

      // Process the data to be map-friendly
      return data
        .map(truck => {
          // Flatten the nested driver info which might be an array or object
          const driverInfo = Array.isArray(truck.truck_drivers) ? truck.truck_drivers[0] : truck.truck_drivers;

          try {
            // Ensure location and coordinates exist before trying to parse
            if (truck.location && typeof truck.location === 'object' && 'coordinates' in truck.location) {
              const locationObj = truck.location as any;
              const [lat, lng] = locationObj.coordinates.split(',').map(Number);
              if (!isNaN(lat) && !isNaN(lng)) {
                return {
                  transaction_id: truck.transaction_id,
                  transaction_uuid: truck.transaction_uuid,
                  driver_name: truck.driver_name,
                  vehicle_number: truck.vehicle_number,
                  contact: driverInfo?.contact,
                  license_photo_url: driverInfo?.license_photo_url,
                  location: {
                    coordinates: locationObj.coordinates,
                    displayName: locationObj.displayName || 'Unknown Location'
                  },
                  offloading_destination: truck.offloading_destination ? {
                    displayName: (truck.offloading_destination as any).displayName || 'Unknown Destination'
                  } : undefined,
                  created_at: truck.created_at,
                  lat,
                  lng
                };
              }
            }
            return null; // Skip if location data is malformed
          } catch (e) {
            console.warn(`Could not parse location for truck #${truck.transaction_id}`, truck.location);
            return null;
          }
        })
        .filter(Boolean); // Remove any null entries from the final array
    },
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
        return String(chargeValue)?.toLowerCase()?.includes(filterValue.toLowerCase());
      });
    });
  };

  const filteredcharges = useMemo(() => {
    if (!loadingcharges) return [];
    return filtercharges(loadingcharges, filters);
  }, [loadingcharges, filters]);

  const stats = useMemo(() => {
    if (!loadingcharges) return { total: 0, inTransit: 0, completed: 0, uniqueDrivers: 0 };
    const inTransit = loadingcharges.filter(charge => charge.status?.toLowerCase().includes('transit')).length;
    const completed = loadingcharges.filter(charge => charge.status?.toLowerCase().includes('completed')).length;
    const uniqueDrivers = new Set(loadingcharges.map(charge => charge.driver_name)).size;
    return { total: loadingcharges.length, inTransit, completed, uniqueDrivers };
  }, [loadingcharges]);

  if (isLoading || isLoadingTrucks) {
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
      description: "Failed to load dashboard data. Please try again.",
      variant: "destructive"
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <AdminHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Total Orders</CardTitle>
              <Hash className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-900">{stats.total}</div></CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-900">{stats.inTransit}</div></CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Completed</CardTitle>
              <MapPin className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-900">{stats.completed}</div></CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Active Drivers</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-900">{stats.uniqueDrivers}</div></CardContent>
          </Card>
        </div>

        {/* Live Transit Map Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-900 flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Live Transit Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LiveTransitMap trucks={activeTrucksData || []} />
          </CardContent>
        </Card>

        {/* All Orders Section */}
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