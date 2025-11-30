import React from 'react';
import { Tabs } from 'expo-router';
import { BottomTabBar } from '../../components/navigation/BottomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          href: null, // Don't show in tab bar, just redirects
        }} 
      />
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen 
        name="search" 
        options={{
          href: null, // Hidden - search is now in library
          title: 'Search',
        }}
      />
      <Tabs.Screen 
        name="library" 
        options={{
          title: 'Library',
        }}
      />
      <Tabs.Screen 
        name="journal" 
        options={{
          title: 'Journal',
        }}
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
        }}
      />
      <Tabs.Screen 
        name="settings" 
        options={{
          href: null, // Hidden - replaced by profile
          title: 'Settings',
        }}
      />
      <Tabs.Screen 
        name="challenge-player" 
        options={{ 
          href: null, // Don't show in tab bar
          title: 'Challenge',
        }} 
      />
      <Tabs.Screen 
        name="topics" 
        options={{ 
          href: null, // Don't show in tab bar
          title: 'Topics',
        }} 
      />
    </Tabs>
  );
}
