
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Truck, MapPin, Weight, Hash, Calendar, CheckCircle } from 'lucide-react';

interface LoadingchargeDetailsProps {
  loadingcharge: any;
  isCompleted: boolean;
}

const LoadingchargeDetails: React.FC<LoadingchargeDetailsProps> = ({ loadingcharge, isCompleted }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getLocationDisplay = (location: any) => {
    // Handle new format first
    if (typeof location === 'object' && location.displayName) {
      return location.displayName;
    }
    // Handle old format for backward compatibility
    if (typeof location === 'object' && location.address && typeof location.address === 'string') {
      return location.address;
    }
    if (typeof location === 'string') {
      return location;
    }
    return 'Location not available';
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
            <Hash className="h-6 w-6" />
            Loading charge #{loadingcharge.transaction_id}
          </CardTitle>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="w-fit font-mono">
          {loadingcharge.transaction_uuid}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Driver Name</p>
                <p className="font-semibold text-lg">{loadingcharge.driver_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Vehicle Number</p>
                <Badge variant="outline" className="font-mono text-sm">
                  {loadingcharge.vehicle_number}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Loading charge</p>
                <p className="font-semibold text-lg">{loadingcharge.loading_charge}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Weight className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Net Mass</p>
                <p className="font-semibold text-lg">{loadingcharge.net_mass}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
          <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Loading Location</p>
            <p className="font-medium">{getLocationDisplay(loadingcharge.location)}</p>
          </div>
        </div>

        {/* Display vehicle photo if available */}
        {loadingcharge.vehicle_photo && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Vehicle Photo</p>
            <img
              src={loadingcharge.vehicle_photo}
              alt="Vehicle Photo"
              className="w-full max-w-md rounded-lg border"
            />
          </div>
        )}
        
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">{formatDate(loadingcharge.created_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingchargeDetails;
