import React, { memo } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  visible: boolean;

  customerOfferAmount?: number | null;

  amount: string;
  message: string;

  submitting?: boolean;

  onAmountChange: (value: string) => void;
  onMessageChange: (value: string) => void;

  onClose: () => void;
  onSubmit: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

const WorkerCounterOfferModal = memo(
  function WorkerCounterOfferModal({
    visible,
    customerOfferAmount,
    amount,
    message,
    submitting = false,
    onAmountChange,
    onMessageChange,
    onClose,
    onSubmit,
  }: Props) {
    const formattedCustomerOffer =
      typeof customerOfferAmount ===
        "number" &&
      Number.isFinite(
        customerOfferAmount,
      ) &&
      customerOfferAmount > 0
        ? `₦${customerOfferAmount.toLocaleString(
            "en-NG",
          )}`
        : "—";

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.counterModal}>
            {/* ==================================================
                HANDLE
            ================================================== */}

            <View style={styles.modalHandle} />

            {/* ==================================================
                HEADER
            ================================================== */}

            <View style={styles.modalHeader}>
              <View
                style={
                  styles.modalHeaderIcon
                }
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={23}
                  color="#2563EB"
                />
              </View>

              <View
                style={
                  styles.modalHeaderContent
                }
              >
                <AppText
                  weight="bold"
                  style={styles.modalTitle}
                >
                  Send Counter Offer
                </AppText>

                <AppText
                  style={styles.modalSubtitle}
                >
                  Send a new price to the
                  customer.
                </AppText>
              </View>
            </View>

            {/* ==================================================
                CUSTOMER OFFER
            ================================================== */}

            <View
              style={
                styles.customerOfferReference
              }
            >
              <AppText
                style={styles.referenceLabel}
              >
                CUSTOMER OFFER
              </AppText>

              <AppText
                weight="bold"
                style={styles.referenceAmount}
              >
                {formattedCustomerOffer}
              </AppText>
            </View>

            {/* ==================================================
                AMOUNT LABEL
            ================================================== */}

            <AppText
              weight="bold"
              style={styles.inputLabel}
            >
              YOUR NEW OFFER
            </AppText>

            {/* ==================================================
                AMOUNT INPUT
            ================================================== */}

            <View
              style={
                styles.amountInputContainer
              }
            >
              <AppText
                weight="bold"
                style={styles.currencySymbol}
              >
                ₦
              </AppText>

              <TextInput
                value={amount}
                onChangeText={onAmountChange}
                placeholder="Enter amount"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                editable={!submitting}
                maxLength={12}
                autoCorrect={false}
                style={styles.amountInput}
              />
            </View>

            {/* ==================================================
                MESSAGE LABEL
            ================================================== */}

            <AppText
              weight="bold"
              style={styles.inputLabel}
            >
              MESSAGE
            </AppText>

            {/* ==================================================
                MESSAGE INPUT
            ================================================== */}

            <TextInput
              value={message}
              onChangeText={onMessageChange}
              placeholder="Explain your new offer..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              editable={!submitting}
              maxLength={300}
              autoCorrect
              style={styles.messageInput}
            />

            <AppText
              style={styles.characterCount}
            >
              {message.length}/300
            </AppText>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <View style={styles.modalActions}>
              <Pressable
                onPress={onClose}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Cancel counter offer"
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  submitting &&
                    styles.disabledButton,
                  pressed &&
                    !submitting &&
                    styles.buttonPressed,
                ]}
              >
                <AppText
                  weight="bold"
                  style={styles.modalCancelText}
                >
                  CANCEL
                </AppText>
              </Pressable>

              <Pressable
                onPress={onSubmit}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Send counter offer"
                style={({ pressed }) => [
                  styles.modalSendButton,
                  submitting &&
                    styles.disabledButton,
                  pressed &&
                    !submitting &&
                    styles.buttonPressed,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="send-outline"
                      size={17}
                      color="#FFFFFF"
                    />

                    <AppText
                      weight="bold"
                      style={styles.modalSendText}
                    >
                      SEND OFFER
                    </AppText>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

WorkerCounterOfferModal.displayName =
  "WorkerCounterOfferModal";

export default WorkerCounterOfferModal;

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  /* ==========================================================
     OVERLAY
  ========================================================== */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },

  /* ==========================================================
     MODAL
  ========================================================== */

  counterModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },

  modalHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    marginBottom: 18,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  modalHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  modalHeaderContent: {
    flex: 1,
    marginLeft: 12,
  },

  modalTitle: {
    fontSize: 17,
    color: "#0F172A",
  },

  modalSubtitle: {
    marginTop: 3,
    fontSize: 10.5,
    lineHeight: 16,
    color: "#64748B",
  },

  /* ==========================================================
     CUSTOMER OFFER
  ========================================================== */

  customerOfferReference: {
    marginTop: 18,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  referenceLabel: {
    fontSize: 8,
    letterSpacing: 1,
    color: "#94A3B8",
  },

  referenceAmount: {
    marginTop: 4,
    fontSize: 18,
    color: "#2563EB",
  },

  /* ==========================================================
     INPUTS
  ========================================================== */

  inputLabel: {
    marginTop: 17,
    marginBottom: 7,
    fontSize: 9,
    letterSpacing: 0.8,
    color: "#64748B",
  },

  amountInputContainer: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  currencySymbol: {
    fontSize: 18,
    color: "#2563EB",
    marginRight: 7,
  },

  amountInput: {
    flex: 1,
    height: "100%",
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  messageInput: {
    minHeight: 92,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    lineHeight: 18,
    color: "#0F172A",
  },

  characterCount: {
    alignSelf: "flex-end",
    marginTop: 4,
    fontSize: 8.5,
    color: "#94A3B8",
  },

  /* ==========================================================
     ACTIONS
  ========================================================== */

  modalActions: {
    marginTop: 20,
    flexDirection: "row",
    gap: 9,
  },

  modalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCancelText: {
    fontSize: 9.5,
    color: "#475569",
  },

  modalSendButton: {
    flex: 1.4,
    height: 48,
    borderRadius: 13,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  modalSendText: {
    fontSize: 9.5,
    color: "#FFFFFF",
  },

  /* ==========================================================
     STATES
  ========================================================== */

  disabledButton: {
    opacity: 0.45,
  },

  buttonPressed: {
    opacity: 0.9,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});