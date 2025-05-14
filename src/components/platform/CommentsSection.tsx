
import React from 'react';
import NeuCard from "@/components/NeuCard";
import NeuInput from "@/components/NeuInput";
import { Label } from "@/components/ui/label";

interface CommentsSectionProps {
  comments: string | undefined;
  onChange: (value: string) => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ comments, onChange }) => {
  return (
    <NeuCard>
      <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="comments">Comments / Did You Know</Label>
          <NeuInput
            id="comments"
            as="textarea"
            rows={6}
            value={comments || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Add any helpful notes, interesting facts, or additional context for the pre-sales team"
          />
        </div>
      </div>
    </NeuCard>
  );
};

export default CommentsSection;
