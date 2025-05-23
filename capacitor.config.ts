
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1845f6ebc0ae4138ac358f1bafc9a317',
  appName: 'balance-beacon-monitor',
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
      // Allow reading/writing to Documents directory
    },
    Share: {
      // Enable sharing functionality
    }
  },
};

export default config;
