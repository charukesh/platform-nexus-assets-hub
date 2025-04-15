
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import NeuCard from '@/components/NeuCard';
import NeuButton from '@/components/NeuButton';
import NeuInput from '@/components/NeuInput';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FormData {
  name: string;
  industry: string;
  audience_data: any;
  device_split: any;
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
    audience_data: {},
    device_split: {},
    mau: '',
    dau: '',
    premium_users: null,
  });

  const { data: platformData, isLoading, error } = useQuery({
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
      setFormData({
        name: platformData.name,
        industry: platformData.industry,
        audience_data: platformData.audience_data || {},
        device_split: platformData.device_split || {},
        mau: platformData.mau || '',
        dau: platformData.dau || '',
        premium_users: platformData.premium_users || null,
      });
    }
  }, [platformData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleJSONChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    try {
      const parsedValue = JSON.parse(event.target.value);
      setFormData({
        ...formData,
        [field]: parsedValue,
      });
    } catch (e) {
      toast({
        title: "Invalid JSON",
        description: "Please enter valid JSON format.",
        variant: "destructive",
      });
    }
  };

  const generateEmbedding = async (platformData: Tables<'platforms'>) => {
    const content = `${platformData.name} ${platformData.industry} ${JSON.stringify(platformData.audience_data)} ${JSON.stringify(platformData.device_split)}`;
    
    try {
      await supabase.functions.invoke('generate-embeddings', {
        body: {
          type: 'platform',
          id: platformData.id,
          content
        }
      });
    } catch (error) {
      console.error('Error generating embedding:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      let result;
      if (id) {
        // Update existing platform
        result = await supabase
          .from('platforms')
          .update({
            name: formData.name,
            industry: formData.industry,
            audience_data: formData.audience_data,
            device_split: formData.device_split,
            mau: formData.mau,
            dau: formData.dau,
            premium_users: formData.premium_users,
          })
          .eq('id', id)
          .select()
          .single();
      } else {
        // Create new platform
        result = await supabase
          .from('platforms')
          .insert({
            name: formData.name,
            industry: formData.industry,
            audience_data: formData.audience_data,
            device_split: formData.device_split,
            mau: formData.mau,
            dau: formData.dau,
            premium_users: formData.premium_users,
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      // Generate embedding for the platform
      await generateEmbedding(result.data);

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
  if (error) return <Layout>Error: {(error as Error).message}</Layout>;

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

        <NeuCard>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <NeuInput
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <NeuInput
                type="text"
                name="industry"
                id="industry"
                value={formData.industry}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="mau" className="block text-sm font-medium text-gray-700">
                MAU (Monthly Active Users)
              </label>
              <NeuInput
                type="text"
                name="mau"
                id="mau"
                value={formData.mau}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="dau" className="block text-sm font-medium text-gray-700">
                DAU (Daily Active Users)
              </label>
              <NeuInput
                type="text"
                name="dau"
                id="dau"
                value={formData.dau}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="premium_users" className="block text-sm font-medium text-gray-700">
                Premium Users
              </label>
              <NeuInput
                type="number"
                name="premium_users"
                id="premium_users"
                value={formData.premium_users !== null ? formData.premium_users : ''}
                onChange={(e) => setFormData({ ...formData, premium_users: e.target.value === '' ? null : parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label htmlFor="audience_data" className="block text-sm font-medium text-gray-700">
                Audience Data (JSON)
              </label>
              <NeuInput
                as="textarea"
                name="audience_data"
                id="audience_data"
                value={JSON.stringify(formData.audience_data)}
                onChange={(e) => handleJSONChange(e, 'audience_data')}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="device_split" className="block text-sm font-medium text-gray-700">
                Device Split (JSON)
              </label>
              <NeuInput
                as="textarea"
                name="device_split"
                id="device_split"
                value={JSON.stringify(formData.device_split)}
                onChange={(e) => handleJSONChange(e, 'device_split')}
                rows={3}
              />
            </div>

            <NeuButton type="submit">{id ? 'Update Platform' : 'Create Platform'}</NeuButton>
          </form>
        </NeuCard>
      </div>
    </Layout>
  );
};

export default PlatformForm;
