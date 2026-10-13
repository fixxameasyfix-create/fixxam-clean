import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  router,
} from "expo-router";

import {
  FirebaseError,
} from "firebase/app";

import * as Location from "expo-location";

import Toast from "react-native-toast-message";

import {
  useCart,
} from "@/contexts/CartContext";

import {
  auth,
} from "@/firebase/config";

import createOrder from "@/services/orders/createOrder";

/* ============================================================
   TYPES
============================================================ */

export type PaymentMethod =
  | "cash"
  | "card"
  | "transfer";

export type CheckoutCartItem =
  ReturnType<
    typeof useCart
  >["items"][number];

/* ============================================================
   CONSTANTS
============================================================ */

export const MAX_ADDRESS_LENGTH =
  300;

/* ============================================================
   HELPERS
============================================================ */

export function normalizeId(
  value?: string | null,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

export function getSafeAmount(
  value: unknown,
): number {
  const parsed =
    Number(
      value,
    );

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

export function formatNaira(
  amount: number,
): string {
  const safeAmount =
    Number.isFinite(
      amount,
    ) &&
    amount >= 0
      ? amount
      : 0;

  return `₦${safeAmount.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2,
    },
  )}`;
}

function showToast(
  type:
    | "success"
    | "error"
    | "info",
  title: string,
  message: string,
) {
  Toast.show({
    type,

    text1:
      title,

    text2:
      message,
  });
}

function getOrderErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof FirebaseError
  ) {
    switch (
      error.code
    ) {
      case "permission-denied":
      case "functions/permission-denied":
        return "You do not have permission to place this order.";

      case "unauthenticated":
      case "functions/unauthenticated":
        return "Your session has expired. Please sign in again.";

      case "unavailable":
      case "functions/unavailable":
        return "The order service is temporarily unavailable. Please try again.";

      case "functions/failed-precondition":
        return "This order can no longer be placed. Please review your cart.";

      default:
        return "We could not place your order. Please try again.";
    }
  }

  if (
    error instanceof Error &&
    error.message ===
      "ORDER_ID_MISSING"
  ) {
    return "Your order was created, but we could not open the order details. Please check your orders.";
  }

  return "We could not place your order. Please try again.";
}

/* ============================================================
   CHECKOUT
============================================================ */

