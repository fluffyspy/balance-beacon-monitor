
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, AlertTriangle } from 'lucide-react';
import { SensorData } from '@/hooks/useSensors';

interface RecordingButtonGroupProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  permissionsGranted: boolean;
  requestPermissions: () => Promise<boolean>;
}

const RecordingButtonGroup: React.FC<RecordingButtonGroupProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  permissionsGranted,
  requestPermissions,
}) => {
  return (
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
    </div>
  );
};

export default RecordingButtonGroup;
