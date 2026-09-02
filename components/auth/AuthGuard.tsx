import React from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  Redirect,
} from "expo-router";

import {
  useAuth,
} from "@/hooks/useAuth";

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({
  children,
}: Props) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});