import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  httpsCallable,
} from "firebase/functions";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  functions,
} from "@/firebase/config";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type ServicePromotionStatus = {
  completedBookings: number;

  progress: number;

  requiredBookings: number;

  rewardUnlocked: boolean;

  rewardClaimed: boolean;
};

type FirebaseCallableError = {
  code?: string;

  message?: string;
};

/* ============================================================
   CLOUD FUNCTION
============================================================ */

const getServicePromotionStatus =
  httpsCallable<
    void,
    ServicePromotionStatus
  >(
    functions,
    "getServicePromotionStatus",
  );

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_REQUIRED_BOOKINGS =
  20;

/* ============================================================
   HELPERS
============================================================ */

function getSafeNumber(
  value: unknown,
  fallback = 0,
): number {
  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function normalizePromotionStatus(
  value: ServicePromotionStatus,
): ServicePromotionStatus {
  const requiredBookings =
    Math.max(
      1,
      Math.floor(
        getSafeNumber(
          value.requiredBookings,
          DEFAULT_REQUIRED_BOOKINGS,
        ),
      ),
    );

  const completedBookings =
    Math.max(
      0,
      Math.floor(
        getSafeNumber(
          value.completedBookings,
          0,
        ),
      ),
    );

  const progress =
    Math.max(
      0,
      Math.min(
        Math.floor(
          getSafeNumber(
            value.progress,
            completedBookings,
          ),
        ),
        requiredBookings,
      ),
    );

  return {
    completedBookings,

    progress,

    requiredBookings,

    rewardUnlocked:
      Boolean(
        value.rewardUnlocked,
      ),

    rewardClaimed:
      Boolean(
        value.rewardClaimed,
      ),
  };
}

function getPromotionErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    const code =
      String(
        (
          error as FirebaseCallableError
        ).code ?? "",
      );

    switch (code) {
      case "functions/unauthenticated":
      case "unauthenticated":
        return "Please sign in again to view your reward progress.";

      case "functions/permission-denied":
      case "permission-denied":
        return "You do not have permission to view this reward.";

      case "functions/unavailable":
      case "unavailable":
        return "The service is temporarily unavailable. Please try again.";

      default:
        break;
    }
  }

  return "Unable to load your reward progress. Please try again.";
}

/* ============================================================
   SCREEN
============================================================ */

