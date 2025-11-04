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
          console.log('✅ Appwrite connection successful. User:', session.name, `(${session.email})`);
          console.log('✅ Session is active and valid');
          console.log('🔗 Appwrite Console should show "Connected" status');
          return;
        }

        // If no session exists, create anonymous session to test connection
        console.log('� No active session. Testing connection with anonymous session...');
        const { account } = require('./lib/appwrite');
        const anonSession = await account.createAnonymousSession();
        console.log('✅ Appwrite connected! Anonymous session created:', anonSession.$id);
        console.log('🔗 Refresh Appwrite Console—it should now show "Connected"');
        console.log('🟡 User will need to log in with actual credentials later');
      } catch (error: any) {
        console.error('❌ Appwrite connection check failed:', error.message);
        console.error('💡 Check: endpoint, project ID, and platform match app.json bundle ID');
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
