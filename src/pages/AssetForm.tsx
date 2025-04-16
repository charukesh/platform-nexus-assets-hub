import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileIcon, Image } from "lucide-react";
import BuyTypeSelector from "@/components/asset/BuyTypeSelector";
import { PLACEMENT_OPTIONS } from "@/types/asset";

interface Platform {
  id: string;
  name: string;
}

const assetCategories = ["Digital", "Physical", "Phygital"];
const assetTypes = ["Image", "Video", "Document", "3D Model", "Audio", "Other"];

interface FormData {
  name: string;
  description: string;
  category: string;
  type: string;
  platform_id: string;
  tags: string[];
  tagInput: string;
  file_url: string | null;
  thumbnail_url: string | null;
  file_size: string | null;
  buy_types: string;
  amount: number;
  estimated_impressions: number;
  estimated_clicks: number;
  placement: string;
}

const AssetForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "Digital" as string,
    type: "Image" as string,
    platform_id: "" as string,
    tags: [] as string[],
    tagInput: "",
    file_url: "" as string | null,
    thumbnail_url: "" as string | null,
    file_size: "" as string | null,
    buy_types: 'CPC',
    amount: 0,
    estimated_impressions: 0,
    estimated_clicks: 0,
    placement: PLACEMENT_OPTIONS[0],
  });
  
  const [files, setFiles] = useState<{
    file: File | null,
    thumbnail: File | null,
    filePreview: string | null,
    thumbnailPreview: string | null
  }>({
    file: null,
    thumbnail: null,
    filePreview: null,
    thumbnailPreview: null
  });

  useEffect(() => {
    fetchPlatforms();
    
    if (id) {
      setIsEdit(true);
      fetchAsset(id);
    }
  }, [id]);

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from("platforms")
        .select("id, name");
        
      if (error) throw error;
      
      if (data) {
        setPlatforms(data);
        if (!id && data.length > 0) {
          setFormData(prev => ({ ...prev, platform_id: data[0].id }));
        }
      }
    } catch (error: any) {
      toast({
        title: "Error fetching platforms",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchAsset = async (assetId: string) => {
    try {
      setLoading(true);
      const { data: assetData, error } = await supabase
        .from("assets")
        .select(`
          *,
          platforms:platform_id (
            name,
            industry,
            audience_data,
            campaign_data,
            device_split,
            mau,
            dau,
            premium_users,
            restrictions
          )
        `)
        .eq("id", assetId)
        .single();
        
      if (error) throw error;
      
      if (assetData) {
        const estimatedImpressions = typeof assetData.estimated_impressions === 'number' 
          ? assetData.estimated_impressions 
          : 0;
        
        const estimatedClicks = typeof assetData.estimated_clicks === 'number' 
          ? assetData.estimated_clicks 
          : 0;
          
        const amount = typeof assetData.amount === 'number'
          ? assetData.amount
          : 0;
        
        const placement = assetData.placement || PLACEMENT_OPTIONS[0];
        
        setFormData({
          name: assetData.name || "",
          description: assetData.description || "",
          category: assetData.category || "Digital",
          type: assetData.type || "Image",
          platform_id: assetData.platform_id || "",
          tags: assetData.tags || [],
          tagInput: "",
          file_url: assetData.file_url || null,
          thumbnail_url: assetData.thumbnail_url || null,
          file_size: assetData.file_size || null,
          buy_types: assetData.buy_types || "CPC",
          amount,
          estimated_impressions: estimatedImpressions,
          estimated_clicks: estimatedClicks,
          placement
        });
      }
    } catch (error: any) {
      toast({
        title: "Error fetching asset details",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    console.log(`Field change: ${field} = `, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (formData.tagInput.trim() !== "" && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ""
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'thumbnail') => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileReader = new FileReader();
      
      fileReader.onload = (event) => {
        if (type === 'file') {
          setFiles(prev => ({
            ...prev,
            file: selectedFile,
            filePreview: event.target?.result as string
          }));
          setFormData(prev => ({
            ...prev,
            file_size: formatFileSize(selectedFile.size)
          }));
        } else {
          setFiles(prev => ({
            ...prev,
            thumbnail: selectedFile,
            thumbnailPreview: event.target?.result as string
          }));
        }
      };
      
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, type: 'file' | 'thumbnail') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fileReader = new FileReader();
      
      fileReader.onload = (event) => {
        if (type === 'file') {
          setFiles(prev => ({
            ...prev,
            file: droppedFile,
            filePreview: event.target?.result as string
          }));
          setFormData(prev => ({
            ...prev,
            file_size: formatFileSize(droppedFile.size)
          }));
        } else {
          setFiles(prev => ({
            ...prev,
            thumbnail: droppedFile,
            thumbnailPreview: event.target?.result as string
          }));
        }
      };
      
      fileReader.readAsDataURL(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (type: 'file' | 'thumbnail') => {
    if (type === 'file') {
      setFiles(prev => ({
        ...prev,
        file: null,
        filePreview: null
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFormData(prev => ({
        ...prev,
        file_url: null,
        file_size: null
      }));
    } else {
      setFiles(prev => ({
        ...prev,
        thumbnail: null,
        thumbnailPreview: null
      }));
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
      setFormData(prev => ({
        ...prev,
        thumbnail_url: null
      }));
    }
  };

  const handleBrowseClick = (type: 'file' | 'thumbnail') => {
    if (type === 'file' && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (type === 'thumbnail' && thumbnailInputRef.current) {
      thumbnailInputRef.current.click();
    }
  };

  const generateEmbeddings = async (assetId: string) => {
    try {
      console.log('Generating embeddings for asset:', assetId);
      
      const content = `${formData.name} ${formData.description || ''} ${formData.category} ${formData.type} ${formData.tags?.join(' ') || ''}`;
      console.log('Content for embedding:', content);
      
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: {
          id: assetId,
          content
        }
      });
      
      if (error) {
        console.error('Error generating embeddings:', error);
        throw error;
      }
      
      console.log('Embeddings generated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      toast({
        title: "Error generating embeddings",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setLoading(true);
      
      let file_url = formData.file_url;
      let thumbnail_url = formData.thumbnail_url;
      
      if (files.file) {
        file_url = files.filePreview;
      }
      
      if (files.thumbnail) {
        thumbnail_url = files.thumbnailPreview;
      }
      
      const assetData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        platform_id: formData.platform_id || platforms[0]?.id,
        tags: formData.tags,
        file_url,
        thumbnail_url,
        file_size: formData.file_size,
        updated_at: new Date().toISOString(),
        buy_types: formData.buy_types,
        amount: formData.amount,
        estimated_impressions: formData.estimated_impressions,
        estimated_clicks: formData.estimated_clicks,
        placement: formData.placement
      };
      
      console.log("Saving asset data:", assetData);
      
      let result;
      let assetId;
      
      if (isEdit && id) {
        console.log('Updating asset:', id);
        result = await supabase
          .from("assets")
          .update(assetData)
          .eq("id", id);
          
        if (result.error) throw result.error;
        assetId = id;
      } else {
        console.log('Creating new asset');
        result = await supabase
          .from("assets")
          .insert([{ ...assetData, created_at: new Date().toISOString() }])
          .select()
          .single();
          
        if (result.error) throw result.error;
        assetId = result.data.id;
      }
      
      console.log('Asset saved successfully, now generating embeddings');
      
      if (assetId) {
        await generateEmbeddings(assetId);
      } else {
        console.error('Failed to get valid asset ID for embeddings generation');
      }
      
      toast({
        title: `Asset ${isEdit ? 'updated' : 'created'} successfully`,
        variant: "default"
      });
      
      navigate("/assets");
    } catch (error: any) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} asset:`, error);
      toast({
        title: `Error ${isEdit ? 'updating' : 'creating'} asset`,
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{isEdit ? "Edit Asset" : "Add New Asset"}</h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? "Update asset information" : "Create a new digital or physical asset"}
          </p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <NeuCard>
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Asset Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter asset name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="placement">Placement*</Label>
                  <Select
                    value={formData.placement}
                    onValueChange={(value) => handleSelectChange("placement", value)}
                  >
                    <SelectTrigger className="mt-1.5 bg-white border-none neu-flat hover:shadow-neu-pressed">
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACEMENT_OPTIONS.map((placement) => (
                        <SelectItem key={placement} value={placement}>
                          {placement}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category">Category*</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger className="mt-1.5 bg-white border-none neu-flat hover:shadow-neu-pressed">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="type">Asset Type*</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger className="mt-1.5 bg-white border-none neu-flat hover:shadow-neu-pressed">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="platform">Platform*</Label>
                  <Select
                    value={formData.platform_id}
                    onValueChange={(value) => handleSelectChange("platform_id", value)}
                    required
                  >
                    <SelectTrigger className="mt-1.5 bg-white border-none neu-flat hover:shadow-neu-pressed">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter asset description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1.5 min-h-[120px] bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex mt-1.5">
                    <Input
                      id="tagInput"
                      name="tagInput"
                      placeholder="Add tags"
                      value={formData.tagInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <NeuButton
                      type="button"
                      onClick={handleAddTag}
                      className="ml-2"
                    >
                      Add
                    </NeuButton>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-neugray-200 rounded-full px-2 py-1 text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </NeuCard>
          
          <NeuCard>
            <h2 className="text-xl font-bold mb-4">Buy Type Information</h2>
            <BuyTypeSelector
              buyType={formData.buy_types}
              amount={formData.amount}
              estimatedImpressions={formData.estimated_impressions}
              estimatedClicks={formData.estimated_clicks}
              onChange={handleFieldChange}
            />
          </NeuCard>
          
          <NeuCard>
            <h2 className="text-xl font-bold mb-4">Asset Files</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Asset File</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e, 'file')}
                  className="hidden"
                />
                
                <div
                  className={`mt-1.5 border-2 border-dashed rounded-lg p-6 text-center ${
                    files.filePreview ? 'border-primary' : 'border-gray-300'
                  }`}
                  onDrop={(e) => handleFileDrop(e, 'file')}
                  onDragOver={handleDragOver}
                >
                  {files.filePreview ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <div className="w-full max-h-48 overflow-hidden flex items-center justify-center bg-neugray-200 rounded-lg">
                          {formData.type === 'Image' ? (
                            <img
                              src={files.filePreview}
                              alt="File preview"
                              className="max-w-full max-h-48 object-contain"
                            />
                          ) : (
                            <div className="p-8">
                              <FileIcon size={60} className="mx-auto text-neugray-400" />
                              <p className="mt-2 text-sm text-muted-foreground truncate max-w-xs">
                                {files.file?.name || 'File'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {formData.file_size || 'Unknown size'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile('file')}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium mb-1">
                        Drag and drop your file here
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Supports images, documents, videos, and audio files
                      </p>
                      <NeuButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleBrowseClick('file')}
                      >
                        Browse Files
                      </NeuButton>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Thumbnail Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  ref={thumbnailInputRef}
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                  className="hidden"
                />
                
                <div
                  className={`mt-1.5 border-2 border-dashed rounded-lg p-6 text-center ${
                    files.thumbnailPreview ? 'border-primary' : 'border-gray-300'
                  }`}
                  onDrop={(e) => handleFileDrop(e, 'thumbnail')}
                  onDragOver={handleDragOver}
                >
                  {files.thumbnailPreview ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <div className="w-full h-40 overflow-hidden flex items-center justify-center bg-neugray-200 rounded-lg">
                          <img
                            src={files.thumbnailPreview}
                            alt="Thumbnail preview"
                            className="max-w-full max-h-40 object-contain"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeFile('thumbnail')}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium mb-1">
                        Add a thumbnail image
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        This will be displayed in the asset list
                      </p>
                      <NeuButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleBrowseClick('thumbnail')}
                      >
                        Browse Images
                      </NeuButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </NeuCard>
          
          <div className="flex justify-end gap-3">
            <NeuButton
              type="button"
              variant="outline"
              onClick={() => navigate("/assets")}
            >
              Cancel
            </NeuButton>
            <NeuButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : (
                isEdit ? "Save Changes" : "Create Asset"
              )}
            </NeuButton>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AssetForm;
