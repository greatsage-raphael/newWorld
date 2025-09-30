
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { capturePhoto } from '@/utils/cameraUtils';

interface PhotoSectionProps {
  capturedPhoto: string | null;
  onPhotoChange: (photo: string | null) => void;
}

const PhotoSection: React.FC<PhotoSectionProps> = ({
  capturedPhoto,
  onPhotoChange
}) => {
  const handleCapturePhoto = async () => {
    const photo = await capturePhoto();
    onPhotoChange(photo);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5" />
        Truck Photo *
      </h3>
      <div className="space-y-4">
        {!capturedPhoto ? (
          <div>
            <p className="text-gray-600 mb-4">Please take a photo of the truck before submitting.</p>
            <Button
              type="button"
              onClick={handleCapturePhoto}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Truck Photo
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <p className="font-semibold text-green-800 mb-2">Photo Captured Successfully</p>
                <img
                  src={capturedPhoto}
                  alt="Truck photo"
                  className="w-full max-w-md rounded-lg border"
                />
              </CardContent>
            </Card>
            <Button
              type="button"
              onClick={handleCapturePhoto}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Camera className="h-4 w-4 mr-2" />
              Retake Photo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoSection;
