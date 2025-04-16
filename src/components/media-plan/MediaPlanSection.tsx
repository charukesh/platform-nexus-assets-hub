
import React from "react";
import NeuCard from "@/components/NeuCard";
import { LucideIcon } from "lucide-react";

interface MediaPlanSectionProps {
  icon: LucideIcon;
  title: string;
  content: string;
}

const MediaPlanSection: React.FC<MediaPlanSectionProps> = ({ icon: Icon, title, content }) => {
  return (
    <NeuCard>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="text-primary" size={24} />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div dangerouslySetInnerHTML={{
        __html: content
          .replace(/# (.*?)\n/g, '<h1 class="text-2xl font-bold my-3">$1</h1>')
          .replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold my-2">$1</h2>')
          .replace(/### (.*?)\n/g, '<h3 class="text-lg font-bold my-2">$1</h3>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/- (.*?)(?:\n|$)/g, '<li>$1</li>')
          .replace(/\n\n/g, '<br/><br/>')
      }} />
    </NeuCard>
  );
};

export default MediaPlanSection;
