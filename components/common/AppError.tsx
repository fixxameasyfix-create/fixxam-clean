import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import AppButton from "@/components/ui/AppButton";
import { AppText } from "@/components/ui";

type Props = {
  title?: string;
  message?: string;
  buttonText?: string;
  onRetry?: () => void;
};

export default function AppError({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  buttonText = "Try Again",
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={60}
          color="#EF4444"
        />
      </View>

      <AppText
        weight="bold"
        style={styles.title}
      >
        {title}
      </AppText>

      <AppText style={styles.message}>
        {message}
      </AppText>

      {onRetry && (
        <AppButton
          title={buttonText}
          onPress={onRetry}
        />
      )}
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
    backgroundColor: "#FEF2F2",
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
    lineHeight: 24,
    textAlign: "center",
  },
});