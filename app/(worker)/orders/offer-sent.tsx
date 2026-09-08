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
    typeof value === "string"
  ) {
    return value.trim();
  }

  if (
    Array.isArray(value)
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

  return Number.isFinite(
    amount,
  )
    ? amount
    : 0;
}

/* ==============================================================
   SCREEN
============================================================== */

export default function OfferSentScreen() {
  const params =
    useLocalSearchParams<OfferSentParams>();

  /* ============================================================
     RESOLVED DATA
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
    `₦${numericAmount.toLocaleString(
      "en-NG",
    )}`;

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
        showsHorizontalScrollIndicator={
          false
        }
      >
        {/* ====================================================
            SUCCESS
        ==================================================== */}

        <View
          style={
            styles.successWrapper
          }
        >
          <View
            style={
              styles.successOuter
            }
          >
            <View
              style={
                styles.successCircle
              }
            >
              <AppIcon
                name="success"
                size="xl"
                color={
                  Colors.textInverse
                }
              />
            </View>
          </View>
        </View>

        {/* ====================================================
            TITLE
        ==================================================== */}

        <AppText
          variant="heading2"
          weight="bold"
          center
          style={
            styles.title
          }
        >
          Offer Sent Successfully
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.subtitle
          }
        >
          Your offer has been sent to{" "}
          {resolvedCustomerName}.
          {"\n"}
          They can now review and respond to it.
        </AppText>

        {/* ====================================================
            STATUS
        ==================================================== */}

        <View
          style={
            styles.statusCard
          }
        >
          <View
            style={
              styles.statusIcon
            }
          >
            <AppIcon
              name="success"
              size="md"
              color={
                Colors.success
              }
            />
          </View>

          <View
            style={
              styles.statusContent
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.statusTitle
              }
            >
              OFFER SENT
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.statusText
              }
            >
              Waiting for the customer to respond.
            </AppText>
          </View>

          <View
            style={
              styles.sentBadge
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.sentBadgeText
              }
            >
              SENT
            </AppText>
          </View>
        </View>

        {/* ====================================================
            SUMMARY
        ==================================================== */}

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
                Offer Summary
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.summarySubtitle
                }
              >
                Details sent to the customer.
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

          <SummaryRow
            label="Offer"
            value={
              formattedAmount
            }
            strong
          />

          {resolvedOrderId ? (
            <SummaryRow
              label="Order ID"
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
              styles.messageCard
            }
          >
            <View
              style={
                styles.messageIcon
              }
            >
              <AppIcon
                name="messages"
                role="worker"
                size="sm"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.messageContent
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.messageTitle
                }
              >
                YOUR MESSAGE
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                style={
                  styles.messageText
                }
              >
                {resolvedMessage}
              </AppText>
            </View>
          </View>
        ) : null}

        {/* ====================================================
            INFO
        ==================================================== */}

        <View
          style={
            styles.infoCard
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
              size="sm"
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
            You will see the customer&apos;s response in your orders when they accept, decline, or send a counter offer.
          </AppText>
        </View>

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        {resolvedOrderId ? (
          <View
            style={
              styles.viewAction
            }
          >
            <AppButton
              title="View Order"
              role="worker"
              variant="outline"
              leftIconName="file"
              onPress={
                handleViewOrder
              }
            />
          </View>
        ) : null}

        <View
          style={
            styles.backAction
          }
        >
          <AppButton
            title="Back to My Orders"
            role="worker"
            variant="primary"
            leftIconName="jobs"
            onPress={
              handleBackToOrders
            }
          />
        </View>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <AppText
          variant="caption"
          tone="secondary"
          center
          style={
            styles.footer
          }
        >
          Fixxam Easyfix
        </AppText>
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

    /* ==========================================================
       SUCCESS
    ========================================================== */

    successWrapper: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",
    },

    successOuter: {
      width: 108,

      height: 108,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.successSoft,
    },

    successCircle: {
      width: 80,

      height: 80,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,

      ...FixxamTokens.shadow.card,
    },

    /* ==========================================================
       TITLE
    ========================================================== */

    title: {
      width: "100%",

      color:
        Colors.textPrimary,
    },

    subtitle: {
      width: "100%",

      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.sm,

      alignSelf:
        "center",

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       STATUS
    ========================================================== */

    statusCard: {
      width: "100%",

      minHeight: 82,

      marginTop:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    statusIcon: {
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
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    statusContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    statusTitle: {
      color:
        Colors.success,
    },

    statusText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    sentBadge: {
      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    sentBadgeText: {
      color:
        Colors.success,
    },

    /* ==========================================================
       SUMMARY
    ========================================================== */

    summaryCard: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

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

      marginLeft:
        FixxamTokens.spacing.sm,
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

      minHeight: 36,

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

      maxWidth: "65%",

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

    /* ==========================================================
       MESSAGE
    ========================================================== */

    messageCard: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    messageIcon: {
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
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    messageContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    messageTitle: {
      letterSpacing: 0.6,

      color:
        Colors.textSecondary,
    },

    messageText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 19,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       INFO
    ========================================================== */

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
        Colors.surface,
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

    /* ==========================================================
       ACTIONS
    ========================================================== */

    viewAction: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,
    },

    backAction: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ==========================================================
       FOOTER
    ========================================================== */

    footer: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textMuted,
    },
  });