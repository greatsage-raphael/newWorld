
import { toast } from '@/hooks/use-toast';

export const capturePhoto = async (): Promise<string | null> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Error",
        description: "Camera access is not supported on this device.",
        variant: "destructive"
      });
      return null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });

    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        z-index: 9999;
        background: black;
      `;

      const captureBtn = document.createElement('button');
      captureBtn.innerHTML = '📷 Capture Photo';
      captureBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        font-size: 18px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        z-index: 10000;
      `;

      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 15px;
        font-size: 20px;
        background: rgba(0,0,0,0.5);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        z-index: 10000;
      `;

      document.body.appendChild(video);
      document.body.appendChild(captureBtn);
      document.body.appendChild(closeBtn);

      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
        document.body.removeChild(captureBtn);
        document.body.removeChild(closeBtn);
      };

      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        
        cleanup();
        resolve(dataURL);
        
        toast({
          title: "Success",
          description: "Photo captured successfully!",
        });
      };

      closeBtn.onclick = () => {
        cleanup();
        resolve(null);
      };
    });

  } catch (error) {
    console.error('Error accessing camera:', error);
    toast({
      title: "Error",
      description: "Unable to access camera. Please ensure camera permissions are granted.",
      variant: "destructive"
    });
    return null;
  }
};
