import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

import * as Location from "expo-location";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  useCart,
} from "@/contexts/CartContext";

import useProductDetails from "@/hooks/market/useProductDetails";

import useWorkerProfile from "@/hooks/worker/useWorkerProfile";

import {
  getWorker,
} from "@/firebase/queries/workers";

import {
  auth,
} from "@/firebase/config";

import ProductGallery from "@/components/customer/market/ProductGallery";

import ProductInfo from "@/components/customer/market/ProductInfo";

import ProductDescription from "@/components/customer/market/ProductDescription";

import ProductSeller from "@/components/customer/market/ProductSeller";

import ProductActions from "@/components/customer/market/ProductActions";

import WorkerStore from "@/components/customer/worker/WorkerStore";

import getActiveProductDeals from "@/services/deals/getActiveProductDeal";

/* ============================================================
   TYPES
============================================================ */

type WorkerData = {
  uid?: string;

  firstName?: string;

  otherName?: string;

  surname?: string;

  photoUrl?: string;

  photo?: string;

  photoURL?: string;

  location?: string;

  rating?: number;

  phoneNumber?: string;

  phone?: string;

  mobileNumber?: string;

  workerProfile?: {
    phoneNumber?: string;

    phone?: string;

    mobileNumber?: string;
  };
};

/* ============================================================
   HELPERS
============================================================ */

function normalizePhoneNumber(
  value: string,
): string {
  let phone =
    value.trim();

  if (!phone) {
    return "";
  }

  phone =
    phone.replace(
      /[^\d+]/g,
      "",
    );

  if (
    phone.startsWith("0") &&
    phone.length === 11
  ) {
    phone =
      `+234${phone.slice(1)}`;
  }

  if (
    phone.startsWith("234") &&
    !phone.startsWith("+234")
  ) {
    phone =
      `+${phone}`;
  }

  return phone;
}

/* ============================================================
   SCREEN
============================================================ */

export default function ProductDetailsScreen() {
  const {
    id,
  } =
    useLocalSearchParams<{
      id: string;
    }>();

  const normalizedProductId =
    String(id ?? "").trim();

  /* ==========================================================
     PRODUCT
  ========================================================== */

  const {
    loading,
    product,
  } =
    useProductDetails(
      normalizedProductId,
    );

  /* ==========================================================
     WORKER
  ========================================================== */

  const {
    worker,
  } =
    useWorkerProfile(
      product?.workerId,
    );

  /* ==========================================================
     CART
  ========================================================== */

  const {
    items,
    addToCart,
    clearCart,
  } =
    useCart();

  /* ==========================================================
     WORKER PHONE
  ========================================================== */

  const [
    workerPhone,
    setWorkerPhone,
  ] =
    useState("");

  /* ==========================================================
     MODALS
  ========================================================== */

  const [
    showCallModal,
    setShowCallModal,
  ] =
    useState(false);

  const [
    showLoginModal,
    setShowLoginModal,
  ] =
    useState(false);

  const [
    showReplaceCartModal,
    setShowReplaceCartModal,
  ] =
    useState(false);

  /* ==========================================================
     GALLERY
  ========================================================== */

  const [
    currentImage,
    setCurrentImage,
  ] =
    useState(0);

  /* ==========================================================
     QUANTITY
  ========================================================== */

  const [
    quantity,
    setQuantity,
  ] =
    useState(1);

  /* ==========================================================
     WORKER DATA
  ========================================================== */

  const workerData =
    worker as
      | WorkerData
      | null
      | undefined;

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

  const workerPhoto =
    workerData?.photoUrl ??
    workerData?.photo ??
    workerData?.photoURL ??
    "";

  /* ==========================================================
     VIEW WORKER PROFILE
  ========================================================== */

  const handleViewProfile =
    () => {
      const workerId =
        product?.workerId?.trim() ??
        "";

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
          id: workerId,
        },
      });
    };

  /* ==========================================================
     CALL WORKER
  ========================================================== */

  const handleCallWorker =
    () => {
      const user =
        auth.currentUser;

      if (!user) {
        setShowLoginModal(true);
        return;
      }

      setShowCallModal(true);
    };

  /* ==========================================================
     CONFIRM CALL
  ========================================================== */

  const handleConfirmCallWorker =
    async () => {
      const user =
        auth.currentUser;

      if (!user) {
        setShowCallModal(false);
        setShowLoginModal(true);

        return;
      }

      const workerId =
        product?.workerId?.trim() ??
        "";

      if (!workerId) {
        setShowCallModal(false);

        Toast.show({
          type: "error",
          text1:
            "Worker unavailable",
          text2:
            "This product is not linked to a worker.",
        });

        return;
      }

      try {
        setShowCallModal(false);

        const snapshot =
          await getWorker(
            workerId,
          );

        if (!snapshot.exists()) {
          Toast.show({
            type: "error",
            text1:
              "Worker unavailable",
            text2:
              "Worker information could not be found.",
          });

          return;
        }

        const data =
          snapshot.data() as WorkerData;

        const phone =
          data.phoneNumber ??
          data.phone ??
          data.mobileNumber ??
          data.workerProfile
            ?.phoneNumber ??
          data.workerProfile
            ?.phone ??
          data.workerProfile
            ?.mobileNumber ??
          "";

        const phoneNumber =
          normalizePhoneNumber(
            String(phone),
          );

        setWorkerPhone(
          phoneNumber,
        );

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

        const phoneUrl =
          `tel:${phoneNumber}`;

        const supported =
          await Linking.canOpenURL(
            phoneUrl,
          );

        if (!supported) {
          Toast.show({
            type: "error",
            text1:
              "Unable to make call",
            text2:
              "This device cannot open the phone dialer.",
          });

          return;
        }

        await Linking.openURL(
          phoneUrl,
        );
      } catch (error) {
        console.error(
          "FIXXAM_CALL_WORKER_ERROR:",
          error,
        );

        Toast.show({
          type: "error",
          text1:
            "Unable to make call",
          text2:
            "The phone dialer could not be opened.",
        });
      }
    };

  /* ==========================================================
     VALIDATE PRODUCT
  ========================================================== */

  const validateProduct =
    (): boolean => {
      if (!product) {
        return false;
      }

      const stock =
        Number(product.stock);

      if (
        !Number.isFinite(stock) ||
        stock <= 0
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

      const workerId =
        product.workerId?.trim() ??
        "";

      if (!workerId) {
        Toast.show({
          type: "error",
          text1:
            "Worker unavailable",
          text2:
            "This product is not linked to a worker.",
        });

        return false;
      }

      const productId =
        product.id?.trim() ??
        "";

      if (!productId) {
        Toast.show({
          type: "error",
          text1:
            "Invalid product",
          text2:
            "This product has an invalid ID.",
        });

        return false;
      }

      const productName =
        product.name?.trim() ??
        "";

      if (!productName) {
        Toast.show({
          type: "error",
          text1:
            "Invalid product",
          text2:
            "This product has no valid name.",
        });

        return false;
      }

      const originalPrice =
        Number(
          product.price,
        );

      if (
        !Number.isFinite(
          originalPrice,
        ) ||
        originalPrice < 0
      ) {
        Toast.show({
          type: "error",
          text1:
            "Invalid product price",
          text2:
            "This product cannot be added to cart.",
        });

        return false;
      }

      return true;
    };

  /* ==========================================================
     ADD PRODUCT TO CART
  ========================================================== */

  const addCurrentProductToCart =
    async (): Promise<boolean> => {
      if (!product) {
        return false;
      }

      const productId =
        product.id?.trim() ??
        "";

      const workerId =
        product.workerId?.trim() ??
        "";

      const originalPrice =
        Number(
          product.price,
        );

      if (
        !productId ||
        !workerId ||
        !Number.isFinite(
          originalPrice,
        ) ||
        originalPrice < 0
      ) {
        Toast.show({
          type: "error",
          text1:
            "Invalid product",
          text2:
            "This product cannot be added to cart.",
        });

        return false;
      }

      /* --------------------------------------------------------
         ACTIVE DEAL
      -------------------------------------------------------- */

      let activeDeal:
        Awaited<
          ReturnType<
            typeof getActiveProductDeals
          >
        > extends Map<
          string,
          infer Deal
        >
          ? Deal | null
          : null =
        null;

      try {
        const dealsByProductId =
          await getActiveProductDeals([
            productId,
          ]);

        activeDeal =
          dealsByProductId.get(
            productId,
          ) ?? null;
      } catch (error) {
        /*
         * Deal is optional.
         *
         * If the deal query fails,
         * do NOT block the customer
         * from buying at the original price.
         */
        console.warn(
          "FIXXAM_PRODUCT_DEAL_ERROR:",
          error,
        );

        activeDeal = null;
      }

      /* --------------------------------------------------------
         VALIDATE DEAL OWNERSHIP
      -------------------------------------------------------- */

      if (
        activeDeal &&
        activeDeal.workerId !==
          workerId
      ) {
        /*
         * Never apply a deal belonging
         * to another worker.
         */
        activeDeal = null;
      }

      /* --------------------------------------------------------
         VALIDATE DEAL PRICE
      -------------------------------------------------------- */

      const discountPercentage =
        Number(
          activeDeal?.discountPercentage,
        );

      const dealPrice =
        Number(
          activeDeal?.discountedPrice,
        );

      const hasValidDiscount =
        Boolean(
          activeDeal &&
            Number.isFinite(
              discountPercentage,
            ) &&
            discountPercentage > 0 &&
            discountPercentage < 100 &&
            Number.isFinite(
              dealPrice,
            ) &&
            dealPrice > 0 &&
            dealPrice < originalPrice,
        );

      const unitPrice =
        hasValidDiscount
          ? dealPrice
          : originalPrice;

      /* --------------------------------------------------------
         CART ITEM
      -------------------------------------------------------- */

      const result =
        addToCart({
          id:
            productId,

          name:
            product.name.trim(),

          /*
           * Original price.
           */
          price:
            originalPrice,

          /*
           * Actual customer price.
           */
          unitPrice,

          image:
            product.thumbnail?.trim() ??
            "",

          /*
           * Use the selected quantity.
           */
          quantity,

          ...(hasValidDiscount
            ? {
                discountPercentage,

                discountedPrice:
                  unitPrice,

                dealId:
                  activeDeal!.id.trim(),
              }
            : {}),

          storeId:
            product.storeId?.trim() ??
            "",

          /*
           * Current Fixxam market flow
           * uses worker as seller.
           */
          sellerId:
            workerId,

          workerId,
        });

      /* --------------------------------------------------------
         RESULT
      -------------------------------------------------------- */

      switch (result) {
        case "added":
          Toast.show({
            type: "success",
            text1:
              "Added to cart",
            text2:
              hasValidDiscount
                ? `${quantity} × ${product.name} added with discount.`
                : `${quantity} × ${product.name} added to your cart.`,
          });

          return true;

        case "updated":
          Toast.show({
            type: "success",
            text1:
              "Cart updated",
            text2:
              `${quantity} × ${product.name} added to your cart.`,
          });

          return true;

        case "worker-conflict":
          Toast.show({
            type: "error",
            text1:
              "Different worker",
            text2:
              "Your cart can only contain products from one worker.",
          });

          return false;

        case "invalid":
          Toast.show({
            type: "error",
            text1:
              "Unable to add product",
            text2:
              "This product contains invalid information.",
          });

          return false;

        default:
          Toast.show({
            type: "error",
            text1:
              "Unable to add product",
            text2:
              "Please try again.",
          });

          return false;
      }
    };

  /* ==========================================================
     INCREASE QUANTITY
  ========================================================== */

  const increaseQuantity =
    () => {
      if (!product) {
        return;
      }

      const stock =
        Number(product.stock);

      if (
        !Number.isFinite(stock) ||
        stock <= 0
      ) {
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
        previous =>
          Math.min(
            previous + 1,
            stock,
          ),
      );
    };

  /* ==========================================================
     DECREASE QUANTITY
  ========================================================== */

  const decreaseQuantity =
    () => {
      setQuantity(
        previous =>
          Math.max(
            1,
            previous - 1,
          ),
      );
    };

  /* ==========================================================
     ADD TO CART
  ========================================================== */

  const handleAddToCart =
    async () => {
      if (!validateProduct()) {
        return;
      }

      await addCurrentProductToCart();
    };

  /* ==========================================================
     DIFFERENT WORKER IN CART
  ========================================================== */

  const hasDifferentWorkerInCart =
    (): boolean => {
      const productWorkerId =
        product?.workerId?.trim() ??
        "";

      if (
        !productWorkerId ||
        items.length === 0
      ) {
        return false;
      }

      return items.some(
        item => {
          const itemWorkerId =
            item.workerId?.trim() ??
            "";

          return (
            itemWorkerId !==
            productWorkerId
          );
        },
      );
    };

  /* ==========================================================
     BUY NOW
  ========================================================== */

  const handleBuyNow =
    async () => {
      if (!validateProduct()) {
        return;
      }

      if (
        hasDifferentWorkerInCart()
      ) {
        setShowReplaceCartModal(
          true,
        );

        return;
      }

      const added =
        await addCurrentProductToCart();

      if (!added) {
        return;
      }

      router.push(
        "/(customer)/shop/cart",
      );
    };

  /* ==========================================================
     CLEAR CART AND CONTINUE
  ========================================================== */

  const handleClearCartAndContinue =
    async () => {
      if (!validateProduct()) {
        setShowReplaceCartModal(
          false,
        );

        return;
      }

      setShowReplaceCartModal(
        false,
      );

      clearCart();

      /*
       * Wait for deal lookup and
       * cart insertion to complete.
       */
      const added =
        await addCurrentProductToCart();

      if (!added) {
        return;
      }

      Toast.show({
        type: "success",
        text1:
          "Cart Updated",
        text2:
          "Your previous cart was cleared.",
      });

      router.push(
        "/(customer)/shop/cart",
      );
    };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen>
        <View
          style={
            styles.center
          }
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     PRODUCT NOT FOUND
  ========================================================== */

  if (!product) {
    return (
      <AppScreen>
        <View
          style={
            styles.center
          }
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

  /* ==========================================================
     SCREEN
  ========================================================== */

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
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
          onIndexChange={
            setCurrentImage
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
            product.price
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
          imagesCount={
            product.images?.length ??
            1
          }
          currentImage={
            currentImage + 1
          }
        />

        {/* ====================================================
            DESCRIPTION
        ==================================================== */}

        <ProductDescription
          description={
            product.description
          }
        />

        {/* ====================================================
            SELLER / WORKER
        ==================================================== */}

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
            workerData?.location ??
            ""
          }
          rating={
            workerData?.rating ??
            0
          }
          phoneNumber={
            workerPhone
          }
          onViewProfile={
            handleViewProfile
          }
          onCall={
            handleCallWorker
          }
        />

        {/* ====================================================
            WORKER STORE
        ==================================================== */}

        <WorkerStore
          workerId={
            product.workerId
          }
        />
      </ScrollView>

      {/* ======================================================
          PRODUCT ACTIONS
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

      {/* ======================================================
          LOGIN MODAL
      ====================================================== */}

      <Modal
        visible={
          showLoginModal
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowLoginModal(
            false,
          )
        }
      >
        <View
          style={
            styles.loginModalOverlay
          }
        >
          <View
            style={
              styles.loginModal
            }
          >
            <View
              style={
                styles.loginModalIcon
              }
            >
              <Ionicons
                name="lock-closed-outline"
                size={32}
                color="#2563EB"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.loginModalTitle
              }
            >
              Login Required
            </AppText>

            <AppText
              style={
                styles.loginModalMessage
              }
            >
              Please login to your Fixxam
              account before contacting
              this worker.
            </AppText>

            <View
              style={
                styles.loginModalActions
              }
            >
              <Pressable
                onPress={() =>
                  setShowLoginModal(
                    false,
                  )
                }
                style={({ pressed }) => [
                  styles.loginCancelButton,
                  pressed &&
                    styles.modalPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel login"
              >
                <AppText
                  weight="bold"
                  style={
                    styles.loginCancelText
                  }
                >
                  Cancel
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowLoginModal(
                    false,
                  );

                  router.push(
                    "/(auth)/login",
                  );
                }}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed &&
                    styles.modalPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Login"
              >
                <Ionicons
                  name="log-in-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.loginButtonText
                  }
                >
                  Login
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          CALL WORKER MODAL
      ====================================================== */}

      <Modal
        visible={
          showCallModal
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowCallModal(
            false,
          )
        }
      >
        <View
          style={
            styles.callModalOverlay
          }
        >
          <View
            style={
              styles.callModal
            }
          >
            <View
              style={
                styles.callModalIcon
              }
            >
              <Ionicons
                name="call-outline"
                size={34}
                color="#2563EB"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.callModalTitle
              }
              numberOfLines={2}
            >
              Call {workerName}?
            </AppText>

            <AppText
              style={
                styles.callModalDistance
              }
              numberOfLines={2}
            >
              {workerName} is available
              for contact.
            </AppText>

            <AppText
              style={
                styles.callModalQuestion
              }
            >
              Do you want to call this
              worker?
            </AppText>

            <View
              style={
                styles.callModalActions
              }
            >
              <Pressable
                onPress={() =>
                  setShowCallModal(
                    false,
                  )
                }
                style={({ pressed }) => [
                  styles.callCancelButton,
                  pressed &&
                    styles.modalPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel call"
              >
                <AppText
                  weight="bold"
                  style={
                    styles.callCancelText
                  }
                >
                  Cancel
                </AppText>
              </Pressable>

              <Pressable
                onPress={
                  handleConfirmCallWorker
                }
                style={({ pressed }) => [
                  styles.callConfirmButton,
                  pressed &&
                    styles.modalPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Confirm call to ${workerName}`}
              >
                <Ionicons
                  name="call-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.callConfirmText
                  }
                  numberOfLines={1}
                >
                  Call Worker
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          REPLACE CART MODAL
      ====================================================== */}

      <Modal
        visible={
          showReplaceCartModal
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowReplaceCartModal(
            false,
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
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
              <Ionicons
                name="cart-outline"
                size={30}
                color="#2563EB"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.modalTitle
              }
            >
              Your Cart Has Other Products
            </AppText>

            <AppText
              style={
                styles.modalMessage
              }
            >
              Your cart contains products
              from another worker. You need
              to clear your current cart
              before you can continue with
              this product.
            </AppText>

            <View
              style={
                styles.warningBox
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#2563EB"
              />

              <AppText
                style={
                  styles.warningText
                }
              >
                Your current cart will be
                removed and replaced with
                this product.
              </AppText>
            </View>

            <View
              style={
                styles.modalActions
              }
            >
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed &&
                    styles.pressed,
                ]}
                onPress={() =>
                  setShowReplaceCartModal(
                    false,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <AppText
                  weight="bold"
                  style={
                    styles.cancelText
                  }
                >
                  Cancel
                </AppText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.continueButton,
                  pressed &&
                    styles.pressed,
                ]}
                onPress={
                  handleClearCartAndContinue
                }
                accessibilityRole="button"
                accessibilityLabel="Clear cart and continue"
              >
                <Ionicons
                  name="cart-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.continueText
                  }
                >
                  Clear & Continue
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      paddingBottom: 8,
      backgroundColor:
        "#F8FAFC",
    },

    center: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal: 24,
      backgroundColor:
        "#F8FAFC",
    },

    notFoundTitle: {
      fontSize: 18,
      color:
        "#0F172A",
    },

    subtitle: {
      marginTop: 8,
      textAlign:
        "center",
      color:
        "#64748B",
      fontSize: 14,
      lineHeight: 20,
    },

    /* ========================================================
       LOGIN
    ======================================================== */

    loginModalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.48)",
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 20,
    },

    loginModal: {
      width: "88%",
      maxWidth: 330,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 22,
      paddingHorizontal: 18,
      paddingTop: 22,
      paddingBottom: 18,
    },

    loginModalIcon: {
      width: 68,
      height: 68,
      borderRadius: 20,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      alignSelf:
        "center",
      marginBottom: 15,
    },

    loginModalTitle: {
      fontSize: 20,
      lineHeight: 25,
      color:
        "#0F172A",
      textAlign:
        "center",
    },

    loginModalMessage: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      color:
        "#64748B",
      textAlign:
        "center",
      paddingHorizontal: 8,
    },

    loginModalActions: {
      flexDirection:
        "row",
      gap: 9,
      marginTop: 20,
    },

    loginCancelButton: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loginCancelText: {
      fontSize: 14,
      color:
        "#475569",
    },

    loginButton: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
    },

    loginButtonText: {
      fontSize: 14,
      color:
        "#FFFFFF",
    },

    /* ========================================================
       CALL
    ======================================================== */

    callModalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.48)",
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 20,
    },

    callModal: {
      width: "88%",
      maxWidth: 330,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
    },

    callModalIcon: {
      width: 70,
      height: 70,
      borderRadius: 20,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      alignSelf:
        "center",
      marginBottom: 15,
    },

    callModalTitle: {
      fontSize: 18,
      lineHeight: 23,
      color:
        "#0F172A",
      textAlign:
        "center",
    },

    callModalDistance: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      color:
        "#64748B",
      textAlign:
        "center",
      paddingHorizontal: 5,
    },

    callModalQuestion: {
      marginTop: 13,
      fontSize: 13,
      lineHeight: 19,
      color:
        "#0F172A",
      textAlign:
        "center",
    },

    callModalActions: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
      marginTop: 17,
    },

    callCancelButton: {
      flex: 1,
      height: 44,
      borderRadius: 13,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    callCancelText: {
      fontSize: 13,
      color:
        "#475569",
    },

    callConfirmButton: {
      flex: 1,
      height: 44,
      borderRadius: 13,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 5,
      paddingHorizontal: 6,
    },

    callConfirmText: {
      fontSize: 13,
      color:
        "#FFFFFF",
    },

    /* ========================================================
       COMMON MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.48)",
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal: 22,
    },

    modal: {
      width: "100%",
      maxWidth: 400,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 24,
      padding: 20,
    },

    modalIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      alignSelf:
        "center",
      marginBottom: 14,
    },

    modalTitle: {
      fontSize: 20,
      color:
        "#0F172A",
      textAlign:
        "center",
    },

    modalMessage: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      color:
        "#64748B",
      textAlign:
        "center",
    },

    warningBox: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#EFF6FF",
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 11,
      marginTop: 16,
      gap: 9,
    },

    warningText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color:
        "#475569",
    },

    modalActions: {
      flexDirection:
        "row",
      gap: 10,
      marginTop: 18,
    },

    cancelButton: {
      flex: 1,
      height: 50,
      borderRadius: 15,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    cancelText: {
      fontSize: 14,
      color:
        "#475569",
    },

    continueButton: {
      flex: 1,
      height: 50,
      borderRadius: 15,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
      paddingHorizontal: 8,
    },

    continueText: {
      fontSize: 13,
      color:
        "#FFFFFF",
    },

    modalPressed: {
      opacity: 0.78,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    pressed: {
      opacity: 0.78,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });