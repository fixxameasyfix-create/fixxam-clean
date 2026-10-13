import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

type ShopSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onFilterPress: () => void;
  isFilterActive?: boolean;
};

export function ShopSearchBar({
  value,
  onChangeText,
  onFilterPress,
  isFilterActive = false,
}: ShopSearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={24}
          color="#64748B"
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search shops or services..."
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.input}
        />

        {value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={10}
            onPress={() => onChangeText('')}
          >
            <Ionicons
              name="close-circle"
              size={21}
              color="#94A3B8"
            />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isFilterActive
            ? 'Disable open shops filter'
            : 'Show open shops only'
        }
        accessibilityState={{
          selected: isFilterActive,
        }}
        onPress={onFilterPress}
        style={({ pressed }) => [
          styles.filterButton,
          isFilterActive && styles.filterButtonActive,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="options-outline"
          size={27}
          color={isFilterActive ? '#FFFFFF' : '#1677FF'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },

  searchContainer: {
    flex: 1,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: 16,
    color: '#0F172A',
  },

  filterButton: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
  },

  filterButtonActive: {
    borderColor: '#1677FF',
    backgroundColor: '#1677FF',
  },

  pressed: {
    opacity: 0.72,
  },
});