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

/* ==============================================================
   TYPES
============================================================== */

type MarketPaymentMethod =
  | "cash"
  | "card"
  | "transfer";

type Props = {
  paymentMethod:
    MarketPaymentMethod;

  paymentStatus: string;

  itemCount: number;

  subtotal: number;

  deliveryFee: number;

  total: number;

  note?: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function safeMoney(
  value: number,
): number {
  return Number.isFinite(
    value,
  )
    ? Math.max(
        0,
        value,
      )
    : 0;
}

function formatMoney(
  value: number,
): string {
  return `₦${safeMoney(
    value,
  ).toLocaleString(
    "en-NG",
  )}`;
}

function formatSignedMoney(
  value: number,
): string {
  const absolute =
    Math.abs(
      value,
    );

  if (
    value === 0
  ) {
    return formatMoney(
      0,
    );
  }

  return `${
    value > 0
      ? "+"
      : "-"
  }₦${absolute.toLocaleString(
    "en-NG",
  )}`;
}

function formatPaymentMethod(
  method: MarketPaymentMethod,
): string {
  switch (method) {
    case "card":
      return "Card payment";

    case "transfer":
      return "Bank transfer";

    case "cash":
    default:
      return "Pay on delivery";
  }
}

function formatPaymentStatus(
  value: string,
): string {
  const cleanValue =
    value
      .trim()
      .toLowerCase();

  if (!cleanValue) {
    return "Pending";
  }

  return cleanValue
    .split(
      /[\s_-]+/,
    )
    .filter(Boolean)
    .map(
      item =>
        item
          .charAt(0)
          .toUpperCase() +
        item.slice(1),
    )
    .join(" ");
}

function getPaymentStatusColor(
  value: string,
): string {
  const status =
    value
      .trim()
      .toLowerCase();

  if (
    status === "paid" ||
    status === "completed" ||
    status === "successful"
  ) {
    return Colors.success;
  }

  if (
    status === "failed" ||
    status === "cancelled" ||
    status === "canceled"
  ) {
    return Colors.error;
  }

  return Colors.warning;
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerMarketPaymentSummarySection({
  paymentMethod,
  paymentStatus,
  itemCount,
  subtotal,
  deliveryFee,
  total,
  note,
}: Props) {
  const cleanNote =
    note?.trim() ??
    "";

  const safeSubtotal =
    safeMoney(
      subtotal,
    );

  const safeDeliveryFee =
    safeMoney(
      deliveryFee,
    );

  const safeTotal =
    safeMoney(
      total,
    );

  /*
   * We intentionally call this "Adjustment" instead of
   * "Discount" because the current order schema does not
   * explicitly tell us why the backend total differs.
   */
  const adjustment =
    useMemo(
      () =>
        safeTotal -
        (
          safeSubtotal +
          safeDeliveryFee
        ),
      [
        safeDeliveryFee,
        safeSubtotal,
        safeTotal,
      ],
    );

  const hasAdjustment =
    Math.abs(
      adjustment,
    ) >= 0.01;

  const paymentStatusColor =
    getPaymentStatusColor(
      paymentStatus,
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          PAYMENT
      ======================================================== */}

      <View
        style={
          styles.section
        }
      >
        <AppText
          variant="heading3"
          weight="bold"
          style={
            styles.sectionTitle
          }
        >
          Payment
        </AppText>

        <View
          style={
            styles.paymentRow
          }
        >
          <View
            style={
              styles.leadingIcon
            }
          >
            <AppIcon
              name={
                paymentMethod ===
                "cash"
                  ? "wallet"
                  : "payment"
              }
              size="md"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.paymentInfo
            }
          >
            <AppText
              variant="bodyLarge"
              weight="medium"
              numberOfLines={1}
              style={
                styles.paymentMethod
              }
            >
              {formatPaymentMethod(
                paymentMethod,
              )}
            </AppText>

            <View
              style={
                styles.paymentStatusRow
              }
            >
              <View
                style={[
                  styles.statusDot,

                  {
                    backgroundColor:
                      paymentStatusColor,
                  },
                ]}
              />

              <AppText
                variant="caption"
                numberOfLines={1}
                style={
                  styles.paymentStatus
                }
              >
                {formatPaymentStatus(
                  paymentStatus,
                )}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {/* ========================================================
          DIVIDER
      ======================================================== */}

      <View
        style={
          styles.majorDivider
        }
      />

      {/* ========================================================
          ORDER SUMMARY
      ======================================================== */}

      <View
        style={
          styles.section
        }
      >
        <AppText
          variant="heading3"
          weight="bold"
          style={
            styles.sectionTitle
          }
        >
          Order summary
        </AppText>

        <View
          style={
            styles.summaryContent
          }
        >
          <SummaryRow
            label="Items"
            value={`${itemCount} ${
              itemCount === 1
                ? "item"
                : "items"
            }`}
          />

          <SummaryRow
            label="Subtotal"
            value={
              formatMoney(
                safeSubtotal,
              )
            }
          />

          <SummaryRow
            label="Delivery fee"
            value={
              formatMoney(
                safeDeliveryFee,
              )
            }
          />

          {hasAdjustment ? (
            <SummaryRow
              label="Adjustment"
              value={
                formatSignedMoney(
                  adjustment,
                )
              }
              emphasized
            />
          ) : null}

          <View
            style={
              styles.summaryDivider
            }
          />

          <View
            style={
              styles.totalRow
            }
          >
            <View
              style={
                styles.totalTextGroup
              }
            >
              <AppText
                variant="bodyLarge"
                weight="medium"
                style={
                  styles.totalLabel
                }
              >
                Total
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.totalCaption
                }
              >
                Order amount
              </AppText>
            </View>

            <AppText
              variant="heading2"
              weight="bold"
              numberOfLines={1}
              adjustsFontSizeToFit
              style={
                styles.totalValue
              }
            >
              {formatMoney(
                safeTotal,
              )}
            </AppText>
          </View>
        </View>
      </View>

      {/* ========================================================
          CUSTOMER NOTE
      ======================================================== */}

      {cleanNote ? (
        <>
          <View
            style={
              styles.majorDivider
            }
          />

          <View
            style={
              styles.noteSection
            }
          >
            <View
              style={
                styles.noteHeader
              }
            >
              <View
                style={
                  styles.noteIcon
                }
              >
                <AppIcon
                  name="messages"
                  size="sm"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <AppText
                variant="bodyMedium"
                weight="medium"
                style={
                  styles.noteTitle
                }
              >
                Customer note
              </AppText>
            </View>

            <AppText
              variant="body"
              style={
                styles.noteText
              }
            >
              {cleanNote}
            </AppText>
          </View>
        </>
      ) : null}
    </View>
  );
}

