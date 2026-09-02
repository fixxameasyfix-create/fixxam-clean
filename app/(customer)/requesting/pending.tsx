import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
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

import CategoryCard from "@/components/categories/CategoryCard";

import {
  getServicesByIds,
} from "@/firebase/queries/getServicesByIds";

/* ==============================================================
   TYPES
============================================================== */

type ServiceData = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  backgroundColor?: string;
};

type PendingParams = {
  bookingId?: string;

  serviceId?: string;
  serviceName?: string;

  serviceIcon?: string;
  serviceColor?: string;
  serviceBackgroundColor?: string;

  workerId?: string;
  workerName?: string;
  workerPhoto?: string;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DEFAULT_SERVICE_ICON =
  "tools";

const DEFAULT_SERVICE_COLOR =
  "#2563EB";

const DEFAULT_SERVICE_BACKGROUND =
  "#EFF6FF";

/* ==============================================================
   SCREEN
============================================================== */

export default function PendingScreen() {
  const {
    bookingId,

    serviceId,
    serviceName,

    serviceIcon,
    serviceColor,
    serviceBackgroundColor,

    workerId,
    workerName,
    workerPhoto,
  } =
    useLocalSearchParams<PendingParams>();

  /* ============================================================
     SERVICE STATE
  ============================================================ */

  const [
    firebaseService,
    setFirebaseService,
  ] = useState<ServiceData | null>(
    null,
  );

  const [
    loadingService,
    setLoadingService,
  ] = useState(false);

  /* ============================================================
     RESOLVED SERVICE ID
  ============================================================ */

  const resolvedServiceId =
    useMemo(
      () =>
        serviceId?.trim() ?? "",
      [serviceId],
    );

  /* ============================================================
     RESOLVED SERVICE NAME
  ============================================================ */

  const resolvedServiceName =
    useMemo(
      () =>
        serviceName?.trim() ||
        firebaseService?.name?.trim() ||
        "Selected service",
      [
        serviceName,
        firebaseService?.name,
      ],
    );

  /* ============================================================
     RESOLVED SERVICE ICON
  ============================================================ */

  const resolvedServiceIcon =
    useMemo(
      () =>
        serviceIcon?.trim() ||
        firebaseService?.icon?.trim() ||
        DEFAULT_SERVICE_ICON,
      [
        serviceIcon,
        firebaseService?.icon,
      ],
    );

  /* ============================================================
     RESOLVED SERVICE COLOR
  ============================================================ */

  const resolvedServiceColor =
    useMemo(
      () =>
        serviceColor?.trim() ||
        firebaseService?.color?.trim() ||
        DEFAULT_SERVICE_COLOR,
      [
        serviceColor,
        firebaseService?.color,
      ],
    );

  /* ============================================================
     RESOLVED SERVICE BACKGROUND
  ============================================================ */

  const resolvedServiceBackground =
    useMemo(
      () =>
        serviceBackgroundColor?.trim() ||
        firebaseService?.backgroundColor?.trim() ||
        DEFAULT_SERVICE_BACKGROUND,
      [
        serviceBackgroundColor,
        firebaseService?.backgroundColor,
      ],
    );

  /* ============================================================
     LOAD SERVICE FROM FIREBASE
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    async function loadService() {
      if (!resolvedServiceId) {
        return;
      }

      /*
       * If all Firebase icon data already came
       * from BookingScreen, no extra request.
       */
      if (
        serviceIcon?.trim() &&
        serviceColor?.trim() &&
        serviceBackgroundColor?.trim()
      ) {
        return;
      }

      setLoadingService(true);

      try {
        const services =
          await getServicesByIds([
            resolvedServiceId,
          ]);

        if (!mounted) {
          return;
        }

        const rawService =
          services.find(
            (service) => {
              const item =
                service as {
                  id?: unknown;
                  serviceId?: unknown;
                };

              const id =
                typeof item.id ===
                "string"
                  ? item.id.trim()
                  : typeof item.serviceId ===
                      "string"
                    ? item.serviceId.trim()
                    : "";

              return (
                id ===
                resolvedServiceId
              );
            },
          );

        if (!rawService) {
          setFirebaseService(null);
          return;
        }

        const item =
          rawService as {
            id?: unknown;
            serviceId?: unknown;
            name?: unknown;
            serviceName?: unknown;
            icon?: unknown;
            color?: unknown;
            backgroundColor?: unknown;
          };

        const id =
          typeof item.id === "string"
            ? item.id.trim()
            : typeof item.serviceId ===
                "string"
              ? item.serviceId.trim()
              : resolvedServiceId;

        const name =
          typeof item.name ===
          "string"
            ? item.name.trim()
            : typeof item.serviceName ===
                "string"
              ? item.serviceName.trim()
              : "";

        const icon =
          typeof item.icon ===
          "string"
            ? item.icon.trim()
            : "";

        const color =
          typeof item.color ===
          "string"
            ? item.color.trim()
            : "";

        const backgroundColor =
          typeof item.backgroundColor ===
          "string"
            ? item.backgroundColor.trim()
            : "";

        setFirebaseService({
          id,
          name,

          ...(icon
            ? {
                icon,
              }
            : {}),

          ...(color
            ? {
                color,
              }
            : {}),

          ...(backgroundColor
            ? {
                backgroundColor,
              }
            : {}),
        });
      } catch (error) {
        console.error(
          "PENDING_LOAD_SERVICE_ERROR:",
          error,
        );

        if (mounted) {
          setFirebaseService(null);
        }
      } finally {
        if (mounted) {
          setLoadingService(false);
        }
      }
    }

    void loadService();

    return () => {
      mounted = false;
    };
  }, [
    resolvedServiceId,
    serviceIcon,
    serviceColor,
    serviceBackgroundColor,
  ]);

  /* ============================================================
     VIEW ORDER
  ============================================================ */

  const handleViewOrder =
    useCallback(() => {
      if (!bookingId) {
        router.replace(
          "/(customer)/(tabs)/orders",
        );

        return;
      }

      router.push({
        pathname:
          "/(customer)/orders/[orderId]",
        params: {
          orderId: bookingId,
        },
      });
    }, [bookingId]);

  /* ============================================================
     HOME
  ============================================================ */

  const handleBackHome =
    useCallback(() => {
      router.replace(
        "/(customer)/(tabs)/home",
      );
    }, []);

  /* ============================================================
     WORKER PROFILE
  ============================================================ */

  const handleWorkerProfile =
    useCallback(() => {
      if (!workerId) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/details/worker-profile/[id]",
        params: {
          id: workerId,
        },
      } as const);
    }, [workerId]);

  /* ============================================================
     SERVICE CARD PRESS
  ============================================================ */

  const handleServicePress =
    useCallback(() => {
      /*
       * Service is already selected.
       * We intentionally do not navigate.
       */
    }, []);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      contentContainerStyle={
        styles.container
      }
    >
      {/* ======================================================
          SUCCESS
      ====================================================== */}

      <View
        style={
          styles.successIcon
        }
      >
        <Ionicons
          name="checkmark"
          size={34}
          color="#16A34A"
        />
      </View>

      <AppText
        weight="bold"
        style={styles.title}
      >
        Requesting Sent Successfully
      </AppText>

      <AppText
        center
        style={styles.description}
      >
        Your request has been sent
        successfully.
      </AppText>

      {/* ======================================================
          1 — WORKER
      ====================================================== */}

      <SectionTitle
        number="1"
        title="Request sent to worker"
      />

      {workerId ? (
        <Pressable
          onPress={
            handleWorkerProfile
          }
          accessibilityRole="button"
          accessibilityLabel="View selected worker"
          style={({ pressed }) => [
            styles.workerCard,

            pressed &&
              styles.cardPressed,
          ]}
        >
          {/* AVATAR */}

          <View
            style={
              styles.avatarContainer
            }
          >
            {workerPhoto ? (
              <Image
                source={{
                  uri: workerPhoto,
                }}
                style={
                  styles.avatar
                }
              />
            ) : (
              <View
                style={
                  styles.avatarPlaceholder
                }
              >
                <Ionicons
                  name="person"
                  size={25}
                  color="#94A3B8"
                />
              </View>
            )}

            <View
              style={
                styles.workerCheck
              }
            >
              <Ionicons
                name="checkmark"
                size={12}
                color="#FFFFFF"
              />
            </View>
          </View>

          {/* WORKER INFO */}

          <View
            style={
              styles.workerContent
            }
          >
            <AppText
              style={
                styles.cardLabel
              }
            >
              SELECTED WORKER
            </AppText>

            <AppText
              weight="bold"
              numberOfLines={1}
              style={
                styles.workerName
              }
            >
              {workerName ||
                "Selected worker"}
            </AppText>

            <AppText
              style={
                styles.cardHint
              }
            >
              Tap to view worker profile
            </AppText>
          </View>

          <View
            style={
              styles.chevronBox
            }
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#64748B"
            />
          </View>
        </Pressable>
      ) : (
        <View
          style={styles.workerCard}
        >
          <View
            style={
              styles.avatarPlaceholder
            }
          >
            <Ionicons
              name="person"
              size={25}
              color="#94A3B8"
            />
          </View>

          <View
            style={
              styles.workerContent
            }
          >
            <AppText
              style={
                styles.cardLabel
              }
            >
              SELECTED WORKER
            </AppText>

            <AppText
              weight="bold"
              style={
                styles.workerName
              }
            >
              Selected worker
            </AppText>
          </View>
        </View>
      )}

      {/* ======================================================
          2 — SERVICE
      ====================================================== */}

      <SectionTitle
        number="2"
        title="Service"
      />

      {loadingService ? (
        <View
          style={
            styles.serviceLoading
          }
        >
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />

          <AppText
            style={
              styles.serviceLoadingText
            }
          >
            Loading service...
          </AppText>
        </View>
      ) : (
        <View
          style={
            styles.categoryCardWrapper
          }
        >
          <CategoryCard
            icon={
              resolvedServiceIcon
            }
            iconColor={
              resolvedServiceColor
            }
            backgroundColor={
              resolvedServiceBackground
            }
            title={
              resolvedServiceName
            }
            onPress={
              handleServicePress
            }
          />

          {/* SELECTED CHECK */}

          <View
            pointerEvents="none"
            style={
              styles.serviceCheckOverlay
            }
          >
            <Ionicons
              name="checkmark"
              size={16}
              color="#FFFFFF"
            />
          </View>
        </View>
      )}

      {/* ======================================================
          3 — STATUS
      ====================================================== */}

      <SectionTitle
        number="3"
        title="Request status"
      />

      <View
        style={styles.statusCard}
      >
        <View
          style={
            styles.statusIconBox
          }
        >
          <Ionicons
            name="time-outline"
            size={23}
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
            PENDING
          </AppText>

          <AppText
            style={
              styles.statusText
            }
          >
            Waiting for the selected
            worker to respond.
          </AppText>
        </View>

        <View
          style={
            styles.pendingBadge
          }
        >
          <View
            style={
              styles.pendingDot
            }
          />

          <AppText
            weight="bold"
            style={
              styles.pendingText
            }
          >
            WAITING
          </AppText>
        </View>
      </View>

      {/* ======================================================
          INFORMATION
      ====================================================== */}

      <View
        style={styles.infoCard}
      >
        <View
          style={
            styles.infoIconBox
          }
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#64748B"
          />
        </View>

        <AppText
          style={styles.infoText}
        >
          You can track your request and
          view its latest status from
          My Orders.
        </AppText>
      </View>

      {/* ======================================================
          VIEW ORDER
      ====================================================== */}

      <Pressable
        onPress={
          handleViewOrder
        }
        accessibilityRole="button"
        accessibilityLabel="View my order"
        style={({ pressed }) => [
          styles.primaryButton,

          pressed &&
            styles.primaryButtonPressed,
        ]}
      >
        <View
          style={
            styles.primaryIconBox
          }
        >
          <Ionicons
            name="receipt-outline"
            size={18}
            color="#FFFFFF"
          />
        </View>

        <AppText
          weight="bold"
          style={
            styles.primaryButtonText
          }
        >
          VIEW MY ORDER
        </AppText>

        <Ionicons
          name="arrow-forward"
          size={20}
          color="#FFFFFF"
        />
      </Pressable>

      {/* ======================================================
          BACK HOME
      ====================================================== */}

      <Pressable
        onPress={
          handleBackHome
        }
        accessibilityRole="button"
        accessibilityLabel="Back to home"
        style={({ pressed }) => [
          styles.secondaryButton,

          pressed &&
            styles.secondaryButtonPressed,
        ]}
      >
        <Ionicons
          name="home-outline"
          size={18}
          color="#475569"
        />

        <AppText
          weight="bold"
          style={
            styles.secondaryButtonText
          }
        >
          BACK TO HOME
        </AppText>
      </Pressable>

      {/* ======================================================
          REQUEST ID
      ====================================================== */}

      {bookingId && (
        <AppText
          center
          numberOfLines={1}
          style={
            styles.requestId
          }
        >
          Request ID: {bookingId}
        </AppText>
      )}
    </AppScreen>
  );
}

