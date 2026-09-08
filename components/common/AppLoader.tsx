import React, { memo } from "react";

import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import AppText from "@/components/ui/AppText";

import {
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

type LoaderSize =
  | "sm"
  | "md"
  | "lg";

export interface AppLoaderProps {
  message?: string;

  role?: FixxamRole;

  size?: LoaderSize;

  /*
   * Use true for whole-screen loading.
   * False is better inside cards/lists.
   */
  fullScreen?: boolean;

  style?: StyleProp<ViewStyle>;
}

const loaderSizes: Record<
  LoaderSize,
  number
> = {
  sm: 20,
  md: 28,
  lg: 36,
};

function AppLoader({
  message = "Please wait...",
  role = "customer",
  size = "md",
  fullScreen = true,
  style,
}: AppLoaderProps) {
  const colors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      style={[
        styles.container,

        fullScreen
          ? styles.fullScreen
          : styles.inline,

        style,
      ]}
    >
      <View
        style={[
          styles.spinnerBox,
          {
            backgroundColor:
              colors.primarySoft,
          },
        ]}
      >
        <ActivityIndicator
          size={loaderSizes[size]}
          color={colors.primary}
        />
      </View>

      {message ? (
        <AppText
          variant="bodyMedium"
          tone="secondary"
          center
          style={styles.message}
        >
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },

  fullScreen: {
    flex: 1,

    paddingHorizontal:
      FixxamTokens.spacing.xxl,

    paddingVertical:
      FixxamTokens.spacing.xxxl,
  },

  inline: {
    paddingVertical:
      FixxamTokens.spacing.xl,
  },

  spinnerBox: {
    width: 56,
    height: 56,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.lg,
  },

  message: {
    marginTop:
      FixxamTokens.spacing.md,

    maxWidth: 280,
  },
});

export default memo(AppLoader);