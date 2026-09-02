import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

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
  View,
  StyleSheet,
} from "react-native";

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

import useRegisterPushToken from "@/hooks/notifications/useRegisterPushToken";

/* ============================================================
   NATIVE SPLASH
============================================================ */

SplashScreen.preventAutoHideAsync().catch(
  () => {},
);

SplashScreen.setOptions({
  duration: 220,
  fade: true,
});

/* ============================================================
   NOTIFICATION CONFIGURATION
============================================================ */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/* ============================================================
   TYPES
============================================================ */

type NotificationData = {
  type?:
    | "service_request"
    | "booking"
    | "market_order"
    | "system"
    | string;

  action?: string;

  bookingId?: string;

  orderId?: string;

  requestId?: string;

  workerId?: string;

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
  } = useAuth();

  const [
    appReady,
    setAppReady,
  ] = useState(false);

  /* ==========================================================
     REGISTER PUSH TOKEN
  ========================================================== */

  useRegisterPushToken();

  /* ==========================================================
     WAIT FOR AUTH
  ========================================================== */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    setAppReady(true);
  }, [authLoading]);

  /* ==========================================================
     HIDE SPLASH
  ========================================================== */

  const handleLayout =
    useCallback(async () => {
      if (!appReady) {
        return;
      }

      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error(
          "FIXXAM_SPLASH_HIDE_ERROR:",
          error,
        );
      }
    }, [appReady]);

  /* ==========================================================
     NOTIFICATION NAVIGATION
  ========================================================== */

  const handleNotificationResponse =
    useCallback(
      (
        response: Notifications.NotificationResponse,
      ) => {
        try {
          const rawData =
            response.notification.request.content
              .data;

          const data =
            rawData as NotificationData;

          const type = data?.type;

          /* --------------------------------------------------
             SERVICE REQUEST
          -------------------------------------------------- */

          if (
            type === "service_request" &&
            typeof data.requestId === "string"
          ) {
            router.push(
              `/(customer)/notifications?requestId=${encodeURIComponent(
                data.requestId,
              )}` as never,
            );

            return;
          }

          /* --------------------------------------------------
             BOOKING
          -------------------------------------------------- */

          if (
            type === "booking" &&
            typeof data.bookingId === "string"
          ) {
            router.push(
              `/(customer)/bookings/${encodeURIComponent(
                data.bookingId,
              )}` as never,
            );

            return;
          }

          /* --------------------------------------------------
             MARKET ORDER
          -------------------------------------------------- */

          if (
            type === "market_order" &&
            typeof data.orderId === "string"
          ) {
            router.push(
              `/(customer)/orders/${encodeURIComponent(
                data.orderId,
              )}` as never,
            );

            return;
          }

          /* --------------------------------------------------
             SYSTEM / UNKNOWN
          -------------------------------------------------- */

          router.push(
            "/(customer)/notifications" as never,
          );
        } catch (error) {
          console.error(
            "FIXXAM_NOTIFICATION_NAVIGATION_ERROR:",
            error,
          );

          try {
            router.push(
              "/(customer)/notifications" as never,
            );
          } catch (navigationError) {
            console.error(
              "FIXXAM_NOTIFICATION_FALLBACK_ERROR:",
              navigationError,
            );
          }
        }
      },
      [],
    );

  /* ==========================================================
     NOTIFICATION TAP LISTENER
  ========================================================== */

  useEffect(() => {
    if (!appReady) {
      return;
    }

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
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
     HANDLE NOTIFICATION THAT OPENED THE APP
  ========================================================== */

  useEffect(() => {
    if (!appReady) {
      return;
    }

    let mounted = true;

    const handleInitialNotification =
      async () => {
        try {
          const response =
            await Notifications.getLastNotificationResponseAsync();

          if (!mounted || !response) {
            return;
          }

          setTimeout(() => {
            if (!mounted) {
              return;
            }

            handleNotificationResponse(
              response,
            );

            /**
             * Prevent the same notification from
             * being processed again on a later mount.
             */
            void Notifications.clearLastNotificationResponseAsync().catch(
              (error) => {
                console.error(
                  "FIXXAM_CLEAR_NOTIFICATION_RESPONSE_ERROR:",
                  error,
                );
              },
            );
          }, 300);
        } catch (error) {
          console.error(
            "FIXXAM_INITIAL_NOTIFICATION_ERROR:",
            error,
          );
        }
      };

    void handleInitialNotification();

    return () => {
      mounted = false;
    };
  }, [
    appReady,
    handleNotificationResponse,
  ]);

  /* ==========================================================
     KEEP NATIVE SPLASH
  ========================================================== */

  if (!appReady) {
    return null;
  }

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  return (
    <View
      style={styles.navigation}
      onLayout={handleLayout}
    >
      <Stack
        screenOptions={{
          headerShown: false,

          animation: "fade",

          contentStyle: {
            backgroundColor:
              "#FFFFFF",
          },
        }}
      />
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