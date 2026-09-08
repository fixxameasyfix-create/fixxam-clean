import React, {
  memo,
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
  expiresAt: number;

  onExpired: () =>
    void | Promise<void>;
};

/* ============================================================
   HELPERS
============================================================ */

function getRemainingSeconds(
  expiresAt: number,
): number {
  const remaining =
    expiresAt - Date.now();

  if (
    !Number.isFinite(
      remaining,
    ) ||
    remaining <= 0
  ) {
    return 0;
  }

  return Math.ceil(
    remaining / 1000,
  );
}

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

  const minutes =
    Math.floor(
      safeSeconds / 60,
    );

  const seconds =
    safeSeconds % 60;

  return `${String(
    minutes,
  ).padStart(
    2,
    "0",
  )}:${String(
    seconds,
  ).padStart(
    2,
    "0",
  )}`;
}

/* ============================================================
   COMPONENT
============================================================ */

function OrderExpiryTimer({
  expiresAt,
  onExpired,
}: Props) {
  const initialSeconds =
    useMemo(
      () =>
        getRemainingSeconds(
          expiresAt,
        ),
      [expiresAt],
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
  ] = useState(false);

  /*
   * Prevent duplicate expiry callbacks
   * if the effect restarts because the
   * callback identity changes.
   */
  const handledExpiryRef =
    useRef<number | null>(
      null,
    );

  /* ==========================================================
     RESET WHEN EXPIRY CHANGES
  ========================================================== */

  useEffect(() => {
    setRemainingSeconds(
      getRemainingSeconds(
        expiresAt,
      ),
    );

    setExpiring(false);

    handledExpiryRef.current =
      null;
  }, [expiresAt]);

  /* ==========================================================
     COUNTDOWN
  ========================================================== */

  useEffect(() => {
    if (
      !Number.isFinite(
        expiresAt,
      ) ||
      expiresAt <= 0
    ) {
      return;
    }

    let mounted = true;

    let interval:
      | ReturnType<
          typeof setInterval
        >
      | null = null;

    const handleExpired =
      async () => {
        if (
          handledExpiryRef.current ===
          expiresAt
        ) {
          return;
        }

        handledExpiryRef.current =
          expiresAt;

        if (mounted) {
          setExpiring(true);
        }

        try {
          await onExpired();
        } catch (error) {
          console.error(
            "ORDER_EXPIRY_HANDLER_ERROR",
            error,
          );
        } finally {
          if (mounted) {
            setExpiring(false);
          }
        }
      };

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

        if (seconds <= 0) {
          if (interval) {
            clearInterval(
              interval,
            );

            interval = null;
          }

          void handleExpired();
        }
      };

    checkExpiry();

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
      mounted = false;

      if (interval) {
        clearInterval(
          interval,
        );
      }
    };
  }, [
    expiresAt,
    onExpired,
  ]);

  /* ==========================================================
     INVALID EXPIRY
  ========================================================== */

  if (
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
        accessibilityLabel="Order expired. The 10-minute call window has ended."
        style={[
          styles.container,
          styles.expiredContainer,
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            styles.expiredIconContainer,
          ]}
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
              size="sm"
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
            variant="caption"
            weight="bold"
            style={
              styles.expiredTitle
            }
          >
            ORDER EXPIRED
          </AppText>

          <AppText
            variant="caption"
            style={
              styles.expiredSubtitle
            }
          >
            The 10-minute call window has ended.
          </AppText>
        </View>
      </View>
    );
  }

  /* ==========================================================
     ACTIVE / WARNING
  ========================================================== */

  const warning =
    remainingSeconds <= 60;

  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Call window open. ${formatTime(
        remainingSeconds,
      )} remaining.`}
      style={[
        styles.container,

        warning
          ? styles.warningContainer
          : null,
      ]}
    >
      {/* ======================================================
          CALL ICON
      ====================================================== */}

      <View
        style={[
          styles.iconContainer,

          warning
            ? styles.warningIconContainer
            : null,
        ]}
      >
        <AppIcon
          name="phone"
          size="sm"
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
          variant="caption"
          weight="bold"
          style={[
            styles.title,

            warning
              ? styles.warningTitle
              : null,
          ]}
        >
          CALL WINDOW OPEN
        </AppText>

        <AppText
          variant="caption"
          style={[
            styles.subtitle,

            warning
              ? styles.warningSubtitle
              : null,
          ]}
        >
          Call worker before this order expires.
        </AppText>
      </View>

      {/* ======================================================
          TIMER
      ====================================================== */}

      <View
        style={[
          styles.timerBadge,

          warning
            ? styles.warningTimerBadge
            : null,
        ]}
      >
        <AppIcon
          name="clock"
          size="xs"
          color={
            warning
              ? Colors.warning
              : Colors.success
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          style={[
            styles.timerText,

            warning
              ? styles.warningTimerText
              : null,
          ]}
        >
          {formatTime(
            remainingSeconds,
          )}
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  OrderExpiryTimer,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      minHeight: 62,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

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
      width: 40,

      height: 40,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    warningIconContainer: {
      backgroundColor:
        Colors.surface,
    },

    expiredIconContainer: {
      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      letterSpacing: 0.3,

      color:
        Colors.success,
    },

    warningTitle: {
      color:
        Colors.warning,
    },

    expiredTitle: {
      letterSpacing: 0.3,

      color:
        Colors.error,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 15,

      color:
        Colors.textSecondary,
    },

    warningSubtitle: {
      color:
        Colors.textSecondary,
    },

    expiredSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 15,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       TIMER BADGE
    ======================================================== */

    timerBadge: {
      minWidth: 72,

      minHeight: 36,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexShrink: 0,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    warningTimerBadge: {
      backgroundColor:
        Colors.surface,
    },

    timerText: {
      letterSpacing: 0.3,

      color:
        Colors.success,
    },

    warningTimerText: {
      color:
        Colors.warning,
    },
  });