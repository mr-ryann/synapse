import { Slot } from 'expo-router';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { useFonts } from 'expo-font';
import { config } from './gluestack-ui.config';
import { useEffect } from 'react';
import { account } from './lib/appwrite';

export default function App() {
  const [fontsLoaded] = useFonts({
    GangOfThree: require('./assets/fonts/GangOfThree.ttf'),
    FunnelDisplay: require('./assets/fonts/FunnelDisplay.ttf'),
    FunnelSans: require('./assets/fonts/FunnelSans.ttf'),
  });

  useEffect(() => {
    const checkAppwriteConnection = async () => {
      try {
        const user = await account.get();
        if (user) {
          console.log('✅ Appwrite connection successful. User:', user.name);
        } else {
          console.log('🟡 Appwrite connection successful, but no user is logged in.');
        }
      } catch (error: any) {
        console.error('❌ Appwrite connection failed:', error.message);
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
