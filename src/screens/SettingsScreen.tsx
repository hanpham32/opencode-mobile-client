import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useChatStore } from '../store/chatStore';
import { getTheme, ThemeMode } from '../theme';
import ModelSelector from '../components/ModelSelector';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const theme = useChatStore((state) => state.theme);
  const colors = getTheme(theme as ThemeMode);
  const { defaultModel, setDefaultModel, selectedModel, setSelectedModel, providers } = useChatStore();
  const [showModelSelector, setShowModelSelector] = useState(false);

  useEffect(() => {
    if (!showModelSelector && selectedModel) {
      setDefaultModel(selectedModel);
    }
  }, [showModelSelector, selectedModel, setDefaultModel]);

  const handleModelSelect = (model: any) => {
    const modelToSet: any = {
      id: model.id,
      providerID: model.providerID,
      name: model.name,
      family: model.family,
      status: model.status,
      cost: model.cost,
    };
    setDefaultModel(modelToSet);
    setShowModelSelector(false);
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.name || 'Unknown';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Default Model</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            This model will be used when starting a new chat session
          </Text>
          
          <Pressable
            style={[styles.settingItem, { backgroundColor: colors.itemBackground, borderBottomColor: colors.border }]}
            onPress={() => setShowModelSelector(true)}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Model</Text>
              <Text style={[styles.settingValue, { color: colors.text }]}>
                {defaultModel?.name || 'Not set'}
              </Text>
              {defaultModel && (
                <Text style={[styles.settingSubvalue, { color: colors.textSecondary }]}>
                  {getProviderName(defaultModel.providerID)}
                </Text>
              )}
            </View>
            <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
          </Pressable>

          {!defaultModel && providers.length > 0 && (
            <View style={[styles.infoBox, { backgroundColor: colors.inputBackground }]}>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                No default model selected. The first available model will be used.
              </Text>
            </View>
          )}
        </View>
      </View>

      <ModelSelector
        visible={showModelSelector}
        onClose={() => setShowModelSelector(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    minWidth: 60,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    minWidth: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
  },
  settingSubvalue: {
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    marginLeft: 8,
  },
  infoBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
