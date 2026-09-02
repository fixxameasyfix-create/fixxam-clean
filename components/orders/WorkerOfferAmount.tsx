import React, { memo } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  label: string;
  amount: number;
};

function WorkerOfferAmount({
  label,
  amount,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.label}
      >
        {label}
      </AppText>

      <AppText
        weight="bold"
        style={styles.amount}
      >
        ₦{amount.toLocaleString("en-NG")}
      </AppText>
    </View>
  );
}

export default memo(WorkerOfferAmount);

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    alignItems: "center",
  },

  label: {
    fontSize: 9,
    letterSpacing: 0.8,
    color: "#64748B",
  },

  amount: {
    marginTop: 5,
    fontSize: 25,
    color: "#2563EB",
  },
});