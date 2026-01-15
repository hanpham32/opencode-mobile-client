import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import ChatScreen from '../screens/ChatScreen';
import SessionListScreen from '../screens/SessionListScreen';
import { getSessions, getProviders } from '../services/api';
import { useChatStore } from '../store/chatStore';

export type RootStackParamList = {
  Sessions: undefined;
  Chat: { sessionId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  const { setSessions, setProviders, setSelectedProvider, setSelectedModel } = useChatStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [sessionList, providerList] = await Promise.all([
          getSessions(),
          getProviders(),
        ]);
        setSessions(sessionList);
        setProviders(providerList);
        if (providerList.length > 0) {
          const firstProvider = providerList[0];
          setSelectedProvider(firstProvider);
          const firstModel = Object.values(firstProvider.models)[0];
          if (firstModel) {
            setSelectedModel(firstModel);
          }
        }
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setInitialized(true);
      }
    };
    init();
  }, [setSessions, setProviders, setSelectedProvider, setSelectedModel]);

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
