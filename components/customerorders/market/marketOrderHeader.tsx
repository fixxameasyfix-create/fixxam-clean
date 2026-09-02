import React from "react";

import {
  Image,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import type {
  MarketProduct,
} from "./marketOrder.utils";

import {
  formatMarketDate,
  formatMarketOrderNumber,
  getFirstMarketProductImage,
  getFirstMarketProductName,
  getMarketStatusConfig,
  type MarketStatus,
} from "./marketOrder.utils";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  orderId: string;
  status: MarketStatus;
  createdAt: unknown;
  products: MarketProduct[];
  storeName: string;
};

/* ==============================================================
   COMPONENT
============================================================== */

export default function MarketOrderHeader({
  orderId,
  status,
  createdAt,
  products,
  storeName,
}: Props) {
  const statusConfig =
    getMarketStatusConfig(
      status,
    );

  const productName =
    getFirstMarketProductName(
      products,
    );

  const productImage =
    getFirstMarketProductImage(
      products,
    );

  const orderNumber =
    formatMarketOrderNumber(
      orderId,
    );

  const orderedDate =
    formatMarketDate(
      createdAt,
    );

  return (
    <View
      style={
        styles.card
      }
    >
      {/* ========================================================
          ORDER INFORMATION
      ======================================================== */}

      <View
        style={
          styles.orderRow
        }
      >
        {/* PRODUCT IMAGE */}

        <View
          style={
            styles.imageContainer
          }
        >
          {productImage ? (
            <Image
              source={{
                uri: productImage,
              }}
              style={
                styles.productImage
              }
            />
          ) : (
            <Ionicons
              name="bag-handle-outline"
              size={28}
              color="#2563EB"
            />
          )}
        </View>

        {/* ORDER INFO */}

        <View
          style={
            styles.orderInfo
          }
        >
          <View
            style={
              styles.titleRow
            }
          >
            <AppText
              weight="bold"
              numberOfLines={2}
              style={
                styles.productName
              }
            >
              {productName}
            </AppText>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    statusConfig.background,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      statusConfig.color,
                  },
                ]}
              />

              <AppText
                weight="bold"
                style={[
                  styles.statusText,
                  {
                    color:
                      statusConfig.color,
                  },
                ]}
              >
                {
                  statusConfig.label
                }
              </AppText>
            </View>
          </View>

          <AppText
            style={
              styles.orderIdLabel
            }
          >
            Order ID
          </AppText>

          <AppText
            weight="bold"
            style={
              styles.orderId
            }
          >
            {orderNumber}
          </AppText>

          <AppText
            style={
              styles.orderedDate
            }
          >
            Ordered on{" "}
            {orderedDate}
          </AppText>
        </View>
      </View>

      {/* ========================================================
          SELLER / STORE
      ======================================================== */}

      <View
        style={
          styles.storeRow
        }
      >
        <View
          style={
            styles.storeIcon
          }
        >
          <Ionicons
            name="storefront-outline"
            size={20}
            color="#64748B"
          />
        </View>

        <View
          style={
            styles.storeInfo
          }
        >
          <AppText
            weight="bold"
            style={
              styles.storeName
            }
            numberOfLines={1}
          >
            {storeName}
          </AppText>

          <AppText
            style={
              styles.storeLabel
            }
          >
            Seller / Store
          </AppText>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

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

    /* ========================================================
       ORDER
    ======================================================== */

    orderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    imageContainer: {
      width: 72,
      height: 72,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    productImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },

    orderInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 12,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      gap: 8,
    },

    productName: {
      flex: 1,
      minWidth: 0,
      fontSize: 16,
      lineHeight: 21,
      color: "#0F172A",
    },

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
    },

    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      marginRight: 5,
    },

    statusText: {
      fontSize: 7.5,
      letterSpacing: 0.2,
    },

    orderIdLabel: {
      marginTop: 7,
      fontSize: 8.5,
      color: "#94A3B8",
    },

    orderId: {
      marginTop: 1,
      fontSize: 10,
      color: "#334155",
    },

    orderedDate: {
      marginTop: 4,
      fontSize: 8.5,
      color: "#64748B",
    },

    /* ========================================================
       STORE
    ======================================================== */

    storeRow: {
      marginTop: 13,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor:
        "#F1F5F9",
      flexDirection: "row",
      alignItems: "center",
    },

    storeIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor:
        "#F8FAFC",
      alignItems: "center",
      justifyContent:
        "center",
    },

    storeInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 9,
    },

    storeName: {
      fontSize: 11,
      color: "#334155",
    },

    storeLabel: {
      marginTop: 2,
      fontSize: 8,
      color: "#94A3B8",
    },
  });