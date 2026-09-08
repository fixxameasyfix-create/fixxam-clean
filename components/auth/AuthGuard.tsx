import React, { type ReactNode } from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { Redirect } from "expo-router";

import { useAuth } from "@/hooks/useAuth";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

export interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Checking authentication"
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color={Colors.textSecondary}
        />
      </View>
    );
  }

  if (!user) {
    return (
      <Redirect href="/(auth)/login" />
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      Colors.background,

    padding:
      FixxamTokens.spacing.xl,
  },
});