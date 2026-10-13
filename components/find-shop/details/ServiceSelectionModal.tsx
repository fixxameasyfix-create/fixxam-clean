import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { ShopService } from '../../../types/shop';

type Props = {
  visible: boolean;
  services: ShopService[];
  onClose: () => void;
  onSelectService: (service: ShopService) => void;
};

export function ServiceSelectionModal({
  visible,
  services,
  onClose,
  onSelectService,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                Choose a Service
              </Text>

              <Text style={styles.subtitle}>
                Select the service you want to book.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close service selection"
              hitSlop={8}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={24}
                color="#334155"
              />
            </Pressable>
          </View>

          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="construct-outline"
                    size={32}
                    color="#64748B"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No services available
                </Text>

                <Text style={styles.emptyText}>
                  This provider has not added any
                  services yet.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Choose ${item.name}`}
                onPress={() =>
                  onSelectService(item)
                }
                style={({ pressed }) => [
                  styles.serviceCard,
                  pressed && styles.pressed,
                ]}
              >
                <Image
                  source={{
                    uri: item.imageUrl,
                  }}
                  resizeMode="cover"
                  style={styles.serviceImage}
                />

                <View style={styles.serviceContent}>
                  <Text
                    style={styles.serviceName}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={styles.serviceDescription}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>

                  <Text style={styles.price}>
                    {item.priceLabel}
                  </Text>
                </View>

                <View style={styles.arrow}>
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color="#1677FF"
                  />
                </View>
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },

  sheet: {
    maxHeight: '78%',
    minHeight: 360,
    paddingTop: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFFFF',
  },

  handle: {
    width: 44,
    height: 5,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: '#CBD5E1',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },

  closeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  serviceCard: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  serviceImage: {
    width: 92,
    height: 92,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },

  serviceContent: {
    flex: 1,
    minWidth: 0,
  },

  serviceName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  serviceDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },

  price: {
    marginTop: 7,
    fontSize: 15,
    fontWeight: '800',
    color: '#1677FF',
  },

  arrow: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
  },

  pressed: {
    opacity: 0.72,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  emptyText: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 14,
    color: '#64748B',
  },
});