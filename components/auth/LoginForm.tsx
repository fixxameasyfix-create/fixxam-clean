import React, {
  memo,
  useCallback,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  AppButton,
  AppCard,
  AppInput,
  AppText,
} from "@/components/ui";

import PasswordField from "@/components/auth/PasswordField";

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

export interface LoginFormProps {
  identifier: string;

  setIdentifier: (
    value: string,
  ) => void;

  password: string;

  setPassword: (
    value: string,
  ) => void;

  loading: boolean;

  onLogin: () => void;

  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";

  identifierError?: string;

  passwordError?: string;
}

function LoginForm({
  identifier,
  setIdentifier,

  password,
  setPassword,

  loading,

  onLogin,

  role = "customer",
  variant,

  identifierError,
  passwordError,
}: LoginFormProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  const canSubmit =
    identifier.trim().length > 0 &&
    password.length > 0 &&
    !loading;

  const handleForgotPassword =
    useCallback(() => {
      if (loading) {
        return;
      }

      router.push(
        "/(auth)/forgot-password",
      );
    }, [loading]);

  const handleSubmit =
    useCallback(() => {
      if (!canSubmit) {
        return;
      }

      onLogin();
    }, [
      canSubmit,
      onLogin,
    ]);

  return (
    <View style={styles.wrapper}>
      <AppCard
        role={resolvedRole}
        variant="outlined"
        style={styles.card}
      >
        <AppInput
          role={resolvedRole}
          label="Email Address or Phone Number"
          placeholder="Enter email or phone number"
          value={identifier}
          onChangeText={setIdentifier}
          editable={!loading}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          keyboardType="email-address"
          returnKeyType="next"
          leftIconName="profile"
          error={identifierError}
          accessibilityLabel="Email address or phone number"
        />

        <View style={styles.passwordSection}>
          <PasswordField
            role={resolvedRole}
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            disabled={loading}
            error={passwordError}
            mode="current"
          />

          <AppText
            role={resolvedRole}
            variant="bodyMedium"
            tone={
              loading
                ? "muted"
                : "primary"
            }
            accessibilityRole="link"
            accessibilityLabel="Forgot password"
            onPress={
              loading
                ? undefined
                : handleForgotPassword
            }
            style={styles.forgotPassword}
          >
            Forgot Password?
          </AppText>
        </View>
      </AppCard>

      <AppButton
        title="Sign In"
        role={resolvedRole}
        loading={loading}
        disabled={!canSubmit}
        onPress={handleSubmit}
        style={styles.signInButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",

    paddingHorizontal:
      FixxamTokens.spacing.lg,
  },

  card: {
    width: "100%",

    padding:
      FixxamTokens.spacing.xl,
  },

  passwordSection: {
    marginTop:
      FixxamTokens.spacing.xl,
  },

  forgotPassword: {
    alignSelf: "flex-end",

    marginTop:
      FixxamTokens.spacing.sm,
  },

  signInButton: {
    width: "100%",

    marginTop:
      FixxamTokens.spacing.lg,
  },
});

export default memo(LoginForm);