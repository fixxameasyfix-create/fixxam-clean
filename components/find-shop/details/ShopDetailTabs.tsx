import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import type { ShopDetailTab } from '../../../types/shop';

const TABS: ShopDetailTab[] = [
  'Overview',
  'Services',
  'Reviews',
  'Location',
  'Photos',
];

type Props = {
  activeTab: ShopDetailTab;
  onChange: (tab: ShopDetailTab) => void;
};

export function ShopDetailTabs({
  activeTab,
  onChange,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab;

        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[
              styles.tab,
              active && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.text,
                active && styles.activeText,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },

  tab: {
    minWidth: 110,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },

  activeTab: {
    backgroundColor: '#1677FF',
  },

  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  activeText: {
    color: '#FFFFFF',
  },
});