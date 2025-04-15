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

interface Platform {
  id: string;
  name: string;
}

const assetCategories = ["Digital", "Physical", "Phygital"];
const assetTypes = ["Image", "Video", "Document", "3D Model", "Audio", "Other"];

const AssetForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Digital" as string,
    type: "Image" as string,
    platform_id: "" as string,
    tags: [] as string[],
    tagInput: "",
    file_url: "" as string | null,
    thumbnail_url: "" as string | null,
    file_size: "" as string | null
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
      fetchAssetDetails(id);
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
        // Set first platform as default if creating new asset
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

  const fetchAssetDetails = async (assetId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("id", assetId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setFormData({
          name: data.name || "",
          description: data.description || "",
          category: data.category || "Digital",
          type: data.type || "Image",
          platform_id: data.platform_id || "",
          tags: data.tags || [],
          tagInput: "",
          file_url: data.file_url || null,
          thumbnail_url: data.thumbnail_url || null,
          file_size: data.file_size || null
        });
        
        // Set previews for existing files
        setFiles({
          file: null,
          thumbnail: null,
          filePreview: data.file_url,
          thumbnailPreview: data.thumbnail_url
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      let file_url = formData.file_url;
      let thumbnail_url = formData.thumbnail_url;
      
      // For now, simulate file uploads by using the file previews
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
        platform_id: formData.platform_id,
        tags: formData.tags,
        file_url,
        thumbnail_url,
        file_size: formData.file_size,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (isEdit) {
        result = await supabase
          .from("assets")
          .update(assetData)
          .eq("id", id);
      } else {
        result = await supabase
          .from("assets")
          .insert([{ ...assetData, created_at: new Date().toISOString() }])
          .select()
          .single();
      }
      
      if (result.error) throw result.error;
      
      // Generate embedding for the asset
      const content = `${assetData.name} ${assetData.description || ''} ${assetData.category} ${assetData.type} ${assetData.tags?.join(' ') || ''}`;
      
      await supabase.functions.invoke('generate-embeddings', {
        body: {
          type: 'asset',
          id: isEdit ? id : result.data.id,
          content
        }
      });
      
      toast({
        title: `Asset ${isEdit ? 'updated' : 'created'} successfully`,
        variant: "default"
      });
      
      navigate("/assets");
    } catch (error: any) {
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
                    onChange={handleChange}
                    className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
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
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={formData.platform_id}
                    onValueChange={(value) => handleSelectChange("platform_id", value)}
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
                    onChange={handleChange}
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
                      onChange={handleChange}
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
