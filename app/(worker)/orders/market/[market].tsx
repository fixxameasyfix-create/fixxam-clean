import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import {
  Timestamp,
  doc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";

import type {
  DocumentData,
  DocumentSnapshot,
} from "firebase/firestore";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  AppLoader,
} from "@/components/common";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  createWorkerMarketCallSession,
} from "@/services/calls/callSession";

import WorkerMarketOrderHeaderSection from "@/components/workerorders/market/details/WorkerMarketOrderHeaderSection";
import WorkerMarketCustomer from "@/components/workerorders/market/WorkerMarketCustomer";
import WorkerMarketOrderStatus from "@/components/workerorders/WorkerMarketOrderStatus";
import WorkerMarketProducts from "@/components/workerorders/market/WorkerMarketProducts";
import WorkerMarketDelivery from "@/components/workerorders/market/WorkerMarketDelivery";
import WorkerMarketPayment from "@/components/workerorders/market/WorkerMarketPayment";
import WorkerMarketSummary from "@/components/workerorders/market/WorkerMarketSummary";
import WorkerMarketNote from "@/components/workerorders/market/WorkerMarketNote";
import WorkerMarketContactActions from "@/components/workerorders/market/WorkerMarketContactActions";
import WorkerMarketOrderActions from "@/components/workerorders/market/WorkerMarketOrderActions";

/* ============================================================
   CONFIG
============================================================ */

const WORKER_CHAT_PATHNAME =
  "/orders/market/chat" as const;

const WORKER_CALL_PATHNAME =
  "/(worker)/call/[customer]" as const;

/* ============================================================
   TYPES
============================================================ */

type RouteParams = {
  market?:
    | string
    | string[];

  orderId?:
    | string
    | string[];
};

type MarketOrderStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

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

  reportedAt: Timestamp | null;
};

type MarketOrder = {
  id: string;

  orderType: string;

  customerId: string;

  workerId: string;

  sellerId: string;

  storeId: string;

  products: MarketOrderProduct[];

  unavailableProducts: UnavailableProduct[];

  subtotal: number;

  deliveryFee: number;

  total: number;

  paymentMethod: string;

  paymentStatus: string;

  status: MarketOrderStatus;

  receiverName: string;

  receiverPhone: string;

  stateId: string;

  lgaId: string;

  address: string;

  lat: number | null;

  lng: number | null;

  note: string;

  createdAt: Timestamp | null;

  updatedAt: Timestamp | null;
};

type ParsedOrderResult = {
  order: MarketOrder | null;

  error: string | null;
};

/* ============================================================
   HELPERS
============================================================ */

function safeString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  const normalized =
    value.trim();

  return (
    normalized ||
    fallback
  );
}

function safeNumber(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    value,
  );
}

function safeQuantity(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(
      value,
    ),
  );
}

function getRouteValue(
  value: unknown,
): string {
  if (
    Array.isArray(
      value,
    )
  ) {
    return safeString(
      value[0],
    );
  }

  return safeString(
    value,
  );
}

function getLatitude(
  value: unknown,
): number | null {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    ) ||
    value < -90 ||
    value > 90
  ) {
    return null;
  }

  return value;
}

function getLongitude(
  value: unknown,
): number | null {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    ) ||
    value < -180 ||
    value > 180
  ) {
    return null;
  }

  return value;
}

function getTimestamp(
  value: unknown,
): Timestamp | null {
  return value instanceof
    Timestamp
    ? value
    : null;
}

function formatDate(
  value: unknown,
): string {
  try {
    let date:
      | Date
      | null =
      null;

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
      value &&
      typeof value ===
        "object"
    ) {
      const record =
        value as {
          toDate?:
            () => Date;
        };

      if (
        typeof record.toDate ===
        "function"
      ) {
        date =
          record.toDate();
      }
    }

    if (
      !date ||
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat(
      "en-NG",
      {
        day:
          "2-digit",

        month:
          "short",
      },
    ).format(
      date,
    );
  } catch {
    return "Date unavailable";
  }
}

