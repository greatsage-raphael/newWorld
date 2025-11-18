// src/pages/Journey.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io, Socket } from 'socket.io-client';
import { supabase } from '@/integrations/supabase/client';
import { fetchRoute } from '@/utils/routeUtils';
import { truckIcon } from '@/components/offloading/truck-icon';
import * as polyline from '@mapbox/polyline'; // Import for decoding the route

// --- LEAFLET ICON FIX ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// --- TYPE DEFINITIONS ---
interface Coordinates { lat: number; lon: number; }
interface RouteStep { maneuver: { instruction: string }; }

// --- HELPER COMPONENTS ---
const MapUpdater: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 16, { animate: true, duration: 1.5 });
  }, [position, map]);
  return null;
};

const parseCoords = (location: any): Coordinates | null => {
  if (!location) return null;
  try {
    if (location.lat && location.lon) {
      return { lat: parseFloat(location.lat), lon: parseFloat(location.lon) };
    }
    if (location.coordinates) {
      const [lat, lon] = location.coordinates.split(',').map(parseFloat);
      return { lat, lon };
    }
  } catch (e) {
    console.error("Could not parse coordinates from location object:", location);
  }
  return null;
};

// --- MAIN COMPONENT ---
const Journey = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [liveLocation, setLiveLocation] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<{ geometry: string; steps: RouteStep[] } | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ start: Coordinates, end: Coordinates } | null>(null);

  const { data: loadingcharge, isLoading } = useQuery({
    queryKey: ['loading-charge-journey', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('loading_charge').select('*').eq('transaction_uuid', slug).single();
      if (error) throw new Error('Failed to fetch loading charge');
      return data;
    },
  });

  useEffect(() => {
    if (!loadingcharge) return;

    const setupJourney = async () => {
      const start = parseCoords(loadingcharge.location);
      const end = parseCoords(loadingcharge.offloading_destination);

      if (start && end) {
        setRouteCoords({ start, end });
        try {
          const routeData = await fetchRoute(start, end);
          if (routeData && routeData.routes && routeData.routes.length > 0) {
            const firstRoute = routeData.routes[0];
            const firstLeg = firstRoute.legs[0];
            setRoute({ geometry: firstRoute.geometry, steps: firstLeg.steps });
          } else {
            console.error("Route data is invalid:", routeData);
          }
        } catch (error) {
          console.error("Failed to fetch route:", error);
        }
      }

      socketRef.current = io(API_BASE_URL);
      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket server');
        socketRef.current?.emit('joinJourney', slug);
      });

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLiveLocation([latitude, longitude]);
          socketRef.current?.emit('locationUpdate', { journeyId: slug, lat: latitude, lng: longitude });
        },
        (error) => console.error("Geolocation watch error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    };

    setupJourney();

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      socketRef.current?.disconnect();
    };
  }, [loadingcharge, slug]);

  const handleCompleteJourney = () => {
    navigate(`/offloading/${slug}`);
  };

  if (isLoading || !route || !routeCoords || !liveLocation) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        <p className="mt-4 text-lg">Preparing Navigation...</p>
      </div>
    );
  }

  const decodedRoute = polyline.decode(route.geometry);
  const currentStep = route.steps.length > 0 ? route.steps[0].maneuver.instruction : "You have arrived.";

  return (
    <div className="h-screen w-screen relative">
      <MapContainer center={liveLocation} zoom={16} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[routeCoords.start.lat, routeCoords.start.lon]} title="Start" />
        <Marker position={[routeCoords.end.lat, routeCoords.end.lon]} title="Destination" />
        <Polyline positions={decodedRoute as L.LatLngExpression[]} color="blue" weight={5} />
        {liveLocation && <Marker position={liveLocation} icon={truckIcon} />}
        {liveLocation && <MapUpdater position={liveLocation} />}
      </MapContainer>

      <div className="absolute top-0 left-0 right-0 p-4 z-[1000] bg-gradient-to-b from-black/70 to-transparent">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Next instruction:</h2>
            <p className="text-lg md:text-xl text-gray-600 mt-1">{currentStep}</p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 z-[1000] flex justify-center">
         <button 
           onClick={handleCompleteJourney}
           className="bg-red-600 text-white font-bold py-4 px-10 rounded-full shadow-lg text-lg md:text-xl hover:bg-red-700 transition-colors"
         >
           Complete Journey
         </button>
      </div>
    </div>
  );
};

export default Journey;