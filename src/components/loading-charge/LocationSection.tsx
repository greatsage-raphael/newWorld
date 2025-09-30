
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { LocationData, getCurrentLocation } from '@/utils/locationUtils';

interface LocationSectionProps {
  locationEnabled: boolean;
  currentLocation: LocationData | null;
  onLocationEnabledChange: (enabled: boolean) => void;
  onLocationChange: (location: LocationData | null) => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  locationEnabled,
  currentLocation,
  onLocationEnabledChange,
  onLocationChange
}) => {
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const handleGetLocation = async () => {
    setIsCapturingLocation(true);
    const location = await getCurrentLocation();
    setIsCapturingLocation(false);
    onLocationChange(location);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Location
      </h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="location-services"
            checked={locationEnabled}
            onCheckedChange={onLocationEnabledChange}
          />
          <Label htmlFor="location-services">Enable Location Services</Label>
        </div>

        {locationEnabled && (
          <div className="space-y-4">
            {!currentLocation ? (
              <Button
                type="button"
                onClick={handleGetLocation}
                disabled={isCapturingLocation}
                className="bg-green-600 hover:bg-green-700"
              >
                {isCapturingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Current Location
                  </>
                )}
              </Button>
            ) : (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-green-800">Location Captured</p>
                    <p className="text-sm text-green-700"><strong>Address:</strong> {currentLocation.displayName}</p>
                    <p className="text-sm text-green-700"><strong>Coordinates:</strong> {currentLocation.coordinates}</p>
                    {currentLocation.address.state && (
                      <p className="text-sm text-green-700"><strong>State:</strong> {currentLocation.address.state}</p>
                    )}
                    {currentLocation.address.country && (
                      <p className="text-sm text-green-700"><strong>Country:</strong> {currentLocation.address.country}</p>
                    )}
                    {currentLocation.address.village && (
                      <p className="text-sm text-green-700"><strong>Village:</strong> {currentLocation.address.village}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSection;
