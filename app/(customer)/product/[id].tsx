import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
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

type ActiveProductDeal =
  Awaited<
    ReturnType<
      typeof getActiveProductDeals
    >
  > extends Map<
    string,
    infer Deal
  >
    ? Deal
    : never;

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizePhoneNumber(
  value: string,
): string {
  let phone =
    value
      .trim()
      .replace(
        /[^\d+]/g,
        "",
      );

  if (!phone) {
    return "";
  }

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

function getSafeStock(
  value: unknown,
): number {
  const stock =
    Number(value);

  if (
    !Number.isFinite(stock) ||
    stock <= 0
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(stock),
  );
}

function showErrorToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
}

function showInfoToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
  });
}

function showSuccessToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
  });
}

/* ============================================================
   SCREEN
============================================================ */

export default function ProductDetailsScreen() {
  const {
    id,
  } =
    useLocalSearchParams<{
      id:
        | string
        | string[];
    }>();

  const normalizedProductId =
    useMemo(() => {
      if (
        Array.isArray(id)
      ) {
        return cleanString(
          id[0],
        );
      }

      return cleanString(
        id,
      );
    }, [
      id,
    ]);

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

  const cartMutationInFlight =
    useRef(false);

  /* ==========================================================
     CALL
  ========================================================== */

  const [
    workerPhone,
    setWorkerPhone,
  ] =
    useState("");

  const [
    callingWorker,
    setCallingWorker,
  ] =
    useState(false);

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

  const workerPhoto =
    useMemo(
      () =>
        cleanString(
          workerData?.photoUrl,
        ) ||
        cleanString(
          workerData?.photo,
        ) ||
        cleanString(
          workerData?.photoURL,
        ),
      [
        workerData,
      ],
    );

  /* ==========================================================
     VIEW WORKER PROFILE
  ========================================================== */

  const handleViewProfile =
    useCallback(() => {
      const workerId =
        cleanString(
          product?.workerId,
        );

      if (!workerId) {
        showErrorToast(
          "Worker unavailable",
          "Worker profile could not be opened.",
        );

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

  /* ==========================================================
     CALL WORKER
  ========================================================== */

  const handleCallWorker =
    useCallback(() => {
      if (
        !auth.currentUser
      ) {
        setShowLoginModal(
          true,
        );

        return;
      }

      setShowCallModal(
        true,
      );
    }, []);

  /* ==========================================================
     CONFIRM CALL
  ========================================================== */

  const handleConfirmCallWorker =
    useCallback(async () => {
      if (callingWorker) {
        return;
      }

      const user =
        auth.currentUser;

      if (!user) {
        setShowCallModal(
          false,
        );

        setShowLoginModal(
          true,
        );

        return;
      }

      const workerId =
        cleanString(
          product?.workerId,
        );

      if (!workerId) {
        setShowCallModal(
          false,
        );

        showErrorToast(
          "Worker unavailable",
          "This product is not linked to a worker.",
        );

        return;
      }

      setCallingWorker(
        true,
      );

      try {
        const snapshot =
          await getWorker(
            workerId,
          );

        if (
          !snapshot.exists()
        ) {
          showErrorToast(
            "Worker unavailable",
            "Worker information could not be found.",
          );

          return;
        }

        const data =
          snapshot.data() as WorkerData;

        const rawPhone =
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
            String(
              rawPhone,
            ),
          );

        setWorkerPhone(
          phoneNumber,
        );

        if (!phoneNumber) {
          showErrorToast(
            "Phone number unavailable",
            "This worker has not added a phone number.",
          );

          return;
        }

        const phoneUrl =
          `tel:${phoneNumber}`;

        const supported =
          await Linking.canOpenURL(
            phoneUrl,
          );

        if (!supported) {
          showErrorToast(
            "Unable to make call",
            "This device cannot open the phone dialer.",
          );

          return;
        }

        setShowCallModal(
          false,
        );

        await Linking.openURL(
          phoneUrl,
        );
      } catch (
        error
      ) {
        console.error(
          "FIXXAM_CALL_WORKER_ERROR:",
          error,
        );

        showErrorToast(
          "Unable to make call",
          "The phone dialer could not be opened.",
        );
      } finally {
        setCallingWorker(
          false,
        );
      }
    }, [
      callingWorker,
      product?.workerId,
    ]);

  /* ==========================================================
     VALIDATE PRODUCT
  ========================================================== */

  const validateProduct =
    useCallback((): boolean => {
      if (!product) {
        showErrorToast(
          "Product unavailable",
          "This product is no longer available.",
        );

        return false;
      }

      const stock =
        getSafeStock(
          product.stock,
        );

      if (stock <= 0) {
        showErrorToast(
          "Out of Stock",
          "This product is currently unavailable.",
        );

        return false;
      }

      if (
        !Number.isInteger(
          quantity,
        ) ||
        quantity < 1 ||
        quantity > stock
      ) {
        showErrorToast(
          "Invalid quantity",
          "Please select a valid quantity.",
        );

        return false;
      }

      const workerId =
        cleanString(
          product.workerId,
        );

      if (!workerId) {
        showErrorToast(
          "Worker unavailable",
          "This product is not linked to a worker.",
        );

        return false;
      }

      const productId =
        cleanString(
          product.id,
        );

      if (!productId) {
        showErrorToast(
          "Invalid product",
          "This product has an invalid ID.",
        );

        return false;
      }

      const productName =
        cleanString(
          product.name,
        );

      if (!productName) {
        showErrorToast(
          "Invalid product",
          "This product has no valid name.",
        );

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
        showErrorToast(
          "Invalid product price",
          "This product cannot be added to cart.",
        );

        return false;
      }

      return true;
    }, [
      product,
      quantity,
    ]);

  /* ==========================================================
     ADD CURRENT PRODUCT
  ========================================================== */

  const addCurrentProductToCart =
    useCallback(async (): Promise<boolean> => {
      if (
        cartMutationInFlight.current
      ) {
        return false;
      }

      if (!product) {
        return false;
      }

      const productId =
        cleanString(
          product.id,
        );

      const workerId =
        cleanString(
          product.workerId,
        );

      const productName =
        cleanString(
          product.name,
        );

      const originalPrice =
        Number(
          product.price,
        );

      if (
        !productId ||
        !workerId ||
        !productName ||
        !Number.isFinite(
          originalPrice,
        ) ||
        originalPrice < 0
      ) {
        showErrorToast(
          "Invalid product",
          "This product cannot be added to cart.",
        );

        return false;
      }

      cartMutationInFlight.current =
        true;

      try {
        /* ----------------------------------------------------
           ACTIVE DEAL
        ---------------------------------------------------- */

        let activeDeal:
          ActiveProductDeal | null =
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
        } catch (
          dealError
        ) {
          console.warn(
            "FIXXAM_PRODUCT_DEAL_ERROR:",
            dealError,
          );

          /*
           * Deal lookup failure must not
           * block purchase at normal price.
           */
          activeDeal =
            null;
        }

        /* ----------------------------------------------------
           DEAL OWNERSHIP
        ---------------------------------------------------- */

        const dealWorkerId =
          activeDeal
            ? cleanString(
                activeDeal.workerId,
              )
            : "";

        if (
          activeDeal &&
          dealWorkerId !==
            workerId
        ) {
          activeDeal =
            null;
        }

        /* ----------------------------------------------------
           DEAL PRICE
        ---------------------------------------------------- */

        const discountPercentage =
          Number(
            activeDeal
              ?.discountPercentage,
          );

        const dealPrice =
          Number(
            activeDeal
              ?.discountedPrice,
          );

        const dealId =
          activeDeal
            ? cleanString(
                activeDeal.id,
              )
            : "";

        const hasValidDiscount =
          Boolean(
            activeDeal &&
              dealId &&
              Number.isFinite(
                discountPercentage,
              ) &&
              discountPercentage > 0 &&
              discountPercentage < 100 &&
              Number.isFinite(
                dealPrice,
              ) &&
              dealPrice > 0 &&
              dealPrice <
                originalPrice,
          );

        const unitPrice =
          hasValidDiscount
            ? dealPrice
            : originalPrice;

        /* ----------------------------------------------------
           CART
        ---------------------------------------------------- */

        const result =
          addToCart({
            id:
              productId,

            name:
              productName,

            /*
             * Reference/original price.
             */
            price:
              originalPrice,

            /*
             * Current customer unit price.
             */
            unitPrice,

            image:
              cleanString(
                product.thumbnail,
              ),

            quantity,

            ...(hasValidDiscount
              ? {
                  discountPercentage,

                  discountedPrice:
                    unitPrice,

                  dealId,
                }
              : {}),

            storeId:
              cleanString(
                product.storeId,
              ),

            /*
             * Current market flow uses
             * worker as seller.
             */
            sellerId:
              workerId,

            workerId,
          });

        switch (result) {
          case "added":
            showSuccessToast(
              "Added to cart",
              hasValidDiscount
                ? `${quantity} × ${productName} added with discount.`
                : `${quantity} × ${productName} added to your cart.`,
            );

            return true;

          case "updated":
            showSuccessToast(
              "Cart updated",
              `${quantity} × ${productName} added to your cart.`,
            );

            return true;

          case "worker-conflict":
            showErrorToast(
              "Different worker",
              "Your cart can only contain products from one worker.",
            );

            return false;

          case "invalid":
            showErrorToast(
              "Unable to add product",
              "This product contains invalid information.",
            );

            return false;

          default:
            showErrorToast(
              "Unable to add product",
              "Please try again.",
            );

            return false;
        }
      } finally {
        cartMutationInFlight.current =
          false;
      }
    }, [
      addToCart,
      product,
      quantity,
    ]);

  /* ==========================================================
     QUANTITY
  ========================================================== */

  const increaseQuantity =
    useCallback(() => {
      const stock =
        getSafeStock(
          product?.stock,
        );

      if (stock <= 0) {
        return;
      }

      if (
        quantity >= stock
      ) {
        showInfoToast(
          "Maximum quantity reached",
          `Only ${stock} item${
            stock === 1
              ? ""
              : "s"
          } available.`,
        );

        return;
      }

      setQuantity(
        previous =>
          Math.min(
            previous + 1,
            stock,
          ),
      );
    }, [
      product?.stock,
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

  /* ==========================================================
     ADD TO CART
  ========================================================== */

  const handleAddToCart =
    useCallback(async () => {
      if (
        !validateProduct()
      ) {
        return;
      }

      await addCurrentProductToCart();
    }, [
      addCurrentProductToCart,
      validateProduct,
    ]);

  /* ==========================================================
     DIFFERENT WORKER
  ========================================================== */

  const hasDifferentWorkerInCart =
    useCallback((): boolean => {
      const productWorkerId =
        cleanString(
          product?.workerId,
        );

      if (
        !productWorkerId ||
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
            productWorkerId
          );
        },
      );
    }, [
      items,
      product?.workerId,
    ]);

  /* ==========================================================
     BUY NOW
  ========================================================== */

  const handleBuyNow =
    useCallback(async () => {
      if (
        !validateProduct()
      ) {
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
    }, [
      addCurrentProductToCart,
      hasDifferentWorkerInCart,
      validateProduct,
    ]);

  /* ==========================================================
     CLEAR CART + CONTINUE
  ========================================================== */

  const handleClearCartAndContinue =
    useCallback(async () => {
      if (
        !validateProduct()
      ) {
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
       * CartContext should process clearCart()
       * and addToCart() sequentially/atomically.
       */
      const added =
        await addCurrentProductToCart();

      if (!added) {
        return;
      }

      showSuccessToast(
        "Cart Updated",
        "Your previous cart was cleared.",
      );

      router.push(
        "/(customer)/shop/cart",
      );
    }, [
      addCurrentProductToCart,
      clearCart,
      validateProduct,
    ]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
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

  /* ==========================================================
     NOT FOUND
  ========================================================== */

  if (!product) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.center
          }
        >
          <View
            style={
              styles.notFoundIcon
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

          <AppText
            variant="heading3"
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
            This product is no longer available.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     SCREEN
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      contentContainerStyle={
        styles.screen
      }
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
          onIndexChange={
            setCurrentImage
          }
        />

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

      {/* ======================================================
          LOGIN
      ====================================================== */}

      <LoginRequiredModal
        visible={
          showLoginModal
        }
        onClose={() =>
          setShowLoginModal(
            false,
          )
        }
        onLogin={() => {
          setShowLoginModal(
            false,
          );

          router.push(
            "/(auth)/login",
          );
        }}
      />

      {/* ======================================================
          CALL WORKER
      ====================================================== */}

      <CallWorkerModal
        visible={
          showCallModal
        }
        workerName={
          workerName
        }
        loading={
          callingWorker
        }
        onClose={() => {
          if (
            !callingWorker
          ) {
            setShowCallModal(
              false,
            );
          }
        }}
        onConfirm={
          handleConfirmCallWorker
        }
      />

      {/* ======================================================
          REPLACE CART
      ====================================================== */}

      <ReplaceCartModal
        visible={
          showReplaceCartModal
        }
        onClose={() =>
          setShowReplaceCartModal(
            false,
          )
        }
        onContinue={
          handleClearCartAndContinue
        }
      />
    </AppScreen>
  );
}

/* ============================================================
   LOGIN MODAL
============================================================ */

const LoginRequiredModal =
  memo(
    function LoginRequiredModal({
      visible,
      onClose,
      onLogin,
    }: {
      visible: boolean;

      onClose: () => void;

      onLogin: () => void;
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
                  name="lock"
                  role="customer"
                  size="lg"
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
                  styles.modalTitle
                }
              >
                Login Required
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.modalMessage
                }
              >
                Please login to your Fixxam account before contacting this worker.
              </AppText>

              <View
                style={
                  styles.modalActions
                }
              >
                <SecondaryButton
                  title="Cancel"
                  onPress={
                    onClose
                  }
                />

                <PrimaryButton
                  title="Login"
                  icon="next"
                  onPress={
                    onLogin
                  }
                />
              </View>
            </View>
          </View>
        </Modal>
      );
    },
  );

LoginRequiredModal.displayName =
  "LoginRequiredModal";

/* ============================================================
   CALL MODAL
============================================================ */

const CallWorkerModal =
  memo(
    function CallWorkerModal({
      visible,
      workerName,
      loading,
      onClose,
      onConfirm,
    }: {
      visible: boolean;

      workerName: string;

      loading: boolean;

      onClose: () => void;

      onConfirm: () => void;
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
                  name="phone"
                  role="customer"
                  size="lg"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <AppText
                variant="heading3"
                weight="bold"
                center
                numberOfLines={2}
                style={
                  styles.modalTitle
                }
              >
                Call {workerName}?
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.modalMessage
                }
              >
                {workerName} is available for contact.
              </AppText>

              <AppText
                variant="body"
                weight="bold"
                center
                style={
                  styles.modalQuestion
                }
              >
                Do you want to call this worker?
              </AppText>

              <View
                style={
                  styles.modalActions
                }
              >
                <SecondaryButton
                  title="Cancel"
                  disabled={
                    loading
                  }
                  onPress={
                    onClose
                  }
                />

                <PrimaryButton
                  title="Call Worker"
                  icon="phone"
                  loading={
                    loading
                  }
                  disabled={
                    loading
                  }
                  onPress={
                    onConfirm
                  }
                />
              </View>
            </View>
          </View>
        </Modal>
      );
    },
  );

