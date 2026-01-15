import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import ChatScreen from '../screens/ChatScreen';
import SessionListScreen from '../screens/SessionListScreen';
import { getSessions } from '../services/api';
import { useChatStore } from '../store/chatStore';

export type RootStackParamList = {
  Sessions: undefined;
  Chat: { sessionId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  const { setSessions, currentSession } = useChatStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const sessionList = await getSessions();
        setSessions(sessionList);
        setInitialized(true);
      } catch (error) {
        console.error('Failed to load sessions:', error);
        setInitialized(true);
      }
    };
    init();
  }, [setSessions]);

  if (!initialized) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Sessions"
          component={SessionListScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ navigation }) => ({
            headerTitle: currentSession?.title || 'Chat',
            headerTransparent: true,
            headerTintColor: '#007AFF',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Sessions')}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>Sessions</Text>
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
