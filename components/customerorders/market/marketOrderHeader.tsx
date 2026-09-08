import React, {
  memo,
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
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
  FixxamTokens,
} from "@/theme";

import type {
  MarketProduct,
} from "./marketOrder.utils";

import {
  formatMarketDate,
  formatMarketOrderNumber,
  getFirstMarketProductImage,
  getFirstMarketProductName,
  getMarketStatusConfig,
  type MarketStatus,
} from "./marketOrder.utils";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orderId: string;

  status: MarketStatus;

  createdAt: unknown;

  products: MarketProduct[];

  storeName: string;
};

/* ============================================================
   COMPONENT
============================================================ */

function MarketOrderHeaderComponent({
  orderId,
  status,
  createdAt,
  products,
  storeName,
}: Props) {
  const statusConfig =
    getMarketStatusConfig(
      status,
    );

  const productName =
    getFirstMarketProductName(
      products,
    );

  const productImage =
    getFirstMarketProductImage(
      products,
    );

  const orderNumber =
    formatMarketOrderNumber(
      orderId,
    );

  const orderedDate =
    formatMarketDate(
      createdAt,
    );

  return (
    <View
      style={styles.card}
      accessibilityLabel={`${productName}. Order ${orderNumber}. ${statusConfig.label}. Store ${storeName}.`}
    >
      {/* ======================================================
          ORDER INFORMATION
      ====================================================== */}

      <View
        style={styles.orderRow}
      >
        <ProductThumbnail
          image={
            productImage
          }
          productName={
            productName
          }
        />

        <View
          style={styles.orderInfo}
        >
          <View
            style={styles.titleRow}
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              numberOfLines={2}
              style={
                styles.productName
              }
            >
              {productName}
            </AppText>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    statusConfig.background,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      statusConfig.color,
                  },
                ]}
              />

              <AppText
                variant="caption"
                weight="bold"
                style={[
                  styles.statusText,
                  {
                    color:
                      statusConfig.color,
                  },
                ]}
              >
                {statusConfig.label}
              </AppText>
            </View>
          </View>

          <AppText
            variant="caption"
            style={
              styles.orderIdLabel
            }
          >
            Order ID
          </AppText>

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.orderId
            }
          >
            {orderNumber}
          </AppText>

          {orderedDate ? (
            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.orderedDate
              }
            >
              Ordered on{" "}
              {orderedDate}
            </AppText>
          ) : null}
        </View>
      </View>

      {/* ======================================================
          STORE
      ====================================================== */}

      <View
        style={styles.storeRow}
      >
        <View
          style={styles.storeIcon}
        >
          <AppIcon
            name="cart"
            role="customer"
            size="sm"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={styles.storeInfo}
        >
          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.storeName
            }
          >
            {storeName}
          </AppText>

          <AppText
            variant="caption"
            style={
              styles.storeLabel
            }
          >
            Seller / Store
          </AppText>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   PRODUCT THUMBNAIL
============================================================ */

function ProductThumbnail({
  image,
  productName,
}: {
  image:
    | string
    | null;

  productName: string;
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
    image,
  ]);

  const safeImage =
    typeof image === "string"
      ? image.trim()
      : "";

  const showImage =
    safeImage.length > 0 &&
    !imageFailed;

  return (
    <View
      style={
        styles.imageContainer
      }
    >
      {showImage ? (
        <Image
          source={{
            uri: safeImage,
          }}
          contentFit="cover"
          transition={150}
          accessibilityLabel={`${productName} product image`}
          onError={() => {
            setImageFailed(
              true,
            );
          }}
          style={
            styles.productImage
          }
        />
      ) : (
        <AppIcon
          name="package"
          role="customer"
          size="lg"
          color={
            CustomerColors.primary
          }
        />
      )}
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MarketOrderHeader =
  memo(
    MarketOrderHeaderComponent,
  );

MarketOrderHeader.displayName =
  "MarketOrderHeader";

export default MarketOrderHeader;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginTop:
        FixxamTokens.spacing.sm,

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

    /* ========================================================
       ORDER
    ======================================================== */

    orderRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    imageContainer: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      flexShrink: 0,

      overflow:
        "hidden",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    productImage: {
      width: "100%",

      height: "100%",
    },

    orderInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    titleRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    productName: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusBadge: {
      flexShrink: 0,

      minHeight: 26,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.chip,
    },

    statusDot: {
      width: 6,

      height: 6,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusText: {
      letterSpacing: 0.2,
    },

    /* ========================================================
       ORDER META
    ======================================================== */

    orderIdLabel: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textMuted,
    },

    orderId: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    orderedDate: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STORE
    ======================================================== */

    storeRow: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth: 1,

      borderTopColor:
        Colors.divider,
    },

    storeIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    storeInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    storeName: {
      color:
        Colors.textPrimary,
    },

    storeLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },
  });