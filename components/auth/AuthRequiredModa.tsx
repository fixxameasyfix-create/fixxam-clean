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
  AppIcon,
  AppModal,
  AppText,
} from "@/components/ui";

import {
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

export interface AuthRequiredModalProps {
  visible: boolean;

  title?: string;

  description?: string;

  onClose: () => void;

  role?: FixxamRole;

  showWorkerSignup?: boolean;
}

function AuthRequiredModal({
  visible,

  title = "Login required",

  description =
    "Sign in to your account to continue.",

  onClose,

  role = "customer",

  showWorkerSignup = true,
}: AuthRequiredModalProps) {
  const colors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const handleLogin =
    useCallback(() => {
      onClose();

      router.push(
        "/(auth)/login",
      );
    }, [onClose]);

  const handleWorkerSignUp =
    useCallback(() => {
      onClose();

      router.push(
        "/(auth)/worker/worker-signup",
      );
    }, [onClose]);

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      role={role}
      dismissOnBackdrop
      animationType="fade"
      cardStyle={styles.card}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                colors.primarySoft,
            },
          ]}
        >
          <AppIcon
            name="lock"
            role={role}
            size="lg"
            state="active"
            strokeWidth="medium"
          />
        </View>

        <AppText
          variant="heading2"
          center
          style={styles.title}
        >
          {title}
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={styles.description}
        >
          {description}
        </AppText>

        <View style={styles.actions}>
          <AppButton
            title="Cancel"
            role={role}
            variant="outline"
            onPress={onClose}
            style={styles.actionButton}
          />

          <AppButton
            title="Login"
            role={role}
            leftIconName="profile"
            onPress={handleLogin}
            style={styles.actionButton}
          />
        </View>

        {showWorkerSignup ? (
          <AppButton
            title="Join as a Worker"
            role={role}
            variant="ghost"
            leftIconName="professional"
            onPress={
              handleWorkerSignUp
            }
            style={styles.signupButton}
          />
        ) : null}
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 390,

    padding:
      FixxamTokens.spacing.xxl,
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  iconContainer: {
    width:
      FixxamTokens.size
        .authHeaderIcon ?? 64,

    height:
      FixxamTokens.size
        .authHeaderIcon ?? 64,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.lg,

    marginBottom:
      FixxamTokens.spacing.lg,
  },

  title: {
    width: "100%",
  },

  description: {
    width: "100%",

    marginTop:
      FixxamTokens.spacing.sm,
  },

  actions: {
    width: "100%",

    flexDirection: "row",

    gap:
      FixxamTokens.spacing.sm,

    marginTop:
      FixxamTokens.spacing.xl,
  },

  actionButton: {
    flex: 1,
  },

  signupButton: {
    width: "100%",

    marginTop:
      FixxamTokens.spacing.sm,
  },
});

export default memo(
  AuthRequiredModal,
);