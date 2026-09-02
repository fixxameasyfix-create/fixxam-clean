import React from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  visible: boolean;

  workerName: string;

  service: string;

  location: string;

  phone: string;

  loading?: boolean;

  onCancel: () => void;

  onConfirm: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

export default function RequestConfirmationModal({
  visible,
  workerName,
  service,
  location,
  phone,
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  /*
   * IMPORTANT:
   *
   * Do NOT copy these props into useState.
   *
   * The modal always displays the latest values
   * coming from SpecialiseYourMarketScreen.
   */

  const displayWorkerName =
    workerName.trim() || "Worker";

  const displayService =
    service.trim() || "Not specified";

  const displayLocation =
    location.trim() || "Not specified";

  const displayPhone =
    phone.trim() || "Not specified";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!loading) {
          onCancel();
        }
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* ==================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="notifications-outline"
                size={23}
                color="#FF6B00"
              />
            </View>

            <View style={styles.headerText}>
              <AppText
                weight="bold"
                style={styles.title}
              >
                New Service Request
              </AppText>

              <AppText style={styles.subtitle}>
                Review your request before sending.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              WORKER
          ================================================== */}

          <View style={styles.workerCard}>
            <View style={styles.workerIcon}>
              <Ionicons
                name="person-outline"
                size={22}
                color="#FF6B00"
              />
            </View>

            <View style={styles.workerInfo}>
              <AppText style={styles.smallLabel}>
                Worker
              </AppText>

              <AppText
                weight="bold"
                numberOfLines={1}
                style={styles.workerName}
              >
                {displayWorkerName}
              </AppText>
            </View>
          </View>

          {/* ==================================================
              DETAILS
          ================================================== */}

          <View style={styles.details}>
            {/* SERVICE */}

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="briefcase-outline"
                  size={19}
                  color="#64748B"
                />
              </View>

              <View style={styles.detailContent}>
                <AppText style={styles.smallLabel}>
                  Service
                </AppText>

                <AppText
                  weight="bold"
                  numberOfLines={1}
                  style={styles.value}
                >
                  {displayService}
                </AppText>
              </View>
            </View>

            {/* LOCATION */}

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="location-outline"
                  size={19}
                  color="#64748B"
                />
              </View>

              <View style={styles.detailContent}>
                <AppText style={styles.smallLabel}>
                  Location
                </AppText>

                <AppText
                  weight="bold"
                  numberOfLines={3}
                  style={styles.value}
                >
                  {displayLocation}
                </AppText>
              </View>
            </View>

            {/* PHONE */}

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="call-outline"
                  size={19}
                  color="#64748B"
                />
              </View>

              <View style={styles.detailContent}>
                <AppText style={styles.smallLabel}>
                  Phone
                </AppText>

                <AppText
                  weight="bold"
                  numberOfLines={1}
                  style={styles.value}
                >
                  {displayPhone}
                </AppText>
              </View>
            </View>
          </View>

          {/* ==================================================
              INFORMATION
          ================================================== */}

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#FF6B00"
            />

            <AppText style={styles.infoText}>
              Your request will be sent to up to{" "}
              <AppText
                weight="bold"
                style={styles.infoBold}
              >
                5 customers
              </AppText>{" "}
              in{" "}
              <AppText
                weight="bold"
                style={styles.infoBold}
              >
                {displayLocation}
              </AppText>
              .
            </AppText>
          </View>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View style={styles.actions}>
            {/* CANCEL */}

            <Pressable
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Cancel request"
              accessibilityState={{
                disabled: loading,
              }}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed &&
                  !loading &&
                  styles.buttonPressed,
                loading &&
                  styles.disabledButton,
              ]}
            >
              <AppText
                weight="bold"
                style={styles.cancelText}
              >
                Cancel
              </AppText>
            </Pressable>

            {/* SEND */}

            <Pressable
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Send service request"
              accessibilityState={{
                busy: loading,
                disabled: loading,
              }}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.sendButton,
                pressed &&
                  !loading &&
                  styles.sendPressed,
                loading &&
                  styles.disabledSendButton,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name="send-outline"
                  size={18}
                  color="#FFFFFF"
                />
              )}

              <AppText
                weight="bold"
                style={styles.sendText}
              >
                {loading
                  ? "Sending..."
                  : "Send Request"}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,

    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 20,
    lineHeight: 25,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },

  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 11,
    marginBottom: 12,
  },

  workerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  workerInfo: {
    flex: 1,
    minWidth: 0,
  },

  smallLabel: {
    fontSize: 10,
    lineHeight: 14,
    color: "#94A3B8",
  },

  workerName: {
    marginTop: 1,
    fontSize: 15,
    lineHeight: 20,
    color: "#0F172A",
  },

  details: {
    gap: 5,
    marginBottom: 12,
  },

  detailRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 3,
  },

  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  detailContent: {
    flex: 1,
    minWidth: 0,
  },

  value: {
    marginTop: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#0F172A",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF7ED",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 2,
    marginBottom: 16,
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11.5,
    lineHeight: 18,
    color: "#64748B",
  },

  infoBold: {
    color: "#334155",
    fontSize: 11.5,
  },

  actions: {
    flexDirection: "row",
    gap: 9,
  },

  cancelButton: {
    flex: 0.85,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: "#475569",
    fontSize: 13,
  },

  sendButton: {
    flex: 1.15,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#FF6B00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,

    shadowColor: "#FF6B00",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  sendText: {
    color: "#FFFFFF",
    fontSize: 13,
  },

  buttonPressed: {
    backgroundColor: "#F1F5F9",
  },

  sendPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  disabledButton: {
    opacity: 0.5,
  },

  disabledSendButton: {
    opacity: 0.65,
  },
});