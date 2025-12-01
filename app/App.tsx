import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { checkSession } from './lib/appwrite';

export default function App() {
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

  return <Slot />;
}
