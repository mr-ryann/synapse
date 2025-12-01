import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the home tab by default
  // The _layout.tsx will handle auth redirects
  return <Redirect href="/home" />;
}
