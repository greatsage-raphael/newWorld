// --- src/utils/routeUtils.ts ---

import { toast } from "@/hooks/use-toast";

interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Fetches the driving route between two points by calling our secure backend proxy.
 * @param startCoords The starting coordinates.
 * @param endCoords The ending coordinates.
 * @returns A promise that resolves to the full route data with geometry and steps.
 */
export const fetchRoute = async (startCoords: Coordinates, endCoords: Coordinates): Promise<any> => {
  // Construct the URL to our NestJS backend endpoint
  const backendUrl = new URL('http://localhost:3000/location/route');
  
  // Append coordinates as query parameters
  backendUrl.searchParams.append('startLat', String(startCoords.lat));
  backendUrl.searchParams.append('startLon', String(startCoords.lon));
  backendUrl.searchParams.append('endLat', String(endCoords.lat));
  backendUrl.searchParams.append('endLon', String(endCoords.lon));

  try {
    const response = await fetch(backendUrl.toString());
    const data = await response.json();

    // Check for errors returned from our NestJS server or LocationIQ
    if (!response.ok || data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error("No route found or error from backend:", data);
      throw new Error(data.message || "No route could be found between the specified points.");
    }

    // Return the full route data
    return data;
  } catch (error) {
    console.error("Error fetching route from backend:", error);
    toast({
      title: "Routing Error",
      description: "Could not fetch the route map. Please check your connection to the server.",
      variant: "destructive",
    });
    // Re-throw the error so the calling component can handle it if needed
    throw error;
  }
};