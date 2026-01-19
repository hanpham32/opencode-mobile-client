import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Session } from '../types/chat';
import { getSessions, deleteSession, createSession } from '../services/api';
import { useChatStore } from '../store/chatStore';
import { getTheme, ThemeMode } from '../theme';
import ThemeToggle from '../components/ThemeToggle';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

interface SessionItemProps {
  session: Session;
  onPress: () => void;
  onDelete: () => void;
  colors: ReturnType<typeof getTheme>;
}

function SessionItem({ session, onPress, onDelete, colors }: SessionItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.sessionItem, { backgroundColor: colors.itemBackground }]} 
      onPress={onPress} 
      onLongPress={onDelete}
    >
      <View style={styles.sessionContent}>
        <Text style={[styles.sessionTitle, { color: colors.text }]}>{session.title || 'Untitled Session'}</Text>
        <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>{formatDate(session.time.updated)}</Text>
      </View>
      <Text style={[styles.sessionDir, { color: colors.textSecondary }]}>{session.directory.split('/').pop()}</Text>
    </TouchableOpacity>
  );
}

export default function SessionListScreen() {
  const navigation = useNavigation<any>();
  const theme = useChatStore((state) => state.theme);
  const colors = getTheme(theme as ThemeMode);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleCreateSession = async () => {
    try {
      const newSession = await createSession('New Session');
      loadSessions();
      navigation.navigate('Chat', { sessionId: newSession.id });
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleSessionPress = (session: Session) => {
    navigation.navigate('Chat', { sessionId: session.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sessions</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
            <Text style={[styles.settingsButtonText, { color: colors.text }]}>⚙</Text>
          </TouchableOpacity>
          <ThemeToggle />
          <TouchableOpacity style={[styles.newButton, { backgroundColor: colors.primary }]} onPress={handleCreateSession}>
            <Text style={[styles.newButtonText, { color: colors.primaryText }]}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionItem
            session={item}
            onPress={() => handleSessionPress(item)}
            onDelete={() => handleDeleteSession(item.id)}
            colors={colors}
          />
        )}
        contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={colors.textPrimary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No sessions yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tap + New to start a conversation</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  newButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  newButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  settingsButtonText: {
    fontSize: 20,
  },
  listContent: {
    padding: 16,
  },
  sessionItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  sessionDate: {
    fontSize: 13,
  },
  sessionDir: {
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
