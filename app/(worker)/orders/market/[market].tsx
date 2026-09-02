import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import Toast from "react-native-toast-message";

import {
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import WorkerMarketProducts from "@/components/workerorders/market/WorkerMarketProducts";

import WorkerMarketOrderActions from "@/components/workerorders/market/WorkerMarketOrderActions";

/* ============================================================
   TYPES
============================================================ */

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
  reportedAt: Timestamp | null;
};

type MarketOrder = {
  id: string;

  orderType?: string;
  type?: string;

  customerId?: string;
  workerId?: string;
  sellerId?: string;
  storeId?: string;

  products: MarketOrderProduct[];

  unavailableProducts: UnavailableProduct[];

  subtotal: number;
  deliveryFee: number;
  total: number;

  paymentMethod: MarketPaymentMethod;

  paymentStatus?: string;

  status?: string;
  offerStatus?: string;

  receiverName?: string;
  receiverPhone?: string;

  stateId?: string;
  lgaId?: string;

  address?: string;

  latitude?: number;
  longitude?: number;

  note?: string;

  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

/* ============================================================
   HELPERS
============================================================ */

function safeString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value.trim();
  }

  return fallback;
}

function safeNumber(
  value: unknown,
): number {
  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatMoney(
  value: number,
): string {
  return `₦${value.toLocaleString(
    "en-NG",
  )}`;
}

function formatDate(
  value: unknown,
): string {
  if (!value) {
    return "Date unavailable";
  }

  try {
    let date: Date;

    if (value instanceof Timestamp) {
      date = value.toDate();
    } else if (value instanceof Date) {
      date = value;
    } else if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (
        value as {
          toDate?: unknown;
        }
      ).toDate === "function"
    ) {
      date = (
        value as {
          toDate: () => Date;
        }
      ).toDate();
    } else {
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

function formatPaymentMethod(
  method: MarketPaymentMethod,
): string {
  switch (method) {
    case "cash":
      return "Pay on Delivery";

    case "card":
      return "Card Payment";

    case "transfer":
      return "Bank Transfer";

    default:
      return "Payment method unavailable";
  }
}

/* ============================================================
   STATUS
============================================================ */

function normalizeStatus(
  value: unknown,
): string {
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
  status: string,
) {
  switch (status) {
    case "accepted":
      return {
        label: "ACCEPTED",
        background: "#EFF6FF",
        text: "#1D4ED8",
        icon:
          "checkmark-circle-outline" as const,
      };

    case "in-progress":
      return {
        label: "IN PROGRESS",
        background: "#EFF6FF",
        text: "#1D4ED8",
        icon:
          "play-circle-outline" as const,
      };

    case "completed":
      return {
        label: "COMPLETED",
        background: "#ECFDF5",
        text: "#15803D",
        icon:
          "checkmark-circle-outline" as const,
      };

    case "cancelled":
      return {
        label: "CANCELLED",
        background: "#FEF2F2",
        text: "#B91C1C",
        icon:
          "close-circle-outline" as const,
      };

    case "expired":
      return {
        label: "EXPIRED",
        background: "#F1F5F9",
        text: "#64748B",
        icon:
          "hourglass-outline" as const,
      };

    case "pending":
    default:
      return {
        label: "PENDING",
        background: "#FFF7E8",
        text: "#D97706",
        icon:
          "time-outline" as const,
      };
  }
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerMarketOrderDetailsScreen() {
  /*
   * IMPORTANT:
   *
   * Route:
   * /orders/market/[market]
   *
   * Router is sending:
   * params: {
   *   market: order.id
   * }
   *
   * Therefore we MUST read `market`.
   *
   * `orderId` is kept as a fallback for compatibility.
   */

  const {
    market,
    orderId,
    orderType,
  } =
    useLocalSearchParams<{
      market?:
        | string
        | string[];

      orderId?:
        | string
        | string[];

      orderType?:
        | string
        | string[];
    }>();

  /* ==========================================================
     NORMALIZE ROUTE PARAMS
  ========================================================== */

  const normalizedOrderId =
    useMemo(() => {
      const marketValue =
        Array.isArray(market)
          ? market[0]
          : market;

      const orderIdValue =
        Array.isArray(orderId)
          ? orderId[0]
          : orderId;

      /*
       * For this route `market` is the correct parameter.
       * `orderId` remains a fallback.
       */

      return (
        marketValue?.trim() ||
        orderIdValue?.trim() ||
        ""
      );
    }, [
      market,
      orderId,
    ]);

  const normalizedOrderType =
    useMemo(() => {
      const value =
        Array.isArray(orderType)
          ? orderType[0]
          : orderType;

      return (
        value
          ?.trim()
          .toLowerCase() ?? ""
      );
    }, [orderType]);

  /* ==========================================================
     STATE
  ========================================================== */

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

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  /* ==========================================================
     LOAD ORDER
  ========================================================== */

  const loadOrder =
    useCallback(
      async (
        options?: {
          silent?: boolean;
        },
      ) => {
        if (!normalizedOrderId) {
          setOrder(null);

          setError(
            "Order ID is missing.",
          );

          setLoading(false);

          return;
        }

        const currentUser =
          auth.currentUser;

        if (!currentUser) {
          setOrder(null);

          setError(
            "Please sign in again.",
          );

          setLoading(false);

          return;
        }

        const silent =
          options?.silent === true;

        try {
          if (!silent) {
            setLoading(true);
          }

          setError(null);

          /*
           * IMPORTANT:
           *
           * The Firestore order document is inside:
           *
           * orders/{orderId}
           *
           * normalizedOrderId comes from:
           *
           * route param `market`
           */

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

          if (!snapshot.exists()) {
            setOrder(null);

            setError(
              "This order could not be found.",
            );

            return;
          }

          const data =
            snapshot.data();

          /* ==================================================
             MARKET CHECK
          ================================================== */

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
            setOrder(null);

            setError(
              "This is not a market order.",
            );

            return;
          }

          /* ==================================================
             PRODUCTS
          ================================================== */

          const rawProducts =
            Array.isArray(
              data.products,
            )
              ? data.products
              : [];

          const products =
            rawProducts
              .map(
                (
                  product: unknown,
                ): MarketOrderProduct | null => {
                  if (
                    !product ||
                    typeof product !==
                      "object"
                  ) {
                    return null;
                  }

                  const value =
                    product as Record<
                      string,
                      unknown
                    >;

                  const productId =
                    safeString(
                      value.productId,
                      safeString(
                        value.id,
                      ),
                    );

                  if (!productId) {
                    return null;
                  }

                  const name =
                    safeString(
                      value.name,
                      safeString(
                        value.productName,
                        "Product",
                      ),
                    );

                  /*
                   * Support both:
                   *
                   * image
                   * imageUrl
                   */

                  const image =
                    safeString(
                      value.image,
                      safeString(
                        value.imageUrl,
                      ),
                    );

                  const price =
                    Math.max(
                      0,
                      safeNumber(
                        value.price,
                      ),
                    );

                  const quantity =
                    Math.max(
                      1,
                      Math.floor(
                        safeNumber(
                          value.quantity,
                        ),
                      ),
                    );

                  return {
                    productId,
                    name,
                    image:
                      image ||
                      undefined,
                    price,
                    quantity,
                  };
                },
              )
              .filter(
                (
                  product,
                ): product is MarketOrderProduct =>
                  product !== null,
              );

          /* ==================================================
             UNAVAILABLE PRODUCTS
          ================================================== */

          const rawUnavailable =
            Array.isArray(
              data.unavailableProducts,
            )
              ? data.unavailableProducts
              : [];

          const unavailableProducts =
            rawUnavailable
              .map(
                (
                  item: unknown,
                ): UnavailableProduct | null => {
                  if (
                    !item ||
                    typeof item !==
                      "object"
                  ) {
                    return null;
                  }

                  const value =
                    item as Record<
                      string,
                      unknown
                    >;

                  const productId =
                    safeString(
                      value.productId,
                    );

                  if (!productId) {
                    return null;
                  }

                  return {
                    productId,

                    productName:
                      safeString(
                        value.productName,
                        "Product",
                      ),

                    reportedBy:
                      safeString(
                        value.reportedBy,
                      ),

                    reportedAt:
                      value.reportedAt instanceof
                      Timestamp
                        ? value.reportedAt
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

          /* ==================================================
             WORKER SECURITY
          ================================================== */

          const workerId =
            safeString(
              data.workerId,
            );

          if (
            workerId &&
            workerId !==
              currentUser.uid
          ) {
            setOrder(null);

            setError(
              "You are not assigned to this order.",
            );

            return;
          }

          /* ==================================================
             PAYMENT
          ================================================== */

          const paymentMethod =
            data.paymentMethod ===
              "card" ||
            data.paymentMethod ===
              "transfer" ||
            data.paymentMethod ===
              "cash"
              ? data.paymentMethod
              : "cash";

          /* ==================================================
             ORDER
          ================================================== */

          const loadedOrder: MarketOrder =
            {
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

              workerId,

              sellerId:
                safeString(
                  data.sellerId,
                ),

              storeId:
                safeString(
                  data.storeId,
                ),

              products,

              unavailableProducts,

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
                "number"
                  ? data.latitude
                  : undefined,

              longitude:
                typeof data.longitude ===
                "number"
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
            };

          setOrder(
            loadedOrder,
          );
        } catch (loadError) {
          console.error(
            "FIXXAM_LOAD_WORKER_MARKET_ORDER_ERROR:",
            loadError,
          );

          setOrder(null);

          setError(
            "Unable to load this order. Please try again.",
          );
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      [
        normalizedOrderId,
        normalizedOrderType,
      ],
    );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refreshOrder =
    useCallback(async () => {
      try {
        setRefreshing(true);

        await loadOrder({
          silent: true,
        });
      } finally {
        setRefreshing(false);
      }
    }, [loadOrder]);

  /* ==========================================================
     CALCULATIONS
  ========================================================== */

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
        ) ?? 0,
      [order],
    );

  const unavailableProductIds =
    useMemo(
      () =>
        new Set(
          (
            order?.unavailableProducts ??
            []
          ).map(
            (product) =>
              product.productId,
          ),
        ),
      [order],
    );

  const status =
    order?.status ??
    "pending";

  const statusConfig =
    getStatusConfig(
      status,
    );

  /* ==========================================================
     CALL CUSTOMER
  ========================================================== */

  const handleCallCustomer =
    useCallback(
      async () => {
        const phone =
          order?.receiverPhone?.trim();

        if (!phone) {
          Toast.show({
            type: "info",
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
              type: "error",
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
            type: "error",
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

  /* ==========================================================
     CHAT CUSTOMER
  ========================================================== */

  const handleChatCustomer =
    useCallback(() => {
      const customerId =
        order?.customerId?.trim();

      if (!customerId) {
        Toast.show({
          type: "info",
          text1:
            "Chat unavailable",
          text2:
            "Customer information is not available.",
        });

        return;
      }

      if (!order?.id) {
        Toast.show({
          type: "error",
          text1:
            "Chat unavailable",
          text2:
            "Order information is missing.",
        });

        return;
      }

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

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen>
        <View
          style={
            styles.center
          }
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <AppText
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

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !order
  ) {
    return (
      <AppScreen>
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
            <Ionicons
              name="alert-circle-outline"
              size={34}
              color="#DC2626"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.errorTitle
            }
          >
            Order unavailable
          </AppText>

          <AppText
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
            <Pressable
              onPress={() =>
                void loadOrder()
              }
              style={
                styles.retryButton
              }
              accessibilityRole="button"
              accessibilityLabel="Retry loading order"
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color="#FFFFFF"
              />

              <AppText
                weight="bold"
                style={
                  styles.retryText
                }
              >
                Retry
              </AppText>
            </Pressable>

            <Pressable
              onPress={() =>
                router.back()
              }
              style={
                styles.secondaryBackButton
              }
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <AppText
                weight="bold"
                style={
                  styles.secondaryBackText
                }
              >
                Go Back
              </AppText>
            </Pressable>
          </View>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

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
          styles.container
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            style={({ pressed }) => [
              styles.headerButton,
              pressed &&
                styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="chevron-back"
              size={21}
              color="#0F172A"
            />
          </Pressable>

          <View
            style={
              styles.headerCenter
            }
          >
            <AppText
              weight="bold"
              style={
                styles.headerTitle
              }
            >
              Order Details
            </AppText>

            <AppText
              style={
                styles.headerSubtitle
              }
            >
              Market order
            </AppText>
          </View>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {/* ==================================================
            ORDER HEADER
        ================================================== */}

        <View
          style={
            styles.orderHeader
          }
        >
          <View
            style={
              styles.orderHeaderTop
            }
          >
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    statusConfig.background,
                },
              ]}
            >
              <Ionicons
                name={
                  statusConfig.icon
                }
                size={15}
                color={
                  statusConfig.text
                }
              />

              <AppText
                weight="bold"
                style={[
                  styles.statusText,
                  {
                    color:
                      statusConfig.text,
                  },
                ]}
              >
                {
                  statusConfig.label
                }
              </AppText>
            </View>

            <AppText
              style={
                styles.orderId
              }
              numberOfLines={1}
            >
              #
              {order.id.slice(
                0,
                9,
              )}
            </AppText>
          </View>

          <AppText
            weight="bold"
            style={
              styles.orderTitle
            }
          >
            Market Order
          </AppText>

          <AppText
            style={
              styles.orderDate
            }
          >
            Requested on{" "}
            {formatDate(
              order.createdAt,
            )}
          </AppText>

          {refreshing && (
            <View
              style={
                styles.refreshingRow
              }
            >
              <ActivityIndicator
                size="small"
                color="#2563EB"
              />

              <AppText
                style={
                  styles.refreshingText
                }
              >
                Updating...
              </AppText>
            </View>
          )}
        </View>

        {/* ==================================================
            CUSTOMER
        ================================================== */}

        <View
          style={
            styles.card
          }
        >
          <AppText
            weight="bold"
            style={
              styles.sectionTitle
            }
          >
            Customer
          </AppText>

          <View
            style={
              styles.customerRow
            }
          >
            <View
              style={
                styles.customerIcon
              }
            >
              <Ionicons
                name="person-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.customerInfo
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.customerName
                }
              >
                {
                  order.receiverName
                }
              </AppText>

              <AppText
                style={
                  styles.customerPhone
                }
              >
                {order.receiverPhone ||
                  "Phone number unavailable"}
              </AppText>
            </View>

            {order.receiverPhone ? (
              <Pressable
                onPress={
                  handleCallCustomer
                }
                style={({ pressed }) => [
                  styles.callButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Call customer"
              >
                <Ionicons
                  name="call-outline"
                  size={17}
                  color="#2563EB"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.callText
                  }
                >
                  Call
                </AppText>
              </Pressable>
            ) : (
              <View
                style={
                  styles.unavailableCallButton
                }
              >
                <Ionicons
                  name="call-outline"
                  size={16}
                  color="#94A3B8"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.unavailableCallText
                  }
                >
                  Unavailable
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* ==================================================
            DELIVERY
        ================================================== */}

        <View
          style={
            styles.card
          }
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <AppText
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              Delivery
            </AppText>

            {order.latitude !==
              undefined &&
              order.longitude !==
                undefined && (
                <View
                  style={
                    styles.gpsBadge
                  }
                >
                  <Ionicons
                    name="location"
                    size={13}
                    color="#16A34A"
                  />

                  <AppText
                    weight="bold"
                    style={
                      styles.gpsText
                    }
                  >
                    GPS
                  </AppText>
                </View>
              )}
          </View>

          <View
            style={
              styles.addressRow
            }
          >
            <View
              style={
                styles.addressIcon
              }
            >
              <Ionicons
                name="location-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <AppText
              style={
                styles.addressText
              }
            >
              {order.address}
            </AppText>
          </View>
        </View>

        {/* ==================================================
            PRODUCTS
        ================================================== */}

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
            status !== "pending"
          }
        />

        {/* ==================================================
            PAYMENT
        ================================================== */}

        <View
          style={
            styles.card
          }
        >
          <AppText
            weight="bold"
            style={
              styles.sectionTitle
            }
          >
            Payment
          </AppText>

          <View
            style={
              styles.paymentRow
            }
          >
            <View
              style={
                styles.paymentIcon
              }
            >
              <Ionicons
                name={
                  order.paymentMethod ===
                  "cash"
                    ? "cash-outline"
                    : order.paymentMethod ===
                        "card"
                      ? "card-outline"
                      : "business-outline"
                }
                size={20}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.paymentInfo
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.paymentName
                }
              >
                {formatPaymentMethod(
                  order.paymentMethod,
                )}
              </AppText>

              <AppText
                style={
                  styles.paymentStatus
                }
              >
                Payment:{" "}
                {order.paymentStatus ||
                  "pending"}
              </AppText>
            </View>
          </View>
        </View>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <View
          style={
            styles.summaryCard
          }
        >
          <AppText
            weight="bold"
            style={
              styles.sectionTitle
            }
          >
            Order Summary
          </AppText>

          <SummaryRow
            label="Items"
            value={`${itemCount} ${
              itemCount ===
              1
                ? "item"
                : "items"
            }`}
          />

          <SummaryRow
            label="Subtotal"
            value={formatMoney(
              order.subtotal,
            )}
          />

          <SummaryRow
            label="Delivery fee"
            value={formatMoney(
              order.deliveryFee,
            )}
          />

          <View
            style={
              styles.summaryDivider
            }
          />

          <View
            style={
              styles.totalRow
            }
          >
            <AppText
              weight="bold"
              style={
                styles.totalLabel
              }
            >
              Total
            </AppText>

            <AppText
              weight="bold"
              style={
                styles.totalValue
              }
            >
              {formatMoney(
                order.total,
              )}
            </AppText>
          </View>
        </View>

        {/* ==================================================
            CUSTOMER NOTE
        ================================================== */}

        {order.note ? (
          <View
            style={
              styles.noteCard
            }
          >
            <View
              style={
                styles.noteIcon
              }
            >
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.noteContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.noteTitle
                }
              >
                Customer Note
              </AppText>

              <AppText
                style={
                  styles.noteText
                }
              >
                {order.note}
              </AppText>
            </View>
          </View>
        ) : null}

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <WorkerMarketOrderActions
          orderId={
            order.id
          }
          status={
            order.status
          }
        />

        {/* ==================================================
            CHAT WITH CUSTOMER
        ================================================== */}

        <Pressable
          onPress={
            handleChatCustomer
          }
          disabled={
            !order.customerId
          }
          style={({ pressed }) => [
            styles.chatCustomerButton,

            !order.customerId &&
              styles.chatDisabled,

            pressed &&
              order.customerId &&
              styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Chat with customer"
          accessibilityState={{
            disabled:
              !order.customerId,
          }}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#FFFFFF"
          />

          <AppText
            weight="bold"
            style={
              styles.chatCustomerText
            }
          >
            CHAT WITH CUSTOMER
          </AppText>
        </Pressable>

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   SUMMARY ROW
============================================================ */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.summaryRow
      }
    >
      <AppText
        style={
          styles.summaryLabel
        }
      >
        {label}
      </AppText>

      <AppText
        weight="bold"
        style={
          styles.summaryValue
        }
      >
        {value}
      </AppText>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    container: {
      paddingHorizontal: 14,
      paddingBottom: 35,
    },

    /* HEADER */

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingVertical: 8,
      marginBottom: 8,
    },

    headerButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
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

    headerCenter: {
      flex: 1,
      alignItems:
        "center",
    },

    headerTitle: {
      fontSize: 19,
      color: "#0F172A",
    },

    headerSubtitle: {
      marginTop: 2,
      fontSize: 10,
      color: "#64748B",
    },

    headerSpacer: {
      width: 42,
    },

    /* ORDER HEADER */

    orderHeader: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 17,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    orderHeaderTop: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    },

    statusBadge: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 9,
    },

    statusText: {
      fontSize: 8,
    },

    orderId: {
      maxWidth: "50%",
      fontSize: 9,
      color: "#64748B",
    },

    orderTitle: {
      marginTop: 14,
      fontSize: 20,
      color: "#0F172A",
    },

    orderDate: {
      marginTop: 4,
      fontSize: 10,
      color: "#64748B",
    },

    refreshingRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 9,
      gap: 6,
    },

    refreshingText: {
      fontSize: 9,
      color: "#2563EB",
    },

    /* CARD */

    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 17,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    sectionHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 16,
      color: "#0F172A",
    },

    /* CUSTOMER */

    customerRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    customerIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    customerInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 11,
      marginRight: 8,
    },

    customerName: {
      fontSize: 14,
      color: "#0F172A",
    },

    customerPhone: {
      marginTop: 3,
      fontSize: 11,
      color: "#64748B",
    },

    callButton: {
      minHeight: 36,
      paddingHorizontal: 10,
      borderRadius: 11,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#BFDBFE",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 5,
    },

    callText: {
      fontSize: 9,
      color: "#2563EB",
    },

    unavailableCallButton: {
      minHeight: 34,
      paddingHorizontal: 9,
      borderRadius: 10,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 5,
    },

    unavailableCallText: {
      fontSize: 8,
      color: "#94A3B8",
    },

    /* DELIVERY */

    gpsBadge: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor:
        "#ECFDF5",
    },

    gpsText: {
      fontSize: 8,
      color: "#15803D",
    },

    addressRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
    },

    addressIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    addressText: {
      flex: 1,
      marginLeft: 10,
      paddingTop: 2,
      fontSize: 13,
      lineHeight: 20,
      color: "#475569",
    },

    /* PAYMENT */

    paymentRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    paymentIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    paymentInfo: {
      marginLeft: 11,
    },

    paymentName: {
      fontSize: 13,
      color: "#0F172A",
    },

    paymentStatus: {
      marginTop: 3,
      fontSize: 10,
      color: "#64748B",
    },

    /* SUMMARY */

    summaryCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 17,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    summaryRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginTop: 11,
    },

    summaryLabel: {
      fontSize: 12,
      color: "#64748B",
    },

    summaryValue: {
      fontSize: 12,
      color: "#334155",
    },

    summaryDivider: {
      height: 1,
      backgroundColor:
        "#E2E8F0",
      marginVertical: 15,
    },

    totalRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    totalLabel: {
      fontSize: 15,
      color: "#0F172A",
    },

    totalValue: {
      fontSize: 22,
      color: "#2563EB",
    },

    /* NOTE */

    noteCard: {
      flexDirection:
        "row",
      backgroundColor:
        "#EFF6FF",
      borderRadius: 17,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        "#BFDBFE",
    },

    noteIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    noteContent: {
      flex: 1,
      marginLeft: 10,
    },

    noteTitle: {
      fontSize: 12,
      color: "#1D4ED8",
    },

    noteText: {
      marginTop: 4,
      fontSize: 11,
      lineHeight: 17,
      color: "#475569",
    },

    /* CHAT */

    chatCustomerButton: {
      minHeight: 52,
      marginTop: 10,
      borderRadius: 15,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
      paddingHorizontal: 16,
    },

    chatCustomerText: {
      fontSize: 10,
      color: "#FFFFFF",
    },

    chatDisabled: {
      opacity: 0.45,
    },

    /* PRESSED */

    buttonPressed: {
      opacity: 0.8,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    /* BOTTOM */

    bottomSpace: {
      height: 25,
    },

    /* LOADING / ERROR */

    center: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 25,
    },

    loadingText: {
      marginTop: 10,
      fontSize: 13,
      color: "#64748B",
    },

    errorIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor:
        "#FEF2F2",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    errorTitle: {
      marginTop: 15,
      fontSize: 18,
      color: "#0F172A",
    },

    errorText: {
      marginTop: 7,
      fontSize: 13,
      lineHeight: 20,
      color: "#64748B",
    },

    errorActions: {
      marginTop: 20,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },

    retryButton: {
      minHeight: 48,
      paddingHorizontal: 18,
      borderRadius: 14,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
    },

    retryText: {
      color: "#FFFFFF",
      fontSize: 13,
    },

    secondaryBackButton: {
      minHeight: 48,
      paddingHorizontal: 18,
      borderRadius: 14,
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

    secondaryBackText: {
      color: "#334155",
      fontSize: 13,
    },
  });