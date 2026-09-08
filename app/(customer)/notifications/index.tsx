import React, {
  memo,
  useCallback,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
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
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getNotificationIcon(
  type:
    CustomerNotification["type"],
): AppIconName {
  switch (type) {
    case "service_request":
      return "service";

    case "booking":
      return "calendar";

    case "system":
    default:
      return "notifications";
  }
}

function formatNotificationDate(
  createdAt:
    CustomerNotification["createdAt"],
): string {
  if (!createdAt) {
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

    if (diff < minute) {
      return "Just now";
    }

    if (diff < hour) {
      return `${Math.floor(
        diff / minute,
      )}m ago`;
    }

    if (diff < day) {
      return `${Math.floor(
        diff / hour,
      )}h ago`;
    }

    if (diff < 7 * day) {
      return `${Math.floor(
        diff / day,
      )}d ago`;
    }

    return date.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
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
        notificationId: string,
      ) => {
        const uid =
          auth.currentUser?.uid;

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
              read: true,
            },
          );
        } catch (markError) {
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
          auth.currentUser?.uid;

        if (!uid) {
          Toast.show({
            type: "error",
            text1:
              "Unable to update",
            text2:
              "Please sign in again.",
          });

          return;
        }

        const unread =
          notifications.filter(
            (
              notification,
            ) =>
              !notification.read &&
              cleanString(
                notification.id,
              ),
          );

        if (
          unread.length === 0
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
              writeBatch(db);

            chunk.forEach(
              (
                notification,
              ) => {
                batch.update(
                  doc(
                    db,
                    "users",
                    uid,
                    "notifications",
                    notification.id,
                  ),
                  {
                    read: true,
                  },
                );
              },
            );

            await batch.commit();
          }
        } catch (markError) {
          console.error(
            "CUSTOMER_MARK_ALL_READ_ERROR:",
            markError,
          );

          Toast.show({
            type: "error",
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
     CALL WORKER
  ========================================================== */

  const handleCallWorker =
    useCallback(
      async (
        notification:
          CustomerNotification,
      ) => {
        const phone =
          cleanString(
            notification.workerPhone,
          );

        if (!phone) {
          Toast.show({
            type: "error",
            text1:
              "Phone unavailable",
            text2:
              "This worker does not have a phone number available.",
          });

          return;
        }

        const safePhone =
          phone.replace(
            /[^+\d]/g,
            "",
          );

        if (!safePhone) {
          Toast.show({
            type: "error",
            text1:
              "Invalid phone number",
            text2:
              "This worker's phone number is unavailable.",
          });

          return;
        }

        try {
          const phoneUrl =
            `tel:${safePhone}`;

          const supported =
            await Linking.canOpenURL(
              phoneUrl,
            );

          if (!supported) {
            Toast.show({
              type: "error",
              text1:
                "Calling unavailable",
              text2:
                "Calling is not available on this device.",
            });

            return;
          }

          await Linking.openURL(
            phoneUrl,
          );
        } catch (callError) {
          console.error(
            "CUSTOMER_CALL_WORKER_ERROR:",
            callError,
          );

          Toast.show({
            type: "error",
            text1:
              "Calling unavailable",
            text2:
              "Please try again later.",
          });
        }
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
        if (
          !notification.read
        ) {
          try {
            await markAsRead(
              notification.id,
            );
          } catch {
            /*
             * Do not block opening the
             * notification if marking
             * as read fails.
             */
          }
        }

        /* ====================================================
           SERVICE REQUEST
        ==================================================== */

        if (
          notification.type ===
          "service_request"
        ) {
          const worker =
            cleanString(
              notification.workerName,
            ) ||
            "Fixxam Worker";

          const service =
            cleanString(
              notification.service,
            ) ||
            "Service request";

          const location =
            cleanString(
              notification.location,
            ) ||
            "Location unavailable";

          Alert.alert(
            worker,
            `${service}\n\n${location}`,
            [
              {
                text: "Close",
                style: "cancel",
              },

              ...(cleanString(
                notification.workerPhone,
              )
                ? [
                    {
                      text:
                        "Call Worker",

                      onPress: () => {
                        void handleCallWorker(
                          notification,
                        );
                      },
                    },
                  ]
                : []),
            ],
          );

          return;
        }

        /* ====================================================
           BOOKING
        ==================================================== */

        if (
          notification.type ===
          "booking"
        ) {
          Toast.show({
            type: "info",

            text1:
              cleanString(
                notification.title,
              ) ||
              "Booking Update",

            text2:
              cleanString(
                notification.message,
              ) ||
              "Your booking has been updated.",
          });

          return;
        }

        /* ====================================================
           SYSTEM
        ==================================================== */

        Toast.show({
          type: "info",

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
        handleCallWorker,
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
          onPress={() =>
            handleNotificationPress(
              item,
            )
          }
          onCall={() =>
            handleCallWorker(
              item,
            )
          }
        />
      ),
      [
        handleCallWorker,
        handleNotificationPress,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item:
          CustomerNotification,
      ) => item.id,
      [],
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
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
      style={styles.screen}
    >
      {/* ====================================================
          HEADER
      ==================================================== */}

      <View
        style={styles.header}
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          hitSlop={8}
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
            style={styles.title}
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
            Stay updated with Fixxam
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
          onPress={
            markAllAsRead
          }
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
              numberOfLines={3}
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
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
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

  onPress: () => void;

  onCall: () => void;
};

const NotificationCard =
  memo(
    function NotificationCard({
      notification,
      onPress,
      onCall,
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

      const hasPhone =
        Boolean(
          cleanString(
            notification.workerPhone,
          ),
        );

      return (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={
            title
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
          {/* ICON */}

          <View
            style={[
              styles.notificationIcon,

              unread
                ? styles.notificationIconUnread
                : null,
            ]}
          >
            <AppIcon
              name={getNotificationIcon(
                notification.type,
              )}
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          {/* CONTENT */}

          <View
            style={
              styles.notificationContent
            }
          >
            {/* TITLE */}

            <View
              style={
                styles.titleRow
              }
            >
              <AppText
                variant="body"
                weight="bold"
                numberOfLines={2}
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

            {/* WORKER */}

            {workerName ? (
              <DetailRow
                icon="profile"
                text={
                  workerName
                }
              />
            ) : null}

            {/* SERVICE */}

            {service ? (
              <DetailRow
                icon="service"
                text={
                  service
                }
              />
            ) : null}

            {/* MESSAGE */}

            {message ? (
              <AppText
                variant="caption"
                numberOfLines={3}
                style={
                  styles.notificationMessage
                }
              >
                {message}
              </AppText>
            ) : null}

            {/* LOCATION */}

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

            {/* FOOTER */}

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

              {hasPhone ? (
                <Pressable
                  onPress={(
                    event,
                  ) => {
                    event.stopPropagation();

                    onCall();
                  }}
                  hitSlop={5}
                  accessibilityRole="button"
                  accessibilityLabel="Call worker"
                  style={({
                    pressed,
                  }) => [
                    styles.callButton,

                    pressed
                      ? styles.callButtonPressed
                      : null,
                  ]}
                >
                  <AppIcon
                    name="phone"
                    role="customer"
                    size="xs"
                    color={
                      Colors.textInverse
                    }
                  />

                  <AppText
                    variant="caption"
                    weight="bold"
                    style={
                      styles.callButtonText
                    }
                  >
                    Call
                  </AppText>
                </Pressable>
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
  icon: AppIconName;

  text: string;

  numberOfLines?: number;
}) {
  return (
    <View
      style={
        styles.detailRow
      }
    >
      <AppIcon
        name={icon}
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
        New Fixxam updates and service requests will appear here.
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
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    emptyContent: {
      flexGrow: 1,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,

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
       HEADER
    ======================================================== */

    header: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,

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
      minWidth: 30,

      minHeight: 30,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems: "center",

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

      flexDirection: "row",

      alignItems: "center",

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

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.errorSoft,
    },

    errorIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    errorContent: {
      flex: 1,

      minWidth: 0,

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

      lineHeight: 16,

      color:
        Colors.error,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyCard: {
      flex: 1,

      minHeight: 300,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems: "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
      width: 68,

      height: 68,

      alignItems: "center",

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
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

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

      flexDirection: "row",

      borderWidth: 1,

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
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

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
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       TITLE
    ======================================================== */

    titleRow: {
      flexDirection: "row",

      alignItems:
        "flex-start",
    },

    notificationTitle: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textPrimary,
    },

    unreadDot: {
      width: 8,

      height: 8,

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

      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    detailText: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textSecondary,
    },

    notificationMessage: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    notificationFooter: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    timeText: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       CALL
    ======================================================== */

    callButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    callButtonPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    callButtonText: {
      color:
        Colors.textInverse,
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