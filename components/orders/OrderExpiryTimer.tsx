import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  /**
   * Server-authoritative expiry timestamp
   * converted to milliseconds.
   */
  expiresAt: number | null;

  /**
   * UI callback only.
   *
   * IMPORTANT:
   * This callback must NOT be treated as the
   * authoritative cancellation mechanism.
   *
   * Backend expiry is responsible for cancelling
   * the booking after the response window ends.
   */
  onExpired: () =>
    void | Promise<void>;
};

/* ============================================================
   HELPERS
============================================================ */

function getRemainingSeconds(
  expiresAt: number | null,
): number {
  if (
    expiresAt === null ||
    !Number.isFinite(
      expiresAt,
    ) ||
    expiresAt <= 0
  ) {
    return 0;
  }

  const remainingMilliseconds =
    expiresAt -
    Date.now();

  if (
    !Number.isFinite(
      remainingMilliseconds,
    ) ||
    remainingMilliseconds <= 0
  ) {
    return 0;
  }

  return Math.ceil(
    remainingMilliseconds /
      1000,
  );
}

/* ============================================================
   TIME FORMAT
============================================================ */

/**
 * Formats the countdown as:
 *
 * < 1 hour:
 *   MM:SS
 *
 * >= 1 hour:
 *   HH:MM:SS
 *
 * A 24-hour offer therefore starts around:
 *
 * 24:00:00
 */
