
import { supabase } from '@/integrations/supabase/client';

export const uploadImageToStorage = async (
  base64Image: string,
  fileName: string,
  bucketName: string = 'vehicle-photos'
): Promise<string> => {
  try {
    console.log('Starting image upload process for file:', fileName);
    
    // Convert base64 to blob
    const base64Data = base64Image.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid base64 image data');
    }
    
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    console.log('Blob created, size:', blob.size, 'bytes');

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    console.log('Upload successful, path:', data.path);

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    console.log('Public URL generated:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};
