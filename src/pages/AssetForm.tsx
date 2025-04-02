
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, File, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MultiStepForm from "@/components/MultiStepForm";

// Categories and types definitions
const categories = ["Digital", "Physical", "Phygital"];

const assetTypes = {
  Digital: [
    "Static Masthead", 
    "Video Masthead", 
    "Shoppable Story", 
    "Scratch Card", 
    "Premium Banner",
    "Interactive Ad",
    "Story Ad",
    "Sponsored Content",
    "Carousel Ad"
  ],
  Physical: [
    "Flyer", 
    "Co-branded Carry Bag", 
    "Rider Jersey Branding", 
    "Sample", 
    "Kiosk", 
    "Lift Posters", 
    "Food Truck",
    "Branded Merchandise",
    "Store Display"
  ],
  Phygital: [
    "Journey Ads", 
    "Map Integration", 
    "Spotlight Banner", 
    "Roadblock",
    "QR Experience",
    "AR Overlay",
    "Location-based Notification",
    "Digital-to-Physical Redemption"
  ]
};

const tagSuggestions = [
  "Social", "Video", "Banner", "Interactive", "Branding", "Retail", 
  "Header", "Shopping", "Premium", "Location", "AR", "VR", "Mobile",
  "Desktop", "Immersive", "Promotional", "Seasonal", "Campaign"
];

const AssetForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const isEditMode = Boolean(id);
  
  // Get platform_id from URL search params if it exists
  const queryParams = new URLSearchParams(location.search);
  const platformIdFromQuery = queryParams.get('platform_id');
  
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "",
    platform_id: platformIdFromQuery || "",
    description: "",
    file_url: "",
    file_size: ""
  });

  useEffect(() => {
    // Fetch platforms for dropdown
    fetchPlatforms();
    
    if (isEditMode) {
      fetchAsset();
    }
  }, [id]);

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('platforms')
        .select('id, name');

      if (error) throw error;
      
      if (data) {
        setPlatforms(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching platforms",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchAsset = async () => {
    if (!id) return;
    
    try {
      setFetchLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData({
          name: data.name || "",
          category: data.category || "",
          type: data.type || "",
          platform_id: data.platform_id || "",
          description: data.description || "",
          file_url: data.file_url || "",
          file_size: data.file_size || ""
        });
        
        setSelectedCategory(data.category || "");
        setTags(data.tags || []);
        
        if (data.file_url) {
          setFileUploaded(true);
          // If it's an image, set preview
          if (data.file_url.match(/\.(jpeg|jpg|gif|png)$/)) {
            setFilePreview(data.file_url);
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error fetching asset",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    handleChange('category', value);
    // Reset type when category changes
    handleChange('type', '');
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFileUploaded(true);
    setUploadedFile(file);
    
    // Update file size
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    handleChange('file_size', `${fileSizeInMB}MB`);
    
    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    toast({
      title: "File selected",
      description: `${file.name} has been selected for upload.`,
    });
  };

  const handleRemoveFile = () => {
    setFileUploaded(false);
    setFilePreview(null);
    setUploadedFile(null);
    handleChange('file_size', '');
    handleChange('file_url', '');
  };

  const uploadFile = async () => {
    if (!uploadedFile) return null;
    
    try {
      // Create a unique file path with proper directory structure
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `asset-files/${fileName}`; // Use a dedicated folder for uploads
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('assets') // Make sure this bucket exists in Supabase
        .upload(filePath, uploadedFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Upload file if selected and get URL
      let fileUrl = formData.file_url; // Keep existing URL if in edit mode
      if (uploadedFile) {
        fileUrl = await uploadFile();
        if (!fileUrl) return; // Stop if upload failed
      }
      
      // Create thumbnail URL (just use the same URL for now)
      const thumbnailUrl = fileUrl;
      
      // Prepare data for database
      const assetData = {
        name: formData.name,
        category: formData.category,
        type: formData.type,
        platform_id: formData.platform_id || null, // Allow null if no platform selected
        description: formData.description,
        tags,
        file_url: fileUrl,
        file_size: formData.file_size,
        thumbnail_url: thumbnailUrl
      };
      
      let result;
      
      if (isEditMode) {
        // Update existing asset
        result = await supabase
          .from('assets')
          .update(assetData)
          .eq('id', id);
      } else {
        // Insert new asset
        result = await supabase
          .from('assets')
          .insert(assetData);
      }
      
      const { error } = result;
      
      if (error) throw error;
      
      toast({
        title: isEditMode ? "Asset updated" : "Asset created",
        description: isEditMode 
          ? "Asset has been successfully updated." 
          : "Asset has been successfully created.",
      });
      
      // Navigate back to platform detail if we came from there
      if (platformIdFromQuery) {
        navigate(`/platforms/${platformIdFromQuery}`);
      } else {
        navigate("/assets");
      }
    } catch (error: any) {
      toast({
        title: "Error saving asset",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Validate the basic info step
  const validateBasicInfo = () => {
    if (!formData.name || !formData.category || !formData.type) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Create the steps for our multistep form
  const formSteps = [
    {
      title: "Basic Information",
      validator: validateBasicInfo,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Asset Name*</Label>
            <Input
              id="asset-name"
              placeholder="Enter asset name"
              className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select 
                required
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="bg-white border-none neu-pressed focus:ring-offset-0">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Asset Type*</Label>
              <Select
                required
                disabled={!selectedCategory}
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger className="bg-white border-none neu-pressed focus:ring-offset-0">
                  <SelectValue placeholder={selectedCategory ? "Select type" : "Select category first"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory && 
                    assetTypes[selectedCategory as keyof typeof assetTypes].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform Association</Label>
              <Select
                value={formData.platform_id}
                onValueChange={(value) => handleChange('platform_id', value)}
              >
                <SelectTrigger className="bg-white border-none neu-pressed focus:ring-offset-0">
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

          <div className="space-y-2">
            <Label htmlFor="description">Description/Notes</Label>
            <Textarea
              id="description"
              placeholder="Enter description or notes about this asset..."
              className="bg-white border-none neu-pressed focus-visible:ring-offset-0 min-h-[120px]"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      title: "Tags & Keywords",
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <div key={tag} className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm">
                <span>{tag}</span>
                <button 
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <NeuButton type="button" onClick={handleAddTag}>
              Add
            </NeuButton>
          </div>
          
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {tagSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="text-xs py-1 px-2 neu-flat hover:shadow-neu-pressed"
                  onClick={() => {
                    if (!tags.includes(suggestion)) {
                      setTags([...tags, suggestion]);
                    }
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "File Upload",
      content: (
        <div className="space-y-4">
          {!fileUploaded ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive ? "border-primary bg-primary/5" : "border-neugray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">Drag & Drop</h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              
              <Input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <NeuButton type="button" variant="outline" className="cursor-pointer">
                  Browse Files
                </NeuButton>
              </label>
              
              <p className="text-xs text-muted-foreground mt-4">
                Supported file types: JPG, PNG, GIF, PDF, MP4, MOV
              </p>
            </div>
          ) : (
            <div className="neu-flat p-4 rounded-lg">
              {filePreview ? (
                <div className="space-y-3">
                  <div className="relative h-40 bg-neugray-200 rounded-lg overflow-hidden">
                    <img
                      src={filePreview}
                      alt="File preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-1 bg-foreground/10 backdrop-blur-sm rounded-full"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                  <p className="text-sm font-medium">Image uploaded successfully</p>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="mr-3 p-2 bg-neugray-200 rounded">
                    <File size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">File selected for upload</p>
                    <p className="text-xs text-muted-foreground">
                      File ready for submission
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 mt-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Upload Date:</span>
              <span className="text-sm">{new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">File Size:</span>
              <span className="text-sm">{formData.file_size || "-"}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Uploaded By:</span>
              <span className="text-sm">Current User</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  if (fetchLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{isEditMode ? "Edit Asset" : "Add New Asset"}</h1>
            <p className="text-muted-foreground mt-1">Upload and categorize a new asset</p>
          </div>
        </header>

        <div className="max-w-3xl mx-auto">
          <NeuCard>
            <MultiStepForm
              steps={formSteps}
              onComplete={handleSubmit}
              onCancel={() => navigate("/assets")}
              isSubmitting={loading}
            />
          </NeuCard>
        </div>
      </div>
    </Layout>
  );
};

export default AssetForm;
