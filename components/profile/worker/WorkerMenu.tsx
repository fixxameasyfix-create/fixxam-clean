import React from "react";

import ProfileMenuItem from "@/components/profile/shared/ProfileMenuItem";
import ProfileSection from "@/components/profile/shared/ProfileSection";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  onJobs?: () => void;

  onProducts?: () => void;

  onOrders?: () => void;

  onEarnings?: () => void;

  onOnlineStatus?: () => void;

  onLocation?: () => void;

  onNotifications?: () => void;

  onReviews?: () => void;

  onSupport?: () => void;

  onSettings?: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function WorkerMenu({
  onJobs,
  onProducts,
  onOrders,
  onEarnings,
  onOnlineStatus,
  onLocation,
  onNotifications,
  onReviews,
  onSupport,
  onSettings,
}: Props) {
  return (
    <ProfileSection title="Business">
      <ProfileMenuItem
        role="worker"
        title="My Jobs"
        icon="briefcase-outline"
        onPress={onJobs}
      />

      <ProfileMenuItem
        role="worker"
        title="My Products"
        icon="storefront-outline"
        onPress={onProducts}
      />

      <ProfileMenuItem
        role="worker"
        title="Orders"
        icon="document-text-outline"
        onPress={onOrders}
      />

      <ProfileMenuItem
        role="worker"
        title="Earnings"
        icon="wallet-outline"
        onPress={onEarnings}
      />

      <ProfileMenuItem
        role="worker"
        title="Online / Offline"
        icon="radio-outline"
        onPress={onOnlineStatus}
      />

      <ProfileMenuItem
        role="worker"
        title="Location"
        icon="location-outline"
        onPress={onLocation}
      />

      <ProfileMenuItem
        role="worker"
        title="Notifications"
        icon="notifications-outline"
        onPress={onNotifications}
      />

      <ProfileMenuItem
        role="worker"
        title="Reviews"
        icon="star-outline"
        onPress={onReviews}
      />

      <ProfileMenuItem
        role="worker"
        title="Help & Support"
        icon="help-circle-outline"
        onPress={onSupport}
      />

      <ProfileMenuItem
        role="worker"
        title="Settings"
        icon="settings-outline"
        onPress={onSettings}
      />
    </ProfileSection>
  );
}