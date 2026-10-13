import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { auth } from "@/firebase/config";

import {
  createWorkerContactCallSession,
} from "@/services/calls/callSession";

import {
  getRecentlyContactedCustomers,
  type RecentlyContactedCustomer,
} from "@/services/workerContacts";

/* ============================================================
   CONSTANTS
============================================================ */

const COLORS = {
  background: "#F8FAFC",
  card: "#FFFFFF",

  text: "#172033",
  secondary: "#64748B",
  muted: "#94A3B8",

  border: "#DCEEFF",

  primary: "#F4B400",
  primarySoft: "#FFF7DF",

  fallbackBackground: "#EEF2F7",
  fallbackText: "#64748B",

  danger: "#DC2626",
  dangerBackground: "#FEF2F2",
  dangerBorder: "#FECACA",
};

const REFRESH_INTERVAL = 60_000;

/* ============================================================
   HELPERS
============================================================ */

function getInitials(name: string): string {
  const normalized = name.trim();

  if (!normalized) {
    return "C";
  }

  const parts = normalized
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * Supports the actual RecentlyContactedCustomer type:
 *
 * contactedAt: Date | null
 *
 * Also accepts string in case the service is later changed
 * to return ISO strings.
 */
function formatContactTime(
  value: Date | string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  let timestamp = 0;

  if (value instanceof Date) {
    timestamp = value.getTime();
  } else if (typeof value === "string") {
    timestamp = new Date(value).getTime();
  }

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "";
  }

  const difference = Math.max(
    0,
    Date.now() - timestamp,
  );

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute) {
    return "Now";
  }

  if (difference < hour) {
    return `${Math.floor(
      difference / minute,
    )}m ago`;
  }

  if (difference < day) {
    return `${Math.floor(
      difference / hour,
    )}h ago`;
  }

  const days = Math.floor(
    difference / day,
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(timestamp).toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function getSafeCustomerName(
  customer: RecentlyContactedCustomer,
): string {
  const name = customer.name?.trim();

  return name || "Fixxam Customer";
}

/* ============================================================
   CUSTOMER AVATAR
============================================================ */

function CustomerAvatar({
  customer,
}: {
  customer: RecentlyContactedCustomer;
}) {
  const customerName =
    getSafeCustomerName(customer);

  const hasPhoto =
    typeof customer.image === "string" &&
    (
      customer.image.startsWith("https://") ||
      customer.image.startsWith("http://")
    );

  if (hasPhoto) {
    return (
      <Image
        source={{
          uri: customer.image,
        }}
        style={styles.avatar}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitials}>
        {getInitials(customerName)}
      </Text>
    </View>
  );
}

/* ============================================================
   CUSTOMER CARD
============================================================ */

function CustomerCard({
  customer,
  calling,
  onCall,
}: {
  customer: RecentlyContactedCustomer;
  calling: boolean;
  onCall: (
    customer: RecentlyContactedCustomer,
  ) => void;
}) {
  const customerName =
    getSafeCustomerName(customer);

  const contactTime =
    formatContactTime(
      customer.contactedAt,
    );

  return (
    <View style={styles.card}>
      {/* CUSTOMER INFO */}

      <View style={styles.customerContent}>
        <CustomerAvatar
          customer={customer}
        />

        <View style={styles.info}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {customerName}
          </Text>

          <Text
            style={styles.subtitle}
            numberOfLines={1}
          >
            Called you
          </Text>
        </View>
      </View>

      {/* TIME + CALL */}

      <View style={styles.rightContent}>
        {contactTime ? (
          <Text
            style={styles.time}
            numberOfLines={1}
          >
            {contactTime}
          </Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Call ${customerName}`}
          accessibilityState={{
            disabled: calling,
            busy: calling,
          }}
          disabled={calling}
          style={[
            styles.callButton,
            calling &&
              styles.callButtonDisabled,
          ]}
          onPress={() => {
            onCall(customer);
          }}
        >
          {calling ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
            />
          ) : (
            <Ionicons
              name="call"
              size={21}
              color={COLORS.primary}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ============================================================
   SCREEN
============================================================ */

export default function MyContactsScreen() {
  const router = useRouter();

  const [customers, setCustomers] =
    useState<
      RecentlyContactedCustomer[]
    >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [callingCustomerId, setCallingCustomerId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  /* ==========================================================
     LOAD CONTACTS
  ========================================================== */

  const loadContacts =
    useCallback(
      async (
        showLoader = false,
      ) => {
        const workerId =
          auth.currentUser?.uid;

        if (!workerId) {
          setCustomers([]);
          setLoading(false);
          setRefreshing(false);

          setError(
            "Please sign in again.",
          );

          return;
        }

        try {
          if (showLoader) {
            setLoading(true);
          }

          setError(null);

          const result =
            await getRecentlyContactedCustomers(
              workerId,
            );

          setCustomers(result);
        } catch (loadError) {
          if (__DEV__) {
            console.error(
              "MY_CONTACTS_LOAD_ERROR:",
              loadError,
            );
          }

          setError(
            "Unable to load your contacts.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    void loadContacts(true);
  }, [loadContacts]);

  /* ==========================================================
     PERIODIC REFRESH
  ========================================================== */

  useEffect(() => {
    const interval =
      setInterval(() => {
        void loadContacts(false);
      }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [loadContacts]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    useCallback(() => {
      setRefreshing(true);
      setError(null);

      void loadContacts(false);
    }, [loadContacts]);

  /* ==========================================================
     CALL CUSTOMER
  ========================================================== */

  const handleCall =
    useCallback(
      async (
        customer: RecentlyContactedCustomer,
      ) => {
        const workerId =
          auth.currentUser?.uid;

        if (!workerId) {
          setError(
            "Please sign in again before making a call.",
          );
          return;
        }

        if (callingCustomerId) {
          return;
        }

        const customerId =
          customer.id?.trim();

        if (!customerId) {
          setError(
            "This customer contact is invalid.",
          );
          return;
        }

        setCallingCustomerId(
          customerId,
        );

        setError(null);

        try {
          /*
           * createWorkerContactCallSession()
           * verifies that this customer exists
           * under:
           *
           * workerContacts/{workerId}/customers/{customerId}
           */

          const callId =
            await createWorkerContactCallSession(
              {
                workerId,
                customerId,
              },
            );

          /*
           * Existing worker call route.
           *
           * Parameters:
           * - customer id
           * - call id
           * - customer name
           */

          router.push(
            `/call/${encodeURIComponent(
              customerId,
            )}?callId=${encodeURIComponent(
              callId,
            )}&customerName=${encodeURIComponent(
              getSafeCustomerName(
                customer,
              ),
            )}`,
          );
        } catch (callError) {
          if (__DEV__) {
            console.error(
              "WORKER_CUSTOMER_CALL_ERROR:",
              callError,
            );
          }

          const message =
            callError instanceof Error &&
            callError.message
              ? callError.message
              : "Unable to start the call. Please try again.";

          setError(message);
        } finally {
          setCallingCustomerId(
            null,
          );
        }
      },
      [
        callingCustomerId,
        router,
      ],
    );

  /* ==========================================================
     RENDER CUSTOMER
  ========================================================== */

  const renderCustomer =
    useCallback(
      ({
        item,
      }: {
        item: RecentlyContactedCustomer;
      }) => {
        return (
          <CustomerCard
            customer={item}
            calling={
              callingCustomerId ===
              item.id
            }
            onCall={handleCall}
          />
        );
      },
      [
        callingCustomerId,
        handleCall,
      ],
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  /* ==========================================================
     SCREEN
  ========================================================== */

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            My Contacts
          </Text>

          <Text style={styles.description}>
            Customers who recently contacted you.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {customers.length}
          </Text>
        </View>
      </View>

      {/* ERROR */}

      {error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={COLORS.danger}
            />
          </View>

          <Text
            style={styles.errorText}
            numberOfLines={3}
          >
            {error}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRefresh}
          >
            <Text style={styles.retryText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* LIST */}

      <FlatList
        data={customers}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={
          renderCustomer
        }
        contentContainerStyle={[
          styles.listContent,
          customers.length === 0 &&
            styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
            tintColor={
              COLORS.primary
            }
          />
        }
        showsVerticalScrollIndicator={
          false
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        ListHeaderComponent={
          customers.length > 0 ? (
            <View
              style={styles.summary}
            >
              <View
                style={
                  styles.summaryIcon
                }
              >
                <Ionicons
                  name="call"
                  size={27}
                  color={
                    COLORS.primary
                  }
                />
              </View>

              <View
                style={
                  styles.summaryContent
                }
              >
                <Text
                  style={
                    styles.summaryTitle
                  }
                >
                  {customers.length}{" "}
                  {customers.length ===
                  1
                    ? "customer"
                    : "customers"}
                </Text>

                <Text
                  style={
                    styles.summarySubtitle
                  }
                >
                  Customers who called you
                </Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="call-outline"
                size={35}
                color={
                  COLORS.primary
                }
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No contacts yet
            </Text>

            <Text
              style={
                styles.emptyDescription
              }
            >
              Customers who call you will
              appear here so you can easily
              call them back.
            </Text>
          </View>
        }
      />
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    headerText: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      fontSize: 26,
      fontWeight: "700",
      color: COLORS.text,
    },

    description: {
      marginTop: 4,
      fontSize: 14,
      lineHeight: 20,
      color: COLORS.secondary,
    },

    countBadge: {
      minWidth: 44,
      height: 44,
      paddingHorizontal: 12,

      borderRadius: 22,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        COLORS.primarySoft,
    },

    countText: {
      fontSize: 15,
      fontWeight: "700",
      color: COLORS.primary,
    },

    /* ========================================================
       SUMMARY
    ======================================================== */

    summary: {
      minHeight: 82,

      marginBottom: 14,

      paddingHorizontal: 16,
      paddingVertical: 12,

      flexDirection: "row",
      alignItems: "center",

      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 20,

      backgroundColor:
        COLORS.card,
    },

    summaryIcon: {
      width: 60,
      height: 60,

      alignItems: "center",
      justifyContent: "center",

      borderRadius: 18,

      backgroundColor:
        COLORS.primarySoft,
    },

    summaryContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 14,
    },

    summaryTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: COLORS.text,
    },

    summarySubtitle: {
      marginTop: 4,
      fontSize: 14,
      color: COLORS.secondary,
    },

    /* ========================================================
       LIST
    ======================================================== */

    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },

    emptyList: {
      flexGrow: 1,
    },

    /* ========================================================
       CUSTOMER CARD
    ======================================================== */

    card: {
      marginBottom: 12,

      minHeight: 86,

      paddingHorizontal: 14,
      paddingVertical: 10,

      borderRadius: 20,

      backgroundColor:
        COLORS.card,

      flexDirection: "row",
      alignItems: "center",

      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    customerContent: {
      flex: 1,
      minWidth: 0,

      flexDirection: "row",
      alignItems: "center",
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatar: {
      width: 58,
      height: 58,

      flexShrink: 0,

      borderRadius: 29,

      backgroundColor:
        COLORS.fallbackBackground,
    },

    avatarFallback: {
      width: 58,
      height: 58,

      flexShrink: 0,

      borderRadius: 29,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        COLORS.fallbackBackground,
    },

    avatarInitials: {
      fontSize: 19,
      fontWeight: "700",
      color: COLORS.fallbackText,
    },

    /* ========================================================
       CUSTOMER INFO
    ======================================================== */

    info: {
      flex: 1,
      minWidth: 0,
      marginLeft: 13,
    },

    name: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "700",
      color: COLORS.text,
    },

    subtitle: {
      marginTop: 5,

      fontSize: 13,
      lineHeight: 18,

      color: COLORS.secondary,

      fontWeight: "500",
    },

    /* ========================================================
       RIGHT SIDE
    ======================================================== */

    rightContent: {
      flexShrink: 0,

      marginLeft: 8,

      alignItems: "flex-end",
      justifyContent: "center",
    },

    time: {
      marginBottom: 5,

      fontSize: 12,
      lineHeight: 16,

      color: COLORS.muted,

      fontWeight: "500",
    },

    /* ========================================================
       CALL BUTTON
    ======================================================== */

    callButton: {
      width: 42,
      height: 42,

      borderRadius: 21,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        COLORS.primarySoft,
    },

    callButtonDisabled: {
      opacity: 0.6,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorContainer: {
      marginHorizontal: 16,
      marginBottom: 12,

      padding: 12,

      borderRadius: 16,

      flexDirection: "row",
      alignItems: "center",

      backgroundColor:
        COLORS.dangerBackground,

      borderWidth: 1,
      borderColor:
        COLORS.dangerBorder,
    },

    errorIcon: {
      width: 36,
      height: 36,

      borderRadius: 18,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor: "#FEE2E2",
    },

    errorText: {
      flex: 1,

      marginLeft: 8,
      marginRight: 8,

      fontSize: 13,
      lineHeight: 18,

      color: "#991B1B",
    },

    retryText: {
      fontSize: 13,
      fontWeight: "700",
      color: COLORS.danger,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    center: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        COLORS.background,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyContainer: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 32,
      paddingTop: 80,
    },

    emptyIcon: {
      width: 76,
      height: 76,

      borderRadius: 38,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        COLORS.primarySoft,

      marginBottom: 18,
    },

    emptyTitle: {
      fontSize: 19,
      lineHeight: 25,

      fontWeight: "700",

      color: COLORS.text,

      textAlign: "center",
    },

    emptyDescription: {
      marginTop: 8,

      fontSize: 14,
      lineHeight: 21,

      color: COLORS.secondary,

      textAlign: "center",
    },
  });