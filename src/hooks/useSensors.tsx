
import { useState, useEffect, useCallback } from 'react';
import { SensorData, SensorPermissionStatus, SensorAvailability } from './sensors/sensorTypes';
import { startSensorListeners, removeSensorListeners } from './sensors/sensorListeners';
import { checkSensorsAvailability, getInitialPermissionStatus } from './sensors/sensorPermissions';

export type { SensorData, SensorReading } from './sensors/sensorTypes';

export const useSensors = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<SensorData[]>([]);
  const [currentReadings, setCurrentReadings] = useState<SensorData>({
    timestamp: Date.now(),
    accelerometer: { x: 0, y: 0, z: 0 },
    gyroscope: { x: 0, y: 0, z: 0 },
    magnetometer: { x: 0, y: 0, z: 0 },
  });
  
  const [permissionStatus, setPermissionStatus] = useState<SensorPermissionStatus>(
    getInitialPermissionStatus()
  );

  const [sensorsAvailable, setSensorsAvailable] = useState<SensorAvailability>({
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,
  });

  // Check if sensors are available
  useEffect(() => {
    const initializeSensors = async () => {
      const availability = await checkSensorsAvailability();
      setSensorsAvailable(availability);
    };
    
    initializeSensors();
    
    return () => {
      // Clean up listeners when component unmounts
      removeSensorListeners();
    };
  }, []);

  // Request permissions for sensors
  const requestPermissions = useCallback(async () => {
    try {
      console.log("Requesting motion sensor permissions");
      
      // Start listening immediately - Capacitor handles permissions automatically
      await startSensorListeners(setCurrentReadings);
      
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
