import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AppState,
  type AppStateStatus,
  Image,
  StyleSheet,
  View,
} from "react-native";

import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

import { registerGlobals } from "@livekit/react-native";

import {
  Stack,
  router,
  usePathname,
  useSegments,
} from "expo-router";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

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

import { CartProvider } from "@/contexts/CartContext";

import {
  AuthProvider,
  useAuth,
} from "@/contexts/AuthContext";

import {
  ShopRequestProvider,
} from "@/contexts/ShopRequestContext";

import { db } from "@/firebase/config";

import {
  toastConfig,
} from "@/components/ui/AppToast";

import CustomerIncomingCallManager from "@/components/call/CustomerIncomingCallManager";
import WorkerIncomingCallManager from "@/components/call/WorkerIncomingCallManager";

import useRegisterPushToken from "@/hooks/notifications/useRegisterPushToken";

/* ============================================================
   INITIALIZATION
============================================================ */

registerGlobals();

void SplashScreen.preventAutoHideAsync().catch(
  () => {},
);

SplashScreen.setOptions({
  duration: 100,
  fade: true,
});

/* ============================================================
   FOREGROUND NOTIFICATION HANDLER
============================================================ */

Notifications.setNotificationHandler({
  handleNotification: async notification => {
    const rawData =
      notification.request.content.data;

    const data =
      rawData as
        | Record<string, unknown>
        | undefined;

    const type =
      typeof data?.type === "string"
        ? data.type.trim()
        : "";

    /*
     * Incoming calls are handled by the
     * dedicated call managers.
     *
     * Do not show a duplicate normal
     * notification banner.
     */
    if (
      type === "incoming_call"
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

type AppRole =
  | "customer"
  | "worker";

type UserProfile = {
  roles?: unknown;
  activeRole?: unknown;
};

type PendingNotificationResponse =
  Notifications.NotificationResponse;

const SPLASH_DURATION = 100;

/* ============================================================
   HELPERS
============================================================ */

function isRootRoute(
  pathname: string,
): boolean {
  return (
    pathname === "/" ||
    pathname === ""
  );
}

function normalizeRoles(
  value: unknown,
): AppRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter(
        (
          role,
        ): role is AppRole =>
          role === "customer" ||
          role === "worker",
      ),
    ),
  );
}

function resolveActiveRole(
  profile: UserProfile,
): AppRole | null {
  const roles =
    normalizeRoles(
      profile.roles,
    );

  const activeRole =
    profile.activeRole ===
      "customer" ||
    profile.activeRole ===
      "worker"
      ? profile.activeRole
      : null;

  if (
    activeRole &&
    roles.includes(activeRole)
  ) {
    return activeRole;
  }

  if (roles.length === 1) {
    return roles[0];
  }

  return null;
}

function isCustomerRoute(
  segments: string[],
): boolean {
  return segments.includes(
    "(customer)",
  );
}

function isWorkerRoute(
  segments: string[],
): boolean {
  return segments.includes(
    "(worker)",
  );
}

function isAuthRoute(
  segments: string[],
): boolean {
  return segments.includes(
    "(auth)",
  );
}

function isAccountSelectionRoute(
  pathname: string,
  segments: string[],
): boolean {
  return (
    pathname ===
      "/select-account" ||
    pathname ===
      "/(auth)/select-account" ||
    segments.includes(
      "select-account",
    )
  );
}

function isCustomerOnboardingRoute(
  pathname: string,
  segments: string[],
): boolean {
  const hasCustomerRegistrationChoice =
    segments.includes(
      "customer-registration-choice",
    );

  const hasCustomerSignup =
    segments.includes(
      "customer-signup",
    );

  const hasCustomerSetupComplete =
    segments.includes(
      "customer-setup-complete",
    );

  return (
    pathname.startsWith(
      "/customer-registration-choice",
    ) ||
    pathname.startsWith(
      "/customer-signup",
    ) ||
    hasCustomerRegistrationChoice ||
    hasCustomerSignup ||
    hasCustomerSetupComplete
  );
}

function isWorkerOnboardingRoute(
  pathname: string,
  segments: string[],
): boolean {
  const hasBecomeProvider =
    segments.includes(
      "become-a-provider",
    );

  const hasWorkerSegment =
    segments.includes(
      "worker",
    );

  const hasWorkerSetupComplete =
    segments.includes(
      "worker-setup-complete",
    );

  const isWorkerPath =
    pathname.startsWith(
      "/worker/",
    );

  return (
    hasBecomeProvider ||
    hasWorkerSetupComplete ||
    (
      hasWorkerSegment &&
      isWorkerPath
    )
  );
}

function isOnboardingRoute(
  pathname: string,
  segments: string[],
): boolean {
  return (
    isCustomerOnboardingRoute(
      pathname,
      segments,
    ) ||
    isWorkerOnboardingRoute(
      pathname,
      segments,
    )
  );
}

/* ============================================================
   NOTIFICATION HELPERS
============================================================ */

function cleanNotificationString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function getNotificationData(
  response:
    PendingNotificationResponse,
): Record<string, unknown> {
  const rawData =
    response.notification
      .request
      .content
      .data;

  if (
    !rawData ||
    typeof rawData !==
      "object" ||
    Array.isArray(rawData)
  ) {
    return {};
  }

  return rawData as Record<
    string,
    unknown
  >;
}

function resolveNotificationRole(
  data: Record<string, unknown>,
  fallbackRole: AppRole,
): AppRole | null {
  const recipientRole =
    cleanNotificationString(
      data.recipientRole,
    );

  if (
    recipientRole ===
      "customer" ||
    recipientRole ===
      "worker"
  ) {
    return recipientRole;
  }

  return fallbackRole;
}

function hasValidNotificationType(
  type: string,
): boolean {
  return [
    "service_request",
    "booking",
    "shop_request",
    "market_order",
    "saved_worker",
    "incoming_call",
    "missed_call",
    "call_update",
    "message",
    "system",
  ].includes(type);
}

/*
 * Extract a stable identifier for deduplication.
 *
 * Expo notification request identifiers
 * are preferred. We also use notificationId
 * from our own backend as a fallback.
 */
function getNotificationIdentifier(
  response:
    PendingNotificationResponse,
): string {
  const requestIdentifier =
    cleanNotificationString(
      response.notification
        .request
        .identifier,
    );

  if (
    requestIdentifier
  ) {
    return requestIdentifier;
  }

  const data =
    getNotificationData(
      response,
    );

  return cleanNotificationString(
    data.notificationId,
  );
}

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
          <ShopRequestProvider>
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
          </ShopRequestProvider>
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
    user,
    loading: authLoading,
  } = useAuth();

  const pathname =
    usePathname();

  const segments =
    useSegments();

  const [
    appReady,
    setAppReady,
  ] = useState(false);

  const [
    roleReady,
    setRoleReady,
  ] = useState(false);

  const [
    activeRole,
    setActiveRole,
  ] =
    useState<AppRole | null>(
      null,
    );

  const [
    userRoles,
    setUserRoles,
  ] = useState<AppRole[]>([]);

  const [
    initialRoutingDone,
    setInitialRoutingDone,
  ] = useState(false);

  const initialRoutingDoneRef =
    useRef(false);

  const [
    initialSplashVisible,
    setInitialSplashVisible,
  ] = useState(true);

  const [
    resumeSplashVisible,
    setResumeSplashVisible,
  ] = useState(false);

  const appStateRef =
    useRef<AppStateStatus>(
      AppState.currentState,
    );

  const initialSplashTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const resumeTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  /* ==========================================================
     NOTIFICATION STATE
  ========================================================== */

  const pendingNotificationResponseRef =
    useRef<
      PendingNotificationResponse | null
    >(null);

  /*
   * IMPORTANT:
   *
   * Ref changes do not cause React renders.
   *
   * This state is the signal that tells the
   * routing effect that a new notification
   * response has arrived.
   */
  const [
    notificationVersion,
    setNotificationVersion,
  ] = useState(0);

  const processedNotificationIdsRef =
    useRef<Set<string>>(
      new Set(),
    );

  const notificationNavigationInProgressRef =
    useRef(false);

  /* ==========================================================
     PUSH TOKEN
  ========================================================== */

  useRegisterPushToken();

  /* ==========================================================
     APP READY
  ========================================================== */

  useEffect(() => {
    if (authLoading) {
      setAppReady(false);
      return;
    }

    setAppReady(true);
  }, [authLoading]);

  /* ==========================================================
     INITIAL SPLASH
  ========================================================== */

  useEffect(() => {
    if (!appReady) {
      return;
    }

    if (
      initialSplashTimerRef.current
    ) {
      clearTimeout(
        initialSplashTimerRef.current,
      );
    }

    initialSplashTimerRef.current =
      setTimeout(() => {
        setInitialSplashVisible(
          false,
        );

        initialSplashTimerRef.current =
          null;
      }, SPLASH_DURATION);

    return () => {
      if (
        initialSplashTimerRef.current
      ) {
        clearTimeout(
          initialSplashTimerRef.current,
        );

        initialSplashTimerRef.current =
          null;
      }
    };
  }, [appReady]);

  /* ==========================================================
     USER ROLE LISTENER
  ========================================================== */

  useEffect(() => {
    if (authLoading) {
      setRoleReady(false);
      setActiveRole(null);
      setUserRoles([]);

      return;
    }

    if (!user) {
      setActiveRole(null);
      setUserRoles([]);
      setRoleReady(true);

      return;
    }

    setRoleReady(false);
    setActiveRole(null);
    setUserRoles([]);

    const userRef =
      doc(
        db,
        "users",
        user.uid,
      );

    const unsubscribe =
      onSnapshot(
        userRef,
        snapshot => {
          if (!snapshot.exists()) {
            setRoleReady(false);

            if (__DEV__) {
              console.warn(
                "FIXXAM_USER_PROFILE_NOT_READY:",
                user.uid,
              );
            }

            return;
          }

          const profile =
            snapshot.data() as UserProfile;

          const roles =
            normalizeRoles(
              profile.roles,
            );

          const nextActiveRole =
            resolveActiveRole(
              profile,
            );

          if (
            roles.length === 0
          ) {
            setUserRoles([]);
            setActiveRole(null);
            setRoleReady(false);

            if (__DEV__) {
              console.warn(
                "FIXXAM_WAITING_FOR_USER_ROLES:",
                {
                  userId:
                    user.uid,
                },
              );
            }

            return;
          }

          setUserRoles(roles);

          setActiveRole(
            nextActiveRole,
          );

          setRoleReady(true);

          if (__DEV__) {
            console.info(
              "FIXXAM_ROLE_RESOLVED:",
              {
                userId:
                  user.uid,
                roles,
                activeRole:
                  nextActiveRole,
              },
            );
          }
        },
        error => {
          console.error(
            "FIXXAM_ROLE_LISTENER_ERROR:",
            error,
          );

          setRoleReady(false);
        },
      );

    return unsubscribe;
  }, [
    authLoading,
    user,
  ]);

  /* ==========================================================
     ROLE ROUTING
  ========================================================== */

  useEffect(() => {
    if (
      !appReady ||
      !roleReady
    ) {
      return;
    }

    if (!user) {
      if (
        isRootRoute(pathname)
      ) {
        initialRoutingDoneRef.current =
          true;

        setInitialRoutingDone(
          true,
        );

        router.replace(
          "/(customer)/(tabs)/home" as never,
        );
      }

      return;
    }

    if (
      userRoles.length === 0
    ) {
      return;
    }

    const hasCustomerRole =
      userRoles.includes(
        "customer",
      );

    const hasWorkerRole =
      userRoles.includes(
        "worker",
      );

    const onCustomerRoute =
      isCustomerRoute(
        segments,
      );

    const onWorkerRoute =
      isWorkerRoute(
        segments,
      );

    const onAuthRoute =
      isAuthRoute(
        segments,
      );

    const onAccountSelectionRoute =
      isAccountSelectionRoute(
        pathname,
        segments,
      );

    const onCustomerOnboardingRoute =
      isCustomerOnboardingRoute(
        pathname,
        segments,
      );

    const onWorkerOnboardingRoute =
      isWorkerOnboardingRoute(
        pathname,
        segments,
      );

    const onOnboardingRoute =
      isOnboardingRoute(
        pathname,
        segments,
      );

    /* ========================================================
       WORKER ONLY
    ======================================================== */

    if (
      hasWorkerRole &&
      !hasCustomerRole
    ) {
      if (onCustomerRoute) {
        router.replace(
          "/(worker)/(tabs)/home" as never,
        );

        initialRoutingDoneRef.current =
          true;

        setInitialRoutingDone(
          true,
        );

        return;
      }

      if (
        isRootRoute(pathname) ||
        (
          onAuthRoute &&
          !onOnboardingRoute
        )
      ) {
        router.replace(
          "/(worker)/(tabs)/home" as never,
        );

        initialRoutingDoneRef.current =
          true;

        setInitialRoutingDone(
          true,
        );

        return;
      }

      initialRoutingDoneRef.current =
        true;

      setInitialRoutingDone(
        true,
      );

      return;
    }

    /* ========================================================
       CUSTOMER ONLY
    ======================================================== */

    if (
      hasCustomerRole &&
      !hasWorkerRole
    ) {
      if (onWorkerRoute) {
        if (
          !onWorkerOnboardingRoute
        ) {
          router.replace(
            "/(customer)/(tabs)/home" as never,
          );

          initialRoutingDoneRef.current =
            true;

          setInitialRoutingDone(
            true,
          );

          return;
        }
      }

      if (
        isRootRoute(pathname) ||
        (
          onAuthRoute &&
          !onOnboardingRoute
        )
      ) {
        router.replace(
          "/(customer)/(tabs)/home" as never,
        );

        initialRoutingDoneRef.current =
          true;

        setInitialRoutingDone(
          true,
        );

        return;
      }

      initialRoutingDoneRef.current =
        true;

      setInitialRoutingDone(
        true,
      );

      return;
    }

    /* ========================================================
       DUAL ROLE
    ======================================================== */

    if (
      hasCustomerRole &&
      hasWorkerRole
    ) {
      if (
        onWorkerRoute &&
        !onWorkerOnboardingRoute &&
        activeRole ===
          "customer"
      ) {
        router.replace(
          "/(customer)/(tabs)/home" as never,
        );

        initialRoutingDoneRef.current =
          true;

        setInitialRoutingDone(
          true,
        );

        return;
      }

      if (
        onCustomerRoute &&
        activeRole ===
          "worker"
      ) {
        router.replace(
          "/(worker)/(tabs)/home" as never,
        );

        initialRoutingDoneRef.current =
          true;

        setInitialRoutingDone(
          true,
        );

        return;
      }

      if (
        (
          isRootRoute(pathname) ||
          onAuthRoute
        ) &&
        !onOnboardingRoute &&
        !onAccountSelectionRoute
      ) {
        initialRoutingDoneRef.current =
          true;

        setInitialRoutingDone(
          true,
        );

        if (
          activeRole ===
          "worker"
        ) {
          router.replace(
            "/(worker)/(tabs)/home" as never,
          );

          return;
        }

        if (
          activeRole ===
          "customer"
        ) {
          router.replace(
            "/(customer)/(tabs)/home" as never,
          );

          return;
        }

        router.replace(
          "/(auth)/select-account" as never,
        );

        return;
      }

      initialRoutingDoneRef.current =
        true;

      setInitialRoutingDone(
        true,
      );

      return;
    }

    if (__DEV__) {
      console.warn(
        "FIXXAM_UNSUPPORTED_USER_ROLES:",
        {
          userId:
            user.uid,
          roles:
            userRoles,
          activeRole,
        },
      );
    }
  }, [
    activeRole,
    appReady,
    pathname,
    roleReady,
    segments,
    user,
    userRoles,
  ]);

  /* ==========================================================
     NOTIFICATION RESPONSE LISTENER
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const queueNotificationResponse =
      (
        response:
          PendingNotificationResponse,
      ) => {
        if (!mounted) {
          return;
        }

        const identifier =
          getNotificationIdentifier(
            response,
          );

        if (
          identifier &&
          processedNotificationIdsRef.current.has(
            identifier,
          )
        ) {
          return;
        }

        if (
          identifier
        ) {
          processedNotificationIdsRef.current.add(
            identifier,
          );
        }

        pendingNotificationResponseRef.current =
          response;

        /*
         * IMPORTANT:
         *
         * Force a React render so the
         * notification routing effect sees
         * the newly queued response.
         */
        setNotificationVersion(
          version =>
            version + 1,
        );
      };

    /* ========================================================
       BACKGROUND / FOREGROUND TAP
    ======================================================== */

    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        queueNotificationResponse,
      );

    /* ========================================================
       COLD START
    ======================================================== */

    void Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (
          !response ||
          !mounted
        ) {
          return;
        }

        queueNotificationResponse(
          response,
        );
      })
      .catch(error => {
        console.error(
          "FIXXAM_NOTIFICATION_COLD_START_ERROR:",
          error,
        );
      });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  /* ==========================================================
     NOTIFICATION ROUTING
  ========================================================== */

  useEffect(() => {
    if (
      !appReady ||
      !roleReady ||
      !initialRoutingDone ||
      !user ||
      !activeRole
    ) {
      return;
    }

    /*
     * notificationVersion is intentionally
     * included here.
     *
     * It wakes this effect when a notification
     * response arrives asynchronously.
     */
    if (
      notificationVersion < 0
    ) {
      return;
    }

    const response =
      pendingNotificationResponseRef.current;

    if (!response) {
      return;
    }

    if (
      notificationNavigationInProgressRef.current
    ) {
      return;
    }

    /*
     * Consume before navigation.
     */
    pendingNotificationResponseRef.current =
      null;

    notificationNavigationInProgressRef.current =
      true;

    const processNotification =
      async () => {
        let shouldClearLastResponse =
          false;

        try {
          const data =
            getNotificationData(
              response,
            );

          const type =
            cleanNotificationString(
              data.type,
            );

          const notificationContent =
            response.notification
              .request
              .content;

          const notificationTitle =
            cleanNotificationString(
              data.title,
            ) ||
            cleanNotificationString(
              notificationContent.title,
            );

          const notificationBody =
            cleanNotificationString(
              data.body,
            ) ||
            cleanNotificationString(
              notificationContent.body,
            );

          if (
            !hasValidNotificationType(
              type,
            )
          ) {
            if (__DEV__) {
              console.warn(
                "FIXXAM_INVALID_NOTIFICATION_TYPE:",
                {
                  type,
                  data,
                },
              );
            }

            shouldClearLastResponse =
              true;

            return;
          }

          const notificationRole =
            resolveNotificationRole(
              data,
              activeRole,
            );

          if (
            !notificationRole
          ) {
            shouldClearLastResponse =
              true;

            return;
          }

          /*
           * Never silently switch the user's
           * active role from a notification.
           */
          if (
            notificationRole !==
            activeRole
          ) {
            Toast.show({
              type:
                "info",

              text1:
                "Notification received",

              text2:
                `Switch to ${notificationRole} mode to open this notification.`,
            });

            shouldClearLastResponse =
              true;

            return;
          }

          /* ==================================================
             CUSTOMER
          ================================================== */

          if (
            activeRole ===
            "customer"
          ) {
            /* ------------------------------------------------
               INCOMING CALL
            ------------------------------------------------ */

            if (
              type ===
              "incoming_call"
            ) {
              const callId =
                cleanNotificationString(
                  data.callId,
                );

              if (
                !callId
              ) {
                Toast.show({
                  type:
                    "error",

                  text1:
                    "Call unavailable",

                  text2:
                    "This notification does not contain a valid call ID.",
                });

                shouldClearLastResponse =
                  true;

                return;
              }

              router.push({
                pathname:
                  "/voice-call/[callId]",

                params: {
                  callId,
                },
              } as never);

              shouldClearLastResponse =
                true;

              return;
            }

            /* ------------------------------------------------
               MISSED CALL
            ------------------------------------------------ */

            if (
              type ===
              "missed_call"
            ) {
              Toast.show({
                type:
                  "info",

                text1:
                  notificationTitle ||
                  "Missed call",

                text2:
                  notificationBody ||
                  "You missed a Fixxam Voice call.",
              });

              shouldClearLastResponse =
                true;

              return;
            }

            /* ------------------------------------------------
               BOOKING
            ------------------------------------------------ */

            if (
              type ===
              "booking"
            ) {
              const orderId =
                cleanNotificationString(
                  data.bookingId,
                ) ||
                cleanNotificationString(
                  data.orderId,
                );

              if (
                !orderId
              ) {
                Toast.show({
                  type:
                    "error",

                  text1:
                    "Booking unavailable",

                  text2:
                    "This notification does not contain a valid booking ID.",
                });

                shouldClearLastResponse =
                  true;

                return;
              }

              router.push({
                pathname:
                  "/(customer)/orders/[orderId]",

                params: {
                  orderId,
                },
              } as never);

              shouldClearLastResponse =
                true;

              return;
            }

            /* ------------------------------------------------
               SHOP REQUEST
            ------------------------------------------------ */

            if (
              type ===
              "shop_request"
            ) {
              const requestId =
                cleanNotificationString(
                  data.requestId,
                ) ||
                cleanNotificationString(
                  data.shopRequestId,
                );

              if (
                !requestId
              ) {
                Toast.show({
                  type:
                    "error",

                  text1:
                    "Shop request unavailable",

                  text2:
                    "This notification does not contain a valid request ID.",
                });

                shouldClearLastResponse =
                  true;

                return;
              }

              router.push({
                pathname:
                  "/(customer)/orders/shop-request/[requestId]",

                params: {
                  requestId,
                },
              } as never);

              shouldClearLastResponse =
                true;

              return;
            }

            /* ------------------------------------------------
               MARKET ORDER
            ------------------------------------------------ */

            if (
              type ===
              "market_order"
            ) {
              const orderId =
                cleanNotificationString(
                  data.orderId,
                );

              if (
                !orderId
              ) {
                Toast.show({
                  type:
                    "error",

                  text1:
                    "Order unavailable",

                  text2:
                    "This notification does not contain a valid Market order ID.",
                });

                shouldClearLastResponse =
                  true;

                return;
              }

              router.push({
                pathname:
                  "/(customer)/orders/market/[orderId]",

                params: {
                  orderId,
                },
              } as never);

              shouldClearLastResponse =
                true;

              return;
            }

            /* ------------------------------------------------
               MESSAGE
            ------------------------------------------------ */

            if (
              type ===
              "message"
            ) {
              const orderId =
                cleanNotificationString(
                  data.orderId,
                );

              if (
                orderId
              ) {
                router.push({
                  pathname:
                    "/(customer)/orders/market/chat",

                  params: {
                    orderId,
                  },
                } as never);

                shouldClearLastResponse =
                  true;

                return;
              }
            }

            /* ------------------------------------------------
               INFORMATIONAL
            ------------------------------------------------ */

            Toast.show({
              type:
                "info",

              text1:
                notificationTitle ||
                "Fixxam",

              text2:
                notificationBody ||
                "You have a new notification.",
            });

            shouldClearLastResponse =
              true;

            return;
          }

          /* ==================================================
             WORKER
          ================================================== */

          if (
            activeRole ===
            "worker"
          ) {
            /* ------------------------------------------------
               INCOMING CALL
            ------------------------------------------------ */

            if (
              type ===
              "incoming_call"
            ) {
              const callId =
                cleanNotificationString(
                  data.callId,
                );

              if (
                !callId
              ) {
                Toast.show({
                  type:
                    "error",

                  text1:
                    "Call unavailable",

                  text2:
                    "This notification does not contain a valid call ID.",
                });

                shouldClearLastResponse =
                  true;

                return;
              }

              router.push({
                pathname:
                  "/voice-call/[callId]",

                params: {
                  callId,
                },
              } as never);

              shouldClearLastResponse =
                true;

              return;
            }

            /* ------------------------------------------------
               MISSED CALL
            ------------------------------------------------ */

            if (
              type ===
              "missed_call"
            ) {
              Toast.show({
                type:
                  "info",

                text1:
                  notificationTitle ||
                  "Missed call",

                text2:
                  notificationBody ||
                  "You missed a Fixxam Voice call.",
              });

              shouldClearLastResponse =
                true;

              return;
            }

            /* ------------------------------------------------
               BOOKING
            ------------------------------------------------ */

            if (
              type ===
              "booking"
            ) {
              const orderId =
                cleanNotificationString(
                  data.bookingId,
                ) ||
                cleanNotificationString(
                  data.orderId,
                );

              if (
                !orderId
              ) {
                Toast.show({
                  type:
                    "error",

                  text1:
                    "Booking unavailable",

                  text2:
                    "This notification does not contain a valid booking ID.",
                });

                shouldClearLastResponse =
                  true;

                return;
              }

              router.push({
                pathname:
                  "/(worker)/orders/[orderId]",

                params: {
                  orderId,
                },
              } as never);

              shouldClearLastResponse =
                true;

              return;
            }

            /* ------------------------------------------------
               MARKET ORDER
            ------------------------------------------------ */

            if (
              type ===
              "market_order"
            ) {
              const orderId =
                cleanNotificationString(
                  data.orderId,
                );

              if (
                !orderId
              ) {
                Toast.show({
                  type:
                    "error",

                  text1:
                    "Order unavailable",

                  text2:
                    "This notification does not contain a valid Market order ID.",
                });

                shouldClearLastResponse =
                  true;

                return;
              }

              router.push({
                pathname:
                  "/(worker)/orders/[orderId]",

                params: {
                  orderId,
                },
              } as never);

              shouldClearLastResponse =
                true;

              return;
            }

            /* ------------------------------------------------
               SHOP REQUEST
            ------------------------------------------------ */

            if (
              type ===
              "shop_request"
            ) {
              const requestId =
                cleanNotificationString(
                  data.requestId,
                ) ||
                cleanNotificationString(
                  data.shopRequestId,
                );

              if (
                !requestId
              ) {
                Toast.show({
                  type:
                    "error",

                  text1:
                    "Shop request unavailable",

                  text2:
                    "This notification does not contain a valid request ID.",
                });

                shouldClearLastResponse =
                  true;

                return;
              }

              router.push({
                pathname:
                  "/(worker)/orders/shop-request/[requestId]",

                params: {
                  requestId,
                },
              } as never);

              shouldClearLastResponse =
                true;

              return;
            }

            /* ------------------------------------------------
               INFORMATIONAL
            ------------------------------------------------ */

            Toast.show({
              type:
                "info",

              text1:
                notificationTitle ||
                "Fixxam",

              text2:
                notificationBody ||
                "You have a new notification.",
            });

            shouldClearLastResponse =
              true;

            return;
          }
        } catch (error) {
          console.error(
            "FIXXAM_NOTIFICATION_ROUTING_ERROR:",
            error,
          );

          Toast.show({
            type:
              "error",

            text1:
              "Notification unavailable",

            text2:
              "We could not open this notification.",
          });

          /*
           * Clear the response after a routing
           * attempt so it cannot loop forever.
           */
          shouldClearLastResponse =
            true;
        } finally {
          if (
            shouldClearLastResponse
          ) {
            try {
              await Notifications.clearLastNotificationResponseAsync();
            } catch (clearError) {
              if (__DEV__) {
                console.warn(
                  "FIXXAM_NOTIFICATION_CLEAR_ERROR:",
                  clearError,
                );
              }
            }
          }

          notificationNavigationInProgressRef.current =
            false;
        }
      };

    void processNotification();
  }, [
    activeRole,
    appReady,
    initialRoutingDone,
    notificationVersion,
    roleReady,
    user,
  ]);

  /* ==========================================================
     APP STATE
  ========================================================== */

  useEffect(() => {
    const handleAppStateChange =
      (
        nextState: AppStateStatus,
      ) => {
        const previousState =
          appStateRef.current;

        appStateRef.current =
          nextState;

        if (
          nextState ===
            "background" ||
          nextState ===
            "inactive"
        ) {
          return;
        }

        if (
          nextState ===
            "active" &&
          (
            previousState ===
              "background" ||
            previousState ===
              "inactive"
          )
        ) {
          if (
            resumeTimerRef.current
          ) {
            clearTimeout(
              resumeTimerRef.current,
            );
          }

          setResumeSplashVisible(
            true,
          );

          resumeTimerRef.current =
            setTimeout(() => {
              setResumeSplashVisible(
                false,
              );

              resumeTimerRef.current =
                null;
            }, SPLASH_DURATION);
        }
      };

    const subscription =
      AppState.addEventListener(
        "change",
        handleAppStateChange,
      );

    return () => {
      subscription.remove();

      if (
        resumeTimerRef.current
      ) {
        clearTimeout(
          resumeTimerRef.current,
        );

        resumeTimerRef.current =
          null;
      }
    };
  }, []);

  /* ==========================================================
     SPLASH
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
     LOADING
  ========================================================== */

  if (!appReady) {
    return (
      <View
        style={
          styles.fullScreenLogo
        }
      >
        <Image
          source={require(
            "@/assets/images/fixxam-logo.png",
          )}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Fixxam"
        />
      </View>
    );
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

      {/* CUSTOMER CALL MANAGER */}

      {user &&
        roleReady &&
        initialRoutingDone &&
        activeRole ===
          "customer" && (
          <CustomerIncomingCallManager
            customerId={
              user.uid
            }
          />
        )}

      {/* WORKER CALL MANAGER */}

      {user &&
        roleReady &&
        initialRoutingDone &&
        activeRole ===
          "worker" && (
          <WorkerIncomingCallManager
            workerId={
              user.uid
            }
          />
        )}

      {/* INITIAL SPLASH */}

      {(
        !initialRoutingDone ||
        initialSplashVisible
      ) && (
        <View
          pointerEvents="none"
          style={
            styles.initialOverlay
          }
        >
          <Image
            source={require(
              "@/assets/images/fixxam-logo.png",
            )}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Fixxam"
          />
        </View>
      )}

      {/* RESUME SPLASH */}

      {resumeSplashVisible && (
        <View
          pointerEvents="none"
          style={
            styles.resumeSplash
          }
        >
          <Image
            source={require(
              "@/assets/images/fixxam-logo.png",
            )}
            style={
              styles.resumeLogo
            }
            resizeMode="contain"
            accessibilityLabel="Fixxam"
          />
        </View>
      )}
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

    fullScreenLogo: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    initialOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 9999,
      elevation: 9999,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    resumeSplash: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10000,
      elevation: 10000,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    logo: {
      width: 190,
      height: 190,
    },

    resumeLogo: {
      width: 150,
      height: 150,
    },
  });