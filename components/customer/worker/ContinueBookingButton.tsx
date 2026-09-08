import React, {
  memo,
} from "react";

import {
  StyleSheet,
} from "react-native";

import {
  AppButton,
} from "@/components/ui";

import {
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  disabled: boolean;

  onPress: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function ContinueBookingButton({
  disabled,
  onPress,
}: Props) {
  return (
    <AppButton
      title="Continue Booking"
      role="customer"
      disabled={
        disabled
      }
      onPress={
        onPress
      }
      style={
        styles.button
      }
    />
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    button: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.xxxl,

      minHeight:
        FixxamTokens.size
          .buttonHeight,
    },
  });

export default memo(
  ContinueBookingButton,
);