
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { SensorData } from '@/hooks/sensors/sensorTypes';

export const saveBalanceData = async (recordings: SensorData[]): Promise<void> => {
  try {
    // Create BalanceData directory
    await Filesystem.mkdir({
      path: 'BalanceData',
      directory: Directory.Documents,
      recursive: true,
    });

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save accelerometer data
    const accelCSV = generateAccelCSV(recordings);
    await Filesystem.writeFile({
      path: `BalanceData/accel_${timestamp}.csv`,
      data: accelCSV,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    // Save gyroscope data
    const gyroCSV = generateGyroCSV(recordings);
    await Filesystem.writeFile({
      path: `BalanceData/gyro_${timestamp}.csv`,
      data: gyroCSV,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    // Save magnetometer data (optional)
    const magCSV = generateMagCSV(recordings);
    await Filesystem.writeFile({
      path: `BalanceData/mag_${timestamp}.csv`,
      data: magCSV,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    console.log('Balance data saved successfully');
  } catch (error) {
    console.error('Error saving balance data:', error);
    throw error;
  }
};

const generateAccelCSV = (recordings: SensorData[]): string => {
  const headers = ['Timestamp', 'X', 'Y', 'Z'];
  const rows = [headers.join(',')];
  
  recordings.forEach(record => {
    rows.push([
      record.timestamp,
      record.accelerometer.x.toFixed(4),
      record.accelerometer.y.toFixed(4),
      record.accelerometer.z.toFixed(4)
    ].join(','));
  });
  
  return rows.join('\n');
};

const generateGyroCSV = (recordings: SensorData[]): string => {
  const headers = ['Timestamp', 'X', 'Y', 'Z'];
  const rows = [headers.join(',')];
  
  recordings.forEach(record => {
    rows.push([
      record.timestamp,
      record.gyroscope.x.toFixed(4),
      record.gyroscope.y.toFixed(4),
      record.gyroscope.z.toFixed(4)
    ].join(','));
  });
  
  return rows.join('\n');
};

const generateMagCSV = (recordings: SensorData[]): string => {
  const headers = ['Timestamp', 'X', 'Y', 'Z'];
  const rows = [headers.join(',')];
  
  recordings.forEach(record => {
    rows.push([
      record.timestamp,
      record.magnetometer.x.toFixed(4),
      record.magnetometer.y.toFixed(4),
      record.magnetometer.z.toFixed(4)
    ].join(','));
  });
  
  return rows.join('\n');
};
