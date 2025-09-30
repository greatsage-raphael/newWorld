// --- src/utils/routeUtils.ts ---

import { toast } from "@/hooks/use-toast";

const API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Fetches the driving route between two points using the LocationIQ Directions API.
 * @param startCoords The starting coordinates.
 * @param endCoords The ending coordinates.
 * @returns A promise that resolves to the encoded polyline geometry string.
 */
export const fetchRoute = async (startCoords: Coordinates, endCoords: Coordinates): Promise<string> => {
  if (!API_KEY) {
    console.error("LocationIQ API Key is missing.");
    toast({
      title: "Configuration Error",
      description: "Location service is not configured.",
      variant: "destructive",
    });
    throw new Error("API key is missing");
  }

  // LocationIQ expects coordinates in {longitude},{latitude} format
  const coordinatesString = `${startCoords.lon},${startCoords.lat};${endCoords.lon},${endCoords.lat}`;

  const url = `https://us1.locationiq.com/v1/directions/driving/${coordinatesString}?key=${API_KEY}&steps=false&geometries=polyline&overview=full`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error("No route found:", data);
      throw new Error(data.message || "No route could be found between the specified points.");
    }

    // Return the encoded geometry of the first route
    return data.routes[0].geometry;
  } catch (error) {
    console.error("Error fetching route from LocationIQ:", error);
    toast({
      title: "Routing Error",
      description: "Could not fetch the route map. Please check your connection.",
      variant: "destructive",
    });
    throw error;
  }
};