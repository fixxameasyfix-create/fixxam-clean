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

export interface AppSuccessProps {
  title?: string;

  message?: string;

  buttonText?: string;

  onPress?: () => void;

  role?: FixxamRole;

  style?: StyleProp<ViewStyle>;
}

function AppSuccess({
  title = "Success",
  message = "Your request was completed successfully.",
  buttonText = "Continue",
  onPress,
  role = "customer",
  style,
}: AppSuccessProps) {
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
          name="success"
          role={role}
          size="xl"
          state="success"
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

      {onPress ? (
        <AppButton
          title={buttonText}
          role={role}
          onPress={onPress}
          style={styles.button}
        />
      ) : null}
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
      Colors.successSoft,
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

export default memo(AppSuccess);