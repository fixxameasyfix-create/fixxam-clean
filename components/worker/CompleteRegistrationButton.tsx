import React from "react";
import { AppButton } from "@/components/ui";

type Props = {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
};

export default function CompleteRegistrationButton({
  onPress,
  loading,
  disabled,
}: Props) {
  return (
    <AppButton
      title="Complete Registration"
      variant="worker"
      loading={loading}
      disabled={disabled}
      onPress={onPress}
    />
  );
}