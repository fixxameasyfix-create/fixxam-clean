import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

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
  PRODUCT_REVIEW_MAX_LENGTH,
  PRODUCT_REVIEW_MIN_LENGTH,
} from "@/services/products/productViewService";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  visible: boolean;

  productName: string;

  submitting?: boolean;

  onClose: () => void;

  onSubmit: (
    rating: number,
    comment: string,
  ) => Promise<void> | void;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const STAR_VALUES = [
  1,
  2,
  3,
  4,
  5,
] as const;

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function getRatingLabel(
  rating: number,
): string {
  switch (rating) {
    case 1:
      return "Poor";

    case 2:
      return "Fair";

    case 3:
      return "Good";

    case 4:
      return "Very Good";

    case 5:
      return "Excellent";

    default:
      return "Select 1 to 5 stars";
  }
}

/* ==============================================================
   COMPONENT
============================================================== */

function ProductReviewModal({
  visible,
  productName,
  submitting = false,
  onClose,
  onSubmit,
}: Props) {
  const [
    rating,
    setRating,
  ] =
    useState(0);

  const [
    comment,
    setComment,
  ] =
    useState("");

  const [
    validationError,
    setValidationError,
  ] =
    useState("");

  /* ============================================================
     RESET
  ============================================================ */

  useEffect(() => {
    if (!visible) {
      setRating(0);

      setComment("");

      setValidationError("");
    }
  }, [
    visible,
  ]);

  /* ============================================================
     VALUES
  ============================================================ */

  const safeProductName =
    cleanString(
      productName,
    ) ||
    "this product";

  const trimmedComment =
    comment.trim();

  const commentLength =
    comment.length;

  const ratingLabel =
    getRatingLabel(
      rating,
    );

  const canSubmit =
    !submitting &&
    rating >= 1 &&
    rating <= 5 &&
    trimmedComment.length >=
      PRODUCT_REVIEW_MIN_LENGTH &&
    trimmedComment.length <=
      PRODUCT_REVIEW_MAX_LENGTH;

  /* ============================================================
     CLOSE
  ============================================================ */

  const handleClose =
    useCallback(
      () => {
        if (submitting) {
          return;
        }

        setValidationError("");

        onClose();
      },
      [
        onClose,
        submitting,
      ],
    );

  /* ============================================================
     RATING
  ============================================================ */

  const handleRatingPress =
    useCallback(
      (
        value: number,
      ) => {
        if (submitting) {
          return;
        }

        setRating(
          value,
        );

        if (
          validationError
        ) {
          setValidationError(
            "",
          );
        }
      },
      [
        submitting,
        validationError,
      ],
    );

  /* ============================================================
     COMMENT
  ============================================================ */

  const handleCommentChange =
    useCallback(
      (
        value: string,
      ) => {
        setComment(
          value,
        );

        if (
          validationError
        ) {
          setValidationError(
            "",
          );
        }
      },
      [
        validationError,
      ],
    );

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit =
    useCallback(
      async () => {
        if (submitting) {
          return;
        }

        if (
          rating < 1 ||
          rating > 5
        ) {
          setValidationError(
            "Select a rating from 1 to 5 stars.",
          );

          return;
        }

        if (
          trimmedComment.length <
          PRODUCT_REVIEW_MIN_LENGTH
        ) {
          setValidationError(
            `Write at least ${PRODUCT_REVIEW_MIN_LENGTH} characters.`,
          );

          return;
        }

        if (
          trimmedComment.length >
          PRODUCT_REVIEW_MAX_LENGTH
        ) {
          setValidationError(
            `Review cannot exceed ${PRODUCT_REVIEW_MAX_LENGTH} characters.`,
          );

          return;
        }

        setValidationError("");

        await onSubmit(
          rating,
          trimmedComment,
        );
      },
      [
        onSubmit,
        rating,
        submitting,
        trimmedComment,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        handleClose
      }
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
        style={
          styles.keyboardView
        }
      >
        <View
          style={
            styles.overlay
          }
        >
          {/* ==================================================
              BACKDROP
          ================================================== */}

          <Pressable
            style={
              StyleSheet.absoluteFill
            }
            onPress={
              handleClose
            }
            accessibilityRole="button"
            accessibilityLabel="Close product review"
          />

          {/* ==================================================
              MODAL CARD
          ================================================== */}

          <View
            style={
              styles.card
            }
          >
            {/* ================================================
                HEADER
            ================================================ */}

            <View
              style={
                styles.header
              }
            >
              <View
                style={
                  styles.headerText
                }
              >
                <AppText
                  variant="heading3"
                  weight="bold"
                  style={
                    styles.title
                  }
                >
                  Write a Review
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  numberOfLines={
                    2
                  }
                  style={
                    styles.productName
                  }
                >
                  {safeProductName}
                </AppText>
              </View>

              <Pressable
                disabled={
                  submitting
                }
                hitSlop={
                  8
                }
                onPress={
                  handleClose
                }
                accessibilityRole="button"
                accessibilityLabel="Close review"
                style={({
                  pressed,
                }) => [
                  styles.closeButton,

                  pressed &&
                  !submitting
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

            {/* ================================================
                STAR RATING
            ================================================ */}

            <View
              style={
                styles.ratingSection
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.ratingTitle
                }
              >
                Rate this product
              </AppText>

              <View
                style={
                  styles.starsRow
                }
              >
                {STAR_VALUES.map(
                  value => {
                    const selected =
                      value <=
                      rating;

                    return (
                      <Pressable
                        key={
                          value
                        }
                        disabled={
                          submitting
                        }
                        hitSlop={
                          4
                        }
                        onPress={() =>
                          handleRatingPress(
                            value,
                          )
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`${value} star rating`}
                        accessibilityState={{
                          selected:
                            rating ===
                            value,

                          disabled:
                            submitting,
                        }}
                        style={({
                          pressed,
                        }) => [
                          styles.starButton,

                          pressed &&
                          !submitting
                            ? styles.pressed
                            : null,
                        ]}
                      >
                        <AppIcon
                          name="star"
                          size="lg"
                          color={
                            selected
                              ? "#F5A623"
                              : Colors.textMuted
                          }
                        />
                      </Pressable>
                    );
                  },
                )}
              </View>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.ratingLabel
                }
              >
                {ratingLabel}
              </AppText>
            </View>

            {/* ================================================
                INPUT
            ================================================ */}

            <View
              style={[
                styles.inputContainer,

                validationError
                  ? styles.inputContainerError
                  : null,
              ]}
            >
              <TextInput
                value={
                  comment
                }
                editable={
                  !submitting
                }
                multiline
                maxLength={
                  PRODUCT_REVIEW_MAX_LENGTH
                }
                placeholder="Share your experience with this product..."
                placeholderTextColor={
                  Colors.textMuted
                }
                onChangeText={
                  handleCommentChange
                }
                textAlignVertical="top"
                autoCorrect
                autoCapitalize="sentences"
                returnKeyType="default"
                accessibilityLabel="Product review comment"
                style={
                  styles.input
                }
              />

              <View
                style={
                  styles.inputFooter
                }
              >
                <View
                  style={
                    styles.errorArea
                  }
                >
                  {validationError ? (
                    <AppText
                      variant="caption"
                      style={
                        styles.errorText
                      }
                    >
                      {validationError}
                    </AppText>
                  ) : null}
                </View>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.characterCount
                  }
                >
                  {commentLength}/
                  {PRODUCT_REVIEW_MAX_LENGTH}
                </AppText>
              </View>
            </View>

            {/* ================================================
                ACTIONS
            ================================================ */}

            <View
              style={
                styles.actions
              }
            >
              <Pressable
                disabled={
                  submitting
                }
                onPress={
                  handleClose
                }
                accessibilityRole="button"
                accessibilityLabel="Cancel review"
                style={({
                  pressed,
                }) => [
                  styles.cancelButton,

                  pressed &&
                  !submitting
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.cancelText
                  }
                >
                  Cancel
                </AppText>
              </Pressable>

              <Pressable
                disabled={
                  !canSubmit
                }
                onPress={() => {
                  void handleSubmit();
                }}
                accessibilityRole="button"
                accessibilityLabel="Submit product review"
                accessibilityState={{
                  disabled:
                    !canSubmit,

                  busy:
                    submitting,
                }}
                style={({
                  pressed,
                }) => [
                  styles.submitButton,

                  !canSubmit
                    ? styles.submitButtonDisabled
                    : null,

                  pressed &&
                  canSubmit
                    ? styles.submitPressed
                    : null,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      Colors.textInverse
                    }
                  />
                ) : (
                  <>
                    <AppIcon
                      name="messages"
                      size="sm"
                      color={
                        Colors.textInverse
                      }
                    />

                    <AppText
                      variant="bodyMedium"
                      weight="bold"
                      style={
                        styles.submitText
                      }
                    >
                      Submit
                    </AppText>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    keyboardView: {
      flex:
        1,
    },

    overlay: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      backgroundColor:
        "rgba(0, 0, 0, 0.35)",
    },

    card: {
      width:
        "100%",

      maxWidth:
        420,

      padding:
        FixxamTokens.spacing.md,

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

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    headerText: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    productName: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    closeButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    /* ==========================================================
       RATING
    ========================================================== */

    ratingSection: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    ratingTitle: {
      color:
        Colors.textPrimary,

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    starsRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    starButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    ratingLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ==========================================================
       COMMENT
    ========================================================== */

    inputContainer: {
      minHeight:
        150,

      padding:
        FixxamTokens.spacing.sm,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    inputContainerError: {
      borderColor:
        Colors.error,
    },

    input: {
      minHeight:
        100,

      padding:
        0,

      color:
        Colors.textPrimary,

      fontSize:
        15,

      lineHeight:
        21,
    },

    inputFooter: {
      minHeight:
        20,

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",

      marginTop:
        FixxamTokens.spacing.xs,
    },

    errorArea: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    errorText: {
      color:
        Colors.error,
    },

    characterCount: {
      flexShrink:
        0,
    },

    /* ==========================================================
       ACTIONS
    ========================================================== */

    actions: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "flex-end",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.md,
    },

    cancelButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    cancelText: {
      color:
        Colors.textPrimary,
    },

    submitButton: {
      minWidth:
        110,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    submitButtonDisabled: {
      opacity:
        0.45,
    },

    submitText: {
      color:
        Colors.textInverse,
    },

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
    },

    submitPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });

export default memo(
  ProductReviewModal,
);