import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ShopLocationBarProps = {
  location: string;
  onUseCurrentLocation: () => void;
};

export function ShopLocationBar({
  location,
  onUseCurrentLocation,
}: ShopLocationBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.locationSection}>
        <View style={styles.locationIcon}>
          <Ionicons
            name="location"
            size={24}
            color="#1677FF"
          />
        </View>

        <View style={styles.locationContent}>
          <Text style={styles.locationLabel}>
            Your location
          </Text>

          <View style={styles.locationRow}>
            <Text
              style={styles.locationText}
              numberOfLines={1}
            >
              {location}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#1677FF"
            />
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Use current location"
        onPress={onUseCurrentLocation}
        style={({ pressed }) => [
          styles.currentLocationButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="locate-outline"
          size={20}
          color="#1677FF"
        />

        <Text style={styles.currentLocationText}>
          Use current location
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },

  locationSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },

  locationIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
  },

  locationContent: {
    flex: 1,
    minWidth: 0,
  },

  locationLabel: {
    fontSize: 13,
    color: '#64748B',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  locationText: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  currentLocationButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
  },

  currentLocationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1677FF',
  },

  pressed: {
    opacity: 0.72,
  },
});