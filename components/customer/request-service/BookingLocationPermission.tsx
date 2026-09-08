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
  granted: boolean;

  loading?: boolean;

  onRequestPermission: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function BookingLocationPermission({
  granted,
  loading = false,
  onRequestPermission,
}: Props) {
  if (granted) {
    return null;
  }

  return (
    <AppCard
      role="customer"
      variant="outlined"
      style={
        styles.container
      }
    >
      {/* ======================================================
          ICON
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
        >
          Location access needed
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.description
          }
        >
          Allow Fixxam to access your
          location so we can identify
          where the worker should come.
        </AppText>
      </View>

      {/* ======================================================
          ACTION
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Allow location access"
        accessibilityHint="Requests permission for Fixxam to use your location"
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
          onRequestPermission
        }
        style={({
          pressed,
        }) => [
          styles.button,

          loading
            ? styles.buttonDisabled
            : null,

          pressed &&
          !loading
            ? styles.buttonPressed
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
            name="next"
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
    container: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.md,

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

    description: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       ACTION
    ======================================================== */

    button: {
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
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    buttonPressed: {
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

    buttonDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,

      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,
    },
  });

export default memo(
  BookingLocationPermission,
);