
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { File, Image, Download, ArrowLeft, Pencil, Trash2, FileText, AlertCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [asset, setAsset] = useState<any>(null);
  const [platform, setPlatform] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setAsset(data);
          
          // Check if file is an image
          if (data.file_url && data.file_url.match(/\.(jpeg|jpg|gif|png)$/)) {
            setIsImage(true);
          }
          
          // If asset has platform_id, fetch platform details
          if (data.platform_id) {
            const { data: platformData, error: platformError } = await supabase
              .from('platforms')
              .select('name, industry')
              .eq('id', data.platform_id)
              .single();
            
            if (!platformError) {
              setPlatform(platformData);
            }
          }
        }
      } catch (error: any) {
        toast({
          title: "Error fetching asset",
          description: error.message,
          variant: "destructive",
        });
        navigate("/assets");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAsset();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Delete the asset
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Asset deleted",
        description: "Asset has been successfully deleted.",
      });
      
      navigate("/assets");
    } catch (error: any) {
      toast({
        title: "Error deleting asset",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!asset) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle size={48} className="text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Asset Not Found</h2>
          <p className="text-muted-foreground mb-4">The asset you're looking for doesn't exist or has been deleted.</p>
          <Link to="/assets">
            <NeuButton>Back to Assets</NeuButton>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="mb-6 flex items-center">
          <Link to="/assets" className="text-muted-foreground hover:text-foreground flex items-center">
            <ArrowLeft size={16} className="mr-1" />
            Back to Assets
          </Link>
        </div>

        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">{asset.name}</h1>
            <div className="flex items-center mt-2 text-muted-foreground">
              <span className="bg-neugray-200 px-2 py-1 rounded-full text-xs mr-2">
                {asset.category}
              </span>
              <span className="bg-neugray-200 px-2 py-1 rounded-full text-xs">
                {asset.type}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <NeuButton onClick={() => navigate(`/assets/${id}/edit`)}>
              <Pencil size={16} className="mr-2" />
              Edit
            </NeuButton>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <NeuButton variant="destructive">
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </NeuButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the asset.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <NeuCard>
              <h2 className="text-xl font-semibold mb-4">Asset Preview</h2>
              
              {asset.file_url ? (
                <div className="flex flex-col items-center">
                  {isImage ? (
                    <div className="w-full max-h-[500px] overflow-hidden rounded-lg mb-4 neu-flat">
                      <img 
                        src={asset.file_url} 
                        alt={asset.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full p-8 flex flex-col items-center justify-center neu-flat rounded-lg mb-4">
                      <FileText size={64} className="text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{asset.file_url.split('/').pop()}</p>
                    </div>
                  )}
                  
                  <a 
                    href={asset.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    download
                    className="neu-flat px-4 py-2 rounded-md hover:shadow-neu-pressed transition-all flex items-center"
                  >
                    <Download size={16} className="mr-2" />
                    Download File
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 bg-neugray-200 rounded-lg">
                  <File size={48} className="text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No file uploaded</p>
                </div>
              )}
            </NeuCard>
            
            {asset.description && (
              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-muted-foreground whitespace-pre-line">{asset.description}</p>
              </NeuCard>
            )}
            
            {asset.tags && asset.tags.length > 0 && (
              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag: string) => (
                    <span 
                      key={tag} 
                      className="bg-neugray-200 py-1 px-3 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </NeuCard>
            )}
          </div>

          <div className="space-y-6">
            {platform && (
              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">Platform</h2>
                <Link 
                  to={`/platforms/${asset.platform_id}`}
                  className="block neu-flat hover:shadow-neu-pressed p-4 rounded-lg transition-all mb-4"
                >
                  <h3 className="font-medium text-lg">{platform.name}</h3>
                  <p className="text-sm text-muted-foreground">Industry: {platform.industry}</p>
                </Link>
              </NeuCard>
            )}
            
            <NeuCard>
              <h2 className="text-xl font-semibold mb-4">Asset Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm">
                    {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated:</span>
                  <span className="text-sm">
                    {asset.updated_at ? new Date(asset.updated_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">File Size:</span>
                  <span className="text-sm">{asset.file_size || "N/A"}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Uploaded By:</span>
                  <span className="text-sm">{asset.uploaded_by || "N/A"}</span>
                </div>
              </div>
            </NeuCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssetDetail;