export default memo(
  WorkerMarketPaymentSummarySection,
);

/* ==============================================================
   SUMMARY ROW
============================================================== */

const SummaryRow =
  memo(
    function SummaryRow({
      label,
      value,
      emphasized = false,
    }: {
      label: string;

      value: string;

      emphasized?: boolean;
    }) {
      return (
        <View
          style={
            styles.summaryRow
          }
        >
          <AppText
            variant="body"
            numberOfLines={1}
            style={
              styles.summaryLabel
            }
          >
            {label}
          </AppText>

          <AppText
            variant="body"
            weight={
              emphasized
                ? "medium"
                : "regular"
            }
            numberOfLines={1}
            style={[
              styles.summaryValue,

              emphasized
                ? styles.summaryValueEmphasized
                : null,
            ]}
          >
            {value}
          </AppText>
        </View>
      );
    },
  );

SummaryRow.displayName =
  "WorkerMarketSummaryRow";

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    section: {
      width: "100%",

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    sectionTitle: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       PAYMENT
    ======================================================== */

    paymentRow: {
      minHeight: 64,

      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    leadingIcon: {
      width: 44,

      height: 44,

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

    paymentInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    paymentMethod: {
      color:
        Colors.textPrimary,
    },

    paymentStatusRow: {
      marginTop:
        FixxamTokens.spacing.xxs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    statusDot: {
      width: 7,

      height: 7,

      borderRadius: 999,
    },

    paymentStatus: {
      flex: 1,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       DIVIDERS
    ======================================================== */

    majorDivider: {
      height:
        StyleSheet.hairlineWidth,

      marginVertical:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.border,
    },

    summaryDivider: {
      height:
        StyleSheet.hairlineWidth,

      marginVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.border,
    },

    /* ========================================================
       SUMMARY
    ======================================================== */

    summaryContent: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    summaryRow: {
      minHeight: 38,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.lg,
    },

    summaryLabel: {
      flexShrink: 0,

      color:
        Colors.textSecondary,
    },

    summaryValue: {
      flex: 1,

      textAlign:
        "right",

      color:
        Colors.textPrimary,
    },

    summaryValueEmphasized: {
      color:
        WorkerColors.primary,
    },

    totalRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.lg,
    },

    totalTextGroup: {
      flexShrink: 0,
    },

    totalLabel: {
      color:
        Colors.textPrimary,
    },

    totalCaption: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    totalValue: {
      flex: 1,

      textAlign:
        "right",

      color:
        WorkerColors.primary,
    },

    /* ========================================================
       CUSTOMER NOTE
    ======================================================== */

    noteSection: {
      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    noteHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    noteIcon: {
      width: 32,

      height: 32,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    noteTitle: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    noteText: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingLeft: 40,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },
  });