
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Route, MapPin } from 'lucide-react';
import { formatDistance } from '@/utils/distanceUtils';

interface DistanceDisplayProps {
  distance: number;
}

const DistanceDisplay: React.FC<DistanceDisplayProps> = ({ distance }) => {

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
          <Route className="h-6 w-6 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Distance Travelled</p>
            <p className="font-bold text-2xl text-green-800">{formatDistance(distance)}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-green-600">
              <MapPin className="h-4 w-4" />
              <span>From loading to offloading location</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DistanceDisplay;
