import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useChatStore } from '../store/chatStore';
import { sendMessage, getSessionMessages, getSession, createSession, getProviders } from '../services/api';
import { MessagePart, SessionMessageResponse } from '../types/chat';
import { getTheme, ThemeMode } from '../theme';
import ModelSelector from '../components/ModelSelector';
import ThemeToggle from '../components/ThemeToggle';
import Markdown from 'react-native-markdown-display';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type RootStackParamList = { Sessions: undefined; Chat: { sessionId?: string } };

function formatMessageText(parts?: MessagePart[]): string {
  if (!parts || !Array.isArray(parts)) return '';
  const textParts = parts
    .filter((p) => p && p.type === 'text' && p.text && p.text.trim())
    .map((p) => p.text || '');
  return textParts.join('\n').trim();
}

interface MessageItemProps {
  message: SessionMessageResponse;
  colors: ReturnType<typeof getTheme>;
}

function MessageBubble({ message, colors }: MessageItemProps) {
  const isUser = message.info.role === 'user';
  const content = formatMessageText(message.parts);
  
  if (!content) return null;

  const bubbleTextColor = isUser ? colors.userBubbleText : colors.assistantBubbleText;

  return (
    <View style={[
      styles.bubbleContainer,
      isUser ? styles.userBubbleContainer : styles.assistantBubbleContainer,
    ]}>
      <View style={[
        styles.bubble,
        isUser ? { backgroundColor: colors.userBubble } : { backgroundColor: colors.assistantBubble },
      ]}>
        <Markdown
          style={{
            text: {
              color: bubbleTextColor,
              fontSize: 16,
              lineHeight: 22,
            },
            strong: {
              fontWeight: '600',
            },
            em: {
              fontStyle: 'italic',
            },
            blockquote: {
              borderLeftWidth: 4,
              borderLeftColor: bubbleTextColor,
              paddingLeft: 12,
              opacity: 0.8,
            },
            code_block: {
              backgroundColor: 'rgba(0,0,0,0.1)',
              padding: 12,
              borderRadius: 8,
              fontFamily: 'monospace',
              fontSize: 14,
            },
            inline_code: {
              backgroundColor: 'rgba(0,0,0,0.1)',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: 14,
            },
            link: {
              color: isUser ? '#FFFFFF' : '#007AFF',
              textDecorationLine: 'underline',
            },
            bullet_list: {
              marginLeft: 16,
            },
            ordered_list: {
              marginLeft: 16,
            },
            list_item: {
              marginBottom: 4,
            },
            heading1: {
              fontSize: 22,
              fontWeight: '700',
              marginBottom: 8,
            },
            heading2: {
              fontSize: 20,
              fontWeight: '600',
              marginBottom: 6,
            },
            heading3: {
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 4,
            },
            paragraph: {
              marginBottom: 8,
            },
          }}
        >
          {content}
        </Markdown>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation<any>();
  const theme = useChatStore((state) => state.theme);
  const colors = getTheme(theme as ThemeMode);
  const {
    messages,
    setMessages,
    addMessage,
    isLoading,
    setLoading,
    setError,
    setCurrentSession,
    addSession,
    providers,
    setProviders,
    selectedModel,
    setSelectedModel,
    selectedProvider,
  } = useChatStore();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [modelSelectorVisible, setModelSelectorVisible] = useState(false);

  const loadProviders = useCallback(async () => {
    try {
      const providerList = await getProviders();
      setProviders(providerList);
      if (providerList.length > 0 && !selectedModel) {
        const firstProvider = providerList[0];
        const firstModel = Object.values(firstProvider.models)[0];
        if (firstModel) {
          setSelectedModel(firstModel);
        }
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  }, [setProviders, selectedModel, setSelectedModel]);

  const initializeSession = useCallback(async (id?: string) => {
    setLoading(true);
    try {
      let currentSessionId = id;
      
      if (!currentSessionId && route.params?.sessionId) {
        currentSessionId = route.params.sessionId;
      }
      
      if (!currentSessionId) {
        const newSession = await createSession('New Chat');
        currentSessionId = newSession.id;
        addSession(newSession);
      }
      
      setSessionId(currentSessionId);
      
      const sessionData = await getSession(currentSessionId);
      setCurrentSession(sessionData);
      
      const messageData = await getSessionMessages(currentSessionId);
      setMessages(messageData);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [route.params?.sessionId, setLoading, setError, setMessages, setCurrentSession, addSession]);

  useEffect(() => {
    initializeSession();
    loadProviders();
  }, [initializeSession, loadProviders]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || !sessionId) return;

    const content = inputText.trim();
    setInputText('');
    setLoading(true);
    setError(null);

    const userMessageResponse: SessionMessageResponse = {
      info: {
        id: `local-${Date.now()}`,
        sessionID: sessionId,
        role: 'user',
        time: { created: Date.now() },
      },
      parts: [{ id: `part-${Date.now()}`, sessionID: sessionId, messageID: `local-${Date.now()}`, type: 'text', text: content }],
    };

    addMessage(userMessageResponse);

    try {
      const response = await sendMessage(
        sessionId,
        content,
        selectedModel?.id,
        selectedProvider?.id
      );
      addMessage(response);
    } catch (err) {
      console.error('Send error:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: SessionMessageResponse }) => (
    <MessageBubble message={item} colors={colors} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {useChatStore.getState().currentSession?.title || 'Chat'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <ThemeToggle />
          <TouchableOpacity
            style={[styles.modelButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => setModelSelectorVisible(true)}
          >
            <Text style={[styles.modelButtonText, { color: colors.textPrimary }]} numberOfLines={1}>
              {selectedModel?.name.split('/').pop() || 'Select Model'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <KeyboardAvoidingView
        style={[styles.keyboardView, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {messages.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Start a conversation</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Type a message to begin chatting with OpenCode
            </Text>
            {selectedModel && (
              <Text style={[styles.modelHint, { color: colors.textSecondary }]}>
                Using: {selectedModel.name}
              </Text>
            )}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.info.id}
            renderItem={renderMessage}
            contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {isLoading && (
          <View style={[styles.loadingIndicator, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="small" color={colors.textPrimary} />
          </View>
        )}

        <View style={[styles.inputContainer]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }, (!inputText.trim() || isLoading) && { backgroundColor: colors.border }]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={[styles.sendButtonText, { color: inputText.trim() && !isLoading ? colors.primaryText : colors.textSecondary }]}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <ModelSelector
        visible={modelSelectorVisible}
        onClose={() => setModelSelectorVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  backButton: {
    paddingRight: 8,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 150,
  },
  modelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  modelHint: {
    fontSize: 14,
    marginTop: 16,
    fontStyle: 'italic',
  },
  loadingIndicator: {
    padding: 8,
    alignItems: 'center',
  },
  bubbleContainer: {
    marginBottom: 6,
  },
  userBubbleContainer: {
    alignItems: 'flex-end',
  },
  assistantBubbleContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    fontSize: 16,
  },
  sendButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
