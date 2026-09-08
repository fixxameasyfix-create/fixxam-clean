import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppCard,
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

type Props = {
  customerName: string;

  customerPhone?: string;

  address: string;

  hasGps: boolean;

  onCallCustomer: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanValue(
  value:
    | string
    | undefined,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerMarketCustomerDeliverySection({
  customerName,
  customerPhone,
  address,
  hasGps,
  onCallCustomer,
}: Props) {
  const displayCustomerName =
    cleanValue(
      customerName,
    ) ||
    "Customer";

  const displayPhone =
    cleanValue(
      customerPhone,
    );

  const displayAddress =
    cleanValue(
      address,
    ) ||
    "Address unavailable";

  const hasPhone =
    Boolean(
      displayPhone,
    );

  return (
    <>
      {/* ========================================================
          CUSTOMER
      ======================================================== */}

      <AppCard
        role="worker"
        variant="outlined"
        style={
          styles.card
        }
      >
        <AppText
          variant="heading3"
          weight="bold"
          style={
            styles.sectionTitle
          }
        >
          Customer
        </AppText>

        <View
          style={
            styles.customerRow
          }
        >
          <View
            style={
              styles.workerAccentIcon
            }
          >
            <AppIcon
              name="profile"
              role="worker"
              size="md"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.customerInfo
            }
          >
            <AppText
              variant="bodyLarge"
              weight="medium"
              numberOfLines={1}
              style={
                styles.customerName
              }
            >
              {displayCustomerName}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.customerPhone
              }
            >
              {hasPhone
                ? displayPhone
                : "Phone number unavailable"}
            </AppText>
          </View>

          <View
            style={
              styles.callAction
            }
          >
            <AppButton
              title="Call"
              role="worker"
              variant="outline"
              size="sm"
              leftIconName="phone"
              disabled={
                !hasPhone
              }
              onPress={
                onCallCustomer
              }
            />
          </View>
        </View>
      </AppCard>

      {/* ========================================================
          DELIVERY
      ======================================================== */}

      <AppCard
        role="worker"
        variant="outlined"
        style={
          styles.card
        }
      >
        <View
          style={
            styles.sectionHeader
          }
        >
          <AppText
            variant="heading3"
            weight="bold"
            style={
              styles.sectionTitle
            }
          >
            Delivery
          </AppText>

          {hasGps ? (
            <View
              style={
                styles.gpsBadge
              }
            >
              <AppIcon
                name="location"
                size="xs"
                color={
                  Colors.success
                }
              />

              <AppText
                variant="caption"
                weight="medium"
                style={
                  styles.gpsText
                }
              >
                GPS
              </AppText>
            </View>
          ) : null}
        </View>

        <View
          style={
            styles.addressRow
          }
        >
          <View
            style={
              styles.workerAccentIcon
            }
          >
            <AppIcon
              name="location"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.addressContent
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.addressLabel
              }
            >
              DELIVERY ADDRESS
            </AppText>

            <AppText
              variant="body"
              style={
                styles.addressText
              }
            >
              {displayAddress}
            </AppText>
          </View>
        </View>
      </AppCard>
    </>
  );
}

export default memo(
  WorkerMarketCustomerDeliverySection,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.lg,
    },

    sectionTitle: {
      color:
        Colors.textPrimary,
    },

    /* ==========================================================
       CUSTOMER
    ========================================================== */

    customerRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    workerAccentIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

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

    customerInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    customerName: {
      color:
        Colors.textPrimary,
    },

    customerPhone: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    callAction: {
      flexShrink: 0,
    },

    /* ==========================================================
       DELIVERY
    ========================================================== */

    sectionHeader: {
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    gpsBadge: {
      minHeight: 28,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.successSoft,
    },

    gpsText: {
      color:
        Colors.success,
    },

    addressRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    addressContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    addressLabel: {
      letterSpacing: 0.6,

      color:
        Colors.textMuted,
    },

    addressText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textPrimary,
    },
  });