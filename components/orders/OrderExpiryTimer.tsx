import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  expiresAt: number;
  onExpired: () => void | Promise<void>;
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
    !Number.isFinite(remaining) ||
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
  const safeSeconds = Math.max(
    0,
    Math.floor(totalSeconds),
  );

  const minutes =
    Math.floor(
      safeSeconds / 60,
    );

  const seconds =
    safeSeconds % 60;

  return `${String(
    minutes,
  ).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
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
  ] = useState(
    initialSeconds,
  );

  const [
    expiring,
    setExpiring,
  ] = useState(false);

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
  }, [expiresAt]);

  /* ==========================================================
     COUNTDOWN
  ========================================================== */

  useEffect(() => {
    if (
      !Number.isFinite(expiresAt) ||
      expiresAt <= 0
    ) {
      return;
    }

    let expiredHandled = false;

    const checkExpiry =
      () => {
        const seconds =
          getRemainingSeconds(
            expiresAt,
          );

        setRemainingSeconds(
          seconds,
        );

        if (
          seconds <= 0 &&
          !expiredHandled
        ) {
          expiredHandled = true;
          setExpiring(true);

          void onExpired();
        }
      };

    checkExpiry();

    const interval =
      setInterval(
        checkExpiry,
        1000,
      );

    return () => {
      clearInterval(
        interval,
      );
    };
  }, [
    expiresAt,
    onExpired,
  ]);

  /* ==========================================================
     INVALID DATE
  ========================================================== */

  if (
    !Number.isFinite(expiresAt) ||
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
          <Ionicons
            name="time-outline"
            size={20}
            color="#DC2626"
          />
        </View>

        <View
          style={styles.content}
        >
          <AppText
            weight="bold"
            style={styles.expiredTitle}
          >
            ORDER EXPIRED
          </AppText>

          <AppText
            style={styles.expiredSubtitle}
          >
            The 10-minute call window has ended.
          </AppText>
        </View>
      </View>
    );
  }

  /* ==========================================================
     COUNTDOWN
  ========================================================== */

  return (
    <View
      style={[
        styles.container,
        remainingSeconds <= 60 &&
          styles.warningContainer,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          remainingSeconds <= 60 &&
            styles.warningIconContainer,
        ]}
      >
        {expiring ? (
          <ActivityIndicator
            size="small"
            color="#D97706"
          />
        ) : (
          <Ionicons
            name="call-outline"
            size={20}
            color={
              remainingSeconds <= 60
                ? "#D97706"
                : "#16A34A"
            }
          />
        )}
      </View>

      <View
        style={styles.content}
      >
        <AppText
          weight="bold"
          style={[
            styles.title,
            remainingSeconds <= 60 &&
              styles.warningTitle,
          ]}
        >
          CALL WINDOW OPEN
        </AppText>

        <AppText
          style={[
            styles.subtitle,
            remainingSeconds <= 60 &&
              styles.warningSubtitle,
          ]}
        >
          Call worker before this order expires.
        </AppText>
      </View>

      <View
        style={[
          styles.timerBadge,
          remainingSeconds <= 60 &&
            styles.warningTimerBadge,
        ]}
      >
        <Ionicons
          name="timer-outline"
          size={14}
          color={
            remainingSeconds <= 60
              ? "#D97706"
              : "#15803D"
          }
        />

        <AppText
          weight="bold"
          style={[
            styles.timerText,
            remainingSeconds <= 60 &&
              styles.warningTimerText,
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
    container: {
      minHeight: 62,
      marginTop: 10,
      paddingHorizontal: 11,
      paddingVertical: 9,
      borderRadius: 16,
      backgroundColor:
        "#ECFDF5",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
      flexDirection: "row",
      alignItems: "center",
    },

    warningContainer: {
      backgroundColor:
        "#FFF7E8",
      borderColor:
        "#FDE68A",
    },

    expiredContainer: {
      backgroundColor:
        "#FEF2F2",
      borderColor:
        "#FECACA",
    },

    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        "#DCFCE7",
      alignItems: "center",
      justifyContent:
        "center",
    },

    warningIconContainer: {
      backgroundColor:
        "#FEF3C7",
    },

    expiredIconContainer: {
      backgroundColor:
        "#FEE2E2",
    },

    content: {
      flex: 1,
      marginLeft: 9,
      marginRight: 8,
    },

    title: {
      fontSize: 10,
      letterSpacing: 0.3,
      color: "#15803D",
    },

    warningTitle: {
      color: "#B45309",
    },

    expiredTitle: {
      color: "#B91C1C",
    },

    subtitle: {
      marginTop: 3,
      fontSize: 8.8,
      lineHeight: 14,
      color: "#166534",
    },

    warningSubtitle: {
      color: "#92400E",
    },

    expiredSubtitle: {
      marginTop: 3,
      fontSize: 8.8,
      lineHeight: 14,
      color: "#991B1B",
    },

    timerBadge: {
      minWidth: 70,
      height: 34,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor:
        "#DCFCE7",
      alignItems: "center",
      justifyContent:
        "center",
      flexDirection: "row",
      gap: 4,
    },

    warningTimerBadge: {
      backgroundColor:
        "#FEF3C7",
    },

    timerText: {
      fontSize: 11,
      color: "#15803D",
      letterSpacing: 0.3,
    },

    warningTimerText: {
      color: "#B45309",
    },
  });