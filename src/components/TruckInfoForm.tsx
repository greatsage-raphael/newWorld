import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, Upload, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TruckInfo {
  driver_name: string;
  number_plate: string;
  cubic_meters: string;
  contact: string;
  license_photo: File | null;
}

const TruckInfoForm = () => {
  const [formData, setFormData] = useState<TruckInfo>({
    driver_name: '',
    number_plate: '',
    cubic_meters: '',
    contact: '',
    license_photo: null
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const queryClient = useQueryClient();

  const addTruckDriverMutation = useMutation({
    mutationFn: async ({ driver_name, number_plate, cubic_meters, contact, license_photo }: { driver_name: string; number_plate: string; cubic_meters: number; contact: string; license_photo: File | null }) => {
      let license_photo_url: string | null = null;

      if (license_photo) {
        const file = license_photo;
        const fileName = `${crypto.randomUUID()}-${file.name}`;
        const bucket = 'driver-licenses';

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);
        
        license_photo_url = urlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('truck_drivers')
        .insert({
          driver_name,
          number_plate,
          cubic_meters,
          contact,
          license_photo_url,
        });
      
      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error(`Failed to save driver: A driver with number plate '${number_plate}' already exists.`);
        }
        throw new Error(`Failed to save driver: ${insertError.message}`);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Truck driver information saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['truck_drivers'] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        license_photo: file
      }));
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const resetForm = () => {
    setFormData({
      driver_name: '',
      number_plate: '',
      cubic_meters: '',
      contact: '',
      license_photo: null
    });
    setPreviewUrl('');
    
    const fileInput = document.getElementById('license-photo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.driver_name || !formData.number_plate || !formData.cubic_meters || !formData.contact) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields, including contact number.",
        variant: "destructive"
      });
      return;
    }

    addTruckDriverMutation.mutate({
      driver_name: formData.driver_name,
      number_plate: formData.number_plate,
      cubic_meters: parseFloat(formData.cubic_meters),
      contact: formData.contact,
      license_photo: formData.license_photo,
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl text-red-900 flex items-center gap-2">
          <Truck className="h-6 w-6" />
          Truck & Driver Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="driver_name" className="text-red-900 font-medium">
                Driver Name *
              </Label>
              <Input
                id="driver_name"
                name="driver_name"
                type="text"
                value={formData.driver_name}
                onChange={handleInputChange}
                placeholder="Enter driver full name"
                className="border-red-200 focus:border-red-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_plate" className="text-red-900 font-medium">
                Number Plate *
              </Label>
              <Input
                id="number_plate"
                name="number_plate"
                type="text"
                value={formData.number_plate}
                onChange={handleInputChange}
                placeholder="Enter vehicle number plate"
                className="border-red-200 focus:border-red-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cubic_meters" className="text-red-900 font-medium">
                Truck Capacity (m³) *
              </Label>
              <Input
                id="cubic_meters"
                name="cubic_meters"
                type="number"
                value={formData.cubic_meters}
                onChange={handleInputChange}
                placeholder="Enter truck capacity in cubic meters"
                className="border-red-200 focus:border-red-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact" className="text-red-900 font-medium">
                Contact Number *
              </Label>
              <Input
                id="contact"
                name="contact"
                type="tel"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="Enter driver's phone number"
                className="border-red-200 focus:border-red-500"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="license-photo" className="text-red-900 font-medium">
                Driver License Photo
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="license-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('license-photo')?.click()}
                  className="border-red-200 text-red-700 hover:bg-red-50 flex-1 justify-start"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {formData.license_photo ? 'Change Photo' : 'Browse Photo'}
                </Button>
                {formData.license_photo && <span className="text-sm text-gray-500 truncate">{formData.license_photo.name}</span>}
              </div>
            </div>
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <Label className="text-red-900 font-medium">License Photo Preview</Label>
              <div className="border-2 border-dashed border-red-200 rounded-lg p-4">
                <img
                  src={previewUrl}
                  alt="License preview"
                  className="max-w-xs max-h-48 mx-auto rounded-lg shadow-md"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-red-100">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={addTruckDriverMutation.isPending}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={addTruckDriverMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {addTruckDriverMutation.isPending ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Save Driver Info
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TruckInfoForm;