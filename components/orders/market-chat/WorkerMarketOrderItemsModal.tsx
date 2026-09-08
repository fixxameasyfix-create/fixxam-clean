import React, {
  memo,
  useCallback,
} from "react";

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

export type WorkerMarketOrderItem = {
  id: string;

  name: string;

  quantity: number;

  price: number;

  image: string;
};

type Props = {
  visible: boolean;

  items:
    WorkerMarketOrderItem[];

  total: number;

  customerName: string;

  onClose: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function formatMoney(
  value: number,
): string {
  const safeValue =
    Number.isFinite(value) &&
    value >= 0
      ? value
      : 0;

  return `₦${safeValue.toLocaleString(
    "en-NG",
  )}`;
}

function getSafeImageUrl(
  value: string,
): string {
  const url =
    value.trim();

  if (
    url.startsWith(
      "https://",
    ) ||
    url.startsWith(
      "http://",
    )
  ) {
    return url;
  }

  return "";
}

function getSafeQuantity(
  value: number,
): number {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(value),
  );
}

function getSafePrice(
  value: number,
): number {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function keyExtractor(
  item: WorkerMarketOrderItem,
): string {
  return item.id;
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerMarketOrderItemsModal({
  visible,
  items,
  total,
  customerName,
  onClose,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const displayCustomerName =
    customerName.trim() ||
    "Customer";

  /* ============================================================
     RENDER ITEM
  ============================================================ */

  const renderItem =
    useCallback(
      ({
        item,
      }: ListRenderItemInfo<WorkerMarketOrderItem>) => {
        const quantity =
          getSafeQuantity(
            item.quantity,
          );

        const price =
          getSafePrice(
            item.price,
          );

        const itemTotal =
          price *
          quantity;

        const imageUrl =
          getSafeImageUrl(
            item.image,
          );

        const itemName =
          item.name.trim() ||
          "Product";

        return (
          <View
            style={
              styles.itemRow
            }
          >
            {/* ================================================
                PRODUCT IMAGE
            ================================================ */}

            <View
              style={
                styles.itemMedia
              }
            >
              {imageUrl ? (
                <Image
                  source={{
                    uri:
                      imageUrl,
                  }}
                  style={
                    styles.itemImage
                  }
                  contentFit="cover"
                  transition={150}
                  recyclingKey={
                    imageUrl
                  }
                  accessibilityLabel={
                    itemName
                  }
                />
              ) : (
                <AppIcon
                  name="package"
                  role="worker"
                  size="sm"
                  color={
                    WorkerColors.primary
                  }
                />
              )}
            </View>

            {/* ================================================
                INFO
            ================================================ */}

            <View
              style={
                styles.itemInfo
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                numberOfLines={2}
                style={
                  styles.itemName
                }
              >
                {itemName}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.itemQuantity
                }
              >
                Qty: {quantity}
              </AppText>

              {quantity >
              1 ? (
                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.itemUnitPrice
                  }
                >
                  {formatMoney(
                    price,
                  )} each
                </AppText>
              ) : null}
            </View>

            {/* ================================================
                PRICE
            ================================================ */}

            <AppText
              variant="bodyMedium"
              weight="bold"
              numberOfLines={1}
              style={
                styles.itemPrice
              }
            >
              {formatMoney(
                itemTotal,
              )}
            </AppText>
          </View>
        );
      },
      [],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      <View
        style={
          styles.itemsOverlay
        }
      >
        <View
          style={[
            styles.itemsCard,

            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens.spacing.md,
                ),
            },
          ]}
        >
          {/* ==================================================
              HANDLE
          ================================================== */}

          <View
            style={
              styles.handleArea
            }
          >
            <View
              style={
                styles.handle
              }
            />
          </View>

          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.itemsHeader
            }
          >
            <View
              style={
                styles.itemsHeaderInfo
              }
            >
              <AppText
                variant="heading3"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.itemsTitle
                }
              >
                Order Items
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.itemsSubtitle
                }
              >
                {displayCustomerName}
              </AppText>
            </View>

            <Pressable
              onPress={
                onClose
              }
              accessibilityRole="button"
              accessibilityLabel="Close order items"
              style={({
                pressed,
              }) => [
                styles.closeIconButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="close"
                size="sm"
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>
          </View>

          {/* ==================================================
              ITEMS
          ================================================== */}

          {items.length ===
          0 ? (
            <View
              style={
                styles.noItems
              }
            >
              <View
                style={
                  styles.noItemsIcon
                }
              >
                <AppIcon
                  name="package"
                  role="worker"
                  size="lg"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <AppText
                variant="bodyMedium"
                weight="bold"
                center
                style={
                  styles.noItemsTitle
                }
              >
                No order items
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.noItemsText
                }
              >
                Product information is not available for this order.
              </AppText>
            </View>
          ) : (
            <FlatList<WorkerMarketOrderItem>
              data={
                items
              }
              keyExtractor={
                keyExtractor
              }
              renderItem={
                renderItem
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.itemsList
              }
            />
          )}

          {/* ==================================================
              TOTAL
          ================================================== */}

          <View
            style={
              styles.itemsTotal
            }
          >
            <View>
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.itemsTotalCaption
                }
              >
                TOTAL
              </AppText>

              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.itemsTotalLabel
                }
              >
                Order Total
              </AppText>
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              numberOfLines={1}
              style={
                styles.itemsTotalValue
              }
            >
              {formatMoney(
                total,
              )}
            </AppText>
          </View>

          {/* ==================================================
              CLOSE
          ================================================== */}

          <View
            style={
              styles.closeAction
            }
          >
            <AppButton
              title="Close"
              role="worker"
              variant="primary"
              onPress={
                onClose
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default memo(
  WorkerMarketOrderItemsModal,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       MODAL
    ========================================================== */

    itemsOverlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    itemsCard: {
      maxHeight: "80%",

      minHeight: 320,

      overflow:
        "hidden",

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    /* ==========================================================
       HANDLE
    ========================================================== */

    handleArea: {
      height: 20,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    handle: {
      width: 40,

      height: 4,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    itemsHeader: {
      minHeight: 64,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    itemsHeaderInfo: {
      flex: 1,

      minWidth: 0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    itemsTitle: {
      color:
        Colors.textPrimary,
    },

    itemsSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    closeIconButton: {
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
        Colors.disabledBackground,
    },

    /* ==========================================================
       LIST
    ========================================================== */

    itemsList: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    itemRow: {
      minHeight: 72,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    /* ==========================================================
       PRODUCT
    ========================================================== */

    itemMedia: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      overflow:
        "hidden",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    itemImage: {
      width: "100%",

      height: "100%",
    },

    itemInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    itemName: {
      color:
        Colors.textPrimary,
    },

    itemQuantity: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    itemUnitPrice: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    itemPrice: {
      maxWidth: "34%",

      marginLeft:
        FixxamTokens.spacing.sm,

      textAlign:
        "right",

      color:
        WorkerColors.primary,
    },

    /* ==========================================================
       EMPTY
    ========================================================== */

    noItems: {
      flex: 1,

      minHeight: 220,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    noItemsIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    noItemsTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    noItemsText: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       TOTAL
    ========================================================== */

    itemsTotal: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderTopWidth: 1,

      borderTopColor:
        Colors.border,
    },

    itemsTotalCaption: {
      letterSpacing: 0.7,

      color:
        Colors.textMuted,
    },

    itemsTotalLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    itemsTotalValue: {
      marginLeft:
        FixxamTokens.spacing.md,

      color:
        WorkerColors.primary,
    },

    /* ==========================================================
       ACTION
    ========================================================== */

    closeAction: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ==========================================================
       INTERACTION
    ========================================================== */

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