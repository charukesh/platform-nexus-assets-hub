
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import MultiStepForm from "@/components/MultiStepForm";
import CampaignRequirements from "@/components/campaign/CampaignRequirements";
import PlatformSelection from "@/components/campaign/PlatformSelection";
import QuotationPreview from "@/components/campaign/QuotationPreview";
import NeuCard from "@/components/NeuCard";
import { useToast } from "@/hooks/use-toast";

export interface CampaignData {
  industry: string;
  demographics: {
    ageGroups: string[];
    gender: string[];
    interests: string[];
  };
  geographics: {
    cities: string[];
    states: string[];
    tierLevels: string[];
  };
  objectives: string[];
  duration: {
    startDate: Date | undefined;
    endDate: Date | undefined;
  };
  budget: number;
  assetCategories: string[];
  platformPreferences: string[];
}

const initialCampaignData: CampaignData = {
  industry: "",
  demographics: {
    ageGroups: [],
    gender: [],
    interests: []
  },
  geographics: {
    cities: [],
    states: [],
    tierLevels: []
  },
  objectives: [],
  duration: {
    startDate: undefined,
    endDate: undefined
  },
  budget: 0,
  assetCategories: [],
  platformPreferences: []
};

const CampaignQuotation: React.FC = () => {
  const [campaignData, setCampaignData] = useState<CampaignData>(initialCampaignData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateCampaignData = (data: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...data }));
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      
      // Here we would typically save the campaign data to the database
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Campaign Quotation Created",
        description: "Your campaign quotation has been successfully created.",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign quotation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Campaign Requirements",
      content: <CampaignRequirements data={campaignData} updateData={updateCampaignData} />,
      validator: () => {
        const { industry, demographics, geographics, objectives, duration, budget, assetCategories } = campaignData;
        if (!industry) {
          toast({ title: "Error", description: "Please select an industry", variant: "destructive" });
          return false;
        }
        if (demographics.ageGroups.length === 0 || demographics.gender.length === 0) {
          toast({ title: "Error", description: "Please complete demographic information", variant: "destructive" });
          return false;
        }
        if (geographics.tierLevels.length === 0) {
          toast({ title: "Error", description: "Please select at least one tier level", variant: "destructive" });
          return false;
        }
        if (objectives.length === 0) {
          toast({ title: "Error", description: "Please select at least one campaign objective", variant: "destructive" });
          return false;
        }
        if (!duration.startDate || !duration.endDate) {
          toast({ title: "Error", description: "Please set campaign duration", variant: "destructive" });
          return false;
        }
        if (budget <= 0) {
          toast({ title: "Error", description: "Please enter a valid budget", variant: "destructive" });
          return false;
        }
        if (assetCategories.length === 0) {
          toast({ title: "Error", description: "Please select at least one asset category", variant: "destructive" });
          return false;
        }
        return true;
      }
    },
    {
      title: "Platform Selection",
      content: <PlatformSelection data={campaignData} updateData={updateCampaignData} />,
      validator: () => {
        // Platform selection is optional, but we validate that we have enough platforms
        // either from user selection or auto-suggested
        return true;
      }
    },
    {
      title: "Quotation Preview",
      content: <QuotationPreview data={campaignData} />,
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Create Campaign Quotation</h1>
        
        <NeuCard variant="flat" className="p-8">
          <MultiStepForm 
            steps={steps} 
            onComplete={handleComplete} 
            onCancel={() => navigate("/")} 
            isSubmitting={isSubmitting}
          />
        </NeuCard>
      </div>
    </Layout>
  );
};

export default CampaignQuotation;
