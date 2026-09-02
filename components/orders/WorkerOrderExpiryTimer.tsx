import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

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
  if (!value) {
    return null;
  }

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
    const millis = (
      value as {
        toMillis: () => number;
      }
    ).toMillis();

    return Number.isFinite(millis)
      ? millis
      : null;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string") {
    const millis = Date.parse(value);

    return Number.isFinite(millis)
      ? millis
      : null;
  }

  return null;
}

function formatRemaining(
  milliseconds: number,
): string {
  const totalSeconds = Math.max(
    0,
    Math.ceil(milliseconds / 1000),
  );

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(
      2,
      "0",
    )}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }

  return `${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(
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
  const expiryMillis = useMemo(
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
    if (!expiryMillis) {
      return 0;
    }

    return Math.max(
      0,
      expiryMillis - Date.now(),
    );
  });

  useEffect(() => {
    if (!expiryMillis) {
      setRemaining(0);
      return;
    }

    const updateTimer = () => {
      const nextRemaining =
        Math.max(
          0,
          expiryMillis - Date.now(),
        );

      setRemaining(nextRemaining);

      if (nextRemaining <= 0) {
        onExpired?.();
      }
    };

    updateTimer();

    const interval =
      setInterval(
        updateTimer,
        1000,
      );

    return () => {
      clearInterval(interval);
    };
  }, [
    expiryMillis,
    onExpired,
  ]);

  if (!expiryMillis) {
    return null;
  }

  const expired =
    remaining <= 0;

  return (
    <View
      style={[
        styles.container,
        expired &&
          styles.expiredContainer,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          expired &&
            styles.expiredIconContainer,
        ]}
      >
        <Ionicons
          name={
            expired
              ? "alert-circle-outline"
              : "time-outline"
          }
          size={19}
          color={
            expired
              ? "#DC2626"
              : "#D97706"
          }
        />
      </View>

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={[
            styles.title,
            expired &&
              styles.expiredTitle,
          ]}
        >
          {expired
            ? "OFFER EXPIRED"
            : "OFFER EXPIRES IN"}
        </AppText>

        {!expired ? (
          <AppText
            style={styles.timer}
          >
            {formatRemaining(
              remaining,
            )}
          </AppText>
        ) : (
          <AppText
            style={styles.expiredText}
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

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    minHeight: 62,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#FFF7E8",
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontSize: 9,
    letterSpacing: 0.6,
    color: "#92400E",
  },

  timer: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#D97706",
  },

  expiredContainer: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },

  expiredIconContainer: {
    backgroundColor: "#FEE2E2",
  },

  expiredTitle: {
    color: "#B91C1C",
  },

  expiredText: {
    marginTop: 3,
    fontSize: 9.5,
    lineHeight: 15,
    color: "#991B1B",
  },
});