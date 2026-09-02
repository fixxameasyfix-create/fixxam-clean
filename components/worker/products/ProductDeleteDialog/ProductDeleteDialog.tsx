import React from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import styles from "./ProductDeleteDialog.styles";
import { ProductDeleteDialogProps } from "./ProductDeleteDialog.types";

export default function ProductDeleteDialog({
  visible,
  loading = false,
  onCancel,
  onConfirm,
}: ProductDeleteDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons
            style={styles.icon}
            name="trash"
            size={56}
            color="#DC2626"
          />

          <AppText
            weight="bold"
            style={styles.title}
          >
            Delete Product?
          </AppText>

          <AppText style={styles.message}>
            This action cannot be undone.
          </AppText>

          <View style={styles.row}>
            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}
            >
              <AppText style={styles.cancelText}>
                Cancel
              </AppText>
            </Pressable>

            <Pressable
              style={styles.deleteButton}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <AppText style={styles.deleteText}>
                  Delete
                </AppText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}