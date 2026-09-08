import React, {
  memo,
  useCallback,
  useRef,
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

import {
  router,
} from "expo-router";

import {
  FirebaseError,
} from "firebase/app";

import {
  sendEmailVerification,
  type User,
} from "firebase/auth";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  auth,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type StatusType =
  | "success"
  | "warning";

/* ============================================================
   HELPERS
============================================================ */

function showErrorToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
}

function showInfoToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
  });
}

function showSuccessToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
  });
}

function getVerificationErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof FirebaseError
  ) {
    switch (
      error.code
    ) {
      case "auth/too-many-requests":
        return "Too many requests were made. Please wait before trying again.";

      case "auth/network-request-failed":
        return "Check your internet connection and try again.";

      case "auth/user-disabled":
        return "This account is currently disabled.";

      case "auth/user-token-expired":
      case "auth/invalid-user-token":
        return "Your session has expired. Please sign in again.";

      default:
        return "We could not send the verification email. Please try again later.";
    }
  }

  return "We could not send the verification email. Please try again later.";
}

/* ============================================================
   CUSTOMER PRIVACY & SECURITY
============================================================ */

export default function CustomerPrivacySecurityScreen() {
  const user =
    auth.currentUser;

  const [
    sendingVerification,
    setSendingVerification,
  ] =
    useState(false);

  const verificationInFlight =
    useRef(false);

  /* ==========================================================
     EMAIL VERIFICATION
  ========================================================== */

  const handleEmailVerification =
    useCallback(async () => {
      if (
        verificationInFlight.current ||
        sendingVerification
      ) {
        return;
      }

      const currentUser:
        User | null =
        auth.currentUser;

      if (
        !currentUser
      ) {
        showErrorToast(
          "Account required",
          "Please sign in again to continue.",
        );

        return;
      }

      if (
        currentUser.emailVerified
      ) {
        showInfoToast(
          "Email verified",
          "Your email address is already verified.",
        );

        return;
      }

      verificationInFlight.current =
        true;

      setSendingVerification(
        true,
      );

      try {
        await sendEmailVerification(
          currentUser,
        );

        showSuccessToast(
          "Verification email sent",
          "Check your email and follow the verification link.",
        );
      } catch (
        error
      ) {
        console.error(
          "SEND_EMAIL_VERIFICATION_ERROR:",
          error,
        );

        showErrorToast(
          "Unable to send email",
          getVerificationErrorMessage(
            error,
          ),
        );
      } finally {
        verificationInFlight.current =
          false;

        setSendingVerification(
          false,
        );
      }
    }, [
      sendingVerification,
    ]);

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
        role="customer"
        contentContainerStyle={
          styles.emptyContainer
        }
      >
        <View
          style={
            styles.emptyIcon
          }
        >
          <AppIcon
            name="shield"
            size="lg"
            color={
              Colors.textMuted
            }
          />
        </View>

        <AppText
          variant="heading3"
          weight="bold"
          center
          style={
            styles.emptyTitle
          }
        >
          Account required
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.emptyText
          }
        >
          Please sign in to manage your security settings.
        </AppText>

        <Pressable
          onPress={() => {
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({
            pressed,
          }) => [
            styles.backAction,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            size="sm"
            color={
              Colors.textInverse
            }
          />

          <AppText
            variant="body"
            weight="bold"
            style={
              styles.backActionText
            }
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
      role="customer"
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() => {
              router.back();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              size="md"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              variant="heading2"
              weight="bold"
              style={
                styles.title
              }
            >
              Privacy & Security
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.subtitle
              }
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

        <View
          style={
            styles.card
          }
        >
          {/* ==================================================
              EMAIL VERIFICATION
          ================================================== */}

          <SettingRow
            icon="mail"
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
                : () => {
                    void handleEmailVerification();
                  }
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
            icon="lock"
            title="Change Password"
            subtitle="Update your account password"
            onPress={
              handleChangePassword
            }
          />
        </View>

        {/* ====================================================
            SECURITY INFO
        ==================================================== */}

        <View
          style={
            styles.infoCard
          }
        >
          <View
            style={
              styles.infoIcon
            }
          >
            <AppIcon
              name="shield"
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.infoContent
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.infoTitle
              }
            >
              Account security
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.infoText
              }
            >
              Keep your email verified and use a strong password to help protect your Fixxam account.
            </AppText>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

const SectionTitle =
  memo(
    function SectionTitle({
      title,
    }: {
      title: string;
    }) {
      return (
        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.sectionTitle
          }
        >
          {title}
        </AppText>
      );
    },
  );

