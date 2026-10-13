import React, {
  useCallback,
} from "react";

import {
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
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orderId: string;

  createdDate: string;

  refreshing: boolean;

  statusLabel: string;

  statusIcon: React.ComponentProps<
    typeof AppIcon
  >["name"];

  statusColor: string;

  statusBackgroundColor: string;

  onBack: () => void;

  onRefresh: () => void;

  onMore?: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function WorkerMarketOrderHeaderSection({
  refreshing,
  onBack,
  onRefresh,
  onMore,
}: Props) {
  const handleMore =
    useCallback(() => {
      if (onMore) {
        onMore();

        return;
      }

      onRefresh();
    }, [
      onMore,
      onRefresh,
    ]);

  return (
    <View
      style={
        styles.container
      }
    >
      {/* BACK */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={
          onBack
        }
        style={({
          pressed,
        }) => [
          styles.actionButton,

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

      {/* TITLE */}

      <View
        style={
          styles.titleContainer
        }
      >
        <AppText
          variant="heading1"
          weight="bold"
          numberOfLines={1}
          style={
            styles.title
          }
        >
          Order Details
        </AppText>

        <AppText
          variant="body"
          numberOfLines={1}
          style={
            styles.subtitle
          }
        >
          Manage this market order
        </AppText>
      </View>

      {/* MORE */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          refreshing
            ? "Refreshing order"
            : "Order options"
        }
        accessibilityState={{
          busy:
            refreshing,
        }}
        disabled={
          refreshing
        }
        hitSlop={8}
        onPress={
          handleMore
        }
        style={({
          pressed,
        }) => [
          styles.actionButton,

          refreshing
            ? styles.disabled
            : null,

          pressed &&
          !refreshing
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name={
            refreshing
              ? "refresh"
              : "more"
          }
          size="md"
          color={
            Colors.textSecondary
          }
        />
      </Pressable>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    actionButton: {
      width: 52,

      height: 52,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.divider,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    titleContainer: {
      flex: 1,

      minWidth: 0,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      justifyContent:
        "center",
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

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