import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
} from "@/theme";

import type {
  OrderItem,
} from "./marketChatHelpers";

import {
  formatMoney,
  shortOrderId,
} from "./marketChatHelpers";

import {
  styles,
} from "./marketChatStyles";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orderId: string;

  items: OrderItem[];

  total: number;
};

/* ============================================================
   COMPONENT
============================================================ */

function MarketOrderSummaryComponent({
  orderId,
  items,
  total,
}: Props) {
  const itemCount =
    items.length;

  const firstItem =
    items[0] ??
    null;

  const remainingCount =
    Math.max(
      0,
      itemCount - 1,
    );

  const accessibilityLabel =
    useMemo(() => {
      const itemText =
        itemCount === 1
          ? "1 item"
          : `${itemCount} items`;

      return `Order ${shortOrderId(
        orderId,
      )}. ${itemText}. Total ${formatMoney(
        total,
      )}.`;
    }, [
      itemCount,
      orderId,
      total,
    ]);

  return (
    <View
      style={
        styles.orderSummary
      }
      accessible
      accessibilityLabel={
        accessibilityLabel
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.orderSummaryHeader
        }
      >
        <View
          style={
            styles.orderHeaderInfo
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.orderSummaryTitle
            }
          >
            Order
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.orderSummarySubtitle
            }
          >
            #
            {shortOrderId(
              orderId,
            )}
            {remainingCount >
            0
              ? ` · +${remainingCount} more ${
                  remainingCount ===
                  1
                    ? "item"
                    : "items"
                }`
              : ""}
          </AppText>
        </View>

        <View
          style={
            styles.orderCount
          }
        >
          <AppText
            variant="caption"
            weight="semibold"
            style={
              styles.orderCountText
            }
          >
            {itemCount}
            {" "}
            {itemCount === 1
              ? "item"
              : "items"}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          FIRST ITEM ONLY
      ====================================================== */}

      {firstItem ? (
        <OrderItemRow
          item={
            firstItem
          }
        />
      ) : (
        <View
          style={
            styles.noItems
          }
        >
          <AppIcon
            name="package"
            size="sm"
            color={
              Colors.textMuted
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.noItemsText
            }
          >
            No item information available.
          </AppText>
        </View>
      )}

      {/* ======================================================
          TOTAL
      ====================================================== */}

      <View
        style={
          styles.orderTotalRow
        }
      >
        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.orderTotalLabel
          }
        >
          Total
        </AppText>

        <AppText
          variant="bodyMedium"
          weight="semibold"
          numberOfLines={1}
          style={
            styles.orderTotalValue
          }
        >
          {formatMoney(
            total,
          )}
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   ORDER ITEM
============================================================ */

const OrderItemRow =
  memo(
    function OrderItemRow({
      item,
    }: {
      item: OrderItem;
    }) {
      const [
        imageFailed,
        setImageFailed,
      ] =
        useState(false);

      const safeImage =
        typeof item.image ===
          "string"
          ? item.image.trim()
          : "";

      useEffect(() => {
        setImageFailed(
          false,
        );
      }, [
        safeImage,
      ]);

      const showImage =
        Boolean(
          safeImage &&
          !imageFailed,
        );

      const safePrice =
        Number.isFinite(
          item.price,
        )
          ? Math.max(
              0,
              item.price,
            )
          : 0;

      const safeQuantity =
        Number.isFinite(
          item.quantity,
        )
          ? Math.max(
              1,
              Math.floor(
                item.quantity,
              ),
            )
          : 1;

      const itemTotal =
        safePrice *
        safeQuantity;

      const productName =
        typeof item.name ===
          "string" &&
        item.name.trim()
          ? item.name.trim()
          : "Product";

      return (
        <View
          style={
            styles.orderItem
          }
          accessible
          accessibilityLabel={`${productName}. Quantity ${safeQuantity}. ${formatMoney(
            itemTotal,
          )}.`}
        >
          {showImage ? (
            <Image
              source={{
                uri:
                  safeImage,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
              accessibilityLabel={`${productName} product image`}
              onError={() => {
                setImageFailed(
                  true,
                );
              }}
              style={
                styles.orderItemImage
              }
            />
          ) : (
            <View
              style={
                styles.orderItemPlaceholder
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
          )}

          <View
            style={
              styles.orderItemInfo
            }
          >
            <AppText
              variant="caption"
              weight="semibold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={
                styles.orderItemName
              }
            >
              {productName}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.orderItemQuantity
              }
            >
              {safeQuantity}
              {" × "}
              {formatMoney(
                safePrice,
              )}
            </AppText>
          </View>

          <AppText
            variant="caption"
            weight="semibold"
            numberOfLines={1}
            style={
              styles.orderItemTotal
            }
          >
            {formatMoney(
              itemTotal,
            )}
          </AppText>
        </View>
      );
    },
  );

OrderItemRow.displayName =
  "OrderItemRow";

/* ============================================================
   MEMO
============================================================ */

const MarketOrderSummary =
  memo(
    MarketOrderSummaryComponent,
  );

MarketOrderSummary.displayName =
  "MarketOrderSummary";

export default MarketOrderSummary;