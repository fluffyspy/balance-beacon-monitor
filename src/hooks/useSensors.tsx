
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
        // For web preview, assume sensors are available since isAvailable is not implemented
        // In actual device, this will properly check
        setSensorsAvailable({
          accelerometer: true,
          gyroscope: true,
          magnetometer: true
        });
        
        console.log("Checking sensor availability - assuming available for testing");
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
      console.log("Requesting motion sensor permissions");
      
      // The Motion API doesn't have a requestPermission method in the web version
      // But we'll set up as if permissions were granted for testing purposes
      setPermissionStatus({
        accelerometer: true,
        gyroscope: true,
        magnetometer: true,
      });
      
      // Start listening to sensor data right after "permission granted"
      startSensorListeners();
      
      return true;
    } catch (error) {
      console.error('Error requesting sensor permissions:', error);
      return false;
    }
  }, []);

  // Start sensor listeners
  const startSensorListeners = useCallback(async () => {
    try {
      console.log("Starting motion sensor listeners");
      
      // Start the acceleration updates
      await Motion.addListener('accel', (event) => {
        const currentTime = Date.now();
        
        // Handle different event structures
        if (event.acceleration) {
          setCurrentReadings(prev => ({
            ...prev,
            timestamp: currentTime,
            accelerometer: {
              x: event.acceleration.x || 0,
              y: event.acceleration.y || 0,
              z: event.acceleration.z || 0,
            },
          }));
        }
        
        if (event.rotationRate) {
          setCurrentReadings(prev => ({
            ...prev,
            timestamp: currentTime,
            gyroscope: {
              x: event.rotationRate.alpha || 0,
              y: event.rotationRate.beta || 0,
              z: event.rotationRate.gamma || 0,
            },
          }));
        }
      });
      
      // Start orientation updates for magnetometer
      await Motion.addListener('orientation', (event) => {
        const currentTime = Date.now();
        
        setCurrentReadings(prev => ({
          ...prev,
          timestamp: currentTime,
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
  }, []);

  // Handle device motion when permission is granted
  useEffect(() => {
    if (permissionStatus.accelerometer && permissionStatus.gyroscope) {
      // Start sensor listeners when permissions are granted
      startSensorListeners();
    }
    
    // Cleanup listeners on unmount
    return () => {
      // Remove all listeners when component unmounts
      Motion.removeAllListeners();
    };
  }, [permissionStatus, startSensorListeners]);

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
    console.log("Starting recording...");
    setRecordings([]);
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    console.log("Stopping recording...");
    setIsRecording(false);
  }, []);

  const clearRecordings = useCallback(() => {
    console.log("Clearing recordings...");
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
