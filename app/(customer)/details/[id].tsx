import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

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

import useProductDetails from "@/hooks/market/useProductDetails";
import useWorkerProfile from "@/hooks/worker/useWorkerProfile";

import ProductGallery from "@/components/customer/market/ProductGallery";
import ProductInfo from "@/components/customer/market/ProductInfo";
import ProductDescription from "@/components/customer/market/ProductDescription";
import ProductSeller from "@/components/customer/market/ProductSeller";
import ProductActions from "@/components/customer/market/ProductActions";

import WorkerStore from "@/components/customer/worker/WorkerStore";

import getActiveProductDeal, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

import {
  recordProductView,
} from "@/services/products/productViewService";

/* ==============================================================
   TYPES
============================================================== */

type WorkerData = {
  uid?: string;
  fullName?: string;
  firstName?: string;
  otherName?: string;
  surname?: string;
  photoUrl?: string;
  location?: string;
  rating?: number;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function getPositiveNumber(
  value: unknown,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    return 0;
  }

  return parsed;
}

function getAvailableStock(
  value: unknown,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    return 0;
  }

  return Math.floor(
    parsed,
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function ProductDetailsScreen() {
  /* ============================================================
     PRODUCT ID
  ============================================================ */

  const {
    id,
  } =
    useLocalSearchParams<{
      id?:
        | string
        | string[];
    }>();

  const productId =
    useMemo(
      () =>
        cleanString(
          Array.isArray(id)
            ? id[0]
            : id,
        ),
      [
        id,
      ],
    );

  /* ============================================================
     PRODUCT
  ============================================================ */

  const {
    loading,
    product,
  } =
    useProductDetails(
      productId,
    );

  /* ============================================================
     PRODUCT VIEW TRACKING
  ============================================================ */

  /*
   * Keeps track of the product already counted
   * during this mounted screen session.
   *
   * useRef prevents a re-render from creating
   * another view count.
   */
  const viewedProductIdRef =
    useRef<string>("");

  useEffect(() => {
    const loadedProductId =
      cleanString(
        product?.id,
      );

    if (
      loading ||
      !loadedProductId ||
      loadedProductId !==
        productId
    ) {
      return;
    }

    if (
      viewedProductIdRef.current ===
      loadedProductId
    ) {
      return;
    }

    /*
     * Mark it before starting the async write.
     * This prevents duplicate increments caused
     * by another render while the request is pending.
     */
    viewedProductIdRef.current =
      loadedProductId;

    void recordProductView(
      loadedProductId,
    ).catch(
      error => {
        /*
         * Analytics must never block the customer
         * from viewing or purchasing the product.
         */
        if (__DEV__) {
          console.error(
            "RECORD_PRODUCT_VIEW_ERROR:",
            error,
          );
        }
      },
    );
  }, [
    loading,
    product?.id,
    productId,
  ]);

  /* ============================================================
     DEAL
  ============================================================ */

  const [
    deal,
    setDeal,
  ] =
    useState<
      ActiveProductDeal | null
    >(null);

  useEffect(() => {
    let cancelled =
      false;

    setDeal(null);

    if (!productId) {
      return () => {
        cancelled =
          true;
      };
    }

    async function loadDeal() {
      try {
        const activeDeals =
          await getActiveProductDeal([
            productId,
          ]);

        if (cancelled) {
          return;
        }

        setDeal(
          activeDeals.get(
            productId,
          ) ?? null,
        );
      } catch (error) {
        console.error(
          "LOAD_PRODUCT_DEAL_ERROR:",
          error,
        );

        if (!cancelled) {
          setDeal(null);
        }
      }
    }

    void loadDeal();

    return () => {
      cancelled =
        true;
    };
  }, [
    productId,
  ]);

  /* ============================================================
     PRICE
  ============================================================ */

  const originalPrice =
    useMemo(
      () =>
        getPositiveNumber(
          product?.price,
        ),
      [
        product?.price,
      ],
    );

  const effectivePrice =
    useMemo(() => {
      const discountedPrice =
        getPositiveNumber(
          deal?.discountedPrice,
        );

      if (
        discountedPrice > 0 &&
        originalPrice > 0 &&
        discountedPrice <
          originalPrice
      ) {
        return discountedPrice;
      }

      return originalPrice;
    }, [
      deal?.discountedPrice,
      originalPrice,
    ]);

  const hasActiveDiscount =
    Boolean(
      deal &&
        originalPrice > 0 &&
        effectivePrice > 0 &&
        effectivePrice <
          originalPrice,
    );

  /* ============================================================
     WORKER
  ============================================================ */

  const {
    worker,
  } =
    useWorkerProfile(
      product?.workerId,
    );

  const workerData =
    worker as
      | WorkerData
      | null
      | undefined;

  const workerName =
    useMemo(() => {
      if (!workerData) {
        return "Worker";
      }

      const fullName =
        cleanString(
          workerData.fullName,
        );

      if (fullName) {
        return fullName;
      }

      const legacyName =
        [
          cleanString(
            workerData.firstName,
          ),
          cleanString(
            workerData.otherName,
          ),
          cleanString(
            workerData.surname,
          ),
        ]
          .filter(Boolean)
          .join(" ");

      return (
        legacyName ||
        "Worker"
      );
    }, [
      workerData,
    ]);

  const workerPhoto =
    useMemo(
      () =>
        cleanString(
          workerData?.photoUrl,
        ),
      [
        workerData?.photoUrl,
      ],
    );

  const workerLocation =
    useMemo(
      () =>
        cleanString(
          workerData?.location,
        ),
      [
        workerData?.location,
      ],
    );

  /* ============================================================
     CART
  ============================================================ */

  const {
    items,
    addToCart,
    replaceCartWithItem,
    cartReady,
  } =
    useCart();

  /* ============================================================
     QUANTITY
  ============================================================ */

  const [
    quantity,
    setQuantity,
  ] =
    useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [
    productId,
  ]);

  const availableStock =
    useMemo(
      () =>
        getAvailableStock(
          product?.stock,
        ),
      [
        product?.stock,
      ],
    );

  /* ============================================================
     REPLACE CART MODAL
  ============================================================ */

  const [
    showReplaceCartModal,
    setShowReplaceCartModal,
  ] =
    useState(false);

  /*
   * false = Add Cart
   * true  = Buy Now
   */
  const [
    pendingBuyNow,
    setPendingBuyNow,
  ] =
    useState(false);

  /* ============================================================
     VIEW PROFILE
  ============================================================ */

  const handleViewProfile =
    useCallback(() => {
      const workerId =
        cleanString(
          product?.workerId,
        );

      if (!workerId) {
        Toast.show({
          type: "error",
          text1:
            "Worker unavailable",
          text2:
            "Worker profile could not be opened.",
        });

        return;
      }

      router.push({
        pathname:
          "/(customer)/details/worker-profile/[id]",

        params: {
          id:
            workerId,
        },
      });
    }, [
      product?.workerId,
    ]);

  /* ============================================================
     FIXXAM VOICE CALL
  ============================================================ */

  const handleCallWorker =
    useCallback(() => {
      const workerId =
        cleanString(
          product?.workerId,
        );

      if (!workerId) {
        Toast.show({
          type: "error",
          text1:
            "Worker unavailable",
          text2:
            "Worker information could not be loaded.",
        });

        return;
      }

      router.push({
        pathname:
          "/(customer)/call/[workerId]",

        params: {
          workerId,

          name:
            workerName,

          ...(workerPhoto
            ? {
                image:
                  workerPhoto,
              }
            : {}),
        },
      } as never);
    }, [
      product?.workerId,
      workerName,
      workerPhoto,
    ]);

  /* ============================================================
     QUANTITY
  ============================================================ */

  const increaseQuantity =
    useCallback(() => {
      if (!product) {
        return;
      }

      if (
        availableStock <= 0
      ) {
        Toast.show({
          type: "error",
          text1:
            "Out of Stock",
          text2:
            "This product is currently unavailable.",
        });

        return;
      }

      if (
        quantity >=
        availableStock
      ) {
        Toast.show({
          type: "info",
          text1:
            "Maximum quantity reached",
          text2:
            `Only ${availableStock} item${
              availableStock === 1
                ? ""
                : "s"
            } available.`,
        });

        return;
      }

      setQuantity(
        previous =>
          Math.min(
            previous + 1,
            availableStock,
          ),
      );
    }, [
      availableStock,
      product,
      quantity,
    ]);

  const decreaseQuantity =
    useCallback(() => {
      setQuantity(
        previous =>
          Math.max(
            1,
            previous - 1,
          ),
      );
    }, []);

  /* ============================================================
     VALIDATE PRODUCT
  ============================================================ */

  const validateProductForCart =
    useCallback((): boolean => {
      if (!product) {
        Toast.show({
          type: "error",
          text1:
            "Product unavailable",
          text2:
            "This product could not be loaded.",
        });

        return false;
      }

      const normalizedProductId =
        cleanString(
          product.id,
        );

      const normalizedName =
        cleanString(
          product.name,
        );

      const normalizedWorkerId =
        cleanString(
          product.workerId,
        );

      if (!normalizedProductId) {
        Toast.show({
          type: "error",
          text1:
            "Invalid product",
          text2:
            "Product ID is missing.",
        });

        return false;
      }

      if (!normalizedName) {
        Toast.show({
          type: "error",
          text1:
            "Invalid product",
          text2:
            "Product name is missing.",
        });

        return false;
      }

      if (
        !Number.isFinite(
          effectivePrice,
        ) ||
        effectivePrice <= 0
      ) {
        Toast.show({
          type: "error",
          text1:
            "Invalid product price",
          text2:
            "This product has an invalid price.",
        });

        return false;
      }

      if (
        availableStock <= 0
      ) {
        Toast.show({
          type: "error",
          text1:
            "Out of Stock",
          text2:
            "This product is currently unavailable.",
        });

        return false;
      }

      if (
        !Number.isInteger(
          quantity,
        ) ||
        quantity < 1 ||
        quantity >
          availableStock
      ) {
        Toast.show({
          type: "error",
          text1:
            "Invalid quantity",
          text2:
            "Please select a valid quantity.",
        });

        return false;
      }

      if (!normalizedWorkerId) {
        Toast.show({
          type: "error",
          text1:
            "Worker unavailable",
          text2:
            "This product has no assigned worker.",
        });

        return false;
      }

      if (!cartReady) {
        Toast.show({
          type: "info",
          text1:
            "Cart is loading",
          text2:
            "Please wait a moment and try again.",
        });

        return false;
      }

      return true;
    }, [
      availableStock,
      cartReady,
      effectivePrice,
      product,
      quantity,
    ]);

  /* ============================================================
     DIFFERENT WORKER CHECK
  ============================================================ */

  const hasDifferentWorkerInCart =
    useCallback((): boolean => {
      const currentWorkerId =
        cleanString(
          product?.workerId,
        );

      if (
        !currentWorkerId ||
        items.length === 0
      ) {
        return false;
      }

      return items.some(
        item => {
          const itemWorkerId =
            cleanString(
              item.workerId,
            );

          return (
            itemWorkerId !==
            currentWorkerId
          );
        },
      );
    }, [
      items,
      product?.workerId,
    ]);

  /* ============================================================
     BUILD CART ITEM
  ============================================================ */

  const buildCartItem =
    useCallback(() => {
      if (!product) {
        return null;
      }

      const workerId =
        cleanString(
          product.workerId,
        );

      return {
        id:
          cleanString(
            product.id,
          ),

        name:
          cleanString(
            product.name,
          ),

        price:
          originalPrice,

        unitPrice:
          effectivePrice,

        image:
          cleanString(
            product.thumbnail,
          ),

        quantity,

        storeId:
          cleanString(
            product.storeId,
          ) || undefined,

        sellerId:
          workerId ||
          undefined,

        workerId:
          workerId ||
          undefined,

        discountPercentage:
          hasActiveDiscount
            ? deal
                ?.discountPercentage ??
              0
            : 0,

        discountedPrice:
          hasActiveDiscount
            ? effectivePrice
            : undefined,

        dealId:
          hasActiveDiscount
            ? deal?.id
            : undefined,
      };
    }, [
      deal?.discountPercentage,
      deal?.id,
      effectivePrice,
      hasActiveDiscount,
      originalPrice,
      product,
      quantity,
    ]);

  /* ============================================================
     ADD CURRENT PRODUCT
  ============================================================ */

  const addCurrentProduct =
    useCallback((): boolean => {
      const cartItem =
        buildCartItem();

      if (!cartItem) {
        return false;
      }

      const result =
        addToCart(
          cartItem,
        );

      if (
        result === "invalid"
      ) {
        Toast.show({
          type: "error",
          text1:
            "Unable to add product",
          text2:
            "This product contains invalid information.",
        });

        return false;
      }

      if (
        result ===
        "worker-conflict"
      ) {
        return false;
      }

      return true;
    }, [
      addToCart,
      buildCartItem,
    ]);

  /* ============================================================
     ADD TO CART
  ============================================================ */

  const handleAddToCart =
    useCallback(() => {
      if (
        !validateProductForCart()
      ) {
        return;
      }

      if (
        hasDifferentWorkerInCart()
      ) {
        setPendingBuyNow(false);

        setShowReplaceCartModal(
          true,
        );

        return;
      }

      const added =
        addCurrentProduct();

      if (!added) {
        return;
      }

      Toast.show({
        type: "success",
        text1:
          "Added to Cart",
        text2:
          `${quantity} × ${cleanString(
            product?.name,
          )} added successfully.`,
      });
    }, [
      addCurrentProduct,
      hasDifferentWorkerInCart,
      product?.name,
      quantity,
      validateProductForCart,
    ]);

  /* ============================================================
     BUY NOW
  ============================================================ */

  const handleBuyNow =
    useCallback(() => {
      if (
        !validateProductForCart()
      ) {
        return;
      }

      if (
        hasDifferentWorkerInCart()
      ) {
        setPendingBuyNow(true);

        setShowReplaceCartModal(
          true,
        );

        return;
      }

      const added =
        addCurrentProduct();

      if (!added) {
        return;
      }

      router.push(
        "/(customer)/shop/cart",
      );
    }, [
      addCurrentProduct,
      hasDifferentWorkerInCart,
      validateProductForCart,
    ]);

  /* ============================================================
     REPLACE CART + CONTINUE
  ============================================================ */

  const handleClearCartAndContinue =
    useCallback(() => {
      if (
        !validateProductForCart()
      ) {
        setShowReplaceCartModal(
          false,
        );

        setPendingBuyNow(
          false,
        );

        return;
      }

      const cartItem =
        buildCartItem();

      if (!cartItem) {
        setShowReplaceCartModal(
          false,
        );

        setPendingBuyNow(
          false,
        );

        return;
      }

      const shouldOpenCart =
        pendingBuyNow;

      const replaced =
        replaceCartWithItem(
          cartItem,
        );

      if (!replaced) {
        Toast.show({
          type: "error",
          text1:
            "Unable to update cart",
          text2:
            "Please try again.",
        });

        return;
      }

      setShowReplaceCartModal(
        false,
      );

      setPendingBuyNow(
        false,
      );

      Toast.show({
        type: "success",
        text1:
          "Cart Updated",
        text2:
          "Your previous cart was cleared and this product was added.",
      });

      if (shouldOpenCart) {
        router.push(
          "/(customer)/shop/cart",
        );
      }
    }, [
      buildCartItem,
      pendingBuyNow,
      replaceCartWithItem,
      validateProductForCart,
    ]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Loading product"
          style={
            styles.center
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.loadingText
            }
          >
            Loading product...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     NOT FOUND
  ============================================================ */

  if (!product) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.center
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <AppIcon
              name="package"
              role="customer"
              size="lg"
              state="muted"
            />
          </View>

          <AppText
            variant="bodyLarge"
            weight="bold"
            center
            style={
              styles.notFoundTitle
            }
          >
            Product not found
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            center
            style={
              styles.subtitle
            }
          >
            This product is no longer available.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     MAIN SCREEN
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.container
        }
      >
        <ProductGallery
          images={
            product.images
          }
        />

        <ProductInfo
          name={
            product.name
          }
          price={
            originalPrice
          }
          category={
            product.category
          }
          stock={
            product.stock
          }
          condition={
            product.condition
          }
          delivery={
            product.delivery
          }
        />

        {hasActiveDiscount &&
        deal ? (
          <View
            style={
              styles.discountCard
            }
          >
            <View
              style={
                styles.discountContent
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.discountTitle
                }
              >
                Special Offer
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.discountText
                }
              >
                Save{" "}
                {deal.discountPercentage}
                % on this product
              </AppText>
            </View>

            <View
              style={
                styles.discountPriceContainer
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.originalPrice
                }
              >
                ₦
                {originalPrice.toLocaleString(
                  "en-NG",
                )}
              </AppText>

              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.discountedPrice
                }
              >
                ₦
                {effectivePrice.toLocaleString(
                  "en-NG",
                )}
              </AppText>
            </View>
          </View>
        ) : null}

        <ProductDescription
          description={
            product.description
          }
        />

        <ProductSeller
          workerId={
            product.workerId
          }
          name={
            workerName
          }
          photoUrl={
            workerPhoto
          }
          location={
            workerLocation
          }
          rating={
            workerData?.rating ??
            0
          }
          onViewProfile={
            handleViewProfile
          }
          onCall={
            handleCallWorker
          }
        />

        <WorkerStore
          workerId={
            product.workerId
          }
        />
      </ScrollView>

      <ProductActions
        quantity={
          quantity
        }
        onIncrease={
          increaseQuantity
        }
        onDecrease={
          decreaseQuantity
        }
        onAddToCart={
          handleAddToCart
        }
        onBuyNow={
          handleBuyNow
        }
      />

      <ReplaceCartModal
        visible={
          showReplaceCartModal
        }
        onClose={() => {
          setShowReplaceCartModal(
            false,
          );

          setPendingBuyNow(
            false,
          );
        }}
        onContinue={
          handleClearCartAndContinue
        }
      />
    </AppScreen>
  );
}

