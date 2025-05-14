
import NeuCard from "@/components/NeuCard";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CampaignData } from "@/types/platform";
import { Check, X } from "lucide-react";

interface CampaignDisplayProps {
  campaignData: CampaignData;
}

export const CampaignDisplay = ({ campaignData }: CampaignDisplayProps) => {
  return (
    <NeuCard>
      <h3 className="text-lg font-bold mb-4">Campaign Information</h3>
      <div className="space-y-6">
        <div>
          <Label className="block mb-2">Funnel Stages</Label>
          <div className="flex flex-wrap gap-2">
            {campaignData.funnel_stage && (Array.isArray(campaignData.funnel_stage) ? campaignData.funnel_stage : [campaignData.funnel_stage]).map((stage) => (
              <Badge key={stage} variant="outline">
                {stage}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="block mb-2">Buying Model</Label>
          <p className="text-lg">{campaignData.buying_model || "Not specified"}</p>
        </div>

        <div>
          <Label className="block mb-2">Minimum Campaign Spend</Label>
          <p className="text-lg">₹{campaignData.minimum_spend?.toLocaleString() || "0"}</p>
        </div>

        <div>
          <Label className="block mb-2">Call-to-Action Support</Label>
          <div className="flex items-center gap-2">
            {campaignData.cta_support ? (
              <>
                <Check className="text-green-500" size={20} />
                <span>Available</span>
              </>
            ) : (
              <>
                <X className="text-red-500" size={20} />
                <span>Not Available</span>
              </>
            )}
          </div>
        </div>

        {campaignData.ad_formats && campaignData.ad_formats.length > 0 && (
          <div>
            <Label className="block mb-2">Ad Formats</Label>
            <div className="flex flex-wrap gap-2">
              {campaignData.ad_formats.map((format) => (
                <Badge key={format} variant="outline">
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {campaignData.special_innovations && typeof campaignData.special_innovations === 'string' && (
          <div>
            <Label className="block mb-2">Special Innovations</Label>
            <p className="text-sm">{campaignData.special_innovations}</p>
          </div>
        )}

        {campaignData.special_innovations && Array.isArray(campaignData.special_innovations) && campaignData.special_innovations.length > 0 && (
          <div>
            <Label className="block mb-2">Special Innovations</Label>
            <div className="flex flex-wrap gap-2">
              {campaignData.special_innovations.map((innovation, index) => (
                <Badge key={index} variant="outline">
                  {innovation}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </NeuCard>
  );
};
