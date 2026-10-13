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

  const hasAddress =
    Boolean(
      cleanAddress,
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
        <View
          style={
            styles.titleRow
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            style={
              styles.title
            }
          >
            Service location
          </AppText>

          {hasAddress ? (
            <View
              style={
                styles.selectedBadge
              }
            >
              <AppIcon
                name="check"
                role="customer"
                size="xs"
                state="active"
              />

              <AppText
                variant="caption"
                weight="semibold"
                style={
                  styles.selectedText
                }
              >
                Selected
              </AppText>
            </View>
          ) : null}
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={
            hasAddress
              ? 2
              : 1
          }
          ellipsizeMode="tail"
          style={
            styles.address
          }
        >
          {hasAddress
            ? cleanAddress
            : "Choose where the worker should come."}
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
      width:
        "100%",

      minHeight:
        54,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width:
        44,

      height:
        44,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

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
    },

    titleRow: {
      minHeight:
        24,

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

    address: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight:
        18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SELECTED BADGE
    ======================================================== */

    selectedBadge: {
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

    selectedText: {
      color:
        CustomerColors.primary,
    },
  });

export default memo(
  BookingLocationHeader,
);