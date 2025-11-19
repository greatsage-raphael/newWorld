import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { truckIcon } from '@/components/offloading/truck-icon'; // Reuse our cool truck icon

// --- LEAFLET ICON FIX ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Define the shape of our truck data
interface ActiveTruck {
  transaction_id: number;
  transaction_uuid: string;
  driver_name: string;
  vehicle_number: string;
  contact?: string; // Add contact if available
  license_photo_url?: string; // Add license photo if available
  location: { coordinates: string; displayName: string };
  offloading_destination?: { displayName: string };
  created_at: string;
  lat: number;
  lng: number;
}

interface LiveTransitMapProps {
  trucks: ActiveTruck[];
}

// Helper to calculate time elapsed
const calculateTimeElapsed = (startTime: string) => {
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  const diffMinutes = Math.round((now - start) / (1000 * 60));
  
  if (diffMinutes < 60) return `${diffMinutes} minutes`;
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const LiveTransitMap: React.FC<LiveTransitMapProps> = ({ trucks }) => {
  const defaultPosition: [number, number] = [0.3476, 32.5825]; // Kampala

  if (!trucks || trucks.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-700">No trucks currently in transit.</h3>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border shadow-sm">
      <MapContainer
        center={defaultPosition}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup>
          {trucks.map(truck => (
            <Marker
              key={truck.transaction_id}
              position={[truck.lat, truck.lng]}
              icon={truckIcon}
            >
              <Popup minWidth={280}>
                <div className="space-y-3 p-1">
                  <h3 className="text-lg font-bold text-blue-900 flex items-center justify-between">
                    {truck.driver_name}
                    <span className="text-sm font-mono bg-gray-100 p-1 rounded">#{truck.transaction_id}</span>
                  </h3>
                  
                  {truck.license_photo_url && (
                    <img
                      src={truck.license_photo_url}
                      alt={`${truck.driver_name}'s license`}
                      className="w-full h-32 object-cover rounded-md border"
                    />
                  )}
                  
                  <div className="text-sm space-y-2">
                    <p><strong>Vehicle:</strong> {truck.vehicle_number}</p>
                    <p><strong>Contact:</strong> {truck.contact || 'N/A'}</p>
                    <p><strong>Loading Location:</strong> {truck.location?.displayName || 'N/A'}</p>
                    <p><strong>Offloading Destination:</strong> {truck.offloading_destination?.displayName || 'N/A'}</p>
                    <p><strong>Time Elapsed:</strong> {calculateTimeElapsed(truck.created_at)}</p>
                  </div>
                  
                  <a href={`/offloading/${truck.transaction_uuid}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold text-sm">
                    View Details &rarr;
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default LiveTransitMap;