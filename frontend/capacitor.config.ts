import { CapacitorConfig } from '@capacitor/cli'

// server.url is set for development only -- remove it before building for store submission
const config: CapacitorConfig = {
  appId: 'com.medfin.app',
  appName: 'MedFin AI',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
