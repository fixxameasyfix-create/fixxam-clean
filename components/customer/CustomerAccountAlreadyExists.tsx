import React, {
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  auth,
} from "@/firebase/config";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  showError,
  showSuccess,
} from "@/utils/showToast";

import { FixxamTokens } from "@/theme";

type Props = {
  email: string;
  onLogin: () => void;
};

export default function CustomerAccountAlreadyExists({
  email,
  onLogin,
}: Props) {
  const [
    resettingPassword,
    setResettingPassword,
  ] = useState(false);

  const handleResetPassword =
    async () => {
      if (!email.trim()) {
        return;
      }

      try {
        setResettingPassword(true);

        await sendPasswordResetEmail(
          auth,
          email.trim().toLowerCase(),
        );

        showSuccess(
          "Reset email sent",
          "Check your email for instructions to reset your password.",
        );
      } catch (error) {
        console.error(
          "CUSTOMER_PASSWORD_RESET_ERROR:",
          error,
        );

        showError(
          "Reset failed",
          "Unable to send the password reset email. Please try again.",
        );
      } finally {
        setResettingPassword(false);
      }
    };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <View style={styles.profileIcon}>
          <AppIcon
            name="profile"
            role="customer"
            state="active"
            size="xl"
          />
        </View>

        <View style={styles.warningBadge}>
          <AppIcon
            name="warning"
            role="customer"
            state="active"
            size="sm"
          />
        </View>
      </View>

      <AppText
        variant="heading1"
        center
        style={styles.title}
      >
        Account already exists
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={styles.subtitle}
      >
        This email address is already
        registered.
      </AppText>

      <View style={styles.actions}>
        <AppButton
          title="Go to Login"
          role="customer"
          variant="primary"
          onPress={onLogin}
        />

        <AppButton
          title="Reset Password"
          role="customer"
          variant="outline"
          loading={resettingPassword}
          disabled={resettingPassword}
          onPress={
            handleResetPassword
          }
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
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginBottom:
      FixxamTokens.spacing.lg,
  },

  profileIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF5FF",
  },

  warningBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4E5",
  },

  title: {
    marginBottom:
      FixxamTokens.spacing.sm,
  },

  subtitle: {
    marginBottom:
      FixxamTokens.spacing.xl,
  },

  actions: {
    width: "100%",
    gap: FixxamTokens.spacing.sm,
  },
});