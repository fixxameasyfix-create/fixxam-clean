import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

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

/* ============================================================
   TYPES
============================================================ */

type NormalizedProduct = {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
};

/* ============================================================
   SCREEN
============================================================ */

export default function MarketOrderDetailsScreen() {
  const {
    orderId,
  } = useLocalSearchParams<{
    orderId: string | string[];
  }>();

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    order,
    setOrder,
  ] = useState<MarketOrder | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  /* ==========================================================
     ORDER ID
  ========================================================== */

  const normalizedOrderId = useMemo(() => {
    if (Array.isArray(orderId)) {
      return (orderId[0] ?? "").trim();
    }

    return (orderId ?? "").trim();
  }, [orderId]);

  /* ==========================================================
     BACK NAVIGATION
     
     Priority:
     1. Go exactly one screen back when history exists.
     2. Only use Orders fallback when there is no history.
  ========================================================== */

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace({
      pathname: "/(customer)/orders",
      params: {
        category: "market",
      },
    } as never);
  }, []);

  /* ==========================================================
     ANDROID HARDWARE BACK

     useFocusEffect ensures this listener is active only while
     this screen is focused.
  ========================================================== */

  useFocusEffect(
    useCallback(() => {
      const subscription =
        BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            handleBack();

            return true;
          },
        );

      return () => {
        subscription.remove();
      };
    }, [handleBack]),
  );

  /* ==========================================================
     FIRESTORE LISTENER
  ========================================================== */

  useEffect(() => {
    const user = auth.currentUser;

    /* --------------------------------------------------------
       AUTH
    -------------------------------------------------------- */

    if (!user) {
      setOrder(null);
      setLoading(false);

      setError(
        "Please sign in to view this order.",
      );

      return;
    }

    /* --------------------------------------------------------
       ORDER ID
    -------------------------------------------------------- */

    if (!normalizedOrderId) {
      setOrder(null);
      setLoading(false);

      setError(
        "Order ID is missing.",
      );

      return;
    }

    /* --------------------------------------------------------
       INITIAL STATE
    -------------------------------------------------------- */

    setLoading(true);
    setError(null);

    /* --------------------------------------------------------
       FIRESTORE DOCUMENT
    -------------------------------------------------------- */

    const orderRef = doc(
      db,
      "orders",
      normalizedOrderId,
    );

    /* --------------------------------------------------------
       REALTIME LISTENER
    -------------------------------------------------------- */

    const unsubscribe = onSnapshot(
      orderRef,

      (snapshot) => {
        /* ----------------------------------------------------
           ORDER NOT FOUND
        ---------------------------------------------------- */

        if (!snapshot.exists()) {
          setOrder(null);
          setLoading(false);

          setError(
            "This order could not be found.",
          );

          return;
        }

        const data = snapshot.data();

        /* ====================================================
           CUSTOMER OWNERSHIP
        ==================================================== */

        if (data.customerId !== user.uid) {
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

          setOrder(mappedOrder);
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

    /* --------------------------------------------------------
       CLEANUP
    -------------------------------------------------------- */

    return unsubscribe;
  }, [normalizedOrderId]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={styles.screen}
      >
        <View style={styles.centerState}>
          <ActivityIndicator
            size="small"
            color={CustomerColors.primary}
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={styles.stateText}
          >
            Loading order...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error || !order) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={styles.screen}
      >
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <AppIcon
              name="error"
              size="lg"
              color={Colors.error}
            />
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={styles.stateTitle}
          >
            Unable to open order
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={styles.stateText}
          >
            {error ?? "Order not found."}
          </AppText>

          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <AppIcon
              name="back"
              size="xs"
              color={Colors.textInverse}
            />

            <AppText
              variant="caption"
              weight="bold"
              style={styles.backButtonText}
            >
              GO BACK
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     RAW ORDER
  ========================================================== */

  const rawOrder =
    order as MarketOrder &
      Record<string, unknown>;

  /* ==========================================================
     STATUS
  ========================================================== */

  const status = normalizeMarketStatus(
    rawOrder.status,
  );

  /* ==========================================================
     PRODUCTS
  ========================================================== */

  const products = normalizeProducts(
    rawOrder.products,
  );

  /* ==========================================================
     STORE
  ========================================================== */

  const storeName = getString(
    rawOrder.storeName,
    rawOrder.sellerName,
    rawOrder.store,
    "Market Store",
  );

  const storeId = getString(
    rawOrder.storeId,
    rawOrder.sellerStoreId,
    rawOrder.storeID,
  );

  const sellerId = getString(
    rawOrder.sellerId,
    rawOrder.sellerID,
    rawOrder.providerId,
    rawOrder.workerId,
  );

  const storePhone = getString(
    rawOrder.storePhone,
    rawOrder.sellerPhone,
    rawOrder.phoneNumber,
    rawOrder.phone,
  );

  /* ==========================================================
     DELIVERY
  ========================================================== */

  const receiverName = getString(
    rawOrder.receiverName,
    rawOrder.customerName,
    rawOrder.deliveryName,
  );

  const receiverPhone = getString(
    rawOrder.receiverPhone,
    rawOrder.customerPhone,
    rawOrder.deliveryPhone,
  );

  const address = getString(
    rawOrder.address,
    rawOrder.deliveryAddress,
    rawOrder.location,
    rawOrder.deliveryLocation,
    "Delivery address unavailable",
  );

  /* ==========================================================
     PAYMENT
  ========================================================== */

  const paymentMethod = getString(
    rawOrder.paymentMethod,
    "cash",
  );

  const paymentStatus = getString(
    rawOrder.paymentStatus,
    "pending",
  );

  /* ==========================================================
     PRICE
  ========================================================== */

  const calculatedSubtotal =
    products.reduce(
      (total, product) =>
        total +
        product.price *
          product.quantity,
      0,
    );

  const subtotal = getNumber(
    rawOrder.subtotal,
    calculatedSubtotal,
  );

  const deliveryFee = getNumber(
    rawOrder.deliveryFee,
    0,
  );

  const total = getNumber(
    rawOrder.total,
    subtotal + deliveryFee,
  );

  /* ==========================================================
     OTHER
  ========================================================== */

  const note = getString(
    rawOrder.note,
    rawOrder.orderNote,
  );

  const createdAt = rawOrder.createdAt;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      contentContainerStyle={styles.screen}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
      >
        {/* ====================================================
            TOP HEADER
        ==================================================== */}

        <View style={styles.topHeader}>
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back to market orders"
            style={({ pressed }) => [
              styles.topHeaderButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <AppIcon
              name="back"
              size="md"
              color={Colors.textPrimary}
            />
          </Pressable>

          <View style={styles.topHeaderText}>
            <AppText
              variant="heading2"
              weight="bold"
              style={styles.topTitle}
            >
              Order Details
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={styles.topSubtitle}
            >
              Track your market order
            </AppText>
          </View>

          {/* ==================================================
              MORE BUTTON
          ================================================== */}

          <View
            style={styles.topHeaderButton}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            <AppIcon
              name="more"
              size="md"
              color={Colors.textMuted}
            />
          </View>
        </View>

        {/* ====================================================
            ORDER HEADER
        ==================================================== */}

        <MarketOrderHeader
          orderId={order.id}
          status={status}
          createdAt={createdAt}
          products={products}
          storeName={storeName}
        />

        {/* ====================================================
            STATUS
        ==================================================== */}

        <MarketOrderStatus
          status={status}
          createdAt={createdAt}
        />

        {/* ====================================================
            ITEMS
        ==================================================== */}

        <MarketOrderItems
          products={products}
        />

        {/* ====================================================
            DELIVERY
        ==================================================== */}

        <MarketOrderDelivery
          receiverName={receiverName}
          receiverPhone={receiverPhone}
          address={address}
        />

        {/* ====================================================
            PAYMENT
        ==================================================== */}

        <MarketOrderPayment
          paymentMethod={paymentMethod}
          paymentStatus={paymentStatus}
        />

        {/* ====================================================
            PRICE
        ==================================================== */}

        <MarketOrderPrice
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
        />

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <MarketOrderActions
          orderId={order.id}
          status={status}
          storeId={
            storeId || undefined
          }
          sellerId={
            sellerId || undefined
          }
          storePhone={
            storePhone || undefined
          }
          note={
            note || undefined
          }
        />

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   PRODUCT NORMALIZER
============================================================ */

function normalizeProducts(
  value: unknown,
): NormalizedProduct[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(
      (
        item,
        index,
      ): NormalizedProduct | null => {
        if (
          typeof item !== "object" ||
          item === null
        ) {
          return null;
        }

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
          );

        const price = Math.max(
          0,
          getNumber(
            product.price,
            getNumber(
              product.unitPrice,
              0,
            ),
          ),
        );

        const rawQuantity =
          getNumber(
            product.quantity,
            1,
          );

        const quantity =
          Math.max(
            1,
            Math.floor(
              rawQuantity,
            ),
          );

        return {
          productId,
          name,

          ...(image
            ? { image }
            : {}),

          price,
          quantity,
        };
      },
    )
    .filter(
      (
        product,
      ): product is NormalizedProduct =>
        product !== null,
    );
}

/* ============================================================
   STATUS NORMALIZER
============================================================ */

function normalizeMarketStatus(
  value: unknown,
): MarketStatus {
  const status =
    typeof value === "string"
      ? value
          .trim()
          .toLowerCase()
      : "pending";

  switch (status) {
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

/* ============================================================
   STRING
============================================================ */

function getString(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (
      typeof value === "string"
    ) {
      const normalized =
        value.trim();

      if (normalized) {
        return normalized;
      }
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return "";
}

/* ============================================================
   NUMBER
============================================================ */

function getNumber(
  value: unknown,
  fallback: number,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const normalized =
      value.trim();

    if (normalized) {
      const parsed =
        Number(normalized);

      if (
        Number.isFinite(parsed)
      ) {
        return parsed;
      }
    }
  }

  return fallback;
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,
      width: "100%",
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    topHeader: {
      minHeight:
        FixxamTokens.size.headerHeight,

      flexDirection: "row",

      alignItems: "center",
    },

    topHeaderButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    topHeaderText: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    topTitle: {
      color:
        Colors.textPrimary,
    },

    topSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATES
    ======================================================== */

    centerState: {
      flex: 1,

      minHeight: 500,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems: "center",

      justifyContent: "center",
    },

    errorIcon: {
      width: 64,

      height: 64,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.errorSoft,
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    stateText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    backButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    backButtonText: {
      color:
        Colors.textInverse,
    },

    bottomSpace: {
      height:
        FixxamTokens.spacing.xl,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });