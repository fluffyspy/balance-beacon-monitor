
import React from 'react';
import { SensorReading } from '@/hooks/useSensors';
import { cn } from '@/lib/utils';

type SensorReadingsProps = {
  title: string;
  readings: SensorReading;
  available: boolean;
  hasPermission: boolean;
  className?: string;
};

const SensorReadings: React.FC<SensorReadingsProps> = ({
  title,
  readings,
  available,
  hasPermission,
  className,
}) => {
  if (!available) {
    return (
      <div className={cn("p-3 bg-gray-100 rounded-lg", className)}>
        <h3 className="font-medium text-gray-700 text-sm">{title}</h3>
        <p className="text-xs text-red-500">Sensor not available on this device</p>
      </div>
    );
  }
  
  if (!hasPermission) {
    return (
      <div className={cn("p-3 bg-gray-100 rounded-lg", className)}>
        <h3 className="font-medium text-gray-700 text-sm">{title}</h3>
        <p className="text-xs text-amber-500">Permission required</p>
      </div>
    );
  }
  
  return (
    <div className={cn("p-3 bg-white border border-gray-200 rounded-lg shadow-sm", className)}>
      <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
      <div className="grid grid-cols-3 gap-3 mt-1">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">X</span>
          <span className="text-base font-semibold text-medical-700">{readings.x.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Y</span>
          <span className="text-base font-semibold text-medical-700">{readings.y.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Z</span>
          <span className="text-base font-semibold text-medical-700">{readings.z.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default SensorReadings;
