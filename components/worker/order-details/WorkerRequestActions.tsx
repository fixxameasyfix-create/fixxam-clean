import React from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  loading?: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export default function WorkerRequestActions({
  loading = false,
  onAccept,
  onDecline,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        New Service Request
      </AppText>

      <AppText
        style={styles.description}
      >
        Review the customer request before
        accepting the job.
      </AppText>

      <View style={styles.actions}>
        <Pressable
          onPress={onDecline}
          disabled={loading}
          style={[
            styles.declineButton,
            loading &&
              styles.disabledButton,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Decline service request"
          accessibilityState={{
            disabled: loading,
            busy: loading,
          }}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#DC2626"
            />
          ) : (
            <>
              <Ionicons
                name="close-circle-outline"
                size={20}
                color="#DC2626"
              />

              <AppText
                weight="bold"
                style={styles.declineText}
              >
                DECLINE
              </AppText>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={onAccept}
          disabled={loading}
          style={[
            styles.acceptButton,
            loading &&
              styles.disabledButton,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Accept service request"
          accessibilityState={{
            disabled: loading,
            busy: loading,
          }}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFFFFF"
              />

              <AppText
                weight="bold"
                style={styles.acceptText}
              >
                ACCEPT REQUEST
              </AppText>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  title: {
    fontSize: 17,
    color: "#0F172A",
  },

  description: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  declineButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  acceptButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  declineText: {
    fontSize: 12,
    color: "#DC2626",
  },

  acceptText: {
    fontSize: 12,
    color: "#FFFFFF",
  },

  disabledButton: {
    opacity: 0.6,
  },
});