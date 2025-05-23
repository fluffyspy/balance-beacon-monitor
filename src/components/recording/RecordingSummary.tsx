
import React from 'react';
import { SensorData } from '@/hooks/useSensors';

interface RecordingSummaryProps {
  recordings: SensorData[];
}

const RecordingSummary: React.FC<RecordingSummaryProps> = ({ recordings }) => {
  return (
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
  );
};

export default RecordingSummary;
