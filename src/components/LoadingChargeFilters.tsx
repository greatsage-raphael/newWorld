
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface FilterProps {
  filters: {
    transaction_id: string;
    user_id: string;
    driver_name: string;
    vehicle_number: string;
    loading_charge: string;
    net_mass: string;
    location: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

const LoadingchargeFilters: React.FC<FilterProps> = ({ filters, onFilterChange }) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="transaction_id">Transaction ID</Label>
            <Input
              id="transaction_id"
              placeholder="Filter by transaction ID..."
              value={filters.transaction_id}
              onChange={(e) => onFilterChange('transaction_id', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="user_id">User ID</Label>
            <Input
              id="user_id"
              placeholder="Filter by user ID..."
              value={filters.user_id}
              onChange={(e) => onFilterChange('user_id', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="driver_name">Driver Name</Label>
            <Input
              id="driver_name"
              placeholder="Filter by driver name..."
              value={filters.driver_name}
              onChange={(e) => onFilterChange('driver_name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="vehicle_number">Vehicle Number</Label>
            <Input
              id="vehicle_number"
              placeholder="Filter by vehicle number..."
              value={filters.vehicle_number}
              onChange={(e) => onFilterChange('vehicle_number', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="loading_charge">Loading charge</Label>
            <Input
              id="loading_charge"
              placeholder="Filter by charge..."
              value={filters.loading_charge}
              onChange={(e) => onFilterChange('loading_charge', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="net_mass">Net Mass</Label>
            <Input
              id="net_mass"
              placeholder="Filter by net mass..."
              value={filters.net_mass}
              onChange={(e) => onFilterChange('net_mass', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) => onFilterChange('location', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingchargeFilters;
