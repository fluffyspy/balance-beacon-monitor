
import { Motion } from '@capacitor/motion';

export const startSensorListeners = async (
  setCurrentReadings: React.Dispatch<React.SetStateAction<any>>
): Promise<void> => {
  try {
    console.log("Starting motion sensor listeners");
    
    // Remove any existing listeners first
    await Motion.removeAllListeners();
    
    // Add acceleration listener
    await Motion.addListener('accel', (event) => {
      console.log("Acceleration data received:", event);
      const currentTime = Date.now();
      
      setCurrentReadings(prev => ({
        ...prev,
        timestamp: currentTime,
        accelerometer: {
          x: event.acceleration?.x || 0,
          y: event.acceleration?.y || 0,
          z: event.acceleration?.z || 0,
        },
      }));
    });
    
    // Add orientation listener for gyroscope and magnetometer
    await Motion.addListener('orientation', (event) => {
      console.log("Orientation data received:", event);
      const currentTime = Date.now();
      
      setCurrentReadings(prev => ({
        ...prev,
        timestamp: currentTime,
        gyroscope: {
          x: event.alpha || 0,
          y: event.beta || 0,
          z: event.gamma || 0,
        },
        magnetometer: {
          x: event.alpha || 0,
          y: event.beta || 0,
          z: event.gamma || 0,
        },
      }));
    });
    
    console.log("Motion listeners added successfully");
  } catch (error) {
    console.error('Error setting up motion sensors:', error);
  }
};

export const removeSensorListeners = async (): Promise<void> => {
  try {
    await Motion.removeAllListeners();
    console.log("All motion listeners removed");
  } catch (error) {
    console.error('Error removing motion listeners:', error);
  }
};
