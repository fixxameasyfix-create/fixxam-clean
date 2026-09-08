import {
  useEffect,
  useMemo,
} from "react";

import {
  router,
  useSegments,
} from "expo-router";

import { useAuth } from "@/hooks/useAuth";
import useUserProfile from "@/hooks/auth/useUserProfile";

import type { FixxamRole } from "@/theme";

const CUSTOMER_HOME =
  "/(customer)/(tabs)/home" as const;

const WORKER_HOME =
  "/(worker)/(tabs)/home" as const;

const LOGIN_ROUTE =
  "/(auth)/login" as const;

const AUTH_GROUP = "(auth)";

function isFixxamRole(
  value: unknown,
): value is FixxamRole {
  return (
    value === "customer" ||
    value === "worker"
  );
}

export default function RoleResolver() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    profile,
    loading: profileLoading,
  } = useUserProfile();

  const segments = useSegments();

  const currentGroup =
    segments[0];

  /*
   * Logged-in users must be allowed
   * to complete Worker onboarding.
   *
   * Example:
   * /(auth)/worker/worker-signup
   */
  const isWorkerSignupRoute =
    useMemo(
      () =>
        segments[0] ===
          AUTH_GROUP &&
        segments[1] ===
          "worker" &&
        segments[2] ===
          "worker-signup",
      [segments],
    );

  useEffect(() => {
    /*
     * Do not navigate while auth/profile
     * state is still resolving.
     */
    if (
      authLoading ||
      profileLoading
    ) {
      return;
    }

    /*
     * Guest users are allowed to stay
     * anywhere inside the auth group.
     */
    if (!user) {
      if (
        currentGroup !==
        AUTH_GROUP
      ) {
        router.replace(
          LOGIN_ROUTE,
        );
      }

      return;
    }

    /*
     * Profile may still be created by
     * registration/onboarding flow.
     */
    if (!profile) {
      return;
    }

    /*
     * Allow an existing authenticated
     * customer to complete Worker
     * registration.
     */
    if (isWorkerSignupRoute) {
      return;
    }

    const activeRole =
      profile.activeRole;

    /*
     * Never navigate from an unexpected
     * or malformed role value.
     */
    if (
      !isFixxamRole(activeRole)
    ) {
      return;
    }

    /*
     * Already inside the correct
     * application role group.
     */
    if (
      currentGroup ===
      `(${activeRole})`
    ) {
      return;
    }

    if (
      activeRole ===
      "customer"
    ) {
      router.replace(
        CUSTOMER_HOME,
      );

      return;
    }

    router.replace(
      WORKER_HOME,
    );
  }, [
    authLoading,
    profileLoading,
    user,
    profile,
    currentGroup,
    isWorkerSignupRoute,
  ]);

  return null;
}