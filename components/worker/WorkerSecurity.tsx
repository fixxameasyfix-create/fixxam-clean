import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import PasswordField from "@/components/auth/PasswordField";

import {
  type WorkerRegistrationSource,
} from "@/hooks/useWorkerValidation";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  password: string;

  confirmPassword: string;

  setPassword: (
    value: string,
  ) => void;

  setConfirmPassword: (
    value: string,
  ) => void;

  registrationSource?: WorkerRegistrationSource;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerSecurity({
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
  registrationSource = "new",
}: Props) {
  const isCustomerRegistration =
    registrationSource ===
    "customer";

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          PASSWORD
          
          NEW REGISTRATION:
          User creates a new password.

          CUSTOMER REGISTRATION:
          We never fetch or display the actual Firebase password.
          This locked field only indicates that the existing
          customer account password will be confirmed below.
      ======================================================== */}

      <View
        style={
          styles.field
        }
      >
        <AppText
          variant="body"
          weight="medium"
          style={
            styles.label
          }
        >
          {isCustomerRegistration
            ? "Existing account password"
            : "Password"}
        </AppText>

        {isCustomerRegistration ? (
          <View
            style={
              styles.lockedPassword
            }
            accessibilityRole="text"
            accessibilityLabel="Existing customer account password"
          >
            <AppText
              variant="body"
              style={
                styles.lockedPasswordText
              }
            >
              ••••••••••••
            </AppText>

            <AppIcon
              name="lock"
              role="worker"
              size="sm"
            />
          </View>
        ) : (
          <PasswordField
            placeholder="Enter your password"
            value={
              password
            }
            onChangeText={
              setPassword
            }
            variant="worker"
          />
        )}
      </View>

      {/* ========================================================
          CONFIRM PASSWORD
      ======================================================== */}

      <View
        style={
          styles.confirmField
        }
      >
        <AppText
          variant="body"
          weight="medium"
          style={
            styles.label
          }
        >
          Confirm password
        </AppText>

       <PasswordField
  placeholder={
    isCustomerRegistration
      ? "Re-enter your account password"
      : "Re-enter your password"
  }
  value={confirmPassword}
  onChangeText={setConfirmPassword}
  variant="worker"
/>
      </View>

      {/* ========================================================
          CUSTOMER PASSWORD NOTE
      ======================================================== */}

      {isCustomerRegistration ? (
        <View
          style={
            styles.customerNote
          }
        >
          <AppIcon
            name="info"
            role="worker"
            size="sm"
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.confirmHint
            }
          >
            Re-enter your existing Fixxam
            account password. We will
            securely confirm it before
            continuing.
          </AppText>
        </View>
      ) : null}

      {/* ========================================================
          NEW PASSWORD REQUIREMENTS
      ======================================================== */}

      {!isCustomerRegistration ? (
        <View
          style={
            styles.requirements
          }
        >
          <PasswordRequirement
            text="6–20 characters"
          />

          <PasswordRequirement
            text="Use a mix of letters and numbers"
          />

          <PasswordRequirement
            text="Use a password you can remember"
          />
        </View>
      ) : null}
    </View>
  );
}

/* ==============================================================
   PASSWORD REQUIREMENT
============================================================== */

type PasswordRequirementProps = {
  text: string;
};

const PasswordRequirement = memo(
  function PasswordRequirement({
    text,
  }: PasswordRequirementProps) {
    return (
      <View
        style={
          styles.requirementRow
        }
      >
        <AppIcon
          name="success"
          role="worker"
          state="active"
          size="sm"
        />

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.requirementText
          }
        >
          {text}
        </AppText>
      </View>
    );
  },
);

/* ==============================================================
   EXPORT
============================================================== */

export default memo(
  WorkerSecurity,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,
    },

    field: {
      width: "100%",
    },

    confirmField: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,
    },

    label: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    lockedPassword: {
      minHeight: 52,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        "#F1F5F9",
    },

    lockedPasswordText: {
      color:
        Colors.textSecondary,

      letterSpacing: 2,
    },

    customerNote: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    confirmHint: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    requirements: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.xs,
    },

    requirementRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      minHeight: 22,
    },

    requirementText: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },
  });