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

import { FixxamTokens } from "@/theme";

export interface SectionHeaderProps {
  title: string;

  subtitle?: string;

  rightComponent?: ReactNode;

  style?: StyleProp<ViewStyle>;

  /*
   * Controls spacing below the header.
   */
  withBottomSpacing?: boolean;
}

function SectionHeader({
  title,
  subtitle,
  rightComponent,
  style,
  withBottomSpacing = true,
}: SectionHeaderProps) {
  return (
    <View
      style={[
        styles.container,

        withBottomSpacing
          ? styles.bottomSpacing
          : null,

        style,
      ]}
    >
      <View style={styles.textContainer}>
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
            numberOfLines={3}
            style={styles.subtitle}
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
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  bottomSpacing: {
    marginBottom:
      FixxamTokens.spacing.md,
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
  },

  subtitle: {
    marginTop:
      FixxamTokens.spacing.xs,
  },

  right: {
    flexShrink: 0,

    marginLeft:
      FixxamTokens.spacing.md,
  },
});

export default memo(SectionHeader);