
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getCurrentLocation, LocationData } from '@/utils/locationUtils';

interface LocationCaptureProps {
  currentLocation: LocationData | null;
  isCapturingLocation: boolean;
  onLocationCapture: (location: LocationData) => void;
  onCapturingStateChange: (capturing: boolean) => void;
  onTimeTakenCalculation: (timeTaken: number) => void;
  loadingchargeCreatedAt: string;
  loadingLocation?: LocationData | null;
}

const LocationCapture: React.FC<LocationCaptureProps> = ({
  currentLocation,
  isCapturingLocation,
  onLocationCapture,
  onCapturingStateChange,
  onTimeTakenCalculation,
  loadingchargeCreatedAt,
  loadingLocation
}) => {
  const handleGetCurrentLocation = async () => {
    onCapturingStateChange(true);
    
    try {
      const location = await getCurrentLocation();
      if (location) {
        // Calculate time taken in minutes
        const currentTime = new Date();
        const createdTime = new Date(loadingchargeCreatedAt);
        const timeTakenMinutes = (currentTime.getTime() - createdTime.getTime()) / (1000 * 60);
        
        onLocationCapture(location);
        onTimeTakenCalculation(timeTakenMinutes);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      onCapturingStateChange(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="text-xl text-orange-900 flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Current Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentLocation ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Location Captured</span>
            </div>
            <div className="space-y-2 text-green-700 text-sm">
              <p><strong>Address:</strong> {currentLocation.displayName}</p>
              <p><strong>Coordinates:</strong> {currentLocation.coordinates}</p>
              {currentLocation.address.state && (
                <p><strong>State:</strong> {currentLocation.address.state}</p>
              )}
              {currentLocation.address.country && (
                <p><strong>Country:</strong> {currentLocation.address.country}</p>
              )}
              {currentLocation.address.village && (
                <p><strong>Village:</strong> {currentLocation.address.village}</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">Please capture your current location to proceed.</p>
            <Button 
              onClick={handleGetCurrentLocation}
              disabled={isCapturingLocation}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCapturingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Capture Current Location
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationCapture;
