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

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import MakeOfferSectionTitle from "@/components/orders/make-offer/MakeOfferSectionTitle";

type Props = {
  serviceName: string;

  customerName: string;

  formattedAmount: string;
};

function MakeOfferSummarySection({
  serviceName,
  customerName,
  formattedAmount,
}: Props) {
  return (
    <>
      <MakeOfferSectionTitle
        number="3"
        title="Offer summary"
      />

      <View
        style={
          styles.summaryCard
        }
      >
        <View
          style={
            styles.summaryHeader
          }
        >
          <View
            style={
              styles.summaryIcon
            }
          >
            <AppIcon
              name="payment"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.summaryHeaderText
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.summaryTitle
              }
            >
              Ready to send
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.summarySubtitle
              }
            >
              Customer will review your offer.
            </AppText>
          </View>
        </View>

        <View
          style={
            styles.divider
          }
        />

        <SummaryRow
          label="Service"
          value={
            serviceName
          }
        />

        <SummaryRow
          label="Customer"
          value={
            customerName
          }
        />

        <SummaryRow
          label="Your offer"
          value={
            formattedAmount
          }
          strong
        />
      </View>

      <View
        style={
          styles.infoCard
        }
      >
        <AppIcon
          name="info"
          role="worker"
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
          The customer will receive this offer inside the order and can accept, decline, or respond with a counter offer.
        </AppText>
      </View>
    </>
  );
}

export default memo(
  MakeOfferSummarySection,
);

const SummaryRow =
  memo(
    function SummaryRow({
      label,
      value,
      strong = false,
    }: {
      label: string;

      value: string;

      strong?: boolean;
    }) {
      return (
        <View
          style={
            styles.summaryRow
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.summaryLabel
            }
          >
            {label}
          </AppText>

          <AppText
            variant={
              strong
                ? "bodyLarge"
                : "caption"
            }
            weight={
              strong
                ? "bold"
                : "medium"
            }
            numberOfLines={2}
            style={[
              styles.summaryValue,

              strong
                ? styles.summaryValueStrong
                : null,
            ]}
          >
            {value}
          </AppText>
        </View>
      );
    },
  );

const styles =
  StyleSheet.create({
    summaryCard: {
      width: "100%",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    summaryHeader: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    summaryIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginRight:
        FixxamTokens.spacing.sm,

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

    summaryHeaderText: {
      flex: 1,

      minWidth: 0,
    },

    summaryTitle: {
      color:
        Colors.textPrimary,
    },

    summarySubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.divider,
    },

    summaryRow: {
      width: "100%",

      minHeight: 34,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    summaryLabel: {
      color:
        Colors.textSecondary,
    },

    summaryValue: {
      flex: 1,

      maxWidth: "64%",

      marginLeft:
        FixxamTokens.spacing.md,

      textAlign:
        "right",

      color:
        Colors.textPrimary,
    },

    summaryValueStrong: {
      color:
        WorkerColors.primary,
    },

    infoCard: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    infoText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },
  });