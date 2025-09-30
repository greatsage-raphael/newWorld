import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Truck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tables } from '@/integrations/supabase/types';

interface DriverInfoSectionProps {
  vehicleNumber: string;
  selectedDriverId: string;
  onDriverSelect: (driverId: string) => void;
  truckDrivers: Tables<'truck_drivers'>[] | undefined;
  isLoadingDrivers: boolean;
}

const DriverInfoSection: React.FC<DriverInfoSectionProps> = ({
  vehicleNumber,
  selectedDriverId,
  onDriverSelect,
  truckDrivers,
  isLoadingDrivers,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
        <User className="h-5 w-5" />
        Driver Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="driver_name" className="flex items-center gap-2 text-blue-900">
            <User className="h-4 w-4" />
            Driver Name *
          </Label>
          <Select value={selectedDriverId} onValueChange={onDriverSelect} required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a registered driver..." />
            </SelectTrigger>
            <SelectContent>
              {isLoadingDrivers ? (
                <SelectItem value="loading" disabled>Loading drivers...</SelectItem>
              ) : (
                truckDrivers?.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.driver_name} ({driver.number_plate})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vehicle_number" className="flex items-center gap-2 text-blue-900">
            <Truck className="h-4 w-4" />
            Vehicle Number *
          </Label>
          <Input
            id="vehicle_number"
            value={vehicleNumber}
            placeholder="Select a driver to auto-fill"
            required
            className="mt-1 bg-gray-50 cursor-not-allowed"
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default DriverInfoSection;