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
import { 
  PLACEMENT_OPTIONS, 
  BUY_TYPE_OPTIONS,
  AD_FORMAT_OPTIONS,
  AD_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  DELIVERABLES_OPTIONS,
  CTA_OPTIONS
} from "@/types/asset";

interface Platform {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  type: string;
  ad_format: string;
  ad_type: string;
  platform_id: string;
  tags: string[];
  tagInput: string;
  file_url: string | null;
  thumbnail_url: string | null;
  file_size: string | null;
  buy_types: string;
  amount: number;
  placement: string;
  ctr: number;
  vtr: number;
  deliverables: string;
  cta: string;
  snapshot_ref: string;
  minimum_cost: number;
  moq: string;
  rate_inr: number;
  gtm_rate: number;
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
    category: CATEGORY_OPTIONS[0],
    type: "",
    ad_format: AD_FORMAT_OPTIONS[0],
    ad_type: AD_TYPE_OPTIONS[0],
    platform_id: "",
    tags: [],
    tagInput: "",
    file_url: null,
    thumbnail_url: null,
    file_size: null,
    buy_types: BUY_TYPE_OPTIONS[0],
    amount: 0,
    placement: PLACEMENT_OPTIONS[0],
    ctr: 0,
    vtr: 0,
    deliverables: DELIVERABLES_OPTIONS[0],
    cta: CTA_OPTIONS[0],
    snapshot_ref: "",
    minimum_cost: 0,
    moq: "",
    rate_inr: 0,
    gtm_rate: 0,
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
        // Convert null values to defaults
        const amount = typeof assetData.amount === 'number' ? assetData.amount : 0;
        const placement = assetData.placement || PLACEMENT_OPTIONS[0];
        const ctr = typeof assetData.ctr === 'number' ? assetData.ctr : 0;
        const vtr = typeof assetData.vtr === 'number' ? assetData.vtr : 0;
        const ad_format = assetData.ad_format || AD_FORMAT_OPTIONS[0];
        const ad_type = assetData.ad_type || AD_TYPE_OPTIONS[0];
        const deliverables = assetData.deliverables || DELIVERABLES_OPTIONS[0];
        const cta = assetData.cta || CTA_OPTIONS[0];
        const snapshot_ref = assetData.snapshot_ref || "";
        const minimum_cost = typeof assetData.minimum_cost === 'number' ? assetData.minimum_cost : 0;
        const moq = assetData.moq || "";
        const rate_inr = typeof assetData.rate_inr === 'number' ? assetData.rate_inr : 0;
        const gtm_rate = typeof assetData.gtm_rate === 'number' ? assetData.gtm_rate : 0;
        