function normalizeStatusValue(
  value: unknown,
): string {
  return safeString(
    value,
  )
    .toLowerCase()
    .replace(
      /[_\s]+/g,
      "-",
    );
}

function normalizeStatus(
  value: unknown,
): MarketOrderStatus {
  const status =
    normalizeStatusValue(
      value,
    );

  switch (
    status
  ) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "on-the-way":
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
  status:
    MarketOrderStatus,
) {
  switch (
    status
  ) {
    case "accepted":
      return {
        label:
          "Accepted",

        icon:
          "check" as const,

        color:
          WorkerColors.primary,

        backgroundColor:
          WorkerColors.primarySoft,
      };

    case "in-progress":
      return {
        label:
          "On the way",

        icon:
          "navigation" as const,

        color:
          WorkerColors.primary,

        backgroundColor:
          WorkerColors.primarySoft,
      };

    case "completed":
      return {
        label:
          "Delivered",

        icon:
          "success" as const,

        color:
          Colors.success,

        backgroundColor:
          Colors.successSoft,
      };

    case "cancelled":
      return {
        label:
          "Cancelled",

        icon:
          "error" as const,

        color:
          Colors.error,

        backgroundColor:
          Colors.errorSoft,
      };

    case "expired":
      return {
        label:
          "Expired",

        icon:
          "clock" as const,

        color:
          Colors.textSecondary,

        backgroundColor:
          Colors.disabledBackground,
      };

    case "pending":
    default:
      return {
        label:
          "Pending",

        icon:
          "clock" as const,

        color:
          Colors.warning,

        backgroundColor:
          Colors.warningSoft,
      };
  }
}

/* ============================================================
   NORMALIZE PRODUCTS
============================================================ */

function normalizeProducts(
  value: unknown,
): MarketOrderProduct[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value.flatMap(
    item => {
      if (
        !item ||
        typeof item !==
          "object"
      ) {
        return [];
      }

      const data =
        item as Record<
          string,
          unknown
        >;

      const productId =
        safeString(
          data.productId,
        ) ||
        safeString(
          data.id,
        );

      if (
        !productId
      ) {
        return [];
      }

      const image =
        safeString(
          data.image,
        ) ||
        safeString(
          data.imageUrl,
        ) ||
        safeString(
          data.photoUrl,
        );

      const product:
        MarketOrderProduct = {
          productId,

          name:
            safeString(
              data.name,
              "Product",
            ),

          price:
            safeNumber(
              data.price,
            ),

          quantity:
            safeQuantity(
              data.quantity,
            ),
        };

      if (
        image
      ) {
        product.image =
          image;
      }

      return [
        product,
      ];
    },
  );
}

/* ============================================================
   NORMALIZE UNAVAILABLE PRODUCTS
============================================================ */

function normalizeUnavailableProducts(
  value: unknown,
): UnavailableProduct[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  const products =
    new Map<
      string,
      UnavailableProduct
    >();

  value.forEach(
    item => {
      if (
        typeof item ===
        "string"
      ) {
        const productId =
          safeString(
            item,
          );

        if (
          productId
        ) {
          products.set(
            productId,
            {
              productId,

              productName:
                "Product",

              reportedBy:
                "",

              reportedAt:
                null,
            },
          );
        }

        return;
      }

      if (
        !item ||
        typeof item !==
          "object"
      ) {
        return;
      }

      const data =
        item as Record<
          string,
          unknown
        >;

      const productId =
        safeString(
          data.productId,
        ) ||
        safeString(
          data.id,
        );

      if (
        !productId
      ) {
        return;
      }

      products.set(
        productId,
        {
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
            getTimestamp(
              data.reportedAt,
            ),
        },
      );
    },
  );

  return Array.from(
    products.values(),
  );
}

/* ============================================================
   PARSE FIRESTORE ORDER
============================================================ */

