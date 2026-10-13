import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
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
  Typography,
} from "@/theme";

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_REVIEW_LENGTH = 500;

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

/* ==============================================================
   COMPONENT
============================================================== */

function ProviderReviewForm() {
  const [
    rating,
    setRating,
  ] = useState(0);

  const [
    review,
    setReview,
  ] = useState("");

  /* ============================================================
     STATE
  ============================================================ */

  const cleanReview =
    review.trim();

  const ratingLabel =
    useMemo(
      () =>
        rating > 0
          ? RATING_LABELS[rating]
          : "",
      [rating],
    );

  const canSubmit =
    rating > 0 &&
    cleanReview.length >= 3;

  /* ============================================================
     RATING
  ============================================================ */

  const handleRating =
    useCallback(
      (
        value: number,
      ) => {
        setRating(
          value,
        );
      },
      [],
    );

  /* ============================================================
     REVIEW
  ============================================================ */

  const handleReviewChange =
    useCallback(
      (
        value: string,
      ) => {
        setReview(
          value.slice(
            0,
            MAX_REVIEW_LENGTH,
          ),
        );
      },
      [],
    );

  /* ============================================================
     SUBMIT
     Firebase will be connected in step 2.
  ============================================================ */

  const handleSubmit =
    useCallback(() => {
      if (
        !canSubmit
      ) {
        return;
      }

      /*
       * STEP 2:
       * Save provider review to Firebase.
       */
    }, [
      canSubmit,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.card
      }
    >
      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerIcon
          }
        >
          <AppIcon
            name="star"
            role="customer"
            size="sm"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
          >
            Say something about this provider
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            How was your experience?
          </AppText>
        </View>
      </View>

      {/* STARS */}

      <View
        style={
          styles.ratingSection
        }
      >
        <View
          style={
            styles.stars
          }
        >
          {[1, 2, 3, 4, 5].map(
            (
              value,
            ) => {
              const selected =
                value <=
                rating;

              return (
                <Pressable
                  key={
                    value
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Rate ${value} out of 5 stars`}
                  accessibilityState={{
                    selected,
                  }}
                  hitSlop={
                    6
                  }
                  onPress={() =>
                    handleRating(
                      value,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.starButton,

                    pressed
                      ? styles.starPressed
                      : null,
                  ]}
                >
                  <AppIcon
                    name="star"
                    role="customer"
                    size="lg"
                    color={
                      selected
                        ? Colors.warning
                        : Colors.textMuted
                    }
                  />
                </Pressable>
              );
            },
          )}
        </View>

        {rating > 0 ? (
          <View
            style={
              styles.ratingResult
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.ratingLabel
              }
            >
              {ratingLabel}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
            >
              {rating}.0 out of 5
            </AppText>
          </View>
        ) : (
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.ratingHint
            }
          >
            Tap a star to rate
          </AppText>
        )}
      </View>

      {/* REVIEW INPUT */}

      <View
        style={
          styles.inputContainer
        }
      >
        <TextInput
          value={
            review
          }
          onChangeText={
            handleReviewChange
          }
          placeholder="Tell others about your experience..."
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            CustomerColors.primary
          }
          multiline
          maxLength={
            MAX_REVIEW_LENGTH
          }
          textAlignVertical="top"
          autoCorrect
          accessibilityLabel="Write your review"
          style={
            styles.input
          }
        />

        <AppText
          variant="caption"
          tone="muted"
          style={
            styles.characterCount
          }
        >
          {review.length}/
          {MAX_REVIEW_LENGTH}
        </AppText>
      </View>

      {/* SUBMIT */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Submit review"
        accessibilityState={{
          disabled:
            !canSubmit,
        }}
        disabled={
          !canSubmit
        }
        onPress={
          handleSubmit
        }
        style={({
          pressed,
        }) => [
          styles.submitButton,

          !canSubmit
            ? styles.submitButtonDisabled
            : null,

          pressed &&
          canSubmit
            ? styles.submitButtonPressed
            : null,
        ]}
      >
        <AppIcon
          name="star"
          role="customer"
          size="xs"
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
          Submit Review
        </AppText>
      </Pressable>
    </View>
  );
}

export default memo(
  ProviderReviewForm,
);

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      padding: 6,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    headerIcon: {
      width: 24,

      height: 24,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft: 5,
    },

    subtitle: {
      marginTop: 0,
    },

    /* ========================================================
       RATING
    ======================================================== */

    ratingSection: {
      alignItems:
        "flex-start",

      marginTop: 4,
    },

    stars: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "flex-start",

      gap: 0,
    },

    starButton: {
      width: 32,

      height: 32,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    starPressed: {
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

    ratingResult: {
      alignItems:
        "flex-start",

      marginTop: 0,
    },

    ratingLabel: {
      color:
        Colors.textPrimary,
    },

    ratingHint: {
      marginTop: 0,
    },

    /* ========================================================
       INPUT
    ======================================================== */

    inputContainer: {
      marginTop: 5,

      paddingHorizontal: 7,

      paddingTop: 5,

      paddingBottom: 3,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.background,
    },

    input: {
      minHeight: 36,

      maxHeight: 52,

      padding: 0,

      fontSize: 13,

      lineHeight: 16,

      color:
        Colors.textPrimary,
    },

    characterCount: {
      alignSelf:
        "flex-end",

      marginTop: 0,
    },

    /* ========================================================
       SUBMIT
    ======================================================== */

    submitButton: {
      minHeight: 34,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 4,

      marginTop: 5,

      paddingHorizontal: 8,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        CustomerColors.primary,
    },

    submitButtonDisabled: {
      backgroundColor:
        Colors.disabled,
    },

    submitButtonPressed: {
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

    submitText: {
      color:
        Colors.textInverse,
    },
  });