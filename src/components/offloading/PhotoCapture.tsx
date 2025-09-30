
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PhotoCaptureProps {
  capturedPhoto: string | null;
  onPhotoCapture: (photo: string) => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ capturedPhoto, onPhotoCapture }) => {
  const capturePhoto = async () => {
    try {
      // Check if the device supports camera access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Error",
          description: "Camera access is not supported on this device.",
          variant: "destructive"
        });
        return;
      }

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use rear camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      // Create video element to show camera preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100vw';
      video.style.height = '100vh';
      video.style.objectFit = 'cover';
      video.style.zIndex = '9999';
      video.style.backgroundColor = 'black';

      // Create capture button
      const captureBtn = document.createElement('button');
      captureBtn.innerHTML = '📷 Capture Photo';
      captureBtn.style.position = 'fixed';
      captureBtn.style.bottom = '20px';
      captureBtn.style.left = '50%';
      captureBtn.style.transform = 'translateX(-50%)';
      captureBtn.style.padding = '15px 30px';
      captureBtn.style.fontSize = '18px';
      captureBtn.style.backgroundColor = '#3b82f6';
      captureBtn.style.color = 'white';
      captureBtn.style.border = 'none';
      captureBtn.style.borderRadius = '25px';
      captureBtn.style.cursor = 'pointer';
      captureBtn.style.zIndex = '10000';

      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕';
      closeBtn.style.position = 'fixed';
      closeBtn.style.top = '20px';
      closeBtn.style.right = '20px';
      closeBtn.style.padding = '10px 15px';
      closeBtn.style.fontSize = '20px';
      closeBtn.style.backgroundColor = 'rgba(0,0,0,0.5)';
      closeBtn.style.color = 'white';
      closeBtn.style.border = 'none';
      closeBtn.style.borderRadius = '50%';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.zIndex = '10000';

      // Add elements to DOM
      document.body.appendChild(video);
      document.body.appendChild(captureBtn);
      document.body.appendChild(closeBtn);

      // Function to clean up camera
      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
        document.body.removeChild(captureBtn);
        document.body.removeChild(closeBtn);
      };

      // Handle capture
      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Photo captured, data URL length:', dataURL.length);
        onPhotoCapture(dataURL);
        
        cleanup();
        
        toast({
          title: "Success",
          description: "Photo captured successfully!",
        });
      };

      // Handle close
      closeBtn.onclick = cleanup;

    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Error",
        description: "Unable to access camera. Please ensure camera permissions are granted.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Truck Condition Photo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {capturedPhoto ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Photo Captured</span>
              </div>
            </div>
            <div className="max-w-md">
              <img 
                src={capturedPhoto} 
                alt="Truck condition" 
                className="w-full h-auto rounded-lg border border-gray-300"
              />
            </div>
            <Button 
              onClick={capturePhoto}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Camera className="h-4 w-4 mr-2" />
              Retake Photo
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">Please take a live photo of the truck to confirm its condition upon arrival.</p>
            <Button 
              onClick={capturePhoto}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Live Photo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoCapture;
