import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
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
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

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

const MAX_DISCOUNT_DECIMALS = 2;

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

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

function formatNaira(
  value: number,
): string {
  const safeValue =
    Number.isFinite(value) &&
    value >= 0
      ? value
      : 0;

  return `₦${safeValue.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function sanitizeDiscount(
  value: string,
): string {
  const sanitized =
    value.replace(
      /[^0-9.]/g,
      "",
    );

  const [
    integerPart = "",
    ...decimalParts
  ] =
    sanitized.split(".");

  const decimalPart =
    decimalParts
      .join("")
      .slice(
        0,
        MAX_DISCOUNT_DECIMALS,
      );

  if (
    decimalParts.length === 0
  ) {
    return integerPart;
  }

  return `${integerPart}.${decimalPart}`;
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
  const [
    discountFocused,
    setDiscountFocused,
  ] =
    useState(false);

  const [
    daysFocused,
    setDaysFocused,
  ] =
    useState(false);

  /* ==========================================================
     PRICE
  ========================================================== */

  const originalPrice =
    useMemo(
      () =>
        parseNumber(
          price,
        ),
      [
        price,
      ],
    );

  /* ==========================================================
     VALUES
  ========================================================== */

  const discountValue =
    useMemo(
      () =>
        parseNumber(
          discount,
        ),
      [
        discount,
      ],
    );

  const daysValue =
    useMemo(
      () =>
        parseNumber(
          days,
        ),
      [
        days,
      ],
    );

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const discountValid =
    discountValue >=
      MIN_DISCOUNT &&
    discountValue <=
      MAX_DISCOUNT;

  const daysValid =
    Number.isInteger(
      daysValue,
    ) &&
    daysValue >=
      MIN_DAYS &&
    daysValue <=
      MAX_DAYS;

  const showDiscountError =
    discount.length > 0 &&
    !discountValid;

  const showDaysError =
    days.length > 0 &&
    !daysValid;

  /* ==========================================================
     CALCULATION
  ========================================================== */

  const calculation =
    useMemo(() => {
      if (
        originalPrice <= 0 ||
        !discountValid
      ) {
        return {
          discountedPrice:
            0,

          savingAmount:
            0,

          valid:
            false,
        };
      }

      const savingAmount =
        originalPrice *
        (discountValue /
          100);

      const discountedPrice =
        originalPrice -
        savingAmount;

      return {
        discountedPrice:
          Number(
            discountedPrice.toFixed(
              2,
            ),
          ),

        savingAmount:
          Number(
            savingAmount.toFixed(
              2,
            ),
          ),

        valid:
          discountedPrice >
          0,
      };
    }, [
      discountValid,
      discountValue,
      originalPrice,
    ]);

  /* ==========================================================
     DISCOUNT INPUT
  ========================================================== */

  const handleDiscountChange =
    useCallback(
      (
        value: string,
      ) => {
        if (saving) {
          return;
        }

        const normalized =
          sanitizeDiscount(
            value,
          );

        if (
          !normalized
        ) {
          onChangeDiscount(
            "",
          );

          return;
        }

        const numericValue =
          Number(
            normalized,
          );

        if (
          Number.isFinite(
            numericValue,
          ) &&
          numericValue >
            MAX_DISCOUNT
        ) {
          onChangeDiscount(
            String(
              MAX_DISCOUNT,
            ),
          );

          return;
        }

        onChangeDiscount(
          normalized,
        );
      },
      [
        onChangeDiscount,
        saving,
      ],
    );

  /* ==========================================================
     DAYS INPUT
  ========================================================== */

  const handleDaysChange =
    useCallback(
      (
        value: string,
      ) => {
        if (saving) {
          return;
        }

        const sanitized =
          value.replace(
            /[^0-9]/g,
            "",
          );

        if (
          !sanitized
        ) {
          onChangeDays(
            "",
          );

          return;
        }

        const numericValue =
          Number(
            sanitized,
          );

        if (
          Number.isFinite(
            numericValue,
          ) &&
          numericValue >
            MAX_DAYS
        ) {
          onChangeDays(
            String(
              MAX_DAYS,
            ),
          );

          return;
        }

        onChangeDays(
          sanitized,
        );
      },
      [
        onChangeDays,
        saving,
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
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.titleContainer
          }
        >
          <AppText
            variant="heading3"
            weight="bold"
            style={
              styles.title
            }
          >
            Discount
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Offer customers a special price
          </AppText>
        </View>

        <View
          style={
            styles.discountBadge
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.discountBadgeText
            }
          >
            %
          </AppText>
        </View>
      </View>

      {/* ======================================================
          ORIGINAL PRICE
      ====================================================== */}

      <View
        style={
          styles.priceCard
        }
      >
        <AppText
          variant="caption"
          tone="secondary"
          weight="bold"
          style={
            styles.label
          }
        >
          Original price
        </AppText>

        <AppText
          variant="bodyLarge"
          weight="bold"
          style={
            styles.originalPrice
          }
        >
          {formatNaira(
            originalPrice,
          )}
        </AppText>
      </View>

      {/* ======================================================
          DISCOUNT
      ====================================================== */}

      <View
        style={
          styles.inputSection
        }
      >
        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.label
          }
        >
          Discount percentage
        </AppText>

        <View
          style={[
            styles.inputWrapper,

            discountFocused &&
            !showDiscountError
              ? styles.inputWrapperFocused
              : null,

            showDiscountError
              ? styles.inputWrapperError
              : null,

            saving
              ? styles.inputWrapperDisabled
              : null,
          ]}
        >
          <TextInput
            value={
              discount
            }
            onChangeText={
              handleDiscountChange
            }
            onFocus={() => {
              setDiscountFocused(
                true,
              );
            }}
            onBlur={() => {
              setDiscountFocused(
                false,
              );
            }}
            placeholder="e.g. 20"
            placeholderTextColor={
              Colors.textMuted
            }
            selectionColor={
              WorkerColors.primary
            }
            keyboardType="decimal-pad"
            inputMode="decimal"
            maxLength={5}
            editable={
              !saving
            }
            style={
              styles.input
            }
            accessibilityLabel="Discount percentage"
            accessibilityState={{
              disabled:
                saving,
            }}
          />

          <AppText
            variant="body"
            weight="bold"
            style={
              styles.inputSuffix
            }
          >
            %
          </AppText>
        </View>

        {showDiscountError ? (
          <View
            style={
              styles.errorRow
            }
          >
            <AppIcon
              name="error"
              size="xs"
              color={
                Colors.error
              }
            />

            <AppText
              variant="caption"
              style={
                styles.errorText
              }
            >
              Enter a discount between 1% and 99%.
            </AppText>
          </View>
        ) : null}
      </View>

      {/* ======================================================
          DURATION
      ====================================================== */}

      <View
        style={
          styles.inputSection
        }
      >
        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.label
          }
        >
          Discount duration
        </AppText>

        <View
          style={[
            styles.inputWrapper,

            daysFocused &&
            !showDaysError
              ? styles.inputWrapperFocused
              : null,

            showDaysError
              ? styles.inputWrapperError
              : null,

            saving
              ? styles.inputWrapperDisabled
              : null,
          ]}
        >
          <TextInput
            value={
              days
            }
            onChangeText={
              handleDaysChange
            }
            onFocus={() => {
              setDaysFocused(
                true,
              );
            }}
            onBlur={() => {
              setDaysFocused(
                false,
              );
            }}
            placeholder="e.g. 7"
            placeholderTextColor={
              Colors.textMuted
            }
            selectionColor={
              WorkerColors.primary
            }
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={3}
            editable={
              !saving
            }
            style={
              styles.input
            }
            accessibilityLabel="Discount duration in days"
            accessibilityState={{
              disabled:
                saving,
            }}
          />

          <AppText
            variant="body"
            weight="bold"
            style={
              styles.inputSuffix
            }
          >
            days
          </AppText>
        </View>

        {showDaysError ? (
          <View
            style={
              styles.errorRow
            }
          >
            <AppIcon
              name="error"
              size="xs"
              color={
                Colors.error
              }
            />

            <AppText
              variant="caption"
              style={
                styles.errorText
              }
            >
              Enter a duration between 1 and 365 days.
            </AppText>
          </View>
        ) : null}
      </View>

      {/* ======================================================
          PREVIEW
      ====================================================== */}

      {calculation.valid &&
      discountValid ? (
        <View
          style={
            styles.preview
          }
        >
          <View
            style={
              styles.previewHeader
            }
          >
            <AppIcon
              name="success"
              size="sm"
              color={
                Colors.success
              }
            />

            <AppText
              variant="body"
              weight="bold"
              style={
                styles.previewTitle
              }
            >
              Discount Preview
            </AppText>
          </View>

          <View
            style={
              styles.previewRow
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.previewLabel
              }
            >
              Discounted price
            </AppText>

            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.discountedPrice
              }
            >
              {formatNaira(
                calculation
                  .discountedPrice,
              )}
            </AppText>
          </View>

          <View
            style={
              styles.previewRow
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.previewLabel
              }
            >
              Customer saves
            </AppText>

            <AppText
              variant="body"
              weight="bold"
              style={
                styles.savingText
              }
            >
              {formatNaira(
                calculation
                  .savingAmount,
              )}
            </AppText>
          </View>

          {daysValid ? (
            <View
              style={
                styles.previewRow
              }
            >
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.previewLabel
                }
              >
                Duration
              </AppText>

              <AppText
                variant="body"
                weight="bold"
                style={
                  styles.durationText
                }
              >
                {daysValue}{" "}
                {daysValue === 1
                  ? "day"
                  : "days"}
              </AppText>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* ======================================================
          INFO
      ====================================================== */}

      <View
        style={
          styles.infoBox
        }
      >
        <AppIcon
          name="info"
          size="sm"
          color={
            WorkerColors.primary
          }
        />

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.infoText
          }
        >
          The discount will be activated automatically when you publish this product.
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    titleContainer: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    discountBadge: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    discountBadgeText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       PRICE
    ======================================================== */

    priceCard: {
      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    label: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    originalPrice: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       INPUT
    ======================================================== */

    inputSection: {
      marginBottom:
        FixxamTokens.spacing.lg,
    },

    inputWrapper: {
      minHeight:
        FixxamTokens.size.inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,
    },

    inputWrapperFocused: {
      borderColor:
        WorkerColors.primary,
    },

    inputWrapperError: {
      borderColor:
        Colors.error,
    },

    inputWrapperDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,

      backgroundColor:
        Colors.disabledBackground,
    },

    input: {
      flex: 1,

      minHeight:
        FixxamTokens.size.inputHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    inputSuffix: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    errorRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    errorText: {
      flex: 1,

      color:
        Colors.error,
    },

    /* ========================================================
       PREVIEW
    ======================================================== */

    preview: {
      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.successSoft,
    },

    previewHeader: {
      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    previewTitle: {
      color:
        Colors.success,
    },

    previewRow: {
      minHeight: 30,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    previewLabel: {
      flex: 1,

      color:
        Colors.textSecondary,
    },

    discountedPrice: {
      flexShrink: 0,

      color:
        Colors.success,
    },

    savingText: {
      flexShrink: 0,

      color:
        Colors.success,
    },

    durationText: {
      flexShrink: 0,

      color:
        Colors.success,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoBox: {
      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    infoText: {
      flex: 1,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },
  });

export default memo(
  AddProductDiscount,
);