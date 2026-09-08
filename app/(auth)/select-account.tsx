import React, {
  useCallback,
  useState,
} from "react";

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

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

export default function SelectAccount() {
  const {
    loading,
    switchRole,
  } = useSwitchRole();

  const [
    pendingRole,
    setPendingRole,
  ] =
    useState<FixxamRole | null>(
      null,
    );

  const handleSwitchRole =
    useCallback(
      async (
        role: FixxamRole,
      ) => {
        if (loading) {
          return;
        }

        try {
          setPendingRole(role);

          const success =
            await switchRole(role);

          if (!success) {
            return;
          }

          if (role === "customer") {
            router.replace(
              "/(customer)/(tabs)/home",
            );

            return;
          }

          router.replace(
            "/(worker)/(tabs)/home",
          );
        } finally {
          setPendingRole(null);
        }
      },
      [
        loading,
        switchRole,
      ],
    );

  return (
    <AppScreen
      padded
      contentContainerStyle={
        styles.screen
      }
    >
      <View style={styles.container}>
        <View style={styles.heading}>
          <AppText
            variant="heading1"
            center
          >
            Select Account
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={styles.subtitle}
          >
            Choose how you want to use
            Fixxam.
          </AppText>
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Continue as Customer"
            role="customer"
            leftIconName="profile"
            loading={
              loading &&
              pendingRole ===
                "customer"
            }
            disabled={loading}
            onPress={() =>
              void handleSwitchRole(
                "customer",
              )
            }
          />

          <AppButton
            title="Continue as Worker"
            role="worker"
            leftIconName="professional"
            loading={
              loading &&
              pendingRole ===
                "worker"
            }
            disabled={loading}
            onPress={() =>
              void handleSwitchRole(
                "worker",
              )
            }
          />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
  },

  container: {
    flex: 1,

    justifyContent: "center",
  },

  heading: {
    alignItems: "center",

    marginBottom:
      FixxamTokens.spacing.xxl,
  },

  subtitle: {
    marginTop:
      FixxamTokens.spacing.sm,
  },

  actions: {
    width: "100%",

    gap:
      FixxamTokens.spacing.lg,
  },
});