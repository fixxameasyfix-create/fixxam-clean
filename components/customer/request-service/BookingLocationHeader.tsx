import React, {
  memo,
  useMemo,
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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  address: string;
};

/* ==============================================================
   COMPONENT
============================================================== */

function BookingLocationHeader({
  address,
}: Props) {
  const cleanAddress =
    useMemo(
      () =>
        address.trim(),
      [
        address,
      ],
    );

  return (
    <View
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
          Service Location
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
          {cleanAddress ||
            "Where should the worker come?"}
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

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

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    content: {
      flex: 1,

      minWidth: 0,
    },

    address: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },
  });

export default memo(
  BookingLocationHeader,
);