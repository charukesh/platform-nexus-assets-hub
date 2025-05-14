
import React from 'react';
import NeuButton from "@/components/NeuButton";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ isEditing, onCancel, isSubmitting = false }) => {
  return (
    <div className="flex justify-end gap-3">
      <NeuButton
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </NeuButton>
      <NeuButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? "Updating..." : "Creating..."}
          </>
        ) : (
          isEditing ? "Update Platform" : "Create Platform"
        )}
      </NeuButton>
    </div>
  );
};

export default FormActions;
