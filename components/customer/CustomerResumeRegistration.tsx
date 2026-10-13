import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import { FixxamTokens } from "@/theme";

type Props = {
  email: string;
  onContinue: () => void;
  onStartOver: () => void;
};

export default function CustomerResumeRegistration({
  email,
  onContinue,
  onStartOver,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <AppIcon
          name="refresh"
          role="customer"
          state="active"
          size="xl"
        />
      </View>

      <AppText
        variant="heading1"
        center
        style={styles.title}
      >
        Resume your registration?
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={styles.subtitle}
      >
        We found an incomplete registration
        for this email address.
      </AppText>

      <View style={styles.emailCard}>
        <View style={styles.emailIcon}>
          <AppIcon
            name="mail"
            role="customer"
            state="active"
            size="md"
          />
        </View>

        <View style={styles.emailContent}>
          <AppText
            variant="body"
            style={styles.email}
          >
            {email}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
          >
            Continue from where you left off.
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Continue Registration"
          role="customer"
          variant="primary"
          onPress={onContinue}
        />

        <AppButton
          title="Start Over"
          role="customer"
          variant="outline"
          onPress={onStartOver}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal:
      FixxamTokens.spacing.md,
    paddingTop:
      FixxamTokens.spacing.xl,
  },

  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF9F2",
    marginBottom:
      FixxamTokens.spacing.lg,
  },

  title: {
    marginBottom:
      FixxamTokens.spacing.sm,
  },

  subtitle: {
    maxWidth: 320,
    lineHeight: 22,
    marginBottom:
      FixxamTokens.spacing.lg,
  },

  emailCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding:
      FixxamTokens.spacing.md,
    borderRadius: 16,
    backgroundColor: "#F4F8FF",
    marginBottom:
      FixxamTokens.spacing.xl,
  },

  emailIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginRight:
      FixxamTokens.spacing.sm,
  },

  emailContent: {
    flex: 1,
  },

  email: {
    fontWeight: "600",
    marginBottom: 3,
  },

  actions: {
    width: "100%",
    gap: FixxamTokens.spacing.sm,
  },
});