
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Truck, MapPin, Weight, Hash, Calendar } from 'lucide-react';

interface Loadingcharge {
  transaction_id: number;
  transaction_uuid: string;
  user_id: string;
  driver_name: string;
  vehicle_number: string;
  loading_charge: string;
  net_mass: string;
  location: any;
  status: string;
  created_at: string;
}

interface LoadingchargeCardsProps {
  charges: Loadingcharge[];
  emptyMessage?: string;
}

const LoadingchargeCards: React.FC<LoadingchargeCardsProps> = ({ 
  charges, 
  emptyMessage = "No loading charges found" 
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getLocationDisplay = (location: any) => {
    if (typeof location === 'object' && location.displayName) {
      return location.displayName;
    }
    if (typeof location === 'string') {
      return location;
    }
    return 'Location not available';
  };

  const handleCardClick = (transactionUuid: string) => {
    navigate(`/offloading/${transactionUuid}`);
  };

  if (!charges || charges.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500">Loading charges will appear here once they are submitted.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {charges.map((charge) => (
        <Card 
          key={charge.transaction_id} 
          className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 cursor-pointer hover:scale-105"
          onClick={() => handleCardClick(charge.transaction_uuid)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-blue-900">#{charge.transaction_id}</span>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {charge.transaction_uuid.slice(0, 8)}...
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Driver</p>
                    <p className="font-medium">{charge.driver_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Vehicle</p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {charge.vehicle_number}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">charge</p>
                  <p className="font-medium">{charge.loading_charge}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Net Mass</p>
                    <p className="font-medium">{charge.net_mass}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-2 pt-2 border-t">
              <MapPin className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm">{getLocationDisplay(charge.location)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm">{formatDate(charge.created_at)}</p>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 font-mono pt-2 border-t">
              User: {charge.user_id.slice(0, 8)}...
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoadingchargeCards;
