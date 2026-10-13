import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  Order,
} from "./orders.types";

import {
  STATUS_CONFIG,
} from "./orders.utils";

import {
  Colors,
  CustomerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  order: Order;
  onPress: () => void;
};

type StatusBadgeVariant =
  | "primary"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info";

type OfferInfo = {
  label: string;
  amount: number;
  success: boolean;
};

type ServiceLocationInfo = {
  label: string;
  icon:
    | "home-outline"
    | "store-outline";
  color: string;
};

/* ==============================================================
   STATUS VARIANT
============================================================== */

function getStatusVariant(
  status: Order["status"],
): StatusBadgeVariant {
  switch (status) {
    case "accepted":
      return "info";

    case "in-progress":
      return "primary";

    case "completed":
      return "success";

    case "cancelled":
      return "error";

    case "expired":
      return "neutral";

    case "pending":
    default:
      return "warning";
  }
}

/* ==============================================================
   CURRENCY
============================================================== */

function formatCurrency(
  amount: number,
): string {
  const safeAmount =
    Number.isFinite(amount)
      ? Math.max(0, amount)
      : 0;

  return `₦${safeAmount.toLocaleString(
    "en-NG",
  )}`;
}

/* ==============================================================
   OFFER
============================================================== */

function getLatestOffer(
  order: Order,
): OfferInfo | null {
  if (
    order.counterOfferStatus ===
      "sent" &&
    typeof order.counterOfferAmount ===
      "number" &&
    Number.isFinite(
      order.counterOfferAmount,
    )
  ) {
    return {
      label:
        order.counterOfferBy ===
        "customer"
          ? "Your counter offer"
          : "Worker counter offer",

      amount: Math.max(
        0,
        order.counterOfferAmount,
      ),

      success: false,
    };
  }

  if (
    order.offerStatus === "sent" &&
    typeof order.offerAmount ===
      "number" &&
    Number.isFinite(
      order.offerAmount,
    )
  ) {
    return {
      label: "Worker offer",

      amount: Math.max(
        0,
        order.offerAmount,
      ),

      success: false,
    };
  }

  if (
    (
      order.status === "accepted" ||
      order.status === "in-progress" ||
      order.status === "completed"
    ) &&
    typeof order.agreedPrice ===
      "number" &&
    Number.isFinite(
      order.agreedPrice,
    )
  ) {
    return {
      label: "Agreed price",

      amount: Math.max(
        0,
        order.agreedPrice,
      ),

      success: true,
    };
  }

  return null;
}

/* ==============================================================
   SERVICE LOCATION
============================================================== */

function getServiceLocationInfo(
  order: Order,
): ServiceLocationInfo | null {
  switch (
    order.fulfillmentMode
  ) {
    case "worker_visits_customer":
      return {
        label:
          "Worker will come to your location",

        icon:
          "home-outline",

        color:
          CustomerColors.primary,
      };

    case "customer_visits_worker":
      return {
        label:
          "You’ll go to the worker shop",

        icon:
          "store-outline",

        color:
          Colors.warning,
      };

    case "remote":
    default:
      return null;
  }
}

/* ==============================================================
   STATUS BADGE
============================================================== */

const StatusBadge = memo(
  function StatusBadge({
    status,
  }: {
    status: Order["status"];
  }) {
    const config =
      STATUS_CONFIG[status];

    const variant =
      getStatusVariant(status);

    const backgroundColor =
      variant === "success"
        ? Colors.successSoft
        : variant === "warning"
          ? Colors.warningSoft
          : variant === "error"
            ? Colors.errorSoft
            : variant === "info"
              ? Colors.infoSoft
              : variant === "primary"
                ? Colors.infoSoft
                : Colors.disabledBackground;

    const textColor =
      variant === "success"
        ? Colors.success
        : variant === "warning"
          ? Colors.warning
          : variant === "error"
            ? Colors.error
            : variant === "info"
              ? Colors.info
              : variant === "primary"
                ? Colors.info
                : Colors.textSecondary;

    return (
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={
          config.label
        }
        style={[
          styles.statusBadge,
          {
            backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                textColor,
            },
          ]}
        />

        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={[
            styles.statusText,
            {
              color: textColor,
            },
          ]}
        >
          {config.label}
        </AppText>
      </View>
    );
  },
);

StatusBadge.displayName =
  "OrderStatusBadge";

/* ==============================================================
   ORDER CARD
============================================================== */

