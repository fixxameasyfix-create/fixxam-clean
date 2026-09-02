import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { useAuth } from "@/hooks/useAuth";
import useUserProfile from "@/hooks/auth/useUserProfile";

type Props = {
  role: "customer" | "worker";
  children: React.ReactNode;
};

export default function RoleGuard({
  role,
  children,
}: Props) {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    profile,
    loading: profileLoading,
  } = useUserProfile();

  // Wait until auth is ready
  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // User is not authenticated.
  // Root layout / RoleResolver will redirect.
  if (!user) {
    return null;
  }

  // Wait until Firestore profile snapshot arrives.
  if (profileLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Profile not found.
  // RoleResolver will handle navigation.
  if (!profile) {
    return null;
  }

  // Wrong active role.
  // Keep a loader visible while RoleResolver redirects.
  if (profile.activeRole !== role) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
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