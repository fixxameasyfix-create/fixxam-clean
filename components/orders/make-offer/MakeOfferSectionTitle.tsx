import React, {
  memo,
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
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  title: string;

  /**
   * Optional for backward compatibility.
   * Remove when numbered sections are no longer used.
   */
  number?: string;
};

/* ==============================================================
   COMPONENT
============================================================== */

function MakeOfferSectionTitle({
  title,
  number,
}: Props) {
  const cleanTitle =
    title.trim();

  if (!cleanTitle) {
    return null;
  }

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.titleRow
        }
      >
        {number ? (
          <View
            style={
              styles.numberDot
            }
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <AppText
              variant="caption"
              weight="bold"
              center
              style={
                styles.numberText
              }
            >
              {number}
            </AppText>
          </View>
        ) : null}

        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={2}
          style={
            styles.title
          }
        >
          {cleanTitle}
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

MakeOfferSectionTitle.displayName =
  "MakeOfferSectionTitle";

export default memo(
  MakeOfferSectionTitle,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    titleRow: {
      width:
        "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    numberDot: {
      width:
        20,

      height:
        20,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    numberText: {
      fontSize:
        10,

      color:
        WorkerColors.primary,
    },

    title: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textPrimary,
    },
  });