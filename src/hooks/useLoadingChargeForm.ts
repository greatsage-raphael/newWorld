// src/hooks/useLoadingChargeForm.ts

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { uploadImageToStorage } from '@/utils/imageUpload';

// Define the type for the offloading location data
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
    // Add the new field
    offloading_destination: null as OffloadingDestination,
  });

  const [netMassValue, setNetMassValue] = useState('');
  const [netMassUnit, setNetMassUnit] = useState('tonnes');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    address: {
      state?: string;
      country?: string;
      village?: string;
      country_code?: string;
      'ISO3166-2-lvl3'?: string;
      'ISO3166-2-lvl4'?: string;
    };
    coordinates: string;
    displayName: string;
  } | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [isChainageLocked, setIsChainageLocked] = useState(false);
  const [isNetMassLocked, setIsNetMassLocked] = useState(false);
  const [isTransactionIdEditable, setIsTransactionIdEditable] = useState(false);
  // State to control the modal
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
    const newMaterial = formData.material;

    if (materialsToLock.includes(newMaterial)) {
      setIsChainageLocked(true);
      setFormData(prev => ({ ...prev, loading_chainage: '28' }));
    } else {
      setIsChainageLocked(false);
      setFormData(prev => ({ ...prev, loading_chainage: '' }));
    }
  }, [formData.material]);

  useEffect(() => {
    const isEditable = ['aggregate', 'hardcore', 'stone base'].includes(formData.material);
    setIsTransactionIdEditable(isEditable);
    if (!isEditable) {
      handleInputChange('custom_transaction_id', '');
    }
  }, [formData.material]);


  useEffect(() => {
    if (isSignedIn && user) {
      syncUserData();
    }
  }, [isSignedIn, user]);

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
      setFormData(prev => ({
        ...prev,
        driver_name: '',
        vehicle_number: '',
        net_mass: '',
      }));
      setNetMassValue('');
    }
  };

  const handleMaterialChange = (material: string) => {
    handleInputChange('material', material);
  };

  const syncUserData = async () => { /* ...no changes here... */ };

  const createLoadingchargeMutation = useMutation({
    mutationFn: async (dataToSubmit: typeof formData) => {
      let vehiclePhotoUrl = null;
      if (capturedPhoto) {
        const fileName = `${crypto.randomUUID()}_vehicle.jpg`;
        vehiclePhotoUrl = await uploadImageToStorage(capturedPhoto, fileName);
      }
      
      const insertData = {
        ...dataToSubmit,
        user_id: user?.id,
        transaction_uuid: crypto.randomUUID(),
        vehicle_photo: vehiclePhotoUrl,
        custom_transaction_id: dataToSubmit.custom_transaction_id ? parseInt(dataToSubmit.custom_transaction_id, 10) : null
      };
      
      const { data: result, error } = await supabase.from('loading_charge').insert(insertData).select().single();
      if (error) throw new Error(`Failed to create loading charge: ${error.message}`);
      return result;
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: "Loading charge created successfully!" });
      navigate(`/offloading/${data.transaction_uuid}`);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['loading-charges'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

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
      offloading_destination: null, // Reset the new field
    });
    setNetMassValue('');
    setNetMassUnit('tonnes');
    setCurrentLocation(null);
    setCapturedPhoto(null);
    setLocationEnabled(false);
    setSelectedDriverId('');
    setLocationModalOpen(false); // Close modal on reset
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