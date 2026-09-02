import React, { memo } from "react";
import { StyleSheet, View } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  message?: string | null;
};

function WorkerOfferMessage({
  message,
}: Props) {
  if (!message?.trim()) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={17}
        color="#64748B"
      />

      <AppText style={styles.message}>
        "{message.trim()}"
      </AppText>
    </View>
  );
}

export default memo(WorkerOfferMessage);

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  message: {
    flex: 1,
    marginLeft: 8,
    fontSize: 10.5,
    lineHeight: 16,
    color: "#475569",
  },
});