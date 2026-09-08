import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
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
  Image,
} from "expo-image";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  httpsCallable,
} from "firebase/functions";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
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

type RewardType =
  | "service-promotion-free-service"
  | "90-day-free-service";

type ClaimRewardResponse = {
  success: boolean;

  rewardId: string;

  message: string;
};

type RouteParams = {
  reward?:
    | string
    | string[];

  workerId?:
    | string
    | string[];

  workerName?:
    | string
    | string[];

  workerPhoto?:
    | string
    | string[];

  serviceId?:
    | string
    | string[];

  serviceName?:
    | string
    | string[];
};

/* ============================================================
   CLOUD FUNCTION
============================================================ */

const claimServicePromotionReward =
  httpsCallable<
    {
      workerId: string;

      serviceId: string;

      reward: RewardType;
    },
    ClaimRewardResponse
  >(
    functions,
    "claimServicePromotionReward",
  );

/* ============================================================
   HELPERS
============================================================ */

function getParamString(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

function isRewardType(
  value: string,
): value is RewardType {
  return (
    value ===
      "service-promotion-free-service" ||
    value ===
      "90-day-free-service"
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

export default function ConfirmFreeServiceScreen() {
  const params =
    useLocalSearchParams<RouteParams>();

  const reward =
    useMemo(
      () =>
        getParamString(
          params.reward,
        ),
      [
        params.reward,
      ],
    );

  const workerId =
    useMemo(
      () =>
        getParamString(
          params.workerId,
        ),
      [
        params.workerId,
      ],
    );

  const workerName =
    useMemo(
      () =>
        getParamString(
          params.workerName,
        ) ||
        "Selected Worker",
      [
        params.workerName,
      ],
    );

  const workerPhoto =
    useMemo(
      () =>
        getParamString(
          params.workerPhoto,
        ),
      [
        params.workerPhoto,
      ],
    );

  const serviceId =
    useMemo(
      () =>
        getParamString(
          params.serviceId,
        ),
      [
        params.serviceId,
      ],
    );

  const serviceName =
    useMemo(
      () =>
        getParamString(
          params.serviceName,
        ) ||
        "Selected Service",
      [
        params.serviceName,
      ],
    );

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    claiming,
    setClaiming,
  ] =
    useState(false);

  const claimInFlight =
    useRef(false);

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validReward =
    isRewardType(
      reward,
    );

  const canClaim =
    Boolean(
      workerId &&
      serviceId &&
      validReward,
    );

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      if (
        claimInFlight.current
      ) {
        return;
      }

      router.back();
    }, []);

  /* ==========================================================
     CLAIM REWARD
  ========================================================== */

  const handleConfirm =
    useCallback(async () => {
      if (
        claimInFlight.current ||
        claiming
      ) {
        return;
      }

      if (
        !auth.currentUser
      ) {
        showErrorToast(
          "Sign in required",
          "Please sign in again before claiming this reward.",
        );

        return;
      }

      if (
        !workerId ||
        !serviceId ||
        !validReward
      ) {
        showErrorToast(
          "Unable to continue",
          "The reward information is incomplete. Please go back and select the service again.",
        );

        return;
      }

      claimInFlight.current =
        true;

      setClaiming(
        true,
      );

      try {
        /*
         * SECURITY:
         *
         * Navigation params are display/input only.
         *
         * The callable Cloud Function must independently:
         * - authenticate the customer
         * - verify reward eligibility
         * - verify worker/service validity
         * - prevent duplicate claims
         * - perform the claim atomically
         */

        const result =
          await claimServicePromotionReward({
            workerId,

            serviceId,

            reward,
          });

        if (
          !result.data.success
        ) {
          throw new Error(
            result.data.message ||
              "CLAIM_FAILED",
          );
        }

        showSuccessToast(
          "Free Service Claimed",
          "Your free service has been successfully claimed.",
        );

        router.replace(
          "/(customer)/(tabs)/orders",
        );
      } catch (
        error
      ) {
        console.error(
          "FREE_SERVICE_CLAIM_ERROR:",
          error,
        );

        showErrorToast(
          "Claim Failed",
          "We could not complete your free service claim. Please try again.",
        );
      } finally {
        claimInFlight.current =
          false;

        setClaiming(
          false,
        );
      }
    }, [
      claiming,
      reward,
      serviceId,
      validReward,
      workerId,
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
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          onPress={
            handleBack
          }
          disabled={
            claiming
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityState={{
            disabled:
              claiming,
          }}
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed &&
            !claiming
              ? styles.pressed
              : null,

            claiming
              ? styles.disabled
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

        <AppText
          variant="heading2"
          weight="bold"
          center
          numberOfLines={1}
          style={
            styles.title
          }
        >
          Confirm Free Service
        </AppText>

        <View
          style={
            styles.headerPlaceholder
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ====================================================
            REWARD
        ==================================================== */}

        <View
          style={
            styles.rewardCard
          }
        >
          <View
            style={
              styles.rewardIcon
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
            center
            style={
              styles.rewardTitle
            }
          >
            Free Service Reward
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.rewardDescription
            }
          >
            You are using your Fixxam free service reward.
          </AppText>
        </View>

        {/* ====================================================
            SERVICE
        ==================================================== */}

        <View
          style={
            styles.card
          }
        >
          <AppText
            variant="body"
            weight="bold"
            style={
              styles.sectionTitle
            }
          >
            Selected Service
          </AppText>

          <View
            style={
              styles.serviceRow
            }
          >
            <View
              style={
                styles.serviceIcon
              }
            >
              <AppIcon
                name="service"
                role="customer"
                size="md"
                color={
                  CustomerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.serviceContent
              }
            >
              <AppText
                variant="body"
                weight="bold"
                numberOfLines={2}
                style={
                  styles.serviceName
                }
              >
                {serviceName}
              </AppText>

              <View
                style={
                  styles.freeBadge
                }
              >
                <AppIcon
                  name="success"
                  size="xs"
                  color={
                    Colors.success
                  }
                />

                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.freeText
                  }
                >
                  FREE
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* ====================================================
            WORKER
        ==================================================== */}

        <View
          style={
            styles.card
          }
        >
          <AppText
            variant="body"
            weight="bold"
            style={
              styles.sectionTitle
            }
          >
            Selected Worker
          </AppText>

          <View
            style={
              styles.workerRow
            }
          >
            <WorkerPhoto
              uri={
                workerPhoto
              }
              name={
                workerName
              }
            />

            <View
              style={
                styles.workerContent
              }
            >
              <AppText
                variant="body"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.workerName
                }
              >
                {workerName}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.workerDescription
                }
              >
                Your selected service provider.
              </AppText>
            </View>
          </View>
        </View>

        {/* ====================================================
            NOTICE
        ==================================================== */}

        <View
          style={
            styles.notice
          }
        >
          <View
            style={
              styles.noticeIcon
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
              styles.noticeText
            }
          >
            The service price will be covered by your eligible Fixxam reward.
          </AppText>
        </View>

        {/* ====================================================
            CONFIRM
        ==================================================== */}

        <Pressable
          disabled={
            claiming
          }
          onPress={() => {
            void handleConfirm();
          }}
          accessibilityRole="button"
          accessibilityLabel="Confirm free service"
          accessibilityState={{
            disabled:
              claiming,
            busy:
              claiming,
          }}
          style={({
            pressed,
          }) => [
            styles.confirmButton,

            claiming
              ? styles.disabled
              : null,

            pressed &&
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
            <AppIcon
              name="check"
              size="sm"
              color={
                Colors.textInverse
              }
            />
          )}

          <AppText
            variant="body"
            weight="bold"
            style={
              styles.confirmText
            }
          >
            {claiming
              ? "CLAIMING..."
              : "CONFIRM FREE SERVICE"}
          </AppText>
        </Pressable>

        {/* ====================================================
            CHANGE
        ==================================================== */}

        <Pressable
          disabled={
            claiming
          }
          onPress={
            handleBack
          }
          accessibilityRole="button"
          accessibilityLabel="Change service or worker"
          accessibilityState={{
            disabled:
              claiming,
          }}
          style={({
            pressed,
          }) => [
            styles.changeButton,

            pressed &&
            !claiming
              ? styles.pressed
              : null,

            claiming
              ? styles.disabled
              : null,
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.changeText
            }
          >
            CHANGE SERVICE OR WORKER
          </AppText>
        </Pressable>

        {!canClaim ? (
          <View
            style={
              styles.invalidNotice
            }
          >
            <AppIcon
              name="warning"
              size="sm"
              color={
                Colors.warning
              }
            />

            <AppText
              variant="caption"
              style={
                styles.invalidNoticeText
              }
            >
              Some reward information is missing. Go back and select the service again if confirmation fails.
            </AppText>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   WORKER PHOTO
============================================================ */

const WorkerPhoto =
  memo(
    function WorkerPhoto({
      uri,
      name,
    }: {
      uri: string;

      name: string;
    }) {
      const [
        failed,
        setFailed,
      ] =
        useState(false);

      const showImage =
        uri.length > 0 &&
        !failed;

      return (
        <View
          style={
            styles.workerImageBox
          }
        >
          {showImage ? (
            <Image
              source={{
                uri,
              }}
              contentFit="cover"
              transition={150}
              accessibilityLabel={`${name} profile photo`}
              onError={() => {
                setFailed(
                  true,
                );
              }}
              style={
                styles.workerImage
              }
            />
          ) : (
            <AppIcon
              name="profile"
              size="lg"
              color={
                Colors.textMuted
              }
            />
          )}
        </View>
      );
    },
  );

WorkerPhoto.displayName =
  "WorkerPhoto";

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

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    scrollContent: {
      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        FixxamTokens.size.headerHeight,

      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

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

    headerPlaceholder: {
      width:
        FixxamTokens.size.minimumTouchTarget,
    },

    title: {
      flex: 1,

      marginHorizontal:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       REWARD
    ======================================================== */

    rewardCard: {
      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    rewardIcon: {
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

    rewardTitle: {
      color:
        Colors.textPrimary,
    },

    rewardDescription: {
      maxWidth: 310,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginBottom:
        FixxamTokens.spacing.md,

      padding:
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

    sectionTitle: {
      marginBottom:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       SERVICE
    ======================================================== */

    serviceRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    serviceIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    serviceContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    serviceName: {
      color:
        Colors.textPrimary,
    },

    freeBadge: {
      alignSelf:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.successSoft,
    },

    freeText: {
      color:
        Colors.success,
    },

    /* ========================================================
       WORKER
    ======================================================== */

    workerRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    workerImageBox: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      overflow:
        "hidden",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    workerImage: {
      width: "100%",

      height: "100%",
    },

    workerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    workerName: {
      color:
        Colors.textPrimary,
    },

    workerDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       NOTICE
    ======================================================== */

    notice: {
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

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.infoSoft,
    },

    noticeIcon: {
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

    noticeText: {
      flex: 1,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CONFIRM
    ======================================================== */

    confirmButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

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

    confirmText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       CHANGE
    ======================================================== */

    changeButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    changeText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       INVALID
    ======================================================== */

    invalidNotice: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.warningSoft,
    },

    invalidNoticeText: {
      flex: 1,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATES
    ======================================================== */

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

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