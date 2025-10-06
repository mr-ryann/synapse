import { Slot } from 'expo-router';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { useFonts } from 'expo-font';
import { config } from './gluestack-ui.config';

export default function App() {
  const [fontsLoaded] = useFonts({
    GangOfThree: require('./assets/fonts/GangOfThree.ttf'),
    FunnelDisplay: require('./assets/fonts/FunnelDisplay.ttf'),
    FunnelSans: require('./assets/fonts/FunnelSans.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GluestackUIProvider config={config} colorMode="dark">
      <Slot />
    </GluestackUIProvider>
  );
}