function formatTime(
  totalSeconds: number,
): string {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(
        totalSeconds,
      ),
    );

  const hours =
    Math.floor(
      safeSeconds /
        3600,
    );

  const minutes =
    Math.floor(
      (safeSeconds %
        3600) /
        60,
    );

  const seconds =
    safeSeconds %
    60;

  const paddedMinutes =
    String(
      minutes,
    ).padStart(
      2,
      "0",
    );

  const paddedSeconds =
    String(
      seconds,
    ).padStart(
      2,
      "0",
    );

  /*
   * For a 24-hour offer we want:
   *
   * 23:59:59
   * 12:08:31
   * 01:04:09
   *
   * For shorter durations:
   *
   * 59:59
   * 08:31
   */
  if (
    hours > 0
  ) {
    return `${String(
      hours,
    ).padStart(
      2,
      "0",
    )}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
}

/* ============================================================
   COMPONENT
============================================================ */

function OrderExpiryTimer({
  expiresAt,
  onExpired,
}: Props) {
  /* ==========================================================
     INITIAL STATE
  ========================================================== */

  const initialSeconds =
    useMemo(
      () =>
        getRemainingSeconds(
          expiresAt,
        ),
      [
        expiresAt,
      ],
    );

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] =
    useState(
      initialSeconds,
    );

  const [
    expiring,
    setExpiring,
  ] =
    useState(false);

  /**
   * Prevent duplicate expiry callbacks
   * for the same timestamp.
   */
  const handledExpiryRef =
    useRef<number | null>(
      null,
    );

  /**
   * Keep the latest callback without forcing
   * the countdown interval to restart every
   * time the parent creates a new callback.
   */
  const onExpiredRef =
    useRef(onExpired);

  useEffect(() => {
    onExpiredRef.current =
      onExpired;
  }, [
    onExpired,
  ]);

  /* ==========================================================
     RESET WHEN EXPIRY CHANGES
  ========================================================== */

  useEffect(() => {
    const nextSeconds =
      getRemainingSeconds(
        expiresAt,
      );

    setRemainingSeconds(
      nextSeconds,
    );

    setExpiring(
      false,
    );

    handledExpiryRef.current =
      null;
  }, [
    expiresAt,
  ]);

  /* ==========================================================
     EXPIRY HANDLER
  ========================================================== */

  const handleExpired =
    useCallback(
      async () => {
        /*
         * No expiry timestamp.
         */
        if (
          expiresAt === null ||
          !Number.isFinite(
            expiresAt,
          ) ||
          expiresAt <= 0
        ) {
          return;
        }

        /*
         * Prevent duplicate callbacks for
         * the same expiry timestamp.
         */
        if (
          handledExpiryRef.current ===
          expiresAt
        ) {
          return;
        }

        handledExpiryRef.current =
          expiresAt;

        setExpiring(
          true,
        );

        try {
          /*
           * IMPORTANT:
           *
           * This is only a UI notification.
           *
           * The callback may update local UI,
           * but backend cancellation remains
           * authoritative.
           */
          await onExpiredRef.current();
        } catch (error) {
          if (__DEV__) {
            console.warn(
              "ORDER_EXPIRY_HANDLER_ERROR",
              error,
            );
          }
        } finally {
          setExpiring(
            false,
          );
        }
      },
      [
        expiresAt,
      ],
    );

  /* ==========================================================
     COUNTDOWN
  ========================================================== */

  useEffect(() => {
    /*
     * Nothing to count down.
     */
    if (
      expiresAt === null ||
      !Number.isFinite(
        expiresAt,
      ) ||
      expiresAt <= 0
    ) {
      return;
    }

    let mounted =
      true;

    let interval:
      | ReturnType<
          typeof setInterval
        >
      | null =
      null;

    const checkExpiry =
      () => {
        if (!mounted) {
          return;
        }

        const seconds =
          getRemainingSeconds(
            expiresAt,
          );

        setRemainingSeconds(
          seconds,
        );

        if (
          seconds <= 0
        ) {
          if (interval) {
            clearInterval(
              interval,
            );

            interval =
              null;
          }

          void handleExpired();
        }
      };

    /*
     * Immediately calculate the current value.
     *
     * This prevents a 1-second delay on mount.
     */
    checkExpiry();

    /*
     * Only run the interval while there
     * is still time remaining.
     */
    if (
      getRemainingSeconds(
        expiresAt,
      ) > 0
    ) {
      interval =
        setInterval(
          checkExpiry,
          1000,
        );
    }

    return () => {
      mounted =
        false;

      if (interval) {
        clearInterval(
          interval,
        );
      }
    };
  }, [
    expiresAt,
    handleExpired,
  ]);

  /* ==========================================================
     NO EXPIRY
  ========================================================== */

  if (
    expiresAt === null ||
    !Number.isFinite(
      expiresAt,
    ) ||
    expiresAt <= 0
  ) {
    return null;
  }

  /* ==========================================================
     EXPIRED
  ========================================================== */

  if (
    remainingSeconds <= 0
  ) {
    return (
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel="Offer expired. The response window has ended."
        style={[
          styles.container,
          styles.expiredContainer,
        ]}
      >
        <View
          style={
            styles.iconContainer
          }
        >
          {expiring ? (
            <ActivityIndicator
              size="small"
              color={
                Colors.error
              }
            />
          ) : (
            <AppIcon
              name="clock"
              size="xs"
              color={
                Colors.error
              }
            />
          )}
        </View>

        <View
          style={
            styles.content
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={1}
            style={
              styles.expiredTitle
            }
          >
            Offer expired
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.subtitle
            }
          >
            The response window has ended.
          </AppText>
        </View>
      </View>
    );
  }

  /* ==========================================================
     WARNING
  ========================================================== */

  /*
   * Final 60 seconds.
   */
  const warning =
    remainingSeconds <=
    60;

  const formattedRemainingTime =
    formatTime(
      remainingSeconds,
    );

  /* ==========================================================
     ACTIVE TIMER
  ========================================================== */

  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Offer response window. ${formattedRemainingTime} remaining.`}
      style={[
        styles.container,

        warning
          ? styles.warningContainer
          : null,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={
          styles.iconContainer
        }
      >
        <AppIcon
          name={
            warning
              ? "clock"
              : "phone"
          }
          size="xs"
          color={
            warning
              ? Colors.warning
              : Colors.success
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="bodyMedium"
          weight="semibold"
          numberOfLines={1}
          style={[
            styles.title,

            warning
              ? styles.warningTitle
              : null,
          ]}
        >
          {warning
            ? "Offer expires soon"
            : "Offer response window"}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={
            styles.subtitle
          }
        >
          {warning
            ? "Respond before the timer ends."
            : "Accept or decline before expiry."}
        </AppText>
      </View>

      {/* ======================================================
          TIMER
      ====================================================== */}

      <View
        accessible
        accessibilityRole="timer"
        accessibilityLabel={`${formattedRemainingTime} remaining`}
        style={[
          styles.timerBadge,

          warning
            ? styles.warningTimerBadge
            : null,
        ]}
      >
        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={[
            styles.timerText,

            warning
              ? styles.warningTimerText
              : null,
          ]}
        >
          {formattedRemainingTime}
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      width:
        "100%",

      minHeight:
        56,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        7,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    warningContainer: {
      borderColor:
        Colors.warning,

      backgroundColor:
        Colors.warningSoft,
    },

    expiredContainer: {
      borderColor:
        Colors.error,

      backgroundColor:
        Colors.errorSoft,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconContainer: {
      width:
        34,

      height:
        34,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.success,
    },

    warningTitle: {
      color:
        Colors.warning,
    },

    expiredTitle: {
      color:
        Colors.error,
    },

    subtitle: {
      marginTop:
        1,

      lineHeight:
        15,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       TIMER
    ======================================================== */

    timerBadge: {
      minWidth:
        62,

      minHeight:
        28,

      paddingHorizontal:
        8,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    warningTimerBadge: {
      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.warning,
    },

    timerText: {
      letterSpacing:
        0.2,

      color:
        Colors.success,
    },

    warningTimerText: {
      color:
        Colors.warning,
    },
  });

/* ============================================================
   EXPORT
============================================================ */

OrderExpiryTimer.displayName =
  "OrderExpiryTimer";

export default memo(
  OrderExpiryTimer,
);