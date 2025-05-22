
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Square, 
  FileSpreadsheet, 
  RefreshCcw, 
  AlertTriangle, 
  CheckCircle2
} from 'lucide-react';
import { SensorData } from '@/hooks/useSensors';
import { exportToCSV, analyzeBalance } from '@/utils/exportUtils';

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClearRecordings: () => void;
  recordings: SensorData[];
  permissionsGranted: boolean;
  requestPermissions: () => Promise<boolean>;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onClearRecordings,
  recordings,
  permissionsGranted,
  requestPermissions,
}) => {
  const [analysisResult, setAnalysisResult] = React.useState<{
    status: 'normal' | 'abnormal' | 'insufficient';
    stability: number;
    message: string;
  } | null>(null);

  const handleExport = () => {
    exportToCSV(recordings);
  };

  const handleAnalyze = () => {
    const result = analyzeBalance(recordings);
    setAnalysisResult(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {!permissionsGranted ? (
          <Button 
            onClick={requestPermissions}
            variant="outline"
            className="bg-medical-100 text-medical-800 border-medical-200 hover:bg-medical-200"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Grant Sensor Permissions
          </Button>
        ) : isRecording ? (
          <Button 
            onClick={onStopRecording}
            variant="destructive"
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-2" /> Stop Recording
          </Button>
        ) : (
          <Button 
            onClick={onStartRecording}
            variant="default"
            className="bg-medical-600 hover:bg-medical-700 flex-1"
          >
            <Play className="w-4 h-4 mr-2" /> Start Recording
          </Button>
        )}
        
        {recordings.length > 0 && !isRecording && (
          <>
            <Button 
              onClick={handleExport}
              variant="outline"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button 
              onClick={handleAnalyze}
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
        )}
      </div>
      
      {recordings.length > 0 && !isRecording && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Recording Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Data points:</span>
            <span className="font-medium">{recordings.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">
              {(recordings.length / 10).toFixed(1)} seconds
            </span>
          </div>
        </div>
      )}
      
      {analysisResult && (
        <div className={`p-4 rounded-lg border ${
          analysisResult.status === 'normal' 
            ? 'bg-green-50 border-green-200' 
            : analysisResult.status === 'abnormal'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className="font-medium mb-2 text-gray-800">Balance Analysis</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${
                analysisResult.status === 'normal'
                  ? 'text-green-600'
                  : analysisResult.status === 'abnormal'
                    ? 'text-amber-600'
                    : 'text-gray-600'
              }`}>
                {analysisResult.status.charAt(0).toUpperCase() + analysisResult.status.slice(1)}
              </span>
            </div>
            
            {analysisResult.status !== 'insufficient' && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Stability Score:</span>
                <span className="font-medium">{analysisResult.stability.toFixed(1)}%</span>
              </div>
            )}
            
            <p className="text-sm text-gray-700 italic">
              {analysisResult.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
