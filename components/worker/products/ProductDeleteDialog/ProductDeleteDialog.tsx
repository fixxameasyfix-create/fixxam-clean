import React, {
  memo,
  useCallback,
} from "react";

import {
  Modal,
  View,
} from "react-native";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
} from "@/theme";

import styles from "./ProductDeleteDialog.styles";

import type {
  ProductDeleteDialogProps,
} from "./ProductDeleteDialog.types";

/* ============================================================
   COMPONENT
============================================================ */

function ProductDeleteDialog({
  visible,
  loading = false,
  onCancel,
  onConfirm,
}: ProductDeleteDialogProps) {
  /* ==========================================================
     CLOSE
  ========================================================== */

  const handleCancel =
    useCallback(() => {
      if (loading) {
        return;
      }

      onCancel();
    }, [
      loading,
      onCancel,
    ]);

  /* ==========================================================
     CONFIRM
  ========================================================== */

  const handleConfirm =
    useCallback(() => {
      if (loading) {
        return;
      }

      onConfirm();
    }, [
      loading,
      onConfirm,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        handleCancel
      }
    >
      <View
        style={
          styles.overlay
        }
      >
        <View
          style={
            styles.container
          }
          accessibilityViewIsModal
          accessibilityLabel="Delete product confirmation"
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={
              styles.icon
            }
          >
            <AppIcon
              name="delete"
              size="xl"
              color={
                Colors.error
              }
            />
          </View>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.title
            }
          >
            Delete Product?
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.message
            }
          >
            This action cannot be undone.
          </AppText>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.row
            }
          >
            <View
              style={
                styles.cancelButton
              }
            >
              <AppButton
                title="Cancel"
                variant="outline"
                role="worker"
                disabled={
                  loading
                }
                onPress={
                  handleCancel
                }
              />
            </View>

            <View
              style={
                styles.deleteButton
              }
            >
              <AppButton
                title="Delete"
                variant="danger"
                role="worker"
                leftIconName="delete"
                loading={
                  loading
                }
                disabled={
                  loading
                }
                onPress={
                  handleConfirm
                }
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   MEMO
============================================================ */

ProductDeleteDialog.displayName =
  "ProductDeleteDialog";

export default memo(
  ProductDeleteDialog,
);