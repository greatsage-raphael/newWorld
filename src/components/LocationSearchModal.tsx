// src/components/LocationSearchModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandItem, CommandList } from '@/components/ui/command';
import { toast } from '@/hooks/use-toast';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// --- LEAFLET ICON FIX ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;
// --- END ICON FIX ---

const DEFAULT_CENTER: [number, number] = [0.3476, 32.5825];
const DEFAULT_ZOOM = 7;

interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: { displayName: string; lat: string; lon: string }) => void;
}

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ isOpen, onClose, onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [mapState, setMapState] = useState({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.locationiq.com/v1/autocomplete?key=${API_KEY}&q=${encodeURIComponent(query)}&limit=5&normalizecity=1`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const data: LocationSuggestion[] = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not fetch locations.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (suggestion: LocationSuggestion) => {
    const newCenter: [number, number] = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    setQuery(suggestion.display_name);
    setSelectedLocation(suggestion);
    setSuggestions([]);
    setMapState({ center: newCenter, zoom: 14 });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation({
        displayName: selectedLocation.display_name,
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedLocation(null);
    setMapState({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0 flex flex-col h-[80vh] max-h-[700px]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Search for Offloading Location</DialogTitle>
        </DialogHeader>

        {/* This container will manage the layout with Flexbox */}
        <div className="px-6 flex-grow relative flex flex-col">
          
          {/* Search Bar and Suggestions Overlay */}
          <div className="relative z-20 flex-shrink-0">
            <Command className="rounded-lg border shadow-md bg-background">
              <Input
                placeholder="Type an address or place..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 text-sm outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </Command>

            {(suggestions.length > 0 || isLoading) && (
              <div className="absolute top-full w-full mt-1">
                <Command className="rounded-md border shadow-lg">
                  <CommandList className="max-h-48">
                    {isLoading && <CommandEmpty>Loading...</CommandEmpty>}
                    {suggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion.place_id}
                        onSelect={() => handleSelect(suggestion)}
                        className="cursor-pointer"
                      >
                        {suggestion.display_name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </div>
            )}
          </div>

          {/* Map Container - it will grow to fill available space */}
          <div className="flex-grow w-full rounded-lg overflow-hidden mt-4 border z-10">
            <MapContainer
              center={mapState.center}
              zoom={mapState.zoom}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {selectedLocation && (
                <Marker position={[parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon)]} />
              )}
              <MapUpdater center={mapState.center} zoom={mapState.zoom} />
            </MapContainer>
          </div>
        </div>
        
        <DialogFooter className="p-6 pt-4 flex-shrink-0">
          <Button onClick={handleConfirm} disabled={!selectedLocation}>
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSearchModal;