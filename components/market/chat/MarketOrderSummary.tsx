import React, {
  memo,
  useEffect,
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

  return (
    <View
      style={
        styles.orderSummary
      }
      accessibilityLabel={`Order ${shortOrderId(
        orderId,
      )}. ${itemCount} ${
        itemCount === 1
          ? "item"
          : "items"
      }. Total ${formatMoney(
        total,
      )}.`}
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
            variant="body"
            weight="bold"
            style={
              styles.orderSummaryTitle
            }
          >
            Order items
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
          </AppText>
        </View>

        <View
          style={
            styles.orderCount
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.orderCountText
            }
          >
            {itemCount}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.orderCountLabel
            }
          >
            {itemCount === 1
              ? "item"
              : "items"}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          ITEMS
      ====================================================== */}

      {itemCount === 0 ? (
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
      ) : (
        items.map(
          (
            item,
          ) => (
            <OrderItemRow
              key={
                item.id
              }
              item={
                item
              }
            />
          ),
        )
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
          weight="bold"
          style={
            styles.orderTotalLabel
          }
        >
          Order total
        </AppText>

        <AppText
          variant="body"
          weight="bold"
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

      useEffect(() => {
        setImageFailed(
          false,
        );
      }, [
        item.image,
      ]);

      const showImage =
        Boolean(
          item.image,
        ) &&
        !imageFailed;

      const itemTotal =
        item.price *
        item.quantity;

      return (
        <View
          style={
            styles.orderItem
          }
          accessibilityLabel={`${item.name}, quantity ${item.quantity}, ${formatMoney(
            itemTotal,
          )}`}
        >
          {showImage ? (
            <Image
              source={{
                uri:
                  item.image!,
              }}
              contentFit="cover"
              transition={150}
              accessibilityLabel={`${item.name} product image`}
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
              weight="bold"
              numberOfLines={1}
              style={
                styles.orderItemName
              }
            >
              {item.name}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.orderItemQuantity
              }
            >
              {formatMoney(
                item.price,
              )}
              {" × "}
              {item.quantity}
            </AppText>
          </View>

          <AppText
            variant="caption"
            weight="bold"
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