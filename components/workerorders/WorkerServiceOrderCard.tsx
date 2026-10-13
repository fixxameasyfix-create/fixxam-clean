import React, { memo, useCallback, useMemo } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppIcon, AppText } from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import type {
  WorkerOrderStatus,
  WorkerServiceOrder,
} from "@/types/workerOrders";

type Props = {
  order: WorkerServiceOrder;
  onPress: (order: WorkerServiceOrder) => void;
};

type StatusConfig = {
  label: string;
  color: string;
};

type FulfillmentInfo = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
};

function getSafeText(
  value: unknown,
  fallback = "",
): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function getOptionalNumber(
  value: unknown,
): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[₦,\s]/g, "").trim();

    if (!cleaned) return undefined;

    const parsed = Number(cleaned);

    return Number.isFinite(parsed)
      ? Math.max(0, parsed)
      : undefined;
  }

  return undefined;
}

function formatMoney(value: number): string {
  return `₦${Math.max(0, value).toLocaleString("en-NG", {
    maximumFractionDigits: 2,
  })}`;
}

function getStatusConfig(
  status: WorkerOrderStatus,
): StatusConfig {
  switch (status) {
    case "accepted":
      return { label: "ACCEPTED", color: Colors.info };

    case "in-progress":
      return { label: "ACTIVE", color: Colors.info };

    case "completed":
      return { label: "COMPLETED", color: Colors.success };

    case "cancelled":
      return { label: "CANCELLED", color: Colors.error };

    case "expired":
      return {
        label: "EXPIRED",
        color: Colors.textSecondary,
      };

    case "pending":
    default:
      return { label: "PENDING", color: Colors.warning };
  }
}

function getFulfillmentInfo(
  mode: WorkerServiceOrder["fulfillmentMode"],
): FulfillmentInfo | null {
  const normalizedMode = String(mode ?? "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");

  switch (normalizedMode) {
    case "worker_visits_customer":
      return {
        label: "you will go to the location",
        icon: "home-outline",
        color: WorkerColors.primary,
      };

    case "customer_visits_worker":
      return {
        label: "customer wiil come you",
        icon: "store-outline",
        color: Colors.warning,
      };

    case "remote":
      return null;

    default:
      return null;
  }
}

const StatusBadge = memo(function StatusBadge({
  status,
}: {
  status: WorkerOrderStatus;
}) {
  const config = useMemo(
    () => getStatusConfig(status),
    [status],
  );

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Status: ${config.label}`}
      style={styles.statusRow}
    >
      <View
        style={[
          styles.statusDot,
          { backgroundColor: config.color },
        ]}
      />

      <AppText
        variant="caption"
        weight="medium"
        numberOfLines={1}
        style={[
          styles.statusText,
          { color: config.color },
        ]}
      >
        {config.label}
      </AppText>
    </View>
  );
});

StatusBadge.displayName = "WorkerServiceOrderStatusBadge";

function WorkerServiceOrderCard({
  order,
  onPress,
}: Props) {
  const orderId = getSafeText(order.id);

  const serviceName = getSafeText(
    order.serviceName,
    "Service",
  );

  const customerName = getSafeText(
    order.customerName,
    "Customer",
  );

  const fulfillment = useMemo(
    () => getFulfillmentInfo(order.fulfillmentMode),
    [order.fulfillmentMode],
  );

  const serviceIcon = order.serviceIcon || "tools";

  const serviceColor = getSafeText(
    order.serviceColor,
    WorkerColors.primary,
  );

  const serviceBackgroundColor = getSafeText(
    order.serviceBackgroundColor,
    Colors.infoSoft,
  );

  const amount = getOptionalNumber(order.offerAmount);

  const hasAgreedPrice =
    order.offerStatus === "accepted" &&
    amount !== undefined;

  const disabled = orderId.length === 0;

  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress(order);
    }
  }, [disabled, onPress, order]);

  return (
    <Pressable
      disabled={disabled}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${serviceName}, ${customerName}, ${getStatusConfig(order.status).label}`}
      accessibilityHint="Opens service order details"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.card,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.statusContainer}>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.contentRow}>
        <View
          style={[
            styles.serviceIcon,
            { backgroundColor: serviceBackgroundColor },
          ]}
        >
          <MaterialCommunityIcons
            name={serviceIcon}
            size={25}
            color={serviceColor}
          />
        </View>

        <View style={styles.details}>
          <AppText
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.serviceName}
          >
            {serviceName}
          </AppText>

          <View style={styles.customerRow}>
            <AppIcon
              name="profile"
              size="xs"
              state="muted"
            />

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.customerName}
            >
              {customerName}
            </AppText>
          </View>

          {fulfillment !== null && (
            <View style={styles.fulfillmentRow}>
              <MaterialCommunityIcons
                name={fulfillment.icon}
                size={14}
                color={fulfillment.color}
              />

              <AppText
                variant="caption"
                weight="medium"
                numberOfLines={2}
                ellipsizeMode="tail"
                style={[
                  styles.fulfillmentText,
                  { color: fulfillment.color },
                ]}
              >
                {fulfillment.label}
              </AppText>
            </View>
          )}
        </View>

        {hasAgreedPrice && (
          <View style={styles.priceBlock}>
            <AppText
              variant="bodyMedium"
              weight="bold"
              numberOfLines={1}
              style={styles.price}
            >
              {formatMoney(amount)}
            </AppText>

            <AppText
              variant="caption"
              numberOfLines={1}
              style={styles.priceLabel}
            >
              Agreed price
            </AppText>
          </View>
        )}

        <View style={styles.chevron}>
          <AppIcon
            name="next"
            size="sm"
            color={Colors.textSecondary}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 21,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.045,
    shadowRadius: 5,
    elevation: 1,
  },

  pressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
    transform: [
      { scale: FixxamTokens.motion.scalePressed },
    ],
  },

  disabled: {
    opacity: 0.6,
  },

  statusContainer: {
    marginBottom: 9,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    minHeight: 17,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.2,
  },

  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },

  serviceIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },

  details: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },

  serviceName: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.15,
  },

  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
    marginTop: 3,
  },

  customerName: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 15,
  },

  fulfillmentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    minWidth: 0,
    alignSelf: "stretch",
    marginTop: 4,
  },

  fulfillmentText: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 14,
  },

  priceBlock: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 86,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  price: {
    color: Colors.success,
    fontSize: 12,
    lineHeight: 17,
    fontVariant: ["tabular-nums"],
  },

  priceLabel: {
    marginTop: 2,
    color: Colors.success,
    fontSize: 9,
    lineHeight: 12,
  },

  chevron: {
    width: 29,
    height: 38,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: Colors.disabledBackground,
  },
});

WorkerServiceOrderCard.displayName = "WorkerServiceOrderCard";

export default memo(WorkerServiceOrderCard);