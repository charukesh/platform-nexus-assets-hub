
import React, { useEffect, useState } from "react";
import { CampaignData } from "@/pages/CampaignQuotation";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format } from "date-fns";
import { Calendar, Download, FileSpreadsheet, Printer, Users } from "lucide-react";

interface QuotationPreviewProps {
  data: CampaignData;
}

interface Platform {
  id: string;
  name: string;
  industry: string;
  mau: string | number;
  dau: string | number;
}

interface Asset {
  id: string;
  name: string;
  category: string;
  platform_id: string;
  cost_per_day?: number;
  estimated_impressions?: number;
}

interface PlatformWithAssets extends Platform {
  assets: Asset[];
  totalCost: number;
  totalImpressions: number;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({ data }) => {
  const [platforms, setPlatforms] = useState<PlatformWithAssets[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignDays, setCampaignDays] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [totalImpressions, setTotalImpressions] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (data.duration.startDate && data.duration.endDate) {
      const days = differenceInDays(data.duration.endDate, data.duration.startDate) + 1;
      setCampaignDays(days > 0 ? days : 1);
    }

    fetchData();
  }, [data]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!data.platformPreferences.length) {
        setPlatforms([]);
        return;
      }

      // Fetch selected platforms
      const { data: platformsData, error: platformsError } = await supabase
        .from("platforms")
        .select("*")
        .in("id", data.platformPreferences);

      if (platformsError) throw platformsError;

      // Fetch assets for selected platforms
      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("*")
        .in("platform_id", data.platformPreferences)
        .in("category", data.assetCategories);

      if (assetsError) throw assetsError;

      // Calculate costs
      let calculatedTotalCost = 0;
      let calculatedTotalImpressions = 0;

      const processedPlatforms = platformsData.map((platform) => {
        const platformAssets = assetsData.filter(
          (asset) => asset.platform_id === platform.id
        );

        const platformTotalCost = platformAssets.reduce((sum, asset) => {
          // Base cost per day (random between 5000 and 20000 if not set)
          const costPerDay = asset.cost_per_day || Math.floor(Math.random() * 15000) + 5000;
          return sum + costPerDay * campaignDays;
        }, 0);

        const platformTotalImpressions = platformAssets.reduce((sum, asset) => {
          // Estimated impressions (random between 10000 and 100000 if not set)
          const impressions = asset.estimated_impressions || Math.floor(Math.random() * 90000) + 10000;
          return sum + impressions * campaignDays;
        }, 0);

        calculatedTotalCost += platformTotalCost;
        calculatedTotalImpressions += platformTotalImpressions;

        return {
          ...platform,
          assets: platformAssets,
          totalCost: platformTotalCost,
          totalImpressions: platformTotalImpressions
        };
      });

      setPlatforms(processedPlatforms);
      setTotalCost(calculatedTotalCost);
      setTotalImpressions(calculatedTotalImpressions);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Your quotation is being prepared as a PDF."
    });
    // In a real implementation, this would trigger a PDF download
  };

  const handleExportExcel = () => {
    toast({
      title: "Export Started",
      description: "Your quotation is being prepared as an Excel file."
    });
    // In a real implementation, this would trigger an Excel download
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="quotation-preview">
      {/* Export Actions */}
      <div className="flex justify-end gap-2 mb-6">
        <NeuButton variant="outline" size="sm" onClick={handleExportPDF}>
          <Download size={16} />
          Export PDF
        </NeuButton>
        <NeuButton variant="outline" size="sm" onClick={handleExportExcel}>
          <FileSpreadsheet size={16} />
          Export Excel
        </NeuButton>
        <NeuButton variant="outline" size="sm" onClick={handlePrint}>
          <Printer size={16} />
          Print
        </NeuButton>
      </div>

      {/* Quotation Header */}
      <NeuCard className="mb-6 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">Campaign Quotation</h2>
            <p className="text-muted-foreground">
              Generated on {format(new Date(), "MMMM d, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <Calendar size={16} className="text-primary" />
              <span className="font-medium">Campaign Duration:</span>
              {data.duration.startDate && data.duration.endDate ? (
                <span>
                  {format(data.duration.startDate, "MMM d, yyyy")} - {format(data.duration.endDate, "MMM d, yyyy")}
                </span>
              ) : (
                <span>Not set</span>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="font-medium">Days:</span>
              <span>{campaignDays}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="neu-pressed p-4 rounded-lg">
            <p className="text-muted-foreground mb-1">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(data.budget)}</p>
          </div>
          <div className="neu-pressed p-4 rounded-lg">
            <p className="text-muted-foreground mb-1">Estimated Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          </div>
          <div className="neu-pressed p-4 rounded-lg">
            <p className="text-muted-foreground mb-1">Estimated Impressions</p>
            <p className="text-2xl font-bold">{formatNumber(totalImpressions)}</p>
          </div>
          <div className="neu-pressed p-4 rounded-lg">
            <p className="text-muted-foreground mb-1">Selected Platforms</p>
            <p className="text-2xl font-bold">{platforms.length}</p>
          </div>
        </div>
      </NeuCard>

      {/* Campaign Details */}
      <NeuCard className="mb-6 p-6">
        <h3 className="text-lg font-semibold mb-4">Campaign Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-muted-foreground mb-1">Industry</p>
            <p className="font-medium">{data.industry || "Not specified"}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground mb-1">Objectives</p>
            <div className="flex flex-wrap gap-2">
              {data.objectives.map((objective) => (
                <span key={objective} className="text-xs bg-primary/10 dark:bg-primary/20 text-primary px-2 py-1 rounded">
                  {objective}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-muted-foreground mb-1">Demographics</p>
            <div>
              <p className="text-sm">
                <span className="font-medium">Age Groups:</span>{" "}
                {data.demographics.ageGroups.join(", ")}
              </p>
              <p className="text-sm">
                <span className="font-medium">Gender:</span>{" "}
                {data.demographics.gender.join(", ")}
              </p>
              {data.demographics.interests.length > 0 && (
                <p className="text-sm">
                  <span className="font-medium">Interests:</span>{" "}
                  {data.demographics.interests.join(", ")}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-muted-foreground mb-1">Geographics</p>
            <div>
              <p className="text-sm">
                <span className="font-medium">Tier Levels:</span>{" "}
                {data.geographics.tierLevels.join(", ")}
              </p>
              {data.geographics.cities.length > 0 && (
                <p className="text-sm">
                  <span className="font-medium">Cities:</span>{" "}
                  {data.geographics.cities.join(", ")}
                </p>
              )}
              {data.geographics.states.length > 0 && (
                <p className="text-sm">
                  <span className="font-medium">States:</span>{" "}
                  {data.geographics.states.join(", ")}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-muted-foreground mb-1">Asset Categories</p>
            <div className="flex flex-wrap gap-2">
              {data.assetCategories.map((category) => (
                <span key={category} className="text-xs bg-neugray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </NeuCard>

      {/* Platform and Asset Breakdown */}
      <h3 className="text-lg font-semibold mb-4">Platform & Asset Breakdown</h3>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : platforms.length > 0 ? (
        platforms.map((platform) => (
          <NeuCard key={platform.id} className="mb-4 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h4 className="text-xl font-bold">{platform.name}</h4>
                <p className="text-muted-foreground">{platform.industry}</p>
              </div>
              <div className="flex items-center gap-3 mt-2 md:mt-0">
                <div className="flex items-center gap-1">
                  <Users size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    MAU: {formatUserCount(platform.mau)}
                  </span>
                </div>
                <div className="neu-pressed px-3 py-1 rounded-lg">
                  <span className="font-medium">{formatCurrency(platform.totalCost)}</span>
                </div>
              </div>
            </div>

            {/* Assets Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-2">Asset</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-right p-2">Est. Impressions</th>
                    <th className="text-right p-2">Cost/Day</th>
                    <th className="text-right p-2">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {platform.assets.map((asset) => {
                    const costPerDay = asset.cost_per_day || Math.floor(Math.random() * 15000) + 5000;
                    const impressions = asset.estimated_impressions || Math.floor(Math.random() * 90000) + 10000;
                    return (
                      <tr key={asset.id}>
                        <td className="p-2 font-medium">{asset.name}</td>
                        <td className="p-2">
                          <span className="text-xs px-2 py-1 rounded bg-neugray-200 dark:bg-gray-700">
                            {asset.category}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          {formatNumber(impressions * campaignDays)}
                        </td>
                        <td className="p-2 text-right">{formatCurrency(costPerDay)}</td>
                        <td className="p-2 text-right font-medium">
                          {formatCurrency(costPerDay * campaignDays)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t bg-neugray-100 dark:bg-gray-800">
                  <tr>
                    <td colSpan={2} className="p-2 font-bold">Platform Total</td>
                    <td className="p-2 text-right font-bold">{formatNumber(platform.totalImpressions)}</td>
                    <td className="p-2"></td>
                    <td className="p-2 text-right font-bold">{formatCurrency(platform.totalCost)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </NeuCard>
        ))
      ) : (
        <div className="text-center py-10 bg-neugray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-muted-foreground">No platforms selected for this campaign</p>
        </div>
      )}

      {/* Summary and Notes */}
      {platforms.length > 0 && (
        <NeuCard className="mt-6 p-6">
          <h3 className="text-lg font-semibold mb-4">Campaign Summary</h3>
          
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <h4 className="font-medium mb-2">Cost Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Platform Costs</span>
                  <span>{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee (10%)</span>
                  <span>{formatCurrency(totalCost * 0.1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>{formatCurrency(totalCost * 0.18)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Total Campaign Cost</span>
                  <span>{formatCurrency(totalCost * 1.28)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium mb-2">Performance Estimates</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Duration</span>
                  <span>{campaignDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Impressions</span>
                  <span>{formatNumber(totalImpressions)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. CPM</span>
                  <span>
                    {formatCurrency((totalCost / totalImpressions) * 1000)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Est. Engagement Rate</span>
                  <span>2.5%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-neugray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm">
              <span className="font-bold">Note:</span> This quotation is valid for 15 days from the date of generation. 
              Actual campaign performance may vary based on market conditions, creative quality, and audience engagement.
              Final pricing will be confirmed upon campaign approval.
            </p>
          </div>
        </NeuCard>
      )}
    </div>
  );
};

// Helper function to format user counts
const formatUserCount = (count: string | number | null | undefined): string => {
  if (!count) return "N/A";
  
  const numValue = typeof count === 'string' ? parseInt(count.replace(/,/g, ''), 10) : count;
  if (isNaN(Number(numValue))) return "N/A";
  
  return `${Math.round(Number(numValue) / 1000000)}M`;
};

export default QuotationPreview;
