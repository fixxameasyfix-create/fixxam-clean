import React from "react";

import ProfileMenuItem from "@/components/profile/shared/ProfileMenuItem";
import ProfileSection from "@/components/profile/shared/ProfileSection";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  onOrders?: () => void;

  onSaved?: () => void;

  onLocation?: () => void;

  onPayments?: () => void;

  onNotifications?: () => void;

  onReviews?: () => void;

  onSupport?: () => void;

  onSettings?: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function CustomerMenu({
  onOrders,
  onSaved,
  onLocation,
  onPayments,
  onNotifications,
  onReviews,
  onSupport,
  onSettings,
}: Props) {
  return (
    <ProfileSection title="Account">
      <ProfileMenuItem
        title="Orders"
        icon="document-text-outline"
        onPress={onOrders}
      />

      <ProfileMenuItem
        title="Saved"
        icon="heart-outline"
        onPress={onSaved}
      />

      <ProfileMenuItem
  title="Location"
  subtitle="Use your current location"
  icon="location-outline"
  onPress={onLocation}
/>

      <ProfileMenuItem
        title="Payment Methods"
        icon="card-outline"
        onPress={onPayments}
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