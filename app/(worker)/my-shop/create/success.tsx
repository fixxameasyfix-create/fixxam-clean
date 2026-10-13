import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useShopRegistration } from '../../../../contexts/ShopRegistrationContext';

export default function ShopCreationSuccessScreen() {
  const { draft } = useShopRegistration();

  const handleGoToShop = () => {
    router.replace('/my-shop/dashboard');
  };

  const handleAddMoreServices = () => {
    router.replace('/my-shop/create/services');
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={styles.safeArea}
    >
      <View style={styles.content}>
        <View style={styles.successOuter}>
          <View style={styles.successInner}>
            <Ionicons
              name="checkmark"
              size={56}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.title}>
          Your Shop is Ready!
        </Text>

        <Text style={styles.description}>
          {draft.name || 'Your shop'} has been
          created successfully. Customers will be
          able to discover your shop and request
          your services.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="storefront-outline"
              size={25}
              color="#1677FF"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              {draft.name}
            </Text>

            <Text style={styles.infoText}>
              {draft.category}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              Active
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#1677FF"
          />

          <Text style={styles.tipText}>
            Keep your services, opening hours and
            shop information updated so customers
            always see accurate information.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to my shop"
          onPress={handleGoToShop}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="storefront-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.primaryButtonText}>
            Go to My Shop
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add more services"
          onPress={handleAddMoreServices}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="add"
            size={21}
            color="#1677FF"
          />

          <Text style={styles.secondaryButtonText}>
            Add More Services
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  successOuter: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 45,
    backgroundColor: '#DCFCE7',
  },

  successInner: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    backgroundColor: '#22C55E',
  },

  title: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
  },

  description: {
    maxWidth: 350,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 23,
    color: '#64748B',
  },

  infoCard: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 28,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  infoIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
  },

  infoContent: {
    flex: 1,
    minWidth: 0,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  infoText: {
    marginTop: 2,
    fontSize: 13,
    color: '#64748B',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },

  tipBox: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
    padding: 13,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
  },

  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 10,
  },

  primaryButton: {
    minHeight: 59,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 18,
    backgroundColor: '#1677FF',
  },

  primaryButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  secondaryButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1677FF',
  },

  pressed: {
    opacity: 0.72,
  },
});