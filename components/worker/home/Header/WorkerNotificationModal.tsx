import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
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

import type {
  WorkerNotification,
} from "@/hooks/notifications/useWorkerNotifications";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  visible: boolean;

  loading: boolean;

  notifications:
    WorkerNotification[];

  onClose:
    () => void;

  onMarkAsRead:
    (
      notificationId: string,
    ) => Promise<void>;
};

type InfoRowProps = {
  icon:
    AppIconName;

  value:
    string;
};

/* ============================================================
   CONSTANTS
============================================================ */

const STAR_COUNT =
  5;

/* ============================================================
   HELPERS
============================================================ */

function getSafeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function getSafeRating(
  value: unknown,
): number | null {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return null;
  }

  if (
    value < 1 ||
    value > 5
  ) {
    return null;
  }

  return Math.round(
    value,
  );
}

function getNotificationType(
  notification:
    WorkerNotification,
): string {
  return getSafeString(
    notification.type,
  );
}

function isCallNotification(
  notification:
    WorkerNotification,
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

function isShopRequest(
  notification:
    WorkerNotification,
): boolean {
  return (
    getNotificationType(
      notification,
    ) ===
    "shop_request"
  );
}

/* ============================================================
   NOTIFICATION ICON
============================================================ */

function getNotificationIcon(
  notification:
    WorkerNotification,
): AppIconName {
  const type =
    getNotificationType(
      notification,
    );

  switch (type) {
    case "market_order":
      return "cart";

    case "shop_request":
      return "service";

    case "booking":
      return "jobs";

    case "service_request":
      return "professional";

    case "incoming_call":
    case "missed_call":
    case "call_update":
      return "phone";

    case "worker_review":
      return "star";

    case "message":
    case "system":
    default:
      return "notifications";
  }
}

/* ============================================================
   ACTION LABEL
============================================================ */

function getNotificationActionLabel(
  notification:
    WorkerNotification,
): string {
  const type =
    getNotificationType(
      notification,
    );

  switch (type) {
    case "market_order":
      return notification.action ===
        "order_created"
        ? "View order"
        : "View order update";

    case "message":
      return "View message";

    case "booking":
      return "View booking";

    case "service_request":
      return "View request";

    case "shop_request":
      return "View request";

    case "worker_review":
      return "View review";

    case "incoming_call":
      return "Open call";

    case "call_update":
      return "Open call";

    case "missed_call":
      return "";

    case "system":
    default:
      return "View details";
  }
}

/* ============================================================
   MARKET
============================================================ */

function isNewMarketOrder(
  notification:
    WorkerNotification,
): boolean {
  return (
    getNotificationType(
      notification,
    ) ===
      "market_order" &&
    notification.action ===
      "order_created"
  );
}

/* ============================================================
   REVIEW STARS
============================================================ */

const NotificationReviewStars =
  memo(
    function NotificationReviewStars({
      rating,
    }: {
      rating: number;
    }) {
      const safeRating =
        Math.min(
          5,
          Math.max(
            1,
            Math.round(
              rating,
            ),
          ),
        );

      return (
        <View
          style={
            styles.reviewRatingRow
          }
          accessible
          accessibilityLabel={`${safeRating} out of 5 stars`}
        >
          <View
            style={
              styles.reviewStars
            }
          >
            {Array.from({
              length:
                STAR_COUNT,
            }).map(
              (
                _,
                index,
              ) => (
                <View
                  key={
                    index
                  }
                  style={
                    styles.reviewStar
                  }
                >
                  <AppIcon
                    name="star"
                    role="worker"
                    size="xs"
                    color={
                      index <
                      safeRating
                        ? Colors.warning
                        : Colors.disabled
                    }
                  />
                </View>
              ),
            )}
          </View>

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.reviewRatingText
            }
          >
            {safeRating.toFixed(
              1,
            )}
          </AppText>
        </View>
      );
    },
  );