/* ==============================================================
   REPLACE CART MODAL
============================================================== */

const ReplaceCartModal =
  memo(
    function ReplaceCartModal({
      visible,
      onClose,
      onContinue,
    }: {
      visible: boolean;
      onClose: () => void;
      onContinue: () => void;
    }) {
      return (
        <Modal
          visible={
            visible
          }
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={
            onClose
          }
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <Pressable
              onPress={
                onClose
              }
              accessible={false}
              style={
                StyleSheet.absoluteFill
              }
            />

            <View
              style={
                styles.modal
              }
            >
              <View
                style={
                  styles.modalIcon
                }
              >
                <AppIcon
                  name="cart"
                  role="customer"
                  size="lg"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <AppText
                variant="bodyLarge"
                weight="bold"
                center
                style={
                  styles.modalTitle
                }
              >
                Your Cart Has Other Products
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.modalMessage
                }
              >
                Your cart contains products from another worker.
                Clear your current cart to continue with this product.
              </AppText>

              <View
                style={
                  styles.infoBox
                }
              >
                <AppIcon
                  name="info"
                  role="customer"
                  size="sm"
                  color={
                    CustomerColors.primary
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.infoText
                  }
                >
                  Your current cart will be removed and replaced
                  with this product.
                </AppText>
              </View>

              <View
                style={
                  styles.modalActions
                }
              >
                <Pressable
                  onPress={
                    onClose
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  style={({
                    pressed,
                  }) => [
                    styles.cancelButton,

                    pressed
                      ? styles.pressed
                      : null,
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={
                    onContinue
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Clear cart and continue"
                  style={({
                    pressed,
                  }) => [
                    styles.continueButton,

                    pressed
                      ? styles.pressed
                      : null,
                  ]}
                >
                  <AppIcon
                    name="cart"
                    role="customer"
                    size="sm"
                    color={
                      Colors.textInverse
                    }
                  />

                  <AppText
                    variant="caption"
                    weight="bold"
                    numberOfLines={1}
                    style={
                      styles.continueButtonText
                    }
                  >
                    Clear & Continue
                  </AppText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      );
    },
  );

ReplaceCartModal.displayName =
  "ReplaceCartModal";

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      paddingBottom:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.background,
    },

    center: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.background,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    emptyIcon: {
      width: 64,

      height: 64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    notFoundTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,
    },

    discountCard: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginHorizontal:
        FixxamTokens.spacing.md,

      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.successSoft,
    },

    discountContent: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    discountTitle: {
      color:
        Colors.success,
    },

    discountText: {
      marginTop: 2,
    },

    discountPriceContainer: {
      flexShrink: 0,

      alignItems:
        "flex-end",
    },

    originalPrice: {
      color:
        Colors.textSecondary,

      textDecorationLine:
        "line-through",
    },

    discountedPrice: {
      marginTop: 2,

      color:
        Colors.success,
    },

    modalOverlay: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.overlayMedium,
    },

    modal: {
      width: "100%",

      maxWidth: 400,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    modalIcon: {
      width: 52,

      height: 52,

      alignSelf:
        "center",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    modalTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    modalMessage: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    infoBox: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    infoText: {
      flex: 1,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    modalActions: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    cancelButton: {
      flex: 1,

      minHeight: 44,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    cancelButtonText: {
      color:
        Colors.textPrimary,
    },

    continueButton: {
      flex: 1.35,

      minHeight: 44,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    continueButtonText: {
      flexShrink: 1,

      color:
        Colors.textInverse,
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