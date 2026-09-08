import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import AppCard from "@/components/ui/AppCard";
import AppIcon from "@/components/ui/AppIcon";
import type { AppIconName } from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";

import {
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

export interface RoleCardProps {
  title: string;

  description: string;

  icon: AppIconName;

  role?: FixxamRole;

  selected?: boolean;

  onPress: () => void;

  /*
   * Legacy support.
   * New code should use role instead.
   */
  color?: string;
}

function RoleCard({
  title,
  description,
  icon,
  role = "customer",
  selected = false,
  onPress,
  color,
}: RoleCardProps) {
  const roleColors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const accentColor =
    color ?? roleColors.primary;

  return (
    <AppCard
      role={role}
      variant={
        selected
          ? "accent"
          : "default"
      }
      onPress={onPress}
      accessibilityLabel={`${title}. ${description}`}
      style={styles.card}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  roleColors.primarySoft,
              },
            ]}
          >
            <AppIcon
              name={icon}
              role={role}
              size="md"
              color={accentColor}
              strokeWidth="medium"
            />
          </View>

          <View style={styles.textContainer}>
            <AppText
              variant="bodyLarge"
              weight="semibold"
              numberOfLines={1}
            >
              {title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={2}
              style={styles.description}
            >
              {description}
            </AppText>
          </View>
        </View>

        {selected ? (
          <View
            style={[
              styles.selectedIcon,
              {
                backgroundColor:
                  roleColors.primary,
              },
            ]}
          >
            <AppIcon
              name="check"
              role={role}
              size="xs"
              color={roleColors.white}
              strokeWidth="strong"
            />
          </View>
        ) : (
          <AppIcon
            name="next"
            role={role}
            size="sm"
            color={accentColor}
            strokeWidth="medium"
          />
        )}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight:
      FixxamTokens.size.roleCardHeight,

    padding:
      FixxamTokens.spacing.md,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,
  },

  iconContainer: {
    width:
      FixxamTokens.size.iconBox,

    height:
      FixxamTokens.size.iconBox,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.iconButton,
  },

  textContainer: {
    flex: 1,
    minWidth: 0,

    marginLeft:
      FixxamTokens.spacing.md,
  },

  description: {
    marginTop:
      FixxamTokens.spacing.xxs,
  },

  selectedIcon: {
    width: 28,
    height: 28,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.full,

    marginLeft:
      FixxamTokens.spacing.md,
  },
});

export default memo(RoleCard);