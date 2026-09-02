import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  mapMarketOrder,
} from "@/components/customerorders/orders.utils";

import type {
  MarketOrder,
} from "@/components/customerorders/orders.types";

import MarketOrderHeader from "@/components/customerorders/market/marketOrderHeader";

import MarketOrderStatus from "@/components/customerorders/market/marketOrderStatus";

import MarketOrderItems from "@/components/customerorders/market/marketOrderItems";

import MarketOrderDelivery from "@/components/customerorders/market/marketOrderDelivery";

import MarketOrderPayment from "@/components/customerorders/market/marketOrderPayment";

import MarketOrderPrice from "@/components/customerorders/market/marketOrderPrice";

import MarketOrderActions from "@/components/customerorders/market/marketOrderActions";

import type {
  MarketStatus,
} from "@/components/customerorders/market/marketOrder.utils";

/* ==============================================================
   SCREEN
============================================================== */

export default function MarketOrderDetailsScreen() {
  const {
    orderId,
  } =
    useLocalSearchParams<{
      orderId:
        | string
        | string[];
    }>();

  /* ============================================================
     STATE
  ============================================================ */

  const [
    order,
    setOrder,
  ] =
    useState<MarketOrder | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /* ============================================================
     NORMALIZE ORDER ID
  ============================================================ */

  const normalizedOrderId =
    useMemo(() => {
      if (
        Array.isArray(
          orderId,
        )
      ) {
        return (
          orderId[0] ??
          ""
        ).trim();
      }

      return (
        orderId ?? ""
      ).trim();
    }, [
      orderId,
    ]);

  /* ============================================================
     FIRESTORE LISTENER
  ============================================================ */

  useEffect(() => {
    const user =
      auth.currentUser;

    if (!user) {
      setOrder(null);
      setLoading(false);
      setError(
        "Please sign in to view this order.",
      );

      return;
    }

    if (!normalizedOrderId) {
      setOrder(null);
      setLoading(false);
      setError(
        "Order ID is missing.",
      );

      return;
    }

    setLoading(true);
    setError(null);

    const orderRef =
      doc(
        db,
        "orders",
        normalizedOrderId,
      );

    const unsubscribe =
      onSnapshot(
        orderRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setOrder(null);
            setLoading(false);
            setError(
              "This order could not be found.",
            );

            return;
          }

          const data =
            snapshot.data();

          /* ====================================================
             CUSTOMER OWNERSHIP CHECK
          ==================================================== */

          if (
            data.customerId !==
            user.uid
          ) {
            setOrder(null);
            setLoading(false);

            setError(
              "You do not have permission to view this order.",
            );

            return;
          }

          /* ====================================================
             MAP ORDER
          ==================================================== */

          try {
            const mappedOrder =
              mapMarketOrder(
                snapshot.id,
                data,
              );

            setOrder(
              mappedOrder,
            );

            setLoading(false);
            setError(null);
          } catch (mappingError) {
            console.error(
              "MARKET_ORDER_MAPPING_ERROR:",
              mappingError,
            );

            setOrder(null);
            setLoading(false);

            setError(
              "Unable to read this order.",
            );
          }
        },
        (snapshotError) => {
          console.error(
            "MARKET_ORDER_DETAILS_ERROR:",
            snapshotError,
          );

          setOrder(null);
          setLoading(false);

          setError(
            "Unable to load this order. Please try again.",
          );
        },
      );

    return () => {
      unsubscribe();
    };
  }, [
    normalizedOrderId,
  ]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.centerState
          }
        >
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />

          <AppText
            style={
              styles.stateText
            }
          >
            Loading order...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (
    error ||
    !order
  ) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.centerState
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color="#DC2626"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.stateTitle
            }
          >
            Unable to open order
          </AppText>

          <AppText
            center
            style={
              styles.stateText
            }
          >
            {error ??
              "Order not found."}
          </AppText>

          <View
            style={
              styles.backButton
            }
          >
            <AppText
              weight="bold"
              style={
                styles.backButtonText
              }
              onPress={() =>
                router.back()
              }
            >
              GO BACK
            </AppText>
          </View>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     RAW ORDER
  ============================================================ */

  const rawOrder =
    order as MarketOrder &
      Record<
        string,
        unknown
      >;

  /* ============================================================
     STATUS
  ============================================================ */

  const status =
    normalizeMarketStatus(
      rawOrder.status,
    );

  /* ============================================================
     PRODUCTS
  ============================================================ */

  const products =
    normalizeProducts(
      rawOrder.products,
    );

  /* ============================================================
     STORE
  ============================================================ */

  const storeName =
    getString(
      rawOrder.storeName,
      rawOrder.sellerName,
      rawOrder.store,
      "Market Store",
    );

  const storeId =
    getString(
      rawOrder.storeId,
      rawOrder.sellerStoreId,
      rawOrder.storeID,
      "",
    );

  const sellerId =
    getString(
      rawOrder.sellerId,
      rawOrder.sellerID,
      rawOrder.providerId,
      rawOrder.workerId,
      "",
    );

  const storePhone =
    getString(
      rawOrder.storePhone,
      rawOrder.sellerPhone,
      rawOrder.phoneNumber,
      rawOrder.phone,
      "",
    );

  /* ============================================================
     DELIVERY
  ============================================================ */

  const receiverName =
    getString(
      rawOrder.receiverName,
      rawOrder.customerName,
      rawOrder.deliveryName,
      "",
    );

  const receiverPhone =
    getString(
      rawOrder.receiverPhone,
      rawOrder.customerPhone,
      rawOrder.deliveryPhone,
      "",
    );

  const address =
    getString(
      rawOrder.address,
      rawOrder.deliveryAddress,
      rawOrder.location,
      rawOrder.deliveryLocation,
      "Delivery address unavailable",
    );

  /* ============================================================
     PAYMENT
  ============================================================ */

  const paymentMethod =
    getString(
      rawOrder.paymentMethod,
      "cash",
    );

  const paymentStatus =
    getString(
      rawOrder.paymentStatus,
      "pending",
    );

  /* ============================================================
     PRICE
  ============================================================ */

  const calculatedSubtotal =
    products.reduce(
      (
        total,
        product,
      ) =>
        total +
        product.price *
          product.quantity,
      0,
    );

  const subtotal =
    getNumber(
      rawOrder.subtotal,
      calculatedSubtotal,
    );

  const deliveryFee =
    getNumber(
      rawOrder.deliveryFee,
      0,
    );

  const total =
    getNumber(
      rawOrder.total,
      subtotal +
        deliveryFee,
    );

  /* ============================================================
     OTHER
  ============================================================ */

  const note =
    getString(
      rawOrder.note,
      rawOrder.orderNote,
      "",
    );

  const createdAt =
    rawOrder.createdAt;

  /* ============================================================
     TRACKING
  ============================================================ */

  const canTrack =
    status ===
      "accepted" ||
    status ===
      "in-progress";

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AppScreen
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.topHeader
          }
        >
          <View
            style={
              styles.topHeaderButton
            }
          >
            <Ionicons
              name="chevron-back"
              size={21}
              color="#0F172A"
              onPress={() =>
                router.back()
              }
            />
          </View>

          <View
            style={
              styles.topHeaderText
            }
          >
            <AppText
              weight="bold"
              style={
                styles.topTitle
              }
            >
              Order Details
            </AppText>

            <AppText
              style={
                styles.topSubtitle
              }
            >
              Track your market order
            </AppText>
          </View>

          <View
            style={
              styles.topHeaderButton
            }
          >
            <Ionicons
              name="ellipsis-vertical"
              size={19}
              color="#0F172A"
            />
          </View>
        </View>

        {/* ====================================================
            ORDER HEADER
        ==================================================== */}

        <MarketOrderHeader
          orderId={
            order.id
          }
          status={
            status
          }
          createdAt={
            createdAt
          }
          products={
            products
          }
          storeName={
            storeName
          }
        />

        {/* ====================================================
            STATUS
        ==================================================== */}

        <MarketOrderStatus
          status={
            status
          }
          createdAt={
            createdAt
          }
        />

        {/* ====================================================
            ORDER ITEMS + GALLERY
        ==================================================== */}

        <MarketOrderItems
          products={
            products
          }
        />

        {/* ====================================================
            DELIVERY ADDRESS
        ==================================================== */}

        <MarketOrderDelivery
          receiverName={
            receiverName
          }
          receiverPhone={
            receiverPhone
          }
          address={
            address
          }
        />

        {/* ====================================================
            PAYMENT
        ==================================================== */}

        <MarketOrderPayment
          paymentMethod={
            paymentMethod
          }
          paymentStatus={
            paymentStatus
          }
        />

        {/* ====================================================
            PRICE
        ==================================================== */}

        <MarketOrderPrice
          subtotal={
            subtotal
          }
          deliveryFee={
            deliveryFee
          }
          total={
            total
          }
        />

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <MarketOrderActions
          orderId={
            order.id
          }
          status={
            status
          }
          storeId={
            storeId ||
            undefined
          }
          sellerId={
            sellerId ||
            undefined
          }
          storePhone={
            storePhone ||
            undefined
          }
          note={
            note ||
            undefined
          }
        />

        {/* ====================================================
            BOTTOM
        ==================================================== */}

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </AppScreen>
  );
}

