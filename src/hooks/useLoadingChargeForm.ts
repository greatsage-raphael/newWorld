import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { uploadImageToStorage } from '@/utils/imageUpload';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type OffloadingDestination = {
  displayName: string;
  lat: string;
  lon: string;
} | null;

export const useLoadingchargeForm = () => {
  const { user, isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    driver_name: '',
    vehicle_number: '',
    loading_chainage: '',
    net_mass: '',
    material: '',
    custom_transaction_id: '',
    location: null as any,
    vehicle_photo: null as string | null,
    offloading_destination: null as OffloadingDestination,
  });

  const [netMassValue, setNetMassValue] = useState('');
  const [netMassUnit, setNetMassUnit] = useState('tonnes');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [isChainageLocked, setIsChainageLocked] = useState(false);
  const [isNetMassLocked, setIsNetMassLocked] = useState(false);
  const [isTransactionIdEditable, setIsTransactionIdEditable] = useState(false);
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  const { data: truckDrivers, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ['truck_drivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('truck_drivers')
        .select('*')
        .order('driver_name', { ascending: true });
      if (error) {
        toast({ title: "Error", description: "Could not fetch truck drivers.", variant: "destructive" });
        throw new Error(error.message);
      }
      return data;
    },
  });

  const createLoadingchargeMutation = useMutation({
    mutationFn: async (fullFormData: typeof formData) => {
      if (!user) throw new Error("User is not authenticated.");

      const dataToSubmit = {
        ...fullFormData,
        user_id: user.id,
        transaction_uuid: crypto.randomUUID(),
        custom_transaction_id: fullFormData.custom_transaction_id
          ? parseInt(fullFormData.custom_transaction_id, 10)
          : null,
      };

      const response = await fetch(`${API_BASE_URL}/loading-charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create loading charge on the server.');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: "Loading charge created successfully!" });
      navigate(`/offloading/${data.transaction_uuid}`);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['loading-charges', 'admin-loading-charges'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn || !user) {
        toast({ title: "Validation Error", description: "Please sign in to continue.", variant: "destructive" });
        return;
    }
    if (!selectedDriverId || !formData.material || !formData.loading_chainage.trim() || !netMassValue.trim()) {
      toast({ title: "Validation Error", description: "Please fill in all required fields in Driver and Loading Details.", variant: "destructive" });
      return;
    }
    if (isTransactionIdEditable && !formData.custom_transaction_id) {
       toast({ title: "Validation Error", description: "Please enter a Transaction ID for the selected material.", variant: "destructive" });
       return;
    }
    if (locationEnabled && !currentLocation) {
        toast({ title: "Validation Error", description: "Please capture your current location.", variant: "destructive" });
        return;
    }
    if (!capturedPhoto) {
      toast({ title: "Validation Error", description: "Please capture a truck photo before submitting.", variant: "destructive" });
      return;
    }

    let vehiclePhotoUrl = null;
    try {
      const fileName = `${crypto.randomUUID()}_vehicle.jpg`;
      vehiclePhotoUrl = await uploadImageToStorage(capturedPhoto, fileName);
    } catch (error) {
      toast({ title: "Upload Error", description: "Failed to upload vehicle photo. Please try again.", variant: "destructive" });
      return;
    }

    createLoadingchargeMutation.mutate({
      ...formData,
      location: currentLocation,
      vehicle_photo: vehiclePhotoUrl,
    });
  };

  useEffect(() => {
    if (netMassValue.trim()) {
      setFormData(prev => ({ ...prev, net_mass: `${netMassValue} ${netMassUnit}` }));
    } else {
      setFormData(prev => ({ ...prev, net_mass: '' }));
    }
  }, [netMassValue, netMassUnit]);

  useEffect(() => {
    const driver = truckDrivers?.find(d => d.id === selectedDriverId);
    const material = formData.material;

    if (['murrum', 'Top Soil'].includes(material)) {
        setNetMassUnit('m³');
        if (driver) {
            setIsNetMassLocked(true);
            setNetMassValue(String(driver.cubic_meters));
        } else {
            setIsNetMassLocked(false);
            setNetMassValue('');
        }
    } else if (['aggregate', 'hardcore', 'stone base'].includes(material)) {
        setIsNetMassLocked(false);
        setNetMassUnit('tonnes');
        setNetMassValue('');
    } else {
        setIsNetMassLocked(false);
        setNetMassValue('');
        setNetMassUnit('tonnes');
    }
  }, [formData.material, selectedDriverId, truckDrivers]);

  useEffect(() => {
    const materialsToLock = ['aggregate', 'hardcore', 'stone base'];
    if (materialsToLock.includes(formData.material)) {
      setIsChainageLocked(true);
      setFormData(prev => ({ ...prev, loading_chainage: '28' }));
    } else if (!isChainageLocked) { // Only clear if not locked by another rule
      // setFormData(prev => ({ ...prev, loading_chainage: '' })); // This can be annoying, let's not auto-clear
    }
  }, [formData.material]);

  useEffect(() => {
    const isEditable = ['aggregate', 'hardcore', 'stone base'].includes(formData.material);
    setIsTransactionIdEditable(isEditable);
    if (!isEditable) {
      handleInputChange('custom_transaction_id', '');
    }
  }, [formData.material]);

  const handleDriverSelect = (driverId: string) => {
    setSelectedDriverId(driverId);
    const driver = truckDrivers?.find(d => d.id === driverId);
    if (driver) {
      setFormData(prev => ({
        ...prev,
        driver_name: driver.driver_name,
        vehicle_number: driver.number_plate,
      }));
    } else {
      setFormData(prev => ({ ...prev, driver_name: '', vehicle_number: '' }));
      setNetMassValue('');
    }
  };

  const handleMaterialChange = (material: string) => {
    handleInputChange('material', material);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      driver_name: '',
      vehicle_number: '',
      loading_chainage: '',
      net_mass: '',
      material: '',
      custom_transaction_id: '',
      location: null,
      vehicle_photo: null,
      offloading_destination: null,
    });
    setNetMassValue('');
    setNetMassUnit('tonnes');
    setCurrentLocation(null);
    setCapturedPhoto(null);
    setLocationEnabled(false);
    setSelectedDriverId('');
    setLocationModalOpen(false);
  };

  return {
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
    handleSubmit,
    resetForm,
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
    isLocationModalOpen,
    setLocationModalOpen,
  };
};