import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  Timestamp,
} from "firebase/firestore";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

type Props = {
  createdAt: unknown;
};

function getDateValue(
  value: unknown,
): Date | null {
  if (!value) {
    return null;
  }

  try {
    if (
      value instanceof Date
    ) {
      return value;
    }

    if (
      value instanceof Timestamp
    ) {
      return value.toDate();
    }

    if (
      typeof value ===
        "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (
        value as {
          toDate?: unknown;
        }
      ).toDate ===
        "function"
    ) {
      return (
        value as {
          toDate: () => Date;
        }
      ).toDate();
    }

    if (
      typeof value ===
        "string" ||
      typeof value ===
        "number"
    ) {
      const date =
        new Date(
          value,
        );

      if (
        !Number.isNaN(
          date.getTime(),
        )
      ) {
        return date;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function formatCreatedDate(
  value: unknown,
): string {
  const date =
    getDateValue(
      value,
    );

  if (!date) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",

      month: "short",

      year: "numeric",
    },
  );
}

function formatCreatedTime(
  value: unknown,
): string {
  const date =
    getDateValue(
      value,
    );

  if (!date) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-NG",
    {
      hour: "numeric",

      minute: "2-digit",
    },
  );
}

function WorkerOrderFooterSection({
  createdAt,
}: Props) {
  const createdDate =
    formatCreatedDate(
      createdAt,
    );

  const createdTime =
    formatCreatedTime(
      createdAt,
    );

  return (
    <View
      style={
        styles.createdInfo
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
        tone="secondary"
        style={
          styles.createdText
        }
      >
        Received{" "}
        {createdDate}
        {createdTime
          ? ` • ${createdTime}`
          : ""}
      </AppText>
    </View>
  );
}

export default memo(
  WorkerOrderFooterSection,
);

const styles =
  StyleSheet.create({
    createdInfo: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    createdText: {
      color:
        Colors.textMuted,
    },
  });