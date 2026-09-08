import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

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

/* ============================================================
   TYPES
============================================================ */

type Product = {
  name: string;

  category: string;

  price: number;

  stock: number;

  description: string;

  delivery?: boolean;

  featured?: boolean;

  condition?:
    | "new"
    | "used";
};

type Props = {
  product: Product;
};

type InfoRowProps = {
  icon: AppIconName;

  label: string;

  value: string;
};

/* ============================================================
   HELPERS
============================================================ */

function getSafeNumber(
  value: unknown,
): number {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(value)
  ) {
    return Math.max(
      0,
      value,
    );
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      Number(
        value
          .replace(
            /[₦,\s]/g,
            "",
          )
          .trim(),
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return Math.max(
        0,
        parsed,
      );
    }
  }

  return 0;
}

function formatMoney(
  value: unknown,
): string {
  const amount =
    getSafeNumber(
      value,
    );

  return `₦${amount.toLocaleString(
    "en-NG",
    {
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatCondition(
  value:
    | "new"
    | "used"
    | undefined,
): string {
  return value === "used"
    ? "Used"
    : "New";
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  icon,
  label,
  value,
}: InfoRowProps) {
  return (
    <View
      style={
        styles.row
      }
    >
      <View
        style={
          styles.left
        }
      >
        <View
          style={
            styles.rowIcon
          }
        >
          <AppIcon
            name={
              icon
            }
            role="worker"
            size="sm"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.label
          }
        >
          {label}
        </AppText>
      </View>

      <AppText
        variant="bodyMedium"
        weight="bold"
        numberOfLines={1}
        style={
          styles.value
        }
      >
        {value}
      </AppText>
    </View>
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function ProductInfoCard({
  product,
}: Props) {
  const name =
    product.name?.trim() ||
    "Unnamed Product";

  const category =
    product.category?.trim() ||
    "Others";

  const description =
    product.description?.trim() ||
    "No description provided.";

  const stock =
    Math.floor(
      getSafeNumber(
        product.stock,
      ),
    );

  return (
    <View
      style={
        styles.card
      }
    >
      {/* ======================================================
          MAIN INFO
      ====================================================== */}

      <AppText
        variant="heading2"
        weight="bold"
        style={
          styles.name
        }
      >
        {name}
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.category
        }
      >
        {category}
      </AppText>

      <AppText
        variant="heading1"
        weight="bold"
        style={
          styles.price
        }
      >
        {formatMoney(
          product.price,
        )}
      </AppText>

      <View
        style={
          styles.divider
        }
      />

      {/* ======================================================
          DETAILS
      ====================================================== */}

      <InfoRow
        icon="package"
        label="Stock"
        value={String(
          stock,
        )}
      />

      <InfoRow
        icon="delivery"
        label="Delivery"
        value={
          product.delivery
            ? "Available"
            : "Not Available"
        }
      />

      <InfoRow
        icon="refresh"
        label="Condition"
        value={
          formatCondition(
            product.condition,
          )
        }
      />

      <InfoRow
        icon="star"
        label="Featured"
        value={
          product.featured
            ? "Yes"
            : "No"
        }
      />

      <View
        style={
          styles.divider
        }
      />

      {/* ======================================================
          DESCRIPTION
      ====================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.descriptionTitle
        }
      >
        Description
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.description
        }
      >
        {description}
      </AppText>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedProductInfoCard =
  memo(
    ProductInfoCard,
  );

MemoizedProductInfoCard.displayName =
  "ProductInfoCard";

export default MemoizedProductInfoCard;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       MAIN INFO
    ======================================================== */

    name: {
      color:
        Colors.textPrimary,
    },

    category: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    price: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        WorkerColors.primary,
    },

    divider: {
      height: 1,

      marginVertical:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       INFO ROW
    ======================================================== */

    row: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    left: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    rowIcon: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    label: {
      flex: 1,

      color:
        Colors.textSecondary,
    },

    value: {
      flexShrink: 1,

      textAlign:
        "right",

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       DESCRIPTION
    ======================================================== */

    descriptionTitle: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    description: {
      lineHeight: 22,

      color:
        Colors.textSecondary,
    },
  });