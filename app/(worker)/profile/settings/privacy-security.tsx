import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  reload,
  sendEmailVerification,
} from "firebase/auth";

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
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  auth,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type SecurityRowProps = {
  icon: AppIconName;
  title: string;
  description: string;
  onPress?: () => void;
  status?: string;
  statusTone?: "success" | "warning";
};

type SecurityModalType =
  | "verify-email"
  | "change-password"
  | null;

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerPrivacySecurityScreen() {
  const [
    emailVerified,
    setEmailVerified,
  ] = useState(
    auth.currentUser?.emailVerified ??
      false,
  );

  const [
    checkingVerification,
    setCheckingVerification,
  ] = useState(false);

  const [
    sendingVerification,
    setSendingVerification,
  ] = useState(false);

  const [
    activeModal,
    setActiveModal,
  ] = useState<SecurityModalType>(
    null,
  );

  /* ==========================================================
     CURRENT USER
  ========================================================== */

  const email =
    auth.currentUser?.email?.trim() ??
    "";

  /* ==========================================================
     REFRESH EMAIL VERIFICATION
  ========================================================== */

  const refreshVerificationStatus =
    useCallback(
      async (
        showFeedback = false,
      ) => {
        const currentUser =
          auth.currentUser;

        if (!currentUser) {
          setEmailVerified(false);

          if (showFeedback) {
            Toast.show({
              type: "error",
              text1:
                "Session unavailable",
              text2:
                "Please sign in again.",
            });
          }

          return;
        }

        try {
          setCheckingVerification(true);

          await reload(currentUser);

          const verified =
            currentUser.emailVerified;

          setEmailVerified(verified);

          if (!showFeedback) {
            return;
          }

          Toast.show({
            type: verified
              ? "success"
              : "info",

            text1: verified
              ? "Email verified"
              : "Verification pending",

            text2: verified
              ? "Your email address has been verified."
              : "Please complete verification from your email.",
          });
        } catch (error) {
          console.error(
            "WORKER_EMAIL_VERIFICATION_REFRESH_ERROR:",
            error,
          );

          if (showFeedback) {
            Toast.show({
              type: "error",

              text1:
                "Unable to check verification",

              text2:
                "Please try again.",
            });
          }
        } finally {
          setCheckingVerification(false);
        }
      },
      [],
    );

  /* ==========================================================
     INITIAL VERIFICATION CHECK
  ========================================================== */

  useEffect(() => {
    void refreshVerificationStatus();
  }, [
    refreshVerificationStatus,
  ]);

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ==========================================================
     SEND EMAIL VERIFICATION
  ========================================================== */

  const sendVerification =
    useCallback(
      async () => {
        const currentUser =
          auth.currentUser;

        if (!currentUser) {
          Toast.show({
            type: "error",

            text1:
              "Session unavailable",

            text2:
              "Please sign in again.",
          });

          return;
        }

        if (
          currentUser.emailVerified
        ) {
          setEmailVerified(true);

          Toast.show({
            type: "success",

            text1:
              "Email verified",

            text2:
              "Your email address is already verified.",
          });

          return;
        }

        try {
          setSendingVerification(true);

          await sendEmailVerification(
            currentUser,
          );

          Toast.show({
            type: "success",

            text1:
              "Verification email sent",

            text2:
              "Check your inbox and follow the verification link.",
          });
        } catch (error) {
          console.error(
            "WORKER_SEND_EMAIL_VERIFICATION_ERROR:",
            error,
          );

          Toast.show({
            type: "error",

            text1:
              "Unable to send email",

            text2:
              "Please wait a moment and try again.",
          });
        } finally {
          setSendingVerification(false);
        }
      },
      [],
    );

  /* ==========================================================
     EMAIL VERIFICATION PRESS
  ========================================================== */

  const handleEmailVerification =
    useCallback(() => {
      if (emailVerified) {
        void refreshVerificationStatus(true);

        return;
      }

      setActiveModal(
        "verify-email",
      );
    }, [
      emailVerified,
      refreshVerificationStatus,
    ]);

  /* ==========================================================
     CONFIRM EMAIL VERIFICATION
  ========================================================== */

  const handleConfirmVerification =
    useCallback(() => {
      setActiveModal(null);

      void sendVerification();
    }, [
      sendVerification,
    ]);

  /* ==========================================================
     CHANGE PASSWORD
  ========================================================== */

  const handleChangePassword =
    useCallback(() => {
      setActiveModal(
        "change-password",
      );
    }, []);

  /* ==========================================================
     CONFIRM CHANGE PASSWORD
  ========================================================== */

  const handleConfirmChangePassword =
    useCallback(() => {
      setActiveModal(null);

      router.push(
        "/(auth)/forgot-password",
      );
    }, []);

  /* ==========================================================
     CLOSE MODAL
  ========================================================== */

  const handleCloseModal =
    useCallback(() => {
      if (sendingVerification) {
        return;
      }

      setActiveModal(null);
    }, [
      sendingVerification,
    ]);

  /* ==========================================================
     BUSY STATE
  ========================================================== */

  const verificationBusy =
    checkingVerification ||
    sendingVerification;

  /* ==========================================================
     MODAL CONTENT
  ========================================================== */

  const modalTitle =
    activeModal ===
    "verify-email"
      ? "Verify Email"
      : "Change Password";

  const modalDescription =
    activeModal ===
    "verify-email"
      ? email
        ? `Send a verification link to ${email}?`
        : "Send a verification link to your account email?"
      : "For your security, you will continue through the password recovery flow.";

  const modalConfirmText =
    activeModal ===
    "verify-email"
      ? "Send"
      : "Continue";

  const handleModalConfirm =
    activeModal ===
    "verify-email"
      ? handleConfirmVerification
      : handleConfirmChangePassword;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AppScreen role="worker">
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={styles.header}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to worker settings"
            hitSlop={8}
            onPress={handleBack}
            style={({ pressed }) => [
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
            style={styles.headerContent}
          >
            <AppText
              variant="heading1"
              weight="bold"
              style={styles.title}
            >
              Privacy & Security
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={styles.subtitle}
            >
              Protect your Fixxam worker account
            </AppText>
          </View>
        </View>

        {/* ==================================================
            ACCOUNT SECURITY
        ================================================== */}

        <AppText
          variant="caption"
          weight="medium"
          style={styles.sectionTitle}
        >
          ACCOUNT SECURITY
        </AppText>

        <View
          style={styles.card}
        >
          {/* ==================================================
              EMAIL VERIFICATION
          ================================================== */}

          <SecurityRow
            icon="mail"
            title="Email Verification"
            description={
              emailVerified
                ? "Your email address is verified"
                : "Verify your email address"
            }
            status={
              emailVerified
                ? "Verified"
                : "Not verified"
            }
            statusTone={
              emailVerified
                ? "success"
                : "warning"
            }
            onPress={
              verificationBusy
                ? undefined
                : handleEmailVerification
            }
          />

          {verificationBusy ? (
            <View
              style={
                styles.verificationLoader
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  WorkerColors.primary
                }
              />
            </View>
          ) : null}

          <View
            style={styles.divider}
          />

          {/* ==================================================
              CHANGE PASSWORD
          ================================================== */}

          <SecurityRow
            icon="lock"
            title="Change Password"
            description="Update your account password"
            onPress={
              handleChangePassword
            }
          />
        </View>

        {/* ==================================================
            SECURITY INFORMATION
        ================================================== */}

        <View
          style={styles.infoCard}
        >
          <View
            style={styles.infoIcon}
          >
            <AppIcon
              name="security"
              size="md"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={styles.infoContent}
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              style={styles.infoTitle}
            >
              Account security
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.infoDescription
              }
            >
              Keep your email verified and use a strong password to help protect your Fixxam worker account.
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* ======================================================
          FIXXAM WORKER MODAL
      ====================================================== */}

      <Modal
        visible={
          activeModal !== null
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          handleCloseModal
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={
              handleCloseModal
            }
          />

          <View
            style={styles.modalCard}
          >
            {/* MODAL ICON */}

            <View
              style={
                styles.modalIcon
              }
            >
              <AppIcon
                name={
                  activeModal ===
                  "verify-email"
                    ? "mail"
                    : "lock"
                }
                role="worker"
                size="md"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            {/* TITLE */}

            <AppText
              variant="heading2"
              weight="bold"
              style={
                styles.modalTitle
              }
            >
              {modalTitle}
            </AppText>

            {/* DESCRIPTION */}

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.modalDescription
              }
            >
              {modalDescription}
            </AppText>

            {/* ACTIONS */}

            <View
              style={
                styles.modalActions
              }
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                onPress={
                  handleCloseModal
                }
                disabled={
                  sendingVerification
                }
                style={({
                  pressed,
                }) => [
                  styles.modalCancelButton,

                  pressed &&
                    styles.modalButtonPressed,

                  sendingVerification &&
                    styles.modalButtonDisabled,
                ]}
              >
                <AppText
                  variant="body"
                  weight="semibold"
                  style={
                    styles.modalCancelText
                  }
                >
                  CANCEL
                </AppText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  modalConfirmText
                }
                onPress={
                  handleModalConfirm
                }
                disabled={
                  sendingVerification
                }
                style={({
                  pressed,
                }) => [
                  styles.modalConfirmButton,

                  pressed &&
                    styles.modalButtonPressed,

                  sendingVerification &&
                    styles.modalButtonDisabled,
                ]}
              >
                {sendingVerification &&
                activeModal ===
                  "verify-email" ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      Colors.textInverse
                    }
                  />
                ) : (
                  <AppText
                    variant="body"
                    weight="bold"
                    style={
                      styles.modalConfirmText
                    }
                  >
                    {
                      modalConfirmText
                    }
                  </AppText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

/* ============================================================
   SECURITY ROW
============================================================ */

const SecurityRow =
  memo(
    function SecurityRow({
      icon,
      title,
      description,
      onPress,
      status,
      statusTone,
    }: SecurityRowProps) {
      const actionable =
        Boolean(onPress);

      return (
        <Pressable
          accessibilityRole={
            actionable
              ? "button"
              : undefined
          }
          accessibilityLabel={
            title
          }
          accessibilityHint={
            description
          }
          accessibilityState={{
            disabled:
              !actionable,
          }}
          disabled={!actionable}
          onPress={onPress}
          style={({ pressed }) => [
            styles.securityRow,

            pressed &&
            actionable
              ? styles.pressed
              : null,
          ]}
        >
          {/* ICON */}

          <View
            style={styles.rowIcon}
          >
            <AppIcon
              name={icon}
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          {/* CONTENT */}

          <View
            style={styles.rowContent}
          >
            <AppText
              variant="bodyLarge"
              weight="medium"
              style={styles.rowTitle}
            >
              {title}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.rowDescription
              }
            >
              {description}
            </AppText>
          </View>

          {/* STATUS / CHEVRON */}

          {status ? (
            <View
              style={[
                styles.statusBadge,

                statusTone ===
                "success"
                  ? styles.statusSuccess
                  : styles.statusWarning,
              ]}
            >
              <AppText
                variant="caption"
                weight="medium"
                style={[
                  styles.statusText,

                  statusTone ===
                  "success"
                    ? styles.statusSuccessText
                    : styles.statusWarningText,
                ]}
              >
                {status}
              </AppText>
            </View>
          ) : actionable ? (
            <View
              style={styles.chevron}
            >
              <AppIcon
                name="next"
                size="sm"
                color={
                  Colors.textSecondary
                }
              />
            </View>
          ) : null}
        </Pressable>
      );
    },
  );

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginLeft:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.sm,

      letterSpacing: 0.8,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SECURITY CARD
    ======================================================== */

    card: {
      position: "relative",

      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    securityRow: {
      minHeight: 92,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    /* ========================================================
       ROW ICON
    ======================================================== */

    rowIcon: {
      width: 52,

      height: 52,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ========================================================
       ROW CONTENT
    ======================================================== */

    rowContent: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    rowTitle: {
      color:
        Colors.textPrimary,
    },

    rowDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 20,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginLeft:
        52 +
        FixxamTokens.spacing.md *
          2,

      backgroundColor:
        Colors.border,
    },

    /* ========================================================
       CHEVRON
    ======================================================== */

    chevron: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",
    },

    /* ========================================================
       VERIFICATION LOADER
    ======================================================== */

    verificationLoader: {
      position: "absolute",

      top:
        FixxamTokens.spacing.sm,

      right:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusBadge: {
      flexShrink: 0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusSuccess: {
      backgroundColor:
        Colors.successSoft,
    },

    statusWarning: {
      backgroundColor:
        WorkerColors.primarySoft,
    },

    statusText: {
      fontSize: 12,
    },

    statusSuccessText: {
      color:
        Colors.success,
    },

    statusWarningText: {
      color:
        WorkerColors.primaryDark,
    },

    /* ========================================================
       INFORMATION CARD
    ======================================================== */

    infoCard: {
      flexDirection: "row",

      alignItems: "flex-start",

      marginTop:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    infoIcon: {
      width: 52,

      height: 52,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    infoContent: {
      flex: 1,

      minWidth: 0,
    },

    infoTitle: {
      color:
        Colors.textPrimary,
    },

    infoDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,
    },

    /* ========================================================
       FIXXAM MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      backgroundColor:
        "rgba(15, 23, 42, 0.52)",
    },

    modalCard: {
      width: "100%",

      maxWidth: 420,

      paddingTop:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    modalIcon: {
      width: 56,

      height: 56,

      alignItems: "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    modalTitle: {
      color:
        Colors.textPrimary,
    },

    modalDescription: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,

      color:
        Colors.textSecondary,
    },

    modalActions: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "flex-end",

      marginTop:
        FixxamTokens.spacing.xl,

      gap:
        FixxamTokens.spacing.sm,
    },

    modalCancelButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        "transparent",
    },

    modalConfirmButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      minWidth: 112,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primary,

      shadowColor:
        WorkerColors.primary,

      shadowOpacity: 0.2,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },

    modalCancelText: {
      color:
        WorkerColors.primary,
    },

    modalConfirmText: {
      color:
        Colors.textInverse,
    },

    modalButtonPressed: {
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

    modalButtonDisabled: {
      opacity: 0.55,
    },
  });