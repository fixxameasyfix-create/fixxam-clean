import React, {
  memo,
  type ReactNode,
} from "react";

import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import AppIcon from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

export interface AppHeaderProps {
  title: string;

  subtitle?: string;

  role?: FixxamRole;

  showBackButton?: boolean;

  onBackPress?: () => void;

  rightComponent?: ReactNode;

  /*
   * Use false when AppScreen already
   * provides horizontal screen padding.
   */
  padded?: boolean;

  /*
   * Optional bottom separator.
   */
  showDivider?: boolean;

  style?: StyleProp<ViewStyle>;
}

function AppHeader({
  title,
  subtitle,
  role = "customer",
  showBackButton = false,
  onBackPress,
  rightComponent,
  padded = true,
  showDivider = false,
  style,
}: AppHeaderProps) {
  const colors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const canGoBack =
    showBackButton &&
    typeof onBackPress === "function";

  return (
    <View
      style={[
        styles.container,

        padded
          ? styles.padded
          : null,

        showDivider && {
          borderBottomWidth:
            StyleSheet.hairlineWidth,

          borderBottomColor:
            Colors.divider,
        },

        style,
      ]}
    >
      <View style={styles.left}>
        {showBackButton ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            disabled={!canGoBack}
            hitSlop={8}
            onPress={onBackPress}
            style={({ pressed }) => [
              styles.backButton,

              {
                backgroundColor:
                  pressed && canGoBack
                    ? colors.primarySoft
                    : Colors.iconBackground,
              },

              !canGoBack
                ? styles.disabled
                : null,
            ]}
          >
            <AppIcon
              name="back"
              role={role}
              size="sm"
              state={
                canGoBack
                  ? "default"
                  : "muted"
              }
              strokeWidth="medium"
            />
          </Pressable>
        ) : null}

        <View style={styles.textContainer}>
          <AppText
            variant="heading3"
            numberOfLines={1}
          >
            {title}
          </AppText>

          {subtitle ? (
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={styles.subtitle}
            >
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>

      {rightComponent ? (
        <View style={styles.right}>
          {rightComponent}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    minHeight:
      FixxamTokens.size.headerHeight,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingVertical:
      FixxamTokens.spacing.sm,

    backgroundColor:
      Colors.surface,
  },

  padded: {
    paddingHorizontal:
      FixxamTokens.spacing.screen,
  },

  left: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,
  },

  backButton: {
    width:
      FixxamTokens.size.minimumTouchTarget,

    height:
      FixxamTokens.size.minimumTouchTarget,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.iconButton,

    marginRight:
      FixxamTokens.spacing.sm,
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
  },

  subtitle: {
    marginTop:
      FixxamTokens.spacing.xxs,
  },

  right: {
    flexShrink: 0,

    marginLeft:
      FixxamTokens.spacing.md,

    alignItems: "center",
    justifyContent: "center",
  },

  disabled: {
    opacity:
      FixxamTokens.motion.disabledOpacity,
  },
});

export default memo(AppHeader);