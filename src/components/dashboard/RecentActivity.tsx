
import React from "react";
import { Layers } from "lucide-react";
import NeuCard from "@/components/NeuCard";

interface ActivityItem {
  id: string | number;
  name: string;
  category?: string;
  industry?: string;
  updated_at: string;
}

interface RecentActivityProps {
  loading: boolean;
  platforms: any[];
  assets: any[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ loading, platforms, assets }) => {
  return (
    <NeuCard>
      <div className="flex items-center gap-3 mb-4">
        <Layers className="text-primary" size={24} />
        <h2 className="text-xl font-bold">Recent Activity</h2>
      </div>
      <div className="divide-y divide-neugray-200">
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading activity...</p>
          </div>
        ) : (
          <>
            {[...platforms.slice(0, 3), ...assets.slice(0, 3)]
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .slice(0, 5)
              .map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{('category' in item) ? 'Asset' : 'Platform'}</span>
                        <span>•</span>
                        <span>{('industry' in item) ? item.industry : item.category}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            }
          </>
        )}
      </div>
    </NeuCard>
  );
};

export default RecentActivity;
