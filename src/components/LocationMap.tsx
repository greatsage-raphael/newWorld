// src/components/LocationMap.tsx

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon issue with bundlers like Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


// Props for our map component
interface LocationMapProps {
  lat: number;
  lon: number;
}

// A helper component to programmatically update the map's view
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13); // Center the map on the new coordinates with zoom level 13
  }, [center, map]);
  return null;
};

const LocationMap: React.FC<LocationMapProps> = ({ lat, lon }) => {
  if (isNaN(lat) || isNaN(lon)) {
    return <div className="text-red-500">Invalid location coordinates.</div>;
  }

  const position: [number, number] = [lat, lon];

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border shadow-sm">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        <MapUpdater center={position} />
      </MapContainer>
    </div>
  );
};

export default LocationMap;