CallWorkerModal.displayName =
  "CallWorkerModal";

/* ============================================================
   REPLACE CART MODAL
============================================================ */

const ReplaceCartModal =
  memo(
    function ReplaceCartModal({
      visible,
      onClose,
      onContinue,
    }: {
      visible: boolean;

      onClose: () => void;

      onContinue:
        () => void;
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
                variant="heading3"
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
                Your cart contains products from another worker. You need to clear your current cart before continuing with this product.
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
                  Your current cart will be removed and replaced with this product.
                </AppText>
              </View>

              <View
                style={
                  styles.modalActions
                }
              >
                <SecondaryButton
                  title="Cancel"
                  onPress={
                    onClose
                  }
                />

                <PrimaryButton
                  title="Clear & Continue"
                  icon="cart"
                  onPress={
                    onContinue
                  }
                />
              </View>
            </View>
          </View>
        </Modal>
      );
    },
  );

ReplaceCartModal.displayName =
  "ReplaceCartModal";

/* ============================================================
   PRIMARY BUTTON
============================================================ */

const PrimaryButton =
  memo(
    function PrimaryButton({
      title,
      icon,
      onPress,
      disabled = false,
      loading = false,
    }: {
      title: string;

      icon:
        | "next"
        | "phone"
        | "cart";

      onPress: () => void;

      disabled?: boolean;

      loading?: boolean;
    }) {
      return (
        <Pressable
          disabled={
            disabled
          }
          onPress={
            onPress
          }
          accessibilityRole="button"
          accessibilityLabel={
            title
          }
          accessibilityState={{
            disabled,
            busy:
              loading,
          }}
          style={({
            pressed,
          }) => [
            styles.primaryButton,

            disabled
              ? styles.disabledButton
              : null,

            pressed &&
            !disabled
              ? styles.pressed
              : null,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={
                Colors.textInverse
              }
            />
          ) : (
            <AppIcon
              name={
                icon
              }
              role="customer"
              size="sm"
              color={
                Colors.textInverse
              }
            />
          )}

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.primaryButtonText
            }
          >
            {title}
          </AppText>
        </Pressable>
      );
    },
  );

