import React, { memo } from "react";

import AppBadge from "./AppBadge";

import type { AppIconName } from "@/components/ui/AppIcon";
import type { FixxamRole } from "@/theme";

export type AppStatusValue =
  | "online"
  | "offline"
  | "busy"
  | "verified"
  | "pending"
  | "accepted"
  | "inProgress"
  | "completed"
  | "cancelled";

type BadgeVariant =
  | "primary"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info";

type StatusConfig = {
  label: string;
  variant: BadgeVariant;
  icon: AppIconName;
};

const STATUS_CONFIG: Record<
  AppStatusValue,
  StatusConfig
> = {
  online: {
    label: "Online",
    variant: "success",
    icon: "success",
  },

  offline: {
    label: "Offline",
    variant: "neutral",
    icon: "close",
  },

  busy: {
    label: "Busy",
    variant: "warning",
    icon: "clock",
  },

  verified: {
    label: "Verified",
    variant: "info",
    icon: "verified",
  },

  pending: {
    label: "Pending",
    variant: "warning",
    icon: "clock",
  },

  accepted: {
    label: "Accepted",
    variant: "info",
    icon: "check",
  },

  inProgress: {
    label: "In Progress",
    variant: "primary",
    icon: "clock",
  },

  completed: {
    label: "Completed",
    variant: "success",
    icon: "success",
  },

  cancelled: {
    label: "Cancelled",
    variant: "error",
    icon: "error",
  },
};

export interface AppStatusProps {
  status: AppStatusValue;

  role?: FixxamRole;

  /*
   * Optional override when backend/UI
   * needs a custom display label.
   */
  label?: string;
}

function AppStatus({
  status,
  role = "customer",
  label,
}: AppStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <AppBadge
      label={label ?? config.label}
      role={role}
      variant={config.variant}
      icon={config.icon}
    />
  );
}

export default memo(AppStatus);