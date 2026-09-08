import React, {
  memo,
  useCallback,
  useMemo,
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
  router,
} from "expo-router";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  AppIcon,
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

import {
  auth,
  db,
} from "@/firebase/config";

import type {
  WorkerNotification,
} from "@/hooks/notifications/useWorkerNotifications";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  visible: boolean;

  loading: boolean;

  notifications: WorkerNotification[];

  onClose: () => void;
};

type InfoRowProps = {
  icon: AppIconName;

  value: string;
};

/* ============================================================
   HELPERS
============================================================ */

function getSafeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getNotificationIcon(
  notification: WorkerNotification,
): AppIconName {
  if (
    notification.type ===
    "market_order"
  ) {
    return "cart";
  }

  if (
    notification.type ===
    "booking"
  ) {
    return "jobs";
  }

  if (
    notification.type ===
    "service_request"
  ) {
    return "professional";
  }

  return "notifications";
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerNotificationModal({
  visible,
  loading,
  notifications,
  onClose,
}: Props) {
  const insets =
    useSafeAreaInsets();

  /* ==========================================================
     SAFE NOTIFICATIONS
  ========================================================== */

  const safeNotifications =
    useMemo(
      () =>
        Array.isArray(
          notifications,
        )
          ? notifications.filter(
              notification =>
                Boolean(
                  getSafeString(
                    notification?.id,
                  ),
                ),
            )
          : [],
      [
        notifications,
      ],
    );

  /* ==========================================================
     MARK AS READ
  ========================================================== */

  const markAsRead =
    useCallback(
      async (
        notificationId: string,
      ) => {
        const uid =
          auth.currentUser?.uid;

        const safeId =
          getSafeString(
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
        } catch (error) {
          console.error(
            "FIXXAM_WORKER_NOTIFICATION_READ_ERROR:",
            error,
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
      (
        notification: WorkerNotification,
      ) => {
        const uid =
          auth.currentUser?.uid;

        if (!uid) {
          Toast.show({
            type: "error",
            text1:
              "Sign in required",
            text2:
              "Please sign in again.",
          });

          return;
        }

        const notificationId =
          getSafeString(
            notification.id,
          );

        if (
          !notificationId
        ) {
          return;
        }

        /*
         * Do not delay navigation for
         * a non-critical Firestore write.
         */
        if (
          !notification.read
        ) {
          void markAsRead(
            notificationId,
          );
        }

        onClose();

        /* ====================================================
           BOOKING
        ==================================================== */

        if (
          notification.bookingId
        ) {
          router.push({
            pathname:
              "/(worker)/notifications",

            params: {
              bookingId:
                notification.bookingId,
            },
          } as never);

          return;
        }

        /* ====================================================
           MARKET ORDER
        ==================================================== */

        if (
          notification.orderId
        ) {
          router.push({
            pathname:
              "/(worker)/notifications",

            params: {
              orderId:
                notification.orderId,

              action:
                notification.action ??
                "",
            },
          } as never);

          return;
        }

        /* ====================================================
           SERVICE REQUEST
        ==================================================== */

        if (
          notification.requestId
        ) {
          router.push({
            pathname:
              "/(worker)/notifications",

            params: {
              requestId:
                notification.requestId,
            },
          } as never);

          return;
        }

        /* ====================================================
           GENERAL
        ==================================================== */

        router.push(
          "/(worker)/notifications" as never,
        );
      },
      [
        markAsRead,
        onClose,
      ],
    );

  /* ==========================================================
     CALL CUSTOMER
  ========================================================== */

  const handleCallCustomer =
    useCallback(
      async (
        phone?: string,
      ) => {
        const cleanPhone =
          getSafeString(
            phone,
          ).replace(
            /[^0-9+*#,;]/g,
            "",
          );

        if (!cleanPhone) {
          Toast.show({
            type: "error",
            text1:
              "Phone number unavailable",
            text2:
              "This customer did not provide a valid phone number.",
          });

          return;
        }

        const url =
          `tel:${cleanPhone}`;

        try {
          const supported =
            await Linking.canOpenURL(
              url,
            );

          if (
            !supported
          ) {
            Toast.show({
              type: "error",
              text1:
                "Cannot make call",
              text2:
                "Your device cannot open the phone dialer.",
            });

            return;
          }

          await Linking.openURL(
            url,
          );
        } catch (error) {
          console.error(
            "FIXXAM_CALL_CUSTOMER_ERROR:",
            error,
          );

          Toast.show({
            type: "error",
            text1:
              "Call failed",
            text2:
              "Unable to open the phone dialer.",
          });
        }
      },
      [],
    );

  /* ==========================================================
     RENDER ITEM
  ========================================================== */

  const renderNotification =
    useCallback(
      ({
        item:
          notification,
      }: {
        item: WorkerNotification;
      }) => {
        const isMarketOrder =
          notification.type ===
          "market_order";

        const isNewMarketOrder =
          isMarketOrder &&
          notification.action ===
            "order_created";

        const icon =
          getNotificationIcon(
            notification,
          );

        const title =
          getSafeString(
            notification.title,
          ) ||
          "Notification";

        const customerName =
          getSafeString(
            notification.customerName,
          );

        const service =
          getSafeString(
            notification.service,
          );

        const location =
          getSafeString(
            notification.location,
          );

        const customerPhone =
          getSafeString(
            notification.customerPhone,
          );

        const message =
          getSafeString(
            notification.message,
          );

        return (
          <View
            style={[
              styles.card,

              !notification.read
                ? styles.unreadCard
                : null,

              isNewMarketOrder
                ? styles.marketOrderCard
                : null,
            ]}
          >
            {/* ================================================
                ICON
            ================================================= */}

            <View
              style={[
                styles.cardIcon,

                !notification.read
                  ? styles.unreadIcon
                  : null,
              ]}
            >
              <AppIcon
                name={
                  icon
                }
                role="worker"
                size="md"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            {/* ================================================
                CONTENT
            ================================================= */}

            <View
              style={
                styles.cardContent
              }
            >
              <View
                style={
                  styles.titleRow
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  numberOfLines={2}
                  style={
                    styles.cardTitle
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

              {/* ==============================================
                  MARKET LABEL
              =============================================== */}

              {isNewMarketOrder ? (
                <View
                  style={
                    styles.marketLabelContainer
                  }
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    numberOfLines={1}
                    style={
                      styles.marketOrderLabel
                    }
                  >
                    NEW MARKET ORDER
                  </AppText>
                </View>
              ) : null}

              {/* ==============================================
                  CUSTOMER
              =============================================== */}

              {customerName ? (
                <AppText
                  variant="body"
                  weight="bold"
                  numberOfLines={1}
                  style={
                    styles.customerName
                  }
                >
                  {customerName}
                </AppText>
              ) : null}

              {/* ==============================================
                  SERVICE
              =============================================== */}

              {service ? (
                <InfoRow
                  icon="jobs"
                  value={
                    service
                  }
                />
              ) : null}

              {/* ==============================================
                  LOCATION
              =============================================== */}

              {location ? (
                <InfoRow
                  icon="location"
                  value={
                    location
                  }
                />
              ) : null}

              {/* ==============================================
                  PHONE
              =============================================== */}

              {customerPhone ? (
                <Pressable
                  onPress={() => {
                    void handleCallCustomer(
                      customerPhone,
                    );
                  }}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${customerName || "customer"}`}
                  style={({
                    pressed,
                  }) => [
                    styles.callRow,

                    pressed
                      ? styles.pressed
                      : null,
                  ]}
                >
                  <AppIcon
                    name="phone"
                    role="worker"
                    size="xs"
                    color={
                      WorkerColors.primary
                    }
                  />

                  <AppText
                    variant="caption"
                    weight="bold"
                    numberOfLines={1}
                    style={
                      styles.phone
                    }
                  >
                    {customerPhone}
                  </AppText>
                </Pressable>
              ) : null}

              {/* ==============================================
                  MESSAGE
              =============================================== */}

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

              {/* ==============================================
                  ACTION
              =============================================== */}

              <Pressable
                onPress={() => {
                  handleNotificationPress(
                    notification,
                  );
                }}
                accessibilityRole="button"
                accessibilityLabel={`View ${title}`}
                style={({
                  pressed,
                }) => [
                  styles.openRow,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.openText
                  }
                >
                  {isNewMarketOrder
                    ? "View order"
                    : "View details"}
                </AppText>

                <AppIcon
                  name="next"
                  role="worker"
                  size="xs"
                  color={
                    WorkerColors.primary
                  }
                />
              </Pressable>
            </View>
          </View>
        );
      },
      [
        handleCallCustomer,
        handleNotificationPress,
      ],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      <View
        style={
          styles.overlay
        }
      >
        {/* ====================================================
            BACKDROP
        ==================================================== */}

        <Pressable
          style={
            StyleSheet.absoluteFill
          }
          onPress={
            onClose
          }
          accessibilityRole="button"
          accessibilityLabel="Close notifications"
        />

        {/* ====================================================
            SHEET
        ==================================================== */}

        <View
          style={[
            styles.sheet,

            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens.spacing.lg,
                ),
            },
          ]}
        >
          {/* ==================================================
              HANDLE
          ================================================== */}

          <View
            style={
              styles.handle
            }
          />

          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.modalHeader
            }
          >
            <View
              style={
                styles.headerText
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
                New jobs and updates from your customers.
              </AppText>
            </View>

            <Pressable
              onPress={
                onClose
              }
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Close notifications"
              style={({
                pressed,
              }) => [
                styles.closeButton,

                pressed
                  ? styles.pressed
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

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (
            <View
              style={
                styles.stateContainer
              }
              accessibilityRole="progressbar"
              accessibilityLabel="Loading notifications"
            >
              <View
                style={
                  styles.stateIcon
                }
              >
                <ActivityIndicator
                  size="large"
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
                  styles.stateTitle
                }
              >
                Loading notifications
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.stateText
                }
              >
                Please wait a moment.
              </AppText>
            </View>
          ) : safeNotifications.length ===
            0 ? (
            /* ================================================
               EMPTY
            ================================================= */

            <View
              style={
                styles.stateContainer
              }
            >
              <View
                style={
                  styles.stateIcon
                }
              >
                <AppIcon
                  name="notifications"
                  size="lg"
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
                  styles.stateTitle
                }
              >
                No Notifications
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.stateText
                }
              >
                New jobs and customer updates will appear here.
              </AppText>
            </View>
          ) : (
            /* ================================================
               LIST
            ================================================= */

            <FlatList
              data={
                safeNotifications
              }
              keyExtractor={
                item =>
                  getSafeString(
                    item.id,
                  )
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
  );
}

/* ============================================================
   INFO ROW
============================================================ */

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
              Colors.textMuted
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.infoValue
            }
          >
            {value}
          </AppText>
        </View>
      );
    },
  );

InfoRow.displayName =
  "WorkerNotificationInfoRow";

/* ============================================================
   MEMO
============================================================ */

WorkerNotificationModal.displayName =
  "WorkerNotificationModal";

export default memo(
  WorkerNotificationModal,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       OVERLAY
    ======================================================== */

    overlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    /* ========================================================
       SHEET
    ======================================================== */

    sheet: {
      width: "100%",

      maxHeight: "84%",

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
    },

    handle: {
      width: 42,

      height: 4,

      alignSelf:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    modalHeader: {
      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    headerText: {
      flex: 1,

      minWidth: 0,
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

    closeButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginLeft:
        FixxamTokens.spacing.md,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      paddingBottom:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       STATE
    ======================================================== */

    stateContainer: {
      minHeight: 300,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    stateIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    stateTitle: {
      color:
        Colors.textPrimary,
    },

    stateText: {
      maxWidth: 290,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginBottom:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
    },

    unreadCard: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    marketOrderCard: {
      borderColor:
        WorkerColors.primary,
    },

    /* ========================================================
       ICON
    ======================================================== */

    cardIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginRight:
        FixxamTokens.spacing.sm,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    unreadIcon: {
      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    cardContent: {
      flex: 1,

      minWidth: 0,
    },

    titleRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    cardTitle: {
      flex: 1,

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
        WorkerColors.primary,
    },

    /* ========================================================
       MARKET LABEL
    ======================================================== */

    marketLabelContainer: {
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
        WorkerColors.primarySoft,
    },

    marketOrderLabel: {
      letterSpacing: 0.5,

      color:
        WorkerColors.primary,
    },

    /* ========================================================
       CUSTOMER
    ======================================================== */

    customerName: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoRow: {
      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.xs,
    },

    infoValue: {
      flex: 1,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CALL
    ======================================================== */

    callRow: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      alignSelf:
        "flex-start",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    phone: {
      color:
        WorkerColors.primary,

      textDecorationLine:
        "underline",
    },

    /* ========================================================
       MESSAGE
    ======================================================== */

    message: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       OPEN ACTION
    ======================================================== */

    openRow: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      alignSelf:
        "flex-start",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    openText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       INTERACTION
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
  });