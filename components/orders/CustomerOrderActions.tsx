import React, { memo, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import type {
  CustomerCancellationReason,
} from "@/firebase/queries/bookings";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

type CustomerOrderActionsProps = {
  onCall: () => void;
  onCancel: (
    reason: CustomerCancellationReason,
    note?: string,
  ) => Promise<boolean>;
  callDisabled?: boolean;
  cancelDisabled?: boolean;
};

const CANCELLATION_OPTIONS: {
  value: CustomerCancellationReason;
  label: string;
}[] = [
  {
    value: "not_ready",
    label: "I'm not ready yet",
  },
  {
    value: "accidental_request",
    label: "I placed this order by mistake",
  },
  {
    value: "request_later",
    label: "I want to book later",
  },
  {
    value: "personal_reason",
    label: "Personal reasons",
  },
  {
    value: "other",
    label: "Other reason",
  },
];

function CustomerOrderActions({
  onCall,
  onCancel,
  callDisabled = false,
  cancelDisabled = false,
}: CustomerOrderActionsProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] =
    useState<CustomerCancellationReason | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const closeModal = () => {
    if (submitting) return;

    setModalVisible(false);
    setSelectedReason(null);
    setNote("");
    setValidationError("");
  };

  const submitCancellation = async () => {
    if (submitting) return;

    if (!selectedReason) {
      setValidationError("Please select a cancellation reason.");
      return;
    }

    const normalizedNote = note.trim();

    if (selectedReason === "other" && !normalizedNote) {
      setValidationError("Please explain why you want to cancel.");
      return;
    }

    if (normalizedNote.length > 500) {
      setValidationError("Your note must not exceed 500 characters.");
      return;
    }

    setValidationError("");
    setSubmitting(true);

    try {
      const success = await onCancel(
        selectedReason,
        normalizedNote,
      );

      if (success) {
        setModalVisible(false);
        setSelectedReason(null);
        setNote("");
      }
    } catch {
      setValidationError(
        "Cancellation failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Pressable
          onPress={onCall}
          disabled={callDisabled}
          accessibilityRole="button"
          accessibilityLabel="Call worker"
          accessibilityState={{ disabled: callDisabled }}
          style={({ pressed }) => [
            styles.button,
            styles.callButton,
            callDisabled && styles.disabledButton,
            pressed && !callDisabled && styles.pressed,
          ]}
        >
          <AppIcon
            name="phone"
            role="customer"
            size="xs"
            color={
              callDisabled
                ? Colors.textMuted
                : Colors.textInverse
            }
          />

          <AppText
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={1}
            style={[
              styles.buttonText,
              styles.callText,
              callDisabled && styles.disabledText,
            ]}
          >
            Call Worker
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setModalVisible(true)}
          disabled={cancelDisabled || submitting}
          accessibilityRole="button"
          accessibilityLabel="Cancel order"
          accessibilityState={{
            disabled: cancelDisabled || submitting,
          }}
          style={({ pressed }) => [
            styles.button,
            styles.cancelButton,
            (cancelDisabled || submitting) &&
              styles.disabledButton,
            pressed &&
              !cancelDisabled &&
              !submitting &&
              styles.cancelPressed,
          ]}
        >
          <AppIcon
            name="error"
            role="customer"
            size="xs"
            color={
              cancelDisabled
                ? Colors.textMuted
                : Colors.error
            }
          />

          <AppText
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={1}
            style={[
              styles.buttonText,
              styles.cancelText,
              cancelDisabled && styles.disabledText,
            ]}
          >
            Cancel
          </AppText>
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={styles.modalCard}
            accessibilityViewIsModal
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <AppIcon
                  name="error"
                  size="md"
                  color={Colors.error}
                />
              </View>

              <Pressable
                onPress={closeModal}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Close cancellation dialog"
                style={styles.closeButton}
              >
                <AppIcon
                  name="close"
                  size="sm"
                  color={Colors.textSecondary}
                />
              </Pressable>
            </View>

            <AppText
              variant="heading3"
              weight="bold"
              style={styles.modalTitle}
            >
              Cancel order?
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={styles.modalDescription}
            >
              Please tell us why you want to cancel this order.
            </AppText>

            <ScrollView
              style={styles.optionsList}
              contentContainerStyle={styles.optionsContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {CANCELLATION_OPTIONS.map(option => {
                const selected =
                  selectedReason === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setSelectedReason(option.value);
                      setValidationError("");
                    }}
                    disabled={submitting}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    style={[
                      styles.reasonOption,
                      selected && styles.reasonOptionSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.radioOuterSelected,
                      ]}
                    >
                      {selected && (
                        <View style={styles.radioInner} />
                      )}
                    </View>

                    <AppText
                      variant="body"
                      style={[
                        styles.reasonLabel,
                        selected && styles.reasonLabelSelected,
                      ]}
                    >
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}

              {selectedReason === "other" && (
                <View style={styles.noteContainer}>
                  <AppText
                    variant="bodyMedium"
                    weight="semibold"
                    style={styles.noteLabel}
                  >
                    Please explain
                  </AppText>

                  <TextInput
                    value={note}
                    onChangeText={value => {
                      setNote(value);
                      setValidationError("");
                    }}
                    placeholder="Tell us why you're cancelling..."
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    maxLength={500}
                    editable={!submitting}
                    textAlignVertical="top"
                    accessibilityLabel="Cancellation explanation"
                    style={styles.noteInput}
                  />

                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={styles.characterCount}
                  >
                    {note.length}/500
                  </AppText>
                </View>
              )}
            </ScrollView>

            {!!validationError && (
              <AppText
                variant="caption"
                style={styles.validationError}
                accessibilityRole="alert"
              >
                {validationError}
              </AppText>
            )}

            <View style={styles.modalActions}>
              <Pressable
                onPress={closeModal}
                disabled={submitting}
                accessibilityRole="button"
                style={[
                  styles.modalButton,
                  styles.keepButton,
                  submitting && styles.disabledButton,
                ]}
              >
                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                  style={styles.keepButtonText}
                >
                  Keep order
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => void submitCancellation()}
                disabled={submitting || cancelDisabled}
                accessibilityRole="button"
                accessibilityLabel="Confirm order cancellation"
                style={[
                  styles.modalButton,
                  styles.confirmCancelButton,
                  (submitting || cancelDisabled) &&
                    styles.disabledButton,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.textInverse}
                  />
                ) : (
                  <AppText
                    variant="bodyMedium"
                    weight="semibold"
                    style={styles.confirmCancelText}
                  >
                    Confirm cancel
                  </AppText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: FixxamTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: FixxamTokens.spacing.sm,
  },

  button: {
    minHeight: FixxamTokens.size.minimumTouchTarget,
    paddingHorizontal: FixxamTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: FixxamTokens.spacing.xs,
    borderWidth: 1,
    borderRadius: FixxamTokens.radius.md,
  },

  buttonText: {
    flexShrink: 1,
  },

  callButton: {
    flex: 1.35,
    borderColor: CustomerColors.primary,
    backgroundColor: CustomerColors.primary,
  },

  callText: {
    color: Colors.textInverse,
  },

  cancelButton: {
    flex: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.surface,
  },

  cancelText: {
    color: Colors.error,
  },

  disabledButton: {
    borderColor: Colors.border,
    backgroundColor: Colors.disabledBackground,
    opacity: 0.7,
  },

  disabledText: {
    color: Colors.textMuted,
  },

  pressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
    transform: [{ scale: FixxamTokens.motion.scalePressed }],
  },

  cancelPressed: {
    backgroundColor: Colors.errorSoft,
    opacity: FixxamTokens.motion.pressedOpacity,
    transform: [{ scale: FixxamTokens.motion.scalePressed }],
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: FixxamTokens.spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },

  modalCard: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    padding: FixxamTokens.spacing.lg,
    borderRadius: FixxamTokens.radius.xl,
    backgroundColor: Colors.surface,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: FixxamTokens.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.errorSoft,
  },

  closeButton: {
    minWidth: FixxamTokens.size.minimumTouchTarget,
    minHeight: FixxamTokens.size.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },

  modalTitle: {
    marginTop: FixxamTokens.spacing.md,
    color: Colors.textPrimary,
  },

  modalDescription: {
    marginTop: FixxamTokens.spacing.xs,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  optionsList: {
    flexGrow: 0,
    marginTop: FixxamTokens.spacing.md,
  },

  optionsContent: {
    gap: FixxamTokens.spacing.xs,
    paddingBottom: FixxamTokens.spacing.xs,
  },

  reasonOption: {
    minHeight: FixxamTokens.size.minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: FixxamTokens.spacing.sm,
    paddingVertical: FixxamTokens.spacing.sm,
    gap: FixxamTokens.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FixxamTokens.radius.md,
  },

  reasonOptionSelected: {
    borderColor: CustomerColors.primary,
    backgroundColor: CustomerColors.primarySoft,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: CustomerColors.primary,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CustomerColors.primary,
  },

  reasonLabel: {
    flex: 1,
    color: Colors.textPrimary,
  },

  reasonLabelSelected: {
    fontWeight: "600",
  },

  noteContainer: {
    marginTop: FixxamTokens.spacing.sm,
  },

  noteLabel: {
    marginBottom: FixxamTokens.spacing.xs,
    color: Colors.textPrimary,
  },

  noteInput: {
    minHeight: 96,
    maxHeight: 150,
    padding: FixxamTokens.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FixxamTokens.radius.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    fontSize: 15,
    lineHeight: 21,
  },

  characterCount: {
    marginTop: FixxamTokens.spacing.xs,
    textAlign: "right",
    color: Colors.textSecondary,
  },

  validationError: {
    marginTop: FixxamTokens.spacing.sm,
    color: Colors.error,
  },

  modalActions: {
    flexDirection: "row",
    gap: FixxamTokens.spacing.sm,
    marginTop: FixxamTokens.spacing.lg,
  },

  modalButton: {
    flex: 1,
    minHeight: FixxamTokens.size.minimumTouchTarget,
    paddingHorizontal: FixxamTokens.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.md,
    borderWidth: 1,
  },

  keepButton: {
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },

  keepButtonText: {
    color: Colors.textPrimary,
  },

  confirmCancelButton: {
    borderColor: Colors.error,
    backgroundColor: Colors.error,
  },

  confirmCancelText: {
    color: Colors.textInverse,
  },
});

CustomerOrderActions.displayName = "CustomerOrderActions";

export default memo(CustomerOrderActions);