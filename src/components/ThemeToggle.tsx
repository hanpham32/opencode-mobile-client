import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useChatStore } from '../store/chatStore';
import { getTheme } from '../theme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useChatStore();
  const colors = getTheme(theme);

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme === 'dark' ? colors.surfaceSecondary : colors.inputBackground }]} 
      onPress={toggleTheme}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.iconContainer}>
        {theme === 'dark' ? (
          <View style={styles.sunIcon}>
            <View style={styles.sunCenter} />
          </View>
        ) : (
          <View style={styles.moonIcon} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#5C5CFF',
  },
  sunIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFCC00',
  },
  sunCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
});
