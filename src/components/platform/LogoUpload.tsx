
import { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import NeuButton from '@/components/NeuButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LogoUploadProps {
  currentLogoUrl?: string | null;
  onUpload: (url: string) => void;
  platformId: string;
}

const LogoUpload = ({ currentLogoUrl, onUpload, platformId }: LogoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    // Programmatically click the hidden file input
    fileInputRef.current?.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${platformId}-${Math.random()}.${fileExt}`;
      const filePath = fileName;

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size should be less than 2MB');
      }

      if (!file.type.includes('image/')) {
        throw new Error('Please upload an image file');
      }

      // Upload file directly without trying to create the bucket
      // Since we've already set up the bucket with proper policies
      const { error: uploadError } = await supabase.storage
        .from('platform-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('platform-logos')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });

    } catch (error: any) {
      console.error('Full upload error:', error);
      toast({
        title: "Error uploading logo",
        description: error.message || "Failed to upload logo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Platform Logo</Label>
      
      {currentLogoUrl ? (
        <div className="flex items-center gap-4">
          <img 
            src={currentLogoUrl} 
            alt="Platform logo" 
            className="w-16 h-16 rounded-lg object-cover"
          />
          <NeuButton 
            type="button" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={triggerFileInput}
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Change Logo'}
          </NeuButton>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      ) : (
        <div>
          <label 
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-neugray-100 dark:hover:bg-gray-800"
            onClick={triggerFileInput}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                {uploading ? 'Uploading...' : 'Click to upload platform logo'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF up to 2MB
              </p>
            </div>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
};

export default LogoUpload;
