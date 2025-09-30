import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
// Correctly import both Tables and TablesUpdate helpers
import { Tables, TablesUpdate } from '@/integrations/supabase/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';

interface EditTruckDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  // CORRECTED: Use Tables<'truck_drivers'> directly for the row type
  driver: Tables<'truck_drivers'> | null;
}

const EditTruckDriverModal: React.FC<EditTruckDriverModalProps> = ({ isOpen, onClose, driver }) => {
  const [formData, setFormData] = useState({
    driver_name: '',
    number_plate: '',
    cubic_meters: '',
    contact: '',
  });
  const [newLicensePhoto, setNewLicensePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (driver) {
      setFormData({
        driver_name: driver.driver_name,
        number_plate: driver.number_plate,
        cubic_meters: String(driver.cubic_meters),
        contact: driver.contact || '',
      });
      setPreviewUrl(driver.license_photo_url);
      setNewLicensePhoto(null);
    }
  }, [driver]);

  const updateMutation = useMutation({
    // CORRECTED: Use TablesUpdate<'truck_drivers'> for the update payload
    mutationFn: async (updatedData: { data: Partial<TablesUpdate<'truck_drivers'>>, id: string }) => {
      const { id, data } = updatedData;
      const dataToUpdate = { ...data };
      let photoUrlToDelete: string | null = null;
      
      if (newLicensePhoto) {
        const fileName = `${crypto.randomUUID()}-${newLicensePhoto.name}`;
        const { error: uploadError } = await supabase.storage.from('driver-licenses').upload(fileName, newLicensePhoto);
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage.from('driver-licenses').getPublicUrl(fileName);
        dataToUpdate.license_photo_url = urlData.publicUrl;

        if (driver?.license_photo_url) {
            photoUrlToDelete = driver.license_photo_url;
        }
      }

      const { error } = await supabase.from('truck_drivers').update(dataToUpdate).eq('id', id);
      if (error) throw error;
      
      if(photoUrlToDelete) {
        const oldPhotoName = photoUrlToDelete.split('/').pop();
        if(oldPhotoName) {
            await supabase.storage.from('driver-licenses').remove([oldPhotoName]);
        }
      }
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Driver information updated.' });
      queryClient.invalidateQueries({ queryKey: ['truck_drivers'] });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewLicensePhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driver) return;
    updateMutation.mutate({
      id: driver.id,
      data: {
        ...formData,
        cubic_meters: parseFloat(formData.cubic_meters),
      },
    });
  };

  if (!driver) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Driver: {driver.driver_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="driver_name">Driver Name</Label>
            <Input id="driver_name" name="driver_name" value={formData.driver_name} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number_plate">Number Plate</Label>
            <Input id="number_plate" name="number_plate" value={formData.number_plate} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cubic_meters">Truck Capacity (m³)</Label>
            <Input id="cubic_meters" name="cubic_meters" type="number" step="0.01" value={formData.cubic_meters} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input id="contact" name="contact" type="tel" value={formData.contact} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="license-photo-edit">Driver License Photo</Label>
            <Input id="license-photo-edit" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <Button type="button" variant="outline" onClick={() => document.getElementById('license-photo-edit')?.click()}>
              <Camera className="mr-2 h-4 w-4" /> Change Photo
            </Button>
            {previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 rounded-md max-h-40 object-contain" />}
          </div>
        
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTruckDriverModal;