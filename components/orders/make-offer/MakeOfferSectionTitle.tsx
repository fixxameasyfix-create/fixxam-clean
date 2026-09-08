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

type Props = {
  number: string;
  title: string;
};

function MakeOfferSectionTitle({
  number,
  title,
}: Props) {
  return (
    <View
      style={
        styles.sectionTitle
      }
    >
      <View
        style={
          styles.sectionNumber
        }
      >
        <AppText
          variant="caption"
          weight="bold"
          center
          style={
            styles.sectionNumberText
          }
        >
          {number}
        </AppText>
      </View>

      <AppText
        variant="bodyMedium"
        weight="bold"
        style={
          styles.sectionText
        }
      >
        {title}
      </AppText>
    </View>
  );
}

export default memo(
  MakeOfferSectionTitle,
);

const styles =
  StyleSheet.create({
    sectionTitle: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    sectionNumber: {
      width: 28,

      height: 28,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    sectionNumberText: {
      color:
        WorkerColors.primary,
    },

    sectionText: {
      flex: 1,

      color:
        Colors.textPrimary,
    },
  });