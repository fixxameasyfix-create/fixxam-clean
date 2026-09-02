import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  AppText,
} from "@/components/ui";

import {
  getHomeGreeting,
} from "@/utils/getHomeGreeting";

import useCustomerNotifications, {
  CustomerNotification,
} from "@/hooks/customer/useCustomerNotification";

import useUserProfile from "@/hooks/auth/useUserProfile";

export default function HomeHeader() {
  const greeting = getHomeGreeting();

  const [visible, setVisible] =
    useState(false);

  /* ==========================================================
     CUSTOMER PROFILE
  ========================================================== */

  const {
    profile,
  } = useUserProfile();

  /* ==========================================================
     CUSTOMER NAME
  ========================================================== */

  const fullName = useMemo(() => {
    return [
      profile?.firstName,
      profile?.otherName,
      profile?.surname,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }, [
    profile?.firstName,
    profile?.otherName,
    profile?.surname,
  ]);

  const displayName =
    fullName ||
    profile?.firstName ||
    "Customer";

  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  const {
    notifications,
    unreadCount,
    loading,
  } =
    useCustomerNotifications();

  const hasNotifications =
    notifications.length > 0;

  const notificationLabel =
    useMemo(() => {
      if (unreadCount > 99) {
        return "99+";
      }

      return String(unreadCount);
    }, [unreadCount]);

  /* ==========================================================
     PROFILE
  ========================================================== */

  const handleOpenProfile =
    useCallback(() => {
      router.push(
        "/(customer)/profile/edit",
      );
    }, []);

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.container}>
        <View style={styles.left}>
          {/* ==================================================
              CUSTOMER AVATAR
          ================================================== */}

          <Pressable
            onPress={
              handleOpenProfile
            }
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            accessibilityHint="Opens your customer profile"
            hitSlop={8}
            style={({ pressed }) => [
              styles.avatarButton,
              pressed &&
                styles.avatarPressed,
            ]}
          >
            {profile?.photoUrl ? (
              <Image
                source={{
                  uri: profile.photoUrl,
                }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View
                style={
                  styles.avatarPlaceholder
                }
              >
                <Ionicons
                  name="person"
                  size={27}
                  color="#64748B"
                />
              </View>
            )}
          </Pressable>

          {/* ==================================================
              NAME + GREETING
          ================================================== */}

          <View style={styles.info}>
            <AppText
              weight="bold"
              style={styles.name}
              numberOfLines={1}
            >
              {displayName}
            </AppText>

            <AppText
              style={styles.greeting}
              numberOfLines={1}
            >
              {greeting}
            </AppText>
          </View>
        </View>

        {/* ===================================================
            NOTIFICATION BUTTON
        =================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          accessibilityHint="Opens your notifications"
          onPress={() =>
            setVisible(true)
          }
          style={({ pressed }) => [
            styles.notification,
            pressed &&
              styles.notificationPressed,
          ]}
        >
          <Ionicons
            name="notifications-outline"
            size={21}
            color="#2563EB"
          />

          {unreadCount > 0 && (
            <View
              style={styles.badge}
            >
              <AppText
                weight="bold"
                style={styles.badgeText}
              >
                {notificationLabel}
              </AppText>
            </View>
          )}
        </Pressable>
      </View>

      {/* =====================================================
          NOTIFICATION MODAL
      ===================================================== */}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setVisible(false)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.modalSheet}
          >
            {/* ===============================================
                MODAL HEADER
            =============================================== */}

            <View
              style={styles.modalHeader}
            >
              <View
                style={
                  styles.modalHeaderText
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.modalTitle
                  }
                >
                  Notifications
                </AppText>

                <AppText
                  style={
                    styles.modalSubtitle
                  }
                >
                  New requests from workers near you.
                </AppText>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
                hitSlop={8}
                onPress={() =>
                  setVisible(false)
                }
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed &&
                    styles.closePressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#0F172A"
                />
              </Pressable>
            </View>

            {/* ===============================================
                CONTENT
            =============================================== */}

            {loading ? (
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
                  <Ionicons
                    name="notifications-outline"
                    size={34}
                    color="#94A3B8"
                  />
                </View>

                <AppText
                  weight="bold"
                  style={
                    styles.emptyTitle
                  }
                >
                  Loading...
                </AppText>
              </View>
            ) : !hasNotifications ? (
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
                  <Ionicons
                    name="notifications-off-outline"
                    size={34}
                    color="#94A3B8"
                  />
                </View>

                <AppText
                  weight="bold"
                  style={
                    styles.emptyTitle
                  }
                >
                  No Notifications
                </AppText>

                <AppText
                  style={
                    styles.emptyText
                  }
                >
                  New service requests from
                  workers in your area will
                  appear here.
                </AppText>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.list
                }
              >
                {notifications.map(
                  (
                    notification,
                  ) => (
                    <NotificationCard
                      key={
                        notification.id
                      }
                      notification={
                        notification
                      }
                    />
                  ),
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

/* =============================================================
   NOTIFICATION CARD
============================================================= */

type NotificationCardProps = {
  notification: CustomerNotification;
};

function NotificationCard({
  notification,
}: NotificationCardProps) {
  const handleCallWorker =
    useCallback(async () => {
      const rawPhone =
        notification.workerPhone?.trim();

      if (!rawPhone) {
        Alert.alert(
          "Phone Number Unavailable",
          "This worker did not provide a valid phone number.",
        );

        return;
      }

      const phone =
        rawPhone.replace(
          /[^0-9+*#,;]/g,
          "",
        );

      if (!phone) {
        Alert.alert(
          "Invalid Phone Number",
          "The worker's phone number is not valid.",
        );

        return;
      }

      const url = `tel:${phone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            url,
          );

        if (!supported) {
          Alert.alert(
            "Cannot Make Call",
            "Your device cannot open the phone dialer.",
          );

          return;
        }

        await Linking.openURL(
          url,
        );
      } catch (error) {
        console.error(
          "FIXXAM_CALL_WORKER_ERROR:",
          error,
        );

        Alert.alert(
          "Call Failed",
          "Unable to open the phone dialer. Please try again.",
        );
      }
    }, [
      notification.workerPhone,
    ]);

  return (
    <View
      style={[
        styles.card,
        !notification.read &&
          styles.unreadCard,
      ]}
    >
      {/* =====================================================
          ICON
      ===================================================== */}

      <View
        style={styles.cardIcon}
      >
        <Ionicons
          name="briefcase-outline"
          size={21}
          color="#FF6B00"
        />
      </View>

      <View
        style={styles.cardContent}
      >
        {/* ===================================================
            TITLE
        =================================================== */}

        <View
          style={
            styles.cardTitleRow
          }
        >
          <AppText
            weight="bold"
            style={
              styles.cardTitle
            }
            numberOfLines={1}
          >
            {notification.title}
          </AppText>

          {!notification.read && (
            <View
              style={
                styles.unreadDot
              }
            />
          )}
        </View>

        {/* ===================================================
            WORKER NAME
        =================================================== */}

        {notification.workerName && (
          <AppText
            weight="bold"
            style={
              styles.workerName
            }
            numberOfLines={1}
          >
            {notification.workerName}
          </AppText>
        )}

        {/* ===================================================
            SERVICE
        =================================================== */}

        {notification.service && (
          <InfoRow
            icon="briefcase-outline"
            value={
              notification.service
            }
          />
        )}

        {/* ===================================================
            LOCATION
        =================================================== */}

        {notification.location && (
          <InfoRow
            icon="location-outline"
            value={
              notification.location
            }
          />
        )}

        {/* ===================================================
            PHONE
        =================================================== */}

        {notification.workerPhone && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Call ${notification.workerName ?? "worker"} at ${notification.workerPhone}`}
            accessibilityHint="Opens your phone dialer"
            onPress={
              handleCallWorker
            }
            hitSlop={6}
            style={({ pressed }) => [
              styles.callRow,
              pressed &&
                styles.callRowPressed,
            ]}
          >
            <View
              style={
                styles.callIcon
              }
            >
              <Ionicons
                name="call-outline"
                size={15}
                color="#2563EB"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.callNumber
              }
              numberOfLines={1}
            >
              {notification.workerPhone}
            </AppText>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#2563EB"
            />
          </Pressable>
        )}

        {/* ===================================================
            MESSAGE
        =================================================== */}

        {notification.message ? (
          <AppText
            style={
              styles.message
            }
          >
            {notification.message}
          </AppText>
        ) : null}

        {/* ===================================================
            CALL ACTION
        =================================================== */}

        {notification.workerPhone && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Call worker"
            onPress={
              handleCallWorker
            }
            style={({ pressed }) => [
              styles.callButton,
              pressed &&
                styles.callButtonPressed,
            ]}
          >
            <Ionicons
              name="call"
              size={16}
              color="#FFFFFF"
            />

            <AppText
              weight="bold"
              style={
                styles.callButtonText
              }
            >
              Call Worker
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* =============================================================
   INFO ROW
============================================================= */

type InfoRowProps = {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];

  value: string;
};

function InfoRow({
  icon,
  value,
}: InfoRowProps) {
  return (
    <View
      style={styles.infoRow}
    >
      <Ionicons
        name={icon}
        size={15}
        color="#64748B"
      />

      <AppText
        style={styles.infoValue}
        numberOfLines={2}
      >
        {value}
      </AppText>
    </View>
  );
}

/* =============================================================
   STYLES
============================================================= */

const styles =
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginTop: 4,
      marginBottom: 12,
    },

    left: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatarButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginRight: 12,
      overflow: "hidden",
      backgroundColor:
        "#E5E7EB",
    },

    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 28,
    },

    avatarPlaceholder: {
      width: "100%",
      height: "100%",
      borderRadius: 28,
      backgroundColor:
        "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
    },

    avatarPressed: {
      opacity: 0.75,
      transform: [
        {
          scale: 0.96,
        },
      ],
    },

    info: {
      flex: 1,
      minWidth: 0,
      justifyContent:
        "center",
    },

    name: {
      fontSize: 20,
      lineHeight: 25,
      color: "#0F172A",
    },

    greeting: {
      marginTop: 2,
      fontSize: 16,
      lineHeight: 20,
      color: "#090B0D",
    },

    /* ========================================================
       NOTIFICATION
    ======================================================== */

    notification: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      justifyContent:
        "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#EEF2F7",

      shadowColor: "#000000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 3,
    },

    notificationPressed: {
      opacity: 0.7,
      transform: [
        {
          scale: 0.96,
        },
      ],
    },

    badge: {
      position: "absolute",
      top: 4,
      right: 4,
      minWidth: 17,
      height: 17,
      borderRadius: 9,
      paddingHorizontal: 4,
      backgroundColor:
        "#F97316",
      borderWidth: 2,
      borderColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    badgeText: {
      color: "#FFFFFF",
      fontSize: 8,
      lineHeight: 10,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15,23,42,0.45)",
      justifyContent:
        "flex-end",
    },

    modalSheet: {
      maxHeight: "82%",
      backgroundColor:
        "#FFFFFF",
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 28,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 18,
    },

    modalHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    modalTitle: {
      fontSize: 22,
      color: "#0F172A",
    },

    modalSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color: "#64748B",
    },

    closeButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "#F8FAFC",
      alignItems: "center",
      justifyContent:
        "center",
      marginLeft: 12,
    },

    closePressed: {
      opacity: 0.65,
    },

    list: {
      paddingBottom: 10,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyContainer: {
      minHeight: 300,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 35,
    },

    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor:
        "#F8FAFC",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 14,
    },

    emptyTitle: {
      fontSize: 17,
      color: "#0F172A",
      marginBottom: 6,
    },

    emptyText: {
      textAlign: "center",
      fontSize: 13,
      lineHeight: 20,
      color: "#64748B",
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      flexDirection: "row",
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#F8FAFC",
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        "#EEF2F7",
    },

    unreadCard: {
      backgroundColor:
        "#FFF7ED",
      borderColor:
        "#FED7AA",
    },

    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    cardContent: {
      flex: 1,
      minWidth: 0,
    },

    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },

    cardTitle: {
      flex: 1,
      fontSize: 14,
      color: "#0F172A",
    },

    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        "#F97316",
      marginLeft: 7,
    },

    workerName: {
      fontSize: 15,
      color: "#0F172A",
      marginBottom: 7,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 4,
      gap: 7,
    },

    infoValue: {
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
      color: "#475569",
    },

    /* ========================================================
       PHONE
    ======================================================== */

    callRow: {
      marginTop: 6,
      minHeight: 32,
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingVertical: 3,
      paddingRight: 4,
      borderRadius: 8,
    },

    callRowPressed: {
      opacity: 0.55,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    callIcon: {
      width: 26,
      height: 26,
      borderRadius: 8,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 7,
    },

    callNumber: {
      color: "#2563EB",
      fontSize: 13,
      textDecorationLine:
        "underline",
      marginRight: 4,
    },

    /* ========================================================
       CALL BUTTON
    ======================================================== */

    callButton: {
      marginTop: 11,
      minHeight: 40,
      paddingHorizontal: 15,
      borderRadius: 12,
      backgroundColor:
        "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      alignSelf: "flex-start",
      gap: 7,
    },

    callButtonPressed: {
      opacity: 0.78,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },

    callButtonText: {
      color: "#FFFFFF",
      fontSize: 12,
    },

    message: {
      marginTop: 9,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },
  });