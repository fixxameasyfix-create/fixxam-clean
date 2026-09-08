import React, {
  type ReactNode,
} from "react";

import AppLoader from "@/components/common/AppLoader";

import { useAuth } from "@/hooks/useAuth";
import useUserProfile from "@/hooks/auth/useUserProfile";

import type { FixxamRole } from "@/theme";

export interface RoleGuardProps {
  role: FixxamRole;
  children: ReactNode;
}

export default function RoleGuard({
  role,
  children,
}: RoleGuardProps) {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    profile,
    loading: profileLoading,
  } = useUserProfile();

  /*
   * Wait until authentication state is ready.
   */
  if (authLoading) {
    return (
      <AppLoader
        role={role}
        message="Please wait..."
      />
    );
  }

  /*
   * User is not authenticated.
   * Root layout / RoleResolver handles navigation.
   */
  if (!user) {
    return null;
  }

  /*
   * Wait for Firestore profile.
   */
  if (profileLoading) {
    return (
      <AppLoader
        role={role}
        message="Loading profile..."
      />
    );
  }

  /*
   * Profile not found.
   * RoleResolver handles navigation.
   */
  if (!profile) {
    return null;
  }

  /*
   * Wrong active role.
   * Keep loader visible while RoleResolver redirects.
   */
  if (profile.activeRole !== role) {
    return (
      <AppLoader
        role={role}
        message="Switching workspace..."
      />
    );
  }

  return <>{children}</>;
}