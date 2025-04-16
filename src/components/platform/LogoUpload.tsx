
import { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import NeuButton from '@/components/NeuButton';
import { supabase } from '@/integrations/supabase/client';

interface LogoUploadProps {
  currentLogoUrl?: string | null;
  onUpload: (url: string) => void;
  platformId: string;
}

const LogoUpload = ({ currentLogoUrl, onUpload, platformId }: LogoUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${platformId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('platform-logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('platform-logos')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error: any) {
      console.error('Error uploading logo:', error.message);
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
          <label className="cursor-pointer">
            <NeuButton type="button" variant="outline" className="flex items-center gap-2">
              <Upload size={16} />
              Change Logo
            </NeuButton>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-neugray-100 dark:hover:bg-gray-800">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImageIcon className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              {uploading ? 'Uploading...' : 'Click to upload platform logo'}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
};

export default LogoUpload;