/* ==============================================================
   PRODUCT NORMALIZER
============================================================== */

function normalizeProducts(
  value: unknown,
): Array<{
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}> {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value.map(
    (
      item,
      index,
    ) => {
      const product =
        item as Record<
          string,
          unknown
        >;

      const productId =
        getString(
          product.productId,
          product.id,
          `product-${index}`,
        );

      const name =
        getString(
          product.name,
          product.productName,
          "Product",
        );

      const image =
        getString(
          product.image,
          product.imageUrl,
          product.photo,
          "",
        );

      const price =
        getNumber(
          product.price,
          getNumber(
            product.unitPrice,
            0,
          ),
        );

      const quantityValue =
        getNumber(
          product.quantity,
          1,
        );

      const quantity =
        quantityValue > 0
          ? quantityValue
          : 1;

      return {
        productId,
        name,
        ...(image
          ? {
              image,
            }
          : {}),
        price,
        quantity,
      };
    },
  );
}

/* ==============================================================
   STATUS NORMALIZER
============================================================== */

function normalizeMarketStatus(
  value: unknown,
): MarketStatus {
  const status =
    typeof value ===
    "string"
      ? value
          .trim()
          .toLowerCase()
      : "pending";

  switch (
    status
  ) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "in_progress":
    case "in progress":
    case "on-the-way":
    case "on_the_way":
      return "in-progress";

    case "completed":
    case "delivered":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

/* ==============================================================
   STRING HELPER
============================================================== */

function getString(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value ===
        "number" &&
      Number.isFinite(
        value,
      )
    ) {
      return String(
        value,
      );
    }
  }

  return "";
}

