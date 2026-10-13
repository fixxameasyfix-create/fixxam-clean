import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  cleanString,
  formatReviewDate,
  getInitial,
  normalizeRating,
  STAR_COUNT,
  type WorkerReview,
} from "./reviewUtils";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  review: WorkerReview;

  isOwnReview?: boolean;

  onEdit?: (
    review: WorkerReview,
  ) => void;

  onSayAgain?: (
    review: WorkerReview,
  ) => void;
};

/* ==============================================================
   REVIEW STARS
============================================================== */

const ReviewStars =
  memo(function ReviewStars({
    rating,
  }: {
    rating: number;
  }) {
    const normalizedRating =
      normalizeRating(
        rating,
      );

    const activeStars =
      Math.round(
        normalizedRating,
      );

    return (
      <View
        style={
          styles.ratingRow
        }
        accessible
        accessibilityLabel={`${normalizedRating.toFixed(
          1,
        )} out of 5 stars`}
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
                styles.starItem
              }
            >
              <AppIcon
                name="star"
                role="customer"
                size="xs"
                color={
                  index <
                  activeStars
                    ? Colors.warning
                    : Colors.disabled
                }
              />
            </View>
          ),
        )}
      </View>
    );
  });

ReviewStars.displayName =
  "ReviewStars";

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerReviewCard({
  review,
  isOwnReview = false,
  onEdit,
  onSayAgain,
}: Props) {
  const [
    menuVisible,
    setMenuVisible,
  ] =
    useState(false);

  const customerName =
    cleanString(
      review.customerName,
    ) ||
    "Customer";

  const comment =
    cleanString(
      review.comment,
    );

  const date =
    formatReviewDate(
      review.createdAt,
    );

  /* ============================================================
     MENU
  ============================================================ */

  const handleOpenMenu =
    useCallback(() => {
      if (
        !isOwnReview
      ) {
        return;
      }

      setMenuVisible(
        true,
      );
    }, [
      isOwnReview,
    ]);

  const handleCloseMenu =
    useCallback(() => {
      setMenuVisible(
        false,
      );
    }, []);

  const handleEdit =
    useCallback(() => {
      setMenuVisible(
        false,
      );

      onEdit?.(
        review,
      );
    }, [
      onEdit,
      review,
    ]);

  const handleSayAgain =
    useCallback(() => {
      setMenuVisible(
        false,
      );

      onSayAgain?.(
        review,
      );
    }, [
      onSayAgain,
      review,
    ]);

  return (
    <>
      <AppCard
        role="customer"
        variant="outlined"
        style={
          styles.card
        }
      >
        {/* CUSTOMER */}

        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.avatar
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.avatarText
              }
            >
              {getInitial(
                customerName,
              )}
            </AppText>
          </View>

          <View
            style={
              styles.customerInfo
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              numberOfLines={1}
            >
              {customerName}
            </AppText>

            <ReviewStars
              rating={
                review.rating
              }
            />
          </View>

          {/* DATE */}

          <View
            style={
              styles.headerRight
            }
          >
            {date ? (
              <AppText
                variant="caption"
                tone="muted"
                numberOfLines={1}
                style={
                  styles.date
                }
              >
                {date}
              </AppText>
            ) : null}

            {/* OWN REVIEW ACTION */}

            {isOwnReview ? (
              <Pressable
                onPress={
                  handleOpenMenu
                }
                accessibilityRole="button"
                accessibilityLabel="Review options"
                accessibilityState={{
                  expanded:
                    menuVisible,
                }}
                hitSlop={8}
                style={({
                  pressed,
                }) => [
                  styles.sayAgainButton,

                  pressed
                    ? styles.buttonPressed
                    : null,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="semibold"
                  style={
                    styles.sayAgainText
                  }
                >
                  Say again
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* COMMENT */}

        {comment ? (
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.comment
            }
          >
            {comment}
          </AppText>
        ) : null}
      </AppCard>

      {/* ========================================================
          REVIEW ACTION MENU
      ======================================================== */}

      <Modal
        visible={
          menuVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          handleCloseMenu
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
              handleCloseMenu
            }
            accessibilityRole="button"
            accessibilityLabel="Close review options"
          />

          <View
            style={
              styles.menu
            }
          >
            {/* EDIT */}

            <Pressable
              onPress={
                handleEdit
              }
              accessibilityRole="button"
              accessibilityLabel="Edit review"
              style={({
                pressed,
              }) => [
                styles.menuItem,

                pressed
                  ? styles.menuItemPressed
                  : null,
              ]}
            >
              <View
                style={
                  styles.menuIcon
                }
              >
                <AppIcon
                  name="edit"
                  role="customer"
                  size="sm"
                  color={
                    Colors.textPrimary
                  }
                />
              </View>

              <View
                style={
                  styles.menuContent
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                >
                  Edit
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.menuDescription
                  }
                >
                  Change this review
                </AppText>
              </View>
            </Pressable>

            <View
              style={
                styles.divider
              }
            />

            {/* SAY AGAIN */}

            <Pressable
              onPress={
                handleSayAgain
              }
              accessibilityRole="button"
              accessibilityLabel="Write another review"
              style={({
                pressed,
              }) => [
                styles.menuItem,

                pressed
                  ? styles.menuItemPressed
                  : null,
              ]}
            >
              <View
                style={
                  styles.menuIcon
                }
              >
                <AppIcon
                  name="messages"
                  role="customer"
                  size="sm"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.menuContent
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                >
                  Say again
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.menuDescription
                  }
                >
                  Write another review
                </AppText>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ==============================================================
   EXPORT
============================================================== */

const MemoizedWorkerReviewCard =
  memo(
    WorkerReviewCard,
  );

MemoizedWorkerReviewCard.displayName =
  "WorkerReviewCard";

export default MemoizedWorkerReviewCard;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatar: {
      width: 34,

      height: 34,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    avatarText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       CUSTOMER
    ======================================================== */

    customerInfo: {
      flex: 1,

      minWidth: 0,
    },

    /* ========================================================
       RATING
    ======================================================== */

    ratingRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop: 1,
    },

    starItem: {
      marginRight: 1,
    },

    /* ========================================================
       RIGHT SIDE
    ======================================================== */

    headerRight: {
      flexShrink: 0,

      alignItems:
        "flex-end",

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    date: {
      maxWidth: 95,
    },

    sayAgainButton: {
      marginTop: 4,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      paddingVertical: 3,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    sayAgainText: {
      color:
        CustomerColors.primary,
    },

    buttonPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
    },

    /* ========================================================
       COMMENT
    ======================================================== */

    comment: {
      marginTop:
        FixxamTokens.spacing.xs,

      paddingLeft: 42,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ACTION MENU
    ======================================================== */

    overlay: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      backgroundColor:
        "rgba(0, 0, 0, 0.16)",
    },

    menu: {
      width: "100%",

      maxWidth: 310,

      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    menuItem: {
      minHeight: 62,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    menuItemPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
    },

    menuIcon: {
      width: 34,

      height: 34,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    menuContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    menuDescription: {
      marginTop: 1,
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginLeft: 54,

      backgroundColor:
        Colors.divider,
    },
  });