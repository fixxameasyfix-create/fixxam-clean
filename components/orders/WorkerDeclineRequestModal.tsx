import React, { memo, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AppIcon, AppText } from "@/components/ui";
import { Colors, FixxamTokens, WorkerColors } from "@/theme";

export const WORKER_DECLINE_REASONS = [
  {
    label: "I'm no longer available",
    value: "no_longer_available",
  },
  {
    label: "Outside my service area",
    value: "outside_service_area",
  },
  {
    label: "I'm too busy right now",
    value: "too_busy",
  },
  {
    label: "I have a scheduling conflict",
    value: "scheduling_conflict",
  },
  {
    label: "Other reason",
    value: "other",
  },
] as const;

export type WorkerDeclineReason =
  (typeof WORKER_DECLINE_REASONS)[number]["value"];

type Props = {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (
    reason: WorkerDeclineReason,
    note: string,
  ) => void;
};

function WorkerDeclineRequestModal({
  visible,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const [reason, setReason] =
    useState<WorkerDeclineReason | null>(null);

  const [note, setNote] = useState("");

  useEffect(() => {
    if (!visible) {
      setReason(null);
      setNote("");
    }
  }, [visible]);

  const requiresNote = reason === "other";
  const trimmedNote = note.trim();

  const canConfirm =
    !loading &&
    reason !== null &&
    (!requiresNote || trimmedNote.length > 0) &&
    trimmedNote.length <= 500;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!loading) onClose();
      }}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close decline dialog"
          disabled={loading}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <View
          accessibilityViewIsModal
          style={styles.modal}
        >
          <View style={styles.topRow}>
            <View style={styles.iconCircle}>
              <AppIcon
                name="error"
                role="worker"
                size="lg"
                color={Colors.error}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Keep request"
              disabled={loading}
              onPress={onClose}
              hitSlop={12}
              style={styles.closeButton}
            >
              <AppIcon
                name="close"
                role="worker"
                size="md"
                color={Colors.textSecondary}
              />
            </Pressable>
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            style={styles.title}
          >
            Decline request?
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={styles.description}
          >
            Please tell us why you can't take this job.
          </AppText>

          <ScrollView
            style={styles.optionsScroll}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {WORKER_DECLINE_REASONS.map((item) => {
              const selected = reason === item.value;

              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: selected,
                    disabled: loading,
                  }}
                  disabled={loading}
                  onPress={() => setReason(item.value)}
                  style={[
                    styles.option,
                    selected && styles.optionSelected,
                  ]}
                >
                  <View style={styles.radioOuter}>
                    {selected ? (
                      <View style={styles.radioInner} />
                    ) : null}
                  </View>

                  <AppText
                    variant="body"
                    style={styles.optionText}
                  >
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}

            {requiresNote ? (
              <View style={styles.noteContainer}>
                <AppText
                  variant="caption"
                  weight="bold"
                  style={styles.noteLabel}
                >
                  Tell us more
                </AppText>

                <TextInput
                  value={note}
                  onChangeText={setNote}
                  editable={!loading}
                  placeholder="Enter your reason..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                  accessibilityLabel="Other decline reason"
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
            ) : null}
          </ScrollView>

          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={onClose}
              style={({ pressed }) => [
                styles.keepButton,
                pressed && !loading && styles.pressed,
                loading && styles.disabled,
              ]}
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={styles.keepText}
              >
                Keep request
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                disabled: !canConfirm,
                busy: loading,
              }}
              disabled={!canConfirm}
              onPress={() => {
                if (!reason || !canConfirm) return;

                onConfirm(
                  reason,
                  requiresNote ? trimmedNote : "",
                );
              }}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && canConfirm && styles.pressed,
                !canConfirm && styles.disabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={styles.confirmText}
                >
                  Confirm decline
                </AppText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default memo(WorkerDeclineRequestModal);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.56)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "92%",
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 24,
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 20,
    color: Colors.textPrimary,
  },
  description: {
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 22,
  },
  optionsScroll: {
    flexShrink: 1,
  },
  optionsContent: {
    gap: 8,
    paddingBottom: 8,
  },
  option: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  optionSelected: {
    borderColor: WorkerColors.primary,
    backgroundColor: WorkerColors.primarySoft,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: WorkerColors.primary,
  },
  optionText: {
    flex: 1,
    color: Colors.textPrimary,
  },
  noteContainer: {
    marginTop: 8,
  },
  noteLabel: {
    marginBottom: 8,
    color: Colors.textPrimary,
  },
  noteInput: {
    minHeight: 100,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  characterCount: {
    marginTop: 6,
    textAlign: "right",
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  keepButton: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 8,
  },
  confirmButton: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.error,
    borderRadius: 16,
    paddingHorizontal: 8,
  },
  keepText: {
    color: Colors.textPrimary,
  },
  confirmText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  pressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
  },
  disabled: {
    opacity: FixxamTokens.motion.disabledOpacity,
  },
});