import React from "react";

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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

interface Props {
  causes: string[];
}

export default function ResultCausesCard({
  causes,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={18}
            color={CustomerColors.primary}
          />
        </View>

        <AppText
          size="lg"
          weight="bold"
          style={styles.title}
        >
          Possible Causes
        </AppText>
      </View>

      {causes.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={
              CustomerColors.textSecondary
            }
          />

          <AppText
            style={styles.emptyText}
            color={
              CustomerColors.textSecondary
            }
          >
            No possible causes were
            identified.
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {causes.map(
            (cause, index) => (
              <View
                key={`${index}-${cause}`}
                style={[
                  styles.item,
                  index <
                    causes.length - 1 &&
                    styles.itemBorder,
                ]}
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color={
                    CustomerColors.success
                  }
                  style={styles.checkIcon}
                />

                <AppText
                  style={styles.text}
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

const styles =
  StyleSheet.create({
    card: {
      padding:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    header: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 2,
    },

    iconContainer: {
      width: 34,

      height: 34,

      borderRadius: 17,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        CustomerColors.diagnosisBackground,
    },

    title: {
      marginLeft: 10,
    },

    list: {
      borderRadius: 12,

      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        CustomerColors.border,

      backgroundColor:
        CustomerColors.card,
    },

    item: {
      flexDirection: "row",

      alignItems: "flex-start",

      paddingHorizontal: 12,

      paddingVertical: 10,
    },

    itemBorder: {
      borderBottomWidth: 1,

      borderBottomColor:
        CustomerColors.border,
    },

    checkIcon: {
      marginTop: 2,

      marginRight: 10,
    },

    text: {
      flex: 1,

      fontSize: 14,

      lineHeight: 21,

      color:
        CustomerColors.primaryText,
    },

    emptyState: {
      flexDirection: "row",

      alignItems: "center",

      paddingVertical: 10,
    },

    emptyText: {
      flex: 1,

      marginLeft: 8,

      fontSize: 14,

      lineHeight: 20,
    },
  });