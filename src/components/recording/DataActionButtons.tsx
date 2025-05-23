
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, RefreshCcw, CheckCircle2, Download } from 'lucide-react';
import { SensorData } from '@/hooks/useSensors';
import { exportToCSV, analyzeBalance } from '@/utils/exportUtils';
import { saveCSVToMobileStorage, formatDateForFilename } from '@/utils/fileStorage';
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

  const handleSaveToMobile = async () => {
    const filename = formatDateForFilename();
    const success = await saveCSVToMobileStorage(recordings, filename);
    
    if (success) {
      toast({
        title: "File Saved",
        description: `Balance data saved to device storage: ${filename}`,
      });
    } else {
      toast({
        title: "Save Failed",
        description: "Could not save file to device storage",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button 
        onClick={handleSaveToMobile}
        variant="default"
        className="bg-green-600 hover:bg-green-700"
      >
        <Download className="w-4 h-4 mr-2" /> Save to Device
      </Button>
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
