
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
    'timestamp',
    'accelerometer_x', 'accelerometer_y', 'accelerometer_z',
    'gyroscope_x', 'gyroscope_y', 'gyroscope_z',
    'magnetometer_x', 'magnetometer_y', 'magnetometer_z'
  ];
  
  // Create CSV rows
  const csvRows = [
    headers.join(','),
    ...data.map(record => [
      record.timestamp,
      record.accelerometer.x, record.accelerometer.y, record.accelerometer.z,
      record.gyroscope.x, record.gyroscope.y, record.gyroscope.z,
      record.magnetometer.x, record.magnetometer.y, record.magnetometer.z
    ].join(','))
  ];
  
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
} => {
  if (data.length < 10) {
    return {
      status: 'insufficient',
      stability: 0,
      message: 'Insufficient data for analysis. Please record for at least 1 second.'
    };
  }
  
  // Calculate standard deviation of accelerometer readings as a simple measure of stability
  const accelX = data.map(d => d.accelerometer.x);
  const accelY = data.map(d => d.accelerometer.y);
  const accelZ = data.map(d => d.accelerometer.z);
  
  const stdevX = calculateStandardDeviation(accelX);
  const stdevY = calculateStandardDeviation(accelY);
  const stdevZ = calculateStandardDeviation(accelZ);
  
  // Calculate combined stability score (lower is more stable)
  const stabilityScore = (stdevX + stdevY + stdevZ) / 3;
  
  // Normalize to a 0-100 scale where 100 is perfectly stable
  // This is a simplified model and would need calibration with real medical data
  const normalizedStability = Math.max(0, Math.min(100, 100 - (stabilityScore * 10)));
  
  // Simple threshold classification
  if (normalizedStability > 70) {
    return {
      status: 'normal',
      stability: normalizedStability,
      message: 'Balance appears normal. Good stability detected.'
    };
  } else {
    return {
      status: 'abnormal',
      stability: normalizedStability,
      message: 'Potential balance issues detected. Consider consulting a healthcare professional.'
    };
  }
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
