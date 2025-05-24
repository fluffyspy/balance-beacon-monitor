
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { SensorData } from '@/hooks/useSensors';
import { exportToCSV, analyzeBalance } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface DataActionButtonsProps {
  recordings: SensorData[];
  onClearRecordings: () => void;
  onAnalyzeData: () => void;
}

const DataActionButtons: React.FC<DataActionButtonsProps> = ({
  recordings,
  onClearRecordings,
  onAnalyzeData,
}) => {
  const { toast } = useToast();

  const handleExportWeb = () => {
    exportToCSV(recordings);
    toast({
      title: "Export Complete",
      description: "CSV file downloaded to your Downloads folder",
    });
  };

  return (
    <>
      <Button 
        onClick={handleExportWeb}
        variant="outline"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
      </Button>
      <Button 
        onClick={onAnalyzeData}
        variant="outline"
        className="text-medical-800 border-medical-300 hover:bg-medical-50"
      >
        <CheckCircle2 className="w-4 h-4 mr-2" /> Analyze
      </Button>
      <Button 
        onClick={onClearRecordings}
        variant="ghost"
        className="text-gray-500"
      >
        <RefreshCcw className="w-4 h-4 mr-2" /> Clear
      </Button>
    </>
  );
};

export default DataActionButtons;
