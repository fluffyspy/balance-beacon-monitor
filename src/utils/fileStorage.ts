
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { SensorData } from '@/hooks/sensors/sensorTypes';

export const saveCSVToMobileStorage = async (data: SensorData[], filename: string): Promise<boolean> => {
  try {
    // Create CSV content
    const csvContent = generateCSVContent(data);
    
    // Save to device storage
    await Filesystem.writeFile({
      path: filename,
      data: csvContent,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    
    console.log(`File saved to Documents folder: ${filename}`);
    
    // Also share the file so user can save it elsewhere
    await Share.share({
      title: 'Balance Assessment Data',
      text: 'Your balance assessment results',
      url: await getFileUri(filename),
    });
    
    return true;
  } catch (error) {
    console.error('Error saving CSV file:', error);
    return false;
  }
};

const getFileUri = async (filename: string): Promise<string> => {
  try {
    const result = await Filesystem.getUri({
      directory: Directory.Documents,
      path: filename,
    });
    return result.uri;
  } catch (error) {
    console.error('Error getting file URI:', error);
    return '';
  }
};

const generateCSVContent = (data: SensorData[]): string => {
  const headers = ['Timestamp', 'Sensor', 'X', 'Y', 'Z'];
  const csvRows = [headers.join(',')];
  
  // Add all sensor data
  data.forEach(record => {
    // Accelerometer
    csvRows.push([
      record.timestamp,
      'Accelerometer',
      record.accelerometer.x.toFixed(4),
      record.accelerometer.y.toFixed(4),
      record.accelerometer.z.toFixed(4)
    ].join(','));
    
    // Gyroscope
    csvRows.push([
      record.timestamp,
      'Gyroscope',
      record.gyroscope.x.toFixed(4),
      record.gyroscope.y.toFixed(4),
      record.gyroscope.z.toFixed(4)
    ].join(','));
    
    // Magnetometer
    csvRows.push([
      record.timestamp,
      'Magnetometer',
      record.magnetometer.x.toFixed(4),
      record.magnetometer.y.toFixed(4),
      record.magnetometer.z.toFixed(4)
    ].join(','));
  });
  
  return csvRows.join('\n');
};

export const formatDateForFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `balance_assessment_${year}${month}${day}_${hours}${minutes}${seconds}.csv`;
};
