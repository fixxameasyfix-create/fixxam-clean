import React, { memo } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import AppIcon from "./AppIcon";
import AppText from "./AppText";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info";

type ToastProps = {
  text1?: string;
  text2?: string;
};

type ToastTheme = {
  icon: string;
  background: string;
  border: string;
  iconBackground: string;
};

const toastThemes: Record<
  ToastType,
  ToastTheme
> = {
  success: {
    icon: Colors.success,
    background: Colors.surface,
    border: "#DCFCE7",
    iconBackground: Colors.successSoft,
  },

  error: {
    icon: Colors.error,
    background: Colors.surface,
    border: "#FEE2E2",
    iconBackground: Colors.errorSoft,
  },

  warning: {
    icon: Colors.warning,
    background: Colors.surface,
    border: "#FEF3C7",
    iconBackground: Colors.warningSoft,
  },

  info: {
    icon: Colors.info,
    background: Colors.surface,
    border: "#E0F2FE",
    iconBackground: Colors.infoSoft,
  },
};

const toastIcons: Record<
  ToastType,
  "success" | "error" | "warning" | "info"
> = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
};

function ToastCard({
  type,
  text1,
  text2,
}: ToastProps & {
  type: ToastType;
}) {
  const theme = toastThemes[type];

  return (
    <View
      style={[
        styles.toast,
        {
          backgroundColor:
            theme.background,

          borderColor:
            theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              theme.iconBackground,
          },
        ]}
      >
        <AppIcon
          name={toastIcons[type]}
          size="sm"
          color={theme.icon}
          strokeWidth="medium"
        />
      </View>

      <View style={styles.content}>
        {text1 ? (
          <AppText
            variant="label"
            numberOfLines={2}
          >
            {text1}
          </AppText>
        ) : null}

        {text2 ? (
          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={3}
            style={
              text1
                ? styles.description
                : undefined
            }
          >
            {text2}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const MemoizedToastCard =
  memo(ToastCard);

export const toastConfig = {
  success: ({
    text1,
    text2,
  }: ToastProps) => (
    <MemoizedToastCard
      type="success"
      text1={text1}
      text2={text2}
    />
  ),

  error: ({
    text1,
    text2,
  }: ToastProps) => (
    <MemoizedToastCard
      type="error"
      text1={text1}
      text2={text2}
    />
  ),

  warning: ({
    text1,
    text2,
  }: ToastProps) => (
    <MemoizedToastCard
      type="warning"
      text1={text1}
      text2={text2}
    />
  ),

  info: ({
    text1,
    text2,
  }: ToastProps) => (
    <MemoizedToastCard
      type="info"
      text1={text1}
      text2={text2}
    />
  ),
};

const styles = StyleSheet.create({
  toast: {
    width: "92%",
    maxWidth: 420,

    minHeight: 58,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal:
      FixxamTokens.spacing.md,

    paddingVertical:
      FixxamTokens.spacing.sm,

    borderWidth: 1,

    borderRadius:
      FixxamTokens.radius.md,

    ...FixxamTokens.shadow.floating,
  },

  iconContainer: {
    width: 38,
    height: 38,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.md,

    marginRight:
      FixxamTokens.spacing.md,
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  description: {
    marginTop:
      FixxamTokens.spacing.xxs,
  },
});

export default toastConfig;