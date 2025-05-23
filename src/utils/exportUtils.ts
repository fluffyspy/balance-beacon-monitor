
import { SensorData } from "@/hooks/useSensors";

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

export const exportToCSV = (data: SensorData[]): void => {
  if (data.length === 0) return;
  
  // Create CSV header
  const headers = [
    'Timestamp',
    'Sensor',
    'X',
    'Y',
    'Z'
  ];
  
  // Create CSV rows using the required format
  const csvRows = [
    headers.join(',')
  ];
  
  // Add accelerometer readings
  data.forEach(record => {
    csvRows.push([
      record.timestamp,
      'Accelerometer',
      record.accelerometer.x.toFixed(2),
      record.accelerometer.y.toFixed(2),
      record.accelerometer.z.toFixed(2)
    ].join(','));
  });
  
  // Add gyroscope readings
  data.forEach(record => {
    csvRows.push([
      record.timestamp,
      'Gyroscope',
      record.gyroscope.x.toFixed(2),
      record.gyroscope.y.toFixed(2),
      record.gyroscope.z.toFixed(2)
    ].join(','));
  });
  
  // Add magnetometer readings
  data.forEach(record => {
    csvRows.push([
      record.timestamp,
      'Magnetometer',
      record.magnetometer.x.toFixed(2),
      record.magnetometer.y.toFixed(2),
      record.magnetometer.z.toFixed(2)
    ].join(','));
  });
  
  // Create CSV content
  const csvContent = csvRows.join('\n');
  
  // Create blob and link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `balance_data_${formatDate(new Date())}.csv`);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const analyzeBalance = (data: SensorData[]): {
  status: 'normal' | 'abnormal' | 'insufficient';
  stability: number;
  message: string;
  details: {
    accelerometerVariability: number;
    gyroscopeVariability: number;
    totalMovement: number;
    balanceScore: number;
  };
} => {
  if (data.length < 30) { // At least 3 seconds of data
    return {
      status: 'insufficient',
      stability: 0,
      message: 'Insufficient data for analysis. Please record for at least 3 seconds.',
      details: {
        accelerometerVariability: 0,
        gyroscopeVariability: 0,
        totalMovement: 0,
        balanceScore: 0,
      }
    };
  }
  
  // Calculate variability metrics
  const accelX = data.map(d => d.accelerometer.x);
  const accelY = data.map(d => d.accelerometer.y);
  const accelZ = data.map(d => d.accelerometer.z);
  
  const gyroX = data.map(d => d.gyroscope.x);
  const gyroY = data.map(d => d.gyroscope.y);
  const gyroZ = data.map(d => d.gyroscope.z);
  
  // Calculate standard deviations
  const accelStdevX = calculateStandardDeviation(accelX);
  const accelStdevY = calculateStandardDeviation(accelY);
  const accelStdevZ = calculateStandardDeviation(accelZ);
  
  const gyroStdevX = calculateStandardDeviation(gyroX);
  const gyroStdevY = calculateStandardDeviation(gyroY);
  const gyroStdevZ = calculateStandardDeviation(gyroZ);
  
  // Combined metrics
  const accelerometerVariability = (accelStdevX + accelStdevY + accelStdevZ) / 3;
  const gyroscopeVariability = (gyroStdevX + gyroStdevY + gyroStdevZ) / 3;
  
  // Calculate total movement (magnitude of acceleration changes)
  const totalMovement = data.reduce((sum, reading, index) => {
    if (index === 0) return 0;
    const prevReading = data[index - 1];
    const deltaX = Math.abs(reading.accelerometer.x - prevReading.accelerometer.x);
    const deltaY = Math.abs(reading.accelerometer.y - prevReading.accelerometer.y);
    const deltaZ = Math.abs(reading.accelerometer.z - prevReading.accelerometer.z);
    return sum + Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
  }, 0) / data.length;
  
  // Define thresholds for abnormal balance
  const ACCEL_THRESHOLD = 2.0; // High acceleration variability indicates instability
  const GYRO_THRESHOLD = 1.5;  // High gyroscope variability indicates poor balance
  const MOVEMENT_THRESHOLD = 1.0; // High total movement indicates difficulty maintaining position
  
  // Calculate balance score (0-100, where 100 is perfect balance)
  const accelScore = Math.max(0, 100 - (accelerometerVariability / ACCEL_THRESHOLD) * 50);
  const gyroScore = Math.max(0, 100 - (gyroscopeVariability / GYRO_THRESHOLD) * 50);
  const movementScore = Math.max(0, 100 - (totalMovement / MOVEMENT_THRESHOLD) * 50);
  
  const balanceScore = (accelScore + gyroScore + movementScore) / 3;
  
  // Determine status based on thresholds
  const isAbnormal = 
    accelerometerVariability > ACCEL_THRESHOLD ||
    gyroscopeVariability > GYRO_THRESHOLD ||
    totalMovement > MOVEMENT_THRESHOLD ||
    balanceScore < 60;
  
  const status = isAbnormal ? 'abnormal' : 'normal';
  const message = isAbnormal 
    ? 'Potential balance issues detected. High movement variability suggests difficulty maintaining stable posture. Consider consulting a healthcare professional.'
    : 'Balance appears normal. Good stability and minimal excessive movement detected.';
  
  return {
    status,
    stability: balanceScore,
    message,
    details: {
      accelerometerVariability,
      gyroscopeVariability,
      totalMovement,
      balanceScore,
    }
  };
};

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}
