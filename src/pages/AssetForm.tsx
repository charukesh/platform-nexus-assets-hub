
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, File, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock options
const platforms = ["Instagram", "Spotify", "YouTube", "TikTok", "Uber", "Amazon", "Google"];
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
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileUploaded) {
      toast({
        title: "File required",
        description: "Please upload a file for this asset.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Asset saved",
      description: "Asset has been successfully saved.",
    });
    navigate("/assets");
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
      title: "File uploaded",
      description: `${file.name} has been uploaded.`,
    });
  };

  const handleRemoveFile = () => {
    setFileUploaded(false);
    setFilePreview(null);
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Add New Asset</h1>
            <p className="text-muted-foreground mt-1">Upload and categorize a new asset</p>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">Asset Information</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="asset-name">Asset Name*</Label>
                    <Input
                      id="asset-name"
                      placeholder="Enter asset name"
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category*</Label>
                      <Select 
                        required
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
                      <Label htmlFor="platform">Platform Association*</Label>
                      <Select required>
                        <SelectTrigger className="bg-white border-none neu-pressed focus:ring-offset-0">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {platform}
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags/Keywords</Label>
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
                </div>
              </NeuCard>
              
              <div className="flex justify-end gap-3">
                <NeuButton type="button" variant="outline" onClick={() => navigate("/assets")}>
                  Cancel
                </NeuButton>
                <NeuButton type="submit">Save Asset</NeuButton>
              </div>
            </div>

            <div className="space-y-6">
              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">File Upload</h2>
                
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
                          <p className="text-sm font-medium">File uploaded successfully</p>
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
              </NeuCard>

              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">Asset Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Upload Date:</span>
                    <span className="text-sm">{new Date().toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">File Size:</span>
                    <span className="text-sm">{fileUploaded ? "2.4 MB" : "-"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Uploaded By:</span>
                    <span className="text-sm">Current User</span>
                  </div>
                </div>
              </NeuCard>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AssetForm;
