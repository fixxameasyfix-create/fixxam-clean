import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import AppButton from "@/components/ui/AppButton";
import { AppText } from "@/components/ui";

type Props = {
  onRetry: () => void;
};

export default function AppOffline({
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={60}
          color="#F59E0B"
        />
      </View>

      <AppText
        weight="bold"
        style={styles.title}
      >
        No Internet Connection
      </AppText>

      <AppText style={styles.message}>
        Please check your internet connection and try again.
      </AppText>

      <AppButton
        title="Try Again"
        onPress={onRetry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 24,
  },

  iconBox: {
    width: 120,
    height: 120,

    borderRadius: 32,

    backgroundColor: "#FFFBEB",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 24,
  },

  title: {
    fontSize: 22,

    color: "#0F172A",

    textAlign: "center",
  },

  message: {
    marginTop: 10,

    marginBottom: 28,

    fontSize: 15,

    color: "#64748B",

    textAlign: "center",

    lineHeight: 24,
  },
});