
import React, { useState, useEffect } from 'react';
import { CalendarClock, User, RefreshCw } from 'lucide-react';
import NeuCard from "@/components/NeuCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditHistoryChange {
  field: string;
  old_value: any;
  new_value: any;
}

export interface EditHistoryItem {
  id: string;
  user: string;
  timestamp: string;
  changes: EditHistoryChange[];
}

interface EditHistoryProps {
  entityId: string;
  entityType: "platform" | "asset";
  title?: string;
}

const EditHistoryComponent: React.FC<EditHistoryProps> = ({ 
  entityId,
  entityType,
  title = "Edit History" 
}) => {
  const [historyItems, setHistoryItems] = useState<EditHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (entityId) {
      fetchHistory();
    }
  }, [entityId, entityType]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // In a real app, you'd fetch from a history table
      // For this example, we'll simulate by getting the entity and creating historical records
      const { data, error } = await supabase
        .from(entityType === "platform" ? 'platforms' : 'assets')
        .select('*')
        .eq('id', entityId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Generate synthetic history for demo purposes
        // In a real app, this would come from a dedicated history table
        const syntheticHistory = generateSyntheticHistory(data, entityType);
        setHistoryItems(syntheticHistory);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // This function simulates history data
  // In a real app, you would fetch this from a dedicated history table
  const generateSyntheticHistory = (data: any, type: string): EditHistoryItem[] => {
    const now = new Date();
    const items: EditHistoryItem[] = [];
    
    // Create entry for initial creation
    items.push({
      id: `${data.id}-creation`,
      user: "Admin User",
      timestamp: new Date(data.created_at).toLocaleString(),
      changes: [
        { field: "created", old_value: null, new_value: `New ${type} created` }
      ]
    });
    
    // Create synthetic update history
    if (type === "platform") {
      // Platform updates
      if (data.name) {
        items.push({
          id: `${data.id}-name-update`,
          user: "John Smith",
          timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleString(),
          changes: [
            { field: "name", old_value: `Old ${data.name}`, new_value: data.name }
          ]
        });
      }
      
      if (data.industry) {
        items.push({
          id: `${data.id}-industry-update`,
          user: "Sarah Johnson",
          timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleString(),
          changes: [
            { field: "industry", old_value: "General", new_value: data.industry }
          ]
        });
      }
      
      if (data.mau || data.dau) {
        items.push({
          id: `${data.id}-stats-update`,
          user: "David Chen",
          timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleString(),
          changes: [
            { field: "MAU", old_value: "1000000", new_value: data.mau || "2000000" },
            { field: "DAU", old_value: "200000", new_value: data.dau || "450000" }
          ]
        });
      }
      
      // Device split update
      items.push({
        id: `${data.id}-device-update`,
        user: "Maria Rodriguez",
        timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toLocaleString(),
        changes: [
          { 
            field: "device_split", 
            old_value: JSON.stringify({ ios: 40, android: 60 }), 
            new_value: JSON.stringify(data.device_split || { ios: 50, android: 50 }) 
          }
        ]
      });
    } else {
      // Asset updates
      if (data.name) {
        items.push({
          id: `${data.id}-name-update`,
          user: "Thomas Lee",
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleString(),
          changes: [
            { field: "name", old_value: `Draft ${data.name}`, new_value: data.name }
          ]
        });
      }
      
      if (data.description) {
        items.push({
          id: `${data.id}-desc-update`,
          user: "Jessica Park",
          timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toLocaleString(),
          changes: [
            { field: "description", old_value: "Initial description", new_value: data.description }
          ]
        });
      }
      
      if (data.category) {
        items.push({
          id: `${data.id}-category-update`,
          user: "Michael Brown",
          timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toLocaleString(),
          changes: [
            { field: "category", old_value: "Uncategorized", new_value: data.category }
          ]
        });
      }
      
      if (data.tags && data.tags.length > 0) {
        items.push({
          id: `${data.id}-tags-update`,
          user: "Emily Wilson",
          timestamp: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toLocaleString(),
          changes: [
            { 
              field: "tags", 
              old_value: JSON.stringify(["draft"]), 
              new_value: JSON.stringify(data.tags)
            }
          ]
        });
      }
    }
    
    // Sort by timestamp (newest first)
    return items.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  };

  const formatChange = (change: EditHistoryChange): string => {
    if (change.field === "created") {
      return change.new_value;
    }
    
    if (typeof change.old_value === 'string' && change.old_value.startsWith('{') && 
        typeof change.new_value === 'string' && change.new_value.startsWith('{')) {
      // Try to parse JSON objects for better display
      try {
        const oldObj = JSON.parse(change.old_value);
        const newObj = JSON.parse(change.new_value);
        return `Updated ${change.field} from ${JSON.stringify(oldObj)} to ${JSON.stringify(newObj)}`;
      } catch (e) {
        // Fall back to default formatting
      }
    }
    
    return `Changed ${change.field} from "${change.old_value}" to "${change.new_value}"`;
  };

  return (
    <NeuCard>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="text-primary" />
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading history...</p>
          </div>
        ) : historyItems.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No edit history available.</p>
        ) : (
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div key={item.id} className="neu-flat p-4 rounded-lg transition-all hover:shadow-neu-pressed">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-muted-foreground" />
                    <span className="font-medium">{item.user}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarClock size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.timestamp}</span>
                  </div>
                </div>
                
                <ul className="space-y-1 mt-2">
                  {item.changes.map((change, idx) => (
                    <li key={idx} className="text-sm">
                      • {formatChange(change)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </NeuCard>
  );
};

export default EditHistoryComponent;
