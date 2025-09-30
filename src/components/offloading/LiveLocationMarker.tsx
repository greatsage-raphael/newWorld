// --- src/components/offloading/LiveLocationMarker.tsx ---

import React, { useEffect, useRef } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { truckIcon } from './truck-icon';

interface LiveLocationMarkerProps {
  position: [number, number];
}

const LiveLocationMarker: React.FC<LiveLocationMarkerProps> = ({ position }) => {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (position) {
      // Pan the map to the new location smoothly
      map.flyTo(position, map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [position, map]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={truckIcon}
      zIndexOffset={1000} // Ensure it's on top
    />
  );
};

export default LiveLocationMarker;