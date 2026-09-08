import React, {
  memo,
  useCallback,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

export interface LoginFooterProps {
  role?: FixxamRole;

  onBiometricPress?: () => void;

  biometricAvailable?: boolean;

  biometricLoading?: boolean;
}

function LoginFooter({
  role = "customer",

  onBiometricPress,

  biometricAvailable = false,

  biometricLoading = false,
}: LoginFooterProps) {
  const roleColors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const showBiometric =
    biometricAvailable &&
    Boolean(onBiometricPress);

  const handleBiometricPress =
    useCallback(() => {
      if (
        biometricLoading ||
        !onBiometricPress
      ) {
        return;
      }

      onBiometricPress();
    }, [
      biometricLoading,
      onBiometricPress,
    ]);

  const handleSignUp =
    useCallback(() => {
      router.push(
        "/(auth)/role-selection",
      );
    }, []);

  return (
    <View style={styles.container}>
      {showBiometric ? (
        <>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={styles.dividerRow}
          >
            <View style={styles.divider} />

            <AppText
              variant="caption"
              tone="muted"
              style={styles.orText}
            >
              OR
            </AppText>

            <View style={styles.divider} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue with biometrics"
            accessibilityState={{
              disabled:
                biometricLoading,
              busy:
                biometricLoading,
            }}
            disabled={biometricLoading}
            onPress={
              handleBiometricPress
            }
            style={({ pressed }) => [
              styles.biometricButton,

              {
                borderColor:
                  roleColors.border,
                backgroundColor:
                  roleColors.surface,
              },

              pressed &&
              !biometricLoading
                ? styles.pressed
                : null,

              biometricLoading
                ? styles.disabled
                : null,
            ]}
          >
            {biometricLoading ? (
              <ActivityIndicator
                size="small"
                color={
                  roleColors.primary
                }
              />
            ) : (
              <AppIcon
                name="fingerprint"
                role={role}
                size="xl"
                state="active"
                strokeWidth="medium"
              />
            )}
          </Pressable>

          <AppText
            variant="bodyMedium"
            tone="secondary"
            center
            style={styles.biometricText}
          >
            Continue with Biometrics
          </AppText>
        </>
      ) : null}

      <View style={styles.signUpRow}>
        <AppText
          variant="body"
          tone="secondary"
        >
          Don't have an account?
        </AppText>

        <AppText
          variant="bodyMedium"
          role={role}
          tone="primary"
          accessibilityRole="link"
          accessibilityLabel="Sign up"
          onPress={handleSignUp}
        >
          Sign Up
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    alignItems: "center",

    paddingHorizontal:
      FixxamTokens.spacing.lg,

    paddingBottom:
      FixxamTokens.spacing.xl,

    marginTop:
      FixxamTokens.spacing.xl,
  },

  dividerRow: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    marginBottom:
      FixxamTokens.spacing.lg,
  },

  divider: {
    flex: 1,

    height: StyleSheet.hairlineWidth,

    backgroundColor:
      Colors.divider,
  },

  orText: {
    marginHorizontal:
      FixxamTokens.spacing.md,

    letterSpacing:
      Typography.letterSpacing.wide,
  },

  biometricButton: {
    width:
      FixxamTokens.size.biometric,

    height:
      FixxamTokens.size.biometric,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    borderRadius:
      FixxamTokens.radius.full,

    ...FixxamTokens.shadow.floating,
  },

  biometricText: {
    marginTop:
      FixxamTokens.spacing.sm,
  },

  signUpRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    flexWrap: "wrap",

    gap:
      FixxamTokens.spacing.xs,

    marginTop:
      FixxamTokens.spacing.xl,
  },

  pressed: {
    opacity:
      FixxamTokens.motion
        .pressedOpacity,

    transform: [
      {
        scale:
          FixxamTokens.motion
            .scalePressed,
      },
    ],
  },

  disabled: {
    opacity:
      FixxamTokens.motion
        .disabledOpacity,
  },
});

export default memo(LoginFooter);