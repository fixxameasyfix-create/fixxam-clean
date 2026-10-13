import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  router,
} from "expo-router";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  getHomeGreeting,
} from "@/utils/getHomeGreeting";

import useCustomerNotifications from "@/hooks/customer/useCustomerNotification";

import type {
  CustomerNotification,
} from "@/hooks/customer/useCustomerNotification";

import useUserProfile from "@/hooks/auth/useUserProfile";

/* =============================================================
   HELPERS
============================================================= */

function cleanText(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function normalizeDialPhone(
  value: unknown,
): string {
  const phone =
    cleanText(
      value,
    );

  if (!phone) {
    return "";
  }

  const hasLeadingPlus =
    phone.startsWith(
      "+",
    );

  const digits =
    phone.replace(
      /\D/g,
      "",
    );

  if (
    digits.length < 10 ||
    digits.length > 15
  ) {
    return "";
  }

  return hasLeadingPlus
    ? `+${digits}`
    : digits;
}

/* =============================================================
   NOTIFICATION TYPE
============================================================= */

function getNotificationType(
  notification:
    CustomerNotification,
): string {
  return cleanText(
    notification.type,
  );
}

/* =============================================================
   CALL NOTIFICATION
============================================================= */

function isCallNotification(
  notification:
    CustomerNotification,
): boolean {
  const type =
    getNotificationType(
      notification,
    );

  return (
    type ===
      "incoming_call" ||
    type ===
      "missed_call" ||
    type ===
      "call_update"
  );
}

/* =============================================================
   SERVICE REQUEST
============================================================= */

function isServiceRequestNotification(
  notification:
    CustomerNotification,
): boolean {
  return (
    getNotificationType(
      notification,
    ) ===
    "service_request"
  );
}

/* =============================================================
   SHOP REQUEST
============================================================= */

function isShopRequestNotification(
  notification:
    CustomerNotification,
): boolean {
  return (
    getNotificationType(
      notification,
    ) ===
    "shop_request"
  );
}

/* =============================================================
   NOTIFICATION ICON
============================================================= */

function getNotificationIcon(
  notification:
    CustomerNotification,
): AppIconName {
  const type =
    getNotificationType(
      notification,
    );

  switch (type) {
    case "service_request":
    case "booking":
    case "shop_request":
      return "service";

    case "market_order":
      return "jobs";

    case "incoming_call":
    case "missed_call":
    case "call_update":
      return "phone";

    case "message":
    case "system":
    default:
      return "notifications";
  }
}

/* =============================================================
   NOTIFICATION ACTIONABLE
============================================================= */

function isNotificationActionable(
  notification:
    CustomerNotification,
): boolean {
  const type =
    getNotificationType(
      notification,
    );

  switch (type) {
    /* ========================================================
       FIXXAM VOICE
    ======================================================== */

    case "incoming_call":
    case "call_update":
      return Boolean(
        cleanText(
          notification.callId,
        ),
      );

    case "missed_call":
      return false;

    /* ========================================================
       SERVICE
    ======================================================== */

    case "service_request":
      return false;

    /* ========================================================
       SHOP
    ======================================================== */

    case "shop_request":
      return Boolean(
        cleanText(
          notification.requestId,
        ),
      );

    /* ========================================================
       BOOKING
    ======================================================== */

    case "booking":
      return Boolean(
        cleanText(
          notification.bookingId,
        ),
      );

    /* ========================================================
       MARKET / MESSAGE
    ======================================================== */

    case "market_order":
    case "message":
      return Boolean(
        cleanText(
          notification.orderId,
        ),
      );

    default:
      return false;
  }
}

/* =============================================================
   ACTION LABEL
============================================================= */

function getNotificationActionLabel(
  notification:
    CustomerNotification,
): string {
  const type =
    getNotificationType(
      notification,
    );

  switch (type) {
    case "incoming_call":
      return "Open call";

    case "call_update":
      return "Open call";

    case "booking":
      return "View booking";

    case "shop_request":
      return "View request";

    case "market_order":
      return "View order";

    case "message":
      return "View message";

    default:
      return "View update";
  }
}

/* =============================================================
   COMPONENT
============================================================= */

export default function HomeHeader() {
  const insets =
    useSafeAreaInsets();

  const greeting =
    getHomeGreeting();

  const [
    visible,
    setVisible,
  ] =
    useState(
      false,
    );

  /* ==========================================================
     CUSTOMER PROFILE
  ========================================================== */

  const {
    profile,
  } =
    useUserProfile();

  const fullName =
    useMemo(
      () => {
        return [
          cleanText(
            profile?.firstName,
          ),

          cleanText(
            profile?.otherName,
          ),

          cleanText(
            profile?.surname,
          ),
        ]
          .filter(
            Boolean,
          )
          .join(
            " ",
          );
      },
      [
        profile?.firstName,
        profile?.otherName,
        profile?.surname,
      ],
    );

  const displayName =
    fullName ||
    cleanText(
      profile?.firstName,
    ) ||
    "Customer";

  const photoUrl =
    useMemo(
      () =>
        cleanText(
          profile?.photoUrl,
        ),
      [
        profile?.photoUrl,
      ],
    );

  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  const {
    notifications,
    unreadCount,
    loading,
    markNotificationAsRead,
  } =
    useCustomerNotifications();

  const notificationLabel =
    useMemo(
      () => {
        const safeUnreadCount =
          Number.isFinite(
            unreadCount,
          )
            ? Math.max(
                0,
                Math.floor(
                  unreadCount,
                ),
              )
            : 0;

        return safeUnreadCount >
          99
          ? "99+"
          : String(
              safeUnreadCount,
            );
      },
      [
        unreadCount,
      ],
    );

  /* ==========================================================
     PROFILE
  ========================================================== */

  const handleOpenProfile =
    useCallback(
      () => {
        router.push(
          "/(customer)/profile/edit",
        );
      },
      [],
    );

  /* ==========================================================
     NOTIFICATION MODAL
  ========================================================== */

  const handleOpenNotifications =
    useCallback(
      () => {
        setVisible(
          true,
        );
      },
      [],
    );

  const handleCloseNotifications =
    useCallback(
      () => {
        setVisible(
          false,
        );
      },
      [],
    );

  /* ==========================================================
     CALL WORKER - LEGACY SERVICE REQUEST PHONE FLOW
  ========================================================== */

  const handleCallWorker =
    useCallback(
      async (
        notification:
          CustomerNotification,
      ) => {
        const workerPhone =
          normalizeDialPhone(
            notification.workerPhone,
          );

        if (!workerPhone) {
          Toast.show({
            type:
              "error",

            text1:
              "Phone unavailable",

            text2:
              "This worker did not provide a valid phone number.",
          });

          return;
        }

        if (
          !notification.read
        ) {
          try {
            await markNotificationAsRead(
              notification.notificationId,
            );
          } catch (
            error
          ) {
            console.error(
              "FIXXAM_SERVICE_REQUEST_MARK_READ_ERROR:",
              error,
            );
          }
        }

        const phoneUrl =
          `tel:${workerPhone}`;

        try {
          await Linking.openURL(
            phoneUrl,
          );

          setVisible(
            false,
          );
        } catch (
          error
        ) {
          console.error(
            "FIXXAM_CALL_WORKER_ERROR:",
            {
              workerPhone,
              phoneUrl,
              error,
            },
          );

          Toast.show({
            type:
              "error",

            text1:
              "Unable to call",

            text2:
              "Could not open your phone dialer. Please try again.",
          });
        }
      },
      [
        markNotificationAsRead,
      ],
    );

  /* ==========================================================
     OPEN FIXXAM VOICE CALL
  ========================================================== */

  const openFixxamVoiceCall =
    useCallback(
      (
        notification:
          CustomerNotification,
      ) => {
        const callId =
          cleanText(
            notification.callId,
          );

        if (!callId) {
          console.error(
            "FIXXAM_CUSTOMER_CALL_NOTIFICATION_MISSING_CALL_ID:",
            {
              notificationId:
                notification.notificationId,

              type:
                notification.type,

              action:
                notification.action,
            },
          );

          Toast.show({
            type:
              "error",

            text1:
              "Call unavailable",

            text2:
              "This Fixxam Voice notification does not contain a valid call ID.",
          });

          return;
        }

        setVisible(
          false,
        );

        /*
         * IMPORTANT:
         *
         * Do not create a new call here.
         *
         * The notification already belongs to an
         * existing Fixxam Voice call session.
         *
         * Open that exact session using callId.
         */
        router.push({
          pathname:
            "/voice-call/[callId]",

          params: {
            callId,
          },
        } as never);
      },
      [],
    );

  /* ==========================================================
     OPEN NOTIFICATION
  ========================================================== */

  const handleNotificationPress =
    useCallback(
      async (
        notification:
          CustomerNotification,
      ) => {
        /* ====================================================
           MARK READ
        ==================================================== */

        if (
          !notification.read
        ) {
          try {
            await markNotificationAsRead(
              notification.notificationId,
            );
          } catch (
            error
          ) {
            console.error(
              "FIXXAM_CUSTOMER_NOTIFICATION_READ_ERROR:",
              error,
            );

            /*
             * Read-state failure must not block
             * important navigation such as an
             * active Fixxam Voice call.
             */
            Toast.show({
              type:
                "error",

              text1:
                "Unable to update notification",

              text2:
                "The notification could not be marked as read.",
            });
          }
        }

        const type =
          getNotificationType(
            notification,
          );

        /* ====================================================
           ROUTING
        ==================================================== */

        switch (type) {
          /* ==================================================
             LIVE INCOMING CALL
          ================================================== */

          case "incoming_call": {
            openFixxamVoiceCall(
              notification,
            );

            return;
          }

          /* ==================================================
             MISSED CALL

             History only. Never recreate or reopen
             a finished call from this notification.
          ================================================== */

          case "missed_call":
            return;

          /* ==================================================
             CALL UPDATE
          ================================================== */

          case "call_update": {
            openFixxamVoiceCall(
              notification,
            );

            return;
          }

          /* ==================================================
             SERVICE REQUEST
          ================================================== */

          case "service_request":
            return;

          /* ==================================================
             SHOP REQUEST
          ================================================== */

          case "shop_request": {
            const requestId =
              cleanText(
                notification.requestId,
              );

            if (!requestId) {
              Toast.show({
                type:
                  "error",

                text1:
                  "Request unavailable",

                text2:
                  "This notification does not contain a valid Shop request ID.",
              });

              return;
            }

            setVisible(
              false,
            );

            router.push({
              pathname:
                "/(customer)/orders/shop-request/[requestId]",

              params: {
                requestId,
              },
            } as never);

            return;
          }

          /* ==================================================
             BOOKING
          ================================================== */

          case "booking": {
            const bookingId =
              cleanText(
                notification.bookingId,
              );

            if (!bookingId) {
              Toast.show({
                type:
                  "error",

                text1:
                  "Booking unavailable",

                text2:
                  "This notification does not contain a valid booking ID.",
              });

              return;
            }

            setVisible(
              false,
            );

            router.push({
              pathname:
                "/(customer)/orders/[orderId]",

              params: {
                orderId:
                  bookingId,
              },
            } as never);

            return;
          }

          /* ==================================================
             MARKET ORDER
          ================================================== */

          case "market_order": {
            const orderId =
              cleanText(
                notification.orderId,
              );

            if (!orderId) {
              Toast.show({
                type:
                  "error",

                text1:
                  "Order unavailable",

                text2:
                  "This notification does not contain a valid Market order ID.",
              });

              return;
            }

            setVisible(
              false,
            );

            router.push({
              pathname:
                "/(customer)/orders/market/[orderId]",

              params: {
                orderId,
              },
            } as never);

            return;
          }

          /* ==================================================
             MESSAGE
          ================================================== */

          case "message": {
            const orderId =
              cleanText(
                notification.orderId,
              );

            if (!orderId) {
              Toast.show({
                type:
                  "error",

                text1:
                  "Chat unavailable",

                text2:
                  "This message does not contain a valid order ID.",
              });

              return;
            }

            setVisible(
              false,
            );

            router.push({
              pathname:
                "/(customer)/orders/market/chat",

              params: {
                orderId,
              },
            } as never);

            return;
          }

          /* ==================================================
             SYSTEM
          ================================================== */

          case "system":
          default:
            return;
        }
      },
      [
        markNotificationAsRead,
        openFixxamVoiceCall,
      ],
    );

  /* ==========================================================
     RENDER NOTIFICATION
  ========================================================== */

  const renderNotification =
    useCallback(
      ({
        item,
      }: {
        item:
          CustomerNotification;
      }) => (
        <NotificationCard
          notification={
            item
          }
          onPress={
            handleNotificationPress
          }
          onCallWorker={
            handleCallWorker
          }
        />
      ),
      [
        handleCallWorker,
        handleNotificationPress,
      ],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <View
        style={
          styles.container
        }
      >
        <View
          style={
            styles.left
          }
        >
          <Pressable
            onPress={
              handleOpenProfile
            }
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            accessibilityHint="Opens your customer profile"
            hitSlop={
              8
            }
            style={({
              pressed,
            }) => [
              styles.avatarButton,

              pressed
                ? styles.avatarPressed
                : null,
            ]}
          >
            {photoUrl ? (
              <Image
                source={{
                  uri:
                    photoUrl,
                }}
                style={
                  styles.avatar
                }
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={
                  150
                }
              />
            ) : (
              <View
                style={
                  styles.avatarPlaceholder
                }
              >
                <AppIcon
                  name="profile"
                  role="customer"
                  size="lg"
                  color={
                    Colors.textSecondary
                  }
                />
              </View>
            )}
          </Pressable>

          <View
            style={
              styles.info
            }
          >
            <AppText
              variant="heading3"
              weight="bold"
              style={
                styles.name
              }
              numberOfLines={
                1
              }
            >
              {displayName}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.greeting
              }
              numberOfLines={
                1
              }
            >
              {greeting}
            </AppText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            unreadCount >
            0
              ? `Open notifications. ${notificationLabel} unread.`
              : "Open notifications"
          }
          accessibilityHint="Opens your notifications"
          onPress={
            handleOpenNotifications
          }
          style={({
            pressed,
          }) => [
            styles.notification,

            pressed
              ? styles.notificationPressed
              : null,
          ]}
        >
          <AppIcon
            name="notifications"
            role="customer"
            size="sm"
            color={
              CustomerColors.primary
            }
          />

          {unreadCount >
          0 ? (
            <View
              style={
                styles.badge
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.badgeText
                }
              >
                {notificationLabel}
              </AppText>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* =====================================================
          NOTIFICATION MODAL
      ===================================================== */}

      <Modal
        visible={
          visible
        }
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={
          handleCloseNotifications
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Pressable
            style={
              styles.backdrop
            }
            onPress={
              handleCloseNotifications
            }
            accessibilityRole="button"
            accessibilityLabel="Close notifications"
          />

          <View
            accessibilityViewIsModal
            style={[
              styles.modalSheet,

              {
                paddingBottom:
                  Math.max(
                    insets.bottom,
                    FixxamTokens.spacing.lg,
                  ),
              },
            ]}
          >
            <View
              style={
                styles.sheetHandle
              }
            />

            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalHeaderText
                }
              >
                <AppText
                  variant="heading2"
                  weight="bold"
                  style={
                    styles.modalTitle
                  }
                >
                  Notifications
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.modalSubtitle
                  }
                >
                  Service, Shop, Market, messages and Fixxam Voice updates.
                </AppText>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
                hitSlop={
                  8
                }
                onPress={
                  handleCloseNotifications
                }
                style={({
                  pressed,
                }) => [
                  styles.closeButton,

                  pressed
                    ? styles.closePressed
                    : null,
                ]}
              >
                <AppIcon
                  name="close"
                  size="sm"
                  color={
                    Colors.textPrimary
                  }
                />
              </Pressable>
            </View>

            {loading ? (
              <NotificationLoading />
            ) : notifications.length ===
              0 ? (
              <NotificationEmpty />
            ) : (
              <FlatList
                data={
                  notifications
                }
                keyExtractor={(
                  item,
                ) =>
                  item.id
                }
                renderItem={
                  renderNotification
                }
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                  styles.list
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

/* =============================================================
   LOADING
============================================================= */

const NotificationLoading =
  memo(
    function NotificationLoading() {
      return (
        <View
          style={
            styles.emptyContainer
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <ActivityIndicator
              size="small"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            Loading notifications
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            Getting your latest Fixxam updates.
          </AppText>
        </View>
      );
    },
  );

/* =============================================================
   EMPTY
============================================================= */

const NotificationEmpty =
  memo(
    function NotificationEmpty() {
      return (
        <View
          style={
            styles.emptyContainer
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <AppIcon
              name="notifications"
              size="xl"
              state="muted"
            />
          </View>

          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            No Notifications
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            Your latest service, Shop, Market, message and Fixxam Voice updates will appear here.
          </AppText>
        </View>
      );
    },
  );

/* =============================================================
   NOTIFICATION CARD
============================================================= */

type NotificationCardProps = {
  notification:
    CustomerNotification;

  onPress:
    (
      notification:
        CustomerNotification,
    ) => Promise<void>;

  onCallWorker:
    (
      notification:
        CustomerNotification,
    ) => Promise<void>;
};

const NotificationCard =
  memo(
    function NotificationCard({
      notification,
      onPress,
      onCallWorker,
    }: NotificationCardProps) {
      const [
        opening,
        setOpening,
      ] =
        useState(
          false,
        );

      const [
        calling,
        setCalling,
      ] =
        useState(
          false,
        );

      const title =
        cleanText(
          notification.title,
        ) ||
        "Fixxam update";

      const workerName =
        cleanText(
          notification.workerName,
        );

      const service =
        cleanText(
          notification.service,
        );

      const location =
        cleanText(
          notification.location,
        );

      const workerPhone =
        normalizeDialPhone(
          notification.workerPhone,
        );

      const message =
        cleanText(
          notification.message,
        );

      const serviceRequest =
        isServiceRequestNotification(
          notification,
        );

      const shopRequest =
        isShopRequestNotification(
          notification,
        );

      const actionable =
        isNotificationActionable(
          notification,
        );

      const actionLabel =
        getNotificationActionLabel(
          notification,
        );

      const icon =
        getNotificationIcon(
          notification,
        );

      const callNotification =
        isCallNotification(
          notification,
        );

      /* ======================================================
         OPEN
      ====================================================== */

      const handlePress =
        useCallback(
          async () => {
            if (opening) {
              return;
            }

            setOpening(
              true,
            );

            try {
              await onPress(
                notification,
              );
            } finally {
              setOpening(
                false,
              );
            }
          },
          [
            notification,
            onPress,
            opening,
          ],
        );

      /* ======================================================
         CALL WORKER
      ====================================================== */

      const handleCallPress =
        useCallback(
          async () => {
            if (calling) {
              return;
            }

            setCalling(
              true,
            );

            try {
              await onCallWorker(
                notification,
              );
            } finally {
              setCalling(
                false,
              );
            }
          },
          [
            calling,
            notification,
            onCallWorker,
          ],
        );

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            title
          }
          accessibilityHint={
            callNotification &&
            actionable
              ? "Marks this notification as read and opens the Fixxam Voice call."
              : actionable
                ? "Marks this notification as read and opens the related item."
                : serviceRequest &&
                    workerPhone
                  ? "Marks this notification as read. Use Call Worker to contact the worker."
                  : shopRequest
                    ? "Marks this Shop request notification as read and opens the request details."
                    : "Marks this notification as read."
          }
          disabled={
            opening
          }
          onPress={() => {
            void handlePress();
          }}
          style={({
            pressed,
          }) => [
            styles.card,

            callNotification
              ? styles.callCard
              : null,

            serviceRequest
              ? styles.serviceRequestCard
              : null,

            shopRequest
              ? styles.shopRequestCard
              : null,

            !notification.read
              ? styles.unreadCard
              : null,

            pressed &&
            !opening
              ? styles.cardPressed
              : null,

            opening
              ? styles.cardOpening
              : null,
          ]}
        >
          <View
            style={[
              styles.cardIcon,

              callNotification
                ? styles.callIcon
                : null,

              serviceRequest
                ? styles.serviceRequestIcon
                : null,

              shopRequest
                ? styles.shopRequestIcon
                : null,
            ]}
          >
            {opening ? (
              <ActivityIndicator
                size="small"
                color={
                  CustomerColors.primary
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
                  CustomerColors.primary
                }
              />
            )}
          </View>

          <View
            style={
              styles.cardContent
            }
          >
            <View
              style={
                styles.cardTitleRow
              }
            >
              <AppText
                variant="body"
                weight="bold"
                style={
                  styles.cardTitle
                }
                numberOfLines={
                  2
                }
              >
                {title}
              </AppText>

              {!notification.read ? (
                <View
                  style={
                    styles.unreadDot
                  }
                />
              ) : null}
            </View>

            {callNotification ? (
              <View
                style={
                  styles.callLabelContainer
                }
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.callLabel
                  }
                >
                  FIXXAM VOICE
                </AppText>
              </View>
            ) : null}

            {workerName ? (
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.workerName
                }
                numberOfLines={
                  1
                }
              >
                {workerName}
              </AppText>
            ) : null}

            {service ? (
              <InfoRow
                icon="service"
                value={
                  service
                }
              />
            ) : null}

            {location ? (
              <InfoRow
                icon="location"
                value={
                  location
                }
              />
            ) : null}

            {serviceRequest &&
            workerPhone ? (
              <InfoRow
                icon="phone"
                value={
                  workerPhone
                }
              />
            ) : null}

            {message ? (
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.message
                }
              >
                {message}
              </AppText>
            ) : null}

            {serviceRequest &&
            workerPhone ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Call ${workerName || "worker"}`}
                accessibilityHint={`Opens your phone dialer with ${workerPhone}`}
                disabled={
                  calling
                }
                onPress={(
                  event,
                ) => {
                  event.stopPropagation();

                  void handleCallPress();
                }}
                style={({
                  pressed,
                }) => [
                  styles.callWorkerButton,

                  pressed &&
                  !calling
                    ? styles.callWorkerButtonPressed
                    : null,

                  calling
                    ? styles.callWorkerButtonDisabled
                    : null,
                ]}
              >
                {calling ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      CustomerColors.primary
                    }
                  />
                ) : (
                  <AppIcon
                    name="phone"
                    role="customer"
                    size="xs"
                    color={
                      CustomerColors.primary
                    }
                  />
                )}

                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.callWorkerText
                  }
                >
                  {calling
                    ? "Opening..."
                    : "Call Worker"}
                </AppText>
              </Pressable>
            ) : null}

            {actionable ? (
              <View
                style={
                  styles.openRow
                }
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.openText
                  }
                >
                  {actionLabel}
                </AppText>

                <AppIcon
                  name="next"
                  role="customer"
                  size="xs"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>
            ) : null}
          </View>
        </Pressable>
      );
    },
  );

/* =============================================================
   INFO ROW
============================================================= */

type InfoRowProps = {
  icon:
    | "service"
    | "location"
    | "phone";

  value:
    string;
};

const InfoRow =
  memo(
    function InfoRow({
      icon,
      value,
    }: InfoRowProps) {
      return (
        <View
          style={
            styles.infoRow
          }
        >
          <AppIcon
            name={
              icon
            }
            size="xs"
            color={
              Colors.textSecondary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.infoValue
            }
            numberOfLines={
              2
            }
          >
            {value}
          </AppText>
        </View>
      );
    },
  );

/* =============================================================
   STYLES
============================================================= */

const styles =
  StyleSheet.create({
    container: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xxs,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    left: {
      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    avatarButton: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink:
        0,

      marginRight:
        FixxamTokens.spacing.md,

      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    avatar: {
      width:
        "100%",

      height:
        "100%",
    },

    avatarPlaceholder: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
    },

    avatarPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    info: {
      flex:
        1,

      minWidth:
        0,

      justifyContent:
        "center",
    },

    name: {
      color:
        Colors.textPrimary,
    },

    greeting: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       NOTIFICATION BUTTON
    ======================================================== */

    notification: {
      width:
        50,

      height:
        50,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    notificationPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    badge: {
      position:
        "absolute",

      top:
        3,

      right:
        3,

      minWidth:
        18,

      height:
        18,

      paddingHorizontal:
        4,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        2,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.error,
    },

    badgeText: {
      color:
        Colors.textInverse,

      lineHeight:
        10,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex:
        1,

      justifyContent:
        "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        Colors.overlayMedium,
    },

    modalSheet: {
      width:
        "100%",

      maxHeight:
        "82%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    sheetHandle: {
      width:
        42,

      height:
        4,

      alignSelf:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    modalHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    modalHeaderText: {
      flex:
        1,

      minWidth:
        0,
    },

    modalTitle: {
      color:
        Colors.textPrimary,
    },

    modalSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    closeButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginLeft:
        FixxamTokens.spacing.md,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    closePressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
    },

    list: {
      paddingBottom:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       EMPTY / LOADING
    ======================================================== */

    emptyContainer: {
      minHeight:
        300,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    emptyTitle: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth:
        280,

      lineHeight:
        20,
    },

    /* ========================================================
       NOTIFICATION CARD
    ======================================================== */

    card: {
      flexDirection:
        "row",

      padding:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.sm,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
    },

    callCard: {
      borderColor:
        Colors.border,
    },

    serviceRequestCard: {
      borderColor:
        Colors.border,
    },

    shopRequestCard: {
      borderColor:
        Colors.border,
    },

    unreadCard: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    cardPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    cardOpening: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },

    cardIcon: {
      width:
        44,

      height:
        44,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    callIcon: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    serviceRequestIcon: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    shopRequestIcon: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    cardContent: {
      flex:
        1,

      minWidth:
        0,
    },

    cardTitleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    cardTitle: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textPrimary,
    },

    unreadDot: {
      width:
        8,

      height:
        8,

      flexShrink:
        0,

      marginLeft:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    /* ========================================================
       FIXXAM VOICE LABEL
    ======================================================== */

    callLabelContainer: {
      alignSelf:
        "flex-start",

      marginBottom:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    callLabel: {
      letterSpacing:
        0.5,

      color:
        CustomerColors.primary,
    },

    workerName: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    infoRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.xs,

      gap:
        FixxamTokens.spacing.xs,
    },

    infoValue: {
      flex:
        1,

      minWidth:
        0,

      lineHeight:
        17,
    },

    message: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight:
        18,
    },

    /* ========================================================
       CALL WORKER
    ======================================================== */

    callWorkerButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      alignSelf:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    callWorkerButtonPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    callWorkerButtonDisabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },

    callWorkerText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       OPEN ACTION
    ======================================================== */

    openRow: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      alignSelf:
        "flex-start",

      gap:
        FixxamTokens.spacing.xs,
    },

    openText: {
      color:
        CustomerColors.primary,
    },
  });