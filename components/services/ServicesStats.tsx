import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
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
  totalServices: number;

  totalBookings: number;
};

/* ==============================================================
   HELPERS
============================================================== */

function formatCount(
  value: number,
): string {
  if (
    !Number.isFinite(value)
  ) {
    return "0";
  }

  const safeValue =
    Math.max(
      0,
      Math.floor(value),
    );

  return safeValue.toLocaleString(
    "en-NG",
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function ServicesStats({
  totalServices,
  totalBookings,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          SERVICES
      ======================================================== */}

      <View
        style={
          styles.stat
        }
      >
        <View
          style={[
            styles.iconBox,
            styles.servicesIconBox,
          ]}
        >
          <MaterialCommunityIcons
            name="tools"
            size={
              FixxamTokens.size.iconSm
            }
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.statContent
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
            numberOfLines={1}
            style={
              styles.value
            }
          >
            {formatCount(
              totalServices,
            )}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.label
            }
          >
            Services
          </AppText>
        </View>
      </View>

      {/* ========================================================
          DIVIDER
      ======================================================== */}

      <View
        style={
          styles.divider
        }
      />

      {/* ========================================================
          BOOKINGS
      ======================================================== */}

      <View
        style={
          styles.stat
        }
      >
        <View
          style={[
            styles.iconBox,
            styles.bookingsIconBox,
          ]}
        >
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={
              FixxamTokens.size.iconSm
            }
            color={
              Colors.success
            }
          />
        </View>

        <View
          style={
            styles.statContent
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
            numberOfLines={1}
            style={
              styles.value
            }
          >
            {formatCount(
              totalBookings,
            )}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.label
            }
          >
            Bookings
          </AppText>
        </View>
      </View>
    </View>
  );
}

export default memo(
  ServicesStats,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      minHeight: 72,

      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    stat: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    statContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    iconBox: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    servicesIconBox: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    bookingsIconBox: {
      backgroundColor:
        Colors.successSoft,
    },

    value: {
      color:
        Colors.textPrimary,
    },

    label: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    divider: {
      width: 1,

      height: 36,

      marginHorizontal:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.border,
    },
  });