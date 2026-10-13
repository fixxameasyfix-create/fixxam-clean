import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  getSelectedRatingLabel,
  MAX_COMMENT_LENGTH,
  STAR_COUNT,
} from "./reviewUtils";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  workerName: string;

  selectedRating: number;

  comment: string;

  submitting: boolean;

  canSubmit: boolean;

  submitError: string | null;

  onSelectRating: (
    rating: number,
  ) => void;

  onCommentChange: (
    value: string,
  ) => void;

  onSubmit: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerReviewForm({
  workerName,
  selectedRating,
  comment,
  submitting,
  canSubmit,
  submitError,
  onSelectRating,
  onCommentChange,
  onSubmit,
}: Props) {
  const selectedRatingLabel =
    getSelectedRatingLabel(
      selectedRating,
    );

  /* ============================================================
     RATING PRESS
  ============================================================ */

  const handleRatingPress =
    useCallback(
      (
        value: number,
      ) => {
        if (
          submitting
        ) {
          return;
        }

        onSelectRating(
          value,
        );
      },
      [
        onSelectRating,
        submitting,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* TITLE */}

      <AppText
        variant="bodyMedium"
        weight="bold"
      >
        Say something about this provider
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        numberOfLines={1}
        style={
          styles.description
        }
      >
        Share your experience with {workerName}.
      </AppText>

      {/* RATING */}

      <View
        style={
          styles.ratingPicker
        }
      >
        {Array.from({
          length:
            STAR_COUNT,
        }).map(
          (
            _,
            index,
          ) => {
            const value =
              index + 1;

            const active =
              value <=
              selectedRating;

            return (
              <Pressable
                key={
                  value
                }
                disabled={
                  submitting
                }
                accessibilityRole="button"
                accessibilityLabel={`Rate ${value} out of 5 stars`}
                accessibilityState={{
                  selected:
                    active,

                  disabled:
                    submitting,
                }}
                hitSlop={
                  4
                }
                onPress={() =>
                  handleRatingPress(
                    value,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.ratingButton,

                  pressed &&
                  !submitting
                    ? styles.ratingButtonPressed
                    : null,
                ]}
              >
                <AppIcon
                  name="star"
                  role="customer"
                  size="md"
                  color={
                    active
                      ? Colors.warning
                      : Colors.disabled
                  }
                />
              </Pressable>
            );
          },
        )}
      </View>

      {/* RATING RESULT */}

      {selectedRating >
      0 ? (
        <View
          style={
            styles.selectedRating
          }
        >
          <AppText
            variant="caption"
            weight="bold"
          >
            {selectedRatingLabel}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.selectedRatingText
            }
          >
            {selectedRating}.0 out of 5
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

      {/* REVIEW INPUT */}

      <View
        style={
          styles.inputContainer
        }
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
            MAX_COMMENT_LENGTH
          }
          textAlignVertical="top"
          placeholder="Tell others about this provider..."
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            CustomerColors.primary
          }
          onChangeText={
            onCommentChange
          }
          accessibilityLabel="Write your review"
          style={
            styles.reviewInput
          }
        />

        <View
          style={
            styles.characterRow
          }
        >
          <AppText
            variant="caption"
            tone="muted"
          >
            {comment.length}/
            {MAX_COMMENT_LENGTH}
          </AppText>
        </View>
      </View>

      {/* ERROR */}

      {submitError ? (
        <View
          style={
            styles.formError
          }
        >
          <AppIcon
            name="info"
            role="customer"
            size="xs"
            color={
              Colors.error
            }
          />

          <AppText
            variant="caption"
            style={
              styles.formErrorText
            }
          >
            {submitError}
          </AppText>
        </View>
      ) : null}

      {/* SUBMIT */}

      <AppButton
        title={
          submitting
            ? "Submitting..."
            : "Submit Review"
        }
        role="customer"
        disabled={
          !canSubmit
        }
        onPress={
          onSubmit
        }
        style={
          styles.submitButton
        }
      />
    </View>
  );
}

/* ==============================================================
   EXPORT
============================================================== */

const MemoizedWorkerReviewForm =
  memo(
    WorkerReviewForm,
  );

MemoizedWorkerReviewForm.displayName =
  "WorkerReviewForm";

export default MemoizedWorkerReviewForm;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop: 6,

      paddingHorizontal: 10,

      paddingVertical: 8,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    description: {
      marginTop: 1,
    },

    /* ========================================================
       RATING
    ======================================================== */

    ratingPicker: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop: 5,
    },

    ratingButton: {
      width: 34,

      height: 34,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight: 1,

      borderRadius:
        FixxamTokens.radius.full,
    },

    ratingButtonPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    selectedRating: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop: 1,
    },

    selectedRatingText: {
      marginLeft:
        FixxamTokens.spacing.xs,
    },

    ratingHint: {
      marginTop: 1,
    },

    /* ========================================================
       INPUT
    ======================================================== */

    inputContainer: {
      marginTop: 5,

      paddingHorizontal: 7,

      paddingTop: 4,

      paddingBottom: 2,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    reviewInput: {
      minHeight: 38,

      maxHeight: 54,

      padding: 0,

      color:
        Colors.textPrimary,

      fontSize: 14,

      lineHeight: 18,
    },

    characterRow: {
      alignItems:
        "flex-end",

      marginTop: 0,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    formError: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginTop: 4,
    },

    formErrorText: {
      flex: 1,

      marginLeft: 4,

      color:
        Colors.error,
    },

    /* ========================================================
       SUBMIT
    ======================================================== */

    submitButton: {
      minHeight: 36,

      marginTop: 5,
    },
  });