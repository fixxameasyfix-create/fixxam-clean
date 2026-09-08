import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
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

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  claim90DayReward,
  get90DayRewardStatus,
  type RewardStatus,
} from "../../../services/rewards/90DayReward";

/* ============================================================
   CONSTANTS
============================================================ */

const REWARD_DAYS =
  90;

/* ============================================================
   HELPERS
============================================================ */

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof FirebaseError
  ) {
    switch (
      error.code
    ) {
      case "functions/unauthenticated":
        return "Please sign in to claim your daily reward.";

      case "functions/already-exists":
        return "Today's reward has already been claimed.";

      case "functions/failed-precondition":
        return "This reward is not available for claiming.";

      case "functions/unavailable":
        return "The reward service is temporarily unavailable. Please try again.";

      default:
        return (
          error.message ||
          "Something went wrong."
        );
    }
  }

  return "Something went wrong. Please try again.";
}

function getSafeInteger(
  value: unknown,
  fallback = 0,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return fallback;
  }

  return Math.max(
    0,
    Math.floor(
      parsed,
    ),
  );
}

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

/* ============================================================
   SCREEN
============================================================ */

export default function SpecialOfferScreen() {
  const [
    reward,
    setReward,
  ] =
    useState<RewardStatus | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    claiming,
    setClaiming,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const claimInFlight =
    useRef(false);

  /* ==========================================================
     LOAD REWARD
  ========================================================== */

  const loadReward =
    useCallback(async () => {
      try {
        setError(
          null,
        );

        const status =
          await get90DayRewardStatus();

        if (!status) {
          throw new Error(
            "REWARD_STATUS_EMPTY",
          );
        }

        setReward(
          status,
        );
      } catch (
        loadError
      ) {
        console.error(
          "90_DAY_REWARD_STATUS_ERROR:",
          loadError,
        );

        setError(
          getErrorMessage(
            loadError,
          ),
        );
      } finally {
        setLoading(
          false,
        );

        setRefreshing(
          false,
        );
      }
    }, []);

  useEffect(() => {
    void loadReward();
  }, [
    loadReward,
  ]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    useCallback(() => {
      if (
        refreshing
      ) {
        return;
      }

      setRefreshing(
        true,
      );

      void loadReward();
    }, [
      loadReward,
      refreshing,
    ]);

  /* ==========================================================
     DAILY CLAIM
  ========================================================== */

  const handleClaim =
    useCallback(async () => {
      if (
        !reward?.canClaimToday ||
        claimInFlight.current ||
        claiming
      ) {
        return;
      }

      claimInFlight.current =
        true;

      setClaiming(
        true,
      );

      try {
        const result =
          await claim90DayReward();

        setReward(
          result,
        );

        setError(
          null,
        );

        showSuccessToast(
          "Reward claimed",
          "Today's reward has been added to your streak.",
        );
      } catch (
        claimError
      ) {
        console.error(
          "90_DAY_REWARD_CLAIM_ERROR:",
          claimError,
        );

        showErrorToast(
          "Unable to claim reward",
          getErrorMessage(
            claimError,
          ),
        );

        /*
         * Refresh because another request
         * or another device may already
         * have changed the reward state.
         */
        await loadReward();
      } finally {
        claimInFlight.current =
          false;

        setClaiming(
          false,
        );
      }
    }, [
      claiming,
      loadReward,
      reward?.canClaimToday,
    ]);

  /* ==========================================================
     FREE SERVICE
  ========================================================== */

  const handleFreeServiceClaim =
    useCallback(() => {
      if (
        !reward?.rewardUnlocked ||
        reward.rewardClaimed
      ) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/details/categories",

        params: {
          reward:
            "90-day-free-service",
        },
      });
    }, [
      reward?.rewardClaimed,
      reward?.rewardUnlocked,
    ]);

  /* ==========================================================
     DERIVED REWARD STATE
  ========================================================== */

  const streakDay =
    Math.min(
      getSafeInteger(
        reward?.streakDay,
      ),
      REWARD_DAYS,
    );

  const progress =
    Math.min(
      Math.max(
        streakDay /
          REWARD_DAYS,
        0,
      ),
      1,
    );

  const progressNumber =
    Math.round(
      progress * 100,
    );

  const progressPercentage =
    `${progressNumber}%` as `${number}%`;

  const daysRemaining =
    Math.min(
      REWARD_DAYS,
      getSafeInteger(
        reward?.daysRemaining,
        Math.max(
          REWARD_DAYS -
            streakDay,
          0,
        ),
      ),
    );

  const rewardUnlocked =
    Boolean(
      reward?.rewardUnlocked,
    );

  const rewardClaimed =
    Boolean(
      reward?.rewardClaimed,
    );

  const canClaimToday =
    Boolean(
      reward?.canClaimToday,
    );

  const dailyClaimTitle =
    canClaimToday
      ? "Claim today's reward"
      : "Today's reward claimed";

  const dailyClaimDescription =
    canClaimToday
      ? "Claim today to continue your 90-day streak."
      : "Come back tomorrow to continue your streak.";

  const rewardStatusLabel =
    useMemo(() => {
      if (
        rewardClaimed
      ) {
        return "REWARD CLAIMED";
      }

      return "1 FREE SERVICE";
    }, [
      rewardClaimed,
    ]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.loadingContainer
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
            Loading your reward...
          </AppText>
        </View>
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
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor={
              CustomerColors.primary
            }
            colors={[
              CustomerColors.primary,
            ]}
            progressBackgroundColor={
              Colors.surface
            }
          />
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
              90-Day Reward
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Claim every day and keep your streak alive for a free Fixxam service.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error ? (
          <View
            style={
              styles.errorBox
            }
          >
            <View
              style={
                styles.errorIcon
              }
            >
              <AppIcon
                name="error"
                size="sm"
                color={
                  Colors.error
                }
              />
            </View>

            <View
              style={
                styles.errorContent
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.errorTitle
                }
              >
                Unable to update reward
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.errorText
                }
              >
                {error}
              </AppText>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Try loading reward again"
                onPress={() => {
                  void loadReward();
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
                  size="xs"
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
          </View>
        ) : null}

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
              name="star"
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
            Fixxam 90-Day Reward
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.heroDescription
            }
          >
            Claim one reward every day. Stay consistent for 90 days to unlock one free service.
          </AppText>
        </View>

        {/* ====================================================
            PROGRESS
        ==================================================== */}

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
            <View
              style={
                styles.progressHeaderContent
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.progressTitle
                }
              >
                YOUR STREAK
              </AppText>

              <AppText
                variant="heading2"
                weight="bold"
                style={
                  styles.dayText
                }
              >
                Day {streakDay} / {REWARD_DAYS}
              </AppText>
            </View>

            <View
              style={
                styles.dayBadge
              }
              accessibilityLabel={`${streakDay} day streak`}
            >
              <AppIcon
                name="calendar"
                role="customer"
                size="sm"
                color={
                  CustomerColors.primary
                }
              />

              <AppText
                variant="body"
                weight="bold"
                style={
                  styles.dayBadgeText
                }
              >
                {streakDay}
              </AppText>
            </View>
          </View>

          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="90 day reward progress"
            accessibilityValue={{
              min:
                0,

              max:
                REWARD_DAYS,

              now:
                streakDay,
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
                    progressPercentage,
                },
              ]}
            />
          </View>

          <View
            style={
              styles.progressFooter
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.progressFooterText
              }
            >
              {daysRemaining > 0
                ? `${daysRemaining} ${
                    daysRemaining === 1
                      ? "day"
                      : "days"
                  } to go`
                : "90 days completed"}
            </AppText>

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.progressPercentage
              }
            >
              {progressNumber}%
            </AppText>
          </View>
        </View>

        {/* ====================================================
            DAILY CLAIM
        ==================================================== */}

        {!rewardUnlocked ? (
          <View
            style={
              styles.claimCard
            }
          >
            <View
              style={[
                styles.claimIcon,

                !canClaimToday
                  ? styles.claimedTodayIcon
                  : null,
              ]}
            >
              <AppIcon
                name={
                  canClaimToday
                    ? "calendar"
                    : "success"
                }
                role="customer"
                size="md"
                color={
                  canClaimToday
                    ? CustomerColors.primary
                    : Colors.success
                }
              />
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.claimTitle
              }
            >
              {dailyClaimTitle}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.claimDescription
              }
            >
              {dailyClaimDescription}
            </AppText>

            <Pressable
              disabled={
                !canClaimToday ||
                claiming
              }
              onPress={() => {
                void handleClaim();
              }}
              accessibilityRole="button"
              accessibilityLabel={
                canClaimToday
                  ? "Claim today's reward"
                  : "Today's reward already claimed"
              }
              accessibilityState={{
                disabled:
                  !canClaimToday ||
                  claiming,

                busy:
                  claiming,
              }}
              style={({
                pressed,
              }) => [
                styles.claimButton,

                !canClaimToday ||
                claiming
                  ? styles.claimButtonDisabled
                  : null,

                pressed &&
                canClaimToday &&
                !claiming
                  ? styles.pressed
                  : null,
              ]}
            >
              {claiming ? (
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.textInverse
                  }
                />
              ) : (
                <>
                  <AppText
                    variant="body"
                    weight="bold"
                    style={[
                      styles.claimButtonText,

                      !canClaimToday
                        ? styles.claimButtonTextDisabled
                        : null,
                    ]}
                  >
                    {canClaimToday
                      ? "CLAIM TODAY"
                      : "CLAIMED TODAY"}
                  </AppText>

                  <AppIcon
                    name={
                      canClaimToday
                        ? "next"
                        : "check"
                    }
                    size="sm"
                    color={
                      canClaimToday
                        ? Colors.textInverse
                        : Colors.textMuted
                    }
                  />
                </>
              )}
            </Pressable>
          </View>
        ) : null}

        {/* ====================================================
            UNLOCKED REWARD
        ==================================================== */}

        {rewardUnlocked ? (
          <View
            style={
              styles.unlockedCard
            }
          >
            <View
              style={
                styles.unlockedIcon
              }
            >
              <AppIcon
                name="success"
                size="lg"
                color={
                  Colors.success
                }
              />
            </View>

            <AppText
              variant="heading2"
              weight="bold"
              style={
                styles.unlockedTitle
              }
            >
              Congratulations!
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.unlockedDescription
              }
            >
              You completed your 90-day streak. Your free service reward is now unlocked.
            </AppText>

            <View
              style={
                styles.freeServiceBox
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.freeServiceLabel
                }
              >
                YOUR REWARD
              </AppText>

              <AppText
                variant="heading2"
                weight="bold"
                style={[
                  styles.freeServiceTitle,

                  rewardClaimed
                    ? styles.freeServiceTitleClaimed
                    : null,
                ]}
              >
                {rewardStatusLabel}
              </AppText>
            </View>

            {!rewardClaimed ? (
              <Pressable
                onPress={
                  handleFreeServiceClaim
                }
                accessibilityRole="button"
                accessibilityLabel="Claim free service"
                style={({
                  pressed,
                }) => [
                  styles.freeServiceButton,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppText
                  variant="body"
                  weight="bold"
                  style={
                    styles.freeServiceButtonText
                  }
                >
                  CLAIM FREE SERVICE
                </AppText>

                <AppIcon
                  name="next"
                  size="sm"
                  color={
                    Colors.textInverse
                  }
                />
              </Pressable>
            ) : (
              <View
                style={
                  styles.rewardClaimedBox
                }
              >
                <AppIcon
                  name="success"
                  size="sm"
                  color={
                    Colors.success
                  }
                />

                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.rewardClaimedText
                  }
                >
                  This free service reward has already been claimed.
                </AppText>
              </View>
            )}
          </View>
        ) : null}

        {/* ====================================================
            HOW IT WORKS
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
              name="info"
              size="sm"
              color={
                Colors.info
              }
            />
          </View>

          <View
            style={
              styles.infoContent
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.infoTitle
              }
            >
              How it works
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.infoText
              }
            >
              Claim once each day to increase your streak. If you stay away for 7 days, your streak starts again from Day 1.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            TERMS
        ==================================================== */}

        <View
          style={
            styles.termsCard
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.termsTitle
            }
          >
            Reward terms
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.termsText
            }
          >
            Daily claims are limited to one per day. A streak resets after 7 days without a claim. Completing Day 90 unlocks one eligible free service.
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

    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
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
       ERROR
    ======================================================== */

    errorBox: {
      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.errorSoft,
    },

    errorIcon: {
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

    errorContent: {
      flex: 1,

      minWidth: 0,
    },

    errorTitle: {
      color:
        Colors.error,
    },

    errorText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    retryButton: {
      alignSelf:
        "flex-start",

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    retryText: {
      color:
        CustomerColors.primary,
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
        FixxamTokens.spacing.lg,

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
       PROGRESS
    ======================================================== */

    progressCard: {
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

    progressHeader: {
      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    progressHeaderContent: {
      flex: 1,

      minWidth: 0,
    },

    progressTitle: {
      letterSpacing:
        0.8,

      color:
        Colors.textSecondary,
    },

    dayText: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    dayBadge: {
      minWidth:
        FixxamTokens.size.minimumTouchTarget,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    dayBadgeText: {
      color:
        CustomerColors.primary,
    },

    progressTrack: {
      height: 12,

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

    progressFooter: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    progressFooterText: {
      flex: 1,

      color:
        Colors.textSecondary,
    },

    progressPercentage: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       DAILY CLAIM
    ======================================================== */

    claimCard: {
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

    claimIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    claimedTodayIcon: {
      backgroundColor:
        Colors.successSoft,
    },

    claimTitle: {
      color:
        Colors.textPrimary,
    },

    claimDescription: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

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

    claimButtonText: {
      color:
        Colors.textInverse,

      letterSpacing:
        0.4,
    },

    claimButtonTextDisabled: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       UNLOCKED
    ======================================================== */

    unlockedCard: {
      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.xl,

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.successSoft,
    },

    unlockedIcon: {
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
        Colors.surface,
    },

    unlockedTitle: {
      color:
        Colors.textPrimary,
    },

    unlockedDescription: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    freeServiceBox: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    freeServiceLabel: {
      letterSpacing:
        0.7,

      color:
        Colors.success,
    },

    freeServiceTitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    freeServiceTitleClaimed: {
      color:
        Colors.success,
    },

    freeServiceButton: {
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

    freeServiceButtonText: {
      color:
        Colors.textInverse,

      letterSpacing:
        0.3,
    },

    rewardClaimedBox: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    rewardClaimedText: {
      flex: 1,

      color:
        Colors.success,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoCard: {
      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

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

    infoContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    infoTitle: {
      color:
        Colors.textPrimary,
    },

    infoText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 19,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       TERMS
    ======================================================== */

    termsCard: {
      padding:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    termsTitle: {
      color:
        Colors.textPrimary,
    },

    termsText: {
      marginTop:
        FixxamTokens.spacing.xs,

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