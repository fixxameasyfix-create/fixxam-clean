import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  Image,
} from "expo-image";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  useCart,
} from "@/contexts/CartContext";

/* ============================================================
   TYPES
============================================================ */

type CartItem = {
  id: string;

  name: string;

  image?: string;

  price: number;

  quantity: number;

  sellerId?: string;

  storeId?: string;
};

type CartItemCardProps = {
  item: CartItem;

  onDecrease: (
    item: CartItem,
  ) => void;

  onIncrease: (
    item: CartItem,
  ) => void;

  onRemove: (
    item: CartItem,
  ) => void;
};

/* ============================================================
   HELPERS
============================================================ */

function getSafePrice(
  value: unknown,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed < 0
  ) {
    return 0;
  }

  return parsed;
}

function getSafeQuantity(
  value: unknown,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(
      parsed,
    ),
  );
}

function formatMoney(
  value: unknown,
): string {
  return getSafePrice(
    value,
  ).toLocaleString(
    "en-NG",
    {
      maximumFractionDigits: 0,
    },
  );
}

/* ============================================================
   SCREEN
============================================================ */

export default function CartScreen() {
  const {
    items,
    total,
    removeFromCart,
    updateQuantity,
  } =
    useCart();

  const cartItems =
    useMemo(
      () =>
        items as CartItem[],
      [
        items,
      ],
    );

  const safeTotal =
    useMemo(
      () =>
        getSafePrice(
          total,
        ),
      [
        total,
      ],
    );

  const hasItems =
    cartItems.length > 0;

  /* ==========================================================
     CHECKOUT
  ========================================================== */

  const handleCheckoutPress =
    useCallback(() => {
      if (
        !hasItems
      ) {
        return;
      }

      router.push(
        "/(customer)/shop/checkout",
      );
    }, [
      hasItems,
    ]);

  /* ==========================================================
     QUANTITY
  ========================================================== */

  const handleDecrease =
    useCallback(
      (
        item: CartItem,
      ) => {
        const quantity =
          getSafeQuantity(
            item.quantity,
          );

        updateQuantity(
          item.id,
          Math.max(
            1,
            quantity - 1,
          ),
        );
      },
      [
        updateQuantity,
      ],
    );

  const handleIncrease =
    useCallback(
      (
        item: CartItem,
      ) => {
        const quantity =
          getSafeQuantity(
            item.quantity,
          );

        updateQuantity(
          item.id,
          quantity + 1,
        );
      },
      [
        updateQuantity,
      ],
    );

  /* ==========================================================
     REMOVE
  ========================================================== */

  const handleRemove =
    useCallback(
      (
        item: CartItem,
      ) => {
        removeFromCart(
          item.id,
        );
      },
      [
        removeFromCart,
      ],
    );

  /* ==========================================================
     ITEM
  ========================================================== */

  const renderItem =
    useCallback(
      ({
        item,
      }: {
        item: CartItem;
      }) => (
        <CartItemCard
          item={
            item
          }
          onDecrease={
            handleDecrease
          }
          onIncrease={
            handleIncrease
          }
          onRemove={
            handleRemove
          }
        />
      ),
      [
        handleDecrease,
        handleIncrease,
        handleRemove,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item: CartItem,
      ) =>
        item.id,
      [],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      contentContainerStyle={
        styles.screen
      }
    >
      <FlatList
        data={
          cartItems
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
        contentContainerStyle={[
          styles.listContent,

          !hasItems
            ? styles.emptyListContent
            : null,
        ]}
        ListHeaderComponent={
          <View
            style={
              styles.header
            }
          >
            <AppText
              variant="heading1"
              weight="bold"
              style={
                styles.title
              }
            >
              My Cart
            </AppText>

            {hasItems ? (
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.itemCount
                }
              >
                {cartItems.length}{" "}
                {cartItems.length === 1
                  ? "item"
                  : "items"}
              </AppText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <CartEmptyState />
        }
      />

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <View
          style={
            styles.totalRow
          }
        >
          <AppText
            variant="bodyLarge"
            tone="secondary"
            style={
              styles.totalLabel
            }
          >
            Total
          </AppText>

          <AppText
            variant="heading2"
            weight="bold"
            style={
              styles.totalPrice
            }
          >
            ₦
            {formatMoney(
              safeTotal,
            )}
          </AppText>
        </View>

        <Pressable
          disabled={
            !hasItems
          }
          onPress={
            handleCheckoutPress
          }
          accessibilityRole="button"
          accessibilityLabel="Proceed to checkout"
          accessibilityState={{
            disabled:
              !hasItems,
          }}
          style={({
            pressed,
          }) => [
            styles.checkoutButton,

            !hasItems
              ? styles.checkoutButtonDisabled
              : null,

            pressed &&
            hasItems
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="body"
            weight="bold"
            style={[
              styles.checkoutText,

              !hasItems
                ? styles.checkoutTextDisabled
                : null,
            ]}
          >
            Proceed to Checkout
          </AppText>

          <AppIcon
            name="next"
            size="sm"
            color={
              hasItems
                ? Colors.textInverse
                : Colors.textMuted
            }
          />
        </Pressable>
      </View>
    </AppScreen>
  );
}

/* ============================================================
   CART ITEM
============================================================ */

const CartItemCard =
  memo(
    function CartItemCard({
      item,
      onDecrease,
      onIncrease,
      onRemove,
    }: CartItemCardProps) {
      const name =
        item.name?.trim() ||
        "Product";

      const image =
        typeof item.image ===
          "string"
          ? item.image.trim()
          : "";

      const quantity =
        getSafeQuantity(
          item.quantity,
        );

      const price =
        getSafePrice(
          item.price,
        );

      return (
        <View
          style={
            styles.card
          }
        >
          {/* ==================================================
              IMAGE
          ================================================== */}

          {image ? (
            <Image
              source={{
                uri:
                  image,
              }}
              style={
                styles.image
              }
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
              accessibilityLabel={`${name} product image`}
            />
          ) : (
            <View
              style={
                styles.imagePlaceholder
              }
            >
              <AppIcon
                name="package"
                size="lg"
                color={
                  Colors.textMuted
                }
              />
            </View>
          )}

          {/* ==================================================
              INFO
          ================================================== */}

          <View
            style={
              styles.info
            }
          >
            <AppText
              variant="body"
              weight="bold"
              numberOfLines={2}
              style={
                styles.productName
              }
            >
              {name}
            </AppText>

            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.price
              }
            >
              ₦
              {formatMoney(
                price,
              )}
            </AppText>

            {/* ================================================
                QUANTITY
            ================================================ */}

            <View
              style={
                styles.qtyRow
              }
            >
              <Pressable
                onPress={() => {
                  onDecrease(
                    item,
                  );
                }}
                disabled={
                  quantity <= 1
                }
                accessibilityRole="button"
                accessibilityLabel={`Decrease quantity of ${name}`}
                accessibilityState={{
                  disabled:
                    quantity <= 1,
                }}
                style={({
                  pressed,
                }) => [
                  styles.quantityButton,

                  quantity <= 1
                    ? styles.quantityButtonDisabled
                    : null,

                  pressed &&
                  quantity > 1
                    ? styles.quantityPressed
                    : null,
                ]}
              >
                <AppIcon
                  name="close"
                  size="xs"
                  color={
                    quantity <= 1
                      ? Colors.textMuted
                      : CustomerColors.primary
                  }
                />
              </Pressable>

              <View
                style={
                  styles.quantityValue
                }
              >
                <AppText
                  variant="body"
                  weight="bold"
                  style={
                    styles.qty
                  }
                >
                  {quantity}
                </AppText>
              </View>

              <Pressable
                onPress={() => {
                  onIncrease(
                    item,
                  );
                }}
                accessibilityRole="button"
                accessibilityLabel={`Increase quantity of ${name}`}
                style={({
                  pressed,
                }) => [
                  styles.quantityButton,

                  pressed
                    ? styles.quantityPressed
                    : null,
                ]}
              >
                <AppIcon
                  name="add"
                  role="customer"
                  size="sm"
                  color={
                    CustomerColors.primary
                  }
                />
              </Pressable>
            </View>
          </View>

          {/* ==================================================
              REMOVE
          ================================================== */}

          <Pressable
            onPress={() => {
              onRemove(
                item,
              );
            }}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${name} from cart`}
            style={({
              pressed,
            }) => [
              styles.removeButton,

              pressed
                ? styles.removePressed
                : null,
            ]}
          >
            <AppIcon
              name="delete"
              size="sm"
              color={
                Colors.error
              }
            />
          </Pressable>
        </View>
      );
    },
  );

CartItemCard.displayName =
  "CartItemCard";

/* ============================================================
   EMPTY
============================================================ */

const CartEmptyState =
  memo(
    function CartEmptyState() {
      return (
        <View
          style={
            styles.empty
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <AppIcon
              name="cart"
              role="customer"
              size="xl"
              color={
                CustomerColors.primary
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
            Your cart is empty
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            Add products from the market to continue shopping.
          </AppText>
        </View>
      );
    },
  );

CartEmptyState.displayName =
  "CartEmptyState";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      paddingHorizontal: 0,

      paddingTop: 0,

      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       LIST
    ======================================================== */

    listContent: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    emptyListContent: {
      flexGrow: 1,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    title: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    itemCount: {
      flexShrink: 0,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PRODUCT CARD
    ======================================================== */

    card: {
      minHeight: 108,

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    image: {
      width: 80,

      height: 80,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    imagePlaceholder: {
      width: 80,

      height: 80,

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

    info: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    productName: {
      color:
        Colors.textPrimary,
    },

    price: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       QUANTITY
    ======================================================== */

    qtyRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    quantityButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    quantityButtonDisabled: {
      backgroundColor:
        Colors.disabledBackground,
    },

    quantityPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    quantityValue: {
      minWidth: 36,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    qty: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       REMOVE
    ======================================================== */

    removeButton: {
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
        Colors.errorSoft,
    },

    removePressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      flex: 1,

      minHeight: 360,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.lg,

      borderTopWidth: 1,

      borderTopColor:
        Colors.border,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    totalRow: {
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    totalLabel: {
      color:
        Colors.textSecondary,
    },

    totalPrice: {
      color:
        Colors.textPrimary,
    },

    checkoutButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    checkoutButtonDisabled: {
      backgroundColor:
        Colors.disabledBackground,
    },

    checkoutText: {
      color:
        Colors.textInverse,
    },

    checkoutTextDisabled: {
      color:
        Colors.textMuted,
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