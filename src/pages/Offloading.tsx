import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

// --- MAIN COMPONENT ---
const Offloading = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for the confirmation process
  const [isConfirming, setIsConfirming] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);

  // State for the route map
  const [routeGeometry, setRouteGeometry] = useState<string | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ start: Coordinates, end: Coordinates } | null>(null);

  const { data: loadingcharge, isLoading, error } = useQuery({
    queryKey: ['loading-charge', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('loading_charge')
        .select('*')
        .eq('transaction_uuid', slug)
        .single();
      if (error) throw new Error('Failed to fetch loading charge');
      return data;
    },
    enabled: !!slug,
  });

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
    } catch (e) { console.error("Could not parse coordinates:", location); }
    return null;
  };
  
  const confirmReceiptMutation = useMutation({
    mutationFn: async (updatePayload: any) => {
      if (!slug) throw new Error('No transaction UUID provided');

      const response = await fetch(`${API_BASE_URL}/loading-charge/${slug}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm receipt on the server.');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Loading charge confirmed successfully!" });
      queryClient.invalidateQueries({ queryKey: ['loading-charge', slug] });
      queryClient.invalidateQueries({ queryKey: ['loading-charges', 'admin-loading-charges'] });
      setTimeout(() => navigate('/transit'), 1500);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: `Confirmation failed: ${error.message}`, variant: "destructive" });
      setIsConfirming(false);
      setIsUploadingImage(false);
    }
  });

  const handleConfirmReceipt = async () => {
    if (!currentLocation || !capturedPhoto) {
      toast({ title: "Error", description: "Please capture location and photo first.", variant: "destructive" });
      return;
    }
    
    setIsConfirming(true);
    let offloadingPhotoUrl: string | null = null;

    try {
      setIsUploadingImage(true);
      const fileName = `${slug}_offloading_${Date.now()}.jpg`;
      offloadingPhotoUrl = await uploadImageToStorage(capturedPhoto, fileName);
      setIsUploadingImage(false);

      const updatePayload = {
        offloading_location: currentLocation,
        offloading_photo: offloadingPhotoUrl,
        distance_travelled: calculatedDistance,
        time_taken: timeTaken
      };

      confirmReceiptMutation.mutate(updatePayload);

    } catch (error) {
      toast({ title: "Error", description: "An error occurred during confirmation.", variant: "destructive" });
      setIsConfirming(false);
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    if (currentLocation && loadingcharge?.location) {
      const startCoords = parseCoords(loadingcharge.location);
      const endCoords = parseCoords(currentLocation);
      if (startCoords && endCoords) {
        const distance = calculateDistance(`${startCoords.lat},${startCoords.lon}`, `${endCoords.lat},${endCoords.lon}`);
        setCalculatedDistance(distance);
      }
    }
  }, [currentLocation, loadingcharge?.location]);

  useEffect(() => {
    if (loadingcharge && loadingcharge.location && loadingcharge.offloading_destination) {
      const start = parseCoords(loadingcharge.location);
      const end = parseCoords(loadingcharge.offloading_destination);

      if (start && end) {
        setRouteCoords({ start, end });
        fetchRoute(start, end)
          .then(routeData => {
            if (routeData.routes && routeData.routes[0]) {
              setRouteGeometry(routeData.routes[0].geometry);
            }
          })
          .catch(err => console.error("Failed to fetch route geometry:", err));
      }
    }
  }, [loadingcharge]);

  const handleBackClick = () => navigate('/transit');

  const isFormComplete = !!(currentLocation && capturedPhoto);
  const isCompleted = loadingcharge?.status === 'completed';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-blue-900">Loading charge details...</p>
        </div>
      </div>
    );
  }

  if (error || !loadingcharge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Loading charge Not Found</h2>
          <p className="text-gray-600 mb-4">The requested loading charge could not be found.</p>
          <Button onClick={handleBackClick}>Back to Transit</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <OffloadingHeader onBackClick={handleBackClick} />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <LoadingchargeDetails loadingcharge={loadingcharge} isCompleted={isCompleted} />

        {routeGeometry && routeCoords && !isCompleted && (
          <>
            <RouteMap
              startCoords={routeCoords.start}
              endCoords={routeCoords.end}
              routeGeometry={routeGeometry}
            />
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <Link to={`/journey/${slug}`}>
                  <Button className="bg-green-600 hover:bg-green-700 text-lg py-6 px-8">
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Journey & Navigation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

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

        <ConfirmationSection
          isFormComplete={isFormComplete}
          isConfirming={isConfirming || confirmReceiptMutation.isPending}
          isUploadingImage={isUploadingImage}
          onConfirmReceipt={handleConfirmReceipt}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
};

export default Offloading;