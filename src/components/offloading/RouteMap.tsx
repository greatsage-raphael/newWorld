// --- src/components/offloading/RouteMap.tsx ---

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as polyline from '@mapbox/polyline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';
import LiveLocationMarker from './LiveLocationMarker'; // CHANGED: Import the new component

// --- LEAFLET ICON FIX ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;
// --- END ICON FIX ---

interface Coordinates {
  lat: number;
  lon: number;
}

interface RouteMapProps {
  startCoords: Coordinates;
  endCoords: Coordinates;
  routeGeometry: string;
  liveLocation?: [number, number] | null; // CHANGED: Add optional prop for live location
}

// ... (FitBoundsUpdater component remains the same) ...
const FitBoundsUpdater: React.FC<{ bounds: L.LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

const RouteMap: React.FC<RouteMapProps> = ({ startCoords, endCoords, routeGeometry, liveLocation }) => { // CHANGED: Destructure new prop
  const decodedRoute = polyline.decode(routeGeometry).map(point => [point[0], point[1]] as [number, number]);

  const startPosition: [number, number] = [startCoords.lat, startCoords.lon];
  const endPosition: [number, number] = [endCoords.lat, endCoords.lon];
  const bounds = L.latLngBounds(decodedRoute);

  return (
    <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
            <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                <Map className="h-5 w-5" />
                Planned Route
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-96 w-full rounded-lg overflow-hidden border shadow-sm">
                <MapContainer 
                    bounds={bounds}
                    scrollWheelZoom={true} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={startPosition} title="Start Location" />
                    <Marker position={endPosition} title="Destination" />
                    <Polyline positions={decodedRoute} color="blue" weight={5} />
                    
                    {/* CHANGED: Conditionally render the live marker */}
                    {liveLocation && <LiveLocationMarker position={liveLocation} />}

                    {!liveLocation && <FitBoundsUpdater bounds={bounds} />}
                </MapContainer>
            </div>
        </CardContent>
    </Card>
  );
};

export default RouteMap;