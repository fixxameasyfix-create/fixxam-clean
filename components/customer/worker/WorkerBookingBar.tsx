import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import { AppText } from "@/components/ui";

type Props = {
  selectedServices: number;
  hourlyRate: number;
  onBook: () => void;
  loading?: boolean;
};

export default function WorkerBookingBar({
  selectedServices,
  hourlyRate,
  onBook,
  loading = false,
}: Props) {
 return (
  <View style={styles.container}>
    <View style={styles.rowBetween}>
      <AppText style={styles.label}>
        Selected Services
      </AppText>

      <AppText
        weight="bold"
        style={styles.value}
      >
        {selectedServices}
      </AppText>
    </View>

    <View style={styles.rowBetween}>
      <AppText style={styles.label}>
        Estimated Rate
      </AppText>

      <AppText
        weight="bold"
        style={styles.value}
      >
        {selectedServices > 0
          ? `₦${hourlyRate.toLocaleString()}/hr`
          : "Per Hour"}
      </AppText>
    </View>

    <AppButton
      title="Book This Worker"
      onPress={onBook}
      loading={loading}
      variant="customer"
      style={styles.button}
      textStyle={styles.buttonText}
    />
  </View>
);

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",

    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,

    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,

    borderTopWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: -4,
    },

    elevation: 12,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    color: "#64748B",
  },

  value: {
    fontSize: 15,
    color: "#0F172A",
  },

  button: {
    marginTop: 8,
    height: 48,
    borderRadius: 14,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});