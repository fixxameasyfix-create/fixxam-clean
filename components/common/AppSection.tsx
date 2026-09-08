import React, {
  memo,
  type ReactNode,
} from "react";

import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import AppText from "@/components/ui/AppText";

import {
  FixxamTokens,
} from "@/theme";

export interface AppSectionProps {
  title: string;

  subtitle?: string;

  rightComponent?: ReactNode;

  children: ReactNode;

  style?: StyleProp<ViewStyle>;

  contentStyle?: StyleProp<ViewStyle>;

  /*
   * Useful when the screen/container
   * already controls section spacing.
   */
  spacingBottom?: boolean;
}

function AppSection({
  title,
  subtitle,
  rightComponent,
  children,
  style,
  contentStyle,
  spacingBottom = true,
}: AppSectionProps) {
  return (
    <View
      style={[
        styles.container,
        spacingBottom
          ? styles.withBottomSpacing
          : null,
        style,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.left}>
          <AppText
            variant="heading3"
            numberOfLines={2}
          >
            {title}
          </AppText>

          {subtitle ? (
            <AppText
              variant="body"
              tone="secondary"
              style={styles.subtitle}
              numberOfLines={3}
            >
              {subtitle}
            </AppText>
          ) : null}
        </View>

        {rightComponent ? (
          <View style={styles.right}>
            {rightComponent}
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.content,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  withBottomSpacing: {
    marginBottom:
      FixxamTokens.spacing.section,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",

    marginBottom:
      FixxamTokens.spacing.md,
  },

  left: {
    flex: 1,
    minWidth: 0,
  },

  right: {
    flexShrink: 0,

    marginLeft:
      FixxamTokens.spacing.md,
  },

  subtitle: {
    marginTop:
      FixxamTokens.spacing.xs,
  },

  content: {
    width: "100%",
  },
});

export default memo(AppSection);