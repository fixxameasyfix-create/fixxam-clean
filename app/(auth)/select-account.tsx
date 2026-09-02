import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  AppButton,
  AppScreen,
  AppText,
} from "@/components/ui";

import useSwitchRole from "@/hooks/auth/useSwitchRole";

export default function SelectAccount() {
  const {
    loading,
    switchRole,
  } = useSwitchRole();

  const continueAsCustomer = async () => {
    const success = await switchRole("customer");

    if (success) {
      router.replace("/(customer)/(tabs)/home");
    }
  };

  const continueAsWorker = async () => {
    const success = await switchRole("worker");

    if (success) {
      router.replace(
  "/(worker)/(tabs)/home"
);
}
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <AppText
          size="xl"
          weight="bold"
          center
        >
          Select Account
        </AppText>

        <AppText
          center
          style={styles.subtitle}
        >
          Choose how you want to continue
        </AppText>

        <AppButton
          title="Continue as Customer"
          variant="customer"
          loading={loading}
          onPress={continueAsCustomer}
        />

        <View style={styles.space} />

        <AppButton
          title="Continue as Worker"
          variant="worker"
          loading={loading}
          onPress={continueAsWorker}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 30,
    color: "#64748B",
  },

  space: {
    height: 16,
  },
});