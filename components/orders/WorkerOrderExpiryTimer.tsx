import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
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
  expiresAt: unknown;

  onExpired?: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function resolveTimestampMillis(
  value: unknown,
): number | null {
  if (value == null) {
    return null;
  }

  /* ========================================================
     FIRESTORE TIMESTAMP
  ======================================================== */

  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (
      value as {
        toMillis?: unknown;
      }
    ).toMillis === "function"
  ) {
    try {
      const millis = (
        value as {
          toMillis: () => number;
        }
      ).toMillis();

      return Number.isFinite(millis)
        ? millis
        : null;
    } catch {
      return null;
    }
  }

  /* ========================================================
     NUMBER
  ======================================================== */

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  /* ========================================================
     DATE
  ======================================================== */

  if (value instanceof Date) {
    const millis =
      value.getTime();

    return Number.isFinite(millis)
      ? millis
      : null;
  }

  /* ========================================================
     STRING DATE
  ======================================================== */

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    const millis =
      Date.parse(
        value.trim(),
      );

    return Number.isFinite(millis)
      ? millis
      : null;
  }

  return null;
}

function getRemainingMilliseconds(
  expiryMillis: number,
): number {
  return Math.max(
    0,
    expiryMillis - Date.now(),
  );
}

function formatRemaining(
  milliseconds: number,
): string {
  const totalSeconds =
    Math.max(
      0,
      Math.ceil(
        milliseconds / 1000,
      ),
    );

  const hours =
    Math.floor(
      totalSeconds / 3600,
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60,
    );

  const seconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${String(
      hours,
    ).padStart(
      2,
      "0",
    )}:${String(
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

function WorkerOrderExpiryTimer({
  expiresAt,
  onExpired,
}: Props) {
  const expiryMillis =
    useMemo(
      () =>
        resolveTimestampMillis(
          expiresAt,
        ),
      [expiresAt],
    );

  const [
    remaining,
    setRemaining,
  ] = useState(() => {
    if (
      expiryMillis === null
    ) {
      return 0;
    }

    return getRemainingMilliseconds(
      expiryMillis,
    );
  });

  /*
   * Keep latest callback without
   * restarting the countdown whenever
   * callback identity changes.
   */
  const onExpiredRef =
    useRef(onExpired);

  /*
   * Prevent duplicate expiry callback.
   */
  const handledExpiryRef =
    useRef<number | null>(
      null,
    );

  /* ==========================================================
     KEEP CALLBACK CURRENT
  ========================================================== */

  useEffect(() => {
    onExpiredRef.current =
      onExpired;
  }, [onExpired]);

  /* ==========================================================
     COUNTDOWN
  ========================================================== */

  useEffect(() => {
    handledExpiryRef.current =
      null;

    if (
      expiryMillis === null
    ) {
      setRemaining(0);

      return;
    }

    let mounted = true;

    let interval:
      | ReturnType<
          typeof setInterval
        >
      | null = null;

    const handleExpired =
      () => {
        if (
          handledExpiryRef.current ===
          expiryMillis
        ) {
          return;
        }

        handledExpiryRef.current =
          expiryMillis;

        try {
          onExpiredRef.current?.();
        } catch (error) {
          console.error(
            "WORKER_ORDER_EXPIRY_CALLBACK_ERROR",
            error,
          );
        }
      };

    const updateTimer =
      (): boolean => {
        if (!mounted) {
          return false;
        }

        const nextRemaining =
          getRemainingMilliseconds(
            expiryMillis,
          );

        setRemaining(
          nextRemaining,
        );

        if (
          nextRemaining <= 0
        ) {
          handleExpired();

          return false;
        }

        return true;
      };

    const shouldContinue =
      updateTimer();

    if (shouldContinue) {
      interval =
        setInterval(
          () => {
            const stillActive =
              updateTimer();

            if (
              !stillActive &&
              interval
            ) {
              clearInterval(
                interval,
              );

              interval = null;
            }
          },
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
  }, [expiryMillis]);

  /* ==========================================================
     INVALID EXPIRY
  ========================================================== */

  if (
    expiryMillis === null
  ) {
    return null;
  }

  const expired =
    remaining <= 0;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      accessible
      accessibilityLabel={
        expired
          ? "Offer expired. This offer is no longer available."
          : `Offer expires in ${formatRemaining(
              remaining,
            )}.`
      }
      style={[
        styles.container,

        expired
          ? styles.expiredContainer
          : null,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={[
          styles.iconContainer,

          expired
            ? styles.expiredIconContainer
            : null,
        ]}
      >
        <AppIcon
          name={
            expired
              ? "error"
              : "clock"
          }
          size="sm"
          color={
            expired
              ? Colors.error
              : Colors.warning
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={styles.content}
      >
        <AppText
          variant="caption"
          weight="bold"
          style={[
            styles.title,

            expired
              ? styles.expiredTitle
              : null,
          ]}
        >
          {expired
            ? "OFFER EXPIRED"
            : "OFFER EXPIRES IN"}
        </AppText>

        {!expired ? (
          <AppText
            variant="bodyLarge"
            weight="bold"
            style={styles.timer}
          >
            {formatRemaining(
              remaining,
            )}
          </AppText>
        ) : (
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.expiredText
            }
          >
            This offer is no longer available.
          </AppText>
        )}
      </View>
    </View>
  );
}

export default memo(
  WorkerOrderExpiryTimer,
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

      padding:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.warning,

      borderRadius:
        FixxamTokens.radius.lg,

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
      width: 42,

      height: 42,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

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
    },

    title: {
      letterSpacing: 0.6,

      color:
        Colors.warning,
    },

    timer: {
      marginTop:
        FixxamTokens.spacing.xxs,

      letterSpacing: 0.8,

      color:
        Colors.warning,
    },

    /* ========================================================
       EXPIRED
    ======================================================== */

    expiredTitle: {
      color:
        Colors.error,
    },

    expiredText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 15,
    },
  });