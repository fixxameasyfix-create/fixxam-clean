import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  AppButton,
  AppScreen,
  AppText,
} from "@/components/ui";

import useSwitchRole from "@/hooks/auth/useSwitchRole";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type AccountRole =
  | "customer"
  | "worker";

/* ============================================================
   HELPERS
============================================================ */

function normalizeRoles(
  value: unknown,
): AccountRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter(
        (
          role,
        ): role is AccountRole =>
          role === "customer" ||
          role === "worker",
      ),
    ),
  );
}

/* ============================================================
   SELECT ACCOUNT
============================================================ */

export default function SelectAccount() {
  const {
    loading,
    switchRole,
  } = useSwitchRole();

  const [
    pendingRole,
    setPendingRole,
  ] =
    useState<FixxamRole | null>(
      null,
    );

  const [
    roles,
    setRoles,
  ] = useState<AccountRole[]>(
    [],
  );

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true);

  /* ==========================================================
     LOAD USER ROLES
  ========================================================== */

  useEffect(() => {
    const currentUser =
      auth.currentUser;

    if (!currentUser) {
      setRoles([]);
      setProfileLoading(false);

      return;
    }

    setProfileLoading(true);

    const userRef =
      doc(
        db,
        "users",
        currentUser.uid,
      );

    const unsubscribe =
      onSnapshot(
        userRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setRoles([]);
            setProfileLoading(
              false,
            );

            return;
          }

          const data =
            snapshot.data();

          setRoles(
            normalizeRoles(
              data.roles,
            ),
          );

          setProfileLoading(
            false,
          );
        },
        (error) => {
          console.error(
            "SELECT_ACCOUNT_ROLE_ERROR:",
            error,
          );

          setRoles([]);
          setProfileLoading(
            false,
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ==========================================================
     ROLE AVAILABILITY
  ========================================================== */

  const hasCustomerRole =
    roles.includes(
      "customer",
    );

  const hasWorkerRole =
    roles.includes(
      "worker",
    );

  /* ==========================================================
     SWITCH
  ========================================================== */

  const handleSwitchRole =
    useCallback(
      (
        role: FixxamRole,
      ) => {
        if (
          loading ||
          profileLoading
        ) {
          return;
        }

        if (
          role === "customer" &&
          !hasCustomerRole
        ) {
          return;
        }

        if (
          role === "worker" &&
          !hasWorkerRole
        ) {
          return;
        }

        /*
         * Navigate immediately.
         *
         * We intentionally do NOT wait for
         * Firestore before changing screens.
         */
        setPendingRole(role);

        router.replace(
          role === "customer"
            ? "/(customer)/(tabs)/home"
            : "/(worker)/(tabs)/home",
        );

        /*
         * Persist the selected role in the
         * background.
         *
         * Navigation is no longer blocked
         * by Firestore latency.
         */
        void switchRole(role).catch(
          (error) => {
            console.error(
              "SELECT_ACCOUNT_BACKGROUND_SWITCH_ERROR:",
              error,
            );
          },
        );
      },
      [
        hasCustomerRole,
        hasWorkerRole,
        loading,
        profileLoading,
        switchRole,
      ],
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (profileLoading) {
    return (
      <AppScreen
        padded
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <AppText
            variant="body"
            tone="secondary"
            center
          >
            Checking your accounts...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     NO VALID ROLE
  ========================================================== */

  if (
    !hasCustomerRole &&
    !hasWorkerRole
  ) {
    return (
      <AppScreen
        padded
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <AppText
            variant="heading2"
            center
          >
            Account unavailable
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.errorText
            }
          >
            We could not find a valid
            Fixxam account role for
            this account.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <AppScreen
      padded
      contentContainerStyle={
        styles.screen
      }
    >
      <View style={styles.container}>
        <View style={styles.heading}>
          <AppText
            variant="heading1"
            center
          >
            Select Account
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={styles.subtitle}
          >
            Choose how you want to use
            Fixxam.
          </AppText>
        </View>

        <View style={styles.actions}>
          {/* CUSTOMER */}

          {hasCustomerRole && (
            <AppButton
              title="Continue as Customer"
              role="customer"
              leftIconName="profile"
              loading={
                loading &&
                pendingRole ===
                  "customer"
              }
              disabled={loading}
              onPress={() =>
                handleSwitchRole(
                  "customer",
                )
              }
            />
          )}

          {/* WORKER */}

          {hasWorkerRole && (
            <AppButton
              title="Continue as Worker"
              role="worker"
              leftIconName="professional"
              loading={
                loading &&
                pendingRole ===
                  "worker"
              }
              disabled={loading}
              onPress={() =>
                handleSwitchRole(
                  "worker",
                )
              }
            />
          )}
        </View>
      </View>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      flexGrow: 1,
    },

    container: {
      flex: 1,
      justifyContent:
        "center",
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    heading: {
      alignItems: "center",
      marginBottom:
        FixxamTokens.spacing.xxl,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    errorText: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    actions: {
      width: "100%",
      gap:
        FixxamTokens.spacing.lg,
    },
  });