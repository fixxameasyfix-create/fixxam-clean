import React, {
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
  AppScreen,
  AppText,
} from "@/components/ui";

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

/* ============================================================
   TYPES
============================================================ */

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

/* ============================================================
   SCREEN
============================================================ */

export default function ProductDetailsScreen() {
  /* ============================================================
     PRODUCT ID
  ============================================================ */

  const {
    id,
  } = useLocalSearchParams<{
    id?: string;
  }>();

  const productId =
    Array.isArray(id)
      ? id[0]
      : id;

  /* ============================================================
     PRODUCT
  ============================================================ */

  const {
    loading,
    product,
  } =
    useProductDetails(
      String(productId ?? ""),
    );

  /* ============================================================
     ACTIVE PRODUCT DEAL
  ============================================================ */

  const [
    deal,
    setDeal,
  ] =
    useState<
      ActiveProductDeal | null
    >(null);

  const [
    dealLoading,
    setDealLoading,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDeal() {
      const normalizedId =
        String(
          productId ?? "",
        ).trim();

      if (!normalizedId) {
        if (mounted) {
          setDeal(null);
        }

        return;
      }

      try {
        setDealLoading(true);

        const activeDeals =
  await getActiveProductDeal([
    normalizedId,
  ]);

const activeDeal =
  activeDeals.get(
    normalizedId,
  ) ?? null;

if (mounted) {
  setDeal(
    activeDeal,
  );
}
      } catch (error) {
        console.error(
          "LOAD_PRODUCT_DEAL_ERROR:",
          error,
        );

        if (mounted) {
          /*
           * Discount is optional.
           * Product should still work
           * if the deal lookup fails.
           */
          setDeal(null);
        }
      } finally {
        if (mounted) {
          setDealLoading(false);
        }
      }
    }

    void loadDeal();

    return () => {
      mounted = false;
    };
  }, [productId]);

  /* ============================================================
     EFFECTIVE PRICE
  ============================================================ */

  const originalPrice =
    Number(
      product?.price ?? 0,
    );

  const effectivePrice =
    useMemo(() => {
      if (
        deal &&
        Number.isFinite(
          deal.discountedPrice,
        ) &&
        deal.discountedPrice > 0 &&
        deal.discountedPrice <
          originalPrice
      ) {
        return deal.discountedPrice;
      }

      return originalPrice;
    }, [
      deal,
      originalPrice,
    ]);

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

  /* ============================================================
     CART
  ============================================================ */

  const {
    addToCart,
    cartReady,
  } = useCart();

  /* ============================================================
     QUANTITY
  ============================================================ */

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  /* ============================================================
     WORKER NAME
  ============================================================ */

  const workerName =
    workerData
      ? [
          workerData.firstName,
          workerData.otherName,
          workerData.surname,
        ]
          .filter(Boolean)
          .join(" ")
      : "Worker";

  /* ============================================================
     WORKER PHONE
  ============================================================ */

  const phoneNumber =
    workerData?.phoneNumber ??
    workerData?.phone ??
    workerData?.mobileNumber ??
    workerData?.workerProfile
      ?.phoneNumber ??
    workerData?.workerProfile
      ?.phone ??
    "";

  /* ============================================================
     VIEW WORKER PROFILE
  ============================================================ */

  const handleViewProfile =
    () => {
      const workerId =
        product?.workerId?.trim();

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
          "/(customer)/workers/[id]",

        params: {
          id: workerId,
        },
      });
    };

  /* ============================================================
     CALL WORKER
  ============================================================ */

  const handleCallWorker =
    async () => {
      const workerId =
        product?.workerId?.trim();

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

      const normalizedPhone =
        phoneNumber.trim();

      if (!normalizedPhone) {
        Toast.show({
          type: "error",
          text1:
            "Phone number unavailable",
          text2:
            "This worker has not added a phone number.",
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
    };

  /* ============================================================
     INCREASE QUANTITY
  ============================================================ */

  const increaseQuantity =
    () => {
      if (!product) {
        return;
      }

      const stock =
        Number.isFinite(
          product.stock,
        )
          ? Math.floor(
              product.stock,
            )
          : 0;

      if (stock <= 0) {
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
        quantity >= stock
      ) {
        Toast.show({
          type: "info",
          text1:
            "Maximum quantity reached",
          text2:
            `Only ${stock} item${
              stock === 1
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
            stock,
          ),
      );
    };

  /* ============================================================
     DECREASE QUANTITY
  ============================================================ */

  const decreaseQuantity =
    () => {
      setQuantity(
        (previous) =>
          Math.max(
            1,
            previous - 1,
          ),
      );
    };

  /* ============================================================
     VALIDATE PRODUCT
  ============================================================ */

  const validateProductForCart =
    (): boolean => {
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
        product.id?.trim() ?? "";

      const normalizedName =
        product.name?.trim() ?? "";

      const normalizedWorkerId =
        product.workerId?.trim() ?? "";

      const price =
        Number(
          effectivePrice,
        );

      const stock =
        Number.isFinite(
          product.stock,
        )
          ? Math.floor(
              product.stock,
            )
          : 0;

      /* PRODUCT ID */

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

      /* PRODUCT NAME */

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

      /* EFFECTIVE PRICE */

      if (
        !Number.isFinite(
          price,
        ) ||
        price <= 0
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

      /* STOCK */

      if (stock <= 0) {
        Toast.show({
          type: "error",
          text1:
            "Out of Stock",
          text2:
            "This product is currently unavailable.",
        });

        return false;
      }

      /* QUANTITY */

      if (
        !Number.isInteger(
          quantity,
        ) ||
        quantity < 1 ||
        quantity > stock
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

      /* WORKER */

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

      /* CART */

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
    };

  /* ============================================================
     BUILD CART ITEM
  ============================================================ */

  const buildCartItem =
    () => {
      if (!product) {
        return null;
      }

      const workerId =
        product.workerId?.trim() ??
        "";

      /*
       * IMPORTANT:
       *
       * Keep both prices.
       *
       * price = original product price
       * unitPrice = actual customer price
       *
       * This allows Checkout to display:
       *
       * Original
       * Discount
       * Final
       */
      return {
        id:
          product.id.trim(),

        name:
          product.name.trim(),

        price:
          originalPrice,

        unitPrice:
          effectivePrice,

        image:
          product.thumbnail?.trim() ??
          "",

        quantity,

        storeId:
          product.storeId?.trim() ||
          undefined,

        sellerId:
          workerId || undefined,

        workerId:
          workerId || undefined,

        /*
         * Discount snapshot.
         *
         * We store the deal values
         * with the cart item so Checkout
         * does not have to guess what
         * price was active when the
         * customer added the product.
         */
        discountPercentage:
          deal?.discountPercentage ??
          0,

        discountedPrice:
          deal?.discountedPrice ??
          undefined,

        dealId:
          deal?.id ??
          undefined,
      };
    };

  /* ============================================================
     ADD TO CART
  ============================================================ */

  const handleAddToCart =
    () => {
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
        result ===
        "updated"
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
    };

  /* ============================================================
     BUY NOW
  ============================================================ */

  const handleBuyNow =
    () => {
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

      router.push(
        "/(customer)/shop/checkout",
      );
    };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <AppScreen>
        <View
          style={styles.center}
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     PRODUCT NOT FOUND
  ============================================================ */

  if (!product) {
    return (
      <AppScreen>
        <View
          style={styles.center}
        >
          <AppText
            weight="bold"
            style={
              styles.notFoundTitle
            }
          >
            Product not found.
          </AppText>

          <AppText
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
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* PRODUCT GALLERY */}

        <ProductGallery
          images={
            product.images
          }
        />

        {/* PRODUCT INFORMATION */}

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

        {/* DISCOUNT */}

        {deal && (
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
                weight="bold"
                style={
                  styles.discountTitle
                }
              >
                Special Offer
              </AppText>

              <AppText
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
        )}

        {/* PRODUCT DESCRIPTION */}

        <ProductDescription
          description={
            product.description
          }
        />

        {/* WORKER / SELLER */}

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

      {/* PRODUCT ACTIONS */}

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
        "#F8FAFC",
    },

    center: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 24,
      backgroundColor:
        "#F8FAFC",
    },

    notFoundTitle: {
      fontSize: 18,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 8,
      textAlign: "center",
      color: "#64748B",
      fontSize: 14,
      lineHeight: 20,
    },

    discountCard: {
      marginHorizontal: 16,
      marginTop: 16,
      padding: 15,
      borderRadius: 16,
      backgroundColor: "#ECFDF5",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: "#BBF7D0",
    },

    discountContent: {
      flex: 1,
      paddingRight: 10,
    },

    discountTitle: {
      fontSize: 15,
      color: "#15803D",
    },

    discountText: {
      marginTop: 3,
      fontSize: 12,
      color: "#166534",
    },

    discountPriceContainer: {
      alignItems: "flex-end",
    },

    originalPrice: {
      fontSize: 11,
      color: "#64748B",
      textDecorationLine:
        "line-through",
    },

    discountedPrice: {
      marginTop: 2,
      fontSize: 18,
      color: "#15803D",
    },
  });