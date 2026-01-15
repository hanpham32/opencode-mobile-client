import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Provider, Model } from '../types/chat';
import { useChatStore } from '../store/chatStore';

interface ModelSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ModelSelector({ visible, onClose }: ModelSelectorProps) {
  const { providers, selectedProvider, selectedModel, setSelectedProvider, setSelectedModel } = useChatStore();
  const [showModels, setShowModels] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleProviderSelect = useCallback((provider: Provider) => {
    setSelectedProvider(provider);
    setShowModels(true);
    setSearchQuery('');
  }, [setSelectedProvider]);

  const handleModelSelect = useCallback((model: Model | (Model & { providerId: string })) => {
    const modelWithProviderId = model as Model & { providerId?: string };
    if (modelWithProviderId.providerId) {
      const provider = providers.find((p) => p.id === modelWithProviderId.providerId);
      if (provider) {
        setSelectedProvider(provider);
      }
    }
    const modelToSet: Model = {
      id: model.id,
      providerID: model.providerID,
      name: model.name,
      family: model.family,
      status: model.status,
      cost: model.cost,
    };
    setSelectedModel(modelToSet);
    onClose();
    setShowModels(false);
    setSearchQuery('');
  }, [providers, setSelectedProvider, setSelectedModel, onClose]);

  const handleBack = useCallback(() => {
    setShowModels(false);
    setSearchQuery('');
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setSearchQuery('');
    setShowModels(false);
  }, [onClose]);

  const allModels: (Model & { providerName: string; providerId: string })[] = useMemo(() => {
    const models: (Model & { providerName: string; providerId: string })[] = [];
    providers.forEach((provider) => {
      Object.values(provider.models)
        .filter((m) => m.status === 'active')
        .forEach((model) => {
          models.push({ ...model, providerName: provider.name, providerId: provider.id });
        });
    });
    return models;
  }, [providers]);

  const filteredProviders = useMemo(() => {
    if (!searchQuery) return providers.filter((p) => Object.keys(p.models).length > 0);
    const query = searchQuery.toLowerCase();
    return providers.filter((p) => p.name.toLowerCase().includes(query));
  }, [providers, searchQuery]);

  const filteredAllModels = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return allModels.filter((m) => m.name.toLowerCase().includes(query));
  }, [allModels, searchQuery]);

  const filteredProviderModels = useMemo(() => {
    if (!selectedProvider) return [];
    const allProviderModels = Object.values(selectedProvider.models).filter(
      (m) => m.status === 'active'
    );
    if (!searchQuery) return allProviderModels;
    const query = searchQuery.toLowerCase();
    return allProviderModels.filter((m) => m.name.toLowerCase().includes(query));
  }, [selectedProvider, searchQuery]);

  const renderSearchModelItem = useCallback(({ item }: { item: Model & { providerName: string; providerId: string } }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleModelSelect(item)}>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemProvider}>{item.providerName}</Text>
      </View>
    </TouchableOpacity>
  ), [handleModelSelect]);

  const renderProviderItem = useCallback(({ item }: { item: Provider }) => {
    const matches = searchQuery
      ? Object.values(item.models).filter((m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).length
      : 0;
    return (
      <TouchableOpacity
        style={[styles.item, selectedProvider?.id === item.id && styles.selectedItem]}
        onPress={() => handleProviderSelect(item)}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCount}>
            {matches > 0 && searchQuery
              ? `${matches} matching model${matches > 1 ? 's' : ''}`
              : `${Object.keys(item.models).length} models`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [selectedProvider, searchQuery, handleProviderSelect]);

  const renderModelItem = useCallback(({ item }: { item: Model }) => (
    <TouchableOpacity
      style={[styles.item, selectedModel?.id === item.id && styles.selectedItem]}
      onPress={() => handleModelSelect(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.cost && <Text style={styles.itemCost}>${item.cost.input}/${item.cost.output}</Text>}
      </View>
    </TouchableOpacity>
  ), [selectedModel, handleModelSelect]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {showModels && selectedProvider ? selectedProvider.name : searchQuery ? 'Results' : 'Select Model'}
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search models..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {showModels ? (
          <View style={styles.content}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← All Providers</Text>
            </TouchableOpacity>
            <FlatList
              ref={listRef}
              data={filteredProviderModels}
              keyExtractor={(item) => item.id}
              renderItem={renderModelItem}
              contentContainerStyle={styles.listContent}
              initialNumToRender={15}
              maxToRenderPerBatch={15}
            />
          </View>
        ) : (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content} keyboardVerticalOffset={0}>
            {searchQuery && filteredAllModels.length > 0 && (
              <View style={styles.searchResults}>
                <Text style={styles.sectionLabel}>Models</Text>
                <FlatList
                  data={filteredAllModels}
                  keyExtractor={(item) => `${item.providerName}-${item.id}`}
                  renderItem={renderSearchModelItem}
                  style={styles.searchResultsList}
                  maxToRenderPerBatch={10}
                />
              </View>
            )}
            <FlatList
              ref={listRef}
              data={filteredProviders}
              keyExtractor={(item) => item.id}
              renderItem={renderProviderItem}
              contentContainerStyle={styles.listContent}
              initialNumToRender={15}
              maxToRenderPerBatch={15}
              keyboardShouldPersistTaps="handled"
            />
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 50,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#000' },
  closeText: { fontSize: 17, color: '#007AFF', fontWeight: '600' },
  searchContainer: { padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA' },
  searchInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  content: { flex: 1 },
  searchResults: { maxHeight: 180, borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', paddingHorizontal: 16, paddingVertical: 8, textTransform: 'uppercase' },
  searchResultsList: { maxHeight: 140 },
  listContent: { paddingBottom: 30 },
  item: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA' },
  selectedItem: { backgroundColor: '#F0F8FF' },
  itemContent: { flex: 1 },
  itemName: { fontSize: 17, color: '#000', marginBottom: 2 },
  itemProvider: { fontSize: 13, color: '#8E8E93' },
  itemCount: { fontSize: 13, color: '#8E8E93' },
  itemCost: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  backButton: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA', backgroundColor: '#FAFAFA' },
  backButtonText: { fontSize: 16, color: '#007AFF', fontWeight: '500' },
});
