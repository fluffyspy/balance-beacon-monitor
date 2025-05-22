
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1845f6ebc0ae4138ac358f1bafc9a317',
  appName: 'balance-beacon-monitor',
  webDir: 'dist',
  server: {
    url: 'https://1845f6eb-c0ae-4138-ac35-8f1bafc9a317.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
    },
  },
};

export default config;
