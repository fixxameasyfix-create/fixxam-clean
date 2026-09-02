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
  onPress?: () => void;
};

export default function AppSuccess({
  title = "Success",
  message = "Your request was completed successfully.",
  buttonText = "Continue",
  onPress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons
          name="check-circle"
          size={60}
          color="#22C55E"
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

      {onPress && (
        <AppButton
          title={buttonText}
          onPress={onPress}
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
    backgroundColor: "#ECFDF5",
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