import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface MessageBubbleProps {
  content: string;
  sender: 'user' | 'assistant';
}

export default function MessageBubble({ content, sender }: MessageBubbleProps) {
  const isUser = sender === 'user';

  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#000',
  },
});
