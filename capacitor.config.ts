
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1845f6ebc0ae4138ac358f1bafc9a317',
  appName: 'Balance',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
    },
    Motion: {
      deviceOrientation: true,
      acceleration: true,
      accelerationIncludingGravity: true,
      rotationRate: true,
    },
    Filesystem: {
      directory: 'Documents',
    },
  },
  android: {
    permissions: [
      'android.permission.BODY_SENSORS',
      'android.permission.ACTIVITY_RECOGNITION',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
    ]
  }
};

export default config;
