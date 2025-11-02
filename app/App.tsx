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
        const session = await checkSession();
        if (session) {
          console.log('✅ Appwrite connection successful. User:', session.name, `(${session.email})`);
          console.log('✅ Session is active and valid');
        } else {
          console.log('🟡 Appwrite configured, but no active session. User needs to log in.');
        }
      } catch (error: any) {
        console.error('❌ Appwrite connection check failed:', error.message);
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
