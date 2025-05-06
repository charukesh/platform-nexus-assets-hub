
import React from 'react';
import NeuButton from "@/components/NeuButton";

interface FormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ isEditing, onCancel }) => {
  return (
    <div className="flex justify-end gap-3">
      <NeuButton
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </NeuButton>
      <NeuButton type="submit">
        {isEditing ? "Update Platform" : "Create Platform"}
      </NeuButton>
    </div>
  );
};

export default FormActions;
