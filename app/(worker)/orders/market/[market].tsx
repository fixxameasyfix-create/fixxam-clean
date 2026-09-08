import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Linking,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

import {
  AppButton,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  AppLoader,
} from "@/components/common";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import WorkerMarketOrderHeaderSection from "@/components/workerorders/market/details/WorkerMarketOrderHeaderSection";

import WorkerMarketCustomerDeliverySection from "@/components/workerorders/market/details/WorkerMarketCustomerDeliverySection";

import WorkerMarketPaymentSummarySection from "@/components/workerorders/market/details/WorkerMarketPaymentSummarySection";

import WorkerMarketProducts from "@/components/workerorders/market/WorkerMarketProducts";

import WorkerMarketOrderActions from "@/components/workerorders/market/WorkerMarketOrderActions";

/* ==============================================================
   TYPES
============================================================== */

type MarketPaymentMethod =
  | "cash"
  | "card"
  | "transfer";

type MarketOrderProduct = {
  productId: string;

  name: string;

  image?: string;

  price: number;

  quantity: number;
};

type UnavailableProduct = {
  productId: string;

  productName: string;

  reportedBy: string;

  reportedAt:
    | Timestamp
    | null;
};

type MarketOrderStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

type MarketOrder = {
  id: string;

  orderType?: string;

  type?: string;

  customerId?: string;

  workerId?: string;

  sellerId?: string;

  storeId?: string;

  products:
    MarketOrderProduct[];

  unavailableProducts:
    UnavailableProduct[];

  subtotal: number;

  deliveryFee: number;

  total: number;

  paymentMethod:
    MarketPaymentMethod;

  paymentStatus?: string;

  status:
    MarketOrderStatus;

  offerStatus?: string;

  receiverName?: string;

  receiverPhone?: string;

  stateId?: string;

  lgaId?: string;

  address?: string;

  latitude?: number;

  longitude?: number;

  note?: string;

  createdAt?:
    | Timestamp
    | null;

  updatedAt?:
    | Timestamp
    | null;
};

type RouteParams = {
  market?:
    | string
    | string[];

  orderId?:
    | string
    | string[];

  orderType?:
    | string
    | string[];
};

/* ==============================================================
   HELPERS
============================================================== */

function safeString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value ===
    "string"
  ) {
    const trimmed =
      value.trim();

    if (trimmed) {
      return trimmed;
    }
  }

  return fallback;
}

function safeNumber(
  value: unknown,
): number {
  const parsed =
    typeof value ===
    "number"
      ? value
      : Number(value);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

function getRouteValue(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0]?.trim() ??
      ""
    );
  }

  return (
    value?.trim() ??
    ""
  );
}

function formatDate(
  value: unknown,
): string {
  if (!value) {
    return "Date unavailable";
  }

  try {
    let date: Date;

    if (
      value instanceof
      Timestamp
    ) {
      date =
        value.toDate();
    } else if (
      value instanceof
      Date
    ) {
      date =
        value;
    } else if (
      typeof value ===
        "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (
        value as {
          toDate?: unknown;
        }
      ).toDate ===
        "function"
    ) {
      date =
        (
          value as {
            toDate: () => Date;
          }
        ).toDate();
    } else {
      return "Date unavailable";
    }

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(
      "en-NG",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  } catch {
    return "Date unavailable";
  }
}

/* ==============================================================
   STATUS
============================================================== */

