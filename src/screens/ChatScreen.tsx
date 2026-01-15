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
import ModelSelector from '../components/ModelSelector';

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
}

function MessageBubble({ message }: MessageItemProps) {
  const isUser = message.info.role === 'user';
  const content = formatMessageText(message.parts);
  
  if (!content) return null;

  return (
    <View style={[
      styles.bubbleContainer,
      isUser ? styles.userBubbleContainer : styles.assistantBubbleContainer,
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}>
        <Text style={[
          styles.bubbleText,
          isUser ? styles.userBubbleText : styles.assistantBubbleText,
        ]}>
          {content}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation<any>();
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
    <MessageBubble message={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {useChatStore.getState().currentSession?.title || 'Chat'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.modelButton}
          onPress={() => setModelSelectorVisible(true)}
        >
          <Text style={styles.modelButtonText} numberOfLines={1}>
            {selectedModel?.name.split('/').pop() || 'Select Model'}
          </Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptySubtitle}>
              Type a message to begin chatting with OpenCode
            </Text>
            {selectedModel && (
              <Text style={styles.modelHint}>
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
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {isLoading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#8E8E93"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
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
    backgroundColor: '#fff',
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
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  modelButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 150,
  },
  modelButtonText: {
    fontSize: 14,
    color: '#007AFF',
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
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  modelHint: {
    fontSize: 14,
    color: '#8E8E93',
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
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userBubbleText: {
    color: '#fff',
  },
  assistantBubbleText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    fontSize: 16,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B0B0B8',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
