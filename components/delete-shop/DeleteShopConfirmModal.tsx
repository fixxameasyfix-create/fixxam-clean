import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type DeleteShopConfirmModalProps = {
  visible: boolean;
  shopName: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteShopConfirmModal({
  visible,
  shopName,
  loading,
  onCancel,
  onConfirm,
}: DeleteShopConfirmModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={() => {
        if (!loading) {
          onCancel();
        }
      }}
    >
      <View style={styles.root}>
        <View style={styles.backdrop} />

        <View style={styles.card}>
          {/* ICON */}

          <View style={styles.iconContainer}>
            <Ionicons
              name="trash-outline"
              size={28}
              color="#DC2626"
            />
          </View>

          {/* CONTENT */}

          <Text style={styles.title}>
            Delete Shop?
          </Text>

          <Text style={styles.description}>
            You are about to permanently delete
          </Text>

          <Text
            style={styles.shopName}
            numberOfLines={2}
          >
            {shopName}
          </Text>

          <Text style={styles.description}>
            Your shop and its services will be removed.
            This action cannot be undone.
          </Text>

          {/* WARNING */}

          <View style={styles.warningBox}>
            <Ionicons
              name="warning-outline"
              size={19}
              color="#B45309"
            />

            <Text style={styles.warningText}>
              You cannot delete the shop while you have
              pending or accepted customer requests.
            </Text>
          </View>

          {/* ACTIONS */}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel shop deletion"
              disabled={loading}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButton,

                loading &&
                  styles.disabled,

                pressed &&
                  !loading &&
                  styles.pressed,
              ]}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirm delete shop"
              accessibilityHint="Permanently deletes your shop"
              disabled={loading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.deleteButton,

                loading &&
                  styles.disabled,

                pressed &&
                  !loading &&
                  styles.pressed,
              ]}
            >
              {loading ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text style={styles.deleteText}>
                    Deleting...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.deleteText}>
                    Delete Shop
                  </Text>
                </>
              )}
            </Pressable>
          </View>
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
    maxWidth: 390,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },

  iconContainer: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
  },

  title: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  description: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },

  shopName: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },

  warningBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 17,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
  },

  warningText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#92400E',
  },

  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 19,
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },

  cancelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },

  deleteButton: {
    flex: 1.25,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 15,
    backgroundColor: '#DC2626',
  },

  deleteText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  disabled: {
    opacity: 0.55,
  },

  pressed: {
    opacity: 0.72,
  },
});