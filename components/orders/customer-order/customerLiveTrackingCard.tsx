import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import type {
  LiveLocation,
} from "./customerOrder.types";

import {
  resolveTimestampMillis,
} from "./customerOrder.utils";

/* ============================================================
   CONSTANTS
============================================================ */

const LIVE_LOCATION_RECENT_SECONDS =
  30;

const LIVE_STATUS_REFRESH_MS =
  10_000;

/* ============================================================
   TYPES
============================================================ */

type Props = {
  workerName: string;

  location:
    | LiveLocation
    | null;

  onOpenMap: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function formatElapsedTime(
  seconds: number,
): string {
  if (seconds <= 0) {
    return "just now";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes =
    Math.floor(
      seconds / 60,
    );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  return `${days}d ago`;
}

/* ============================================================
   COMPONENT
============================================================ */

function CustomerLiveTrackingCardComponent({
  workerName,
  location,
  onOpenMap,
}: Props) {
  const [
    now,
    setNow,
  ] = useState(
    () => Date.now(),
  );

  const updatedAt =
    useMemo(
      () =>
        resolveTimestampMillis(
          location?.updatedAt,
        ),
      [
        location?.updatedAt,
      ],
    );

  /* ==========================================================
     KEEP LIVE STATUS FRESH
  ========================================================== */

  useEffect(() => {
    setNow(
      Date.now(),
    );

    if (
      !location ||
      updatedAt === null
    ) {
      return;
    }

    const timer =
      setInterval(
        () => {
          setNow(
            Date.now(),
          );
        },
        LIVE_STATUS_REFRESH_MS,
      );

    return () => {
      clearInterval(
        timer,
      );
    };
  }, [
    location,
    updatedAt,
  ]);

  /* ==========================================================
     LIVE STATE
  ========================================================== */

  const secondsAgo =
    useMemo(() => {
      if (
        updatedAt === null
      ) {
        return null;
      }

      return Math.max(
        0,
        Math.floor(
          (now -
            updatedAt) /
            1000,
        ),
      );
    }, [
      now,
      updatedAt,
    ]);

  const isLive =
    location !== null &&
    secondsAgo !== null &&
    secondsAgo <=
      LIVE_LOCATION_RECENT_SECONDS;

  const statusColor =
    isLive
      ? Colors.success
      : Colors.warning;

  const statusBackground =
    isLive
      ? Colors.successSoft
      : Colors.warningSoft;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={styles.card}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={styles.topRow}
      >
        <View
          style={styles.icon}
        >
          <AppIcon
            name="navigation"
            size="md"
            color={
              statusColor
            }
          />
        </View>

        <View
          style={styles.content}
        >
          <View
            style={styles.titleRow}
          >
            <AppText
              variant="caption"
              weight="bold"
              style={styles.title}
            >
              LIVE LOCATION
            </AppText>

            <View
              style={[
                styles.badge,

                {
                  backgroundColor:
                    statusBackground,
                },
              ]}
            >
              <View
                style={[
                  styles.liveDot,

                  {
                    backgroundColor:
                      statusColor,
                  },
                ]}
              />

              <AppText
                variant="caption"
                weight="bold"
                style={[
                  styles.badgeText,

                  {
                    color:
                      statusColor,
                  },
                ]}
              >
                {isLive
                  ? "LIVE"
                  : "WAITING"}
              </AppText>
            </View>
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.description
            }
          >
            {location
              ? isLive
                ? `${workerName} is sharing their current location with you.`
                : `${workerName}'s latest location is waiting for an update.`
              : `${workerName} has not shared a live location yet.`}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          LOCATION AVAILABLE
      ====================================================== */}

      {location ? (
        <>
          {/* COORDINATES */}

          <View
            style={
              styles.locationInfo
            }
          >
            <View
              style={
                styles.coordinateItem
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.coordinateLabel
                }
              >
                LATITUDE
              </AppText>

              <AppText
                variant="caption"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.coordinateValue
                }
              >
                {location.latitude.toFixed(
                  6,
                )}
              </AppText>
            </View>

            <View
              style={
                styles.coordinateItem
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.coordinateLabel
                }
              >
                LONGITUDE
              </AppText>

              <AppText
                variant="caption"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.coordinateValue
                }
              >
                {location.longitude.toFixed(
                  6,
                )}
              </AppText>
            </View>

            {location.accuracy !==
              null &&
            location.accuracy !==
              undefined ? (
              <View
                style={
                  styles.coordinateItem
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.coordinateLabel
                  }
                >
                  ACCURACY
                </AppText>

                <AppText
                  variant="caption"
                  weight="bold"
                  numberOfLines={1}
                  style={
                    styles.coordinateValue
                  }
                >
                  ±
                  {Math.round(
                    location.accuracy,
                  )}
                  m
                </AppText>
              </View>
            ) : null}
          </View>

          {/* OPEN MAP */}

          <Pressable
            onPress={
              onOpenMap
            }
            accessibilityRole="button"
            accessibilityLabel={`View ${workerName}'s live location`}
            style={({
              pressed,
            }) => [
              styles.mapButton,

              pressed
                ? styles.buttonPressed
                : null,
            ]}
          >
            <AppIcon
              name="location"
              role="customer"
              size="sm"
              color={
                Colors.textInverse
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.mapButtonText
              }
            >
              VIEW LIVE LOCATION
            </AppText>

            <AppIcon
              name="next"
              size="xs"
              color={
                Colors.textInverse
              }
            />
          </Pressable>

          {/* LAST UPDATE */}

          {secondsAgo !==
          null ? (
            <View
              style={
                styles.updatedRow
              }
            >
              <AppIcon
                name="clock"
                size="xs"
                color={
                  Colors.textMuted
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.updatedText
                }
              >
                Updated{" "}
                {formatElapsedTime(
                  secondsAgo,
                )}
              </AppText>
            </View>
          ) : null}
        </>
      ) : (
        /* ====================================================
           WAITING
        ==================================================== */

        <View
          style={
            styles.waitingLocation
          }
        >
          <ActivityIndicator
            size="small"
            color={
              Colors.warning
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.waitingText
            }
          >
            Waiting for worker location...
          </AppText>
        </View>
      )}
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const CustomerLiveTrackingCard =
  memo(
    CustomerLiveTrackingCardComponent,
  );

export default CustomerLiveTrackingCard;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginTop:
        FixxamTokens.spacing.lg,

      marginHorizontal:
        FixxamTokens.spacing.lg,

      padding:
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

    /* ========================================================
       HEADER
    ======================================================== */

    topRow: {
      flexDirection: "row",

      alignItems:
        "flex-start",
    },

    icon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    titleRow: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    title: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATUS BADGE
    ======================================================== */

    badge: {
      minHeight: 26,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      borderRadius:
        FixxamTokens.radius.chip,
    },

    liveDot: {
      width: 6,

      height: 6,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    badgeText: {
      letterSpacing: 0.3,
    },

    /* ========================================================
       COORDINATES
    ======================================================== */

    locationInfo: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    coordinateItem: {
      flex: 1,

      minWidth: 0,
    },

    coordinateLabel: {
      letterSpacing: 0.5,

      color:
        Colors.textMuted,
    },

    coordinateValue: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       MAP BUTTON
    ======================================================== */

    mapButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    mapButtonText: {
      flex: 1,

      textAlign: "center",

      color:
        Colors.textInverse,
    },

    /* ========================================================
       UPDATED
    ======================================================== */

    updatedRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    updatedText: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       WAITING
    ======================================================== */

    waitingLocation: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.warningSoft,
    },

    waitingText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PRESSED
    ======================================================== */

    buttonPressed: {
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