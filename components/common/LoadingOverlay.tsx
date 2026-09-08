import React, { memo } from "react";

import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import AppLoader from "./AppLoader";

import {
  Colors,
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

export interface LoadingOverlayProps {
  visible: boolean;

  role?: FixxamRole;

  message?: string;

  style?: StyleProp<ViewStyle>;
}

function LoadingOverlay({
  visible,
  role = "customer",
  message = "Please wait...",
  style,
}: LoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      accessibilityViewIsModal
      style={[
        styles.overlay,
        style,
      ]}
    >
      <View style={styles.loaderCard}>
        <AppLoader
          role={role}
          size="md"
          fullScreen={false}
          message={message}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,

    zIndex: 999,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      Colors.overlayMedium,

    padding:
      FixxamTokens.spacing.xl,
  },

  loaderCard: {
    minWidth: 180,
    maxWidth: 280,

    paddingHorizontal:
      FixxamTokens.spacing.xl,

    paddingVertical:
      FixxamTokens.spacing.md,

    backgroundColor:
      Colors.surface,

    borderRadius:
      FixxamTokens.radius.lg,

    ...FixxamTokens.shadow.floating,
  },
});

export default memo(LoadingOverlay);