import React, {
  memo,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  loading: boolean;

  address: string;

  onRefresh: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function BookingCurrentLocation({
  loading,
  address,
  onRefresh,
}: Props) {
  const cleanAddress =
    address.trim();

  return (
    <AppCard
      role="customer"
      variant="outlined"
      style={
        styles.card
      }
    >
      {/* ======================================================
          LOCATION ICON
      ====================================================== */}

      <View
        style={
          styles.iconBox
        }
      >
        <AppIcon
          name="location"
          role="customer"
          size="md"
          state="active"
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
        <View
          style={
            styles.titleRow
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.title
            }
          >
            Current location
          </AppText>

          <View
            style={
              styles.statusBadge
            }
          >
            <View
              style={
                styles.statusDot
              }
            />

            <AppText
              variant="caption"
              weight="semibold"
              style={
                styles.statusText
              }
            >
              GPS
            </AppText>
          </View>
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          ellipsizeMode="tail"
          style={
            styles.address
          }
        >
          {loading
            ? "Updating your current location..."
            : cleanAddress ||
              "Current location selected"}
        </AppText>
      </View>

      {/* ======================================================
          REFRESH
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Refresh current location"
        accessibilityHint="Gets your latest GPS location"
        accessibilityState={{
          disabled:
            loading,

          busy:
            loading,
        }}
        disabled={
          loading
        }
        hitSlop={8}
        onPress={
          onRefresh
        }
        style={({
          pressed,
        }) => [
          styles.refreshButton,

          loading
            ? styles.refreshDisabled
            : null,

          pressed &&
          !loading
            ? styles.refreshPressed
            : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />
        ) : (
          <AppIcon
            name="refresh"
            role="customer"
            size="sm"
            state="active"
          />
        )}
      </Pressable>
    </AppCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width:
        "100%",

      minHeight:
        82,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      borderColor:
        Colors.border,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width:
        52,

      height:
        52,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
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
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    titleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    title: {
      flexShrink:
        1,

      color:
        Colors.textPrimary,
    },

    statusBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    statusDot: {
      width:
        6,

      height:
        6,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    statusText: {
      color:
        CustomerColors.primary,
    },

    address: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       REFRESH
    ======================================================== */

    refreshButton: {
      width:
        42,

      height:
        42,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    refreshPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    refreshDisabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },
  });

export default memo(
  BookingCurrentLocation,
);