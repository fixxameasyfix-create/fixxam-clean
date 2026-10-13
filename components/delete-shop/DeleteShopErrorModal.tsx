import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type DeleteShopErrorModalProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

export default function DeleteShopErrorModal({
  visible,
  message,
  onClose,
}: DeleteShopErrorModalProps) {
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
          accessibilityLabel="Close error message"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View style={styles.card}>
          {/* ICON */}

          <View style={styles.iconContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color="#DC2626"
            />
          </View>

          {/* CONTENT */}

          <Text style={styles.title}>
            Unable to Delete Shop
          </Text>

          <Text style={styles.message}>
            {message ||
              'Something went wrong while deleting your shop. Please try again.'}
          </Text>

          {/* INFO */}

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#64748B"
            />

            <Text style={styles.infoText}>
              Your shop has not been deleted.
            </Text>
          </View>

          {/* BUTTON */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              Got It
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },

  card: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },

  iconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
  },

  title: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },

  message: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
  },

  infoBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 17,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
  },

  button: {
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderRadius: 15,
    backgroundColor: '#1677FF',
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  pressed: {
    opacity: 0.72,
  },
});