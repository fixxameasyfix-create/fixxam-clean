import React, { useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import type {
  CustomerCancellationReason,
} from "@/firebase/queries/bookings";

type CancellationOption = {
  value: CustomerCancellationReason;
  label: string;
};

const REASONS: CancellationOption[] = [
  {
    value: "not_ready",
    label: "I'm sorry, I'm not ready",
  },
  {
    value: "accidental_request",
    label: "I requested accidentally",
  },
  {
    value: "request_later",
    label: "I'll request later",
  },
  {
    value: "personal_reason",
    label: "Personal reasons",
  },
  {
    value: "other",
    label: "Others",
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    reason: CustomerCancellationReason,
    note: string,
  ) => Promise<boolean>;
};

export default function CustomerCancellationModal({
  visible,
  onClose,
  onConfirm,
}: Props) {
  const [selectedReason, setSelectedReason] =
    useState<CustomerCancellationReason | null>(null);

  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedReason(null);
    setNote("");
  };

  const handleClose = () => {
    if (submitting) return;

    resetForm();
    onClose();
  };

  const handleConfirm = async () => {
    if (!selectedReason || submitting) return;

    const normalizedNote = note.trim();

    if (
      selectedReason === "other" &&
      !normalizedNote
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const success = await onConfirm(
        selectedReason,
        normalizedNote,
      );

      if (success) {
        resetForm();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDisabled =
    submitting ||
    selectedReason === null ||
    (
      selectedReason === "other" &&
      !note.trim()
    );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.warningIcon}>
              <AppText
                variant="heading3"
                weight="bold"
                style={styles.warningIconText}
              >
                !
              </AppText>
            </View>

            <AppText
              variant="heading3"
              weight="bold"
              style={styles.title}
            >
              Cancel service request?
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={styles.subtitle}
            >
              Please tell us why you want to cancel
              this request.
            </AppText>
          </View>

          <ScrollView
            style={styles.reasonList}
            contentContainerStyle={styles.reasonContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {REASONS.map(reason => {
              const selected =
                selectedReason === reason.value;

              return (
                <Pressable
                  key={reason.value}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: selected,
                    disabled: submitting,
                  }}
                  disabled={submitting}
                  onPress={() =>
                    setSelectedReason(reason.value)
                  }
                  style={[
                    styles.reasonOption,
                    selected &&
                      styles.reasonOptionSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      selected &&
                        styles.radioOuterSelected,
                    ]}
                  >
                    {selected && (
                      <View style={styles.radioInner} />
                    )}
                  </View>

                  <AppText
                    variant="body"
                    style={styles.reasonLabel}
                  >
                    {reason.label}
                  </AppText>
                </Pressable>
              );
            })}

            {selectedReason === "other" && (
              <View style={styles.noteContainer}>
                <AppText
                  variant="caption"
                  weight="medium"
                  style={styles.noteLabel}
                >
                  Tell us your reason
                </AppText>

                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Enter your reason..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  maxLength={500}
                  editable={!submitting}
                  accessibilityLabel="Cancellation reason"
                  textAlignVertical="top"
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

          <Pressable
            accessibilityRole="button"
            disabled={confirmDisabled}
            onPress={() => {
              void handleConfirm();
            }}
            style={[
              styles.confirmButton,
              confirmDisabled &&
                styles.confirmButtonDisabled,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <AppText
                variant="body"
                weight="bold"
                style={styles.confirmText}
              >
                Confirm cancellation
              </AppText>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={handleClose}
            style={styles.keepButton}
          >
            <AppText
              variant="body"
              weight="medium"
              style={styles.keepText}
            >
              Keep request
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  modal: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "90%",
    alignSelf: "center",
    padding: FixxamTokens.spacing.md,
    borderRadius: FixxamTokens.radius.xl,
    backgroundColor: Colors.background,
  },

  header: {
    alignItems: "center",
  },

  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
    marginBottom: FixxamTokens.spacing.sm,
  },

  warningIconText: {
    color: Colors.error,
  },

  title: {
    textAlign: "center",
    color: Colors.textPrimary,
  },

  subtitle: {
    textAlign: "center",
    lineHeight: 20,
    marginTop: FixxamTokens.spacing.xs,
    marginBottom: FixxamTokens.spacing.md,
  },

  reasonList: {
    flexShrink: 1,
  },

  reasonContent: {
    paddingBottom: FixxamTokens.spacing.xs,
  },

  reasonOption: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D9DEE7",
    borderRadius: FixxamTokens.radius.md,
  },

  reasonOptionSelected: {
    borderColor: CustomerColors.primary,
    backgroundColor: CustomerColors.primarySoft,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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

  noteContainer: {
    marginTop: 4,
    marginBottom: 12,
  },

  noteLabel: {
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  noteInput: {
    minHeight: 90,
    maxHeight: 140,
    borderWidth: 1,
    borderColor: "#D9DEE7",
    borderRadius: FixxamTokens.radius.md,
    padding: 12,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },

  characterCount: {
    textAlign: "right",
    marginTop: 4,
  },

  confirmButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: Colors.error,
    marginTop: FixxamTokens.spacing.sm,
  },

  confirmButtonDisabled: {
    opacity: 0.5,
  },

  confirmText: {
    color: "#FFFFFF",
  },

  keepButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  keepText: {
    color: Colors.textSecondary,
  },
});