        setFormData({
          name: assetData.name || "",
          description: assetData.description || "",
          category: assetData.category || CATEGORY_OPTIONS[0],
          type: assetData.type || "",
          ad_format,
          ad_type,
          platform_id: assetData.platform_id || "",
          tags: assetData.tags || [],
          tagInput: "",
          file_url: assetData.file_url || null,
          thumbnail_url: assetData.thumbnail_url || null,
          file_size: assetData.file_size || null,
          buy_types: assetData.buy_types || BUY_TYPE_OPTIONS[0],
          amount,
          placement,
          ctr,
          vtr,
          deliverables,
          cta,
          snapshot_ref,
          minimum_cost,
          moq,
          rate_inr,
          gtm_rate
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

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = e.target.type === 'number' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: numValue }));
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
        ad_format: formData.ad_format,
        ad_type: formData.ad_type,
        platform_id: formData.platform_id || platforms[0]?.id,
        tags: formData.tags,
        file_url,
        thumbnail_url,
        file_size: formData.file_size,
        updated_at: new Date().toISOString(),
        buy_types: formData.buy_types,
        amount: formData.amount,
        placement: formData.placement,
        ctr: formData.ctr,
        vtr: formData.vtr,
        deliverables: formData.deliverables,
        cta: formData.cta,
        snapshot_ref: formData.snapshot_ref,
        minimum_cost: formData.minimum_cost,
        moq: formData.moq,
        rate_inr: formData.rate_inr,
        gtm_rate: formData.gtm_rate
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

                <div>
                  <Label htmlFor="ad_format">Ad Format*</Label>
                  <Select
                    value={formData.ad_format}
                    onValueChange={(value) => handleSelectChange("ad_format", value)}
                  >
                    <SelectTrigger className="mt-1.5 bg-white border-none neu-flat hover:shadow-neu-pressed">
                      <SelectValue placeholder="Select ad format" />
                    </SelectTrigger>
                    <SelectContent>
                      {AD_FORMAT_OPTIONS.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ad_type">Ad Type*</Label>
                  <Select
                    value={formData.ad_type}
                    onValueChange={(value) => handleSelectChange("ad_type", value)}
                  >
                    <SelectTrigger className="mt-1.5 bg-white border-none neu-flat hover:shadow-neu-pressed">
                      <SelectValue placeholder="Select ad type" />
                    </SelectTrigger>
                    <SelectContent>
                      {AD_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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
                      {CATEGORY_OPTIONS.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <h2 className="text-xl font-bold mb-4">Creative & Execution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deliverables">Deliverables*</Label>
                  <Select
                    value={formData.deliverables}
                    onValueChange={(value) => handleSelectChange("deliverables", value)}
                  >
                    <SelectTrigger className="mt-1.5 bg-white border-none neu-flat hover:shadow-neu-pressed">
                      <SelectValue placeholder="Select deliverables" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERABLES_OPTIONS.map((deliverable) => (
                        <SelectItem key={deliverable} value={deliverable}>
                          {deliverable}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cta">Call to Action</Label>
                  <Select
                    value={formData.cta}
                    onValueChange={(value) => handleSelectChange("cta", value)}
                  >
                    <SelectTrigger className="mt-1.5 bg-white border-none neu-flat hover:shadow-neu-pressed">
                      <SelectValue placeholder="Select CTA" />
                    </SelectTrigger>
                    <SelectContent>
                      {CTA_OPTIONS.map((cta) => (
                        <SelectItem key={cta} value={cta}>
                          {cta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="snapshot_ref">Snapshot Ref. No</Label>
                  <Input
                    id="snapshot_ref"
                    name="snapshot_ref"
                    placeholder="Enter reference number"
                    value={formData.snapshot_ref}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>
          </NeuCard>
          
          <NeuCard>
            <h2 className="text-xl font-bold mb-4">Buy Type Information</h2>
            <BuyTypeSelector
              buyType={formData.buy_types}
              amount={formData.amount}
              onChange={handleFieldChange}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <Label htmlFor="minimum_cost">Minimum Cost</Label>
                <Input
                  id="minimum_cost"
                  name="minimum_cost"
                  type="number"
                  placeholder="Enter minimum cost"
                  value={formData.minimum_cost}
                  onChange={handleNumberInput}
                  className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              <div>
                <Label htmlFor="moq">MOQ (Min Order Quantity)</Label>
                <Input
                  id="moq"
                  name="moq"
                  placeholder="Enter MOQ"
                  value={formData.moq}
                  onChange={handleInputChange}
                  className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div>
                <Label htmlFor="rate_inr">Rate in INR</Label>
                <Input
                  id="rate_inr"
                  name="rate_inr"
                  type="number"
                  placeholder="Enter rate in INR"
                  value={formData.rate_inr}
                  onChange={handleNumberInput}
                  className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              <div>
                <Label htmlFor="gtm_rate">GTM Rate</Label>
                <Input
                  id="gtm_rate"
                  name="gtm_rate"
                  type="number"
                  placeholder="Enter GTM rate"
                  value={formData.gtm_rate}
                  onChange={handleNumberInput}
                  className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </NeuCard>
          
          <NeuCard>
            <h2 className="text-xl font-bold mb-4">Asset Files</h2>
          
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
          </NeuCard>
        
          <NeuCard>
            <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="ctr">CTR (%)</Label>
                <Input
                  id="ctr"
                  name="ctr"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Enter CTR percentage"
                  value={formData.ctr}
                  onChange={(e) => handleFieldChange('ctr', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div>
                <Label htmlFor="vtr">VTR (%)</Label>
                <Input
                  id="vtr"
                  name="vtr"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Enter VTR percentage"
                  value={formData.vtr}
                  onChange={(e) => handleFieldChange('vtr', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                />
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
