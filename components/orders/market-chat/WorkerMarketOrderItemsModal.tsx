import React, {
  memo,
  useCallback,
  useMemo,
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

  image?: string;
};

type Props = {
  visible: boolean;

  items:
    WorkerMarketOrderItem[];

  /*
   * Kept for compatibility with chat.tsx.
   * Gallery intentionally does not display order totals.
   */
  total: number;

  customerName: string;

  onClose: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function safeString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  const normalized =
    value.trim();

  return (
    normalized ||
    fallback
  );
}

function formatMoney(
  value: unknown,
): string {
  const safeValue =
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    ) &&
    value >= 0
      ? value
      : 0;

  return `₦${safeValue.toLocaleString(
    "en-NG",
  )}`;
}

function getSafeImageUrl(
  value: unknown,
): string {
  const url =
    safeString(
      value,
    );

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
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(
      value,
    ),
  );
}

function getSafePrice(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    value,
  );
}

function keyExtractor(
  item:
    WorkerMarketOrderItem,
): string {
  return item.id;
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerMarketOrderItemsModal({
  visible,
  items,
  customerName,
  onClose,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const displayCustomerName =
    useMemo(
      () =>
        safeString(
          customerName,
          "Customer",
        ),
      [
        customerName,
      ],
    );

  const itemCount =
    items.length;

  const itemCountLabel =
    itemCount === 1
      ? "1 item"
      : `${itemCount} items`;

  /* ============================================================
     RENDER ITEM
  ============================================================ */

  const renderItem =
    useCallback(
      ({
        item,
      }: ListRenderItemInfo<WorkerMarketOrderItem>) => {
        const itemName =
          safeString(
            item.name,
            "Product",
          );

        const quantity =
          getSafeQuantity(
            item.quantity,
          );

        const price =
          getSafePrice(
            item.price,
          );

        const imageUrl =
          getSafeImageUrl(
            item.image,
          );

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
                styles.productMedia
              }
            >
              {imageUrl ? (
                <Image
                  source={{
                    uri:
                      imageUrl,
                  }}
                  style={
                    styles.productImage
                  }
                  contentFit="cover"
                  transition={
                    150
                  }
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
                  size="md"
                  color={
                    WorkerColors.primary
                  }
                />
              )}
            </View>

            {/* ================================================
                PRODUCT INFO
            ================================================ */}

            <View
              style={
                styles.itemInfo
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                numberOfLines={
                  2
                }
                style={
                  styles.itemName
                }
              >
                {itemName}
              </AppText>

              <View
                style={
                  styles.itemMeta
                }
              >
                <AppText
                  variant="caption"
                  tone="secondary"
                  numberOfLines={
                    1
                  }
                  style={
                    styles.itemQuantity
                  }
                >
                  Qty: {quantity}
                </AppText>

                <View
                  style={
                    styles.metaDot
                  }
                />

                <AppText
                  variant="caption"
                  tone="secondary"
                  numberOfLines={
                    1
                  }
                  style={
                    styles.unitPrice
                  }
                >
                  {formatMoney(
                    price,
                  )}
                  {quantity > 1
                    ? " each"
                    : ""}
                </AppText>
              </View>
            </View>

            {/* ================================================
                LINE TOTAL
            ================================================ */}

            <AppText
              variant="bodyMedium"
              weight="bold"
              numberOfLines={
                1
              }
              style={
                styles.lineTotal
              }
            >
              {formatMoney(
                price *
                  quantity,
              )}
            </AppText>
          </View>
        );
      },
      [],
    );

  /* ============================================================
     CLOSE
  ============================================================ */

  const handleBackdropPress =
    useCallback(() => {
      onClose();
    }, [
      onClose,
    ]);

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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close gallery"
        style={
          styles.overlay
        }
        onPress={
          handleBackdropPress
        }
      >
        <Pressable
          accessibilityRole="none"
          style={[
            styles.sheet,

            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens.spacing.md,
                ),
            },
          ]}
          onPress={
            event => {
              event.stopPropagation();
            }
          }
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
              styles.header
            }
          >
            <View
              style={
                styles.headerInfo
              }
            >
              <AppText
                variant="heading3"
                weight="bold"
                numberOfLines={
                  1
                }
                style={
                  styles.title
                }
              >
                Gallery
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={
                  1
                }
                style={
                  styles.subtitle
                }
              >
                {displayCustomerName}
                {"  •  "}
                {itemCountLabel}
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close gallery"
              hitSlop={
                6
              }
              onPress={
                onClose
              }
              style={({
                pressed,
              }) => [
                styles.closeButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="close"
                size="md"
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>
          </View>

          {/* ==================================================
              CONTENT
          ================================================== */}

          {itemCount ===
          0 ? (
            <EmptyGallery />
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
                styles.listContent
              }
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default memo(
  WorkerMarketOrderItemsModal,
);

/* ==============================================================
   EMPTY
============================================================== */

const EmptyGallery =
  memo(
    function EmptyGallery() {
      return (
        <View
          style={
            styles.emptyContainer
          }
        >
          <View
            style={
              styles.emptyIcon
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
            variant="heading3"
            weight="bold"
            center
            style={
              styles.emptyTitle
            }
          >
            No items available
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            Product information is not available for this order.
          </AppText>
        </View>
      );
    },
  );

EmptyGallery.displayName =
  "WorkerMarketEmptyGallery";

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       OVERLAY
    ========================================================== */

    overlay: {
      flex:
        1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    /* ==========================================================
       SHEET
    ========================================================== */

    sheet: {
      minHeight:
        "42%",

      maxHeight:
        "86%",

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
      height:
        24,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    handle: {
      width:
        42,

      height:
        4,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      minHeight:
        64,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    headerInfo: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    closeButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ==========================================================
       LIST
    ========================================================== */

    listContent: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.lg,
    },

    itemRow: {
      minHeight:
        84,

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

    productMedia: {
      width:
        64,

      height:
        64,

      flexShrink:
        0,

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

    productImage: {
      width:
        "100%",

      height:
        "100%",
    },

    itemInfo: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    itemName: {
      color:
        Colors.textPrimary,
    },

    itemMeta: {
      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.xs,
    },

    itemQuantity: {
      color:
        Colors.textSecondary,
    },

    unitPrice: {
      color:
        Colors.textSecondary,
    },

    metaDot: {
      width:
        3,

      height:
        3,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.textMuted,
    },

    lineTotal: {
      maxWidth:
        "30%",

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

    emptyContainer: {
      flex:
        1,

      minHeight:
        260,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth:
        300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight:
        20,

      color:
        Colors.textSecondary,
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