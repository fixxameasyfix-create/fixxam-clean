import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  AppCard,
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

interface Props {
  causes: string[];
}

/* ==============================================================
   COMPONENT
============================================================== */

function ResultCausesCard({
  causes,
}: Props) {
  const cleanCauses =
    useMemo(
      () =>
        causes
          .map(
            (cause) =>
              cause.trim(),
          )
          .filter(Boolean),
      [
        causes,
      ],
    );

  return (
    <AppCard
      style={styles.card}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <View
        style={styles.header}
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={18}
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="bodyLarge"
          weight="bold"
          style={styles.title}
        >
          Possible Causes
        </AppText>
      </View>

      {/* ========================================================
          EMPTY
      ======================================================== */}

      {cleanCauses.length ===
      0 ? (
        <View
          style={
            styles.emptyState
          }
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={
              Colors.textMuted
            }
          />

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.emptyText
            }
          >
            No possible causes were identified.
          </AppText>
        </View>
      ) : (
        /* ======================================================
           LIST
        ====================================================== */

        <View
          style={styles.list}
        >
          {cleanCauses.map(
            (
              cause,
              index,
            ) => (
              <View
                key={`${cause}-${index}`}
                style={[
                  styles.item,

                  index <
                  cleanCauses.length -
                    1
                    ? styles.itemBorder
                    : null,
                ]}
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color={
                    Colors.success
                  }
                  style={
                    styles.checkIcon
                  }
                />

                <AppText
                  variant="body"
                  style={
                    styles.text
                  }
                >
                  {cause}
                </AppText>
              </View>
            ),
          )}
        </View>
      )}
    </AppCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      padding:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",

      alignItems: "center",
    },

    iconContainer: {
      width: 34,

      height: 34,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    title: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    item: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    itemBorder: {
      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    checkIcon: {
      marginTop: 2,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    text: {
      flex: 1,

      color:
        Colors.textPrimary,

      lineHeight: 21,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyState: {
      minHeight: 44,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyText: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 20,
    },
  });

export default memo(
  ResultCausesCard,
);