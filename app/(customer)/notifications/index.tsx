import React, {
  memo,
  useCallback,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import Toast from "react-native-toast-message";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import useCustomerNotifications, {
  type CustomerNotification,
} from "@/hooks/customer/useCustomerNotification";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   CONSTANTS
============================================================ */

const FIRESTORE_BATCH_LIMIT =
  450;

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/* ============================================================
   NOTIFICATION ICON
============================================================ */

function getNotificationIcon(
  type:
    CustomerNotification["type"],
): AppIconName {
  switch (
    type
  ) {
    case "service_request":
      return "service";

    case "booking":
      return "calendar";

    case "shop_request":
      return "shop";

    case "market_order":
      return "jobs";

    case "incoming_call":
    case "missed_call":
      return "phone";

    case "message":
    case "system":
    default:
      return "notifications";
  }
}

/* ============================================================
   ACTIONABLE
============================================================ */

function isNotificationActionable(
  notification:
    CustomerNotification,
): boolean {
  switch (
    notification.type
  ) {
    case "incoming_call":
    case "missed_call":
      return Boolean(
        cleanString(
          notification.callId,
        ),
      );

    case "booking":
      return Boolean(
        cleanString(
          notification.bookingId,
        ),
      );

    case "shop_request":
      return Boolean(
        cleanString(
          notification.requestId,
        ),
      );

    case "market_order":
    case "message":
      return Boolean(
        cleanString(
          notification.orderId,
        ),
      );

    default:
      return false;
  }
}

/* ============================================================
   ACTION LABEL
============================================================ */

function getNotificationActionLabel(
  notification:
    CustomerNotification,
): string {
  switch (
    notification.type
  ) {
    case "booking":
      return "View booking";

    case "shop_request":
      return "View request";

    case "market_order":
      return "View order";

    case "message":
      return "View message";

    case "incoming_call":
      return "Open call";

    case "missed_call":
      return "View call";

    default:
      return "View update";
  }
}

/* ============================================================
   DATE
============================================================ */

function formatNotificationDate(
  createdAt:
    CustomerNotification["createdAt"],
): string {
  if (
    !createdAt
  ) {
    return "Just now";
  }

  try {
    const date =
      typeof createdAt.toDate ===
      "function"
        ? createdAt.toDate()
        : null;

    if (
      !date ||
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "Just now";
    }

    const now =
      new Date();

    const diff =
      Math.max(
        0,
        now.getTime() -
          date.getTime(),
      );

    const minute =
      60 * 1000;

    const hour =
      60 * minute;

    const day =
      24 * hour;

    if (
      diff <
      minute
    ) {
      return "Just now";
    }

    if (
      diff <
      hour
    ) {
      return `${Math.floor(
        diff /
          minute,
      )}m ago`;
    }

    if (
      diff <
      day
    ) {
      return `${Math.floor(
        diff /
          hour,
      )}h ago`;
    }

    if (
      diff <
      7 * day
    ) {
      return `${Math.floor(
        diff /
          day,
      )}d ago`;
    }

    return date.toLocaleDateString(
      undefined,
      {
        day:
          "numeric",

        month:
          "short",

        year:
          "numeric",
      },
    );
  } catch {
    return "Just now";
  }
}

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerNotificationsScreen() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
  } =
    useCustomerNotifications();

  /* ==========================================================
     MARK ONE AS READ
  ========================================================== */

  const markAsRead =
    useCallback(
      async (
        notificationId:
          string,
      ) => {
        const uid =
          auth.currentUser
            ?.uid;

        const safeId =
          cleanString(
            notificationId,
          );

        if (
          !uid ||
          !safeId
        ) {
          return;
        }

        try {
          await updateDoc(
            doc(
              db,
              "users",
              uid,
              "notifications",
              safeId,
            ),
            {
              read:
                true,
            },
          );
        } catch (
          markError
        ) {
          console.error(
            "CUSTOMER_MARK_NOTIFICATION_READ_ERROR:",
            markError,
          );

          throw markError;
        }
      },
      [],
    );

  /* ==========================================================
     MARK ALL AS READ
  ========================================================== */

  const markAllAsRead =
    useCallback(
      async () => {
        const uid =
          auth.currentUser
            ?.uid;

        if (
          !uid
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Unable to update",

            text2:
              "Please sign in again.",
          });

          return;
        }

        const unread =
          notifications.filter(
            notification =>
              !notification.read &&
              Boolean(
                cleanString(
                  notification.id,
                ),
              ),
          );

        if (
          unread.length ===
          0
        ) {
          return;
        }

        try {
          for (
            let index = 0;
            index <
            unread.length;
            index +=
              FIRESTORE_BATCH_LIMIT
          ) {
            const chunk =
              unread.slice(
                index,
                index +
                  FIRESTORE_BATCH_LIMIT,
              );

            const batch =
              writeBatch(
                db,
              );

            chunk.forEach(
              notification => {
                batch.update(
                  doc(
                    db,
                    "users",
                    uid,
                    "notifications",
                    notification.id,
                  ),
                  {
                    read:
                      true,
                  },
                );
              },
            );

            await batch.commit();
          }
        } catch (
          markError
        ) {
          console.error(
            "CUSTOMER_MARK_ALL_READ_ERROR:",
            markError,
          );

          Toast.show({
            type:
              "error",

            text1:
              "Unable to update",

            text2:
              "Some notifications could not be marked as read.",
          });
        }
      },
      [
        notifications,
      ],
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
           MARK AS READ
        ==================================================== */

        if (
          !notification.read
        ) {
          try {
            await markAsRead(
              notification.id,
            );
          } catch {
            /*
             * Navigation is still allowed.
             *
             * Mark-as-read failure should not
             * block navigation.
             */
          }
        }

        /* ====================================================
           FIXXAM VOICE
        ==================================================== */

        if (
          notification.type ===
            "incoming_call" ||
          notification.type ===
            "missed_call"
        ) {
          const callId =
            cleanString(
              notification.callId,
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

            return;
          }

          router.push({
            pathname:
              "/voice-call/[callId]",

            params: {
              callId,
            },
          } as never);

          return;
        }

        /* ====================================================
           BOOKING
        ==================================================== */

        if (
          notification.type ===
          "booking"
        ) {
          const bookingId =
            cleanString(
              notification.bookingId,
            );

          if (
            !bookingId
          ) {
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

        /* ====================================================
           SHOP REQUEST
        ==================================================== */

        if (
          notification.type ===
          "shop_request"
        ) {
          const requestId =
            cleanString(
              notification.requestId,
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

            return;
          }

          router.push({
            pathname:
              "/(customer)/orders/shop-request/[requestId]",

            params: {
              requestId,
            },
          } as never);

          return;
        }

        /* ====================================================
           MARKET ORDER
        ==================================================== */

        if (
          notification.type ===
          "market_order"
        ) {
          const orderId =
            cleanString(
              notification.orderId,
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

            return;
          }

          router.push({
            pathname:
              "/(customer)/orders/market/[orderId]",

            params: {
              orderId,
            },
          } as never);

          return;
        }

        /* ====================================================
           MESSAGE
        ==================================================== */

        if (
          notification.type ===
          "message"
        ) {
          const orderId =
            cleanString(
              notification.orderId,
            );

          if (
            !orderId
          ) {
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

          router.push({
            pathname:
              "/(customer)/orders/market/chat",

            params: {
              orderId,
            },
          } as never);

          return;
        }

        /* ====================================================
           SERVICE REQUEST
        ==================================================== */

        if (
          notification.type ===
          "service_request"
        ) {
          Toast.show({
            type:
              "info",

            text1:
              cleanString(
                notification.title,
              ) ||
              "Service update",

            text2:
              cleanString(
                notification.message,
              ) ||
              "Your service request has been updated.",
          });

          return;
        }

        /* ====================================================
           SYSTEM / LEGACY
        ==================================================== */

        Toast.show({
          type:
            "info",

          text1:
            cleanString(
              notification.title,
            ) ||
            "Fixxam",

          text2:
            cleanString(
              notification.message,
            ) ||
            "You have a new notification.",
        });
      },
      [
        markAsRead,
      ],
    );

  /* ==========================================================
     RENDER ITEM
  ========================================================== */

  const renderNotification =
    useCallback<
      ListRenderItem<CustomerNotification>
    >(
      ({
        item,
      }) => (
        <NotificationCard
          notification={
            item
          }
          onPress={() => {
            void handleNotificationPress(
              item,
            );
          }}
        />
      ),
      [
        handleNotificationPress,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item:
          CustomerNotification,
      ) =>
        item.id,
      [],
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    loading
  ) {
    return (
      <AppScreen
        role="customer"
        style={
          styles.screen
        }
      >
        <View
          style={
            styles.loadingContainer
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
            Loading notifications...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      style={
        styles.screen
      }
    >
      {/* ====================================================
          HEADER
      ==================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          hitSlop={
            8
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            role="customer"
            size="md"
            color={
              Colors.textPrimary
            }
          />
        </Pressable>

        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="heading2"
            weight="bold"
            style={
              styles.title
            }
          >
            Notifications
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Service, Market, messages and Fixxam Voice
          </AppText>
        </View>

        {unreadCount >
        0 ? (
          <View
            style={
              styles.unreadBadge
            }
            accessibilityLabel={`${unreadCount} unread notifications`}
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.unreadBadgeText
              }
            >
              {unreadCount >
              99
                ? "99+"
                : unreadCount}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* ====================================================
          MARK ALL
      ==================================================== */}

      {unreadCount >
      0 ? (
        <Pressable
          onPress={() => {
            void markAllAsRead();
          }}
          accessibilityRole="button"
          accessibilityLabel="Mark all notifications as read"
          style={({
            pressed,
          }) => [
            styles.markAllButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="check"
            role="customer"
            size="xs"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.markAllText
            }
          >
            Mark all as read
          </AppText>
        </Pressable>
      ) : null}

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error ? (
        <View
          style={
            styles.errorCard
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <AppIcon
              name="error"
              size="sm"
              color={
                Colors.error
              }
            />
          </View>

          <View
            style={
              styles.errorContent
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.errorTitle
              }
            >
              Unable to load
            </AppText>

            <AppText
              variant="caption"
              numberOfLines={
                3
              }
              style={
                styles.errorText
              }
            >
              {error}
            </AppText>
          </View>
        </View>
      ) : null}

      {/* ====================================================
          LIST
      ==================================================== */}

      <FlatList
        data={
          error
            ? []
            : notifications
        }
        keyExtractor={
          keyExtractor
        }
        renderItem={
          renderNotification
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.content,

          !error &&
          notifications.length ===
            0
            ? styles.emptyContent
            : null,
        ]}
        ListEmptyComponent={
          !error ? (
            <NotificationEmpty />
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        initialNumToRender={
          10
        }
        maxToRenderPerBatch={
          10
        }
        windowSize={
          7
        }
        removeClippedSubviews
      />
    </AppScreen>
  );
}

/* ============================================================
   NOTIFICATION CARD
============================================================ */

type NotificationCardProps = {
  notification:
    CustomerNotification;

  onPress:
    () => void;
};

const NotificationCard =
  memo(
    function NotificationCard({
      notification,
      onPress,
    }: NotificationCardProps) {
      const unread =
        !notification.read;

      const title =
        cleanString(
          notification.title,
        ) ||
        "Fixxam notification";

      const workerName =
        cleanString(
          notification.workerName,
        );

      const service =
        cleanString(
          notification.service,
        );

      const message =
        cleanString(
          notification.message,
        );

      const location =
        cleanString(
          notification.location,
        );

      const actionable =
        isNotificationActionable(
          notification,
        );

      const actionLabel =
        getNotificationActionLabel(
          notification,
        );

      return (
        <Pressable
          onPress={
            onPress
          }
          accessibilityRole="button"
          accessibilityLabel={
            title
          }
          accessibilityHint={
            actionable
              ? "Marks this notification as read and opens the related item."
              : "Marks this notification as read."
          }
          style={({
            pressed,
          }) => [
            styles.notificationCard,

            unread
              ? styles.unreadCard
              : null,

            pressed
              ? styles.pressedCard
              : null,
          ]}
        >
          {/* =================================================
              ICON
          ================================================= */}

          <View
            style={[
              styles.notificationIcon,

              unread
                ? styles.notificationIconUnread
                : null,
            ]}
          >
            <AppIcon
              name={
                getNotificationIcon(
                  notification.type,
                )
              }
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          {/* =================================================
              CONTENT
          ================================================= */}

          <View
            style={
              styles.notificationContent
            }
          >
            {/* ===============================================
                TITLE
            =============================================== */}

            <View
              style={
                styles.titleRow
              }
            >
              <AppText
                variant="body"
                weight="bold"
                numberOfLines={
                  2
                }
                style={
                  styles.notificationTitle
                }
              >
                {title}
              </AppText>

              {unread ? (
                <View
                  style={
                    styles.unreadDot
                  }
                  accessibilityLabel="Unread"
                />
              ) : null}
            </View>

            {/* ===============================================
                WORKER
            =============================================== */}

            {workerName ? (
              <DetailRow
                icon="profile"
                text={
                  workerName
                }
              />
            ) : null}

            {/* ===============================================
                SERVICE
            =============================================== */}

            {service ? (
              <DetailRow
                icon="service"
                text={
                  service
                }
              />
            ) : null}

            {/* ===============================================
                MESSAGE
            =============================================== */}

            {message ? (
              <AppText
                variant="caption"
                numberOfLines={
                  3
                }
                style={
                  styles.notificationMessage
                }
              >
                {message}
              </AppText>
            ) : null}

            {/* ===============================================
                LOCATION
            =============================================== */}

            {location ? (
              <DetailRow
                icon="location"
                text={
                  location
                }
                numberOfLines={
                  2
                }
              />
            ) : null}

            {/* ===============================================
                FOOTER
            =============================================== */}

            <View
              style={
                styles.notificationFooter
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.timeText
                }
              >
                {formatNotificationDate(
                  notification.createdAt,
                )}
              </AppText>

              {actionable ? (
                <View
                  style={
                    styles.actionContainer
                  }
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={
                      styles.actionText
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
          </View>
        </Pressable>
      );
    },
  );

/* ============================================================
   DETAIL ROW
============================================================ */

function DetailRow({
  icon,
  text,
  numberOfLines = 1,
}: {
  icon:
    AppIconName;

  text:
    string;

  numberOfLines?:
    number;
}) {
  return (
    <View
      style={
        styles.detailRow
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
        numberOfLines={
          numberOfLines
        }
        style={
          styles.detailText
        }
      >
        {text}
      </AppText>
    </View>
  );
}

/* ============================================================
   EMPTY
============================================================ */

function NotificationEmpty() {
  return (
    <View
      style={
        styles.emptyCard
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <AppIcon
          name="notifications"
          size="lg"
          state="muted"
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
          styles.emptyTitle
        }
      >
        No notifications yet
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        center
        style={
          styles.emptyText
        }
      >
        Service, Market, messages and Fixxam Voice updates will appear here.
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
      backgroundColor:
        Colors.background,
    },

    content: {
      flexGrow:
        1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    emptyContent: {
      flexGrow:
        1,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex:
        1,

      alignItems:
        "center",

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
       HEADER
    ======================================================== */

    header: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

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
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    unreadBadge: {
      minWidth:
        30,

      minHeight:
        30,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    unreadBadgeText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       MARK ALL
    ======================================================== */

    markAllButton: {
      alignSelf:
        "flex-end",

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
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

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    markAllText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorCard: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.errorSoft,
    },

    errorIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    errorContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    errorTitle: {
      color:
        Colors.error,
    },

    errorText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight:
        16,

      color:
        Colors.error,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyCard: {
      flex:
        1,

      minHeight:
        300,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
      width:
        68,

      height:
        68,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth:
        280,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       NOTIFICATION CARD
    ======================================================== */

    notificationCard: {
      marginBottom:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    unreadCard: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    notificationIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    notificationIconUnread: {
      backgroundColor:
        Colors.surface,
    },

    notificationContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       TITLE
    ======================================================== */

    titleRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    notificationTitle: {
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

      marginTop:
        FixxamTokens.spacing.xs,

      marginLeft:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    /* ========================================================
       DETAILS
    ======================================================== */

    detailRow: {
      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    detailText: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textSecondary,
    },

    notificationMessage: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        17,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    notificationFooter: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    timeText: {
      color:
        Colors.textMuted,
    },

    actionContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    actionText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       PRESS
    ======================================================== */

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

    pressedCard: {
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