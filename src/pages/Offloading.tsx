// src/pages/Offloading.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { uploadImageToStorage } from '@/utils/imageUpload';
import { calculateDistance } from '@/utils/distanceUtils';
import { fetchRoute } from '@/utils/routeUtils';
import OffloadingHeader from '@/components/offloading/OffloadingHeader';
import LoadingchargeDetails from '@/components/offloading/LoadingChargeDetails';
import LocationCapture from '@/components/offloading/LocationCapture';
import PhotoCapture from '@/components/offloading/PhotoCapture';
import ConfirmationSection from '@/components/offloading/ConfirmationSection';
import DistanceDisplay from '@/components/offloading/DistanceDisplay';
import TimeDisplay from '@/components/offloading/TimeDisplay';
import RouteMap from '@/components/offloading/RouteMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface LocationData {
  address: { [key: string]: string | undefined };
  coordinates: string;
  displayName: string;
  [key: string]: any;
}

interface Coordinates {
  lat: number;
  lon: number;
}

// --- COMPONENT ---
const Offloading = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for the FINAL confirmation process
  const [isConfirming, setIsConfirming] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);

  // State for the route map PREVIEW
  const [routeGeometry, setRouteGeometry] = useState<string | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ start: Coordinates, end: Coordinates } | null>(null);

  // Fetch the initial loading charge data
  const { data: loadingcharge, isLoading, error } = useQuery({
    queryKey: ['loading-charge', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('loading_charge').select('*').eq('transaction_uuid', slug).single();
      if (error) throw new Error('Failed to fetch loading charge details.');
      return data;
    },
    enabled: !!slug,
  });

  // --- HELPER FUNCTIONS ---
  const parseCoords = (location: any): Coordinates | null => {
    if (!location) return null;
    try {
      if (location.coordinates) { // From our custom LocationData format
        const [lat, lon] = location.coordinates.split(',').map(parseFloat);
        return { lat, lon };
      }
      if (location.lat && location.lon) { // From LocationIQ/database format
        const { lat, lon } = JSON.parse(JSON.stringify(location));
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
      }
    } catch (e) {
      console.error("Could not parse coordinates from location object:", location, e);
    }
    return null;
  };

  // --- EFFECTS ---

  // Effect to calculate distance when offloading location is captured
  useEffect(() => {
    if (currentLocation && loadingcharge?.location) {
      const startCoords = parseCoords(loadingcharge.location);
      const endCoords = parseCoords(currentLocation);
      if (startCoords && endCoords) {
        const distance = calculateDistance(
          `${startCoords.lat}, ${startCoords.lon}`,
          `${endCoords.lat}, ${endCoords.lon}`
        );
        setCalculatedDistance(distance);
      }
    }
  }, [currentLocation, loadingcharge?.location]);

  // Effect to fetch the route for the preview map
  useEffect(() => {
    if (loadingcharge && loadingcharge.location && loadingcharge.offloading_destination) {
      const start = parseCoords(loadingcharge.location);
      const end = parseCoords(loadingcharge.offloading_destination);

      if (start && end) {
        setRouteCoords({ start, end });
        fetchRoute(start, end)
          .then(routeData => {
            if (routeData.routes && routeData.routes.length > 0) {
              setRouteGeometry(routeData.routes[0].geometry);
            }
          })
          .catch(err => console.error("Failed to fetch route geometry for preview:", err));
      }
    }
  }, [loadingcharge]);

  // --- MUTATION for FINAL CONFIRMATION ---
  const confirmReceiptMutation = useMutation({
    mutationFn: async () => {
      if (!slug) throw new Error('No transaction UUID provided');

      let offloadingPhotoUrl: string | null = null;
      if (capturedPhoto) {
        setIsUploadingImage(true);
        const fileName = `${slug}_offloading_${Date.now()}.jpg`;
        offloadingPhotoUrl = await uploadImageToStorage(capturedPhoto, fileName);
        setIsUploadingImage(false);
      }

      const updateData = {
        status: 'completed',
        offloading_location: currentLocation as Json,
        offloading_photo: offloadingPhotoUrl,
        distance_travelled: calculatedDistance,
        time_taken: timeTaken,
      };

      const { data, error } = await supabase.from('loading_charge').update(updateData).eq('transaction_uuid', slug).select();
      if (error) throw new Error(`Failed to confirm receipt: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Loading charge confirmed successfully!" });
      queryClient.invalidateQueries({ queryKey: ['loading-charge', slug] });
      queryClient.invalidateQueries({ queryKey: ['loading-charges'] });
      navigate('/transit');
    },
    onError: (err) => {
      const error = err as Error;
      toast({ title: "Error", description: `Failed to confirm: ${error.message}`, variant: "destructive" });
      setIsConfirming(false);
      setIsUploadingImage(false);
    }
  });

  const handleConfirmReceipt = () => {
    if (!currentLocation || !capturedPhoto) {
      toast({ title: "Error", description: "Please capture location and photo before confirming.", variant: "destructive" });
      return;
    }
    setIsConfirming(true);
    confirmReceiptMutation.mutate();
  };

  const handleBackClick = () => navigate('/transit');

  // --- RENDER LOGIC ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-blue-900">Loading Mission Details...</p>
        </div>
      </div>
    );
  }

  if (error || !loadingcharge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Charge Not Found</h2>
          <p className="text-gray-600 mb-4">The requested loading charge could not be found.</p>
          <Button onClick={handleBackClick}>Back to Transit</Button>
        </div>
      </div>
    );
  }
  
  const isFormComplete = !!(currentLocation && capturedPhoto);
  const isCompleted = loadingcharge?.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pb-10">
      <OffloadingHeader onBackClick={handleBackClick} />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <LoadingchargeDetails loadingcharge={loadingcharge} isCompleted={isCompleted} />

        {/* Journey Start Section (only for active trips) */}
        {!isCompleted && routeGeometry && routeCoords && (
          <Card className="border-l-4 border-l-green-500">
             <CardContent className="pt-6 space-y-4">
              <h3 className="text-xl font-semibold text-green-900">Ready for Transit</h3>
              <p className="text-gray-600">A route has been planned. Press the button below to begin live navigation and tracking.</p>
              <RouteMap
                startCoords={routeCoords.start}
                endCoords={routeCoords.end}
                routeGeometry={routeGeometry}
              />
              <div className="flex justify-center pt-4">
                <Link to={`/journey/${slug}`}>
                  <Button className="bg-green-600 hover:bg-green-700 text-lg py-6 px-8 rounded-full shadow-lg">
                    <PlayCircle className="h-6 w-6 mr-3" />
                    Start Journey & Navigation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Offloading Confirmation Steps (only for active trips) */}
        {!isCompleted && (
          <>
            <LocationCapture
              currentLocation={currentLocation}
              isCapturingLocation={isCapturingLocation}
              onLocationCapture={setCurrentLocation}
              onCapturingStateChange={setIsCapturingLocation}
              onTimeTakenCalculation={setTimeTaken}
              loadingchargeCreatedAt={loadingcharge.created_at}
            />
            {calculatedDistance > 0 && <DistanceDisplay distance={calculatedDistance} />}
            {timeTaken > 0 && <TimeDisplay timeTaken={timeTaken} />}
            <PhotoCapture
              capturedPhoto={capturedPhoto}
              onPhotoCapture={setCapturedPhoto}
            />
          </>
        )}

        {/* Final Confirmation Button / Completed Status */}
        <ConfirmationSection
          isFormComplete={isFormComplete}
          isConfirming={isConfirming}
          isUploadingImage={isUploadingImage}
          onConfirmReceipt={handleConfirmReceipt}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
};

export default Offloading;