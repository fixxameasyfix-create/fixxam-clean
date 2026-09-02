import React, {
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import Toast from "react-native-toast-message";

import * as Location from "expo-location";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import { useCart } from "@/contexts/CartContext";

import { auth } from "@/firebase/config";

import createOrder from "@/services/orders/createOrder";

/* ============================================================
   TYPES
============================================================ */

type PaymentMethod =
  | "cash"
  | "card"
  | "transfer";

/* ============================================================
   HELPERS
============================================================ */

function formatNaira(
  amount: number,
): string {
  const safeAmount =
    Number.isFinite(amount)
      ? amount
      : 0;

  return `₦${safeAmount.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  )}`;
}

/* ============================================================
   CHECKOUT SCREEN
============================================================ */

export default function CheckoutScreen() {
  /* ==========================================================
     CART
  ========================================================== */

  const {
    items,

    /*
     * Original total before discounts.
     */
    subtotal,

    /*
     * Total money saved.
     */
    discountTotal,

    /*
     * Final amount customer pays.
     */
    total,

    clearCart,

    cartReady,
  } = useCart();

  /* ==========================================================
     ADDRESS
  ========================================================== */

  const [address, setAddress] =
    useState("");

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  /* ==========================================================
     PAYMENT
  ========================================================== */

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>("cash");

  /* ==========================================================
     LOADING
  ========================================================== */

  const [loading, setLoading] =
    useState(false);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  /* ==========================================================
     LOGIN MODAL
  ========================================================== */

  const [
    loginModalVisible,
    setLoginModalVisible,
  ] = useState(false);

  /* ============================================================
     CART IDENTIFIERS
  ============================================================ */

  const firstItem =
    items[0];

  const workerId =
    firstItem?.workerId?.trim() ??
    "";

  const sellerId =
    firstItem?.sellerId?.trim() ??
    "";

  const storeId =
    firstItem?.storeId?.trim() ??
    "";

  /* ============================================================
     DISCOUNT STATE
  ============================================================ */

  const hasDiscount =
    discountTotal > 0;

  /*
   * Defensive total validation.
   *
   * This protects the UI if a malformed
   * cart somehow enters the screen.
   */
  const safeSubtotal =
    Number.isFinite(subtotal) &&
    subtotal >= 0
      ? subtotal
      : 0;

  const safeDiscountTotal =
    Number.isFinite(
      discountTotal,
    ) &&
    discountTotal >= 0
      ? discountTotal
      : 0;

  const safeTotal =
    Number.isFinite(total) &&
    total >= 0
      ? total
      : 0;

  /* ============================================================
     ITEM COUNT
  ============================================================ */

  const totalQuantity =
    useMemo(() => {
      return items.reduce(
        (sum, item) => {
          const quantity =
            Number(
              item.quantity,
            );

          return (
            sum +
            (Number.isInteger(
              quantity,
            ) && quantity > 0
              ? quantity
              : 0)
          );
        },
        0,
      );
    }, [items]);

  /* ============================================================
     CLOSE LOGIN MODAL
  ============================================================ */

  const closeLoginModal =
    () => {
      if (loading) {
        return;
      }

      setLoginModalVisible(
        false,
      );
    };

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleLogin = () => {
    if (loading) {
      return;
    }

    setLoginModalVisible(
      false,
    );

    router.push(
      "/(auth)/login",
    );
  };

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  const handleUseCurrentLocation =
    async () => {
      if (
        loading ||
        locationLoading
      ) {
        return;
      }

      try {
        setLocationLoading(true);

        /* ------------------------------------------------------
           LOCATION SERVICES
        ------------------------------------------------------ */

        const servicesEnabled =
          await Location.hasServicesEnabledAsync();

        if (!servicesEnabled) {
          Toast.show({
            type: "error",
            text1:
              "Location is turned off",
            text2:
              "Please enable location services and try again.",
          });

          return;
        }

        /* ------------------------------------------------------
           PERMISSION
        ------------------------------------------------------ */

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !==
          Location.PermissionStatus.GRANTED
        ) {
          Toast.show({
            type: "error",
            text1:
              "Location permission required",
            text2:
              "Please allow location access to use your current location.",
          });

          return;
        }

        /* ------------------------------------------------------
           GPS
        ------------------------------------------------------ */

        const currentLocation =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy.High,
            },
          );

        const {
          latitude:
            currentLatitude,
          longitude:
            currentLongitude,
        } =
          currentLocation.coords;

        /* ------------------------------------------------------
           VALIDATE GPS
        ------------------------------------------------------ */

        if (
          !Number.isFinite(
            currentLatitude,
          ) ||
          !Number.isFinite(
            currentLongitude,
          ) ||
          currentLatitude < -90 ||
          currentLatitude > 90 ||
          currentLongitude < -180 ||
          currentLongitude > 180
        ) {
          throw new Error(
            "Invalid GPS coordinates.",
          );
        }

        /* ------------------------------------------------------
           SAVE GPS
        ------------------------------------------------------ */

        setLatitude(
          currentLatitude,
        );

        setLongitude(
          currentLongitude,
        );

        /* ------------------------------------------------------
           REVERSE GEOCODE
        ------------------------------------------------------ */

        try {
          const addresses =
            await Location.reverseGeocodeAsync(
              {
                latitude:
                  currentLatitude,
                longitude:
                  currentLongitude,
              },
            );

          const place =
            addresses[0];

          if (place) {
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
                    Boolean(value),
                )
                .filter(
                  (
                    value,
                    index,
                    array,
                  ) =>
                    array.indexOf(
                      value,
                    ) === index,
                )
                .join(", ");

            if (
              formattedAddress.trim()
            ) {
              setAddress(
                formattedAddress.trim(),
              );
            }
          }
        } catch (error) {
          console.warn(
            "FIXXAM_REVERSE_GEOCODE_ERROR:",
            error,
          );
        }

        Toast.show({
          type: "success",
          text1:
            "Location selected",
          text2:
            "Your current location has been added.",
        });
      } catch (error) {
        console.error(
          "FIXXAM_CURRENT_LOCATION_ERROR:",
          error,
        );

        setLatitude(null);
        setLongitude(null);

        Toast.show({
          type: "error",
          text1:
            "Unable to get location",
          text2:
            "Please enter your address manually.",
        });
      } finally {
        setLocationLoading(
          false,
        );
      }
    };

  /* ============================================================
     PLACE ORDER
  ============================================================ */

  const handlePlaceOrder =
    async () => {
      if (loading) {
        return;
      }

      /* --------------------------------------------------------
         CART READY
      -------------------------------------------------------- */

      if (!cartReady) {
        Toast.show({
          type: "info",
          text1:
            "Cart is loading",
          text2:
            "Please wait a moment and try again.",
        });

        return;
      }

      /* --------------------------------------------------------
         AUTH
      -------------------------------------------------------- */

      const user =
        auth.currentUser;

      if (!user) {
        setLoginModalVisible(
          true,
        );

        return;
      }

      /* --------------------------------------------------------
         EMPTY CART
      -------------------------------------------------------- */

      if (items.length === 0) {
        Toast.show({
          type: "error",
          text1:
            "Cart is empty",
          text2:
            "Please add products before checkout.",
        });

        return;
      }

      /* --------------------------------------------------------
         WORKER
      -------------------------------------------------------- */

      if (!workerId) {
        Toast.show({
          type: "error",
          text1:
            "Worker not assigned",
          text2:
            "No worker is assigned to this cart.",
        });

        return;
      }

      /* --------------------------------------------------------
         SELLER
      -------------------------------------------------------- */

      if (!sellerId) {
        Toast.show({
          type: "error",
          text1:
            "Seller not assigned",
          text2:
            "No seller is assigned to this cart.",
        });

        return;
      }

      /* --------------------------------------------------------
         WORKER CONSISTENCY
      -------------------------------------------------------- */

      const workerConflict =
        items.find(
          (item) =>
            item.workerId?.trim() !==
            workerId,
        );

      if (workerConflict) {
        Toast.show({
          type: "error",
          text1:
            "Worker conflict",
          text2:
            "All products must belong to the same worker.",
        });

        return;
      }

      /* --------------------------------------------------------
         SELLER CONSISTENCY
      -------------------------------------------------------- */

      const sellerConflict =
        items.find(
          (item) =>
            item.sellerId?.trim() !==
            sellerId,
        );

      if (sellerConflict) {
        Toast.show({
          type: "error",
          text1:
            "Seller conflict",
          text2:
            "All products must belong to the same seller.",
        });

        return;
      }

      /* --------------------------------------------------------
         STORE CONSISTENCY
      -------------------------------------------------------- */

      if (storeId) {
        const storeConflict =
          items.find(
            (item) =>
              item.storeId?.trim() !==
              storeId,
          );

        if (storeConflict) {
          Toast.show({
            type: "error",
            text1:
              "Store conflict",
            text2:
              "Products with different stores cannot be checked out together.",
          });

          return;
        }
      }

      /* --------------------------------------------------------
         ADDRESS
      -------------------------------------------------------- */

      const trimmedAddress =
        address.trim();

      if (!trimmedAddress) {
        Toast.show({
          type: "error",
          text1:
            "Delivery address required",
          text2:
            "Please enter your delivery address.",
        });

        return;
      }

      /* --------------------------------------------------------
         GPS PAIR
      -------------------------------------------------------- */

      const hasLatitude =
        latitude !== null;

      const hasLongitude =
        longitude !== null;

      if (
        hasLatitude !==
        hasLongitude
      ) {
        Toast.show({
          type: "error",
          text1:
            "Invalid delivery location",
          text2:
            "Please select your location again.",
        });

        return;
      }

      /* --------------------------------------------------------
         LATITUDE
      -------------------------------------------------------- */

      if (
        latitude !== null &&
        (
          !Number.isFinite(
            latitude,
          ) ||
          latitude < -90 ||
          latitude > 90
        )
      ) {
        Toast.show({
          type: "error",
          text1:
            "Invalid latitude",
          text2:
            "Please select your location again.",
        });

        return;
      }

      /* --------------------------------------------------------
         LONGITUDE
      -------------------------------------------------------- */

      if (
        longitude !== null &&
        (
          !Number.isFinite(
            longitude,
          ) ||
          longitude < -180 ||
          longitude > 180
        )
      ) {
        Toast.show({
          type: "error",
          text1:
            "Invalid longitude",
          text2:
            "Please select your location again.",
        });

        return;
      }

      /* --------------------------------------------------------
         PRODUCT VALIDATION
      -------------------------------------------------------- */

      const invalidProduct =
        items.find(
          (item) => {
            const productId =
              item.id.trim();

            const productName =
              item.name.trim();

            const originalPrice =
              Number(item.price);

            const unitPrice =
              Number(
                item.unitPrice,
              );

            const quantity =
              Number(item.quantity);

            const itemWorkerId =
              item.workerId?.trim() ??
              "";

            const itemSellerId =
              item.sellerId?.trim() ??
              "";

            /*
             * Original price.
             */

            if (
              !productId ||
              !productName
            ) {
              return true;
            }

            if (
              !Number.isFinite(
                originalPrice,
              ) ||
              originalPrice < 0
            ) {
              return true;
            }

            /*
             * Customer price.
             */

            if (
              !Number.isFinite(
                unitPrice,
              ) ||
              unitPrice < 0
            ) {
              return true;
            }

            /*
             * Discount can never increase
             * the price.
             */

            if (
              unitPrice >
              originalPrice
            ) {
              return true;
            }

            /*
             * Quantity.
             */

            if (
              !Number.isInteger(
                quantity,
              ) ||
              quantity < 1
            ) {
              return true;
            }

            /*
             * Worker.
             */

            if (
              !itemWorkerId
            ) {
              return true;
            }

            /*
             * Seller.
             */

            if (
              !itemSellerId
            ) {
              return true;
            }

            return false;
          },
        );

      if (invalidProduct) {
        Toast.show({
          type: "error",
          text1:
            "Invalid cart item",
          text2:
            "Please remove the invalid product and try again.",
        });

        return;
      }

      /* --------------------------------------------------------
         TOTAL VALIDATION
      -------------------------------------------------------- */

      if (
        !Number.isFinite(
          safeSubtotal,
        ) ||
        safeSubtotal <= 0
      ) {
        Toast.show({
          type: "error",
          text1:
            "Invalid subtotal",
          text2:
            "Please review your cart and try again.",
        });

        return;
      }

      if (
        !Number.isFinite(
          safeTotal,
        ) ||
        safeTotal <= 0
      ) {
        Toast.show({
          type: "error",
          text1:
            "Invalid order total",
          text2:
            "Please review your cart and try again.",
        });

        return;
      }

      /*
       * Discount cannot exceed subtotal.
       */

      if (
        safeDiscountTotal >
        safeSubtotal
      ) {
        Toast.show({
          type: "error",
          text1:
            "Invalid discount",
          text2:
            "The discount amount is invalid.",
        });

        return;
      }

      /* --------------------------------------------------------
         CREATE ORDER
      -------------------------------------------------------- */

      try {
        setLoading(true);

        const orderId =
          await createOrder({
            customerId:
              user.uid,

            workerId,

            sellerId,

            ...(storeId
              ? {
                  storeId,
                }
              : {}),

            /*
             * ==================================================
             * PRODUCTS
             * ==================================================
             *
             * price
             *   = original price
             *
             * unitPrice
             *   = customer price after discount
             *
             * discountPercentage
             *   = discount %
             *
             * discountedPrice
             *   = discounted unit price
             */

            products:
              items.map(
                (item) => {
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

                  const hasItemDiscount =
                    Number.isFinite(
                      item.discountPercentage,
                    ) &&
                    Number(
                      item.discountPercentage,
                    ) > 0 &&
                    Number(
                      item.discountPercentage,
                    ) < 100 &&
                    unitPrice <
                      originalPrice;

                  return {
                    productId:
                      item.id.trim(),

                    name:
                      item.name.trim(),

                    image:
                      item.image?.trim() ??
                      "",

                    /*
                     * Original product price.
                     */
                    price:
                      originalPrice,

                    /*
                     * Actual price customer
                     * pays for one unit.
                     */
                    unitPrice,

                    /*
                     * Quantity ordered.
                     */
                    quantity,

                    /*
                     * Discount information.
                     */
                    ...(hasItemDiscount
                      ? {
                          discountPercentage:
                            Number(
                              item.discountPercentage,
                            ),

                          discountedPrice:
                            unitPrice,

                          dealId:
                            item.dealId ??
                            "",
                        }
                      : {}),
                  };
                },
              ),

            /*
             * Original subtotal.
             */
            subtotal:
              safeSubtotal,

            /*
             * Total discount.
             */
            discountTotal:
              safeDiscountTotal,

            deliveryFee: 0,

            /*
             * Final amount.
             */
            total:
              safeTotal,

            paymentMethod,

            receiverName:
              user.displayName?.trim() ||
              "Customer",

            receiverPhone:
              user.phoneNumber?.trim() ||
              "",

            stateId: "",

            lgaId: "",

            address:
              trimmedAddress,

            ...(latitude !== null &&
            longitude !== null
              ? {
                  latitude,
                  longitude,
                }
              : {}),

            note: "",
          });

        console.log(
          "FIXXAM_ORDER_CREATED",
          {
            orderId,
            customerId:
              user.uid,
            workerId,
            sellerId,
            storeId:
              storeId || null,
            subtotal:
              safeSubtotal,
            discountTotal:
              safeDiscountTotal,
            total:
              safeTotal,
          },
        );

        /*
         * Clear cart ONLY after
         * Firestore succeeds.
         */

        clearCart();

        Toast.show({
          type: "success",
          text1:
            "Order placed successfully",
          text2:
            "Your order has been sent to the worker.",
        });

        router.replace(
          "/orders",
        );
      } catch (error) {
        console.error(
          "FIXXAM_PLACE_ORDER_ERROR:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Please try again.";

        Toast.show({
          type: "error",
          text1:
            "Unable to place order",
          text2:
            message,
        });
      } finally {
        setLoading(false);
      }
    };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      <AppScreen>
        <ScrollView
          contentContainerStyle={
            styles.container
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          <AppText
            weight="bold"
            style={styles.title}
          >
            Checkout
          </AppText>

          {/* ==================================================
              DELIVERY ADDRESS
          ================================================== */}

          <View style={styles.card}>
            <AppText
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              Delivery Address
            </AppText>

            <TextInput
              value={address}
              onChangeText={(value) => {
                setAddress(value);

                /*
                 * Manual editing invalidates
                 * previous GPS selection.
                 */
                setLatitude(null);
                setLongitude(null);
              }}
              placeholder="Enter delivery address"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              editable={
                !loading &&
                !locationLoading
              }
              multiline
              accessibilityLabel="Delivery address"
            />

            <Pressable
              onPress={
                handleUseCurrentLocation
              }
              disabled={
                loading ||
                locationLoading
              }
              style={({ pressed }) => [
                styles.locationButton,

                locationLoading &&
                  styles.disabledButton,

                pressed &&
                  !loading &&
                  !locationLoading &&
                  styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Use current location"
              accessibilityState={{
                disabled:
                  loading ||
                  locationLoading,
              }}
            >
              {locationLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />
              ) : (
                <Ionicons
                  name="location"
                  size={20}
                  color="#2563EB"
                />
              )}

              <AppText
                weight="bold"
                style={
                  styles.locationButtonText
                }
              >
                {locationLoading
                  ? "Getting location..."
                  : "Use Current Location"}
              </AppText>
            </Pressable>

            <AppText
              style={
                styles.trackingHint
              }
            >
              After placing this order,
              you can track it easily
              with Fixxam.
            </AppText>

            {latitude !== null &&
              longitude !== null && (
                <View
                  style={
                    styles.locationSelected
                  }
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#16A34A"
                  />

                  <AppText
                    style={
                      styles.locationSelectedText
                    }
                  >
                    Current location selected
                  </AppText>
                </View>
              )}
          </View>

          {/* ==================================================
              PAYMENT
          ================================================== */}

          <View style={styles.card}>
            <AppText
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              Payment Method
            </AppText>

            <PaymentOption
              icon="cash-outline"
              label="Pay on Delivery"
              selected={
                paymentMethod ===
                "cash"
              }
              disabled={loading}
              onPress={() =>
                setPaymentMethod(
                  "cash",
                )
              }
            />

            <PaymentOption
              icon="card-outline"
              label="Card Payment"
              selected={
                paymentMethod ===
                "card"
              }
              disabled={loading}
              onPress={() =>
                setPaymentMethod(
                  "card",
                )
              }
            />

            <PaymentOption
              icon="business-outline"
              label="Bank Transfer"
              selected={
                paymentMethod ===
                "transfer"
              }
              disabled={loading}
              onPress={() =>
                setPaymentMethod(
                  "transfer",
                )
              }
            />
          </View>

          {/* ==================================================
              WORKER NOTICE
          ================================================== */}

          <View
            style={styles.workerNotice}
          >
            <View
              style={
                styles.workerNoticeIcon
              }
            >
              <Ionicons
                name="person-outline"
                size={18}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.workerNoticeContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.workerNoticeTitle
                }
              >
                Worker assigned
              </AppText>

              <AppText
                numberOfLines={2}
                style={
                  styles.workerNoticeText
                }
              >
                Your order will be sent
                directly to the assigned
                worker.
              </AppText>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#16A34A"
            />
          </View>

          {/* ==================================================
              ORDER SUMMARY
          ================================================== */}

          <View style={styles.card}>
            <View
              style={
                styles.summaryHeader
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.sectionTitle
                }
              >
                Order Summary
              </AppText>

              <AppText
                style={
                  styles.itemCount
                }
              >
                {totalQuantity}{" "}
                {totalQuantity === 1
                  ? "item"
                  : "items"}
              </AppText>
            </View>

            {items.map((item) => {
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

              const hasItemDiscount =
                Number.isFinite(
                  originalPrice,
                ) &&
                Number.isFinite(
                  unitPrice,
                ) &&
                unitPrice <
                  originalPrice;

              const originalTotal =
                originalPrice *
                quantity;

              const finalTotal =
                unitPrice *
                quantity;

              return (
                <View
                  key={item.id}
                  style={
                    styles.summaryRow
                  }
                >
                  <View
                    style={
                      styles.summaryProduct
                    }
                  >
                    <AppText
                      numberOfLines={1}
                      style={
                        styles.summaryName
                      }
                    >
                      {item.name}
                    </AppText>

                    <AppText
                      style={
                        styles.summaryQuantity
                      }
                    >
                      Quantity:{" "}
                      {quantity}
                    </AppText>

                    {hasItemDiscount ? (
                      <View
                        style={
                          styles.itemPriceRow
                        }
                      >
                        <AppText
                          style={
                            styles.oldItemPrice
                          }
                        >
                          {formatNaira(
                            originalPrice,
                          )}
                        </AppText>

                        <AppText
                          weight="bold"
                          style={
                            styles.discountBadge
                          }
                        >
                          {Number(
                            item.discountPercentage ??
                              0,
                          )}% OFF
                        </AppText>
                      </View>
                    ) : null}
                  </View>

                  <View
                    style={
                      styles.summaryPriceContainer
                    }
                  >
                    {hasItemDiscount ? (
                      <AppText
                        style={
                          styles.oldTotalPrice
                        }
                      >
                        {formatNaira(
                          originalTotal,
                        )}
                      </AppText>
                    ) : null}

                    <AppText
                      weight="bold"
                      style={
                        styles.summaryPrice
                      }
                    >
                      {formatNaira(
                        finalTotal,
                      )}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ==================================================
              PRICE BREAKDOWN
          ================================================== */}

          <View
            style={
              styles.breakdownCard
            }
          >
            <View
              style={styles.breakdownRow}
            >
              <AppText
                style={
                  styles.breakdownLabel
                }
              >
                Subtotal
              </AppText>

              <AppText
                weight="bold"
                style={
                  styles.breakdownValue
                }
              >
                {formatNaira(
                  safeSubtotal,
                )}
              </AppText>
            </View>

            {hasDiscount ? (
              <View
                style={styles.breakdownRow}
              >
                <AppText
                  style={
                    styles.discountLabel
                  }
                >
                  Discount
                </AppText>

                <AppText
                  weight="bold"
                  style={
                    styles.discountValue
                  }
                >
                  -{formatNaira(
                    safeDiscountTotal,
                  )}
                </AppText>
              </View>
            ) : null}

            <View
              style={
                styles.breakdownDivider
              }
            />

            <View
              style={styles.totalRow}
            >
              <View>
                <AppText
                  weight="bold"
                  style={
                    styles.totalLabel
                  }
                >
                  Total Amount
                </AppText>

                {hasDiscount ? (
                  <AppText
                    style={
                      styles.savedText
                    }
                  >
                    You saved{" "}
                    {formatNaira(
                      safeDiscountTotal,
                    )}
                  </AppText>
                ) : null}
              </View>

              <AppText
                weight="bold"
                style={
                  styles.totalPrice
                }
              >
                {formatNaira(
                  safeTotal,
                )}
              </AppText>
            </View>

            {/* ==================================================
                PLACE ORDER
            ================================================== */}

            <Pressable
              style={({ pressed }) => [
                styles.placeButton,

                (loading ||
                  !cartReady) &&
                  styles.disabledButton,

                pressed &&
                  !loading &&
                  cartReady &&
                  styles.buttonPressed,
              ]}
              disabled={
                loading ||
                !cartReady
              }
              onPress={
                handlePlaceOrder
              }
              accessibilityRole="button"
              accessibilityLabel="Place order"
              accessibilityState={{
                disabled:
                  loading ||
                  !cartReady,
              }}
            >
              {loading ? (
                <>
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />

                  <AppText
                    weight="bold"
                    style={
                      styles.placeText
                    }
                  >
                    Placing Order...
                  </AppText>
                </>
              ) : (
                <>
                  <AppText
                    weight="bold"
                    style={
                      styles.placeText
                    }
                  >
                    Place Order
                  </AppText>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </AppScreen>

      {/* ========================================================
          LOGIN REQUIRED MODAL
      ======================================================== */}

      <Modal
        visible={
          loginModalVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          closeLoginModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Pressable
            style={
              StyleSheet.absoluteFill
            }
            onPress={
              closeLoginModal
            }
            accessibilityLabel="Close login dialog"
          />

          <View
            style={
              styles.loginModal
            }
            accessibilityViewIsModal
          >
            <View
              style={
                styles.loginIcon
              }
            >
              <Ionicons
                name="lock-closed-outline"
                size={25}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.loginContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.loginTitle
                }
              >
                Login required
              </AppText>

              <AppText
                style={
                  styles.loginMessage
                }
              >
                Please login to place
                an order.
              </AppText>
            </View>

            <View
              style={
                styles.loginActions
              }
            >
              <Pressable
                onPress={
                  closeLoginModal
                }
                disabled={loading}
                style={({ pressed }) => [
                  styles.modalButton,

                  pressed &&
                    !loading &&
                    styles.modalButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <AppText
                  weight="bold"
                  style={
                    styles.cancelText
                  }
                >
                  CANCEL
                </AppText>
              </Pressable>

              <Pressable
                onPress={
                  handleLogin
                }
                disabled={loading}
                style={({ pressed }) => [
                  styles.modalButton,

                  pressed &&
                    !loading &&
                    styles.modalButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Login"
              >
                <AppText
                  weight="bold"
                  style={
                    styles.loginText
                  }
                >
                  LOGIN
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ============================================================
   PAYMENT OPTION
============================================================ */

function PaymentOption({
  icon,
  label,
  selected,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.payment,

        selected &&
          styles.selectedPayment,

        pressed &&
          !disabled &&
          styles.paymentPressed,
      ]}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{
        checked: selected,
        disabled,
      }}
    >
      <Ionicons
        name={icon}
        size={22}
        color="#2563EB"
      />

      <AppText
        style={
          styles.paymentText
        }
      >
        {label}
      </AppText>

      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color="#2563EB"
        />
      )}
    </Pressable>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      padding: 20,
      paddingBottom: 40,
    },

    title: {
      fontSize: 28,
      marginBottom: 20,
      color: "#111827",
    },

    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
    },

    sectionTitle: {
      fontSize: 18,
      marginBottom: 14,
      color: "#0F172A",
    },

    input: {
      minHeight: 52,
      backgroundColor: "#F8FAFC",
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 14,
      color: "#111827",
      fontSize: 15,
      textAlignVertical: "top",
    },

    locationButton: {
      height: 50,
      borderRadius: 14,
      marginTop: 10,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#BFDBFE",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    locationButtonText: {
      color: "#2563EB",
      fontSize: 14,
    },

    trackingHint: {
      marginTop: 10,
      textAlign: "center",
      color: "#64748B",
      fontSize: 12,
      lineHeight: 18,
    },

    locationSelected: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      gap: 6,
    },

    locationSelectedText: {
      color: "#16A34A",
      fontSize: 13,
    },

    payment: {
      minHeight: 52,
      borderRadius: 14,
      backgroundColor: "#F8FAFC",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: "transparent",
    },

    selectedPayment: {
      borderWidth: 2,
      borderColor: "#2563EB",
      backgroundColor: "#EFF6FF",
    },

    paymentPressed: {
      opacity: 0.8,
    },

    paymentText: {
      flex: 1,
      marginLeft: 12,
      color: "#111827",
      fontSize: 15,
    },

    workerNotice: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F0FDF4",
      borderWidth: 1,
      borderColor: "#BBF7D0",
      borderRadius: 16,
      padding: 13,
      marginBottom: 16,
    },

    workerNoticeIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "#DBEAFE",
      alignItems: "center",
      justifyContent: "center",
    },

    workerNoticeContent: {
      flex: 1,
      marginHorizontal: 10,
    },

    workerNoticeTitle: {
      fontSize: 13,
      color: "#166534",
    },

    workerNoticeText: {
      marginTop: 2,
      fontSize: 11,
      color: "#64748B",
    },

    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    itemCount: {
      fontSize: 12,
      color: "#64748B",
      marginBottom: 14,
    },

    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
      gap: 12,
    },

    summaryProduct: {
      flex: 1,
      minWidth: 0,
    },

    summaryName: {
      color: "#334155",
      fontSize: 14,
    },

    summaryQuantity: {
      marginTop: 3,
      color: "#94A3B8",
      fontSize: 11,
    },

    itemPriceRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
      gap: 7,
    },

    oldItemPrice: {
      fontSize: 11,
      color: "#94A3B8",
      textDecorationLine:
        "line-through",
    },

    discountBadge: {
      fontSize: 10,
      color: "#16A34A",
    },

    summaryPriceContainer: {
      alignItems: "flex-end",
    },

    oldTotalPrice: {
      fontSize: 10,
      color: "#94A3B8",
      textDecorationLine:
        "line-through",
      marginBottom: 2,
    },

    summaryPrice: {
      color: "#0F172A",
      fontSize: 14,
    },

    /* ========================================================
       PRICE BREAKDOWN
    ======================================================== */

    breakdownCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 24,
      padding: 20,
      marginTop: 0,
    },

    breakdownRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    breakdownLabel: {
      fontSize: 14,
      color: "#64748B",
    },

    breakdownValue: {
      fontSize: 14,
      color: "#334155",
    },

    discountLabel: {
      fontSize: 14,
      color: "#16A34A",
    },

    discountValue: {
      fontSize: 14,
      color: "#16A34A",
    },

    breakdownDivider: {
      height: 1,
      backgroundColor: "#E2E8F0",
      marginVertical: 6,
    },

    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 20,
    },

    totalLabel: {
      fontSize: 16,
      color: "#334155",
    },

    savedText: {
      marginTop: 3,
      fontSize: 11,
      color: "#16A34A",
    },

    totalPrice: {
      fontSize: 26,
      color: "#2563EB",
    },

    placeButton: {
      height: 58,
      borderRadius: 18,
      backgroundColor: "#2563EB",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },

    disabledButton: {
      opacity: 0.7,
    },

    buttonPressed: {
      opacity: 0.85,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    placeText: {
      color: "#FFFFFF",
      fontSize: 17,
    },

    /* ========================================================
       LOGIN MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.52)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },

    loginModal: {
      width: "100%",
      maxWidth: 390,
      borderRadius: 22,
      backgroundColor: "#FFFFFF",
      paddingTop: 22,
      paddingHorizontal: 20,
      paddingBottom: 8,

      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 24,
      shadowOffset: {
        width: 0,
        height: 10,
      },

      elevation: 10,
    },

    loginIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },

    loginContent: {
      paddingRight: 8,
    },

    loginTitle: {
      fontSize: 20,
      lineHeight: 25,
      color: "#0F172A",
    },

    loginMessage: {
      marginTop: 7,
      fontSize: 14,
      lineHeight: 21,
      color: "#64748B",
    },

    loginActions: {
      marginTop: 20,
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 4,
    },

    modalButton: {
      minHeight: 44,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
    },

    modalButtonPressed: {
      backgroundColor: "#F8FAFC",
    },

    cancelText: {
      fontSize: 12,
      letterSpacing: 0.7,
      color: "#64748B",
    },

    loginText: {
      fontSize: 12,
      letterSpacing: 0.7,
      color: "#2563EB",
    },
  });