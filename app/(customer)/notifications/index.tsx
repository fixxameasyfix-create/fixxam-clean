import React, {
  useCallback,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import useCustomerNotifications, {
  CustomerNotification,
} from "@/hooks/customer/useCustomerNotification";

/* ============================================================
   CUSTOMER NOTIFICATIONS
============================================================ */

export default function CustomerNotificationsScreen() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
  } = useCustomerNotifications();

  /* ==========================================================
     MARK AS READ
  ========================================================== */

  const markAsRead = useCallback(
    async (
      notificationId: string,
    ) => {
      const uid =
        auth.currentUser?.uid;

      if (!uid || !notificationId) {
        return;
      }

      try {
        await updateDoc(
          doc(
            db,
            "users",
            uid,
            "notifications",
            notificationId,
          ),
          {
            read: true,
          },
        );
      } catch (error) {
        console.error(
          "CUSTOMER_MARK_NOTIFICATION_READ_ERROR:",
          error,
        );
      }
    },
    [],
  );

  /* ==========================================================
     MARK ALL AS READ
  ========================================================== */

  const markAllAsRead = useCallback(
    async () => {
      const unread =
        notifications.filter(
          (notification) =>
            !notification.read,
        );

      if (unread.length === 0) {
        return;
      }

      try {
        await Promise.all(
          unread.map(
            (notification) =>
              markAsRead(
                notification.id,
              ),
          ),
        );
      } catch (error) {
        console.error(
          "CUSTOMER_MARK_ALL_READ_ERROR:",
          error,
        );

        Alert.alert(
          "Unable to update",
          "Some notifications could not be marked as read.",
        );
      }
    },
    [
      markAsRead,
      notifications,
    ],
  );

  /* ==========================================================
     CALL WORKER
  ========================================================== */

  const handleCallWorker =
    useCallback(
      async (
        notification: CustomerNotification,
      ) => {
        const phone =
          notification.workerPhone?.trim();

        if (!phone) {
          Alert.alert(
            "Phone unavailable",
            "This worker does not have a phone number available.",
          );

          return;
        }

        try {
          const phoneUrl =
            `tel:${phone}`;

          const supported =
            await Linking.canOpenURL(
              phoneUrl,
            );

          if (!supported) {
            Alert.alert(
              "Calling unavailable",
              "Calling is not available on this device.",
            );

            return;
          }

          await Linking.openURL(
            phoneUrl,
          );
        } catch (error) {
          console.error(
            "CUSTOMER_CALL_WORKER_ERROR:",
            error,
          );

          Alert.alert(
            "Calling unavailable",
            "Calling is not available on this device.",
          );
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
        notification: CustomerNotification,
      ) => {
        if (!notification.read) {
          await markAsRead(
            notification.id,
          );
        }

        /*
         * Service request
         */
        if (
          notification.type ===
          "service_request"
        ) {
          const worker =
            notification.workerName ||
            "Fixxam Worker";

          const service =
            notification.service ||
            "Service request";

          const location =
            notification.location ||
            "Location unavailable";

          Alert.alert(
            worker,
            `${service}\n\n${location}`,
            [
              {
                text: "Close",
                style: "cancel",
              },

              ...(notification.workerPhone
                ? [
                    {
                      text: "Call Worker",
                      onPress: () =>
                        handleCallWorker(
                          notification,
                        ),
                    },
                  ]
                : []),
            ],
          );

          return;
        }

        /*
         * Booking notification
         */
        if (
          notification.type ===
          "booking"
        ) {
          Alert.alert(
            notification.title ||
              "Booking Update",
            notification.message ||
              "Your booking has been updated.",
          );

          return;
        }

        /*
         * System notification
         */
        Alert.alert(
          notification.title ||
            "Fixxam",
          notification.message ||
            "You have a new notification.",
        );
      },
      [
        handleCallWorker,
        markAsRead,
      ],
    );

  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  const formatNotificationDate =
    useCallback(
      (
        createdAt:
          CustomerNotification["createdAt"],
      ) => {
        if (!createdAt) {
          return "Just now";
        }

        const date =
          createdAt.toDate();

        const now =
          new Date();

        const diff =
          now.getTime() -
          date.getTime();

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
          const minutes =
            Math.floor(
              diff / minute,
            );

          return `${minutes}m ago`;
        }

        if (diff < day) {
          const hours =
            Math.floor(
              diff / hour,
            );

          return `${hours}h ago`;
        }

        if (diff < 7 * day) {
          const days =
            Math.floor(
              diff / day,
            );

          return `${days}d ago`;
        }

        return date.toLocaleDateString(
          undefined,
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          },
        );
      },
      [],
    );

  /* ==========================================================
     NOTIFICATION ICON
  ========================================================== */

  const getNotificationIcon =
    useCallback(
      (
        type:
          CustomerNotification["type"],
      ): keyof typeof Ionicons.glyphMap => {
        switch (type) {
          case "service_request":
            return "construct-outline";

          case "booking":
            return "calendar-outline";

          case "system":
          default:
            return "notifications-outline";
        }
      },
      [],
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="small"
          color="#2563EB"
        />

        <AppText
          style={
            styles.loadingText
          }
        >
          Loading notifications...
        </AppText>
      </AppScreen>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.pressedButton,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </Pressable>

          <View
            style={
              styles.headerContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.title
              }
            >
              Notifications
            </AppText>

            <AppText
              style={
                styles.subtitle
              }
            >
              Stay updated with Fixxam
            </AppText>
          </View>

          {unreadCount > 0 && (
            <View
              style={
                styles.unreadBadge
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.unreadBadgeText
                }
              >
                {unreadCount}
              </AppText>
            </View>
          )}
        </View>

        {/* ==================================================
            UNREAD ACTION
        ================================================== */}

        {unreadCount > 0 && (
          <Pressable
            onPress={
              markAllAsRead
            }
            style={({ pressed }) => [
              styles.markAllButton,
              pressed &&
                styles.markAllPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            <Ionicons
              name="checkmark-done-outline"
              size={17}
              color="#2563EB"
            />

            <AppText
              weight="bold"
              style={
                styles.markAllText
              }
            >
              Mark all as read
            </AppText>
          </Pressable>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
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
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#DC2626"
              />
            </View>

            <View
              style={
                styles.errorContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.errorTitle
                }
              >
                Unable to load
              </AppText>

              <AppText
                style={
                  styles.errorText
                }
              >
                {error}
              </AppText>
            </View>
          </View>
        )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!error &&
          notifications.length === 0 && (
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
                <Ionicons
                  name="notifications-off-outline"
                  size={31}
                  color="#64748B"
                />
              </View>

              <AppText
                weight="bold"
                style={
                  styles.emptyTitle
                }
              >
                No notifications yet
              </AppText>

              <AppText
                style={
                  styles.emptyText
                }
              >
                New Fixxam updates and service
                requests will appear here.
              </AppText>
            </View>
          )}

        {/* ==================================================
            NOTIFICATION LIST
        ================================================== */}

        {notifications.map(
          (notification) => {
            const unread =
              !notification.read;

            return (
              <Pressable
                key={
                  notification.id
                }
                onPress={() =>
                  handleNotificationPress(
                    notification,
                  )
                }
                style={({ pressed }) => [
                  styles.notificationCard,

                  unread &&
                    styles.unreadCard,

                  pressed &&
                    styles.pressedCard,
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  notification.title
                }
              >
                {/* ICON */}

                <View
                  style={[
                    styles.notificationIcon,
                    unread &&
                      styles.notificationIconUnread,
                  ]}
                >
                  <Ionicons
                    name={getNotificationIcon(
                      notification.type,
                    )}
                    size={21}
                    color="#2563EB"
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
                      weight="bold"
                      style={
                        styles.notificationTitle
                      }
                      numberOfLines={2}
                    >
                      {notification.title}
                    </AppText>

                    {unread && (
                      <View
                        style={
                          styles.unreadDot
                        }
                      />
                    )}
                  </View>

                  {/* WORKER */}

                  {notification.workerName && (
                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <Ionicons
                        name="person-outline"
                        size={13}
                        color="#64748B"
                      />

                      <AppText
                        style={
                          styles.detailText
                        }
                        numberOfLines={1}
                      >
                        {
                          notification.workerName
                        }
                      </AppText>
                    </View>
                  )}

                  {/* SERVICE */}

                  {notification.service && (
                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <Ionicons
                        name="construct-outline"
                        size={13}
                        color="#64748B"
                      />

                      <AppText
                        style={
                          styles.detailText
                        }
                        numberOfLines={1}
                      >
                        {
                          notification.service
                        }
                      </AppText>
                    </View>
                  )}

                  {/* MESSAGE */}

                  {notification.message ? (
                    <AppText
                      style={
                        styles.notificationMessage
                      }
                      numberOfLines={3}
                    >
                      {
                        notification.message
                      }
                    </AppText>
                  ) : null}

                  {/* LOCATION */}

                  {notification.location && (
                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <Ionicons
                        name="location-outline"
                        size={13}
                        color="#64748B"
                      />

                      <AppText
                        style={
                          styles.detailText
                        }
                        numberOfLines={2}
                      >
                        {
                          notification.location
                        }
                      </AppText>
                    </View>
                  )}

                  {/* FOOTER */}

                  <View
                    style={
                      styles.notificationFooter
                    }
                  >
                    <AppText
                      style={
                        styles.timeText
                      }
                    >
                      {formatNotificationDate(
                        notification.createdAt,
                      )}
                    </AppText>

                    {notification.workerPhone && (
                      <Pressable
                        onPress={() =>
                          handleCallWorker(
                            notification,
                          )
                        }
                        style={({ pressed }) => [
                          styles.callButton,
                          pressed &&
                            styles.callButtonPressed,
                        ]}
                        hitSlop={5}
                        accessibilityRole="button"
                        accessibilityLabel="Call worker"
                      >
                        <Ionicons
                          name="call-outline"
                          size={15}
                          color="#FFFFFF"
                        />

                        <AppText
                          weight="bold"
                          style={
                            styles.callButtonText
                          }
                        >
                          Call
                        </AppText>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          },
        )}
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 120,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 8,
      fontSize: 12,
      color: "#64748B",
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    headerContent: {
      flex: 1,
      marginLeft: 12,
    },

    title: {
      fontSize: 20,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 3,
      fontSize: 11,
      color: "#64748B",
    },

    unreadBadge: {
      minWidth: 29,
      height: 29,
      paddingHorizontal: 8,
      borderRadius: 15,
      backgroundColor: "#2563EB",
      alignItems: "center",
      justifyContent: "center",
    },

    unreadBadgeText: {
      fontSize: 10.5,
      color: "#FFFFFF",
    },

    pressedButton: {
      opacity: 0.7,
    },

    /* ========================================================
       MARK ALL
    ======================================================== */

    markAllButton: {
      alignSelf: "flex-end",
      minHeight: 36,
      paddingHorizontal: 11,
      borderRadius: 10,
      backgroundColor: "#EFF6FF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginBottom: 10,
    },

    markAllText: {
      fontSize: 10.5,
      color: "#2563EB",
    },

    markAllPressed: {
      opacity: 0.7,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorCard: {
      padding: 12,
      borderRadius: 15,
      backgroundColor: "#FEF2F2",
      borderWidth: 1,
      borderColor: "#FECACA",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },

    errorIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    errorContent: {
      flex: 1,
      marginLeft: 10,
    },

    errorTitle: {
      fontSize: 12,
      color: "#991B1B",
    },

    errorText: {
      marginTop: 2,
      fontSize: 10.5,
      lineHeight: 15,
      color: "#B91C1C",
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyCard: {
      marginTop: 35,
      padding: 25,
      borderRadius: 18,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      alignItems: "center",
    },

    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: "#F1F5F9",
      alignItems: "center",
      justifyContent: "center",
    },

    emptyTitle: {
      marginTop: 13,
      fontSize: 15,
      color: "#0F172A",
    },

    emptyText: {
      maxWidth: 270,
      marginTop: 5,
      fontSize: 10.5,
      lineHeight: 16,
      textAlign: "center",
      color: "#64748B",
    },

    /* ========================================================
       NOTIFICATION CARD
    ======================================================== */

    notificationCard: {
      marginBottom: 10,
      padding: 13,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      flexDirection: "row",
    },

    unreadCard: {
      backgroundColor: "#F8FBFF",
      borderColor: "#BFDBFE",
    },

    pressedCard: {
      opacity: 0.72,
      transform: [
        {
          scale: 0.995,
        },
      ],
    },

    notificationIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor: "#F1F5F9",
      alignItems: "center",
      justifyContent: "center",
    },

    notificationIconUnread: {
      backgroundColor: "#DBEAFE",
    },

    notificationContent: {
      flex: 1,
      marginLeft: 11,
    },

    /* ========================================================
       TITLE
    ======================================================== */

    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    notificationTitle: {
      flex: 1,
      fontSize: 13.5,
      lineHeight: 18,
      color: "#0F172A",
    },

    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#2563EB",
      marginTop: 5,
      marginLeft: 7,
    },

    /* ========================================================
       DETAILS
    ======================================================== */

    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
      gap: 5,
    },

    detailText: {
      flex: 1,
      fontSize: 10.5,
      lineHeight: 15,
      color: "#64748B",
    },

    notificationMessage: {
      marginTop: 6,
      fontSize: 11,
      lineHeight: 16,
      color: "#475569",
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    notificationFooter: {
      marginTop: 9,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    timeText: {
      fontSize: 9.5,
      color: "#94A3B8",
    },

    /* ========================================================
       CALL
    ======================================================== */

    callButton: {
      minHeight: 34,
      paddingHorizontal: 11,
      borderRadius: 9,
      backgroundColor: "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    callButtonPressed: {
      opacity: 0.78,
    },

    callButtonText: {
      fontSize: 10.5,
      color: "#FFFFFF",
    },
  });