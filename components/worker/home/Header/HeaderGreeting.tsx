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

import {
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
  workerName: string;
};

/* ============================================================
   HELPERS
============================================================ */

function getSubtitle(
  hour: number,
): string {
  if (
    hour >= 5 &&
    hour < 12
  ) {
    return "Ready to take new jobs today?";
  }

  if (
    hour >= 12 &&
    hour < 17
  ) {
    return "Hope your day is going well.";
  }

  if (
    hour >= 17 &&
    hour < 20
  ) {
    return "Let's finish today's bookings strong.";
  }

  return "Time to review today's work.";
}

/* ============================================================
   COMPONENT
============================================================ */

function HeaderGreeting({
  workerName,
}: Props) {
  const [
    currentHour,
    setCurrentHour,
  ] = useState(
    () =>
      new Date().getHours(),
  );

  /* ==========================================================
     KEEP TIME CURRENT
  ========================================================== */

  useEffect(() => {
    const interval =
      setInterval(() => {
        const nextHour =
          new Date().getHours();

        setCurrentHour(
          current =>
            current === nextHour
              ? current
              : nextHour,
        );
      }, 60_000);

    return () => {
      clearInterval(
        interval,
      );
    };
  }, []);

  /* ==========================================================
     DISPLAY VALUES
  ========================================================== */

  const displayName =
    useMemo(() => {
      if (
        typeof workerName !==
        "string"
      ) {
        return "Worker";
      }

      return (
        workerName.trim() ||
        "Worker"
      );
    }, [
      workerName,
    ]);

  const subtitle =
    useMemo(
      () =>
        getSubtitle(
          currentHour,
        ),
      [
        currentHour,
      ],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      <AppText
        variant="heading2"
        weight="bold"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={
          styles.name
        }
      >
        {displayName}
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={
          styles.subtitle
        }
      >
        {subtitle}
      </AppText>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

HeaderGreeting.displayName =
  "HeaderGreeting";

export default memo(
  HeaderGreeting,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      minWidth: 0,
    },

    name: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },
  });