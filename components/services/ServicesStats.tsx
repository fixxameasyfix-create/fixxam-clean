import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

interface Props {
  totalServices: number;
  totalBookings: number;
}

export default function ServicesStats({
  totalServices,
  totalBookings,
}: Props) {
  return (
    <View
      style={styles.container}
    >
      <View
        style={styles.stat}
      >
        <View
          style={[
            styles.icon,
            styles.blueIcon,
          ]}
        >
          <MaterialCommunityIcons
            name="tools"
            size={18}
            color="#2563EB"
          />
        </View>

        <View>
          <AppText
            weight="bold"
            style={styles.value}
          >
            {totalServices}
          </AppText>

          <AppText
            style={styles.label}
          >
            Services
          </AppText>
        </View>
      </View>

      <View
        style={styles.divider}
      />

      <View
        style={styles.stat}
      >
        <View
          style={[
            styles.icon,
            styles.greenIcon,
          ]}
        >
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={18}
            color="#16A34A"
          />
        </View>

        <View>
          <AppText
            weight="bold"
            style={styles.value}
          >
            {totalBookings}
          </AppText>

          <AppText
            style={styles.label}
          >
            Bookings
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      marginTop: 18,
      marginBottom: 10,
      minHeight: 72,
      paddingHorizontal: 14,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",

      flexDirection:
        "row",
      alignItems:
        "center",

      shadowColor:
        "#0F172A",
      shadowOpacity:
        0.04,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },

    stat: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    icon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 9,
    },

    blueIcon: {
      backgroundColor:
        "#EFF6FF",
    },

    greenIcon: {
      backgroundColor:
        "#ECFDF5",
    },

    value: {
      fontSize: 17,
      color: "#0F172A",
    },

    label: {
      marginTop: 1,
      fontSize: 10,
      color: "#64748B",
    },

    divider: {
      width: 1,
      height: 32,
      backgroundColor:
        "#E2E8F0",
      marginHorizontal: 10,
    },
  });