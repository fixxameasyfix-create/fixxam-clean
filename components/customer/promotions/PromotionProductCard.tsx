import React, {
  memo,
  useCallback,
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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import type {
  CustomerPromotion,
} from "@/hooks/customer/useCustomerPromotions";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  promotion: CustomerPromotion;

  onPress: (
    promotion: CustomerPromotion,
  ) => void;
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
  ).toLocaleString(
    "en-NG",
  )}`;
}

function formatDate(
  value: Date | null,
): string {
  if (!value) {
    return "";
  }

  return value.toLocaleDateString(
    "en-NG",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",
    },
  );
}

function getDurationDays(
  startsAt: Date | null,
  expiresAt: Date | null,
): number | null {
  if (
    !startsAt ||
    !expiresAt
  ) {
    return null;
  }

  const milliseconds =
    expiresAt.getTime() -
    startsAt.getTime();

  if (
    milliseconds < 0
  ) {
    return null;
  }

  return Math.max(
    1,
    Math.ceil(
      milliseconds /
        (1000 *
          60 *
          60 *
          24),
    ),
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function CustomerPromotionCard({
  promotion,
  onPress,
}: Props) {
  const {
    product,
    deal,
    createdAt,
  } =
    promotion;

  const durationDays =
    useMemo(
      () =>
        getDurationDays(
          deal.startsAt,
          deal.expiresAt,
        ),
      [
        deal.expiresAt,
        deal.startsAt,
      ],
    );

  const durationText =
    useMemo(() => {
      const start =
        formatDate(
          deal.startsAt,
        );

      const end =
        formatDate(
          deal.expiresAt,
        );

      if (
        start &&
        end
      ) {
        return `${start} - ${end}`;
      }

      if (end) {
        return `Until ${end}`;
      }

      return "Limited time";
    }, [
      deal.expiresAt,
      deal.startsAt,
    ]);

  const handlePress =
    useCallback(() => {
      onPress(
        promotion,
      );
    }, [
      onPress,
      promotion,
    ]);

  return (
    <Pressable
      onPress={
        handlePress
      }
      accessibilityRole="button"
      accessibilityLabel={`Open ${product.name}`}
      style={({
        pressed,
      }) => [
        styles.card,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.product
          }
        >
          <View
            style={
              styles.iconBox
            }
          >
            <AppIcon
              name="package"
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.productText
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={1}
              style={
                styles.productName
              }
            >
              {product.name}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
            >
              Product promotion
            </AppText>
          </View>
        </View>

        <View
          style={
            styles.activeBadge
          }
        >
          <AppText
            variant="caption"
            weight="semibold"
            style={
              styles.activeText
            }
          >
            Active
          </AppText>
        </View>
      </View>

      {/* ==================================================
          DISCOUNT
      ================================================== */}

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
            {Math.round(
              deal.discountPercentage,
            )}
            % OFF
          </AppText>
        </View>

        <View
          style={
            styles.priceRow
          }
        >
          <AppText
            variant="caption"
            style={
              styles.originalPrice
            }
          >
            {formatPrice(
              deal.originalPrice,
            )}
          </AppText>

          <AppIcon
            name="next"
            role="customer"
            size="xs"
            state="muted"
          />

          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.discountedPrice
            }
          >
            {formatPrice(
              deal.discountedPrice,
            )}
          </AppText>
        </View>
      </View>

      <View
        style={
          styles.divider
        }
      />

      {/* ==================================================
          DURATION
      ================================================== */}

      <View
        style={
          styles.infoRow
        }
      >
        <View
          style={
            styles.infoLabel
          }
        >
          <AppIcon
            name="calendar"
            role="customer"
            size="xs"
            state="muted"
          />

          <AppText
            variant="caption"
            tone="secondary"
          >
            Duration
          </AppText>
        </View>

        <View
          style={
            styles.infoValue
          }
        >
          <AppText
            variant="caption"
            weight="medium"
            numberOfLines={1}
          >
            {durationText}
          </AppText>

          {durationDays ? (
            <AppText
              variant="caption"
              tone="secondary"
            >
              {durationDays}{" "}
              {durationDays ===
              1
                ? "day"
                : "days"}
            </AppText>
          ) : null}
        </View>
      </View>

      {/* ==================================================
          CREATED
      ================================================== */}

      {createdAt ? (
        <View
          style={
            styles.infoRow
          }
        >
          <View
            style={
              styles.infoLabel
            }
          >
            <AppIcon
              name="clock"
              role="customer"
              size="xs"
              state="muted"
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
          >
            {formatDate(
              createdAt,
            )}
          </AppText>
        </View>
      ) : null}

      {/* ==================================================
          VIEW PRODUCT
      ================================================== */}

      <View
        style={
          styles.viewProduct
        }
      >
        <AppText
          variant="caption"
          weight="semibold"
          style={
            styles.viewProductText
          }
        >
          View product
        </AppText>

        <AppIcon
          name="next"
          role="customer"
          size="xs"
          color={
            CustomerColors.primary
          }
        />
      </View>
    </Pressable>
  );
}

export default memo(
  CustomerPromotionCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      padding:
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    product: {
      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    iconBox: {
      width:
        38,

      height:
        38,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    productText: {
      flex:
        1,

      minWidth:
        0,
    },

    productName: {
      color:
        Colors.textPrimary,
    },

    activeBadge: {
      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    activeText: {
      color:
        CustomerColors.primary,
    },

    discountRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

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
        CustomerColors.primarySoft,
    },

    discountText: {
      color:
        CustomerColors.primary,
    },

    priceRow: {
      flexShrink:
        1,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "flex-end",

      gap:
        FixxamTokens.spacing.xs,
    },

    originalPrice: {
      color:
        Colors.textSecondary,

      textDecorationLine:
        "line-through",
    },

    discountedPrice: {
      color:
        Colors.textPrimary,
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.divider,
    },

    infoRow: {
      minHeight:
        30,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    infoLabel: {
      flexShrink:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    infoValue: {
      flex:
        1,

      minWidth:
        0,

      alignItems:
        "flex-end",
    },

    viewProduct: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "flex-end",

      gap:
        FixxamTokens.spacing.xxs,
    },

    viewProductText: {
      color:
        CustomerColors.primary,
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