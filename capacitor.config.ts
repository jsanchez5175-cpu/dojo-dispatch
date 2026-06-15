import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aethelaps.dojodispatch',
  appName: 'Dojo Dispatch',
  webDir: 'out',
  server: {
    url: 'https://dojo-dispatch.vercel.app',
    cleartext: false
  },
};

export default config;