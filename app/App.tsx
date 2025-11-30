import { Slot } from 'expo-router';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { useFonts } from 'expo-font';
import { config } from './gluestack-ui.config';
import { useEffect } from 'react';
import { checkSession } from './lib/appwrite';

export default function App() {
  const [fontsLoaded] = useFonts({
    GangOfThree: require('./assets/fonts/GangOfThree.ttf'),
    FunnelDisplay: require('./assets/fonts/FunnelDisplay.ttf'),
    FunnelSans: require('./assets/fonts/FunnelSans.ttf'),
  });

  useEffect(() => {
    const checkAppwriteConnection = async () => {
      try {
        // First check for existing session
        const session = await checkSession();
        if (session) {
          return;
        }

        // If no session exists, create anonymous session to test connection
        const { account } = require('./lib/appwrite');
        await account.createAnonymousSession();
      } catch (error: any) {
        // Connection check failed silently
      }
    };

    checkAppwriteConnection();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GluestackUIProvider config={config} colorMode="dark">
      <Slot />
    </GluestackUIProvider>
  );
}
