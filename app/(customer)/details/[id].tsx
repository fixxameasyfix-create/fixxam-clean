import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Linking,
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

import ProductGallery from "@/components/customer/market/ProductGallery";
import ProductInfo from "@/components/customer/market/ProductInfo";
import ProductDescription from "@/components/customer/market/ProductDescription";
import ProductSeller from "@/components/customer/market/ProductSeller";
import ProductActions from "@/components/customer/market/ProductActions";

import useWorkerProfile from "@/hooks/worker/useWorkerProfile";

import getActiveProductDeal, {
  ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ==============================================================
   TYPES
============================================================== */

type WorkerData = {
  uid?: string;

  firstName?: string;

  otherName?: string;

  surname?: string;

  photoUrl?: string;

  location?: string;

  rating?: number;

  phoneNumber?: string;

  phone?: string;

  mobileNumber?: string;

  workerProfile?: {
    phoneNumber?: string;

    phone?: string;
  };
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

function normalizePhoneNumber(
  value: unknown,
): string {
  const raw =
    cleanString(value);

  if (!raw) {
    return "";
  }

  const normalized =
    raw.replace(
      /[\s().-]/g,
      "",
    );

  if (
    !/^\+?\d{7,15}$/.test(
      normalized,
    )
  ) {
    return "";
  }

  return normalized;
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
      id?: string;
    }>();

  const productId =
    cleanString(
      Array.isArray(id)
        ? id[0]
        : id,
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

    /*
     * Prevent the previous product's deal
     * briefly appearing after route changes.
     */
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
          /*
           * Deals are optional.
           * Product remains usable.
           */
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

      const name =
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
        name ||
        "Worker"
      );
    }, [
      workerData,
    ]);

  const phoneNumber =
    useMemo(
      () =>
        cleanString(
          workerData?.phoneNumber,
        ) ||
        cleanString(
          workerData?.phone,
        ) ||
        cleanString(
          workerData?.mobileNumber,
        ) ||
        cleanString(
          workerData
            ?.workerProfile
            ?.phoneNumber,
        ) ||
        cleanString(
          workerData
            ?.workerProfile
            ?.phone,
        ),
      [
        workerData,
      ],
    );

  /* ============================================================
     CART
  ============================================================ */

  const {
    addToCart,
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

  /*
   * A new product must never inherit
   * the previous product's quantity.
   */
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
     VIEW WORKER PROFILE
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

      /* ROUTE PRESERVED */

      router.push({
        pathname:
          "/(customer)/workers/[id]",

        params: {
          id: workerId,
        },
      });
    }, [
      product?.workerId,
    ]);

  /* ============================================================
     CALL WORKER
  ============================================================ */

  const handleCallWorker =
    useCallback(async () => {
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

      if (!phoneNumber) {
        Toast.show({
          type: "error",
          text1:
            "Phone number unavailable",
          text2:
            "This worker has not added a phone number.",
        });

        return;
      }

      const normalizedPhone =
        normalizePhoneNumber(
          phoneNumber,
        );

      if (!normalizedPhone) {
        Toast.show({
          type: "error",
          text1:
            "Invalid phone number",
          text2:
            "This worker's phone number cannot be dialed.",
        });

        return;
      }

      try {
        const phoneUrl =
          `tel:${normalizedPhone}`;

        const supported =
          await Linking.canOpenURL(
            phoneUrl,
          );

        if (!supported) {
          Toast.show({
            type: "error",
            text1:
              "Cannot make call",
            text2:
              "Calling is not available on this device.",
          });

          return;
        }

        await Linking.openURL(
          phoneUrl,
        );
      } catch (error) {
        console.error(
          "CALL_WORKER_ERROR:",
          error,
        );

        Toast.show({
          type: "error",
          text1:
            "Call failed",
          text2:
            "Unable to open the phone dialer.",
        });
      }
    }, [
      phoneNumber,
      product?.workerId,
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
        (previous) =>
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
        (previous) =>
          Math.max(
            1,
            previous - 1,
          ),
      );
    }, []);

  /* ============================================================
     PRODUCT VALIDATION
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

      if (
        !normalizedProductId
      ) {
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

      if (
        !normalizedWorkerId
      ) {
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
     CART ITEM
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

      /*
       * price     = original product price
       * unitPrice = customer-facing active price
       *
       * IMPORTANT:
       * These are display/cart snapshots only.
       * Checkout/backend must revalidate them.
       */
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
     ADD TO CART
  ============================================================ */

  const handleAddToCart =
    useCallback(() => {
      if (
        !validateProductForCart()
      ) {
        return;
      }

      const cartItem =
        buildCartItem();

      if (!cartItem) {
        return;
      }

      const result =
        addToCart(
          cartItem,
        );

      if (
        result ===
        "worker-conflict"
      ) {
        Toast.show({
          type: "error",
          text1:
            "Different worker",
          text2:
            "Your cart already contains products from another worker. Clear the cart before adding this product.",
        });

        return;
      }

      if (
        result === "updated"
      ) {
        Toast.show({
          type: "success",
          text1:
            "Cart updated",
          text2:
            `${quantity} × ${cartItem.name} added to your existing cart quantity.`,
        });

        return;
      }

      Toast.show({
        type: "success",
        text1:
          "Added to Cart",
        text2:
          `${quantity} × ${cartItem.name} added successfully.`,
      });
    }, [
      addToCart,
      buildCartItem,
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

      const cartItem =
        buildCartItem();

      if (!cartItem) {
        return;
      }

      const result =
        addToCart(
          cartItem,
        );

      if (
        result ===
        "worker-conflict"
      ) {
        Toast.show({
          type: "error",
          text1:
            "Different worker",
          text2:
            "Your cart already contains products from another worker. Clear the cart before buying this product.",
        });

        return;
      }

      /* ROUTE PRESERVED */

      router.push(
        "/(customer)/shop/checkout",
      );
    }, [
      addToCart,
      buildCartItem,
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
            size="large"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="body"
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
     PRODUCT NOT FOUND
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
              size="xl"
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
            variant="body"
            tone="secondary"
            center
            style={
              styles.subtitle
            }
          >
            This product is no longer
            available.
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
        {/* ====================================================
            PRODUCT GALLERY
        ==================================================== */}

        <ProductGallery
          images={
            product.images
          }
        />

        {/* ====================================================
            PRODUCT INFO
        ==================================================== */}

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

        {/* ====================================================
            ACTIVE DISCOUNT
        ==================================================== */}

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
                variant="bodyMedium"
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
                variant="bodyLarge"
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

        {/* ====================================================
            DESCRIPTION
        ==================================================== */}

        <ProductDescription
          description={
            product.description
          }
        />

        {/* ====================================================
            SELLER
        ==================================================== */}

        <ProductSeller
          workerId={
            product.workerId
          }
          name={
            workerName
          }
          photoUrl={
            workerData?.photoUrl
          }
          location={
            workerData?.location ??
            ""
          }
          rating={
            workerData?.rating ??
            0
          }
          phoneNumber={
            phoneNumber
          }
          onViewProfile={
            handleViewProfile
          }
          onCall={
            handleCallWorker
          }
        />
      </ScrollView>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

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
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      paddingBottom: 120,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       LOADING / EMPTY
    ======================================================== */

    center: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      backgroundColor:
        Colors.background,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    emptyIcon: {
      width: 88,

      height: 88,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    notFoundTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,
    },

    /* ========================================================
       DISCOUNT
    ======================================================== */

    discountCard: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    discountContent: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.md,
    },

    discountTitle: {
      color:
        Colors.success,
    },

    discountText: {
      marginTop:
        FixxamTokens.spacing.xxs,
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
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.success,
    },
  });