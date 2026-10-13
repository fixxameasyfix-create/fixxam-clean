import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ShopSettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  onDeletePress: () => void;
};

export default function ShopSettingsModal({
  visible,
  onClose,
  onDeletePress,
}: ShopSettingsModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close shop settings"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View style={styles.modal}>
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="settings-outline"
                size={22}
                color="#1677FF"
              />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.title}>
                Shop Settings
              </Text>

              <Text style={styles.subtitle}>
                Manage your shop settings
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close settings"
              hitSlop={10}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={21}
                color="#64748B"
              />
            </Pressable>
          </View>

          {/* DELETE SHOP */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete shop"
            accessibilityHint="Permanently delete your shop"
            onPress={onDeletePress}
            style={({ pressed }) => [
              styles.deleteRow,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.deleteIcon}>
              <Ionicons
                name="trash-outline"
                size={21}
                color="#DC2626"
              />
            </View>

            <View style={styles.deleteContent}>
              <Text style={styles.deleteTitle}>
                Delete Shop
              </Text>

              <Text style={styles.deleteDescription}>
                Permanently remove your shop and services
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#DC2626"
            />
          </Pressable>

          {/* WARNING */}

          <View style={styles.warning}>
            <Ionicons
              name="warning-outline"
              size={18}
              color="#B45309"
            />

            <Text style={styles.warningText}>
              Deleting your shop cannot be undone.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },

  modal: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
  },

  headerText: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
  },

  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
  },

  deleteRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 20,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
  },

  deleteIcon: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
  },

  deleteContent: {
    flex: 1,
  },

  deleteTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },

  deleteDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: '#7F1D1D',
  },

  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 12,
    padding: 11,
    borderRadius: 13,
    backgroundColor: '#FFFBEB',
  },

  warningText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#92400E',
  },

  pressed: {
    opacity: 0.7,
  },
});