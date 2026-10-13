import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type BookingSuccessModalProps = {
  visible: boolean;
  serviceName: string;
  shopName: string;
  closing?: boolean;
  onDone: () => void;
  onViewVisits: () => void;
};

function BookingSuccessModal({
  visible,
  serviceName,
  shopName,
  closing = false,
  onDone,
  onViewVisits,
}: BookingSuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => {
        if (!closing) {
          onDone();
        }
      }}
    >
      <View
        style={styles.overlay}
        accessibilityViewIsModal
      >
        <View style={styles.modalCard}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="checkmark"
              size={40}
              color="#16A34A"
            />
          </View>

          <Text style={styles.title}>
            Request Sent
          </Text>

          <Text style={styles.message}>
            Your{' '}
            <Text style={styles.highlight}>
              {serviceName}
            </Text>{' '}
            request was successfully sent to{' '}
            <Text style={styles.highlight}>
              {shopName}
            </Text>
            .
          </Text>

          <View style={styles.statusRow}>
            <Ionicons
              name="time-outline"
              size={20}
              color="#64748B"
            />

            <Text style={styles.statusText}>
              Waiting for the provider to respond
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Done"
              accessibilityHint="Closes this message and returns to the previous screen"
              accessibilityState={{
                disabled: closing,
              }}
              disabled={closing}
              onPress={onDone}
              style={({ pressed }) => [
                styles.doneButton,
                closing && styles.disabled,
                pressed &&
                  !closing &&
                  styles.pressed,
              ]}
            >
              {closing ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={23}
                  color="#FFFFFF"
                />
              )}

              <Text style={styles.doneButtonText}>
                Done
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View visits"
              accessibilityHint="Opens your requests and visits"
              accessibilityState={{
                disabled: closing,
              }}
              disabled={closing}
              onPress={onViewVisits}
              style={({ pressed }) => [
                styles.viewVisitsButton,
                closing && styles.disabled,
                pressed &&
                  !closing &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="eye-outline"
                size={27}
                color="#1677FF"
              />

              <Text
                style={
                  styles.viewVisitsButtonText
                }
              >
                View Visits
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default memo(
  BookingSuccessModal,
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor:
      'rgba(15, 23, 42, 0.46)',
  },

  modalCard: {
    width: '100%',
    maxWidth: 390,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 22,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 14,
  },

  iconContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
  },

  title: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#0F172A',
  },

  message: {
    marginTop: 10,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: '#64748B',
  },

  highlight: {
    fontWeight: '800',
    color: '#334155',
  },

  statusRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
  },

  statusText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#64748B',
  },

  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 14,
    marginTop: 22,
  },

  doneButton: {
    flex: 1,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: '#1677FF',
  },

  doneButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  viewVisitsButton: {
    flex: 1,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#1677FF',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
  },

  viewVisitsButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1677FF',
  },

  disabled: {
    opacity: 0.55,
  },

  pressed: {
    opacity: 0.76,
  },
});