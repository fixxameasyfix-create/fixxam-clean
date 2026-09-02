import React, {
  useCallback,
  useMemo,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

/* ==============================================================
   TYPES
============================================================== */

type OfferSentParams = {
  orderId?: string;
  serviceName?: string;
  customerName?: string;
  amount?: string;
  message?: string;
};

/* ==============================================================
   SCREEN
============================================================== */

export default function OfferSentScreen() {
  const {
    orderId,
    serviceName,
    customerName,
    amount,
    message,
  } =
    useLocalSearchParams<OfferSentParams>();

  /* ============================================================
     RESOLVED DATA
  ============================================================ */

  const resolvedOrderId = useMemo(
    () => orderId?.trim() || "",
    [orderId],
  );

  const resolvedServiceName = useMemo(
    () =>
      serviceName?.trim() ||
      "Service request",
    [serviceName],
  );

  const resolvedCustomerName = useMemo(
    () =>
      customerName?.trim() ||
      "Customer",
    [customerName],
  );

  const numericAmount = useMemo(() => {
    if (typeof amount !== "string") {
      return 0;
    }

    const value = Number(
      amount.replace(/[^0-9]/g, ""),
    );

    return Number.isFinite(value)
      ? value
      : 0;
  }, [amount]);

  const formattedAmount = useMemo(
    () =>
      `₦${numericAmount.toLocaleString(
        "en-NG",
      )}`,
    [numericAmount],
  );

  const resolvedMessage = useMemo(
    () => message?.trim() || "",
    [message],
  );

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
      if (!resolvedOrderId) {
        handleBackToOrders();
        return;
      }

      router.replace({
        pathname:
          "/(worker)/orders/[orderId]",
        params: {
          orderId: resolvedOrderId,
        },
      });
    }, [
      resolvedOrderId,
      handleBackToOrders,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        showsHorizontalScrollIndicator={
          false
        }
        bounces
      >
        {/* ====================================================
            SUCCESS ICON
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
              <Ionicons
                name="checkmark"
                size={43}
                color="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* ====================================================
            TITLE
        ==================================================== */}

        <AppText
          weight="bold"
          center
          style={styles.title}
        >
          Offer Sent Successfully
        </AppText>

        <AppText
          center
          style={styles.subtitle}
        >
          Your offer has been sent to{" "}
          {resolvedCustomerName}.
          {"\n"}
          They can now review your
          offer.
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
            <Ionicons
              name="paper-plane-outline"
              size={22}
              color="#2563EB"
            />
          </View>

          <View
            style={
              styles.statusContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.statusTitle
              }
            >
              OFFER SENT
            </AppText>

            <AppText
              style={
                styles.statusText
              }
            >
              Waiting for the customer
              to respond.
            </AppText>
          </View>

          <View
            style={
              styles.sentBadge
            }
          >
            <AppText
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
            OFFER SUMMARY
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
              <Ionicons
                name="receipt-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.summaryHeaderText
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.summaryTitle
                }
              >
                Offer Summary
              </AppText>

              <AppText
                style={
                  styles.summarySubtitle
                }
              >
                Details sent to the
                customer.
              </AppText>
            </View>
          </View>

          <View
            style={styles.divider}
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

          {resolvedOrderId && (
            <SummaryRow
              label="Order ID"
              value={`#${resolvedOrderId}`}
            />
          )}
        </View>

        {/* ====================================================
            MESSAGE
        ==================================================== */}

        {resolvedMessage && (
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
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.messageContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.messageTitle
                }
              >
                YOUR MESSAGE
              </AppText>

              <AppText
                style={
                  styles.messageText
                }
              >
                {resolvedMessage}
              </AppText>
            </View>
          </View>
        )}

        {/* ====================================================
            INFO
        ==================================================== */}

        <View
          style={
            styles.infoCard
          }
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2563EB"
          />

          <AppText
            style={
              styles.infoText
            }
          >
            You will see the customer's
            response in your orders when
            they accept or decline your
            offer.
          </AppText>
        </View>

        {/* ====================================================
            VIEW ORDER
        ==================================================== */}

        {resolvedOrderId && (
          <Pressable
            onPress={
              handleViewOrder
            }
            accessibilityRole="button"
            accessibilityLabel="View order"
            style={({ pressed }) => [
              styles.viewButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="receipt-outline"
              size={19}
              color="#2563EB"
            />

            <AppText
              weight="bold"
              style={
                styles.viewButtonText
              }
            >
              VIEW ORDER
            </AppText>

            <Ionicons
              name="arrow-forward"
              size={19}
              color="#2563EB"
            />
          </Pressable>
        )}

        {/* ====================================================
            BACK
        ==================================================== */}

        <Pressable
          onPress={
            handleBackToOrders
          }
          accessibilityRole="button"
          accessibilityLabel="Back to my orders"
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.buttonPressed,
          ]}
        >
          <AppText
            weight="bold"
            style={
              styles.backButtonText
            }
          >
            BACK TO MY ORDERS
          </AppText>
        </Pressable>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <AppText
          center
          style={styles.footer}
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
      style={styles.summaryRow}
    >
      <AppText
        style={
          styles.summaryLabel
        }
      >
        {label}
      </AppText>

      <AppText
        weight={
          strong
            ? "bold"
            : undefined
        }
        numberOfLines={2}
        style={[
          styles.summaryValue,
          strong &&
            styles.summaryValueStrong,
        ]}
      >
        {value}
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       SCREEN
    ========================================================== */

    screen: {
      flex: 1,
      width: "100%",
      backgroundColor:
        "#F8FAFC",
    },

    scrollView: {
      flex: 1,
      width: "100%",
    },

    content: {
      width: "100%",
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 45,
    },

    /* ==========================================================
       SUCCESS
    ========================================================== */

    successWrapper: {
      width: "100%",
      alignItems: "center",
      marginTop: 18,
      marginBottom: 20,
    },

    successOuter: {
      width: 108,
      height: 108,
      borderRadius: 54,
      backgroundColor:
        "#DBEAFE",
      alignItems: "center",
      justifyContent: "center",
    },

    successCircle: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor:
        "#2563EB",
      alignItems: "center",
      justifyContent: "center",
      shadowColor:
        "#2563EB",
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      elevation: 5,
    },

    /* ==========================================================
       TITLE
    ========================================================== */

    title: {
      width: "100%",
      fontSize: 23,
      lineHeight: 29,
      color: "#0F172A",
    },

    subtitle: {
      width: "100%",
      marginTop: 8,
      paddingHorizontal: 20,
      fontSize: 11.5,
      lineHeight: 18,
      color: "#64748B",
    },

    /* ==========================================================
       STATUS
    ========================================================== */

    statusCard: {
      width: "100%",
      minHeight: 82,
      marginTop: 24,
      padding: 12,
      borderRadius: 18,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#BFDBFE",
      flexDirection: "row",
      alignItems: "center",
    },

    statusIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    statusContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    statusTitle: {
      fontSize: 11,
      color: "#2563EB",
    },

    statusText: {
      marginTop: 3,
      fontSize: 9.5,
      lineHeight: 15,
      color: "#64748B",
    },

    sentBadge: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor:
        "#DBEAFE",
    },

    sentBadgeText: {
      fontSize: 8,
      color: "#1D4ED8",
    },

    /* ==========================================================
       SUMMARY
    ========================================================== */

    summaryCard: {
      width: "100%",
      marginTop: 16,
      padding: 14,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      shadowColor:
        "#0F172A",
      shadowOpacity: 0.035,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },

    summaryHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
    },

    summaryIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    summaryHeaderText: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    summaryTitle: {
      fontSize: 13,
      color: "#0F172A",
    },

    summarySubtitle: {
      marginTop: 2,
      fontSize: 9.5,
      color: "#64748B",
    },

    divider: {
      height: 1,
      marginVertical: 13,
      backgroundColor:
        "#F1F5F9",
    },

    summaryRow: {
      width: "100%",
      minHeight: 34,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    summaryLabel: {
      fontSize: 10.5,
      color: "#64748B",
    },

    summaryValue: {
      flex: 1,
      maxWidth: "65%",
      marginLeft: 12,
      fontSize: 10.5,
      textAlign: "right",
      color: "#334155",
    },

    summaryValueStrong: {
      fontSize: 17,
      color: "#2563EB",
    },

    /* ==========================================================
       MESSAGE
    ========================================================== */

    messageCard: {
      width: "100%",
      marginTop: 12,
      padding: 13,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems:
        "flex-start",
    },

    messageIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    messageContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    messageTitle: {
      fontSize: 8.5,
      letterSpacing: 0.8,
      color: "#64748B",
    },

    messageText: {
      marginTop: 4,
      fontSize: 10.5,
      lineHeight: 16,
      color: "#334155",
    },

    /* ==========================================================
       INFO
    ========================================================== */

    infoCard: {
      width: "100%",
      marginTop: 12,
      paddingHorizontal: 13,
      paddingVertical: 11,
      borderRadius: 15,
      backgroundColor:
        "#F8FAFC",
      flexDirection: "row",
      alignItems:
        "flex-start",
    },

    infoText: {
      flex: 1,
      minWidth: 0,
      marginLeft: 8,
      fontSize: 9.5,
      lineHeight: 15,
      color: "#64748B",
    },

    /* ==========================================================
       VIEW ORDER
    ========================================================== */

    viewButton: {
      width: "100%",
      minHeight: 53,
      marginTop: 22,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#93C5FD",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
    },

    viewButtonText: {
      fontSize: 11,
      color: "#2563EB",
    },

    /* ==========================================================
       BACK
    ========================================================== */

    backButton: {
      width: "100%",
      minHeight: 50,
      marginTop: 9,
      borderRadius: 15,
      backgroundColor:
        "#2563EB",
      alignItems: "center",
      justifyContent: "center",
    },

    backButtonText: {
      fontSize: 11,
      color: "#FFFFFF",
    },

    /* ==========================================================
       PRESS
    ========================================================== */

    buttonPressed: {
      opacity: 0.85,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    /* ==========================================================
       FOOTER
    ========================================================== */

    footer: {
      width: "100%",
      marginTop: 18,
      fontSize: 9,
      color: "#CBD5E1",
    },
  });