import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  sendEmailVerification,
  User,
} from "firebase/auth";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import { auth } from "@/firebase/config";

/* ============================================================
   CUSTOMER PRIVACY & SECURITY
============================================================ */

export default function CustomerPrivacySecurityScreen() {
  const user = auth.currentUser;

  const [
    sendingVerification,
    setSendingVerification,
  ] = useState(false);

  /* ==========================================================
     EMAIL VERIFICATION
  ========================================================== */

  const handleEmailVerification =
    useCallback(async () => {
      const currentUser: User | null =
        auth.currentUser;

      if (!currentUser) {
        Alert.alert(
          "Account required",
          "Please sign in again to continue.",
        );
        return;
      }

      if (currentUser.emailVerified) {
        Alert.alert(
          "Email verified",
          "Your email address is already verified.",
        );
        return;
      }

      try {
        setSendingVerification(true);

        await sendEmailVerification(
          currentUser,
        );

        Alert.alert(
          "Verification email sent",
          "Check your email and follow the verification link.",
        );
      } catch (error) {
        console.error(
          "SEND_EMAIL_VERIFICATION_ERROR:",
          error,
        );

        Alert.alert(
          "Unable to send email",
          "We could not send the verification email. Please try again later.",
        );
      } finally {
        setSendingVerification(false);
      }
    }, []);

  /* ==========================================================
     CHANGE PASSWORD
  ========================================================== */

  const handleChangePassword =
    useCallback(() => {
      Alert.alert(
        "Change Password",
        "For your security, you will continue through the password recovery flow.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Continue",
            onPress: () => {
              router.push(
                "/(auth)/forgot-password" as never,
              );
            },
          },
        ],
      );
    }, []);

  /* ==========================================================
     AUTH CHECK
  ========================================================== */

  if (!user) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.loadingContainer
        }
      >
        <AppText
          weight="bold"
          style={styles.emptyTitle}
        >
          Account required
        </AppText>

        <AppText
          style={styles.emptyText}
        >
          Please sign in to manage your security settings.
        </AppText>

        <Pressable
          onPress={() =>
            router.back()
          }
          style={styles.backAction}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppText
            weight="bold"
            style={styles.backActionText}
          >
            Go Back
          </AppText>
        </Pressable>
      </AppScreen>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <Pressable
            onPress={() =>
              router.back()
            }
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </Pressable>

          <View
            style={styles.headerText}
          >
            <AppText
              weight="bold"
              style={styles.title}
            >
              Privacy & Security
            </AppText>

            <AppText
              style={styles.subtitle}
            >
              Protect your Fixxam account
            </AppText>
          </View>
        </View>

        {/* ====================================================
            ACCOUNT SECURITY
        ==================================================== */}

        <SectionTitle
          title="ACCOUNT SECURITY"
        />

        <View style={styles.card}>
          {/* ==================================================
              EMAIL VERIFICATION
          ================================================== */}

          <SettingRow
            icon="mail-outline"
            title="Email Verification"
            subtitle={
              user.emailVerified
                ? "Your email address is verified"
                : "Verify your email address"
            }
            status={
              user.emailVerified
                ? "Verified"
                : "Not verified"
            }
            statusType={
              user.emailVerified
                ? "success"
                : "warning"
            }
            onPress={
              user.emailVerified
                ? undefined
                : handleEmailVerification
            }
            loading={
              sendingVerification
            }
          />

          <Divider />

          {/* ==================================================
              CHANGE PASSWORD
          ================================================== */}

          <SettingRow
            icon="key-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={
              handleChangePassword
            }
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <AppText
      weight="bold"
      style={
        styles.sectionTitle
      }
    >
      {title}
    </AppText>
  );
}

/* ============================================================
   SETTING ROW
============================================================ */

function SettingRow({
  icon,
  title,
  subtitle,
  status,
  statusType,
  onPress,
  loading = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  status?: string;
  statusType?:
    | "success"
    | "warning";
  onPress?: () => void;
  loading?: boolean;
}) {
  const content = (
    <View style={styles.row}>
      {/* ICON */}

      <View
        style={
          styles.iconBox
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color="#2563EB"
        />
      </View>

      {/* TEXT */}

      <View
        style={
          styles.rowContent
        }
      >
        <AppText
          weight="bold"
          style={
            styles.rowTitle
          }
        >
          {title}
        </AppText>

        <AppText
          style={
            styles.rowSubtitle
          }
        >
          {subtitle}
        </AppText>
      </View>

      {/* ACTION / STATUS */}

      {loading ? (
        <ActivityIndicator
          size="small"
          color="#2563EB"
        />
      ) : status ? (
        <View
          style={[
            styles.statusBadge,
            statusType ===
              "success"
              ? styles.successBadge
              : styles.warningBadge,
          ]}
        >
          <AppText
            weight="bold"
            style={[
              styles.statusText,
              statusType ===
                "success"
                ? styles.successText
                : styles.warningText,
            ]}
          >
            {status}
          </AppText>
        </View>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={19}
          color="#94A3B8"
        />
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        pressed &&
          styles.pressedRow,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {content}
    </Pressable>
  );
}

/* ============================================================
   DIVIDER
============================================================ */

function Divider() {
  return (
    <View
      style={
        styles.divider
      }
    />
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 110,
    },

    /* ========================================================
       LOADING / EMPTY
    ======================================================== */

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },

    emptyTitle: {
      fontSize: 18,
      color: "#0F172A",
    },

    emptyText: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      color: "#64748B",
    },

    backAction: {
      marginTop: 18,
      minHeight: 44,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: "#2563EB",
      alignItems: "center",
      justifyContent: "center",
    },

    backActionText: {
      fontSize: 13,
      color: "#FFFFFF",
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    headerText: {
      flex: 1,
      marginLeft: 12,
    },

    title: {
      fontSize: 20,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 3,
      fontSize: 11.5,
      color: "#64748B",
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginLeft: 4,
      marginBottom: 8,
      fontSize: 11,
      letterSpacing: 0.7,
      color: "#64748B",
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginBottom: 20,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      overflow: "hidden",
    },

    /* ========================================================
       ROW
    ======================================================== */

    row: {
      minHeight: 76,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
    },

    pressedRow: {
      opacity: 0.7,
    },

    iconBox: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    rowContent: {
      flex: 1,
      marginHorizontal: 12,
    },

    rowTitle: {
      fontSize: 14,
      color: "#0F172A",
    },

    rowSubtitle: {
      marginTop: 3,
      fontSize: 10.5,
      lineHeight: 15,
      color: "#64748B",
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusBadge: {
      minWidth: 68,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },

    successBadge: {
      backgroundColor: "#DCFCE7",
    },

    warningBadge: {
      backgroundColor: "#FEF3C7",
    },

    statusText: {
      fontSize: 9.5,
    },

    successText: {
      color: "#15803D",
    },

    warningText: {
      color: "#B45309",
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      height: 1,
      marginLeft: 68,
      backgroundColor: "#F1F5F9",
    },
  });