/* ==============================================================
   NUMBER HELPER
============================================================== */

function getNumber(
  value: unknown,
  fallback: number,
): number {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
      "string"
  ) {
    const parsed =
      Number(
        value,
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return parsed;
    }
  }

  return fallback;
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      width: "100%",
      backgroundColor:
        "#F8FAFC",
    },

    content: {
      paddingHorizontal: 14,
      paddingTop: 7,
      paddingBottom: 30,
    },

    /* ========================================================
       TOP HEADER
    ======================================================== */

    topHeader: {
      minHeight: 52,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    topHeaderButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    topHeaderText: {
      flex: 1,
      minWidth: 0,
      marginHorizontal: 10,
    },

    topTitle: {
      fontSize: 19,
      color: "#0F172A",
    },

    topSubtitle: {
      marginTop: 1,
      fontSize: 9.5,
      color: "#64748B",
    },

    /* ========================================================
       STATES
    ======================================================== */

    centerState: {
      flex: 1,
      minHeight: 500,
      paddingHorizontal: 30,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    errorIcon: {
      width: 58,
      height: 58,
      borderRadius: 19,
      backgroundColor:
        "#FEF2F2",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    stateTitle: {
      marginTop: 13,
      fontSize: 15,
      color: "#0F172A",
    },

    stateText: {
      marginTop: 6,
      fontSize: 10,
      lineHeight: 16,
      color: "#64748B",
    },

    backButton: {
      marginTop: 16,
      minHeight: 42,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor:
        "#2563EB",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    backButtonText: {
      fontSize: 10,
      color: "#FFFFFF",
    },

    bottomSpace: {
      height: 25,
    },
  });