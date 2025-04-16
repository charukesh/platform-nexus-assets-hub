
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import NeuCard from '@/components/NeuCard';
import NeuButton from '@/components/NeuButton';
import NeuInput from '@/components/NeuInput';
import { useToast } from '@/components/ui/use-toast';
import { Tables, Json } from '@/integrations/supabase/types';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AudienceData {
  age_groups?: {
    '13-17'?: number;
    '18-24'?: number;
    '25-34'?: number;
    '35-44'?: number;
    '45-54'?: number;
    '55+'?: number;
  };
  gender?: {
    male?: number;
    female?: number;
    other?: number;
  };
  interests?: string[];
}

interface DeviceSplit {
  ios: number;
  android: number;
  web?: number;
}

interface FormData {
  name: string;
  industry: string;
  audience_data: AudienceData;
  device_split: DeviceSplit;
  mau: string;
  dau: string;
  premium_users: number | null;
}

const PlatformForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    industry: '',
    audience_data: {
      age_groups: {
        '13-17': 0,
        '18-24': 0,
        '25-34': 0,
        '35-44': 0,
        '45-54': 0,
        '55+': 0
      },
      gender: {
        male: 0,
        female: 0,
        other: 0
      },
      interests: []
    },
    device_split: {
      ios: 50,
      android: 50,
      web: 0
    },
    mau: '',
    dau: '',
    premium_users: null,
  });

  const { data: platformData, isLoading } = useQuery({
    queryKey: ['platform', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Tables<'platforms'>;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (platformData) {
      // Create default audience data and device split structures
      const defaultAudienceData: AudienceData = {
        age_groups: {
          '13-17': 0,
          '18-24': 0,
          '25-34': 0,
          '35-44': 0,
          '45-54': 0,
          '55+': 0
        },
        gender: {
          male: 0,
          female: 0,
          other: 0
        },
        interests: []
      };

      const defaultDeviceSplit: DeviceSplit = {
        ios: 50,
        android: 50,
        web: 0
      };

      // Parse the audience_data and device_split from the API response
      const audienceData = platformData.audience_data as Json;
      const deviceSplit = platformData.device_split as Json;

      setFormData({
        name: platformData.name,
        industry: platformData.industry,
        audience_data: audienceData ? 
          {
            age_groups: (audienceData as any)?.age_groups || defaultAudienceData.age_groups,
            gender: (audienceData as any)?.gender || defaultAudienceData.gender,
            interests: (audienceData as any)?.interests || defaultAudienceData.interests
          } : defaultAudienceData,
        device_split: deviceSplit ? 
          {
            ios: (deviceSplit as any)?.ios || defaultDeviceSplit.ios,
            android: (deviceSplit as any)?.android || defaultDeviceSplit.android,
            web: (deviceSplit as any)?.web || defaultDeviceSplit.web
          } : defaultDeviceSplit,
        mau: platformData.mau || '',
        dau: platformData.dau || '',
        premium_users: platformData.premium_users || null,
      });
    }
  }, [platformData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeviceSplitChange = (platform: keyof DeviceSplit, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      device_split: {
        ...prev.device_split,
        [platform]: numValue
      }
    }));
  };

  const handleAgeGroupChange = (group: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      audience_data: {
        ...prev.audience_data,
        age_groups: {
          ...prev.audience_data.age_groups,
          [group]: numValue
        }
      }
    }));
  };

  const handleGenderChange = (gender: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      audience_data: {
        ...prev.audience_data,
        gender: {
          ...prev.audience_data.gender,
          [gender]: numValue
        }
      }
    }));
  };

  const handleInterestChange = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.currentTarget.value.trim()) {
      const newInterest = event.currentTarget.value.trim();
      setFormData(prev => ({
        ...prev,
        audience_data: {
          ...prev.audience_data,
          interests: [...(prev.audience_data.interests || []), newInterest]
        }
      }));
      event.currentTarget.value = '';
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      audience_data: {
        ...prev.audience_data,
        interests: prev.audience_data.interests?.filter(i => i !== interest) || []
      }
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      let result;
      
      // Cast our typed structures back to Json for Supabase
      const supabaseData = {
        name: formData.name,
        industry: formData.industry,
        audience_data: formData.audience_data as unknown as Json,
        device_split: formData.device_split as unknown as Json,
        mau: formData.mau,
        dau: formData.dau,
        premium_users: formData.premium_users,
      };
      
      if (id) {
        result = await supabase
          .from('platforms')
          .update(supabaseData)
          .eq('id', id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('platforms')
          .insert(supabaseData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: id ? "Platform Updated" : "Platform Created",
        description: `Successfully ${id ? "updated" : "created"} ${formData.name}`,
      });

      navigate('/platforms');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link to="/platforms" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Platforms
            </Link>
            <h1 className="text-3xl font-bold mt-2">{id ? 'Edit Platform' : 'New Platform'}</h1>
            <p className="text-muted-foreground mt-1">Create and manage your platform details</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <NeuCard>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Platform Name*</Label>
                <NeuInput
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry*</Label>
                <NeuInput
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="mau">Monthly Active Users (MAU)</Label>
                <NeuInput
                  id="mau"
                  value={formData.mau}
                  onChange={(e) => handleChange('mau', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="dau">Daily Active Users (DAU)</Label>
                <NeuInput
                  id="dau"
                  value={formData.dau}
                  onChange={(e) => handleChange('dau', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="premium_users">Premium Users</Label>
                <NeuInput
                  id="premium_users"
                  type="number"
                  value={formData.premium_users || ''}
                  onChange={(e) => handleChange('premium_users', e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
            </div>
          </NeuCard>

          <NeuCard>
            <h2 className="text-xl font-semibold mb-4">Device Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ios">iOS (%)</Label>
                <NeuInput
                  id="ios"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.device_split.ios}
                  onChange={(e) => handleDeviceSplitChange('ios', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="android">Android (%)</Label>
                <NeuInput
                  id="android"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.device_split.android}
                  onChange={(e) => handleDeviceSplitChange('android', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="web">Web (%)</Label>
                <NeuInput
                  id="web"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.device_split.web || 0}
                  onChange={(e) => handleDeviceSplitChange('web', e.target.value)}
                />
              </div>
            </div>
          </NeuCard>

          <NeuCard>
            <h2 className="text-xl font-semibold mb-4">Audience Demographics</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Age Groups</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(formData.audience_data.age_groups || {}).map(([group, value]) => (
                    <div key={group}>
                      <Label htmlFor={`age-${group}`}>{group} (%)</Label>
                      <NeuInput
                        id={`age-${group}`}
                        type="number"
                        min="0"
                        max="100"
                        value={value || 0}
                        onChange={(e) => handleAgeGroupChange(group, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Gender Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(formData.audience_data.gender || {}).map(([gender, value]) => (
                    <div key={gender}>
                      <Label htmlFor={`gender-${gender}`}>{gender.charAt(0).toUpperCase() + gender.slice(1)} (%)</Label>
                      <NeuInput
                        id={`gender-${gender}`}
                        type="number"
                        min="0"
                        max="100"
                        value={value || 0}
                        onChange={(e) => handleGenderChange(gender, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Interests</h3>
                <NeuInput
                  placeholder="Type an interest and press Enter"
                  onKeyDown={handleInterestChange}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.audience_data.interests?.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-primary/10 text-primary"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-1.5 hover:text-primary/70"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </NeuCard>

          <div className="flex justify-end gap-3">
            <NeuButton
              type="button"
              variant="outline"
              onClick={() => navigate("/platforms")}
            >
              Cancel
            </NeuButton>
            <NeuButton type="submit">
              {id ? "Update Platform" : "Create Platform"}
            </NeuButton>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PlatformForm;
