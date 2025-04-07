
import React from "react";
import NeuButton from "@/components/NeuButton";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, Printer } from "lucide-react";

interface QuotationActionsProps {
  className?: string;
}

const QuotationActions: React.FC<QuotationActionsProps> = ({ className }) => {
  const { toast } = useToast();

  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Your quotation is being prepared as a PDF."
    });
  };

  const handleExportExcel = () => {
    toast({
      title: "Export Started",
      description: "Your quotation is being prepared as an Excel file."
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`flex justify-end gap-2 ${className || ''}`}>
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
  );
};

export default QuotationActions;
