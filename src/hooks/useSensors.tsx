import { useState, useEffect, useCallback } from 'react';
import { Motion } from '@capacitor/motion';

export type SensorData = {
  timestamp: number;
  accelerometer: {
    x: number;
    y: number;
    z: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  magnetometer: {
    x: number;
    y: number;
    z: number;
  };
};

export type SensorReading = {
  x: number;
  y: number;
  z: number;
};

export const useSensors = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<SensorData[]>([]);
  const [currentReadings, setCurrentReadings] = useState<SensorData>({
    timestamp: Date.now(),
    accelerometer: { x: 0, y: 0, z: 0 },
    gyroscope: { x: 0, y: 0, z: 0 },
    magnetometer: { x: 0, y: 0, z: 0 },
  });
  
  const [permissionStatus, setPermissionStatus] = useState<{
    accelerometer: boolean;
    gyroscope: boolean;
    magnetometer: boolean;
  }>({
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,
  });

  const [sensorsAvailable, setSensorsAvailable] = useState<{
    accelerometer: boolean;
    gyroscope: boolean;
    magnetometer: boolean;
  }>({
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,
  });

  // Check if sensors are available
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        // Check if device supports motion API
        const isAvailable = await Motion.isAvailable();
        
        setSensorsAvailable({
          accelerometer: isAvailable,
          gyroscope: isAvailable,
          magnetometer: isAvailable
        });
      } catch (error) {
        console.error('Error checking sensor availability:', error);
        setSensorsAvailable({
          accelerometer: false,
          gyroscope: false,
          magnetometer: false
        });
      }
    };
    
    checkAvailability();
  }, []);

  // Request permissions for sensors
  const requestPermissions = useCallback(async () => {
    try {
      const permissionResult = await Motion.requestPermission();
      const isGranted = permissionResult.granted;
      
      setPermissionStatus({
        accelerometer: isGranted,
        gyroscope: isGranted,
        magnetometer: isGranted,
      });
      
      return isGranted;
    } catch (error) {
      console.error('Error requesting sensor permissions:', error);
      return false;
    }
  }, []);

  // Handle device motion (accelerometer & gyroscope)
  useEffect(() => {
    if (!permissionStatus.accelerometer || !permissionStatus.gyroscope) return;
    
    let accelListener: any;
    let orientListener: any;
    
    const setupListeners = async () => {
      try {
        // Start accelerometer updates
        accelListener = await Motion.addListener('accel', (event) => {
          const { acceleration, rotationRate, timestamp } = event;
          
          if (acceleration && rotationRate) {
            setCurrentReadings(prev => ({
              ...prev,
              timestamp: timestamp || Date.now(),
              accelerometer: {
                x: acceleration.x || 0,
                y: acceleration.y || 0,
                z: acceleration.z || 0,
              },
              gyroscope: {
                x: rotationRate.alpha || 0,
                y: rotationRate.beta || 0,
                z: rotationRate.gamma || 0,
              },
            }));
          }
        });
        
        // Start orientation updates for magnetometer
        orientListener = await Motion.addListener('orientation', (event) => {
          const { alpha, beta, gamma, timestamp } = event;
          
          setCurrentReadings(prev => ({
            ...prev,
            timestamp: timestamp || Date.now(),
            magnetometer: {
              x: alpha || 0,
              y: beta || 0,
              z: gamma || 0,
            },
          }));
        });
      } catch (error) {
        console.error('Error setting up motion sensors:', error);
      }
    };
    
    setupListeners();
    
    // Cleanup listeners on unmount
    return () => {
      if (accelListener) accelListener.remove();
      if (orientListener) orientListener.remove();
    };
  }, [permissionStatus.accelerometer, permissionStatus.gyroscope, permissionStatus.magnetometer]);

  // Recording functionality
  useEffect(() => {
    if (!isRecording) return;
    
    const interval = setInterval(() => {
      setRecordings(prev => [...prev, currentReadings]);
    }, 100); // Record at 10Hz
    
    return () => {
      clearInterval(interval);
    };
  }, [isRecording, currentReadings]);

  const startRecording = useCallback(() => {
    setRecordings([]);
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const clearRecordings = useCallback(() => {
    setRecordings([]);
  }, []);

  return {
    currentReadings,
    recordings,
    isRecording,
    startRecording,
    stopRecording,
    clearRecordings,
    requestPermissions,
    permissionStatus,
    sensorsAvailable,
  };
};