NotificationReviewStars.displayName =
  "NotificationReviewStars";

/* ============================================================
   COMPONENT
============================================================ */

function WorkerNotificationModal({
  visible,
  loading,
  notifications,
  onClose,
  onMarkAsRead,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const [
    openingId,
    setOpeningId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  /* ==========================================================
     RESET STATE
  ========================================================== */

  useEffect(() => {
    if (!visible) {
      setOpeningId(
        null,
      );
    }
  }, [
    visible,
  ]);

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
     MARK READ
  ========================================================== */

  const markAsRead =
    useCallback(
      (
        notification:
          WorkerNotification,
      ) => {
        if (
          notification.read
        ) {
          return;
        }

        void onMarkAsRead(
          notification.id,
        ).catch(
          error => {
            console.error(
              "FIXXAM_WORKER_NOTIFICATION_MARK_READ_ERROR:",
              {
                notificationId:
                  notification.id,

                error,
              },
            );

            Toast.show({
              type:
                "error",

              text1:
                "Unable to update notification",

              text2:
                "The notification could not be marked as read.",
            });
          },
        );
      },
      [
        onMarkAsRead,
      ],
    );

  /* ==========================================================
     ROUTE NOTIFICATION
  ========================================================== */

  const routeNotification =
    useCallback(
      (
        notification:
          WorkerNotification,
      ) => {
        const notificationType =
          getNotificationType(
            notification,
          );

        /* ====================================================
           FIXXAM VOICE — LIVE CALL
        ==================================================== */

        if (
          notificationType ===
            "incoming_call" ||
          notificationType ===
            "call_update"
        ) {
          const callId =
            getSafeString(
              notification.callId,
            ) ||
            getSafeString(
              notification.entityId,
            );

          if (!callId) {
            console.error(
              "FIXXAM_WORKER_CALL_NOTIFICATION_MISSING_CALL_ID:",
              {
                notificationId:
                  notification.id,

                type:
                  notification.type,

                entityId:
                  notification.entityId,
              },
            );

            Toast.show({
              type:
                "error",

              text1:
                "Call unavailable",

              text2:
                "This notification does not contain a valid Fixxam Voice call ID.",
            });

            return;
          }

          /*
           * Close Bell before entering
           * the shared Fixxam Voice screen.
           */
          onClose();

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
           FIXXAM VOICE — MISSED CALL

           A missed call is already terminal.
           Never reopen the LiveKit room.
        ==================================================== */

        if (
          notificationType ===
          "missed_call"
        ) {
          Toast.show({
            type:
              "info",

            text1:
              "Missed call",

            text2:
              getSafeString(
                notification.message,
              ) ||
              "This Fixxam Voice call has already ended.",
          });

          return;
        }

        /* ====================================================
           WORKER REVIEW
        ==================================================== */

        if (
          notificationType ===
          "worker_review"
        ) {
          const reviewId =
            getSafeString(
              notification.reviewId,
            );

          const customerId =
            getSafeString(
              notification.customerId,
            );

          onClose();

          router.push({
            pathname:
              "/(worker)/reviews",

            params: {
              ...(reviewId
                ? {
                    reviewId,
                  }
                : {}),

              ...(customerId
                ? {
                    customerId,
                  }
                : {}),
            },
          } as never);

          return;
        }

        /* ====================================================
           BOOKING
        ==================================================== */

        if (
          notificationType ===
          "booking"
        ) {
          const bookingId =
            getSafeString(
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

          onClose();

          router.push({
            pathname:
              "/(worker)/orders/[orderId]",

            params: {
              orderId:
                bookingId,
            },
          } as never);

          return;
        }

        /* ====================================================
           MARKET ORDER
        ==================================================== */

        if (
          notificationType ===
          "market_order"
        ) {
          const orderId =
            getSafeString(
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

          onClose();

          router.push({
            pathname:
              "/(worker)/orders/market/[market]",

            params: {
              market:
                orderId,

              orderId,

              orderType:
                "market",
            },
          } as never);

          return;
        }

        /* ====================================================
           SERVICE REQUEST
        ==================================================== */

        if (
          notificationType ===
          "service_request"
        ) {
          onClose();

          router.push(
            "/(worker)/new-job" as never,
          );

          return;
        }

        /* ====================================================
           SHOP REQUEST
        ==================================================== */

        if (
          notificationType ===
          "shop_request"
        ) {
          const requestId =
            getSafeString(
              notification.requestId,
            );

          if (!requestId) {
            console.error(
              "FIXXAM_WORKER_SHOP_NOTIFICATION_MISSING_REQUEST_ID:",
              {
                notificationId:
                  notification.id,

                action:
                  notification.action,

                type:
                  notification.type,
              },
            );

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

          onClose();

          router.push({
            pathname:
              "/(worker)/orders/shop-request/[requestId]",

            params: {
              requestId,
            },
          } as never);

          return;
        }

        /* ====================================================
           MESSAGE
        ==================================================== */

        if (
          notificationType ===
          "message"
        ) {
          const orderId =
            getSafeString(
              notification.orderId,
            );

          const customerId =
            getSafeString(
              notification.customerId,
            );

          const customerName =
            getSafeString(
              notification.customerName,
            );

          if (
            !orderId ||
            !customerId
          ) {
            Toast.show({
              type:
                "error",

              text1:
                "Chat unavailable",

              text2:
                "This message does not contain enough information to open the conversation.",
            });

            return;
          }

          onClose();

          router.push({
            pathname:
              "/(worker)/orders/market/chat",

            params: {
              orderId,

              customerId,

              customerName:
                customerName ||
                "Customer",
            },
          } as never);

          return;
        }

        /* ====================================================
           SYSTEM / GENERAL
        ==================================================== */

        Toast.show({
          type:
            "info",

          text1:
            getSafeString(
              notification.title,
            ) ||
            "Fixxam Notification",

          text2:
            getSafeString(
              notification.message,
            ) ||
            "No additional details are available for this notification.",
        });
      },
      [
        onClose,
      ],
    );

  /* ==========================================================
     OPEN NOTIFICATION
  ========================================================== */

  const handleNotificationPress =
    useCallback(
      (
        notification:
          WorkerNotification,
      ) => {
        const notificationId =
          getSafeString(
            notification.id,
          );

        if (
          !notificationId ||
          openingId ===
            notificationId
        ) {
          return;
        }

        setOpeningId(
          notificationId,
        );

        /*
         * Mark as read without blocking
         * navigation.
         */
        markAsRead(
          notification,
        );

        /*
         * Every notification now goes
         * through the central router.
         *
         * Incoming Fixxam Voice can therefore
         * open the exact call using callId.
         */
        routeNotification(
          notification,
        );

        setOpeningId(
          null,
        );
      },
      [
        markAsRead,
        openingId,
        routeNotification,
      ],
    );

  /* ==========================================================
     RENDER NOTIFICATION
  ========================================================== */

  const renderNotification =
    useCallback(
      ({
        item:
          notification,
      }: {
        item:
          WorkerNotification;
      }) => {
        const notificationType =
          getNotificationType(
            notification,
          );

        const newMarketOrder =
          isNewMarketOrder(
            notification,
          );

        const shopRequest =
          isShopRequest(
            notification,
          );

        const isWorkerReview =
          notificationType ===
          "worker_review";

        const callNotification =
          isCallNotification(
            notification,
          );

        const icon =
          getNotificationIcon(
            notification,
          );

        const title =
          getSafeString(
            notification.title,
          ) ||
          (
            shopRequest
              ? "You have a new shop request"
              : isWorkerReview
                ? "New Review"
                : callNotification
                  ? "Fixxam Voice"
                  : "Fixxam Notification"
          );

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

        const message =
          getSafeString(
            notification.message,
          );

        const reviewComment =
          getSafeString(
            notification.reviewComment,
          );

        const reviewRating =
          getSafeRating(
            notification.rating,
          );

        const actionLabel =
          getNotificationActionLabel(
            notification,
          );

        const isOpening =
          openingId ===
          notification.id;

        return (
          <Pressable
            onPress={() => {
              handleNotificationPress(
                notification,
              );
            }}
            disabled={
              isOpening
            }
            accessibilityRole="button"
            accessibilityLabel={
              message
                ? `${title}. ${message}`
                : title
            }
            accessibilityHint={
              notificationType ===
                "incoming_call" ||
              notificationType ===
                "call_update"
                ? "Marks this notification as read and opens the Fixxam Voice call."
                : notificationType ===
                    "missed_call"
                  ? "Marks this missed call notification as read."
                  : shopRequest
                    ? "Marks this notification as read and opens the Shop request."
                    : isWorkerReview
                      ? "Marks this review notification as read and opens your reviews."
                      : "Marks this notification as read and opens the related update."
            }
            style={({
              pressed,
            }) => [
              styles.card,

              callNotification
                ? styles.callCard
                : null,

              !notification.read
                ? styles.unreadCard
                : null,

              newMarketOrder
                ? styles.marketOrderCard
                : null,

              shopRequest
                ? styles.shopRequestCard
                : null,

              isWorkerReview
                ? styles.reviewCard
                : null,

              pressed &&
              !isOpening
                ? styles.pressed
                : null,

              isOpening
                ? styles.openingCard
                : null,
            ]}
          >
            {/* ICON */}

            <View
              style={[
                styles.cardIcon,

                !notification.read
                  ? styles.unreadIcon
                  : null,

                callNotification
                  ? styles.callIcon
                  : null,

                shopRequest
                  ? styles.shopRequestIcon
                  : null,

                isWorkerReview
                  ? styles.reviewIcon
                  : null,
              ]}
            >
              {isOpening ? (
                <ActivityIndicator
                  size="small"
                  color={
                    WorkerColors.primary
                  }
                />
              ) : (
                <AppIcon
                  name={
                    icon
                  }
                  role="worker"
                  size="md"
                  color={
                    isWorkerReview
                      ? Colors.warning
                      : WorkerColors.primary
                  }
                />
              )}
            </View>

            {/* CONTENT */}

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
                  numberOfLines={
                    2
                  }
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

              {/* FIXXAM VOICE */}

              {callNotification ? (
                <View
                  style={
                    styles.callLabelContainer
                  }
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    numberOfLines={
                      1
                    }
                    style={
                      styles.callLabel
                    }
                  >
                    FIXXAM VOICE
                  </AppText>
                </View>
              ) : null}

              {/* MARKET */}

              {newMarketOrder ? (
                <View
                  style={
                    styles.marketLabelContainer
                  }
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    numberOfLines={
                      1
                    }
                    style={
                      styles.marketOrderLabel
                    }
                  >
                    NEW MARKET ORDER
                  </AppText>
                </View>
              ) : null}

              {/* SHOP */}

              {shopRequest ? (
                <View
                  style={
                    styles.shopLabelContainer
                  }
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    numberOfLines={
                      1
                    }
                    style={
                      styles.shopRequestLabel
                    }
                  >
                    NEW SHOP REQUEST
                  </AppText>
                </View>
              ) : null}

              {/* REVIEW */}

              {isWorkerReview ? (
                <View
                  style={
                    styles.reviewLabelContainer
                  }
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    numberOfLines={
                      1
                    }
                    style={
                      styles.reviewLabel
                    }
                  >
                    NEW REVIEW
                  </AppText>
                </View>
              ) : null}

              {/* CUSTOMER */}

              {!callNotification &&
              customerName ? (
                <AppText
                  variant="body"
                  weight="bold"
                  numberOfLines={
                    1
                  }
                  style={
                    styles.customerName
                  }
                >
                  {customerName}
                </AppText>
              ) : null}

              {/* REVIEW RATING */}

              {isWorkerReview &&
              reviewRating !==
                null ? (
                <NotificationReviewStars
                  rating={
                    reviewRating
                  }
                />
              ) : null}

              {/* REVIEW COMMENT */}

              {isWorkerReview &&
              reviewComment ? (
                <View
                  style={
                    styles.reviewCommentContainer
                  }
                >
                  <AppText
                    variant="caption"
                    tone="secondary"
                    numberOfLines={
                      4
                    }
                    style={
                      styles.reviewComment
                    }
                  >
                    {reviewComment}
                  </AppText>
                </View>
              ) : null}

              {/* SERVICE */}

              {!isWorkerReview &&
              !callNotification &&
              service ? (
                <InfoRow
                  icon="jobs"
                  value={
                    service
                  }
                />
              ) : null}

              {/* LOCATION */}

              {!isWorkerReview &&
              !callNotification &&
              location ? (
                <InfoRow
                  icon="location"
                  value={
                    location
                  }
                />
              ) : null}

              {/* MESSAGE */}

              {!isWorkerReview &&
              message ? (
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

              {/* REVIEW MESSAGE FALLBACK */}

              {isWorkerReview &&
              !reviewComment &&
              message ? (
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

              {/* ACTION */}

              {actionLabel ? (
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
                    role="worker"
                    size="xs"
                    color={
                      WorkerColors.primary
                    }
                  />
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      },
      [
        handleNotificationPress,
        openingId,
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

        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,

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
              styles.handle
            }
          />

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
                Jobs, Shop requests, orders, messages, reviews and Fixxam Voice updates.
              </AppText>
            </View>

            <Pressable
              onPress={
                onClose
              }
              hitSlop={
                8
              }
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
                Getting your latest Fixxam updates.
              </AppText>
            </View>
          ) : safeNotifications.length ===
            0 ? (
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
                New jobs, Shop requests, orders, messages, reviews and Fixxam Voice updates will appear here.
              </AppText>
            </View>
          ) : (
            <FlatList
              data={
                safeNotifications
              }
              keyExtractor={
                item =>
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
            numberOfLines={
              2
            }
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
    overlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    sheet: {
      width:
        "100%",

      maxHeight:
        "84%",

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
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

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

    list: {
      paddingBottom:
        FixxamTokens.spacing.sm,
    },

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
        FixxamTokens.size
          .avatarLg,

      height:
        FixxamTokens.size
          .avatarLg,

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

    callCard: {
      borderColor:
        Colors.border,
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

    shopRequestCard: {
      borderColor:
        WorkerColors.primary,
    },

    reviewCard: {
      borderColor:
        Colors.warning,
    },

    openingCard: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    cardIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

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

    callIcon: {
      backgroundColor:
        WorkerColors.primarySoft,
    },

    shopRequestIcon: {
      backgroundColor:
        WorkerColors.primarySoft,
    },

    reviewIcon: {
      backgroundColor:
        Colors.disabledBackground,
    },

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
        WorkerColors.primarySoft,
    },

    callLabel: {
      letterSpacing: 0.5,

      color:
        WorkerColors.primary,
    },

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

    shopLabelContainer: {
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

    shopRequestLabel: {
      letterSpacing: 0.5,

      color:
        WorkerColors.primary,
    },

    reviewLabelContainer: {
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
        Colors.disabledBackground,
    },

    reviewLabel: {
      letterSpacing: 0.5,

      color:
        Colors.warning,
    },

    customerName: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    reviewRatingRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    reviewStars: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    reviewStar: {
      marginRight:
        FixxamTokens.spacing.xxs,
    },

    reviewRatingText: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    reviewCommentContainer: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingLeft:
        FixxamTokens.spacing.sm,

      borderLeftWidth: 2,

      borderLeftColor:
        Colors.warning,
    },

    reviewComment: {
      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

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

    message: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    openRow: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.xs,

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