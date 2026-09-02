import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {
  receiverName?: string;
  receiverPhone?: string;
  address: string;
};

function MarketOrderDelivery({
  receiverName,
  receiverPhone,
  address,
}: Props) {
  return (
    <View
      style={
        styles.card
      }
    >
      <AppText
        weight="bold"
        style={
          styles.title
        }
      >
        Delivery Address
      </AppText>

      <View
        style={
          styles.row
        }
      >
        <View
          style={
            styles.iconBox
          }
        >
          <Ionicons
            name="location-outline"
            size={21}
            color="#2563EB"
          />
        </View>

        <View
          style={
            styles.content
          }
        >
          <AppText
            weight="bold"
            numberOfLines={1}
            style={
              styles.name
            }
          >
            {receiverName?.trim() ||
              "Delivery location"}
          </AppText>

          <AppText
            style={
              styles.address
            }
          >
            {address?.trim() ||
              "Delivery address unavailable"}
          </AppText>

          {receiverPhone?.trim() ? (
            <View
              style={
                styles.phoneRow
              }
            >
              <Ionicons
                name="call-outline"
                size={13}
                color="#64748B"
              />

              <AppText
                style={
                  styles.phone
                }
              >
                {receiverPhone.trim()}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default memo(
  MarketOrderDelivery,
);

const styles =
  StyleSheet.create({
    card: {
      marginTop: 10,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    title: {
      fontSize: 14,
      color: "#0F172A",
    },

    row: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "flex-start",
    },

    iconBox: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    content: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    name: {
      fontSize: 10.5,
      color: "#334155",
    },

    address: {
      marginTop: 4,
      fontSize: 9.5,
      lineHeight: 15,
      color: "#64748B",
    },

    phoneRow: {
      marginTop: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    phone: {
      fontSize: 8.5,
      color: "#64748B",
    },
  });