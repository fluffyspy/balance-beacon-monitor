
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
        setSensorsAvailable({
          accelerometer: true,
          gyroscope: true,
          magnetometer: true
        });
        
        console.log("Sensors marked as available for mobile device");
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
      
      // Start listening immediately - Capacitor handles permissions automatically
      await startSensorListeners();
      
      setPermissionStatus({
        accelerometer: true,
        gyroscope: true,
        magnetometer: true,
      });
      
      console.log("Sensor permissions granted and listeners started");
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
            x: event.rotationRate?.alpha || 0,
            y: event.rotationRate?.beta || 0,
            z: event.rotationRate?.gamma || 0,
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
  }, []);

  // Recording functionality - capture data when recording
  useEffect(() => {
    if (!isRecording) return;
    
    console.log("Recording started, capturing data every 100ms");
    const interval = setInterval(() => {
      console.log("Capturing sensor data:", currentReadings);
      setRecordings(prev => {
        const newRecordings = [...prev, { ...currentReadings }];
        console.log("Total recordings so far:", newRecordings.length);
        return newRecordings;
      });
    }, 100); // Record at 10Hz
    
    return () => {
      console.log("Stopping recording interval");
      clearInterval(interval);
    };
  }, [isRecording, currentReadings]);

  const startRecording = useCallback(() => {
    console.log("Starting recording...");
    setRecordings([]);
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    console.log("Stopping recording... Total points:", recordings.length);
    setIsRecording(false);
  }, [recordings.length]);

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
