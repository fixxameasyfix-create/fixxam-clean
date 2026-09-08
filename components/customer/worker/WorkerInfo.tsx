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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  firstName: string;

  surname: string;

  category?: string;

  subcategory?: string;

  rating: number;

  totalReviews: number;

  state?: string;

  lga?: string;

  hourlyRate?: number;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizeRating(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
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

function normalizeCount(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      value,
    ),
  );
}

function formatRate(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-NG",
    {
      maximumFractionDigits: 0,
    },
  ).format(value);
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerInfo({
  firstName,
  surname,
  category,
  subcategory,
  rating,
  totalReviews,
  state,
  lga,
  hourlyRate,
}: Props) {
  /* ============================================================
     NAME
  ============================================================ */

  const workerName =
    useMemo(() => {
      const name =
        [
          cleanString(
            firstName,
          ),
          cleanString(
            surname,
          ),
        ]
          .filter(
            Boolean,
          )
          .join(
            " ",
          );

      return (
        name ||
        "Worker"
      );
    }, [
      firstName,
      surname,
    ]);

  /* ============================================================
     SERVICE
  ============================================================ */

  const serviceLabel =
    useMemo(() => {
      const cleanCategory =
        cleanString(
          category,
        );

      const cleanSubcategory =
        cleanString(
          subcategory,
        );

      if (
        cleanCategory &&
        cleanSubcategory
      ) {
        return `${cleanCategory} • ${cleanSubcategory}`;
      }

      return (
        cleanSubcategory ||
        cleanCategory
      );
    }, [
      category,
      subcategory,
    ]);

  /* ============================================================
     LOCATION
  ============================================================ */

  const location =
    useMemo(
      () =>
        [
          cleanString(
            lga,
          ),
          cleanString(
            state,
          ),
        ]
          .filter(
            Boolean,
          )
          .join(
            ", ",
          ),
      [
        lga,
        state,
      ],
    );

  /* ============================================================
     SAFE VALUES
  ============================================================ */

  const safeRating =
    normalizeRating(
      rating,
    );

  const safeReviews =
    normalizeCount(
      totalReviews,
    );

  const safeHourlyRate =
    typeof hourlyRate ===
      "number" &&
    Number.isFinite(
      hourlyRate,
    ) &&
    hourlyRate >= 0
      ? hourlyRate
      : null;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          NAME
      ====================================================== */}

      <AppText
        variant="bodyMedium"
        weight="bold"
        numberOfLines={1}
      >
        {workerName}
      </AppText>

      {/* ======================================================
          RATING
      ====================================================== */}

      <View
        style={
          styles.metaRow
        }
      >
        <AppIcon
          name="star"
          role="customer"
          size="xs"
          color={
            Colors.warning
          }
        />

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.metaText
          }
        >
          {safeRating.toFixed(
            1,
          )}
        </AppText>

        <AppText
          variant="caption"
          tone="muted"
          style={
            styles.reviewText
          }
        >
          ({safeReviews})
        </AppText>
      </View>

      {/* ======================================================
          CATEGORY
      ====================================================== */}

      {serviceLabel ? (
        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={
            styles.category
          }
        >
          {serviceLabel}
        </AppText>
      ) : null}

      {/* ======================================================
          LOCATION
      ====================================================== */}

      {location ? (
        <View
          style={
            styles.locationRow
          }
        >
          <AppIcon
            name="location"
            role="customer"
            size="xs"
            state="muted"
          />

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.locationText
            }
          >
            {location}
          </AppText>
        </View>
      ) : null}

      {/* ======================================================
          HOURLY RATE
      ====================================================== */}

      {safeHourlyRate !==
      null ? (
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            styles.price
          }
        >
          ₦
          {formatRate(
            safeHourlyRate,
          )}
          /hr
        </AppText>
      ) : null}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       META
    ======================================================== */

    metaRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    metaText: {
      marginLeft:
        FixxamTokens.spacing.xxs,
    },

    reviewText: {
      marginLeft:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       SERVICE
    ======================================================== */

    category: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       LOCATION
    ======================================================== */

    locationRow: {
      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    locationText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       PRICE
    ======================================================== */

    price: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        CustomerColors.primary,
    },
  });

export default memo(
  WorkerInfo,
);