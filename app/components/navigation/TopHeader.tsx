import React, { useState } from 'react';
import { View, StyleSheet, Modal, TextInput, Pressable, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { StreakIndicator } from './StreakIndicator';
import { Logo } from '../ui/Logo';
import { COLORS, FONTS } from '../../theme';

export const TopHeader = React.memo(() => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSearch(false);
      router.push(`/(tabs)/library?expandTopic=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.leftSide}>
            <Logo size="medium" showText={true} />
          </View>
          
          {/* Right side - streak and search */}
          <View style={styles.rightSide}>
            <StreakIndicator />
            <Pressable onPress={() => setShowSearch(true)} style={styles.searchButton}>
              <Search size={22} color={COLORS.text.primary} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Floating Search Overlay */}
      <Modal
        visible={showSearch}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSearch(false)}
      >
        <Pressable 
          style={styles.searchOverlay}
          onPress={() => {
            Keyboard.dismiss();
            setShowSearch(false);
          }}
        >
          <View style={[styles.searchContainer, { marginTop: insets.top + 60 }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.searchInputWrapper}>
                <Search size={20} color={COLORS.text.muted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search topics..."
                  placeholderTextColor={COLORS.text.muted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  autoFocus
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <X size={18} color={COLORS.text.muted} />
                  </Pressable>
                )}
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
});

TopHeader.displayName = 'TopHeader';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    padding: 8,
  },
  searchOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    marginHorizontal: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.elevated,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.accent.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
  },
});
