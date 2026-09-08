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
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

export interface AppEmptyProps {
  title: string;

  message: string;

  icon?: string;

  role?: FixxamRole;

  buttonText?: string;

  onPress?: () => void;

  iconColor?: string;

  iconBackgroundColor?: string;

  style?: StyleProp<ViewStyle>;
}

function AppEmpty({
  icon = "package",

  title,
  message,

  role = "customer",

  buttonText,
  onPress,

  iconColor,
  iconBackgroundColor,

  style,
}: AppEmptyProps) {
  const colors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const showAction =
    Boolean(buttonText) &&
    typeof onPress === "function";

  return (
    <View
      style={[
        styles.container,
        style,
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor:
              iconBackgroundColor ??
              colors.primarySoft,
          },
        ]}
      >
        <AppIcon
          name={icon}
          role={role}
          size="xl"
          color={
            iconColor ??
            colors.primary
          }
          strokeWidth="regular"
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

      {showAction ? (
        <AppButton
          title={buttonText!}
          role={role}
          onPress={onPress!}
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
  },

  title: {
    marginTop:
      FixxamTokens.spacing.lg,

    maxWidth: 320,
  },

  message: {
    marginTop:
      FixxamTokens.spacing.sm,

    maxWidth: 340,
  },

  button: {
    width: "100%",
    maxWidth: 280,

    marginTop:
      FixxamTokens.spacing.xxl,
  },
});

export default memo(AppEmpty);