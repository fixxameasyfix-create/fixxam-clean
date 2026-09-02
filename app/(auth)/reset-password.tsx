import React, { useState } from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import {
  useRouter,
} from "expo-router";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  AppScreen,
  AppCard,
  AppText,
  AppButton,
} from "@/components/ui";

import {
  showError,
  showSuccess,
} from "@/utils/showToast";
import PasswordField from "@/components/auth/PasswordField";


export default function ResetPasswordScreen() {

  const { email } =
    useLocalSearchParams<{
      email: string;
    }>();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

    const router = useRouter();

  const handleResetPassword =
    async () => {

      if (!password) {
        showError(
          "Password Required",
          "Please enter your new password."
        );
        return;
      }

      if (password.length < 6) {
        showError(
          "Invalid Password",
          "Password must be at least 6 characters."
        );
        return;
      }

      if (password.length > 20) {
        showError(
          "Invalid Password",
          "Password cannot exceed 20 characters."
        );
        return;
      }

      if (
        password !== confirmPassword
      ) {
        showError(
          "Password Mismatch",
          "Passwords do not match."
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            "https://resetpassword-yrig53veoq-uc.a.run.app",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                email,
                password,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to reset password."
          );
        }

        showSuccess(
          "Password Reset",
          "Your password has been reset successfully."
        );

        setTimeout(() => {

  router.replace({
    pathname: "/(auth)/login",
  });

}, 1500);

      } catch (error: any) {
        showError(
          "Failed",
          error?.message ||
            "Unable to reset password."
        );
      } finally {
        setLoading(false);
      }
    };
    return (
    <AppScreen>

      <View style={styles.header}>

        <AppText
          size="xl"
          weight="bold"
          center
          style={styles.title}
        >
          Reset Password
        </AppText>

        <AppText
          center
          style={styles.subtitle}
        >
          Create a new password for your account.
        </AppText>

      </View>

      <AppCard style={styles.card}>

        <AppText
  weight="bold"
  style={styles.label}
>
  New Password
</AppText>

<PasswordField
  placeholder="Enter your new password"
  value={password}
  onChangeText={setPassword}
  variant="customer"
/>

<View style={{ height: 16 }} />

<AppText
  weight="bold"
  style={styles.label}
>
  Confirm Password
</AppText>

<PasswordField
  placeholder="Confirm your new password"
  value={confirmPassword}
  onChangeText={setConfirmPassword}
  variant="customer"
/>

        <View style={styles.rules}>

          <View style={styles.rules}>
  <AppText
    weight="bold"
    style={styles.rulesTitle}
  >
    Password Requirements
  </AppText>

  <AppText style={styles.rule}>
    • 6–20 characters
  </AppText>

  <AppText style={styles.rule}>
    • Any password is accepted
  </AppText>

  {password.length > 0 &&
    confirmPassword.length > 0 && (
      <AppText
        style={{
          marginTop: 10,
          color:
            password ===
            confirmPassword
              ? "#16A34A"
              : "#DC2626",
          fontWeight: "700",
        }}
      >
        {password ===
        confirmPassword
          ? "✓ Passwords match"
          : "✗ Passwords do not match"}
      </AppText>
    )}
</View>

        </View>

        <View style={styles.notice}>

          <AppText
            weight="bold"
            style={styles.noticeTitle}
          >
            For your security
          </AppText>

          <AppText
            style={styles.noticeText}
          >
            Keep your password private and do not share it with anyone.
          </AppText>

        </View>

        <AppButton
          title="Reset Password"
          variant="customer"
          loading={loading}
          onPress={
            handleResetPassword
          }
        />

      </AppCard>

    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: 28,
    marginBottom: 18,
    paddingHorizontal: 20,
  },

   label: {
  color: "#0B1F4D",
  fontSize: 14,
  fontWeight: "700",
  marginBottom: 8,
},

  title: {
    color: "#0B1F4D",
    fontSize: 28,
    marginBottom: 6,
  },

  subtitle: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  card: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  rules: {
    marginTop: 14,
    marginBottom: 16,
  },

  rulesTitle: {
    color: "#0B1F4D",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },

  rule: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },

  notice: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderLeftWidth: 3,
    borderLeftColor: "#F97316",
  },

  noticeTitle: {
    color: "#EA580C",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },

  noticeText: {
    color: "#7C2D12",
    fontSize: 13,
    lineHeight: 18,
  },
});