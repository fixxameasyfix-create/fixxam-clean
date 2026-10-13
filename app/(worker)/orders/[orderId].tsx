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
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import WorkerOrderHeader from "@/components/orders/WorkerOrderHeader";
import WorkerOrderDetailsContent from "@/components/orders/WorkerOrderDetailsContent";
import WorkerOrderResponseSection from "@/components/orders/WorkerOrderResponseSection";

import useWorkerOrderDetails from "@/hooks/orders/useWorkerOrderDetails";

import {
  useWorkerOrderActions,
} from "@/hooks/orders/useWorkerOrderActions";

import useWorkerLiveLocation from "@/hooks/orders/useWorkerLiveLocation";

/* ==============================================================
   TYPES
============================================================== */

type Params = {
  orderId?: string | string[];
};

type CoordinateLike = {
  latitude?: number | null;
  longitude?: number | null;
};

/* ==============================================================
   HELPERS
============================================================== */

function resolveParam(
  value: Params["orderId"],
): string {
  if (
    typeof value ===
    "string"
  ) {
    return value.trim();
  }

  return (
    value?.[0]?.trim() ??
    ""
  );
}

function isValidCoordinate(
  value: unknown,
): value is CoordinateLike {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return false;
  }

  const location =
    value as CoordinateLike;

  return (
    typeof location.latitude ===
      "number" &&
    Number.isFinite(
      location.latitude,
    ) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    typeof location.longitude ===
      "number" &&
    Number.isFinite(
      location.longitude,
    ) &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

function showToast(
  type:
    | "info"
    | "error",
  title: string,
  message: string,
): void {
  Toast.show({
    type,
    text1: title,
    text2: message,
  });
}

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerOrderDetailsScreen() {
  const navigation =
    useNavigation();

  const params =
    useLocalSearchParams<Params>();

  /* ============================================================
     HIDE WORKER TABS
  ============================================================ */

  useFocusEffect(
    useCallback(() => {
      const tabs =
        navigation.getParent();

      tabs?.setOptions({
        tabBarStyle: {
          display: "none",
        },
      });

      return () => {
        tabs?.setOptions({
          tabBarStyle:
            undefined,
        });
      };
    }, [
      navigation,
    ]),
  );

  /* ============================================================
     ORDER ID
  ============================================================ */

  const orderId =
    resolveParam(
      params.orderId,
    );

  /* ============================================================
     ORDER
  ============================================================ */

  const {
    authReady,
    workerId,
    booking,
    loading,
    error,
    hasCustomerCounter,
    offerState,
    canDeclineRequest,
  } =
    useWorkerOrderDetails(
      orderId,
    );

  /* ============================================================
     ACTIONS
  ============================================================ */

const {
    offerActionLoading,
    handleBack,
    handleCustomerProfile,
    handleViewLocation,
    handleCallCustomer,
    handleSendOffer,
    handleDecline,
    handleAcceptCounterOffer,
    handleCounterCounterOffer,
    handleDeclineCounterOffer,
    handleStartService,
    handleCompleteService,

    // Cancellation modal
    cancellationModalVisible,
    cancellationLoading,
    closeCancellationModal,
    handleConfirmDecline,
  } = useWorkerOrderActions({
    booking,
    workerId,
  });

  /* ============================================================
     WORKER
  ============================================================ */

  const resolvedWorkerId =
    typeof workerId ===
      "string"
      ? workerId.trim()
      : "";

  /* ============================================================
     WORKER TRACKING
  ============================================================ */

  const workerTravelsToCustomer =
    booking?.fulfillmentMode ===
    "worker_visits_customer";

 const trackingActive =
  booking?.status === "accepted" ||
  booking?.status === "awaiting_start_confirmation" ||
  booking?.status === "in-progress" ||
  booking?.status === "awaiting_completion_confirmation";

  const shouldShareLiveLocation =
    Boolean(
      booking &&
      resolvedWorkerId &&
      workerTravelsToCustomer &&
      trackingActive,
    );

  const {
    state:
      workerLiveLocationState,

    error:
      workerLiveLocationError,

    isTracking:
      workerLiveLocationTracking,
  } =
    useWorkerLiveLocation({
      orderId:
        booking?.id?.trim() ||
        orderId,

      workerId:
        resolvedWorkerId,

      bookingWorkerId:
        booking?.workerId,

      enabled:
        shouldShareLiveLocation,
    });

  /* ============================================================
     CUSTOMER LIVE LOCATION
  ============================================================ */

  const customerLiveLocation =
    useMemo(() => {
      if (!booking) {
        return null;
      }

      const source =
        (
          booking as typeof booking & {
            customerLiveLocation?:
              | CoordinateLike
              | null;
          }
        )
          .customerLiveLocation;

      return isValidCoordinate(
        source,
      )
        ? source
        : null;
    }, [
      booking,
    ]);

  const customerLiveLocationAvailable =
    Boolean(
      workerTravelsToCustomer &&
      trackingActive &&
      customerLiveLocation,
    );

  /* ============================================================
     TRACK CUSTOMER
  ============================================================ */

  const handleTrackCustomer =
    useCallback(() => {
      if (!booking) {
        showToast(
          "error",
          "Order unavailable",
          "This order could not be loaded for live tracking.",
        );

        return;
      }

      if (
        booking.fulfillmentMode !==
        "worker_visits_customer"
      ) {
        showToast(
          "info",
          "Live tracking not required",
          "Customer live tracking is only available when you are travelling to the customer.",
        );

        return;
      }

      const active =
        booking.status ===
          "accepted" ||
        booking.status ===
          "in-progress";

      if (!active) {
        showToast(
          "info",
          "Live tracking unavailable",
          "Live tracking becomes available after the offer is accepted.",
        );

        return;
      }

      if (!customerLiveLocation) {
        const name =
          booking.customerName?.trim() ||
          "Customer";

        showToast(
          "info",
          "Waiting for customer location",
          `${name} has not started sharing a live location yet.`,
        );

        return;
      }

      const currentOrderId =
        booking.id?.trim() ||
        "";

      if (!currentOrderId) {
        showToast(
          "error",
          "Order unavailable",
          "This order could not be identified for live tracking.",
        );

        return;
      }

      const customerId =
        booking.customerId?.trim() ||
        "";

      if (!customerId) {
        showToast(
          "error",
          "Customer unavailable",
          "This customer could not be identified for live tracking.",
        );

        return;
      }

      router.push({
        pathname:
          "/(worker)/map",

        params: {
          orderId:
            currentOrderId,

          mode:
            "live",

          tracking:
            "customer",

          fulfillmentMode:
            booking.fulfillmentMode,

          customerId,

          customerName:
            booking.customerName?.trim() ||
            "Customer",
        },
      } as never);
    }, [
      booking,
      customerLiveLocation,
    ]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    !authReady ||
    loading
  ) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.centerState
          }
        >
          <View
            style={
              styles.stateIcon
            }
          >
            <ActivityIndicator
              size="small"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            center
            style={
              styles.stateText
            }
          >
            Loading order...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     SIGNED OUT
  ============================================================ */

  if (!workerId) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.screen
        }
      >
        <EmptyState
          icon="profile"
          title="Sign in required"
          description="Please sign in to view this order."
        />
      </AppScreen>
    );
  }

  /* ============================================================
     ERROR / NOT FOUND
  ============================================================ */

  if (
    error ||
    !booking
  ) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.errorPage
          }
        >
          <WorkerOrderHeader
            orderId={
              orderId
            }
            status="pending"
            onBack={
              handleBack
            }
          />

          <EmptyState
            icon="file"
            title="Order unavailable"
            description={
              error ||
              "We could not find this order."
            }
          />
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     RESPONSE DATA
  ============================================================ */

  const canCallCustomer =
    Boolean(
      resolvedWorkerId &&
      booking.customerId?.trim(),
    );

  const counterAmount =
    hasCustomerCounter
      ? booking.counterOfferAmount
      : null;

  const counterMessage =
    hasCustomerCounter
      ? booking.counterOfferMessage
      : null;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AppScreen
      role="worker"
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        style={
          styles.scroll
        }
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <WorkerOrderHeader
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

        <View
          style={
            styles.content
          }
        >
          <WorkerOrderDetailsContent
            booking={
              booking
            }
            onCustomerPress={
              handleCustomerProfile
            }
            onLocationPress={
              handleViewLocation
            }
            onTrackCustomerPress={
              handleTrackCustomer
            }
            customerLiveLocationAvailable={
              customerLiveLocationAvailable
            }
            workerLiveLocationState={
              workerLiveLocationState
            }
            workerLiveLocationTracking={
              workerLiveLocationTracking
            }
            workerLiveLocationError={
              workerLiveLocationError
            }
          />


          <WorkerOrderResponseSection
    status={booking.status}
    offerState={offerState}
    offerAmount={booking.offerAmount}
    offerMessage={booking.offerMessage}
    counterOfferAmount={counterAmount}
    counterOfferMessage={counterMessage}
    hasCustomerCounter={hasCustomerCounter}
    canCallCustomer={canCallCustomer}
    canDeclineRequest={canDeclineRequest}
    loading={offerActionLoading}

    // Cancellation modal
    declineModalVisible={cancellationModalVisible}
    declineLoading={cancellationLoading}
    onCloseDeclineModal={closeCancellationModal}
    onConfirmDecline={handleConfirmDecline}

    onSendOffer={handleSendOffer}
    onAcceptCounter={handleAcceptCounterOffer}
    onCounter={handleCounterCounterOffer}
    onDeclineCounter={handleDeclineCounterOffer}
    onCall={handleCallCustomer}
    onDecline={handleDecline}
    onStartService={handleStartService}
    onCompleteService={handleCompleteService}
  />
          
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* ==============================================================
   EMPTY STATE
