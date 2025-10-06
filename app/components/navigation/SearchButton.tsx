import React from 'react';
import { Pressable } from 'react-native';
import { Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export const SearchButton = React.memo(() => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push('/search')}>
      <Search size={24} color="#ffffff" />
    </Pressable>
  );
});

SearchButton.displayName = 'SearchButton';
