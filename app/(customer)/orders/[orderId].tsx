import React, {
  useCallback,
  useMemo,
} from "react";

import {
  ActivityIndicator,
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
  auth,
} from "@/firebase/config";

import CustomerOrderActions from "@/components/orders/CustomerOrderActions";
import CustomerOrderHeader from "@/components/orders/CustomerOrderHeader";
import CustomerOrderOfferSection from "@/components/orders/CustomerOrderOfferSection";
import CustomerOrderRequest from "@/components/orders/CustomerOrderRequest";
import OrderExpiryTimer from "@/components/orders/OrderExpiryTimer";

import AgreedPriceCard from "@/components/orders/customer-order/agreedPriceCard";
import CustomerLiveTrackingCard from "@/components/orders/customer-order/customerLiveTrackingCard";
import ServiceConfirmationCard from "@/components/orders/customer-order/ServiceConfirmationCard";

import {
  useCustomerOrder,
} from "@/components/orders/customer-order/useCustomerOrder";

import {
  hasValidCoordinates,
  MAX_NEGOTIATION_ROUNDS,
} from "@/components/orders/customer-order/customerOrder.utils";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TOAST
============================================================ */

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

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerOrderScreen() {
  const params =
    useLocalSearchParams<{
      orderId?: string | string[];
    }>();

  /* ==========================================================
     ORDER ID
  ========================================================== */

  const resolvedOrderId =
    useMemo(() => {
      if (
        typeof params.orderId ===
        "string"
      ) {
        return params.orderId.trim();
      }

      if (
        Array.isArray(
          params.orderId,
        )
      ) {
        return (
          params.orderId[0]?.trim() ||
          ""
        );
      }

      return "";
    }, [
      params.orderId,
    ]);

  /* ==========================================================
     ORDER DATA + ACTIONS
  ========================================================== */

  const {
    booking,
    loading,
    error,

    workerLiveLocation,

    offerExpiresAt,
    orderExpired,

    callLoading,
    callAvailable,

    handleOrderExpired,
    handleAcceptOffer,
    handleDeclineOffer,
    handleCall,
    handleCancel,
    handleConfirmServiceStarted,
    handleConfirmServiceCompleted,
  } =
    useCustomerOrder(
      resolvedOrderId,
    );

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ==========================================================
     WORKER PROFILE
  ========================================================== */

  const handleWorkerProfile =
    useCallback(() => {
      if (
        !booking?.workerId
      ) {
        showErrorToast(
          "Worker unavailable",
          "Worker profile is not available.",
        );

        return;
      }

      router.push({
        pathname:
          "/(customer)/details/worker-profile/[id]",

        params: {
          id:
            booking.workerId,
        },
      } as never);
    }, [
      booking?.workerId,
    ]);

  /* ==========================================================
     ORDER MAP
  ========================================================== */

  const handleMap =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        !hasValidCoordinates(
          booking.latitude,
          booking.longitude,
        )
      ) {
        showErrorToast(
          "Location unavailable",
          "This order does not have valid map coordinates.",
        );

        return;
      }

      router.push({
        pathname:
          "/(customer)/map",

        params: {
          latitude:
            String(
              booking.latitude,
            ),

          longitude:
            String(
              booking.longitude,
            ),

          address:
            booking.address,
        },
      } as never);
    }, [
      booking,
    ]);

  /* ==========================================================
     LIVE MAP
  ========================================================== */

  const handleLiveMap =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "in-progress"
      ) {
        showInfoToast(
          "Live tracking unavailable",
          "Live tracking becomes available when the service is in progress.",
        );

        return;
      }

      if (
        !workerLiveLocation
      ) {
        showInfoToast(
          "Worker location unavailable",
          "The worker has not shared a live location yet.",
        );

        return;
      }

      router.push({
        pathname:
          "/(customer)/map",

        params: {
          latitude:
            String(
              workerLiveLocation.latitude,
            ),

          longitude:
            String(
              workerLiveLocation.longitude,
            ),

          address:
            booking.address,

          liveTracking:
            "true",

          workerId:
            booking.workerId,

          workerName:
            booking.workerName,

          orderId:
            booking.id,
        },
      } as never);
    }, [
      booking,
      workerLiveLocation,
    ]);

  /* ==========================================================
     SERVICE HELP
  ========================================================== */

  const handleServiceHelp =
    useCallback(() => {
      showInfoToast(
        "Need help?",
        "If there is a problem with the service, contact Fixxam support before confirming.",
      );
    }, []);

  /* ==========================================================
     AUTH ERROR
  ========================================================== */

  if (!auth.currentUser) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.screen
        }
      >
        <StateMessage
          icon="lock"
          title="Sign in required"
          message="Please sign in to view this order."
        />
      </AppScreen>
    );
  }

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
            Loading order...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !booking
  ) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.screen
        }
      >
        <StateMessage
          icon="error"
          iconColor={
            Colors.error
          }
          title="Order unavailable"
          message={
            error ||
            "We could not find this order."
          }
        />
      </AppScreen>
    );
  }

  /* ==========================================================
     DERIVED UI STATE
  ========================================================== */

  const hasCoordinates =
    hasValidCoordinates(
      booking.latitude,
      booking.longitude,
    );

  const agreedPrice =
    booking.status !==
      "pending" &&
    typeof booking.agreedPrice ===
      "number" &&
    Number.isFinite(
      booking.agreedPrice,
    ) &&
    booking.agreedPrice > 0
      ? booking.agreedPrice
      : null;

  const showLiveTracking =
    booking.status ===
    "in-progress";

  const showStartedConfirmation =
    booking.status ===
    "in-progress";

  const showCompletedConfirmation =
    booking.status ===
    "completed";

  const showExpiryTimer =
    offerExpiresAt !==
      null &&
    !orderExpired;

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
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <CustomerOrderHeader
          orderId={
            booking.id
          }
          status={
            booking.status
          }
          onBack={
            handleBack
          }
        />

        {/* ====================================================
            SERVICE REQUEST
        ==================================================== */}

        <CustomerOrderRequest
          workerName={
            booking.workerName
          }
          workerPhoto={
            booking.workerPhoto
          }
          workerCategory={
            booking.workerCategory
          }
          serviceName={
            booking.serviceName
          }
          serviceIcon={
            booking.serviceIcon
          }
          description={
            booking.description
          }
          photos={
            booking.photos
          }
          address={
            booking.address
          }
          hasCoordinates={
            hasCoordinates
          }
          urgent={
            booking.urgent
          }
          date={
            booking.date
          }
          time={
            booking.time
          }
          onProfile={
            handleWorkerProfile
          }
          onMap={
            handleMap
          }
        />

        {/* ====================================================
            AGREED PRICE
        ==================================================== */}

        {agreedPrice !==
        null ? (
          <AgreedPriceCard
            amount={
              agreedPrice
            }
          />
        ) : null}

        {/* ====================================================
            OFFER / NEGOTIATION
        ==================================================== */}

        <CustomerOrderOfferSection
          bookingId={
            booking.id
          }
          offerStatus={
            booking.offerStatus
          }
          offerAmount={
            booking.offerAmount
          }
          offerMessage={
            booking.offerMessage
          }
          counterOfferAmount={
            booking.counterOfferAmount
          }
          counterOfferMessage={
            booking.counterOfferMessage
          }
          counterOfferBy={
            booking.counterOfferBy
          }
          counterOfferStatus={
            booking.counterOfferStatus
          }
          offerRound={
            booking.offerRound
          }
          maxNegotiationRounds={
            MAX_NEGOTIATION_ROUNDS
          }
          workerName={
            booking.workerName
          }
          onAcceptOffer={
            handleAcceptOffer
          }
          onDeclineOffer={
            handleDeclineOffer
          }
        />

        {/* ====================================================
            OFFER EXPIRY
        ==================================================== */}

        {showExpiryTimer ? (
          <OrderExpiryTimer
            expiresAt={
              offerExpiresAt
            }
            onExpired={
              handleOrderExpired
            }
          />
        ) : null}

        {/* ====================================================
            LIVE TRACKING
        ==================================================== */}

        {showLiveTracking ? (
          <CustomerLiveTrackingCard
            workerName={
              booking.workerName
            }
            location={
              workerLiveLocation
            }
            onOpenMap={
              handleLiveMap
            }
          />
        ) : null}

        {/* ====================================================
            SERVICE STARTED
        ==================================================== */}

        {showStartedConfirmation ? (
          <ServiceConfirmationCard
            type="started"
            workerName={
              booking.workerName
            }
            confirmed={Boolean(
              booking.customerStartedConfirmedAt,
            )}
            onConfirm={
              handleConfirmServiceStarted
            }
            onHelp={
              handleServiceHelp
            }
          />
        ) : null}

        {/* ====================================================
            SERVICE COMPLETED
        ==================================================== */}

        {showCompletedConfirmation ? (
          <ServiceConfirmationCard
            type="completed"
            workerName={
              booking.workerName
            }
            confirmed={Boolean(
              booking.customerCompletedConfirmedAt,
            )}
            onConfirm={
              handleConfirmServiceCompleted
            }
            onHelp={
              handleServiceHelp
            }
          />
        ) : null}

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <CustomerOrderActions
          onCall={
            handleCall
          }
          onCancel={
            handleCancel
          }
          callDisabled={
            !callAvailable ||
            callLoading
          }
          cancelDisabled={
            booking.status !==
            "pending"
          }
        />

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   STATE MESSAGE
============================================================ */

function StateMessage({
  icon,
  iconColor = Colors.textMuted,
  title,
  message,
}: {
  icon:
    | "lock"
    | "error";

  iconColor?: string;

  title: string;

  message: string;
}) {
  return (
    <View
      style={
        styles.errorContainer
      }
    >
      <View
        style={
          styles.stateIcon
        }
      >
        <AppIcon
          name={icon}
          size="lg"
          color={
            iconColor
          }
        />
      </View>

      <AppText
        variant="heading3"
        weight="bold"
        center
        style={
          styles.errorTitle
        }
      >
        {title}
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.errorText
        }
      >
        {message}
      </AppText>
    </View>
  );
}

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

    scrollContent: {
      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    bottomSpace: {
      height:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    center: {
      flex: 1,

      minHeight: 500,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems: "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ERROR / AUTH
    ======================================================== */

    errorContainer: {
      flex: 1,

      minHeight: 500,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems: "center",

      justifyContent:
        "center",
    },

    stateIcon: {
      width: 72,

      height: 72,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    errorTitle: {
      color:
        Colors.textPrimary,
    },

    errorText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });