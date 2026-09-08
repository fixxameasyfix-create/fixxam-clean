import React, { memo } from "react";

import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import AppIcon from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";

import {
  Colors,
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

export interface AppOfflineProps {
  onRetry: () => void;

  role?: FixxamRole;

  title?: string;

  message?: string;

  buttonText?: string;

  style?: StyleProp<ViewStyle>;
}

function AppOffline({
  onRetry,
  role = "customer",

  title = "No internet connection",

  message =
    "Check your connection and try again.",

  buttonText = "Try Again",

  style,
}: AppOfflineProps) {
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.container,
        style,
      ]}
    >
      <View style={styles.iconBox}>
        <AppIcon
          name="wifi-off"
          role={role}
          size="xl"
          color={Colors.warning}
          strokeWidth="medium"
        />
      </View>

      <AppText
        variant="heading3"
        center
        style={styles.title}
      >
        {title}
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={styles.message}
      >
        {message}
      </AppText>

      <AppButton
        title={buttonText}
        role={role}
        onPress={onRetry}
        leftIconName="refresh"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal:
      FixxamTokens.spacing.xxl,

    paddingVertical:
      FixxamTokens.spacing.xxxl,
  },

  iconBox: {
    width: 72,
    height: 72,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.lg,

    backgroundColor:
      Colors.warningSoft,
  },

  title: {
    maxWidth: 320,

    marginTop:
      FixxamTokens.spacing.lg,
  },

  message: {
    maxWidth: 340,

    marginTop:
      FixxamTokens.spacing.sm,
  },

  button: {
    width: "100%",
    maxWidth: 280,

    marginTop:
      FixxamTokens.spacing.xxl,
  },
});

export default memo(AppOffline);