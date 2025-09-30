// src/components/LoadingCharge.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input
import { Label } from '@/components/ui/label'; // Import Label
import { toast } from '@/hooks/use-toast';
import { Truck, Hash, MapPin as MapPinIcon } from 'lucide-react'; // Added MapPinIcon
import { useLoadingchargeForm } from '@/hooks/useLoadingChargeForm';
import DriverInfoSection from '@/components/loading-charge/DriverInfoSection';
import LoadingDetailsSection from '@/components/loading-charge/LoadingDetailsSection';
import LocationSection from '@/components/loading-charge/LocationSection';
import PhotoSection from '@/components/loading-charge/PhotoSection';
import LocationSearchModal from '@/components/LocationSearchModal'; // Import the new modal
import LocationMap from './LocationMap';

const Loadingcharge = () => {
  const {
    formData,
    setFormData,
    netMassValue,
    setNetMassValue,
    netMassUnit,
    setNetMassUnit,
    locationEnabled,
    setLocationEnabled,
    currentLocation,
    setCurrentLocation,
    capturedPhoto,
    setCapturedPhoto,
    createLoadingchargeMutation,
    handleInputChange,
    user,
    isSignedIn,
    truckDrivers,
    isLoadingDrivers,
    selectedDriverId,
    handleDriverSelect,
    handleMaterialChange,
    isChainageLocked,
    isNetMassLocked,
    isTransactionIdEditable,
    isLocationModalOpen, // Get modal state
    setLocationModalOpen, // Get function to update modal state
  } = useLoadingchargeForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn || !user) {
      toast({ title: "Authentication Required", description: "Please sign in to create a loading charge.", variant: "destructive" });
      return;
    }

    if (!formData.driver_name || !formData.vehicle_number || !formData.loading_chainage.trim() || !netMassValue.trim() || !formData.material) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (isTransactionIdEditable && !formData.custom_transaction_id) {
       toast({ title: "Validation Error", description: "Please enter a Transaction ID for the selected material.", variant: "destructive" });
       return;
    }

    if (!capturedPhoto) {
      toast({ title: "Validation Error", description: "Please capture a truck photo before submitting.", variant: "destructive" });
      return;
    }

    createLoadingchargeMutation.mutate(formData);
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-900 text-white p-6 rounded-t-lg shadow-lg">
            <h1 className="text-3xl font-bold">New World Ent</h1>
            <p className="text-blue-200 mt-1">Loading charge Management System</p>
          </div>

          <Card className="rounded-t-none border-t-0">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
                <Truck className="h-6 w-6" />
                Create New Loading chainage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                
                <DriverInfoSection
                  vehicleNumber={formData.vehicle_number}
                  selectedDriverId={selectedDriverId}
                  onDriverSelect={handleDriverSelect}
                  truckDrivers={truckDrivers}
                  isLoadingDrivers={isLoadingDrivers}
                />

                <LoadingDetailsSection
                  formData={formData}
                  onInputChange={handleInputChange}
                  netMassValue={netMassValue}
                  netMassUnit={netMassUnit}
                  onNetMassValueChange={setNetMassValue}
                  onNetMassUnitChange={setNetMassUnit}
                  onMaterialChange={handleMaterialChange}
                  isDriverSelected={!!selectedDriverId}
                  isChainageLocked={isChainageLocked}
                  isNetMassLocked={isNetMassLocked}
                  isTransactionIdEditable={isTransactionIdEditable}
                />

                {/* New Offloading Location Section */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    Offloading Destination (Optional)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="offloading_destination">
                        Search Destination
                      </Label>
                      <Input
                        id="offloading_destination"
                        readOnly
                        value={formData.offloading_destination?.displayName || ''}
                        placeholder="Click to search for a destination..."
                        onClick={() => setLocationModalOpen(true)}
                        className="mt-1 cursor-pointer"
                      />
                    </div>
                    
                    {/* CONDITIONALLY RENDER THE MAP HERE */}
                    {formData.offloading_destination?.lat && formData.offloading_destination?.lon && (
                      <LocationMap
                        lat={parseFloat(formData.offloading_destination.lat)}
                        lon={parseFloat(formData.offloading_destination.lon)}
                      />
                    )}
                  </div>
                </div>

                <LocationSection
                  locationEnabled={locationEnabled}
                  currentLocation={currentLocation}
                  onLocationEnabledChange={setLocationEnabled}
                  onLocationChange={(location) => {
                    setCurrentLocation(location);
                    handleInputChange('location', location);
                  }}
                />

                <PhotoSection
                  capturedPhoto={capturedPhoto}
                  onPhotoChange={setCapturedPhoto}
                />

                <div className="flex justify-end pt-6 border-t">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg" disabled={createLoadingchargeMutation.isPending}>
                    {createLoadingchargeMutation.isPending ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Creating...</>
                    ) : (
                      <><Hash className="h-4 w-4 mr-2" />Upload</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Render the modal */}
      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelectLocation={(location) => {
          setFormData(prev => ({...prev, offloading_destination: location}));
        }}
      />
    </>
  );
};

export default Loadingcharge;