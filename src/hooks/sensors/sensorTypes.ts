
export type SensorReading = {
  x: number;
  y: number;
  z: number;
};

export type SensorData = {
  timestamp: number;
  accelerometer: SensorReading;
  gyroscope: SensorReading;
  magnetometer: SensorReading;
};

export type SensorPermissionStatus = {
  accelerometer: boolean;
  gyroscope: boolean;
  magnetometer: boolean;
};

export type SensorAvailability = {
  accelerometer: boolean;
  gyroscope: boolean;
  magnetometer: boolean;
};
