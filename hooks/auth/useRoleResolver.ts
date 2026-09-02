import { useEffect } from "react";
import { router } from "expo-router";

import { useAuth } from "@/hooks/useAuth";
import useUserProfile from "@/hooks/auth/useUserProfile";

export default function useRoleResolver() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
  profile,
  loading: profileLoading,
} = useUserProfile();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (profileLoading) {
  return;
}

    // Not logged in
    if (!user) {
      router.replace("/(auth)/role-selection");
      return;
    }

    // Wait until Firestore snapshot arrives
    if (!profile) {
      return;
    }

    // Active role takes priority
    if (profile.activeRole === "customer") {
      router.replace("/(customer)/(tabs)/home");
      return;
    }

    if (profile.activeRole === "worker") {
      router.replace("/(worker)/(tabs)/home");
      return;
    }

    // Fallback for old accounts
    if (profile.roles.length > 1) {
      router.replace("/(auth)/select-account");
      return;
    }

    if (profile.roles.includes("customer")) {
      router.replace("/(customer)/(tabs)/home");
      return;
    }

    if (profile.roles.includes("worker")) {
      router.replace("/(worker)/(tabs)/home");
      return;
    }

    router.replace("/(auth)/role-selection");
  }, [
    authLoading,
    user,
    profile,
  ]);
}