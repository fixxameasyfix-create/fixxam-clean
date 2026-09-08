import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import AppSearch from "@/components/common/AppSearch";

import {
  AppText,
} from "@/components/ui";

import {
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  search: string;

  onSearch: (
    value: string,
  ) => void;

  title?: string;

  subtitle?: string;
};

/* ==============================================================
   COMPONENT
============================================================== */

function NearbyWorkersHeader({
  search,
  onSearch,
  title = "Nearby Workers",
  subtitle = "Discover trusted professionals near your current location.",
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADING
      ====================================================== */}

      <View
        style={
          styles.heading
        }
      >
        <AppText
          variant="heading2"
          weight="bold"
          numberOfLines={2}
        >
          {title}
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.subtitle
          }
        >
          {subtitle}
        </AppText>
      </View>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <AppSearch
        value={search}
        onChangeText={
          onSearch
        }
        placeholder="Search workers or profession..."
      />
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.md,
    },

    heading: {
      gap:
        FixxamTokens.spacing.xs,
    },

    subtitle: {
      lineHeight: 20,
    },
  });

export default memo(
  NearbyWorkersHeader,
);