/* ==============================================================
   SECTION TITLE
============================================================== */

function SectionTitle({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <View
      style={
        styles.sectionTitle
      }
    >
      <View
        style={
          styles.sectionNumber
        }
      >
        <AppText
          weight="bold"
          style={
            styles.sectionNumberText
          }
        >
          {number}
        </AppText>
      </View>

      <AppText
        weight="bold"
        style={
          styles.sectionText
        }
      >
        {title}
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
       CONTAINER
    ========================================================== */

    container: {
      flexGrow: 1,

      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 36,

      backgroundColor:
        "#F8FAFC",
    },

    /* ==========================================================
       SUCCESS
    ========================================================== */

    successIcon: {
      width: 70,
      height: 70,

      borderRadius: 22,

      backgroundColor:
        "#DCFCE7",

      borderWidth: 1,
      borderColor:
        "#BBF7D0",

      alignItems: "center",
      justifyContent: "center",

      alignSelf: "center",

      marginBottom: 15,
    },

    title: {
      fontSize: 23,
      lineHeight: 29,

      color: "#0F172A",

      textAlign: "center",
    },

    description: {
      marginTop: 5,
      marginBottom: 18,

      paddingHorizontal: 24,

      fontSize: 12,
      lineHeight: 18,

      color: "#64748B",
    },

    /* ==========================================================
       SECTION
    ========================================================== */

    sectionTitle: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 8,
      marginBottom: 9,
    },

    sectionNumber: {
      width: 27,
      height: 27,

      borderRadius: 9,

      backgroundColor:
        "#EFF6FF",

      alignItems: "center",
      justifyContent: "center",

      marginRight: 8,
    },

    sectionNumberText: {
      fontSize: 13,
      color: "#2563EB",
    },

    sectionText: {
      flex: 1,

      fontSize: 16,
      lineHeight: 21,

      color: "#0F172A",
    },

    /* ==========================================================
       WORKER
    ========================================================== */

    workerCard: {
      minHeight: 78,

      paddingHorizontal: 12,
      paddingVertical: 11,

      borderRadius: 20,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,
      borderColor:
        "#E2E8F0",

      flexDirection: "row",
      alignItems: "center",

      shadowColor:
        "#0F172A",

      shadowOpacity: 0.045,

      shadowRadius: 12,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 3,
    },

    cardPressed: {
      opacity: 0.9,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    avatarContainer: {
      position: "relative",
    },

    avatar: {
      width: 52,
      height: 52,

      borderRadius: 17,

      backgroundColor:
        "#E2E8F0",
    },

    avatarPlaceholder: {
      width: 52,
      height: 52,

      borderRadius: 17,

      backgroundColor:
        "#F8FAFC",

      borderWidth: 1,
      borderColor:
        "#E2E8F0",

      alignItems: "center",
      justifyContent: "center",
    },

    workerCheck: {
      position: "absolute",

      right: -3,
      bottom: -3,

      width: 20,
      height: 20,

      borderRadius: 10,

      backgroundColor:
        "#16A34A",

      borderWidth: 2,
      borderColor:
        "#FFFFFF",

      alignItems: "center",
      justifyContent: "center",
    },

    workerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft: 11,
      marginRight: 8,
    },

    cardLabel: {
      fontSize: 9,
      lineHeight: 13,

      letterSpacing: 1,

      color: "#94A3B8",
    },

    workerName: {
      marginTop: 3,

      fontSize: 15.5,
      lineHeight: 21,

      color: "#0F172A",
    },

    cardHint: {
      marginTop: 2,

      fontSize: 10.5,
      lineHeight: 15,

      color: "#64748B",
    },

    chevronBox: {
      width: 32,
      height: 32,

      borderRadius: 10,

      backgroundColor:
        "#F8FAFC",

      alignItems: "center",
      justifyContent: "center",
    },

    /* ==========================================================
       CATEGORY CARD
    ========================================================== */

    categoryCardWrapper: {
      position: "relative",
    },

    serviceCheckOverlay: {
      position: "absolute",

      right: 12,
      top: "50%",

      width: 30,
      height: 30,

      marginTop: -15,

      borderRadius: 15,

      backgroundColor:
        "#2563EB",

      alignItems: "center",
      justifyContent: "center",

      zIndex: 10,
      elevation: 10,
    },

    serviceLoading: {
      minHeight: 76,

      borderRadius: 17,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,
      borderColor:
        "#E2E8F0",

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      gap: 9,
    },

    serviceLoadingText: {
      fontSize: 11,

      color: "#64748B",
    },

    /* ==========================================================
       STATUS
    ========================================================== */

    statusCard: {
      minHeight: 82,

      paddingHorizontal: 12,
      paddingVertical: 11,

      borderRadius: 20,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,
      borderColor:
        "#E2E8F0",

      flexDirection: "row",
      alignItems: "center",

      shadowColor:
        "#0F172A",

      shadowOpacity: 0.045,

      shadowRadius: 12,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 3,
    },

    statusIconBox: {
      width: 50,
      height: 50,

      borderRadius: 16,

      backgroundColor:
        "#EFF6FF",

      borderWidth: 1,
      borderColor:
        "#DBEAFE",

      alignItems: "center",
      justifyContent: "center",
    },

    statusContent: {
      flex: 1,

      minWidth: 0,

      marginLeft: 11,
      marginRight: 8,
    },

    statusTitle: {
      fontSize: 12,
      lineHeight: 17,

      letterSpacing: 0.5,

      color: "#1D4ED8",
    },

    statusText: {
      marginTop: 3,

      fontSize: 10.5,
      lineHeight: 15,

      color: "#64748B",
    },

    pendingBadge: {
      minHeight: 27,

      paddingHorizontal: 9,

      borderRadius: 9,

      backgroundColor:
        "#FFF7ED",

      borderWidth: 1,
      borderColor:
        "#FED7AA",

      flexDirection: "row",
      alignItems: "center",

      gap: 5,
    },

    pendingDot: {
      width: 6,
      height: 6,

      borderRadius: 3,

      backgroundColor:
        "#F59E0B",
    },

    pendingText: {
      fontSize: 8.5,
      lineHeight: 12,

      letterSpacing: 0.4,

      color: "#B45309",
    },

    /* ==========================================================
       INFO
    ========================================================== */

    infoCard: {
      minHeight: 58,

      marginTop: 12,

      paddingHorizontal: 11,
      paddingVertical: 10,

      borderRadius: 17,

      backgroundColor:
        "#F8FAFC",

      borderWidth: 1,
      borderColor:
        "#E2E8F0",

      flexDirection: "row",
      alignItems: "center",
    },

    infoIconBox: {
      width: 34,
      height: 34,

      borderRadius: 11,

      backgroundColor:
        "#FFFFFF",

      alignItems: "center",
      justifyContent: "center",
    },

    infoText: {
      flex: 1,

      marginLeft: 8,

      fontSize: 10.5,
      lineHeight: 16,

      color: "#64748B",
    },

    /* ==========================================================
       PRIMARY BUTTON
    ========================================================== */

    primaryButton: {
      minHeight: 56,

      marginTop: 18,

      borderRadius: 17,

      backgroundColor:
        "#2563EB",

      paddingHorizontal: 16,

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      gap: 9,

      shadowColor:
        "#2563EB",

      shadowOpacity: 0.12,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },

    primaryButtonPressed: {
      opacity: 0.88,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    primaryIconBox: {
      width: 25,
      height: 25,

      borderRadius: 8,

      backgroundColor:
        "rgba(255,255,255,0.14)",

      alignItems: "center",
      justifyContent: "center",
    },

    primaryButtonText: {
      fontSize: 13,
      lineHeight: 18,

      color: "#FFFFFF",
    },

    /* ==========================================================
       SECONDARY BUTTON
    ========================================================== */

    secondaryButton: {
      minHeight: 50,

      marginTop: 9,

      borderRadius: 16,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,
      borderColor:
        "#E2E8F0",

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      gap: 7,
    },

    secondaryButtonPressed: {
      opacity: 0.7,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    secondaryButtonText: {
      fontSize: 11.5,
      lineHeight: 17,

      color: "#475569",
    },

    /* ==========================================================
       REQUEST ID
    ========================================================== */

    requestId: {
      marginTop: 11,

      paddingHorizontal: 20,

      fontSize: 9.5,
      lineHeight: 14,

      color: "#94A3B8",
    },
  });