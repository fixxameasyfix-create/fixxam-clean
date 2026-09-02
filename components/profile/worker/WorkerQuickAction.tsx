import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {
  hasCustomerAccount: boolean;
  onPress: () => void;
};

export default function WorkerQuickAction({
  hasCustomerAccount,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        hasCustomerAccount
          ? "Switch to customer"
          : "Create customer account"
      }
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      {/* ==================================================
          ICON
      ================================================== */}

      <View style={styles.iconContainer}>
        <Ionicons
          name={
            hasCustomerAccount
              ? "swap-horizontal"
              : "person-add-outline"
          }
          size={18}
          color="#16A34A"
        />
      </View>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.title}
          numberOfLines={1}
        >
          {hasCustomerAccount
            ? "Switch to Customer"
            : "Create Customer Account"}
        </AppText>

        <AppText
          style={styles.subtitle}
          numberOfLines={1}
        >
          {hasCustomerAccount
            ? "Book services & shop products."
            : "Book services & purchase products."}
        </AppText>
      </View>

      {/* ==================================================
          ARROW
      ================================================== */}

      <Ionicons
        name="chevron-forward"
        size={16}
        color="#94A3B8"
      />
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      marginHorizontal: 0,
      marginBottom: 8,

      minHeight: 58,

      paddingHorizontal: 10,
      paddingVertical: 9,

      borderRadius: 16,

      backgroundColor: "#F0FDF4",

      borderWidth: 1,
      borderColor: "#DCFCE7",

      flexDirection: "row",
      alignItems: "center",
    },

    pressed: {
      opacity: 0.8,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconContainer: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor: "#DCFCE7",

      alignItems: "center",
      justifyContent: "center",
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,
      minWidth: 0,

      marginLeft: 10,
      marginRight: 8,
    },

    title: {
      fontSize: 12.5,
      lineHeight: 17,

      color: "#166534",
    },

    subtitle: {
      marginTop: 2,

      fontSize: 9.5,
      lineHeight: 14,

      color: "#64748B",
    },
  });