import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  AppBadge,
  AppDivider,
} from "@/components/common";

import type {
  Order,
} from "./orders.types";

import {
  formatOrderNumber,
  STATUS_CONFIG,
} from "./orders.utils";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
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

/* ==============================================================
   HELPERS
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

function formatCurrency(
  amount: number,
): string {
  return `₦${amount.toLocaleString(
    "en-NG",
  )}`;
}

/* ==============================================================
   ORDER CARD
============================================================== */

function OrderCard({
  order,
  onPress,
}: Props) {
  const status =
    STATUS_CONFIG[
      order.status
    ];

  const statusVariant =
    getStatusVariant(
      order.status,
    );

  const showSchedule =
    Boolean(order.time) &&
    order.status !==
      "pending";

  const dateLabel =
    showSchedule
      ? order.date
      : order.status ===
          "pending"
        ? "Waiting for response"
        : order.date;

  return (
    <AppCard
      role="customer"
      variant="outlined"
      onPress={onPress}
      accessibilityLabel={`Open ${order.serviceName} order`}
      style={styles.card}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <AppBadge
          role="customer"
          variant={statusVariant}
          label={status.label}
        />

        <AppText
          variant="caption"
          tone="muted"
          numberOfLines={1}
        >
          {formatOrderNumber(
            order.id,
          )}
        </AppText>
      </View>

      {/* ======================================================
          MAIN SERVICE
      ====================================================== */}

      <View style={styles.mainRow}>
        <View
          style={
            styles.serviceIcon
          }
        >
          <AppIcon
            name={
              order.serviceIcon ??
              "service"
            }
            role="customer"
            size="lg"
            state="active"
          />
        </View>

        <View
          style={
            styles.serviceContent
          }
        >
          <AppText
            variant="bodyLarge"
            weight="semibold"
            numberOfLines={1}
          >
            {order.serviceName}
          </AppText>

          <View
            style={
              styles.workerRow
            }
          >
            <View
              style={
                styles.workerAvatar
              }
            >
              <AppIcon
                name="profile"
                role="customer"
                size="xs"
                state="muted"
              />
            </View>

            <View
              style={
                styles.workerContent
              }
            >
              <AppText
                variant="bodyMedium"
                numberOfLines={1}
              >
                {order.workerName}
              </AppText>

              {order.workerCategory ? (
                <AppText
                  variant="caption"
                  tone="muted"
                  numberOfLines={1}
                  style={
                    styles.workerCategory
                  }
                >
                  {order.workerCategory}
                </AppText>
              ) : null}
            </View>
          </View>
        </View>

        <View
          style={
            styles.chevronContainer
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

      <AppDivider
        style={styles.divider}
      />

      {/* ======================================================
          ORDER DETAILS
      ====================================================== */}

      <View style={styles.details}>
        <DetailItem
          icon="location"
          text={
            order.location ||
            "Location unavailable"
          }
        />

        <DetailItem
          icon={
            showSchedule
              ? "calendar"
              : "clock"
          }
          text={dateLabel}
        />

        {showSchedule &&
        order.time ? (
          <DetailItem
            icon="clock"
            text={order.time}
          />
        ) : null}
      </View>

      {/* ======================================================
          OFFER
      ====================================================== */}

      <LatestOfferRow
        order={order}
      />

      <AppDivider
        style={styles.footerDivider}
      />

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View style={styles.footer}>
        <View
          style={
            styles.requested
          }
        >
          <AppText
            variant="caption"
            tone="muted"
          >
            Requested on
          </AppText>

          <AppText
            variant="caption"
            weight="semibold"
            tone="secondary"
            style={
              styles.requestedDate
            }
          >
            {order.date}
          </AppText>
        </View>

        <View
          style={
            styles.viewDetails
          }
        >
          <AppText
            variant="bodyMedium"
            role="customer"
            tone="primary"
          >
            View details
          </AppText>

          <AppIcon
            name="next"
            role="customer"
            size="xs"
            state="active"
          />
        </View>
      </View>
    </AppCard>
  );
}

/* ==============================================================
   DETAIL ITEM
============================================================== */

function DetailItem({
  icon,
  text,
}: {
  icon:
    | "location"
    | "calendar"
    | "clock";

  text: string;
}) {
  return (
    <View style={styles.detailItem}>
      <AppIcon
        name={icon}
        role="customer"
        size="xs"
        state="muted"
      />

      <AppText
        variant="caption"
        tone="secondary"
        numberOfLines={1}
        style={styles.detailText}
      >
        {text}
      </AppText>
    </View>
  );
}

/* ==============================================================
   LATEST OFFER
============================================================== */

function LatestOfferRow({
  order,
}: {
  order: Order;
}) {
  if (
    order.counterOfferStatus ===
      "sent" &&
    typeof order.counterOfferAmount ===
      "number" &&
    Number.isFinite(
      order.counterOfferAmount,
    )
  ) {
    const label =
      order.counterOfferBy ===
      "customer"
        ? "Your counter offer"
        : "Worker counter offer";

    return (
      <OfferRow
        label={label}
        amount={
          order.counterOfferAmount
        }
      />
    );
  }

  if (
    order.offerStatus ===
      "sent" &&
    typeof order.offerAmount ===
      "number" &&
    Number.isFinite(
      order.offerAmount,
    )
  ) {
    return (
      <OfferRow
        label="Worker offer"
        amount={
          order.offerAmount
        }
      />
    );
  }

  if (
    order.status ===
      "accepted" &&
    typeof order.agreedPrice ===
      "number" &&
    Number.isFinite(
      order.agreedPrice,
    )
  ) {
    return (
      <OfferRow
        label="Agreed price"
        amount={
          order.agreedPrice
        }
        success
      />
    );
  }

  return null;
}

/* ==============================================================
   OFFER ROW
============================================================== */

function OfferRow({
  label,
  amount,
  success = false,
}: {
  label: string;
  amount: number;
  success?: boolean;
}) {
  return (
    <View
      style={[
        styles.offerRow,

        {
          backgroundColor:
            success
              ? Colors.successSoft
              : CustomerColors
                  .primarySoft,
        },
      ]}
    >
      <View style={styles.offerLeft}>
        <AppIcon
          name={
            success
              ? "success"
              : "wallet"
          }
          role="customer"
          size="xs"
          state={
            success
              ? "success"
              : "active"
          }
        />

        <AppText
          variant="caption"
          weight="semibold"
          tone={
            success
              ? "success"
              : "primary"
          }
          numberOfLines={1}
        >
          {label}
        </AppText>
      </View>

      <AppText
        variant="bodyMedium"
        weight="semibold"
        tone={
          success
            ? "success"
            : "primary"
        }
      >
        {formatCurrency(amount)}
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    width: "100%",

    padding:
      FixxamTokens.spacing.lg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    gap:
      FixxamTokens.spacing.sm,
  },

  mainRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop:
      FixxamTokens.spacing.md,
  },

  serviceIcon: {
    width:
      FixxamTokens.size.iconBox,

    height:
      FixxamTokens.size.iconBox,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.iconButton,

    backgroundColor:
      CustomerColors.primarySoft,
  },

  serviceContent: {
    flex: 1,
    minWidth: 0,

    marginLeft:
      FixxamTokens.spacing.md,
  },

  workerRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop:
      FixxamTokens.spacing.sm,
  },

  workerAvatar: {
    width:
      FixxamTokens.size.avatarXs,

    height:
      FixxamTokens.size.avatarXs,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.avatar,

    backgroundColor:
      Colors.iconBackground,
  },

  workerContent: {
    flex: 1,
    minWidth: 0,

    marginLeft:
      FixxamTokens.spacing.sm,
  },

  workerCategory: {
    marginTop:
      FixxamTokens.spacing.xxs,
  },

  chevronContainer: {
    width:
      FixxamTokens.size
        .minimumTouchTarget,

    height:
      FixxamTokens.size
        .minimumTouchTarget,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    marginLeft:
      FixxamTokens.spacing.xs,

    borderRadius:
      FixxamTokens.radius
        .iconButton,

    backgroundColor:
      Colors.iconBackground,
  },

  divider: {
    marginVertical:
      FixxamTokens.spacing.md,
  },

  details: {
    gap:
      FixxamTokens.spacing.sm,
  },

  detailItem: {
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",
  },

  detailText: {
    flex: 1,
    minWidth: 0,

    marginLeft:
      FixxamTokens.spacing.sm,
  },

  offerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    gap:
      FixxamTokens.spacing.md,

    marginTop:
      FixxamTokens.spacing.md,

    paddingHorizontal:
      FixxamTokens.spacing.md,

    paddingVertical:
      FixxamTokens.spacing.sm,

    borderRadius:
      FixxamTokens.radius.md,
  },

  offerLeft: {
    flex: 1,
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    gap:
      FixxamTokens.spacing.sm,
  },

  footerDivider: {
    marginTop:
      FixxamTokens.spacing.md,

    marginBottom:
      FixxamTokens.spacing.sm,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    gap:
      FixxamTokens.spacing.md,
  },

  requested: {
    flex: 1,
    minWidth: 0,
  },

  requestedDate: {
    marginTop:
      FixxamTokens.spacing.xxs,
  },

  viewDetails: {
    flexDirection: "row",
    alignItems: "center",

    gap:
      FixxamTokens.spacing.xs,
  },
});

export default memo(OrderCard);