import React, { memo } from "react";

import AuthHeader from "@/components/auth/AuthHeader";

import type { FixxamRole } from "@/theme";

export interface LoginHeaderProps {
  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";
}

function LoginHeader({
  role = "customer",
  variant,
}: LoginHeaderProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  return (
    <AuthHeader
      title="Welcome back"
      subtitle="Sign in to continue with your account."
      icon="lock"
      role={resolvedRole}
    />
  );
}

export default memo(LoginHeader);