============================================================== */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: AppIconName;
  title: string;
  description: string;
}) {
  return (
    <View
      style={
        styles.empty
      }
    >
      <View
        style={
          styles.stateIcon
        }
      >
        <AppIcon
          name={
            icon
          }
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
        {title}
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.emptyText
        }
      >
        {description}
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      width: "100%",
      padding: 0,
      backgroundColor:
        Colors.background,
    },

    scroll: {
      flex: 1,
      width: "100%",
    },

    scrollContent: {
      width: "100%",
      paddingBottom:
        FixxamTokens.spacing.lg,
    },

    content: {
      width: "100%",
      paddingHorizontal:
        FixxamTokens.spacing.md,
      paddingTop:
        FixxamTokens.spacing.sm,
      paddingBottom:
        FixxamTokens.spacing.md,
    },

    centerState: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    stateIcon: {
      width: 44,
      height: 44,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        FixxamTokens.radius.full,
      backgroundColor:
        WorkerColors.primarySoft,
    },

    stateText: {
      marginTop:
        FixxamTokens.spacing.sm,
      color:
        Colors.textSecondary,
    },

    errorPage: {
      flex: 1,
      width: "100%",
    },

    empty: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal:
        FixxamTokens.spacing.xl,
      paddingVertical:
        FixxamTokens.spacing.xl,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,
      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 300,
      marginTop:
        FixxamTokens.spacing.xs,
      lineHeight: 19,
      color:
        Colors.textSecondary,
    },
  });