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
          size="sm"
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
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
        >
          Current location
        </AppText>

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
        hitSlop={6}
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
      width: "100%",

      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,
    },

    address: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       REFRESH
    ======================================================== */

    refreshButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.background,
    },

    refreshPressed: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,

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

    refreshDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });

export default memo(
  BookingCurrentLocation,
);