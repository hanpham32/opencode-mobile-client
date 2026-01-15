import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
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
  const { setSessions } = useChatStore();
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
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
