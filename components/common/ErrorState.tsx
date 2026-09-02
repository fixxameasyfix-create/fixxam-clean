import React from "react";

import { View, StyleSheet } from "react-native";

import { AppButton, AppText } from "@/components/ui";

type Props = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorState({
  message,
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText
        center
        size="lg"
        weight="semibold"
        color="#DC2626"
      >
        {message}
      </AppText>

      {onRetry && (
        <View style={styles.button}>
          <AppButton
            title="Try Again"
            onPress={onRetry}
          />
        </View>
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

  button: {
    width: 180,
    marginTop: 16,
  },
});