import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'network.hopecafe.hub',
  appName: 'HOPE Hub',
  webDir: 'public',
  server: {
    url: 'https://hopepartners.hopelife.in',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#FFF9F0",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#5D2E8C",
      splashFullScreen: true,
      splashImmersive: true,
    }
  }
};

export default config;

