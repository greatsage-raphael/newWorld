// src/pages/Offloading.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types'; // Import the Json type
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
import { PlayCircle, StopCircle } from 'lucide-react';

// --- TYPE DEFINITIONS ---

interface LocationData {
  address: {
    state?: string;
    country?: string;
    village?: string;
    country_code?: string;
    'ISO3166-2-lvl3'?: string;
    'ISO3166-2-lvl4'?: string;
    [key: string]: string | undefined;
  };
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

  // State for live journey tracking
  const [isJourneyStarted, setIsJourneyStarted] = useState(false);
  const [liveLocation, setLiveLocation] = useState<[number, number] | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Fetch the initial loading charge data
  const { data: loadingcharge, isLoading, error } = useQuery({
    queryKey: ['loading-charge', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loading_charge')
        .select('*')
        .eq('transaction_uuid', slug)
        .single();
      if (error) throw new Error('Failed to fetch loading charge');
      return data;
    },
    enabled: !!slug
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
        return { lat: parseFloat(location.lat), lon: parseFloat(location.lon) };
      }
    } catch (e) {
      console.error("Could not parse coordinates from location object:", location);
    }
    return null;
  };

  const getCoordinatesFromLocation = (location: any): string | null => {
    if (typeof location === 'object' && location?.coordinates) {
      return location.coordinates;
    }
    return null;
  };

  const parseLoadingLocationData = (location: any): LocationData | null => {
    if (!location || typeof location !== 'object') return null;
    try {
      return {
        address: location.address || {},
        coordinates: location.coordinates || '',
        displayName: location.displayName || ''
      };
    } catch (e) {
      console.error('Error parsing location data:', e);
      return null;
    }
  };

  // --- JOURNEY TRACKING HANDLERS ---

  const handleStartJourney = () => {
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation is not supported.", variant: "destructive" });
      return;
    }

    setIsJourneyStarted(true);
    toast({ title: "Journey Started", description: "Live location tracking is active." });

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLiveLocation([latitude, longitude]);
      },
      (error) => {
        console.error("Geolocation watch error:", error);
        toast({ title: "Location Error", description: "Could not get live location. Tracking stopped.", variant: "destructive" });
        handleStopJourney();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleStopJourney = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsJourneyStarted(false);
    toast({ title: "Journey Stopped", description: "Live location tracking has been turned off." });
  };

  // --- EFFECTS ---

  // Cleanup effect to stop tracking if the user navigates away
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Effect to calculate distance when offloading location is captured
  useEffect(() => {
    if (currentLocation && loadingcharge?.location) {
      const loadingCoordinates = getCoordinatesFromLocation(loadingcharge.location);
      if (loadingCoordinates) {
        const distance = calculateDistance(loadingCoordinates, currentLocation.coordinates);
        setCalculatedDistance(distance);
      }
    }
  }, [currentLocation, loadingcharge?.location]);

  // Effect to fetch the route when loading charge data is available
  useEffect(() => {
    if (loadingcharge && loadingcharge.location && loadingcharge.offloading_destination) {
      const start = parseCoords(loadingcharge.location);
      const end = parseCoords(loadingcharge.offloading_destination);

      if (start && end) {
        setRouteCoords({ start, end });
        fetchRoute(start, end)
          .then(geometry => setRouteGeometry(geometry))
          .catch(err => console.error("Failed to fetch route geometry:", err));
      }
    }
  }, [loadingcharge]);

  // --- MUTATION for CONFIRMATION ---

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
        time_taken: timeTaken
      };

      const { data, error } = await supabase
        .from('loading_charge')
        .update(updateData)
        .eq('transaction_uuid', slug)
        .select();

      if (error) throw new Error(`Failed to confirm receipt: ${error.message}`);
      if (!data || data.length === 0) throw new Error('Update failed - no rows were updated.');
      return data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Loading charge confirmed successfully!" });
      queryClient.invalidateQueries({ queryKey: ['loading-charge', slug] });
      queryClient.invalidateQueries({ queryKey: ['loading-charges'] });
      navigate('/transit');
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to confirm loading charge: ${error.message}`, variant: "destructive" });
      setIsConfirming(false);
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

  const loadingLocationData = parseLoadingLocationData(loadingcharge?.location);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <OffloadingHeader onBackClick={handleBackClick} />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <LoadingchargeDetails loadingcharge={loadingcharge} isCompleted={isCompleted} />

        {/* Planned Route Map and Journey Controls */}
        {routeGeometry && routeCoords && !isCompleted && (
          <>
            <RouteMap
              startCoords={routeCoords.start}
              endCoords={routeCoords.end}
              routeGeometry={routeGeometry}
              liveLocation={liveLocation}
            />
            <Card>
              <CardContent className="pt-6 flex justify-center">
                {!isJourneyStarted ? (
                  <Button
                    onClick={handleStartJourney}
                    className="bg-green-600 hover:bg-green-700 text-lg py-6 px-8"
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Journey
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopJourney}
                    variant="destructive"
                    className="text-lg py-6 px-8"
                  >
                    <StopCircle className="h-5 w-5 mr-2" />
                    Stop Journey
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Offloading Confirmation Steps */}
        {!isCompleted && (
          <>
            <LocationCapture
              currentLocation={currentLocation}
              isCapturingLocation={isCapturingLocation}
              onLocationCapture={setCurrentLocation}
              onCapturingStateChange={setIsCapturingLocation}
              onTimeTakenCalculation={setTimeTaken}
              loadingchargeCreatedAt={loadingcharge.created_at}
              loadingLocation={loadingLocationData}
            />

            <DistanceDisplay distance={calculatedDistance} />

            <TimeDisplay timeTaken={timeTaken} />

            <PhotoCapture
              capturedPhoto={capturedPhoto}
              onPhotoCapture={setCapturedPhoto}
            />
          </>
        )}

        {/* Final Confirmation Button */}
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