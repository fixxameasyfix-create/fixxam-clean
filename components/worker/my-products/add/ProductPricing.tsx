import React, {
  memo,
  useCallback,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppInput,
} from "@/components/ui";

import {
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  price: string;

  stock: string;

  onChangePrice: (
    value: string,
  ) => void;

  onChangeStock: (
    value: string,
  ) => void;
};

/* ============================================================
   HELPERS
============================================================ */

function sanitizePrice(
  value: string,
): string {
  const cleaned =
    value.replace(
      /[^0-9.]/g,
      "",
    );

  const [
    integerPart = "",
    ...decimalParts
  ] =
    cleaned.split(".");

  if (
    decimalParts.length === 0
  ) {
    return integerPart;
  }

  const decimalPart =
    decimalParts
      .join("")
      .slice(
        0,
        2,
      );

  return `${integerPart}.${decimalPart}`;
}

function sanitizeStock(
  value: string,
): string {
  return value.replace(
    /[^0-9]/g,
    "",
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function ProductPricing({
  price,
  stock,
  onChangePrice,
  onChangeStock,
}: Props) {
  /* ==========================================================
     PRICE
  ========================================================== */

  const handlePriceChange =
    useCallback(
      (
        value: string,
      ) => {
        onChangePrice(
          sanitizePrice(
            value,
          ),
        );
      },
      [
        onChangePrice,
      ],
    );

  /* ==========================================================
     STOCK
  ========================================================== */

  const handleStockChange =
    useCallback(
      (
        value: string,
      ) => {
        onChangeStock(
          sanitizeStock(
            value,
          ),
        );
      },
      [
        onChangeStock,
      ],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.row
        }
      >
        {/* ====================================================
            PRICE
        ==================================================== */}

        <View
          style={
            styles.column
          }
        >
          <AppInput
            role="worker"
            label="Price (₦)"
            placeholder="0"
            value={
              price
            }
            onChangeText={
              handlePriceChange
            }
            keyboardType="decimal-pad"
            inputMode="decimal"
            returnKeyType="next"
            accessibilityLabel="Product price"
          />
        </View>

        {/* ====================================================
            STOCK
        ==================================================== */}

        <View
          style={
            styles.column
          }
        >
          <AppInput
            role="worker"
            label="Stock"
            placeholder="0"
            value={
              stock
            }
            onChangeText={
              handleStockChange
            }
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="done"
            accessibilityLabel="Product stock quantity"
          />
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedProductPricing =
  memo(
    ProductPricing,
  );

MemoizedProductPricing.displayName =
  "ProductPricing";

export default MemoizedProductPricing;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    row: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.md,
    },

    column: {
      flex: 1,

      minWidth: 0,
    },
  });