export default function ServicePromotionsScreen() {
  const [
    status,
    setStatus,
  ] =
    useState<ServicePromotionStatus | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /* ==========================================================
     LOAD STATUS
  ========================================================== */

  const loadStatus =
    useCallback(async () => {
      setLoading(
        true,
      );

      setError(
        null,
      );

      try {
        const result =
          await getServicePromotionStatus();

        if (
          !result.data
        ) {
          throw new Error(
            "SERVICE_PROMOTION_STATUS_EMPTY",
          );
        }

        const normalized =
          normalizePromotionStatus(
            result.data,
          );

        setStatus(
          normalized,
        );
      } catch (
        loadError
      ) {
        const firebaseError =
          loadError as FirebaseCallableError;

        console.error(
          "SERVICE_PROMOTION_STATUS_ERROR:",
          {
            code:
              firebaseError?.code,

            message:
              firebaseError?.message,

            error:
              loadError,
          },
        );

        setStatus(
          null,
        );

        setError(
          getPromotionErrorMessage(
            loadError,
          ),
        );
      } finally {
        setLoading(
          false,
        );
      }
    }, []);

  useEffect(() => {
    void loadStatus();
  }, [
    loadStatus,
  ]);

  /* ==========================================================
     DERIVED STATE
  ========================================================== */

  const required =
    status?.requiredBookings ??
    DEFAULT_REQUIRED_BOOKINGS;

  const safeProgress =
    Math.max(
      0,
      Math.min(
        status?.progress ?? 0,
        required,
      ),
    );

  const progressPercentage =
    required > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (
              safeProgress /
              required
            ) *
              100,
          ),
        )
      : 0;

  const remaining =
    Math.max(
      required -
        safeProgress,
      0,
    );

  const rewardReady =
    Boolean(
      status?.rewardUnlocked,
    ) &&
    !status?.rewardClaimed;

  const progressMessage =
    useMemo(() => {
      if (
        status?.rewardClaimed
      ) {
        return "Your free service reward has already been claimed.";
      }

      if (
        status?.rewardUnlocked
      ) {
        return "Your free service is ready to claim.";
      }

      return `${remaining} more completed ${
        remaining === 1
          ? "booking"
          : "bookings"
      } to unlock your reward.`;
    }, [
      remaining,
      status?.rewardClaimed,
      status?.rewardUnlocked,
    ]);

  /* ==========================================================
     CLAIM
  ========================================================== */

  const handleClaim =
    useCallback(() => {
      if (
        !status ||
        status.rewardClaimed ||
        !status.rewardUnlocked
      ) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/details/categories",

        params: {
          reward:
            "service-promotion-free-service",
        },
      });
    }, [
      status,
    ]);

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
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={() => {
              router.back();
            }}
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
              variant="heading1"
              weight="bold"
              style={
                styles.title
              }
            >
              Service Promotions
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Complete {required} successful bookings and get one service free.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            HERO
        ==================================================== */}

        <View
          style={
            styles.heroCard
          }
        >
          <View
            style={
              styles.heroIcon
            }
          >
            <AppIcon
              name="service"
              role="customer"
              size="lg"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            style={
              styles.heroTitle
            }
          >
            Book {required} Services, Get 1 Free
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.heroDescription
            }
          >
            Keep using Fixxam and complete successful service bookings to unlock your free service reward.
          </AppText>
        </View>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <View
            style={
              styles.stateCard
            }
          >
            <ActivityIndicator
              size="large"
              color={
                CustomerColors.primary
              }
            />

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.loadingText
              }
            >
              Loading your progress...
            </AppText>
          </View>
        ) : error ? (
          /* ==================================================
             ERROR
          ================================================== */

          <View
            style={
              styles.errorCard
            }
          >
            <View
              style={
                styles.errorIcon
              }
            >
              <AppIcon
                name="error"
                size="md"
                color={
                  Colors.error
                }
              />
            </View>

            <AppText
              variant="heading3"
              weight="bold"
              center
              style={
                styles.errorTitle
              }
            >
              Unable to load reward
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.errorText
              }
            >
              {error}
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Try again"
              onPress={() => {
                void loadStatus();
              }}
              style={({
                pressed,
              }) => [
                styles.retryButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="refresh"
                role="customer"
                size="sm"
                color={
                  CustomerColors.primary
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.retryText
                }
              >
                TRY AGAIN
              </AppText>
            </Pressable>
          </View>
        ) : (
          /* ==================================================
             PROGRESS
          ================================================== */

          <View
            style={
              styles.progressCard
            }
          >
            <View
              style={
                styles.progressHeader
              }
            >
              <AppText
                variant="bodyLarge"
                weight="bold"
                style={
                  styles.progressTitle
                }
              >
                Your Progress
              </AppText>

              <AppText
                variant="body"
                weight="bold"
                style={
                  styles.progressCount
                }
              >
                {safeProgress} / {required}
              </AppText>
            </View>

            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Service promotion progress"
              accessibilityValue={{
                min:
                  0,

                max:
                  required,

                now:
                  safeProgress,
              }}
              style={
                styles.progressTrack
              }
            >
              <View
                style={[
                  styles.progressFill,

                  {
                    width:
                      `${progressPercentage}%`,
                  },
                ]}
              />
            </View>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.progressMessage
              }
            >
              {progressMessage}
            </AppText>

            {/* ================================================
                REWARD UNLOCKED
            ================================================ */}

            {status?.rewardUnlocked &&
            !status.rewardClaimed ? (
              <View
                style={
                  styles.unlockedBox
                }
              >
                <View
                  style={
                    styles.unlockedIcon
                  }
                >
                  <AppIcon
                    name="success"
                    size="md"
                    color={
                      Colors.success
                    }
                  />
                </View>

                <View
                  style={
                    styles.rewardStateContent
                  }
                >
                  <AppText
                    variant="body"
                    weight="bold"
                    style={
                      styles.unlockedTitle
                    }
                  >
                    Reward Unlocked
                  </AppText>

                  <AppText
                    variant="caption"
                    style={
                      styles.unlockedDescription
                    }
                  >
                    Choose one eligible service from Fixxam.
                  </AppText>
                </View>
              </View>
            ) : null}

            {/* ================================================
                CLAIMED
            ================================================ */}

            {status?.rewardClaimed ? (
              <View
                style={
                  styles.claimedBox
                }
              >
                <View
                  style={
                    styles.claimedIcon
                  }
                >
                  <AppIcon
                    name="success"
                    role="customer"
                    size="md"
                    color={
                      CustomerColors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.rewardStateContent
                  }
                >
                  <AppText
                    variant="body"
                    weight="bold"
                    style={
                      styles.claimedTitle
                    }
                  >
                    Reward Claimed
                  </AppText>

                  <AppText
                    variant="caption"
                    style={
                      styles.claimedDescription
                    }
                  >
                    You have already claimed this free service reward.
                  </AppText>
                </View>
              </View>
            ) : null}

            {/* ================================================
                CLAIM BUTTON
            ================================================ */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                status?.rewardClaimed
                  ? "Reward already claimed"
                  : rewardReady
                    ? "Claim free service"
                    : "Reward not yet available"
              }
              accessibilityState={{
                disabled:
                  !rewardReady,
              }}
              disabled={
                !rewardReady
              }
              onPress={
                handleClaim
              }
              style={({
                pressed,
              }) => [
                styles.claimButton,

                !rewardReady
                  ? styles.claimButtonDisabled
                  : null,

                pressed &&
                rewardReady
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppText
                variant="body"
                weight="bold"
                style={[
                  styles.claimText,

                  !rewardReady
                    ? styles.claimTextDisabled
                    : null,
                ]}
              >
                {status?.rewardClaimed
                  ? "REWARD CLAIMED"
                  : "CLAIM FREE SERVICE"}
              </AppText>

              <AppIcon
                name={
                  status?.rewardClaimed
                    ? "check"
                    : "next"
                }
                size="sm"
                color={
                  rewardReady
                    ? Colors.textInverse
                    : Colors.textMuted
                }
              />
            </Pressable>
          </View>
        )}

        {/* ====================================================
            INFO
        ==================================================== */}

        <View
          style={
            styles.infoBox
          }
        >
          <View
            style={
              styles.infoIcon
            }
          >
            <AppIcon
              name="info"
              size="sm"
              color={
                Colors.info
              }
            />
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.infoText
            }
          >
            Only completed bookings count toward this reward. Cancelled and unfinished bookings do not count.
          </AppText>
        </View>
      </ScrollView>
    </AppScreen>
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
        FixxamTokens.spacing.xxl,
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
        "flex-start",
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
        FixxamTokens.spacing.xs,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       HERO
    ======================================================== */

    heroCard: {
      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.xl,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    heroIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    heroTitle: {
      color:
        Colors.textPrimary,
    },

    heroDescription: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATE
    ======================================================== */

    stateCard: {
      minHeight: 190,

      padding:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorCard: {
      padding:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    errorIcon: {
      width: 56,

      height: 56,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.errorSoft,
    },

    errorTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    errorText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    retryButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    retryText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       PROGRESS
    ======================================================== */

    progressCard: {
      padding:
        FixxamTokens.spacing.xl,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    progressHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    progressTitle: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    progressCount: {
      flexShrink: 0,

      color:
        CustomerColors.primary,
    },

    progressTrack: {
      height: 12,

      marginTop:
        FixxamTokens.spacing.lg,

      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.divider,
    },

    progressFill: {
      height: "100%",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    progressMessage: {
      marginTop:
        FixxamTokens.spacing.md,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       UNLOCKED
    ======================================================== */

    unlockedBox: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    unlockedIcon: {
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

    rewardStateContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    unlockedTitle: {
      color:
        Colors.success,
    },

    unlockedDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.success,
    },

    /* ========================================================
       CLAIMED
    ======================================================== */

    claimedBox: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    claimedIcon: {
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

    claimedTitle: {
      color:
        CustomerColors.primary,
    },

    claimedDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CLAIM BUTTON
    ======================================================== */

    claimButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

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

    claimButtonDisabled: {
      backgroundColor:
        Colors.disabledBackground,
    },

    claimText: {
      color:
        Colors.textInverse,

      letterSpacing:
        0.3,
    },

    claimTextDisabled: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoBox: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.infoSoft,
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

    infoText: {
      flex: 1,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PRESS
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
  });