SectionTitle.displayName =
  "SectionTitle";

/* ============================================================
   SETTING ROW
============================================================ */

const SettingRow =
  memo(
    function SettingRow({
      icon,
      title,
      subtitle,
      status,
      statusType,
      onPress,
      loading = false,
    }: {
      icon: AppIconName;

      title: string;

      subtitle: string;

      status?: string;

      statusType?:
        StatusType;

      onPress?:
        () => void;

      loading?: boolean;
    }) {
      const content = (
        <View
          style={
            styles.row
          }
        >
          {/* ICON */}

          <View
            style={
              styles.iconBox
            }
          >
            <AppIcon
              name={
                icon
              }
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          {/* TEXT */}

          <View
            style={
              styles.rowContent
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.rowTitle
              }
            >
              {title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.rowSubtitle
              }
            >
              {subtitle}
            </AppText>
          </View>

          {/* STATUS / ACTION */}

          {loading ? (
            <View
              style={
                styles.trailingControl
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  CustomerColors.primary
                }
              />
            </View>
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
                variant="caption"
                weight="bold"
                numberOfLines={1}
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
            <View
              style={
                styles.trailingControl
              }
            >
              <AppIcon
                name="next"
                size="sm"
                color={
                  Colors.textMuted
                }
              />
            </View>
          )}
        </View>
      );

      if (!onPress) {
        return content;
      }

      return (
        <Pressable
          onPress={
            onPress
          }
          disabled={
            loading
          }
          accessibilityRole="button"
          accessibilityLabel={
            title
          }
          accessibilityState={{
            disabled:
              loading,
            busy:
              loading,
          }}
          style={({
            pressed,
          }) => [
            loading
              ? styles.disabled
              : null,

            pressed &&
            !loading
              ? styles.pressedRow
              : null,
          ]}
        >
          {content}
        </Pressable>
      );
    },
  );

SettingRow.displayName =
  "SettingRow";

/* ============================================================
   DIVIDER
============================================================ */

const Divider =
  memo(
    function Divider() {
      return (
        <View
          style={
            styles.divider
          }
        />
      );
    },
  );

Divider.displayName =
  "Divider";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      paddingHorizontal: 0,

      paddingTop: 0,

      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyContainer: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 310,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    backAction: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    backActionText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.xl,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginLeft:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.sm,

      letterSpacing:
        0.7,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      overflow:
        "hidden",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       ROW
    ======================================================== */

    row: {
      minHeight: 76,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    iconBox: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    rowContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    rowTitle: {
      color:
        Colors.textPrimary,
    },

    rowSubtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    trailingControl: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusBadge: {
      minHeight: 28,

      maxWidth: 94,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.chip,
    },

    successBadge: {
      backgroundColor:
        Colors.successSoft,
    },

    warningBadge: {
      backgroundColor:
        Colors.warningSoft,
    },

    statusText: {
      textAlign:
        "center",
    },

    successText: {
      color:
        Colors.success,
    },

    warningText: {
      color:
        Colors.warning,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      height: 1,

      marginLeft: 68,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoCard: {
      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    infoIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    infoContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    infoTitle: {
      color:
        CustomerColors.primary,
    },

    infoText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATES
    ======================================================== */

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

    pressedRow: {
      backgroundColor:
        Colors.disabledBackground,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });