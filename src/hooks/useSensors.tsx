
import { useState, useEffect, useCallback } from 'react';

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
    // Check accelerometer
    if ('DeviceMotionEvent' in window) {
      setSensorsAvailable(prev => ({ ...prev, accelerometer: true, gyroscope: true }));
    }

    // Check magnetometer
    if ('DeviceOrientationEvent' in window) {
      setSensorsAvailable(prev => ({ ...prev, magnetometer: true }));
    }
  }, []);

  // Request permissions for sensors
  const requestPermissions = useCallback(async () => {
    try {
      // For iOS 13+ devices
      if (
        DeviceMotionEvent &&
        typeof (DeviceMotionEvent as any).requestPermission === 'function'
      ) {
        const motionPermission = await (DeviceMotionEvent as any).requestPermission();
        const orientPermission = await (DeviceOrientationEvent as any).requestPermission();
        
        setPermissionStatus({
          accelerometer: motionPermission === 'granted',
          gyroscope: motionPermission === 'granted',
          magnetometer: orientPermission === 'granted',
        });
        
        return motionPermission === 'granted' && orientPermission === 'granted';
      }
      
      // For non-iOS or older iOS that don't require permission
      setPermissionStatus({
        accelerometer: true,
        gyroscope: true,
        magnetometer: true,
      });
      
      return true;
    } catch (error) {
      console.error('Error requesting sensor permissions:', error);
      return false;
    }
  }, []);

  // Handle device motion (accelerometer & gyroscope)
  useEffect(() => {
    if (!permissionStatus.accelerometer || !permissionStatus.gyroscope) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const { acceleration, rotationRate, timeStamp } = event;
      
      if (acceleration && rotationRate) {
        setCurrentReadings(prev => ({
          ...prev,
          timestamp: timeStamp || Date.now(),
          accelerometer: {
            x: acceleration.x || 0,
            y: acceleration.y || 0,
            z: acceleration.z || 0,
          },
          gyroscope: {
            x: rotationRate.beta || 0,
            y: rotationRate.gamma || 0,
            z: rotationRate.alpha || 0,
          },
        }));
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [permissionStatus.accelerometer, permissionStatus.gyroscope]);

  // Handle device orientation (magnetometer)
  useEffect(() => {
    if (!permissionStatus.magnetometer) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { alpha, beta, gamma, timeStamp } = event;
      
      setCurrentReadings(prev => ({
        ...prev,
        timestamp: timeStamp || Date.now(),
        magnetometer: {
          x: alpha || 0,
          y: beta || 0,
          z: gamma || 0,
        },
      }));
    };

    window.addEventListener('deviceorientation', handleOrientation);
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionStatus.magnetometer]);

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
