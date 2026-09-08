import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

import {
  registerGlobals,
} from "@livekit/react-native";

import {
  Stack,
  router,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import {
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import {
  KeyboardProvider,
} from "react-native-keyboard-controller";

import {
  CartProvider,
} from "@/contexts/CartContext";

import {
  AuthProvider,
  useAuth,
} from "@/contexts/AuthContext";

import {
  toastConfig,
} from "@/components/ui/AppToast";

import IncomingCallProvider from "@/providers/IncomingCallProvider";

import useRegisterPushToken from "@/hooks/notifications/useRegisterPushToken";

/* ============================================================
   LIVEKIT WEBRTC GLOBALS
============================================================ */

/**
 * Must run before LiveKit/WebRTC is used anywhere
 * inside the application.
 *
 * Keep this outside React components so it runs
 * only when the app bundle initializes.
 */
registerGlobals();

/* ============================================================
   NATIVE SPLASH
============================================================ */

void SplashScreen
  .preventAutoHideAsync()
  .catch(() => {});

SplashScreen.setOptions({
  duration: 220,
  fade: true,
});

/* ============================================================
   NOTIFICATION CONFIGURATION
============================================================ */

Notifications.setNotificationHandler({
  handleNotification: async (
    notification,
  ) => {
    const data =
      notification.request
        .content.data as
        | Record<string, unknown>
        | undefined;

    const type =
      typeof data?.type ===
      "string"
        ? data.type
        : "";

    /*
     * When Fixxam is already foregrounded,
     * IncomingCallProvider owns the incoming-call UI.
     *
     * Do not show a second notification banner
     * over IncomingCallModal.
     */
    if (
      type ===
      "incoming_call"
    ) {
      return {
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: true,
        shouldSetBadge: false,
      };
    }

    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

/* ============================================================
   TYPES
============================================================ */

type NotificationRecipientRole =
  | "customer"
  | "worker";

type NotificationType =
  | "incoming_call"
  | "missed_call"
  | "service_request"
  | "booking"
  | "market_order"
  | "system"
  | string;

type NotificationData = {
  type?: NotificationType;

  action?: string;

  recipientId?: string;

  recipientRole?:
    | NotificationRecipientRole
    | string;

  callId?: string;

  bookingId?: string;

  orderId?: string;

  requestId?: string;

  workerId?: string;

  customerId?: string;

  [key: string]: unknown;
};

/* ============================================================
   ROOT LAYOUT
============================================================ */

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      style={styles.root}
    >
      <KeyboardProvider>
        <AuthProvider>
          <CartProvider>
            <BottomSheetModalProvider>
              <AppNavigation />

              <Toast
                config={toastConfig}
                position="top"
                topOffset={60}
              />
            </BottomSheetModalProvider>
          </CartProvider>
        </AuthProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

/* ============================================================
   APP NAVIGATION
============================================================ */

function AppNavigation() {
  const {
    loading: authLoading,
  } =
    useAuth();

  const [
    appReady,
    setAppReady,
  ] =
    useState(false);

  /* ==========================================================
     REGISTER PUSH TOKEN
  ========================================================== */

  useRegisterPushToken();

  /* ==========================================================
     WAIT FOR AUTH
  ========================================================== */

  useEffect(() => {
    if (
      authLoading
    ) {
      return;
    }

    setAppReady(true);
  }, [
    authLoading,
  ]);

  /* ==========================================================
     HIDE SPLASH
  ========================================================== */

  const handleLayout =
    useCallback(async () => {
      if (
        !appReady
      ) {
        return;
      }

      try {
        await SplashScreen
          .hideAsync();
      } catch (
        error
      ) {
        console.error(
          "FIXXAM_SPLASH_HIDE_ERROR:",
          error,
        );
      }
    }, [
      appReady,
    ]);

  /* ==========================================================
     NOTIFICATION NAVIGATION
  ========================================================== */

  const handleNotificationResponse =
    useCallback(
      (
        response:
          Notifications.NotificationResponse,
      ) => {
        try {
          const rawData =
            response
              .notification
              .request
              .content
              .data;

          const data =
            rawData as NotificationData;

          const type =
            data?.type;

          const role =
            data?.recipientRole;

          /* ==================================================
             VOICE CALL
          ================================================== */

          if (
            (
              type ===
                "incoming_call" ||
              type ===
                "missed_call"
            ) &&
            typeof data.callId ===
              "string"
          ) {
            const callId =
              data.callId.trim();

            if (
              callId
            ) {
              router.push({
                pathname:
                  "/voice-call/[callId]",

                params: {
                  callId,
                },
              } as never);

              return;
            }
          }

          /* ==================================================
             WORKER NOTIFICATIONS
          ================================================== */

          if (
            role ===
            "worker"
          ) {
            /* ----------------------------------------------
               MARKET ORDER
            ---------------------------------------------- */

            if (
              type ===
                "market_order" &&
              typeof data.orderId ===
                "string"
            ) {
              router.push(
                `/(worker)/orders/${encodeURIComponent(
                  data.orderId,
                )}` as never,
              );

              return;
            }

            /* ----------------------------------------------
               BOOKING
            ---------------------------------------------- */

            if (
              type ===
                "booking" &&
              typeof data.bookingId ===
                "string"
            ) {
              router.push(
                `/(worker)/bookings/${encodeURIComponent(
                  data.bookingId,
                )}` as never,
              );

              return;
            }

            /* ----------------------------------------------
               SERVICE REQUEST
            ---------------------------------------------- */

            if (
              type ===
                "service_request" &&
              typeof data.requestId ===
                "string"
            ) {
              router.push(
                `/(worker)/notifications?requestId=${encodeURIComponent(
                  data.requestId,
                )}` as never,
              );

              return;
            }

            /* ----------------------------------------------
               WORKER FALLBACK
            ---------------------------------------------- */

            router.push(
              "/(worker)/notifications" as never,
            );

            return;
          }

          /* ==================================================
             CUSTOMER NOTIFICATIONS
          ================================================== */

          if (
            role ===
            "customer"
          ) {
            /* ----------------------------------------------
               SERVICE REQUEST
            ---------------------------------------------- */

            if (
              type ===
                "service_request" &&
              typeof data.requestId ===
                "string"
            ) {
              router.push(
                `/(customer)/notifications?requestId=${encodeURIComponent(
                  data.requestId,
                )}` as never,
              );

              return;
            }

            /* ----------------------------------------------
               BOOKING
            ---------------------------------------------- */

            if (
              type ===
                "booking" &&
              typeof data.bookingId ===
                "string"
            ) {
              router.push(
                `/(customer)/bookings/${encodeURIComponent(
                  data.bookingId,
                )}` as never,
              );

              return;
            }

            /* ----------------------------------------------
               MARKET ORDER
            ---------------------------------------------- */

            if (
              type ===
                "market_order" &&
              typeof data.orderId ===
                "string"
            ) {
              router.push(
                `/(customer)/orders/${encodeURIComponent(
                  data.orderId,
                )}` as never,
              );

              return;
            }

            /* ----------------------------------------------
               CUSTOMER FALLBACK
            ---------------------------------------------- */

            router.push(
              "/(customer)/notifications" as never,
            );

            return;
          }

          /* ==================================================
             UNKNOWN / LEGACY
          ================================================== */

          console.warn(
            "FIXXAM_UNKNOWN_NOTIFICATION_ROLE:",
            {
              type:
                type ?? null,

              recipientRole:
                role ?? null,
            },
          );
        } catch (
          error
        ) {
          console.error(
            "FIXXAM_NOTIFICATION_NAVIGATION_ERROR:",
            error,
          );
        }
      },
      [],
    );

  /* ==========================================================
     NOTIFICATION TAP LISTENER
  ========================================================== */

  useEffect(() => {
    if (
      !appReady
    ) {
      return;
    }

    const responseSubscription =
      Notifications
        .addNotificationResponseReceivedListener(
          handleNotificationResponse,
        );

    return () => {
      responseSubscription.remove();
    };
  }, [
    appReady,
    handleNotificationResponse,
  ]);

  /* ==========================================================
     COLD START / INITIAL NOTIFICATION
  ========================================================== */

  useEffect(() => {
    if (
      !appReady
    ) {
      return;
    }

    let mounted =
      true;

    let navigationTimer:
      ReturnType<
        typeof setTimeout
      > | null =
      null;

    const handleInitialNotification =
      async () => {
        try {
          const response =
            await Notifications
              .getLastNotificationResponseAsync();

          if (
            !mounted ||
            !response
          ) {
            return;
          }

          navigationTimer =
            setTimeout(
              () => {
                if (
                  !mounted
                ) {
                  return;
                }

                handleNotificationResponse(
                  response,
                );

                void Notifications
                  .clearLastNotificationResponseAsync()
                  .catch(
                    (
                      error,
                    ) => {
                      console.error(
                        "FIXXAM_CLEAR_NOTIFICATION_RESPONSE_ERROR:",
                        error,
                      );
                    },
                  );
              },
              300,
            );
        } catch (
          error
        ) {
          console.error(
            "FIXXAM_INITIAL_NOTIFICATION_ERROR:",
            error,
          );
        }
      };

    void handleInitialNotification();

    return () => {
      mounted =
        false;

      if (
        navigationTimer
      ) {
        clearTimeout(
          navigationTimer,
        );
      }
    };
  }, [
    appReady,
    handleNotificationResponse,
  ]);

  /* ==========================================================
     KEEP SPLASH UNTIL READY
  ========================================================== */

  if (
    !appReady
  ) {
    return null;
  }

  /* ==========================================================
     NAVIGATION + GLOBAL INCOMING CALL
  ========================================================== */

  return (
    <View
      style={
        styles.navigation
      }
      onLayout={
        handleLayout
      }
    >
      <IncomingCallProvider>
        <Stack
          screenOptions={{
            headerShown:
              false,

            animation:
              "fade",

            contentStyle: {
              backgroundColor:
                "#FFFFFF",
            },
          }}
        />
      </IncomingCallProvider>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
    },

    navigation: {
      flex: 1,

      backgroundColor:
        "#FFFFFF",
    },
  });