PrimaryButton.displayName =
  "PrimaryButton";

/* ============================================================
   SECONDARY BUTTON
============================================================ */

const SecondaryButton =
  memo(
    function SecondaryButton({
      title,
      onPress,
      disabled = false,
    }: {
      title: string;

      onPress: () => void;

      disabled?: boolean;
    }) {
      return (
        <Pressable
          disabled={
            disabled
          }
          onPress={
            onPress
          }
          accessibilityRole="button"
          accessibilityLabel={
            title
          }
          accessibilityState={{
            disabled,
          }}
          style={({
            pressed,
          }) => [
            styles.secondaryButton,

            disabled
              ? styles.disabledButton
              : null,

            pressed &&
            !disabled
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.secondaryButtonText
            }
          >
            {title}
          </AppText>
        </Pressable>
      );
    },
  );

SecondaryButton.displayName =
  "SecondaryButton";

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

    container: {
      paddingBottom:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.background,
    },

    center: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    notFoundIcon: {
      width: 68,

      height: 68,

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
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

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
        FixxamTokens.spacing.xl,

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
      width: 68,

      height: 68,

      alignSelf:
        "center",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

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
        FixxamTokens.spacing.sm,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    modalQuestion: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoBox: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

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

    /* ========================================================
       ACTIONS
    ======================================================== */

    modalActions: {
      marginTop:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    primaryButton: {
      flex: 1,

      minHeight:
        FixxamTokens.size.buttonHeight,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    primaryButtonText: {
      flexShrink: 1,

      color:
        Colors.textInverse,
    },

    secondaryButton: {
      flex: 1,

      minHeight:
        FixxamTokens.size.buttonHeight,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.disabledBackground,
    },

    secondaryButtonText: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       STATES
    ======================================================== */

    disabledButton: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
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