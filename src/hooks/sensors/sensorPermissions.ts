
import { SensorPermissionStatus, SensorAvailability } from './sensorTypes';

export const checkSensorsAvailability = async (): Promise<SensorAvailability> => {
  try {
    console.log("Checking sensor availability");
    
    // In a real implementation, we would check actual device capabilities
    // For now, we assume they're available since this is a mobile-focused app
    
    return {
      accelerometer: true,
      gyroscope: true,
      magnetometer: true
    };
  } catch (error) {
    console.error('Error checking sensor availability:', error);
    return {
      accelerometer: false,
      gyroscope: false,
      magnetometer: false
    };
  }
};

export const getInitialPermissionStatus = (): SensorPermissionStatus => {
  return {
    accelerometer: false,
    gyroscope: false,
    magnetometer: false
  };
};
