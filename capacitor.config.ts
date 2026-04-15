import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'network.hopecafe.hub',
  appName: 'HOPE Hub',
  webDir: 'out',
  server: {
    url: 'http://localhost:5000', // For local testing, replace with production URL for APK
    cleartext: true
  }
};

export default config;
