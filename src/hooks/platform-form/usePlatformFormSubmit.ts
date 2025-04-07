
import { useNavigate } from "react-router-dom";
import { FormDataType } from "@/utils/platformFormUtils";
import { savePlatform } from "@/services/platformService";

export const usePlatformFormSubmit = (
  formData: FormDataType,
  id: string | undefined,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  toast: any
) => {
  const navigate = useNavigate();
  
  const validateBasicInfo = () => {
    if (!formData.name || !formData.industry) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const { error } = await savePlatform(formData, id);
      
      if (error) throw error;
      
      toast({
        title: id ? "Platform updated" : "Platform created",
        description: id 
          ? "Platform has been successfully updated." 
          : "Platform has been successfully created.",
      });
      
      navigate("/platforms");
    } catch (error: any) {
      toast({
        title: "Error saving platform",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    validateBasicInfo,
    handleSubmit,
    navigate
  };
};
