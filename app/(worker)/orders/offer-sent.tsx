import React, {
  memo,
  useCallback,
} from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  AppButton,
  AppIcon,
  AppScreen,
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

type OfferSentParams = {
  orderId?:
    | string
    | string[];

  serviceName?:
    | string
    | string[];

  customerName?:
    | string
    | string[];

  amount?:
    | string
    | string[];

  message?:
    | string
    | string[];
};

/* ==============================================================
   HELPERS
============================================================== */

function resolveParam(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    typeof value ===
    "string"
  ) {
    return value.trim();
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0]?.trim() ||
      ""
    );
  }

  return "";
}

function resolveAmount(
  value: string,
): number {
  const cleaned =
    value.replace(
      /[^0-9]/g,
      "",
    );

  if (!cleaned) {
    return 0;
  }

  const amount =
    Number(
      cleaned,
    );

  if (
    !Number.isFinite(
      amount,
    ) ||
    amount <= 0
  ) {
    return 0;
  }

  return amount;
}

/* ==============================================================
   SCREEN
============================================================== */

export default function OfferSentScreen() {
  const params =
    useLocalSearchParams<OfferSentParams>();

  /* ============================================================
     DATA
  ============================================================ */

  const resolvedOrderId =
    resolveParam(
      params.orderId,
    );

  const resolvedServiceName =
    resolveParam(
      params.serviceName,
    ) ||
    "Service request";

  const resolvedCustomerName =
    resolveParam(
      params.customerName,
    ) ||
    "Customer";

  const resolvedMessage =
    resolveParam(
      params.message,
    );

  const numericAmount =
    resolveAmount(
      resolveParam(
        params.amount,
      ),
    );

  const formattedAmount =
    numericAmount > 0
      ? `₦${numericAmount.toLocaleString(
          "en-NG",
        )}`
      : "Amount unavailable";

  /* ============================================================
     BACK TO ORDERS
  ============================================================ */

  const handleBackToOrders =
    useCallback(() => {
      router.replace(
        "/(worker)/(tabs)/orders",
      );
    }, []);

  /* ============================================================
     VIEW ORDER
  ============================================================ */

  const handleViewOrder =
    useCallback(() => {
      if (
        !resolvedOrderId
      ) {
        handleBackToOrders();

        return;
      }

      router.replace({
        pathname:
          "/(worker)/orders/[orderId]",

        params: {
          orderId:
            resolvedOrderId,
        },
      });
    }, [
      handleBackToOrders,
      resolvedOrderId,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="worker"
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        style={
          styles.scrollView
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ====================================================
            SUCCESS
        ==================================================== */}

        <View
          style={
            styles.successSection
          }
        >
          <View
            style={
              styles.successIcon
            }
          >
            <AppIcon
              name="success"
              size="lg"
              color={
                Colors.success
              }
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.title
            }
          >
            Offer sent
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.subtitle
            }
          >
            Waiting for{" "}
            {resolvedCustomerName}{" "}
            to respond.
          </AppText>
        </View>

        {/* ====================================================
            OFFER
        ==================================================== */}

        <View
          style={
            styles.offerCard
          }
        >
          <View
            style={
              styles.offerTop
            }
          >
            <View>
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.offerLabel
                }
              >
                Your offer
              </AppText>

              <AppText
                variant="heading2"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.amount
                }
              >
                {formattedAmount}
              </AppText>
            </View>

            <View
              style={
                styles.sentBadge
              }
            >
              <View
                style={
                  styles.sentDot
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.sentText
                }
              >
                Sent
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
              resolvedServiceName
            }
          />

          <SummaryRow
            label="Customer"
            value={
              resolvedCustomerName
            }
          />

          {resolvedOrderId ? (
            <SummaryRow
              label="Order"
              value={`#${resolvedOrderId}`}
            />
          ) : null}
        </View>

        {/* ====================================================
            MESSAGE
        ==================================================== */}

        {resolvedMessage ? (
          <View
            style={
              styles.messageSection
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              Your note
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.message
              }
            >
              {resolvedMessage}
            </AppText>
          </View>
        ) : null}

        {/* ====================================================
            WHAT HAPPENS NEXT
        ==================================================== */}

        <View
          style={
            styles.infoRow
          }
        >
          <View
            style={
              styles.infoIcon
            }
          >
            <AppIcon
              name="info"
              role="worker"
              size="xs"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.infoText
            }
          >
            The customer can accept, decline, or send a counter offer. You&apos;ll see their response in the order.
          </AppText>
        </View>

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <View
          style={
            styles.actions
          }
        >
          {resolvedOrderId ? (
            <AppButton
              title="View Order"
              role="worker"
              variant="primary"
              leftIconName="file"
              onPress={
                handleViewOrder
              }
            />
          ) : null}

          <View
            style={
              styles.secondaryAction
            }
          >
            <AppButton
              title="My Orders"
              role="worker"
              variant={
                resolvedOrderId
                  ? "ghost"
                  : "primary"
              }
              leftIconName="jobs"
              onPress={
                handleBackToOrders
              }
            />
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* ==============================================================
   SUMMARY ROW
============================================================== */

const SummaryRow =
  memo(
    function SummaryRow({
      label,
      value,
    }: {
      label: string;

      value: string;
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
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={2}
            style={
              styles.summaryValue
            }
          >
            {value}
          </AppText>
        </View>
      );
    },
  );

SummaryRow.displayName =
  "OfferSentSummaryRow";

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      width: "100%",

      backgroundColor:
        Colors.background,
    },

    scrollView: {
      flex: 1,

      width: "100%",
    },

    content: {
      width: "100%",

      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       SUCCESS
    ======================================================== */

    successSection: {
      width: "100%",

      alignItems:
        "center",

      paddingTop:
        FixxamTokens.spacing.lg,
    },

    successIcon: {
      width: 64,

      height: 64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.successSoft,
    },

    title: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       OFFER
    ======================================================== */

    offerCard: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    offerTop: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    offerLabel: {
      color:
        Colors.textMuted,
    },

    amount: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        WorkerColors.primary,
    },

    sentBadge: {
      flexShrink: 0,

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

    sentDot: {
      width: 6,

      height: 6,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    sentText: {
      color:
        Colors.success,
    },

    divider: {
      height: 1,

      marginVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.divider,
    },

    summaryRow: {
      width: "100%",

      minHeight: 38,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    summaryLabel: {
      flexShrink: 0,

      color:
        Colors.textMuted,
    },

    summaryValue: {
      flex: 1,

      minWidth: 0,

      textAlign:
        "right",

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       MESSAGE
    ======================================================== */

    messageSection: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.md,

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    sectionTitle: {
      color:
        Colors.textPrimary,
    },

    message: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoRow: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    infoIcon: {
      width: 28,

      height: 28,

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

    infoText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,
    },

    secondaryAction: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xs,
    },
  });