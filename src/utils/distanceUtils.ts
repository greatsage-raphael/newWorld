
/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 - First coordinate string in format "lat, lng"
 * @param coord2 - Second coordinate string in format "lat, lng"
 * @returns Distance in kilometers, rounded to 2 decimal places
 */
export const calculateDistance = (coord1: string, coord2: string): number => {
  try {
    // Parse coordinates
    const [lat1Str, lng1Str] = coord1.split(',').map(s => s.trim());
    const [lat2Str, lng2Str] = coord2.split(',').map(s => s.trim());
    
    const lat1 = parseFloat(lat1Str);
    const lng1 = parseFloat(lng1Str);
    const lat2 = parseFloat(lat2Str);
    const lng2 = parseFloat(lng2Str);
    
    // Validate coordinates
    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
      console.error('Invalid coordinates provided for distance calculation');
      return 0;
    }
    
    // Haversine formula
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating distance:', error);
    return 0;
  }
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 * @param distance - Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(2)} km`;
};