function parseMarketOrderSnapshot(
  snapshot:
    DocumentSnapshot<DocumentData>,

  workerUid:
    string,
): ParsedOrderResult {
  if (
    !snapshot.exists()
  ) {
    return {
      order:
        null,

      error:
        "This market order no longer exists.",
    };
  }

  const data =
    snapshot.data();

  const orderType =
    safeString(
      data.orderType,
    ) ||
    safeString(
      data.type,
    );

  if (
    orderType
      .toLowerCase() !==
    "market"
  ) {
    return {
      order:
        null,

      error:
        "This is not a market order.",
    };
  }

  const assignedWorkerId =
    safeString(
      data.workerId,
    ) ||
    safeString(
      data.sellerId,
    );

  if (
    assignedWorkerId &&
    assignedWorkerId !==
      workerUid
  ) {
    return {
      order:
        null,

      error:
        "This market order is assigned to another worker.",
    };
  }

  const order:
    MarketOrder = {
      id:
        snapshot.id,

      orderType:
        "market",

      customerId:
        safeString(
          data.customerId,
        ),

      workerId:
        safeString(
          data.workerId,
        ),

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
        safeNumber(
          data.subtotal,
        ),

      deliveryFee:
        safeNumber(
          data.deliveryFee,
        ),

      total:
        safeNumber(
          data.total,
        ),

      paymentMethod:
        safeString(
          data.paymentMethod,
        ),

      paymentStatus:
        safeString(
          data.paymentStatus,
          "pending",
        ),

      status:
        normalizeStatus(
          data.status,
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
        ),

      lat:
        getLatitude(
          data.lat ??
            data.latitude,
        ),

      lng:
        getLongitude(
          data.lng ??
            data.longitude,
        ),

      note:
        safeString(
          data.note,
        ),

      createdAt:
        getTimestamp(
          data.createdAt,
        ),

      updatedAt:
        getTimestamp(
          data.updatedAt,
        ),
    };

  return {
    order,

    error:
      null,
  };
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerMarketOrderDetailsScreen() {
  const router =
    useRouter();

  const navigation =
    useNavigation();

  const params =
    useLocalSearchParams<RouteParams>();

  /* ==========================================================
     HIDE WORKER BOTTOM NAVIGATION
  ========================================================== */

  useFocusEffect(
    useCallback(() => {
      const tabNavigator =
        navigation.getParent();

      tabNavigator?.setOptions({
        tabBarStyle: {
          display:
            "none",
        },
      });

      return () => {
        tabNavigator?.setOptions({
          tabBarStyle:
            undefined,
        });
      };
    }, [
      navigation,
    ]),
  );

  /* ==========================================================
     FIREBASE
  ========================================================== */

  const firebaseAuth =
    useMemo(
      () =>
        getAuth(),
      [],
    );

  const firestore =
    useMemo(
      () =>
        getFirestore(),
      [],
    );

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    workerUid,
    setWorkerUid,
  ] =
    useState("");

  const [
    authReady,
    setAuthReady,
  ] =
    useState(false);

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
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    callingCustomer,
    setCallingCustomer,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const callingRef =
    useRef(false);

  /* ==========================================================
     ROUTE ORDER ID
  ========================================================== */

  const normalizedOrderId =
    useMemo(() => {
      const marketValue =
        getRouteValue(
          params?.market,
        );

      const orderIdValue =
        getRouteValue(
          params?.orderId,
        );

      return (
        marketValue ||
        orderIdValue
      );
    }, [
      params?.market,
      params?.orderId,
    ]);

  /* ==========================================================
     AUTH
  ========================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        firebaseAuth,

        user => {
          setWorkerUid(
            safeString(
              user?.uid,
            ),
          );

          setAuthReady(
            true,
          );
        },
      );

    return unsubscribe;
  }, [
    firebaseAuth,
  ]);

  /* ==========================================================
     REALTIME ORDER
  ========================================================== */

  useEffect(() => {
    if (
      !authReady
    ) {
      return;
    }

    if (
      !normalizedOrderId
    ) {
      setOrder(
        null,
      );

      setError(
        "Order ID is missing or invalid.",
      );

      setLoading(
        false,
      );

      return;
    }

    if (
      !workerUid
    ) {
      setOrder(
        null,
      );

      setError(
        "Please sign in again to view this order.",
      );

      setLoading(
        false,
      );

      return;
    }

    setLoading(
      true,
    );

    setError(
      null,
    );

    const orderRef =
      doc(
        firestore,
        "orders",
        normalizedOrderId,
      );

    const unsubscribe =
      onSnapshot(
        orderRef,

        snapshot => {
          const result =
            parseMarketOrderSnapshot(
              snapshot,
              workerUid,
            );

          setOrder(
            result.order,
          );

          setError(
            result.error,
          );

          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        },

        listenerError => {
          if (
            __DEV__
          ) {
            console.warn(
              "WORKER_MARKET_ORDER_LISTENER_ERROR",
              listenerError,
            );
          }

          setOrder(
            null,
          );

          setError(
            "Unable to load this market order. Please try again.",
          );

          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        },
      );

    return unsubscribe;
  }, [
    authReady,
    firestore,
    normalizedOrderId,
    workerUid,
  ]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    useCallback(async () => {
      if (
        refreshing ||
        !normalizedOrderId
      ) {
        return;
      }

      if (
        !workerUid
      ) {
        Toast.show({
          type:
            "error",

          text1:
            "Sign in required",

          text2:
            "Please sign in again to continue.",
        });

        return;
      }

      setRefreshing(
        true,
      );

      try {
        const orderRef =
          doc(
            firestore,
            "orders",
            normalizedOrderId,
          );

        const snapshot =
          await getDocFromServer(
            orderRef,
          );

        const result =
          parseMarketOrderSnapshot(
            snapshot,
            workerUid,
          );

        setOrder(
          result.order,
        );

        setError(
          result.error,
        );

        if (
          !result.error
        ) {
          Toast.show({
            type:
              "success",

            text1:
              "Order refreshed",
          });
        }
      } catch (
        refreshError
      ) {
        if (
          __DEV__
        ) {
          console.warn(
            "WORKER_MARKET_ORDER_REFRESH_ERROR",
            refreshError,
          );
        }

        Toast.show({
          type:
            "error",

          text1:
            "Unable to refresh",

          text2:
            "Please check your connection and try again.",
        });
      } finally {
        setRefreshing(
          false,
        );
      }
    }, [
      firestore,
      normalizedOrderId,
      refreshing,
      workerUid,
    ]);

  /* ==========================================================
     FIXXAM VOICE — CALL CUSTOMER
  ========================================================== */

  const handleCallCustomer =
    useCallback(async () => {
      if (
        callingRef.current
      ) {
        return;
      }

      if (
        !order
      ) {
        Toast.show({
          type:
            "error",

          text1:
            "Call unavailable",

          text2:
            "Order information is not available.",
        });

        return;
      }

      const currentWorker =
        firebaseAuth.currentUser;

      const currentWorkerId =
        safeString(
          currentWorker?.uid,
        );

      const currentOrderId =
        safeString(
          order.id,
        );

      const customerId =
        safeString(
          order.customerId,
        );

      const customerName =
        safeString(
          order.receiverName,
          "Customer",
        );

      if (
        !currentWorker ||
        !currentWorkerId ||
        currentWorkerId !==
          workerUid
      ) {
        Toast.show({
          type:
            "error",

          text1:
            "Sign in required",

          text2:
            "Please sign in again before starting a call.",
        });

        return;
      }

      if (
        !currentOrderId
      ) {
        Toast.show({
          type:
            "error",

          text1:
            "Call unavailable",

          text2:
            "Order information is missing.",
        });

        return;
      }

      if (
        !customerId
      ) {
        Toast.show({
          type:
            "info",

          text1:
            "Call unavailable",

          text2:
            "This order does not contain a customer account.",
        });

        return;
      }

      if (
        customerId ===
        currentWorkerId
      ) {
        Toast.show({
          type:
            "error",

          text1:
            "Call unavailable",

          text2:
            "You cannot call your own account.",
        });

        return;
      }

      callingRef.current =
        true;

      setCallingCustomer(
        true,
      );

      try {
        const callId =
          await createWorkerMarketCallSession({
            workerId:
              currentWorkerId,

            customerId,

            orderId:
              currentOrderId,

            workerSnapshot: {
              name:
                safeString(
                  currentWorker.displayName,
                  "Worker",
                ),

              image:
                safeString(
                  currentWorker.photoURL,
                ),

              service:
                "Market Order",
            },

            customerSnapshot: {
              name:
                customerName,

              image:
                "",

              service:
                "Market Order",
            },
          });

        if (
          !callId
        ) {
          throw new Error(
            "Call session was not created.",
          );
        }

        router.push({
          pathname:
            WORKER_CALL_PATHNAME,

          params: {
            customer:
              customerId,

            callId,

            customerName,
          },
        } as never);
      } catch (
        callError
      ) {
        if (
          __DEV__
        ) {
          console.error(
            "FIXXAM_WORKER_MARKET_CALL_START_ERROR:",
            callError,
          );
        }

        Toast.show({
          type:
            "error",

          text1:
            "Call failed",

          text2:
            callError instanceof
              Error &&
            callError.message
              ? callError.message
              : "Unable to start Fixxam Voice. Please try again.",
        });
      } finally {
        callingRef.current =
          false;

        setCallingCustomer(
          false,
        );
      }
    }, [
      firebaseAuth,
      order,
      router,
      workerUid,
    ]);

  /* ==========================================================
     CHAT
  ========================================================== */

  const handleChat =
    useCallback(() => {
      if (
        !order
      ) {
        return;
      }

      const currentOrderId =
        safeString(
          order.id,
        );

      const customerId =
        safeString(
          order.customerId,
        );

      const customerName =
        safeString(
          order.receiverName,
          "Customer",
        );

      if (
        !currentOrderId
      ) {
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

      if (
        !customerId
      ) {
        Toast.show({
          type:
            "info",

          text1:
            "Chat unavailable",

          text2:
            "Customer information is unavailable for this order.",
        });

        return;
      }

      router.push({
        pathname:
          WORKER_CHAT_PATHNAME,

        params: {
          orderId:
            currentOrderId,

          customerId,

          customerName,
        },
      } as never);
    }, [
      order,
      router,
    ]);

  /* ==========================================================
     DERIVED DATA
  ========================================================== */

  const createdDate =
    useMemo(
      () =>
        formatDate(
          order?.createdAt ??
            null,
        ),
      [
        order?.createdAt,
      ],
    );

  const statusConfig =
    useMemo(
      () =>
        getStatusConfig(
          order?.status ??
            "pending",
        ),
      [
        order?.status,
      ],
    );

  const unavailableProductIds =
    useMemo(() => {
      const ids =
        new Set<string>();

      const unavailableProducts =
        order?.unavailableProducts ??
        [];

      unavailableProducts.forEach(
        product => {
          const productId =
            safeString(
              product?.productId,
            );

          if (
            productId
          ) {
            ids.add(
              productId,
            );
          }
        },
      );

      return ids;
    }, [
      order?.unavailableProducts,
    ]);

  const unavailableProductIdList =
    useMemo(
      () =>
        Array.from(
          unavailableProductIds,
        ),
      [
        unavailableProductIds,
      ],
    );

  const unavailableProductCount =
    unavailableProductIds.size;

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    loading ||
    !authReady
  ) {
    return (
      <AppScreen
        scrollEnabled={
          false
        }
        contentContainerStyle={
          styles.centerContent
        }
      >
        <AppLoader />

        <AppText
          variant="caption"
          style={
            styles.loadingText
          }
        >
          Loading market order...
        </AppText>
      </AppScreen>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !order
  ) {
    return (
      <AppScreen
        scrollEnabled={
          false
        }
        contentContainerStyle={
          styles.centerContent
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <AppIcon
            name="error"
            size="md"
            color={
              Colors.error
            }
          />
        </View>

        <AppText
          variant="heading3"
          weight="bold"
          style={
            styles.errorTitle
          }
        >
          Order unavailable
        </AppText>

        <AppText
          variant="body"
          center
          style={
            styles.errorMessage
          }
        >
          {error ??
            "This market order could not be loaded."}
        </AppText>

        <View
          style={
            styles.errorActions
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() =>
              router.back()
            }
            style={({
              pressed,
            }) => [
              styles.errorSecondaryButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              size="xs"
              color={
                Colors.textPrimary
              }
            />

            <AppText
              variant="bodyMedium"
              weight="medium"
              style={
                styles.errorSecondaryText
              }
            >
              Go back
            </AppText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading order"
            accessibilityState={{
              disabled:
                refreshing,

              busy:
                refreshing,
            }}
            disabled={
              refreshing
            }
            onPress={() => {
              void handleRefresh();
            }}
            style={({
              pressed,
            }) => [
              styles.errorPrimaryButton,

              refreshing
                ? styles.disabled
                : null,

              pressed &&
              !refreshing
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="refresh"
              size="xs"
              color="#FFFFFF"
            />

            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.errorPrimaryText
              }
            >
              {refreshing
                ? "Retrying..."
                : "Retry"}
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     SCREEN
  ========================================================== */

  return (
    <AppScreen
      scrollEnabled
      contentContainerStyle={
        styles.screen
      }
    >
      <WorkerMarketOrderHeaderSection
        orderId={
          order.id
        }
        createdDate={
          createdDate
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
        onBack={() =>
          router.back()
        }
        onRefresh={() => {
          void handleRefresh();
        }}
      />

      <View
        style={
          styles.content
        }
      >
        <WorkerMarketCustomer
          customerName={
            order.receiverName
          }
          customerPhone={
            order.receiverPhone
          }
          orderId={
            order.id
          }
          createdDate={
            createdDate
          }
        />

        <WorkerMarketOrderStatus
          status={
            order.status
          }
        />

        <WorkerMarketProducts
          orderId={
            order.id
          }
          products={
            order.products
          }
          unavailableProducts={
            unavailableProductIdList
          }
          disabled={
            order.status !==
            "pending"
          }
        />

        <WorkerMarketDelivery
          receiverName={
            order.receiverName
          }
          receiverPhone={
            order.receiverPhone
          }
          address={
            order.address
          }
          latitude={
            order.lat
          }
          longitude={
            order.lng
          }
        />

        <WorkerMarketPayment
          paymentMethod={
            order.paymentMethod
          }
          paymentStatus={
            order.paymentStatus
          }
        />

        <WorkerMarketSummary
          subtotal={
            order.subtotal
          }
          deliveryFee={
            order.deliveryFee
          }
          total={
            order.total
          }
        />

        {order.note ? (
          <WorkerMarketNote
            note={
              order.note
            }
          />
        ) : null}

        <WorkerMarketContactActions
          onCall={
            handleCallCustomer
          }
          onChat={
            handleChat
          }
          calling={
            callingCustomer
          }
        />

        <WorkerMarketOrderActions
          orderId={
            order.id
          }
          status={
            order.status
          }
          unavailableProductCount={
            unavailableProductCount
          }
        />
      </View>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      width:
        "100%",

      paddingHorizontal:
        0,

      paddingTop:
        0,

      paddingBottom:
        FixxamTokens.spacing.xl,

      backgroundColor:
        Colors.background,
    },

    content: {
      width:
        "100%",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.md,
    },

    centerContent: {
      flexGrow:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.background,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    errorIcon: {
      width:
        52,

      height:
        52,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.errorSoft,
    },

    errorTitle: {
      marginTop:
        FixxamTokens.spacing.sm,

      textAlign:
        "center",

      color:
        Colors.textPrimary,
    },

    errorMessage: {
      maxWidth:
        320,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        20,

      textAlign:
        "center",

      color:
        Colors.textSecondary,
    },

    errorActions: {
      width:
        "100%",

      maxWidth:
        320,

      marginTop:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    errorSecondaryButton: {
      flex:
        1,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    errorPrimaryButton: {
      flex:
        1,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primary,
    },

    errorSecondaryText: {
      color:
        Colors.textPrimary,
    },

    errorPrimaryText: {
      color:
        "#FFFFFF",
    },

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
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