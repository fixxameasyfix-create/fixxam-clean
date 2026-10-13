import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  jobSuccess: number;

  rating: number;

  completedJobs: number;

  reviews: number;
};

/* ============================================================
   HELPERS
============================================================ */

function clampPercentage(
  value: number,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(value),
    ),
  );
}

function safeCount(
  value: number,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

function safeRating(
  value: number,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      value,
    ),
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function JobSuccessCard({
  jobSuccess,
  rating,
  completedJobs,
  reviews,
}: Props) {
  const success =
    useMemo(
      () =>
        clampPercentage(
          jobSuccess,
        ),
      [
        jobSuccess,
      ],
    );

  const displayRating =
    useMemo(
      () => {
        const value =
          safeRating(
            rating,
          );

        if (
          value <= 0
        ) {
          return "New";
        }

        return value.toFixed(
          1,
        );
      },
      [
        rating,
      ],
    );

  const displayCompletedJobs =
    useMemo(
      () =>
        safeCount(
          completedJobs,
        ).toLocaleString(),
      [
        completedJobs,
      ],
    );

  const displayReviews =
    useMemo(
      () =>
        safeCount(
          reviews,
        ).toLocaleString(),
      [
        reviews,
      ],
    );

  return (
    <View>
      {/* =====================================================
          SECTION TITLE
      ===================================================== */}

      <AppText
        variant="bodyMedium"
        weight="semibold"
        style={
          styles.sectionTitle
        }
      >
        Performance
      </AppText>

      {/* =====================================================
          CARD
      ===================================================== */}

      <View
        style={
          styles.card
        }
      >
        {/* ===================================================
            JOB SUCCESS
        =================================================== */}

        <View
          style={
            styles.successSection
          }
        >
          <View
            style={
              styles.successHeader
            }
          >
            <View
              style={
                styles.successTitleRow
              }
            >
              <View
                style={
                  styles.successIcon
                }
              >
                <AppIcon
                  name="check"
                  role="worker"
                  size="xs"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <AppText
                variant="bodyMedium"
                weight="semibold"
                style={
                  styles.successTitle
                }
              >
                Job Success
              </AppText>
            </View>

            <AppText
              variant="bodyMedium"
              weight="semibold"
              style={
                styles.successValue
              }
            >
              {success}%
            </AppText>
          </View>

          {/* PROGRESS */}

          <View
            style={
              styles.progressTrack
            }
          >
            <View
              style={[
                styles.progressFill,

                {
                  width:
                    `${success}%`,
                },
              ]}
            />
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.successDescription
            }
          >
            Based on completed and cancelled jobs
          </AppText>
        </View>

        {/* ===================================================
            DIVIDER
        =================================================== */}

        <View
          style={
            styles.divider
          }
        />

        {/* ===================================================
            CUSTOMER RATING
        =================================================== */}

        <View
          style={
            styles.row
          }
        >
          <View
            style={
              styles.rowLeft
            }
          >
            <View
              style={
                styles.rowIcon
              }
            >
              <AppIcon
                name="star"
                role="worker"
                size="xs"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="body"
              style={
                styles.rowLabel
              }
            >
              Customer Rating
            </AppText>
          </View>

          <View
            style={
              styles.ratingValue
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              style={
                styles.rowValue
              }
            >
              {displayRating}
            </AppText>

            {displayRating !==
            "New" ? (
              <AppIcon
                name="star"
                role="worker"
                size="xs"
                color={
                  WorkerColors.primary
                }
              />
            ) : null}
          </View>
        </View>

        {/* ===================================================
            COMPLETED JOBS
        =================================================== */}

        <View
          style={
            styles.row
          }
        >
          <View
            style={
              styles.rowLeft
            }
          >
            <View
              style={
                styles.rowIcon
              }
            >
              <AppIcon
                name="jobs"
                role="worker"
                size="xs"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="body"
              style={
                styles.rowLabel
              }
            >
              Completed Jobs
            </AppText>
          </View>

          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.rowValue
            }
          >
            {displayCompletedJobs}
          </AppText>
        </View>

        {/* ===================================================
            CUSTOMER REVIEWS
        =================================================== */}

        <View
          style={[
            styles.row,
            styles.lastRow,
          ]}
        >
          <View
            style={
              styles.rowLeft
            }
          >
            <View
              style={
                styles.rowIcon
              }
            >
              <AppIcon
                name="reviews"
                role="worker"
                size="xs"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="body"
              style={
                styles.rowLabel
              }
            >
              Customer Reviews
            </AppText>
          </View>

          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.rowValue
            }
          >
            {displayReviews}
          </AppText>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   EXPORT
============================================================ */

export default memo(
  JobSuccessCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    sectionTitle: {
      marginLeft:
        FixxamTokens.spacing.xxs,

      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       SUCCESS
    ======================================================== */

    successSection: {
      padding:
        FixxamTokens.spacing.md,
    },

    successHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    successTitleRow: {
      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    successIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    successTitle: {
      flex:
        1,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    successValue: {
      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        WorkerColors.primary,
    },

    /* ========================================================
       PROGRESS
    ======================================================== */

    progressTrack: {
      width:
        "100%",

      height:
        8,

      marginTop:
        FixxamTokens.spacing.md,

      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    progressFill: {
      height:
        "100%",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    successDescription: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       ROWS
    ======================================================== */

    row: {
      minHeight:
        56,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    lastRow: {
      borderBottomWidth:
        0,
    },

    rowLeft: {
      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    rowIcon: {
      width:
        32,

      height:
        32,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    rowLabel: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    rowValue: {
      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    ratingValue: {
      marginLeft:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xxs,
    },
  });