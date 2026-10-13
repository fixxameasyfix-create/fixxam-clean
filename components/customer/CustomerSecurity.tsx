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
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

export type CustomerRegistrationSource =
  | "new"
  | "worker";

export type CustomerPrefillMode =
  | "worker"
  | "blank";

type Props = {
  password: string;

  confirmPassword: string;

  setPassword: (
    value: string,
  ) => void;

  setConfirmPassword: (
    value: string,
  ) => void;

  registrationSource?: CustomerRegistrationSource;

  prefillMode?: CustomerPrefillMode;
};

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerSecurity({
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
  registrationSource = "new",
  prefillMode = "blank",
}: Props) {
  const isWorkerRegistration =
    registrationSource === "worker";

  const isWorkerPrefill =
    isWorkerRegistration &&
    prefillMode === "worker";

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          PASSWORD
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
          Password
        </AppText>

        {isWorkerPrefill ? (
          <View
            style={
              styles.lockedPassword
            }
          >
            <View
              style={
                styles.lockedPasswordContent
              }
            >
              <AppText
                variant="body"
                style={
                  styles.lockedPasswordText
                }
              >
                ••••••••••••
              </AppText>
            </View>

            <AppIcon
              name="lock"
              role="customer"
              size="sm"
              state="muted"
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
            variant="customer"
          />
        )}
      </View>

      {/* ========================================================
          CONFIRM / RE-ENTER PASSWORD
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
          {isWorkerPrefill
            ? "Re-enter password"
            : "Confirm password"}
        </AppText>

        <PasswordField
          placeholder={
            isWorkerPrefill
              ? "Enter your existing password"
              : "Re-enter your password"
          }
          value={
            confirmPassword
          }
          onChangeText={
            setConfirmPassword
          }
          variant="customer"
        />
      </View>

      {/* ========================================================
          WORKER → CUSTOMER SECURITY NOTICE
      ======================================================== */}

      {isWorkerPrefill ? (
        <View
          style={
            styles.workerNotice
          }
        >
          <AppIcon
            name="lock"
            role="customer"
            size="sm"
            state="muted"
          />

          <View
            style={
              styles.workerNoticeContent
            }
          >
            <AppText
              variant="caption"
              weight="semibold"
              style={
                styles.workerNoticeTitle
              }
            >
              Existing account password
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.workerNoticeText
              }
            >
              Your worker password stays unchanged.
              Re-enter it to securely verify your
              existing Fixxam account.
            </AppText>
          </View>
        </View>
      ) : null}

      {/* ========================================================
          PASSWORD REQUIREMENTS
      ======================================================== */}

      {!isWorkerPrefill ? (
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
          role="customer"
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

export default memo(
  CustomerSecurity,
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

    /* ========================================================
       LOCKED PASSWORD
    ======================================================== */

    lockedPassword: {
      width: "100%",

      minHeight: 52,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "space-between",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    lockedPasswordContent: {
      flex: 1,

      minWidth: 0,
    },

    lockedPasswordText: {
      letterSpacing: 3,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       WORKER NOTICE
    ======================================================== */

    workerNotice: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    workerNoticeContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    workerNoticeTitle: {
      color:
        Colors.textPrimary,
    },

    workerNoticeText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,
    },

    /* ========================================================
       REQUIREMENTS
    ======================================================== */

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