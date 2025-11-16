import React from 'react';
import { Pressable } from 'react-native';
import { Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../theme';

export const SearchButton = React.memo(() => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push('/search')}>
      <Search size={24} color={COLORS.text.primary} />
    </Pressable>
  );
});

SearchButton.displayName = 'SearchButton';
