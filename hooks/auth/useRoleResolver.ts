import { useEffect, useState } from "react";
import { router } from "expo-router";

import { useAuth } from "@/hooks/useAuth";
import useUserProfile from "@/hooks/auth/useUserProfile";

export type AppRole = "customer" | "worker";

type RoleResolverError =
  | "PROFILE_NOT_FOUND"
  | "NO_VALID_ROLE"
  | "UNKNOWN";

type UseRoleResolverResult = {
  loading: boolean;
  error: RoleResolverError | null;
};

export default function useRoleResolver(): UseRoleResolverResult {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    profile,
    loading: profileLoading,
  } = useUserProfile();

  const [error, setError] =
    useState<RoleResolverError | null>(null);

  useEffect(() => {
    if (authLoading || profileLoading) {
      return;
    }

    if (!user) {
      router.replace("/(auth)/role-selection");
      return;
    }

    /*
     * Firebase authentication exists,
     * but the Firestore user profile does not.
     *
     * Never assume customer.
     */
    if (!profile) {
      console.error(
        "ROLE_RESOLVER_PROFILE_NOT_FOUND:",
        {
          uid: user.uid,
        },
      );

      setError("PROFILE_NOT_FOUND");
      return;
    }

    const roles: AppRole[] = Array.from(
      new Set(
        (
          Array.isArray(profile.roles)
            ? profile.roles
            : []
        ).filter(
          (role): role is AppRole =>
            role === "customer" ||
            role === "worker",
        ),
      ),
    );

    /*
     * No valid role.
     *
     * This is an invalid/incomplete account,
     * not a customer account.
     */
    if (roles.length === 0) {
  /*
   * Do not treat an empty role list as a customer account
   * and do not throw a console error here.
   *
   * AppNavigation remains the source of truth for the actual
   * authenticated route. This resolver simply waits for a
   * valid role to become available.
   */
  setError(null);
  return;
}

    setError(null);

    /*
     * Customer + Worker
     */
    if (
      roles.includes("customer") &&
      roles.includes("worker")
    ) {
      router.replace(
        "/(auth)/select-account",
      );
      return;
    }

    /*
     * Customer only
     */
    if (
      roles.length === 1 &&
      roles[0] === "customer"
    ) {
      router.replace(
        "/(customer)/(tabs)/home",
      );
      return;
    }

    /*
     * Worker only
     */
    if (
      roles.length === 1 &&
      roles[0] === "worker"
    ) {
      router.replace(
        "/(worker)/(tabs)/home",
      );
      return;
    }

    console.error(
      "ROLE_RESOLVER_UNKNOWN_ROLE_STATE:",
      {
        uid: user.uid,
        roles,
      },
    );

    setError("UNKNOWN");
  }, [
    authLoading,
    profile,
    profileLoading,
    user,
  ]);

  return {
    loading:
      authLoading ||
      profileLoading,

    error,
  };
}