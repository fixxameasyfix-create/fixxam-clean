import React, { memo } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import AppIcon from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

type Props = {
  title: string;
  subtitle: string;

  icon?: string;

  role?: FixxamRole;

  // Legacy support
  variant?: "customer" | "worker";
};

function AuthHeader({
  title,
  subtitle,
  icon = "profile",
  role = "customer",
  variant,
}: Props) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  return (
    <View style={styles.container}>
      <AppIcon
        name={icon}
        role={resolvedRole}
        state="active"
        size="xl"
      />

      <AppText
        variant="heading1"
        center
        style={styles.title}
      >
        {title}
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={styles.subtitle}
      >
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",

    marginBottom:
      FixxamTokens.spacing.xxl,
  },

  title: {
    marginTop:
      FixxamTokens.spacing.md,

    marginBottom:
      FixxamTokens.spacing.xs,
  },

  subtitle: {
    maxWidth: 320,
  },
});

export default memo(AuthHeader);