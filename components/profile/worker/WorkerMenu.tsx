import React from "react";

import ProfileSection from "@/components/profile/shared/ProfileSection";
import ProfileMenuItem from "@/components/profile/shared/ProfileMenuItem";

type Props = {
  onJobs?: () => void;
  onProducts?: () => void;
  onOrders?: () => void;
  onEarnings?: () => void;
  onOnlineStatus?: () => void;
  onBusinessAddress?: () => void;
  onNotifications?: () => void;
  onReviews?: () => void;
  onSupport?: () => void;
  onSettings?: () => void;
};

export default function WorkerMenu({
  onJobs,
  onProducts,
  onOrders,
  onEarnings,
  onOnlineStatus,
  onBusinessAddress,
  onNotifications,
  onReviews,
  onSupport,
  onSettings,
}: Props) {
  return (
    <ProfileSection title="Business">
      <ProfileMenuItem
        title="My Jobs"
        icon="briefcase-outline"
        onPress={onJobs}
      />

      <ProfileMenuItem
        title="My Products"
        icon="storefront-outline"
        onPress={onProducts}
      />

      <ProfileMenuItem
        title="Orders"
        icon="document-text-outline"
        onPress={onOrders}
      />

      <ProfileMenuItem
        title="Earnings"
        icon="wallet-outline"
        onPress={onEarnings}
      />

      <ProfileMenuItem
        title="Online / Offline"
        icon="radio-outline"
        onPress={onOnlineStatus}
      />

      <ProfileMenuItem
        title="Business Address"
        icon="location-outline"
        onPress={onBusinessAddress}
      />

      <ProfileMenuItem
        title="Notifications"
        icon="notifications-outline"
        onPress={onNotifications}
      />

      <ProfileMenuItem
        title="Reviews"
        icon="star-outline"
        onPress={onReviews}
      />

      <ProfileMenuItem
        title="Help & Support"
        icon="help-circle-outline"
        onPress={onSupport}
      />

      <ProfileMenuItem
        title="Settings"
        icon="settings-outline"
        onPress={onSettings}
      />
    </ProfileSection>
  );
}