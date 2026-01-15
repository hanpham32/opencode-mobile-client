export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textPrimary: string;
  border: string;
  primary: string;
  primaryText: string;
  userBubble: string;
  assistantBubble: string;
  userBubbleText: string;
  assistantBubbleText: string;
  inputBackground: string;
  headerBackground: string;
  itemBackground: string;
  itemSelectedBackground: string;
  overlay: string;
  error: string;
}

export const lightTheme: ThemeColors = {
  background: '#ffffff',
  surface: '#ffffff',
  surfaceSecondary: '#F9F9F9',
  text: '#000000',
  textSecondary: '#8E8E93',
  textPrimary: '#007AFF',
  border: '#E5E5EA',
  primary: '#007AFF',
  primaryText: '#ffffff',
  userBubble: '#007AFF',
  assistantBubble: '#E5E5EA',
  userBubbleText: '#ffffff',
  assistantBubbleText: '#000000',
  inputBackground: '#F2F2F7',
  headerBackground: '#ffffff',
  itemBackground: '#ffffff',
  itemSelectedBackground: '#F0F8FF',
  overlay: 'rgba(0, 0, 0, 0.3)',
  error: '#FF3B30',
};

export const darkTheme: ThemeColors = {
  background: '#1C1C1E',
  surface: '#2C2C2E',
  surfaceSecondary: '#3A3A3C',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textPrimary: '#0A84FF',
  border: '#38383A',
  primary: '#0A84FF',
  primaryText: '#ffffff',
  userBubble: '#0A84FF',
  assistantBubble: '#3A3A3C',
  userBubbleText: '#ffffff',
  assistantBubbleText: '#FFFFFF',
  inputBackground: '#3A3A3C',
  headerBackground: '#1C1C1E',
  itemBackground: '#2C2C2E',
  itemSelectedBackground: '#3A3A3C',
  overlay: 'rgba(0, 0, 0, 0.7)',
  error: '#FF453A',
};

export const getTheme = (mode: ThemeMode): ThemeColors => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
