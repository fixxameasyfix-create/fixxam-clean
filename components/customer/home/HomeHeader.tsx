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
  return typeof value === "string"
    ? value.trim()
    : "";
}

function showCallError(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
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
  ] = useState(false);

  /* ==========================================================
     CUSTOMER PROFILE
  ========================================================== */

  const {
    profile,
  } = useUserProfile();

  const fullName =
    useMemo(() => {
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
        .filter(Boolean)
        .join(" ");
    }, [
      profile?.firstName,
      profile?.otherName,
      profile?.surname,
    ]);

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
  } =
    useCustomerNotifications();

  const notificationLabel =
    useMemo(() => {
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

      return safeUnreadCount > 99
        ? "99+"
        : String(
            safeUnreadCount,
          );
    }, [
      unreadCount,
    ]);

  /* ==========================================================
     ACTIONS
  ========================================================== */

  const handleOpenProfile =
    useCallback(() => {
      router.push(
        "/(customer)/profile/edit",
      );
    }, []);

  const handleOpenNotifications =
    useCallback(() => {
      setVisible(true);
    }, []);

  const handleCloseNotifications =
    useCallback(() => {
      setVisible(false);
    }, []);

  const renderNotification =
    useCallback(
      ({
        item,
      }: {
        item: CustomerNotification;
      }) => (
        <NotificationCard
          notification={item}
        />
      ),
      [],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={styles.container}
      >
        <View
          style={styles.left}
        >
          {/* ==================================================
              AVATAR
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

              pressed
                ? styles.avatarPressed
                : null,
            ]}
          >
            {photoUrl ? (
              <Image
                source={{
                  uri: photoUrl,
                }}
                style={
                  styles.avatar
                }
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
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

          {/* ==================================================
              NAME + GREETING
          ================================================== */}

          <View
            style={styles.info}
          >
            <AppText
              variant="heading3"
              weight="bold"
              style={styles.name}
              numberOfLines={1}
            >
              {displayName}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.greeting
              }
              numberOfLines={1}
            >
              {greeting}
            </AppText>
          </View>
        </View>

        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            unreadCount > 0
              ? `Open notifications. ${notificationLabel} unread.`
              : "Open notifications"
          }
          accessibilityHint="Opens your notifications"
          onPress={
            handleOpenNotifications
          }
          style={({ pressed }) => [
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

          {unreadCount > 0 ? (
            <View
              style={styles.badge}
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
        visible={visible}
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
          {/* =================================================
              BACKDROP
          ================================================= */}

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

          {/* =================================================
              SHEET
          ================================================= */}

          <View
            accessibilityViewIsModal
            style={[
              styles.modalSheet,

              {
                paddingBottom:
                  Math.max(
                    insets.bottom,
                    FixxamTokens
                      .spacing.lg,
                  ),
              },
            ]}
          >
            <View
              style={
                styles.sheetHandle
              }
            />

            {/* ===============================================
                MODAL HEADER
            =============================================== */}

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
                  New updates from workers and your service requests.
                </AppText>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
                hitSlop={8}
                onPress={
                  handleCloseNotifications
                }
                style={({ pressed }) => [
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

            {/* ===============================================
                CONTENT
            =============================================== */}

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
                ) => item.id}
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
            Getting your latest updates.
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
            New service updates from workers will appear here.
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
};

const NotificationCard =
  memo(
    function NotificationCard({
      notification,
    }: NotificationCardProps) {
      const title =
        cleanText(
          notification.title,
        ) || "Service update";

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
        cleanText(
          notification.workerPhone,
        );

      const message =
        cleanText(
          notification.message,
        );

      /* ======================================================
         CALL WORKER
      ====================================================== */

      const handleCallWorker =
        useCallback(async () => {
          if (!workerPhone) {
            showCallError(
              "Phone number unavailable",
              "This worker did not provide a valid phone number.",
            );

            return;
          }

          const phone =
            workerPhone.replace(
              /[^0-9+*#,;]/g,
              "",
            );

          if (!phone) {
            showCallError(
              "Invalid phone number",
              "The worker's phone number is not valid.",
            );

            return;
          }

          const url =
            `tel:${phone}`;

          try {
            const supported =
              await Linking.canOpenURL(
                url,
              );

            if (!supported) {
              showCallError(
                "Cannot make call",
                "Your device cannot open the phone dialer.",
              );

              return;
            }

            await Linking.openURL(
              url,
            );
          } catch (error) {
            console.error(
              "FIXXAM_CALL_WORKER_ERROR",
              error,
            );

            showCallError(
              "Call failed",
              "Unable to open the phone dialer. Please try again.",
            );
          }
        }, [
          workerPhone,
        ]);

      return (
        <View
          style={[
            styles.card,

            !notification.read
              ? styles.unreadCard
              : null,
          ]}
        >
          {/* =================================================
              ICON
          ================================================= */}

          <View
            style={
              styles.cardIcon
            }
          >
            <AppIcon
              name="jobs"
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.cardContent
            }
          >
            {/* ===============================================
                TITLE
            =============================================== */}

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
                numberOfLines={2}
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

            {/* ===============================================
                WORKER NAME
            =============================================== */}

            {workerName ? (
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.workerName
                }
                numberOfLines={1}
              >
                {workerName}
              </AppText>
            ) : null}

            {/* ===============================================
                SERVICE
            =============================================== */}

            {service ? (
              <InfoRow
                icon="service"
                value={service}
              />
            ) : null}

            {/* ===============================================
                LOCATION
            =============================================== */}

            {location ? (
              <InfoRow
                icon="location"
                value={location}
              />
            ) : null}

            {/* ===============================================
                PHONE ROW
            =============================================== */}

            {workerPhone ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Call ${
                  workerName ||
                  "worker"
                } at ${workerPhone}`}
                accessibilityHint="Opens your phone dialer"
                onPress={
                  handleCallWorker
                }
                hitSlop={6}
                style={({ pressed }) => [
                  styles.callRow,

                  pressed
                    ? styles.callRowPressed
                    : null,
                ]}
              >
                <View
                  style={
                    styles.callIcon
                  }
                >
                  <AppIcon
                    name="phone"
                    role="customer"
                    size="xs"
                    color={
                      CustomerColors.primary
                    }
                  />
                </View>

                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.callNumber
                  }
                  numberOfLines={1}
                >
                  {workerPhone}
                </AppText>

                <AppIcon
                  name="next"
                  role="customer"
                  size="xs"
                  color={
                    CustomerColors.primary
                  }
                />
              </Pressable>
            ) : null}

            {/* ===============================================
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

            {/* ===============================================
                CALL ACTION
            =============================================== */}

            {workerPhone ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Call ${
                  workerName ||
                  "worker"
                }`}
                onPress={
                  handleCallWorker
                }
                style={({ pressed }) => [
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
                  Call Worker
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </View>
      );
    },
  );

/* =============================================================
   INFO ROW
============================================================= */

type InfoRowProps = {
  icon:
    | "service"
    | "location";

  value: string;
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
            name={icon}
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
            numberOfLines={2}
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
    /* ========================================================
       HEADER
    ======================================================== */

    container: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginTop:
        FixxamTokens.spacing.xxs,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    left: {
      flex: 1,

      minWidth: 0,

      flexDirection: "row",

      alignItems: "center",
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatarButton: {
      width:
        FixxamTokens.size
          .avatarLg,

      height:
        FixxamTokens.size
          .avatarLg,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.md,

      overflow: "hidden",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    avatar: {
      width: "100%",

      height: "100%",
    },

    avatarPlaceholder: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
    },

    avatarPressed: {
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

    info: {
      flex: 1,

      minWidth: 0,

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
       NOTIFICATION
    ======================================================== */

    notification: {
      width: 50,

      height: 50,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

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

    badge: {
      position: "absolute",

      top: 3,

      right: 3,

      minWidth: 18,

      height: 18,

      paddingHorizontal: 4,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 2,

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

      lineHeight: 10,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,

      justifyContent:
        "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        Colors.overlayMedium,
    },

    modalSheet: {
      width: "100%",

      maxHeight: "82%",

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
      width: 42,

      height: 4,

      alignSelf: "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    modalHeader: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    modalHeaderText: {
      flex: 1,

      minWidth: 0,
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
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      marginLeft:
        FixxamTokens.spacing.md,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    closePressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    list: {
      paddingBottom:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       EMPTY / LOADING
    ======================================================== */

    emptyContainer: {
      minHeight: 300,

      alignItems: "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    emptyIcon: {
      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

      alignItems: "center",

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
      maxWidth: 280,

      lineHeight: 20,
    },

    /* ========================================================
       NOTIFICATION CARD
    ======================================================== */

    card: {
      flexDirection: "row",

      padding:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.sm,

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
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    cardIcon: {
      width: 44,

      height: 44,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    cardContent: {
      flex: 1,

      minWidth: 0,
    },

    cardTitleRow: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    cardTitle: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textPrimary,
    },

    unreadDot: {
      width: 8,

      height: 8,

      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    workerName: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       INFO ROW
    ======================================================== */

    infoRow: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.xs,

      gap:
        FixxamTokens.spacing.xs,
    },

    infoValue: {
      flex: 1,

      minWidth: 0,

      lineHeight: 17,
    },

    /* ========================================================
       PHONE ROW
    ======================================================== */

    callRow: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.xs,

      paddingRight:
        FixxamTokens.spacing.xs,

      flexDirection: "row",

      alignItems: "center",

      alignSelf:
        "flex-start",

      borderRadius:
        FixxamTokens.radius.sm,
    },

    callRowPressed: {
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

    callIcon: {
      width: 30,

      height: 30,

      marginRight:
        FixxamTokens.spacing.xs,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    callNumber: {
      maxWidth: 190,

      marginRight:
        FixxamTokens.spacing.xs,

      color:
        CustomerColors.primary,

      textDecorationLine:
        "underline",
    },

    /* ========================================================
       CALL BUTTON
    ======================================================== */

    callButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      alignSelf:
        "flex-start",

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

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    callButtonText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       MESSAGE
    ======================================================== */

    message: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 18,
    },
  });