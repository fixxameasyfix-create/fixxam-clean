import { useEffect } from "react";
import { router, useSegments } from "expo-router";

import { useAuth } from "@/hooks/useAuth";
import useUserProfile from "@/hooks/auth/useUserProfile";

export default function RoleResolver() {
  const { user, loading: authLoading } = useAuth();

  const {
    profile,
    loading: profileLoading,
  } = useUserProfile();

  const segments = useSegments();

  useEffect(() => {
    if (authLoading || profileLoading) return;

    // Not logged in
    if (!user) {
      if (segments[0] !== "(auth)") {
        router.replace("/(auth)/login");
      }
      return;
    }

    // Wait until profile is available
    if (!profile) return;

    const currentGroup = segments[0];

    // Already in the correct group
    if (currentGroup === `(${profile.activeRole})`) {
      return;
    }

    if (profile.activeRole === "customer") {
      router.replace("/(customer)/(tabs)/home");
      return;
    }

    if (profile.activeRole === "worker") {
      router.replace("/(worker)/(tabs)/home");
    }
  }, [
    authLoading,
    profileLoading,
    user,
    profile?.activeRole,
    segments,
  ]);

  return null;
}