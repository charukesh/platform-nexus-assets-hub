
import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import NeuButton from "@/components/NeuButton";
import NeuCard from "@/components/NeuCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DangerZone: React.FC = () => {
  const [passcode, setPasscode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteAllData = async () => {
    if (passcode !== "1212") {
      toast({
        title: "Invalid passcode",
        description: "The passcode you entered is incorrect",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      // Delete all assets
      await supabase.from('assets').delete().neq('id', '');
      
      // Delete all platforms
      await supabase.from('platforms').delete().neq('id', '');
      
      toast({
        title: "Data deleted",
        description: "All data has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting data:", error);
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setPasscode("");
    }
  };

  return (
    <NeuCard className="dark:bg-gray-800 border-red-200 dark:border-red-900">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
        <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
        Danger Zone
      </h2>
      
      <div className="space-y-4">
        <p className="text-muted-foreground">Delete all data from the database. This action cannot be undone.</p>
        
        <div className="grid gap-2">
          <div className="flex gap-2">
            <Input 
              type="password"
              placeholder="Enter passcode to delete all data"
              className="bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-gray-700"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
            <NeuButton 
              onClick={handleDeleteAllData}
              disabled={isDeleting || !passcode}
              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
            >
              <Trash2 size={16} />
              {isDeleting ? "Deleting..." : "Delete All Data"}
            </NeuButton>
          </div>
          <p className="text-xs text-muted-foreground">Enter the passcode "1212" to confirm deletion</p>
        </div>
      </div>
    </NeuCard>
  );
};

export default DangerZone;
