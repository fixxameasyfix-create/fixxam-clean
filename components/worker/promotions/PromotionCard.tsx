import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import type {
  WorkerPromotion,
} from "@/hooks/worker/useWorkerPromotions";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  promotion: WorkerPromotion;

  onPress?: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function formatPrice(
  value: number,
): string {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "₦0";
  }

  return `₦${Math.round(
    value,
  ).toLocaleString()}`;
}

function formatDate(
  value: Date | null,
): string {
  if (!value) {
    return "Not available";
  }

  return value.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function formatDuration(
  startsAt: Date | null,
  expiresAt: Date | null,
  durationDays: number | null,
): string {
  if (
    startsAt &&
    expiresAt
  ) {
    const start =
      startsAt.toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "short",
        },
      );

    const end =
      expiresAt.toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "short",
        },
      );

    if (
      durationDays !== null
    ) {
      return `${start} - ${end} (${durationDays} ${
        durationDays === 1
          ? "day"
          : "days"
      })`;
    }

    return `${start} - ${end}`;
  }

  if (
    durationDays !== null
  ) {
    return `${durationDays} ${
      durationDays === 1
        ? "day"
        : "days"
    }`;
  }

  return "Not available";
}

function formatStatus(
  status: WorkerPromotion["status"],
): string {
  switch (status) {
    case "active":
      return "Active";

    case "expired":
      return "Expired";

    case "disabled":
      return "Disabled";

    default:
      return "Unknown";
  }
}

/* ============================================================
   COMPONENT
============================================================ */

function PromotionCard({
  promotion,
  onPress,
}: Props) {
  const duration =
    useMemo(
      () =>
        formatDuration(
          promotion.startsAt,
          promotion.expiresAt,
          promotion.durationDays,
        ),
      [
        promotion.startsAt,
        promotion.expiresAt,
        promotion.durationDays,
      ],
    );

  const status =
    formatStatus(
      promotion.status,
    );

  const discount =
    Math.max(
      0,
      Math.round(
        promotion.discountPercentage,
      ),
    );

  return (
    <Pressable
      onPress={
        onPress
      }
      disabled={
        !onPress
      }
      accessibilityRole="button"
      accessibilityLabel={`Edit ${promotion.itemName} promotion`}
      accessibilityHint="Opens this promotion for editing"
      style={({
        pressed,
      }) => [
        styles.card,

        pressed &&
        onPress
          ? styles.cardPressed
          : null,
      ]}
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.titleContainer
          }
        >
          <View
            style={
              styles.iconContainer
            }
          >
            <AppIcon
              name={
                promotion.type ===
                "product"
                  ? "package"
                  : "service"
              }
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.titleText
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={2}
            >
              {promotion.itemName}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
            >
              {promotion.type ===
              "product"
                ? "Product promotion"
                : "Service promotion"}
            </AppText>
          </View>
        </View>

        <View
          style={
            styles.statusBadge
          }
        >
          <AppText
            variant="caption"
            weight="semibold"
            style={
              styles.statusText
            }
          >
            {status}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          DISCOUNT
      ====================================================== */}

      <View
        style={
          styles.discountRow
        }
      >
        <View
          style={
            styles.discountBadge
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.discountText
            }
          >
            {discount}% OFF
          </AppText>
        </View>

        <View
          style={
            styles.priceContainer
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.originalPrice
            }
          >
            {formatPrice(
              promotion.originalPrice,
            )}
          </AppText>

          <AppIcon
            name="next"
            role="worker"
            size="xs"
            color={
              Colors.textSecondary
            }
          />

          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.discountedPrice
            }
          >
            {formatPrice(
              promotion.discountedPrice,
            )}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          DIVIDER
      ====================================================== */}

      <View
        style={
          styles.divider
        }
      />

      {/* ======================================================
          DETAILS
      ====================================================== */}

      <View
        style={
          styles.detailRow
        }
      >
        <View
          style={
            styles.detailLabel
          }
        >
          <AppIcon
            name="calendar"
            role="worker"
            size="xs"
            color={
              Colors.textSecondary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
          >
            Duration
          </AppText>
        </View>

        <AppText
          variant="caption"
          weight="medium"
          style={
            styles.detailValue
          }
        >
          {duration}
        </AppText>
      </View>

      <View
        style={
          styles.detailRow
        }
      >
        <View
          style={
            styles.detailLabel
          }
        >
          <AppIcon
            name="clock"
            role="worker"
            size="xs"
            color={
              Colors.textSecondary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
          >
            Created
          </AppText>
        </View>

        <AppText
          variant="caption"
          weight="medium"
          style={
            styles.detailValue
          }
        >
          {formatDate(
            promotion.createdAt,
          )}
        </AppText>
      </View>
    </Pressable>
  );
}

export default memo(
  PromotionCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    cardPressed: {
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

    header: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    titleContainer: {
      flex: 1,

      minWidth: 0,

      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    iconContainer: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    titleText: {
      flex: 1,

      minWidth: 0,
    },

    statusBadge: {
      flexShrink: 0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    statusText: {
      color:
        WorkerColors.primary,
    },

    discountRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    discountBadge: {
      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    discountText: {
      color:
        WorkerColors.primary,
    },

    priceContainer: {
      flexShrink: 1,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "flex-end",

      gap:
        FixxamTokens.spacing.xs,
    },

    originalPrice: {
      textDecorationLine:
        "line-through",
    },

    discountedPrice: {
      color:
        Colors.textPrimary,
    },

    divider: {
      height: 1,

      marginVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.border,
    },

    detailRow: {
      minHeight: 28,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    detailLabel: {
      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    detailValue: {
      flex: 1,

      textAlign: "right",

      color:
        Colors.textPrimary,
    },
  });