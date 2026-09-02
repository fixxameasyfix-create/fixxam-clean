import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/* ============================================================
   TYPES
============================================================ */

interface Props {
  price: string;
  discount: string;
  days: string;
  saving: boolean;

  onChangeDiscount: (
    value: string,
  ) => void;

  onChangeDays: (
    value: string,
  ) => void;
}

/* ============================================================
   CONSTANTS
============================================================ */

const MIN_DISCOUNT = 1;
const MAX_DISCOUNT = 99;

const MIN_DAYS = 1;
const MAX_DAYS = 365;

/* ============================================================
   HELPERS
============================================================ */

function parseNumber(
  value: string,
): number {
  const normalized =
    value
      .replace(/,/g, "")
      .trim();

  if (!normalized) {
    return 0;
  }

  const parsed =
    Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

/* ============================================================
   COMPONENT
============================================================ */

function AddProductDiscount({
  price,
  discount,
  days,
  saving,
  onChangeDiscount,
  onChangeDays,
}: Props) {
  /* ==========================================================
     PRICE
  ========================================================== */

  const originalPrice =
    parseNumber(price);

  /* ==========================================================
     DISCOUNT CALCULATION
  ========================================================== */

  const calculation =
    useMemo(() => {
      const discountPercentage =
        parseNumber(discount);

      if (
        originalPrice <= 0 ||
        discountPercentage <= 0
      ) {
        return {
          discountedPrice: 0,
          savingAmount: 0,
          valid: false,
        };
      }

      const safePercentage =
        Math.min(
          MAX_DISCOUNT,
          Math.max(
            MIN_DISCOUNT,
            discountPercentage,
          ),
        );

      const savingAmount =
        originalPrice *
        (safePercentage / 100);

      const discountedPrice =
        originalPrice -
        savingAmount;

      return {
        discountedPrice:
          Number(
            discountedPrice.toFixed(2),
          ),

        savingAmount:
          Number(
            savingAmount.toFixed(2),
          ),

        valid:
          discountedPrice > 0,
      };
    }, [
      originalPrice,
      discount,
    ]);

  /* ==========================================================
     DAYS VALIDATION
  ========================================================== */

  const daysValue =
    parseNumber(days);

  const daysValid =
    Number.isInteger(daysValue) &&
    daysValue >= MIN_DAYS &&
    daysValue <= MAX_DAYS;

  /* ==========================================================
     DISCOUNT VALIDATION
  ========================================================== */

  const discountValue =
    parseNumber(discount);

  const discountValid =
    Number.isFinite(discountValue) &&
    discountValue >= MIN_DISCOUNT &&
    discountValue <= MAX_DISCOUNT;

  /* ==========================================================
     INPUT DISCOUNT
  ========================================================== */

  const handleDiscountChange =
    (value: string) => {
      if (saving) {
        return;
      }

      const sanitized =
        value.replace(
          /[^0-9.]/g,
          "",
        );

      const parts =
        sanitized.split(".");

      const normalized =
        parts.length > 2
          ? `${parts[0]}.${parts
              .slice(1)
              .join("")}`
          : sanitized;

      if (!normalized) {
        onChangeDiscount("");
        return;
      }

      const numericValue =
        Number(normalized);

      if (
        Number.isFinite(numericValue) &&
        numericValue > MAX_DISCOUNT
      ) {
        onChangeDiscount(
          String(MAX_DISCOUNT),
        );

        return;
      }

      onChangeDiscount(
        normalized,
      );
    };

  /* ==========================================================
     INPUT DAYS
  ========================================================== */

  const handleDaysChange =
    (value: string) => {
      if (saving) {
        return;
      }

      const sanitized =
        value.replace(
          /[^0-9]/g,
          "",
        );

      if (!sanitized) {
        onChangeDays("");
        return;
      }

      const numericValue =
        Number(sanitized);

      if (
        Number.isFinite(numericValue) &&
        numericValue > MAX_DAYS
      ) {
        onChangeDays(
          String(MAX_DAYS),
        );

        return;
      }

      onChangeDays(
        sanitized,
      );
    };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={styles.container}
    >
      {/* ====================================================
          HEADER
      ==================================================== */}

      <View
        style={styles.header}
      >
        <View
          style={styles.titleContainer}
        >
          <Text
            style={styles.title}
          >
            Discount
          </Text>

          <Text
            style={styles.subtitle}
          >
            Offer customers a special price
          </Text>
        </View>

        <View
          style={styles.discountBadge}
        >
          <Text
            style={styles.discountBadgeText}
          >
            %
          </Text>
        </View>
      </View>

      {/* ====================================================
          ORIGINAL PRICE
      ==================================================== */}

      <View
        style={styles.priceCard}
      >
        <Text
          style={styles.label}
        >
          Original price
        </Text>

        <Text
          style={styles.originalPrice}
        >
          ₦
          {originalPrice.toLocaleString(
            "en-NG",
            {
              minimumFractionDigits:
                2,
              maximumFractionDigits:
                2,
            },
          )}
        </Text>
      </View>

      {/* ====================================================
          DISCOUNT PERCENTAGE
      ==================================================== */}

      <View
        style={styles.inputSection}
      >
        <Text
          style={styles.label}
        >
          Discount percentage
        </Text>

        <View
          style={[
            styles.inputWrapper,
            !discountValid &&
              discount.length > 0 &&
              styles.inputWrapperError,
          ]}
        >
          <TextInput
            value={discount}
            onChangeText={
              handleDiscountChange
            }
            placeholder="e.g. 20"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            inputMode="decimal"
            maxLength={5}
            editable={!saving}
            style={styles.input}
            accessibilityLabel="Discount percentage"
          />

          <Text
            style={styles.inputSuffix}
          >
            %
          </Text>
        </View>

        {!discountValid &&
          discount.length > 0 && (
            <Text
              style={styles.errorText}
            >
              Enter a discount between 1% and 99%.
            </Text>
          )}
      </View>

      {/* ====================================================
          DURATION
      ==================================================== */}

      <View
        style={styles.inputSection}
      >
        <Text
          style={styles.label}
        >
          Discount duration
        </Text>

        <View
          style={[
            styles.inputWrapper,
            !daysValid &&
              days.length > 0 &&
              styles.inputWrapperError,
          ]}
        >
          <TextInput
            value={days}
            onChangeText={
              handleDaysChange
            }
            placeholder="e.g. 7"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={3}
            editable={!saving}
            style={styles.input}
            accessibilityLabel="Discount duration in days"
          />

          <Text
            style={styles.inputSuffix}
          >
            days
          </Text>
        </View>

        {!daysValid &&
          days.length > 0 && (
            <Text
              style={styles.errorText}
            >
              Enter a duration between 1 and 365 days.
            </Text>
          )}
      </View>

      {/* ====================================================
          PREVIEW
      ==================================================== */}

      {calculation.valid &&
        discountValid && (
          <View
            style={styles.preview}
          >
            <View
              style={styles.previewRow}
            >
              <Text
                style={styles.previewLabel}
              >
                Discounted price
              </Text>

              <Text
                style={styles.discountedPrice}
              >
                ₦
                {calculation.discountedPrice.toLocaleString(
                  "en-NG",
                  {
                    minimumFractionDigits:
                      2,
                    maximumFractionDigits:
                      2,
                  },
                )}
              </Text>
            </View>

            <View
              style={styles.previewRow}
            >
              <Text
                style={styles.previewLabel}
              >
                Customer saves
              </Text>

              <Text
                style={styles.savingText}
              >
                ₦
                {calculation.savingAmount.toLocaleString(
                  "en-NG",
                  {
                    minimumFractionDigits:
                      2,
                    maximumFractionDigits:
                      2,
                  },
                )}
              </Text>
            </View>

            {daysValid && (
              <View
                style={styles.previewRow}
              >
                <Text
                  style={styles.previewLabel}
                >
                  Duration
                </Text>

                <Text
                  style={styles.durationText}
                >
                  {daysValue}{" "}
                  day
                  {daysValue === 1
                    ? ""
                    : "s"}
                </Text>
              </View>
            )}
          </View>
        )}

      {/* ====================================================
          INFO
      ==================================================== */}

      <Text
        style={styles.infoText}
      >
        The discount will be activated automatically
        when you publish this product.
      </Text>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginTop: 16,
      marginBottom: 16,
      padding: 16,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 16,
    },

    titleContainer: {
      flex: 1,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 18,
      color: "#64748B",
    },

    discountBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EFF6FF",
    },

    discountBadgeText: {
      fontSize: 18,
      fontWeight: "800",
      color: "#2563EB",
    },

    priceCard: {
      marginBottom: 16,
      padding: 12,
      borderRadius: 12,
      backgroundColor:
        "#F8FAFC",
    },

    label: {
      marginBottom: 8,
      fontSize: 13,
      fontWeight: "600",
      color: "#475569",
    },

    originalPrice: {
      fontSize: 18,
      fontWeight: "700",
      color: "#0F172A",
    },

    inputSection: {
      marginBottom: 16,
    },

    inputWrapper: {
      minHeight: 50,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
      borderRadius: 12,
      backgroundColor:
        "#FFFFFF",
    },

    inputWrapperError: {
      borderColor:
        "#DC2626",
    },

    input: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 16,
      color: "#0F172A",
    },

    inputSuffix: {
      paddingHorizontal: 14,
      fontSize: 14,
      fontWeight: "600",
      color: "#64748B",
    },

    errorText: {
      marginTop: 6,
      fontSize: 12,
      color: "#DC2626",
    },

    preview: {
      marginBottom: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor:
        "#F0FDF4",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
    },

    previewRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginVertical: 3,
    },

    previewLabel: {
      fontSize: 13,
      color: "#475569",
    },

    discountedPrice: {
      fontSize: 16,
      fontWeight: "800",
      color: "#166534",
    },

    savingText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#15803D",
    },

    durationText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#166534",
    },

    infoText: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 17,
      color: "#64748B",
    },
  });

export default memo(
  AddProductDiscount,
);