function OrderCard({
  order,
  onPress,
}: Props) {
  const offer =
    useMemo(
      () =>
        getLatestOffer(order),
      [order],
    );

  const serviceLocation =
    useMemo(
      () =>
        getServiceLocationInfo(
          order,
        ),
      [
        order.fulfillmentMode,
      ],
    );

  const serviceName =
    order.serviceName?.trim() ||
    "Service";

  const workerName =
    order.workerName?.trim() ||
    "Worker";

  const serviceIcon =
    order.serviceIcon ||
    "tools";

  const serviceColor =
    order.serviceColor?.trim() ||
    CustomerColors.primary;

  const serviceBackgroundColor =
    order.serviceBackgroundColor?.trim() ||
    CustomerColors.primarySoft;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${serviceName}, ${workerName}`}
      accessibilityHint="Opens order details"
      style={({ pressed }) => [
        styles.pressable,

        pressed &&
          styles.cardPressed,
      ]}
    >
      <View
        style={styles.card}
      >
        {/* ====================================================
            TOP ROW
        ==================================================== */}

        <View
          style={styles.topRow}
        >
          <StatusBadge
            status={
              order.status
            }
          />
        </View>

        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <View
          style={styles.contentRow}
        >
          {/* ==================================================
              SERVICE ICON
          ================================================== */}

          <View
            style={[
              styles.serviceIcon,
              {
                backgroundColor:
                  serviceBackgroundColor,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={
                serviceIcon
              }
              size={25}
              color={
                serviceColor
              }
            />
          </View>

          {/* ==================================================
              DETAILS
          ================================================== */}

          <View
            style={styles.details}
          >
            {/* SERVICE NAME */}

            <AppText
              variant="bodyMedium"
              weight="bold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={
                styles.serviceName
              }
            >
              {serviceName}
            </AppText>

            {/* WORKER */}

            <View
              style={
                styles.workerRow
              }
            >
              <AppIcon
                name="person"
                role="customer"
                size="xs"
                state="muted"
              />

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={
                  styles.workerName
                }
              >
                {workerName}
              </AppText>
            </View>

            {/* FULFILLMENT */}

            {serviceLocation ? (
              <View
                style={
                  styles.locationRow
                }
              >
                <MaterialCommunityIcons
                  name={
                    serviceLocation.icon
                  }
                  size={14}
                  color={
                    serviceLocation.color
                  }
                />

                <AppText
                  variant="caption"
                  weight="medium"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.locationText,
                    {
                      color:
                        serviceLocation.color,
                    },
                  ]}
                >
                  {
                    serviceLocation.label
                  }
                </AppText>
              </View>
            ) : null}
          </View>

          {/* ==================================================
              TRAILING
          ================================================== */}

          <View
            style={
              styles.trailing
            }
          >
            {offer ? (
              <View
                style={
                  styles.priceBlock
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.price,
                    offer.success &&
                      styles.successPrice,
                  ]}
                >
                  {formatCurrency(
                    offer.amount,
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.offerLabel,
                    offer.success &&
                      styles.offerLabelSuccess,
                  ]}
                >
                  {
                    offer.label
                  }
                </AppText>
              </View>
            ) : null}

            {/* CHEVRON */}

            <View
              style={
                styles.chevron
              }
            >
              <AppIcon
                name="next"
                role="customer"
                size="sm"
                state="muted"
              />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       PRESSABLE
    ======================================================== */

    pressable: {
      width: "100%",
    },

    cardPressed: {
      opacity: 0.9,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width: "100%",

      paddingHorizontal: 14,
      paddingVertical: 12,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius: 18,

      backgroundColor:
        Colors.surface,

      shadowColor:
        "#0F172A",

      shadowOpacity:
        0.06,

      shadowRadius:
        10,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 2,
    },

    /* ========================================================
       TOP ROW
    ======================================================== */

    topRow: {
      minHeight: 26,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "flex-start",
    },

    /* ========================================================
       STATUS BADGE
    ======================================================== */

    statusBadge: {
      minHeight: 26,

      paddingHorizontal: 9,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 999,

      gap: 6,
    },

    statusDot: {
      width: 6,

      height: 6,

      borderRadius: 3,

      flexShrink: 0,
    },

    statusText: {
      fontSize: 10,

      lineHeight: 13,

      letterSpacing: 0.15,

      includeFontPadding:
        false,
    },

    /* ========================================================
       CONTENT ROW
    ======================================================== */

    contentRow: {
      marginTop: 10,

      minHeight: 52,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 10,
    },

    /* ========================================================
       SERVICE ICON
    ======================================================== */

    serviceIcon: {
      width: 50,

      height: 50,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 15,
    },

    /* ========================================================
       DETAILS
    ======================================================== */

    details: {
      flex: 1,

      minWidth: 0,

      justifyContent:
        "center",
    },

    serviceName: {
      color:
        Colors.textPrimary,

      fontSize: 15,

      lineHeight: 19,

      letterSpacing: -0.15,

      includeFontPadding:
        false,
    },

    /* ========================================================
       WORKER
    ======================================================== */

    workerRow: {
      marginTop: 4,

      flexDirection:
        "row",

      alignItems:
        "center",

      minWidth: 0,

      gap: 5,
    },

    workerName: {
      flex: 1,

      minWidth: 0,

      fontSize: 12,

      lineHeight: 16,

      color:
        Colors.textSecondary,

      includeFontPadding:
        false,
    },

    /* ========================================================
       LOCATION
    ======================================================== */

    locationRow: {
      marginTop: 4,

      flexDirection:
        "row",

      alignItems:
        "center",

      minWidth: 0,

      gap: 5,
    },

    locationText: {
      flex: 1,

      minWidth: 0,

      fontSize: 11,

      lineHeight: 14,

      letterSpacing: -0.05,

      includeFontPadding:
        false,
    },

    /* ========================================================
       TRAILING
    ======================================================== */

    trailing: {
      flexShrink: 0,

      minHeight: 52,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 4,
    },

    /* ========================================================
       PRICE
    ======================================================== */

    priceBlock: {
      width: 82,

      alignItems:
        "flex-end",

      justifyContent:
        "center",
    },

    price: {
      color:
        CustomerColors.primary,

      fontSize: 14,

      lineHeight: 18,

      letterSpacing: -0.1,

      includeFontPadding:
        false,
    },

    successPrice: {
      color:
        Colors.success,
    },

    offerLabel: {
      maxWidth: 82,

      marginTop: 3,

      fontSize: 9,

      lineHeight: 12,

      color:
        CustomerColors.primary,

      includeFontPadding:
        false,
    },

    offerLabelSuccess: {
      color:
        Colors.success,
    },

    /* ========================================================
       CHEVRON
    ======================================================== */

    chevron: {
      width: 38,

      height: 42,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 12,

      backgroundColor:
        Colors.iconBackground,
    },
  });

/* ==============================================================
   DISPLAY NAME
============================================================== */

OrderCard.displayName =
  "OrderCard";

/* ==============================================================
   EXPORT
============================================================== */

export default memo(
  OrderCard,
);