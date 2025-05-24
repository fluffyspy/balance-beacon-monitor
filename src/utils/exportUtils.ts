
import { SensorData } from '@/hooks/useSensors';

export const exportToCSV = (recordings: SensorData[]) => {
  if (recordings.length === 0) return;

  // Generate CSV content
  const headers = ['Timestamp', 'AccelX', 'AccelY', 'AccelZ', 'GyroX', 'GyroY', 'GyroZ', 'MagX', 'MagY', 'MagZ'];
  const csvContent = [
    headers.join(','),
    ...recordings.map(record => [
      record.timestamp,
      record.accelerometer.x.toFixed(4),
      record.accelerometer.y.toFixed(4),
      record.accelerometer.z.toFixed(4),
      record.gyroscope.x.toFixed(4),
      record.gyroscope.y.toFixed(4),
      record.gyroscope.z.toFixed(4),
      record.magnetometer.x.toFixed(4),
      record.magnetometer.y.toFixed(4),
      record.magnetometer.z.toFixed(4),
    ].join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `balance_data_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const analyzeBalance = (recordings: SensorData[]) => {
  if (recordings.length < 50) {
    return {
      status: 'insufficient' as const,
      stability: 0,
      message: 'Insufficient data for analysis. Need at least 5 seconds of recording.',
      details: {
        accelerometerVariability: 0,
        gyroscopeVariability: 0,
        totalMovement: 0,
        balanceScore: 0,
      }
    };
  }

  // Calculate movement metrics
  const accelMagnitudes = recordings.map(r => 
    Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2 + r.accelerometer.z ** 2)
  );
  
  const gyroMagnitudes = recordings.map(r => 
    Math.sqrt(r.gyroscope.x ** 2 + r.gyroscope.y ** 2 + r.gyroscope.z ** 2)
  );

  // Calculate variability (standard deviation)
  const accelVariability = calculateStandardDeviation(accelMagnitudes);
  const gyroVariability = calculateStandardDeviation(gyroMagnitudes);
  
  // Calculate total movement
  const totalMovement = accelMagnitudes.reduce((sum, val) => sum + val, 0) / accelMagnitudes.length;
  
  // Detect sway patterns
  const swayDetection = detectSway(recordings);
  
  // Balance assessment thresholds
  const NORMAL_ACCEL_THRESHOLD = 2.5;  // Normal walking acceleration variability
  const NORMAL_GYRO_THRESHOLD = 1.8;   // Normal rotational stability
  const EXCESSIVE_MOVEMENT_THRESHOLD = 12.0; // Excessive total movement
  const SWAY_THRESHOLD = 0.7; // Abnormal sway pattern
  
  // Risk factors scoring
  let riskScore = 0;
  
  if (accelVariability > NORMAL_ACCEL_THRESHOLD) riskScore += 25;
  if (gyroVariability > NORMAL_GYRO_THRESHOLD) riskScore += 25;
  if (totalMovement > EXCESSIVE_MOVEMENT_THRESHOLD) riskScore += 20;
  if (swayDetection.lateralSway > SWAY_THRESHOLD) riskScore += 30;
  
  // Additional risk factors
  if (detectTremor(recordings)) riskScore += 15;
  if (detectUnsteadyGait(recordings)) riskScore += 20;
  
  const balanceScore = Math.max(0, 100 - riskScore);
  
  // Determine status based on risk score
  let status: 'normal' | 'abnormal' | 'insufficient';
  let message: string;
  
  if (riskScore >= 50) {
    status = 'abnormal';
    message = 'Abnormal balance patterns detected. Significant movement irregularities and instability observed during walking test.';
  } else if (riskScore >= 25) {
    status = 'abnormal';
    message = 'Moderate balance concerns detected. Some irregularities in movement patterns observed.';
  } else {
    status = 'normal';
    message = 'Balance appears normal. Movement patterns are within expected ranges for typical walking.';
  }

  return {
    status,
    stability: balanceScore,
    message,
    details: {
      accelerometerVariability: accelVariability,
      gyroscopeVariability: gyroVariability,
      totalMovement,
      balanceScore,
    }
  };
};

const calculateStandardDeviation = (values: number[]): number => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};

const detectSway = (recordings: SensorData[]) => {
  // Analyze lateral (side-to-side) movement patterns
  const lateralAccel = recordings.map(r => r.accelerometer.x);
  const lateralSway = calculateStandardDeviation(lateralAccel);
  
  // Analyze forward-backward sway
  const sagittalAccel = recordings.map(r => r.accelerometer.y);
  const sagittalSway = calculateStandardDeviation(sagittalAccel);
  
  return {
    lateralSway,
    sagittalSway,
  };
};

const detectTremor = (recordings: SensorData[]): boolean => {
  // High-frequency oscillations in accelerometer data
  const accelX = recordings.map(r => r.accelerometer.x);
  
  // Simple tremor detection: count rapid direction changes
  let directionChanges = 0;
  for (let i = 1; i < accelX.length - 1; i++) {
    const prev = accelX[i - 1];
    const curr = accelX[i];
    const next = accelX[i + 1];
    
    if ((curr > prev && curr > next) || (curr < prev && curr < next)) {
      directionChanges++;
    }
  }
  
  const tremor_threshold = accelX.length * 0.3; // 30% of readings show oscillation
  return directionChanges > tremor_threshold;
};

const detectUnsteadyGait = (recordings: SensorData[]): boolean => {
  // Analyze step regularity using gyroscope data
  const gyroZ = recordings.map(r => r.gyroscope.z);
  const stepVariability = calculateStandardDeviation(gyroZ);
  
  // High variability in rotational movement suggests unsteady gait
  return stepVariability > 2.5;
};
