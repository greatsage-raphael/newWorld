
import { toast } from '@/hooks/use-toast';

export interface LocationData {
  address: {
    state?: string;
    country?: string;
    village?: string;
    country_code?: string;
    'ISO3166-2-lvl3'?: string;
    'ISO3166-2-lvl4'?: string;
  };
  coordinates: string;
  displayName: string;
}

export const getCurrentLocation = (): Promise<LocationData | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive"
      });
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const locationData: LocationData = {
            address: {
              state: data.address?.state,
              country: data.address?.country,
              village: data.address?.village,
              country_code: data.address?.country_code,
              'ISO3166-2-lvl3': data.address?.['ISO3166-2-lvl3'],
              'ISO3166-2-lvl4': data.address?.['ISO3166-2-lvl4']
            },
            coordinates: `${latitude}, ${longitude}`,
            displayName: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          };
          
          toast({
            title: "Success",
            description: "Location captured successfully!",
          });
          
          resolve(locationData);
        } catch (error) {
          console.error('Error getting location details:', error);
          const fallbackLocation: LocationData = {
            address: {},
            coordinates: `${latitude}, ${longitude}`,
            displayName: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          };
          
          toast({
            title: "Success",
            description: "Location captured successfully!",
          });
          
          resolve(fallbackLocation);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Error",
          description: "Unable to retrieve your location. Please try again.",
          variant: "destructive"
        });
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};
