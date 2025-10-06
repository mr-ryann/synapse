import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, FlatList } from 'react-native';
import { Bell, X } from 'lucide-react-native';

interface Notification {
  id: string;
  message: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', message: 'New challenge available!' },
  { id: '2', message: "You're on a 5-day streak 🔥" },
  { id: '3', message: 'Weekly leaderboard updated' },
];

export const NotificationMenu = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount] = useState(3); // TODO: Connect to state

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        style={styles.button}
      >
        <Bell size={24} color="#ffffff" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.menu}>
            <View style={styles.header}>
              <Text style={styles.title}>Notifications</Text>
              <Pressable onPress={() => setIsOpen(false)}>
                <X size={24} color="#ffffff" />
              </Pressable>
            </View>
            <FlatList
              data={MOCK_NOTIFICATIONS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable style={styles.item}>
                  <Text style={styles.itemText}>{item.message}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
});

NotificationMenu.displayName = 'NotificationMenu';

const styles = StyleSheet.create({
  button: {
    marginRight: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  menu: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  itemText: {
    fontSize: 14,
    color: '#cccccc',
  },
});