export function useCheckout() {
  const {
    items,
    subtotal,
    discountTotal,
    total,
    clearCart,
    cartReady,
  } =
    useCart();

  /* ==========================================================
     DELIVERY
  ========================================================== */

  const [
    address,
    setAddress,
  ] =
    useState("");

  const [
    latitude,
    setLatitude,
  ] =
    useState<
      number | null
    >(
      null,
    );

  const [
    longitude,
    setLongitude,
  ] =
    useState<
      number | null
    >(
      null,
    );

  /* ==========================================================
     PAYMENT
  ========================================================== */

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      "cash",
    );

  /* ==========================================================
     UI STATE
  ========================================================== */

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  const [
    locationLoading,
    setLocationLoading,
  ] =
    useState(
      false,
    );

  const [
    addressFocused,
    setAddressFocused,
  ] =
    useState(
      false,
    );

  const [
    loginModalVisible,
    setLoginModalVisible,
  ] =
    useState(
      false,
    );

  const [
    orderSuccessModalVisible,
    setOrderSuccessModalVisible,
  ] =
    useState(
      false,
    );

  const [
    createdOrderId,
    setCreatedOrderId,
  ] =
    useState("");

  /* ==========================================================
     LOCKS
  ========================================================== */

  const orderInFlight =
    useRef(
      false,
    );

  const locationInFlight =
    useRef(
      false,
    );

  /* ==========================================================
     CART OWNER
  ========================================================== */

  const firstItem =
    items[0];

  const workerId =
    normalizeId(
      firstItem?.workerId,
    );

  const sellerId =
    normalizeId(
      firstItem?.sellerId,
    );

  const storeId =
    normalizeId(
      firstItem?.storeId,
    );

  /* ==========================================================
     SAFE TOTALS
  ========================================================== */

  const safeSubtotal =
    getSafeAmount(
      subtotal,
    );

  const safeDiscountTotal =
    getSafeAmount(
      discountTotal,
    );

  const safeTotal =
    getSafeAmount(
      total,
    );

  const hasDiscount =
    safeDiscountTotal >
    0;

  const totalQuantity =
    useMemo(
      () =>
        items.reduce(
          (
            sum,
            item,
          ) => {
            const quantity =
              Number(
                item.quantity,
              );

            if (
              !Number.isInteger(
                quantity,
              ) ||
              quantity < 1
            ) {
              return sum;
            }

            return (
              sum +
              quantity
            );
          },
          0,
        ),
      [
        items,
      ],
    );

  /* ==========================================================
     LOGIN MODAL
  ========================================================== */

  const closeLoginModal =
    useCallback(
      () => {
        if (
          orderInFlight.current ||
          loading
        ) {
          return;
        }

        setLoginModalVisible(
          false,
        );
      },
      [
        loading,
      ],
    );

  const handleLogin =
    useCallback(
      () => {
        if (
          orderInFlight.current ||
          loading
        ) {
          return;
        }

        setLoginModalVisible(
          false,
        );

        router.push(
          "/(auth)/login",
        );
      },
      [
        loading,
      ],
    );

  /* ==========================================================
     ADDRESS
  ========================================================== */

  const handleAddressChange =
    useCallback(
      (
        value: string,
      ) => {
        setAddress(
          value.slice(
            0,
            MAX_ADDRESS_LENGTH,
          ),
        );

        setLatitude(
          null,
        );

        setLongitude(
          null,
        );
      },
      [],
    );

  /* ==========================================================
     CURRENT LOCATION
  ========================================================== */

  const handleUseCurrentLocation =
    useCallback(
      async () => {
        if (
          locationInFlight.current ||
          orderInFlight.current ||
          loading ||
          locationLoading
        ) {
          return;
        }

        locationInFlight.current =
          true;

        setLocationLoading(
          true,
        );

        try {
          const servicesEnabled =
            await Location
              .hasServicesEnabledAsync();

          if (
            !servicesEnabled
          ) {
            showToast(
              "error",
              "Location is turned off",
              "Please enable location services and try again.",
            );

            return;
          }

          const permission =
            await Location
              .requestForegroundPermissionsAsync();

          if (
            permission.status !==
            Location
              .PermissionStatus
              .GRANTED
          ) {
            showToast(
              "error",
              "Location permission required",
              permission.canAskAgain
                ? "Please allow location access to use your current location."
                : "Location access is blocked. Enable it from your device settings.",
            );

            return;
          }

          const currentLocation =
            await Location
              .getCurrentPositionAsync({
                accuracy:
                  Location
                    .Accuracy
                    .High,
              });

          const currentLatitude =
            currentLocation
              .coords
              .latitude;

          const currentLongitude =
            currentLocation
              .coords
              .longitude;

          if (
            !Number.isFinite(
              currentLatitude,
            ) ||
            !Number.isFinite(
              currentLongitude,
            ) ||
            currentLatitude <
              -90 ||
            currentLatitude >
              90 ||
            currentLongitude <
              -180 ||
            currentLongitude >
              180
          ) {
            throw new Error(
              "INVALID_GPS_COORDINATES",
            );
          }

          setLatitude(
            currentLatitude,
          );

          setLongitude(
            currentLongitude,
          );

          try {
            const addresses =
              await Location
                .reverseGeocodeAsync({
                  latitude:
                    currentLatitude,

                  longitude:
                    currentLongitude,
                });

            const place =
              addresses[0];

            if (
              place
            ) {
              const formattedAddress =
                [
                  place.name,
                  place.street,
                  place.city,
                  place.region,
                  place.country,
                ]
                  .filter(
                    (
                      value,
                    ): value is string =>
                      typeof value ===
                        "string" &&
                      Boolean(
                        value.trim(),
                      ),
                  )
                  .map(
                    value =>
                      value.trim(),
                  )
                  .filter(
                    (
                      value,
                      index,
                      array,
                    ) =>
                      array.indexOf(
                        value,
                      ) ===
                      index,
                  )
                  .join(
                    ", ",
                  )
                  .trim();

              if (
                formattedAddress
              ) {
                setAddress(
                  formattedAddress.slice(
                    0,
                    MAX_ADDRESS_LENGTH,
                  ),
                );
              }
            }
          } catch (
            error
          ) {
            console.warn(
              "FIXXAM_REVERSE_GEOCODE_ERROR:",
              error,
            );
          }

          showToast(
            "success",
            "Location selected",
            "Your current location has been added.",
          );
        } catch (
          error
        ) {
          console.error(
            "FIXXAM_CURRENT_LOCATION_ERROR:",
            error,
          );

          setLatitude(
            null,
          );

          setLongitude(
            null,
          );

          showToast(
            "error",
            "Unable to get location",
            "Please enter your address manually.",
          );
        } finally {
          locationInFlight.current =
            false;

          setLocationLoading(
            false,
          );
        }
      },
      [
        loading,
        locationLoading,
      ],
    );

  /* ==========================================================
     PLACE ORDER
  ========================================================== */

  const handlePlaceOrder =
    useCallback(
      async () => {
        if (
          orderInFlight.current ||
          loading
        ) {
          return;
        }

        /* ======================================================
           CART READY
        ====================================================== */

        if (
          !cartReady
        ) {
          showToast(
            "info",
            "Cart is loading",
            "Please wait a moment and try again.",
          );

          return;
        }

        /* ======================================================
           AUTH
        ====================================================== */

        const user =
          auth.currentUser;

        if (
          !user
        ) {
          setLoginModalVisible(
            true,
          );

          return;
        }

        const customerId =
          normalizeId(
            user.uid,
          );

        if (
          !customerId
        ) {
          showToast(
            "error",
            "Account unavailable",
            "Please sign in again before placing your order.",
          );

          return;
        }

        /* ======================================================
           CART
        ====================================================== */

        if (
          items.length ===
          0
        ) {
          showToast(
            "error",
            "Cart is empty",
            "Please add products before checkout.",
          );

          return;
        }

        /* ======================================================
           WORKER
        ====================================================== */

        if (
          !workerId
        ) {
          showToast(
            "error",
            "Worker not assigned",
            "This product does not have a valid worker assigned.",
          );

          return;
        }

        if (
          workerId ===
          customerId
        ) {
          console.error(
            "FIXXAM_SELF_ASSIGNMENT_BLOCKED",
          );

          showToast(
            "error",
            "Invalid worker assignment",
            "This product is assigned to your own account. Please remove it and add a product from another worker.",
          );

          return;
        }

        /* ======================================================
           SELLER
        ====================================================== */

        if (
          !sellerId
        ) {
          showToast(
            "error",
            "Seller not assigned",
            "No seller is assigned to this cart.",
          );

          return;
        }

        if (
          sellerId ===
          customerId
        ) {
          console.error(
            "FIXXAM_SELLER_SELF_ASSIGNMENT_BLOCKED",
          );

          showToast(
            "error",
            "Invalid seller assignment",
            "This product is assigned to your own account.",
          );

          return;
        }

        /* ======================================================
           WORKER CONSISTENCY
        ====================================================== */

        const workerConflict =
          items.some(
            item =>
              normalizeId(
                item.workerId,
              ) !==
              workerId,
          );

        if (
          workerConflict
        ) {
          showToast(
            "error",
            "Worker conflict",
            "All products must belong to the same worker.",
          );

          return;
        }

        /* ======================================================
           SELLER CONSISTENCY
        ====================================================== */

        const sellerConflict =
          items.some(
            item =>
              normalizeId(
                item.sellerId,
              ) !==
              sellerId,
          );

        if (
          sellerConflict
        ) {
          showToast(
            "error",
            "Seller conflict",
            "All products must belong to the same seller.",
          );

          return;
        }

        /* ======================================================
           STORE CONSISTENCY
        ====================================================== */

        const storeConflict =
          items.some(
            item =>
              normalizeId(
                item.storeId,
              ) !==
              storeId,
          );

        if (
          storeConflict
        ) {
          showToast(
            "error",
            "Store conflict",
            "Products with different stores cannot be checked out together.",
          );

          return;
        }

        /* ======================================================
           ADDRESS
        ====================================================== */

        const trimmedAddress =
          address.trim();

        if (
          !trimmedAddress
        ) {
          showToast(
            "error",
            "Delivery address required",
            "Please enter your delivery address.",
          );

          return;
        }

        if (
          trimmedAddress.length >
          MAX_ADDRESS_LENGTH
        ) {
          showToast(
            "error",
            "Address too long",
            "Please shorten your delivery address.",
          );

          return;
        }

        /* ======================================================
           LOCATION CONSISTENCY
        ====================================================== */

        const hasLatitude =
          latitude !==
          null;

        const hasLongitude =
          longitude !==
          null;

        if (
          hasLatitude !==
          hasLongitude
        ) {
          showToast(
            "error",
            "Invalid delivery location",
            "Please select your location again.",
          );

          return;
        }

        if (
          latitude !==
            null &&
          (
            !Number.isFinite(
              latitude,
            ) ||
            latitude <
              -90 ||
            latitude >
              90
          )
        ) {
          showToast(
            "error",
            "Invalid latitude",
            "Please select your location again.",
          );

          return;
        }

        if (
          longitude !==
            null &&
          (
            !Number.isFinite(
              longitude,
            ) ||
            longitude <
              -180 ||
            longitude >
              180
          )
        ) {
          showToast(
            "error",
            "Invalid longitude",
            "Please select your location again.",
          );

          return;
        }

        /* ======================================================
           PRODUCT VALIDATION
        ====================================================== */

        const invalidProduct =
          items.some(
            item => {
              const productId =
                normalizeId(
                  item.id,
                );

              const productName =
                normalizeId(
                  item.name,
                );

              const originalPrice =
                Number(
                  item.price,
                );

              const unitPrice =
                Number(
                  item.unitPrice,
                );

              const quantity =
                Number(
                  item.quantity,
                );

              const itemWorkerId =
                normalizeId(
                  item.workerId,
                );

              const itemSellerId =
                normalizeId(
                  item.sellerId,
                );

              if (
                !productId ||
                !productName ||
                !itemWorkerId ||
                !itemSellerId
              ) {
                return true;
              }

              if (
                !Number.isFinite(
                  originalPrice,
                ) ||
                originalPrice <
                  0
              ) {
                return true;
              }

              if (
                !Number.isFinite(
                  unitPrice,
                ) ||
                unitPrice <
                  0
              ) {
                return true;
              }

              if (
                unitPrice >
                originalPrice
              ) {
                return true;
              }

              return (
                !Number.isInteger(
                  quantity,
                ) ||
                quantity <
                  1
              );
            },
          );

        if (
          invalidProduct
        ) {
          showToast(
            "error",
            "Invalid cart item",
            "Please remove the invalid product and try again.",
          );

          return;
        }

        /* ======================================================
           TOTAL VALIDATION
        ====================================================== */

        if (
          safeSubtotal <=
          0
        ) {
          showToast(
            "error",
            "Invalid subtotal",
            "Please review your cart and try again.",
          );

          return;
        }

        if (
          safeTotal <=
          0
        ) {
          showToast(
            "error",
            "Invalid order total",
            "Please review your cart and try again.",
          );

          return;
        }

        if (
          safeDiscountTotal >
          safeSubtotal
        ) {
          showToast(
            "error",
            "Invalid discount",
            "The discount amount is invalid.",
          );

          return;
        }

        /* ======================================================
           LOCK
        ====================================================== */

        orderInFlight.current =
          true;

        setLoading(
          true,
        );

        try {
          /* ====================================================
             CREATE ORDER
          ==================================================== */

          const orderId =
            await createOrder({
              customerId,

              workerId,

              sellerId,

              ...(storeId
                ? {
                    storeId,
                  }
                : {}),

              products:
                items.map(
                  item => {
                    const originalPrice =
                      Number(
                        item.price,
                      );

                    const unitPrice =
                      Number(
                        item.unitPrice,
                      );

                    const quantity =
                      Number(
                        item.quantity,
                      );

                    const discountPercentage =
                      Number(
                        item.discountPercentage ??
                          0,
                      );

                    const hasItemDiscount =
                      Number.isFinite(
                        discountPercentage,
                      ) &&
                      discountPercentage >
                        0 &&
                      discountPercentage <
                        100 &&
                      unitPrice <
                        originalPrice;

                    return {
                      productId:
                        normalizeId(
                          item.id,
                        ),

                      name:
                        normalizeId(
                          item.name,
                        ),

                      image:
                        normalizeId(
                          item.image,
                        ),

                      price:
                        originalPrice,

                      unitPrice,

                      quantity,

                      ...(hasItemDiscount
                        ? {
                            discountPercentage,

                            discountedPrice:
                              unitPrice,

                            dealId:
                              normalizeId(
                                item.dealId,
                              ),
                          }
                        : {}),
                    };
                  },
                ),

              subtotal:
                safeSubtotal,

              discountTotal:
                safeDiscountTotal,

              deliveryFee:
                0,

              total:
                safeTotal,

              paymentMethod,

              receiverName:
                user.displayName
                  ?.trim() ||
                "Customer",

              receiverPhone:
                user.phoneNumber
                  ?.trim() ||
                "",

              stateId:
                "",

              lgaId:
                "",

              address:
                trimmedAddress,

              ...(latitude !==
                null &&
              longitude !==
                null
                ? {
                    latitude,

                    longitude,
                  }
                : {}),

              note:
                "",
            });

          /* ====================================================
             ORDER ID
          ==================================================== */

          const normalizedOrderId =
            normalizeId(
              orderId,
            );

          if (
            !normalizedOrderId
          ) {
            console.error(
              "FIXXAM_ORDER_CREATED_WITHOUT_ID",
            );

            throw new Error(
              "ORDER_ID_MISSING",
            );
          }

          if (
            __DEV__
          ) {
            console.log(
              "FIXXAM_ORDER_CREATED",
              {
                orderId:
                  normalizedOrderId,
              },
            );
          }

          /* ====================================================
             CLEAR CART
          ==================================================== */

          clearCart();

          /* ====================================================
             SUCCESS MODAL
          ==================================================== */

          setCreatedOrderId(
            normalizedOrderId,
          );

          setOrderSuccessModalVisible(
            true,
          );
        } catch (
          error
        ) {
          console.error(
            "FIXXAM_PLACE_ORDER_ERROR:",
            error,
          );

          showToast(
            "error",
            "Unable to place order",
            getOrderErrorMessage(
              error,
            ),
          );
        } finally {
          orderInFlight.current =
            false;

          setLoading(
            false,
          );
        }
      },
      [
        address,
        cartReady,
        clearCart,
        items,
        latitude,
        loading,
        longitude,
        paymentMethod,
        safeDiscountTotal,
        safeSubtotal,
        safeTotal,
        sellerId,
        storeId,
        workerId,
      ],
    );

  /* ==========================================================
     VIEW CREATED ORDER
  ========================================================== */

  const handleViewOrder =
    useCallback(
      () => {
        const orderId =
          normalizeId(
            createdOrderId,
          );

        if (
          !orderId
        ) {
          return;
        }

        setOrderSuccessModalVisible(
          false,
        );

        router.replace({
          pathname:
            "/(customer)/orders/market/[orderId]",

          params: {
            orderId,
          },
        } as never);
      },
      [
        createdOrderId,
      ],
    );

  /* ==========================================================
     GO HOME
  ========================================================== */

  const handleGoHome =
    useCallback(
      () => {
        setOrderSuccessModalVisible(
          false,
        );

        router.replace(
          "/(customer)/(tabs)/home",
        );
      },
      [],
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    items,

    cartReady,

    address,

    addressFocused,

    latitude,

    longitude,

    paymentMethod,

    loading,

    locationLoading,

    safeSubtotal,

    safeDiscountTotal,

    safeTotal,

    hasDiscount,

    totalQuantity,

    loginModalVisible,

    orderSuccessModalVisible,

    createdOrderId,

    setAddressFocused,

    setPaymentMethod,

    handleAddressChange,

    handleUseCurrentLocation,

    handlePlaceOrder,

    closeLoginModal,

    handleLogin,

    handleViewOrder,

    handleGoHome,
  };
}