
import { Json } from "@/integrations/supabase/types";

// Interface for form data structure
export interface FormDataType {
  name: string;
  industry: string;
  mau: string;
  dau: string;
  premium_users: number;
  premium_users_display_as_percentage: boolean;
  device_split: {
    ios: number;
    android: number;
  };
  audience_data: {
    supports: {
      age: boolean;
      gender: boolean;
      interests: boolean;
      cities: boolean;
      states: boolean;
      pincodes: boolean;
      realtime: boolean;
    };
    demographic: {
      ageGroups: string[];
      gender: string[];
      interests: string[];
    };
    geographic: {
      cities: string[];
      states: string[];
      regions: string[];
      pincodes: string[];
    };
    realtime: boolean;
  };
  campaign_data: {
    buyTypes: string[];
    funneling: string[];
    innovations: string;
  };
  restrictions: {
    blockedCategories: string[];
    minimumSpend: number;
    didYouKnow: string;
  };
}

// Default form data state
export const defaultFormData: FormDataType = {
  name: "",
  industry: "",
  mau: "",
  dau: "",
  premium_users: 0,
  premium_users_display_as_percentage: true,
  device_split: {
    ios: 50,
    android: 50
  },
  audience_data: {
    supports: {
      age: false,
      gender: false,
      interests: false,
      cities: false,
      states: false,
      pincodes: false,
      realtime: false
    },
    demographic: {
      ageGroups: [],
      gender: [],
      interests: []
    },
    geographic: {
      cities: [],
      states: [],
      regions: [],
      pincodes: []
    },
    realtime: false
  },
  campaign_data: {
    buyTypes: [],
    funneling: [],
    innovations: ""
  },
  restrictions: {
    blockedCategories: [],
    minimumSpend: 0,
    didYouKnow: ""
  }
};

// Helper function to safely parse JSON data from Supabase
export const parseJsonField = <T extends object>(jsonData: Json | null, defaultValue: T): T => {
  if (!jsonData) return defaultValue;
  
  if (typeof jsonData === 'object' && jsonData !== null && !Array.isArray(jsonData)) {
    return { ...defaultValue, ...jsonData as object } as T;
  }
  
  return defaultValue;
};

// Format premium users based on display preference
export const formatPremiumUsers = (value: number, asPercentage: boolean, mau: string): string => {
  if (asPercentage) {
    return `${value}%`;
  } else {
    // Convert percentage to count in millions based on MAU
    const mauValue = parseFloat(mau.replace(/[^0-9.]/g, ''));
    if (isNaN(mauValue)) return `${value}%`;
    
    const count = (mauValue * value) / 100;
    return count >= 1 ? `${count.toFixed(2)}M` : `${(count * 1000).toFixed(0)}K`;
  }
};

// Industry options
export const industries = [
  "Video Streaming", "Food Delivery", "E-commerce", "Social Media", 
  "Ride Sharing", "Travel", "Fintech", "Health & Fitness", "Gaming",
  "News & Media", "Music & Audio", "Retail", "QSR"
];

// Device platforms
export const devicePlatforms = ["iOS", "Android", "Web", "Connected TV"];

// Demographics
export const ageGroups = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];
export const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
export const interestCategories = [
  "Technology", "Fashion", "Sports", "Music", "Food", "Travel", "Gaming", 
  "Fitness", "Beauty", "Home", "Books", "Movies", "Business", "Photography",
  "Arts & Culture", "Outdoors", "Politics", "Science", "Health", "Pets",
  "Family", "Education", "Automotive", "Finance", "Shopping"
];

// Campaign types
export const buyTypes = ["CPC", "CPM", "CPA", "CPL", "CPV", "Flat Fee", "Sponsorship"];
export const funnelingOptions = ["Performance Led", "Brand Recall", "Call to Action"];
export const blockedCategories = [
  "Alcohol", "Tobacco", "Gambling", "Weapons", "Adult Content", 
  "Political", "Religious", "Pharmaceuticals", "Controversial Topics"
];
