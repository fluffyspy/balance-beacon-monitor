
import React, { useState } from 'react';
import { SensorData } from '@/hooks/useSensors';
import { analyzeBalance } from '@/utils/exportUtils';
import RecordingButtonGroup from './recording/RecordingButtonGroup';
import DataActionButtons from './recording/DataActionButtons';
import RecordingSummary from './recording/RecordingSummary';
import AnalysisResults from './recording/AnalysisResults';

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
  const [analysisResult, setAnalysisResult] = useState<{
    status: 'normal' | 'abnormal' | 'insufficient';
    stability: number;
    message: string;
    details: {
      accelerometerVariability: number;
      gyroscopeVariability: number;
      totalMovement: number;
      balanceScore: number;
    };
  } | null>(null);

  const handleAnalyze = () => {
    const result = analyzeBalance(recordings);
    setAnalysisResult(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <RecordingButtonGroup 
          isRecording={isRecording}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          permissionsGranted={permissionsGranted}
          requestPermissions={requestPermissions}
        />
        
        {recordings.length > 0 && !isRecording && (
          <DataActionButtons 
            recordings={recordings}
            onClearRecordings={onClearRecordings}
            onAnalyzeData={handleAnalyze}
          />
        )}
      </div>
      
      {recordings.length > 0 && !isRecording && (
        <RecordingSummary recordings={recordings} />
      )}
      
      <AnalysisResults analysisResult={analysisResult} />
    </div>
  );
};

export default RecordingControls;