function normalizeStatus(
  value: unknown,
): MarketOrderStatus {
  const status =
    safeString(
      value,
      "pending",
    ).toLowerCase();

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "in_progress":
    case "in progress":
    case "on-the-way":
    case "on_the_way":
    case "on the way":
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

function getStatusConfig(
  status: MarketOrderStatus,
) {
  switch (status) {
    case "accepted":
      return {
        label:
          "ACCEPTED",

        icon:
          "check" as const,

        backgroundColor:
          Colors.infoSoft,

        color:
          Colors.info,
      };

    case "in-progress":
      return {
        label:
          "IN PROGRESS",

        icon:
          "navigation" as const,

        backgroundColor:
          Colors.infoSoft,

        color:
          Colors.info,
      };

    case "completed":
      return {
        label:
          "COMPLETED",

        icon:
          "success" as const,

        backgroundColor:
          Colors.successSoft,

        color:
          Colors.success,
      };

    case "cancelled":
      return {
        label:
          "CANCELLED",

        icon:
          "error" as const,

        backgroundColor:
          Colors.errorSoft,

        color:
          Colors.error,
      };

    case "expired":
      return {
        label:
          "EXPIRED",

        icon:
          "clock" as const,

        backgroundColor:
          Colors.disabledBackground,

        color:
          Colors.textSecondary,
      };

    case "pending":
    default:
      return {
        label:
          "PENDING",

        icon:
          "clock" as const,

        backgroundColor:
          Colors.warningSoft,

        color:
          Colors.warning,
      };
  }
}

/* ==============================================================
   NORMALIZE PRODUCTS
============================================================== */

function normalizeProducts(
  value: unknown,
): MarketOrderProduct[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return value
    .map(
      (
        product,
      ):
        | MarketOrderProduct
        | null => {
        if (
          !product ||
          typeof product !==
            "object"
        ) {
          return null;
        }

        const data =
          product as Record<
            string,
            unknown
          >;

        const productId =
          safeString(
            data.productId,
            safeString(
              data.id,
            ),
          );

        if (!productId) {
          return null;
        }

        const image =
          safeString(
            data.image,
            safeString(
              data.imageUrl,
              safeString(
                data.photoUrl,
              ),
            ),
          );

        return {
          productId,

          name:
            safeString(
              data.name,
              safeString(
                data.productName,
                "Product",
              ),
            ),

          image:
            image ||
            undefined,

          price:
            Math.max(
              0,
              safeNumber(
                data.price,
              ),
            ),

          quantity:
            Math.max(
              1,
              Math.floor(
                safeNumber(
                  data.quantity,
                ),
              ),
            ),
        };
      },
    )
    .filter(
      (
        product,
      ): product is MarketOrderProduct =>
        product !== null,
    );
}

/* ==============================================================
   NORMALIZE UNAVAILABLE PRODUCTS
============================================================== */

function normalizeUnavailableProducts(
  value: unknown,
): UnavailableProduct[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return value
    .map(
      (
        item,
      ):
        | UnavailableProduct
        | null => {
        /*
         * Legacy schema:
         * unavailableProducts: ["productId"]
         */
        if (
          typeof item ===
          "string"
        ) {
          const productId =
            item.trim();

          if (!productId) {
            return null;
          }

          return {
            productId,

            productName:
              "Product",

            reportedBy:
              "",

            reportedAt:
              null,
          };
        }

        /*
         * Current schema:
         *
         * {
         *   productId,
         *   productName,
         *   reportedBy,
         *   reportedAt
         * }
         */
        if (
          !item ||
          typeof item !==
            "object"
        ) {
          return null;
        }

        const data =
          item as Record<
            string,
            unknown
          >;

        const productId =
          safeString(
            data.productId,
          );

        if (!productId) {
          return null;
        }

        return {
          productId,

          productName:
            safeString(
              data.productName,
              "Product",
            ),

          reportedBy:
            safeString(
              data.reportedBy,
            ),

          reportedAt:
            data.reportedAt instanceof
            Timestamp
              ? data.reportedAt
              : null,
        };
      },
    )
    .filter(
      (
        item,
      ): item is UnavailableProduct =>
        item !== null,
    );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerMarketOrderDetailsScreen() {
  const params =
    useLocalSearchParams<RouteParams>();

  /* ============================================================
     ROUTE PARAMS
  ============================================================ */

  const normalizedOrderId =
    useMemo(() => {
      const marketValue =
        getRouteValue(
          params.market,
        );

      const orderIdValue =
        getRouteValue(
          params.orderId,
        );

      return (
        marketValue ||
        orderIdValue
      );
    }, [
      params.market,
      params.orderId,
    ]);

  const normalizedOrderType =
    useMemo(
      () =>
        getRouteValue(
          params.orderType,
        ).toLowerCase(),
      [
        params.orderType,
      ],
    );

  /* ============================================================
     AUTH
  ============================================================ */

  const [
    authReady,
    setAuthReady,
  ] =
    useState(false);

  const [
    workerId,
    setWorkerId,
  ] =
    useState<
      string | null
    >(null);

  /* ============================================================
     ORDER STATE
  ============================================================ */

  const [
    order,
    setOrder,
  ] =
    useState<
      MarketOrder | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  /* ============================================================
     AUTH LISTENER
  ============================================================ */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        user => {
          const uid =
            user?.uid?.trim() ??
            "";

          setWorkerId(
            uid ||
            null,
          );

          setAuthReady(
            true,
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ============================================================
     LOAD ORDER
  ============================================================ */

  const loadOrder =
    useCallback(
      async (
        options?: {
          silent?: boolean;
        },
      ) => {
        if (!authReady) {
          return;
        }

        const silent =
          options?.silent ===
          true;

        if (
          !normalizedOrderId
        ) {
          setOrder(
            null,
          );

          setError(
            "Order ID is missing.",
          );

          if (!silent) {
            setLoading(
              false,
            );
          }

          return;
        }

        if (!workerId) {
          setOrder(
            null,
          );

          setError(
            "Please sign in again.",
          );

          if (!silent) {
            setLoading(
              false,
            );
          }

          return;
        }

        try {
          if (!silent) {
            setLoading(
              true,
            );
          }

          setError(
            null,
          );

          const orderRef =
            doc(
              db,
              "orders",
              normalizedOrderId,
            );

          const snapshot =
            await getDoc(
              orderRef,
            );

          if (
            !snapshot.exists()
          ) {
            setOrder(
              null,
            );

            setError(
              "This order could not be found.",
            );

            return;
          }

          const data =
            snapshot.data();

          /* ================================================
             MARKET TYPE
          ================================================ */

          const dataOrderType =
            safeString(
              data.orderType,
            ).toLowerCase();

          const dataType =
            safeString(
              data.type,
            ).toLowerCase();

          const isMarketOrder =
            dataOrderType ===
              "market" ||
            dataType ===
              "market";

          if (
            normalizedOrderType ===
              "market" &&
            !isMarketOrder
          ) {
            setOrder(
              null,
            );

            setError(
              "This is not a market order.",
            );

            return;
          }

          /* ================================================
             WORKER ACCESS
          ================================================ */

          const assignedWorkerId =
            safeString(
              data.workerId,
            );

          /*
           * Preserve original flow:
           * unassigned order may still load,
           * but another worker's order must not.
           *
           * Firestore Rules remain authoritative.
           */
          if (
            assignedWorkerId &&
            assignedWorkerId !==
              workerId
          ) {
            setOrder(
              null,
            );

            setError(
              "You are not assigned to this order.",
            );

            return;
          }

          /* ================================================
             PAYMENT
          ================================================ */

          const paymentMethod: MarketPaymentMethod =
            data.paymentMethod ===
              "card" ||
            data.paymentMethod ===
              "transfer" ||
            data.paymentMethod ===
              "cash"
              ? data.paymentMethod
              : "cash";

          /* ================================================
             ORDER
          ================================================ */

          setOrder({
            id:
              snapshot.id,

            orderType:
              dataOrderType,

            type:
              dataType,

            customerId:
              safeString(
                data.customerId,
              ),

            workerId:
              assignedWorkerId,

            sellerId:
              safeString(
                data.sellerId,
              ),

            storeId:
              safeString(
                data.storeId,
              ),

            products:
              normalizeProducts(
                data.products,
              ),

            unavailableProducts:
              normalizeUnavailableProducts(
                data.unavailableProducts,
              ),

            subtotal:
              Math.max(
                0,
                safeNumber(
                  data.subtotal,
                ),
              ),

            deliveryFee:
              Math.max(
                0,
                safeNumber(
                  data.deliveryFee,
                ),
              ),

            total:
              Math.max(
                0,
                safeNumber(
                  data.total,
                ),
              ),

            paymentMethod,

            paymentStatus:
              safeString(
                data.paymentStatus,
                "pending",
              ),

            status:
              normalizeStatus(
                data.status,
              ),

            offerStatus:
              safeString(
                data.offerStatus,
              ),

            receiverName:
              safeString(
                data.receiverName,
                "Customer",
              ),

            receiverPhone:
              safeString(
                data.receiverPhone,
              ),

            stateId:
              safeString(
                data.stateId,
              ),

            lgaId:
              safeString(
                data.lgaId,
              ),

            address:
              safeString(
                data.address,
                "Address unavailable",
              ),

            latitude:
              typeof data.latitude ===
                "number" &&
              Number.isFinite(
                data.latitude,
              )
                ? data.latitude
                : undefined,

            longitude:
              typeof data.longitude ===
                "number" &&
              Number.isFinite(
                data.longitude,
              )
                ? data.longitude
                : undefined,

            note:
              safeString(
                data.note,
              ),

            createdAt:
              data.createdAt instanceof
              Timestamp
                ? data.createdAt
                : null,

            updatedAt:
              data.updatedAt instanceof
              Timestamp
                ? data.updatedAt
                : null,
          });
        } catch (loadError) {
          console.error(
            "FIXXAM_LOAD_WORKER_MARKET_ORDER_ERROR:",
            loadError,
          );

          setOrder(
            null,
          );

          setError(
            "Unable to load this order. Please try again.",
          );
        } finally {
          if (!silent) {
            setLoading(
              false,
            );
          }
        }
      },
      [
        authReady,
        normalizedOrderId,
        normalizedOrderType,
        workerId,
      ],
    );

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    if (!authReady) {
      return;
    }

    void loadOrder();
  }, [
    authReady,
    loadOrder,
  ]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const refreshOrder =
    useCallback(
      async () => {
        if (refreshing) {
          return;
        }

        try {
          setRefreshing(
            true,
          );

          await loadOrder({
            silent:
              true,
          });
        } finally {
          setRefreshing(
            false,
          );
        }
      },
      [
        loadOrder,
        refreshing,
      ],
    );

  /* ============================================================
     CALCULATIONS
  ============================================================ */

  const itemCount =
    useMemo(
      () =>
        order?.products.reduce(
          (
            total,
            product,
          ) =>
            total +
            Math.max(
              1,
              product.quantity,
            ),
          0,
        ) ??
        0,
      [
        order?.products,
      ],
    );

  const unavailableProductIds =
    useMemo(
      () =>
        new Set(
          (
            order
              ?.unavailableProducts ??
            []
          ).map(
            product =>
              product.productId,
          ),
        ),
      [
        order
          ?.unavailableProducts,
      ],
    );

  const hasGps =
    order?.latitude !==
      undefined &&
    order?.longitude !==
      undefined;

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ============================================================
     CALL CUSTOMER
  ============================================================ */

  const handleCallCustomer =
    useCallback(
      async () => {
        const rawPhone =
          order
            ?.receiverPhone
            ?.trim() ??
          "";

        const phone =
          rawPhone.replace(
            /[^0-9+*#,;]/g,
            "",
          );

        if (!phone) {
          Toast.show({
            type:
              "info",

            text1:
              "Phone unavailable",

            text2:
              "Customer phone number is not available.",
          });

          return;
        }

        try {
          const url =
            `tel:${phone}`;

          const supported =
            await Linking.canOpenURL(
              url,
            );

          if (!supported) {
            Toast.show({
              type:
                "error",

              text1:
                "Calling unavailable",

              text2:
                "Your device cannot make phone calls.",
            });

            return;
          }

          await Linking.openURL(
            url,
          );
        } catch (callError) {
          console.error(
            "FIXXAM_CALL_CUSTOMER_ERROR:",
            callError,
          );

          Toast.show({
            type:
              "error",

            text1:
              "Unable to call customer",

            text2:
              "Please try again.",
          });
        }
      },
      [
        order?.receiverPhone,
      ],
    );

  /* ============================================================
     CHAT
  ============================================================ */

  const handleChatCustomer =
    useCallback(() => {
      const customerId =
        order
          ?.customerId
          ?.trim();

      if (!customerId) {
        Toast.show({
          type:
            "info",

          text1:
            "Chat unavailable",

          text2:
            "Customer information is not available.",
        });

        return;
      }

      if (!order?.id) {
        Toast.show({
          type:
            "error",

          text1:
            "Chat unavailable",

          text2:
            "Order information is missing.",
        });

        return;
      }

      /*
       * Existing route preserved.
       */
      router.push({
        pathname:
          "/(worker)/orders/market/chat",

        params: {
          orderId:
            order.id,

          customerId,

          customerName:
            order.receiverName ||
            "Customer",

          customerPhone:
            order.receiverPhone ||
            "",
        },
      } as never);
    }, [
      order,
    ]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    !authReady ||
    loading
  ) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <View
          style={
            styles.center
          }
        >
          <AppLoader
            role="worker"
            size="sm"
          />

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.loadingText
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
        role="worker"
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <View
          style={
            styles.center
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <AppIcon
              name="error"
              size="lg"
              color={
                Colors.error
              }
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.errorTitle
            }
          >
            Order unavailable
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.errorText
            }
          >
            {error ??
              "This order could not be loaded."}
          </AppText>

          <View
            style={
              styles.errorActions
            }
          >
            <AppButton
              title="Retry"
              role="worker"
              leftIconName="refresh"
              onPress={() =>
                void loadOrder()
              }
              style={
                styles.errorButton
              }
            />

            <AppButton
              title="Go Back"
              role="worker"
              variant="outline"
              leftIconName="back"
              onPress={
                handleBack
              }
              style={
                styles.errorButton
              }
            />
          </View>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     STATUS
  ============================================================ */

  const statusConfig =
    getStatusConfig(
      order.status,
    );

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <AppScreen
      role="worker"
      scrollEnabled
      contentContainerStyle={
        styles.container
      }
    >
      {/* HEADER */}

      <WorkerMarketOrderHeaderSection
        orderId={
          order.id
        }
        createdDate={
          formatDate(
            order.createdAt,
          )
        }
        refreshing={
          refreshing
        }
        statusLabel={
          statusConfig.label
        }
        statusIcon={
          statusConfig.icon
        }
        statusColor={
          statusConfig.color
        }
        statusBackgroundColor={
          statusConfig.backgroundColor
        }
        onBack={
          handleBack
        }
        onRefresh={() =>
          void refreshOrder()
        }
      />

      {/* CUSTOMER + DELIVERY */}

      <WorkerMarketCustomerDeliverySection
        customerName={
          order.receiverName ||
          "Customer"
        }
        customerPhone={
          order.receiverPhone
        }
        address={
          order.address ||
          "Address unavailable"
        }
        hasGps={
          hasGps
        }
        onCallCustomer={
          handleCallCustomer
        }
      />

      {/* EXISTING PRODUCTS COMPONENT */}

      <WorkerMarketProducts
        orderId={
          order.id
        }
        products={
          order.products
        }
        unavailableProducts={
          Array.from(
            unavailableProductIds,
          )
        }
        disabled={
          order.status !==
          "pending"
        }
      />

      {/* PAYMENT + SUMMARY + NOTE */}

      <WorkerMarketPaymentSummarySection
        paymentMethod={
          order.paymentMethod
        }
        paymentStatus={
          order.paymentStatus ||
          "pending"
        }
        itemCount={
          itemCount
        }
        subtotal={
          order.subtotal
        }
        deliveryFee={
          order.deliveryFee
        }
        total={
          order.total
        }
        note={
          order.note
        }
      />

      {/* EXISTING ORDER ACTIONS COMPONENT */}

      <WorkerMarketOrderActions
        orderId={
          order.id
        }
        status={
          order.status
        }
      />

      {/* CHAT */}

      <AppButton
        title="Chat with customer"
        role="worker"
        leftIconName="messages"
        disabled={
          !order.customerId
        }
        onPress={
          handleChatCustomer
        }
        style={
          styles.chatButton
        }
      />

      <View
        style={
          styles.bottomSpace
        }
      />
    </AppScreen>
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

      paddingBottom:
        FixxamTokens.spacing.xxxl,

      backgroundColor:
        Colors.background,
    },

    stateScreen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    center: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    errorIcon: {
      width:
        FixxamTokens.size.fabLarge,

      height:
        FixxamTokens.size.fabLarge,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.errorSoft,
    },

    errorTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    errorText: {
      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    errorActions: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,

      gap:
        FixxamTokens.spacing.sm,
    },

    errorButton: {
      width: "100%",
    },

    chatButton: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    bottomSpace: {
      height:
        FixxamTokens.spacing.xxl,
    },
  });