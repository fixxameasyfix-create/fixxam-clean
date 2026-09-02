import React, {
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import type {
  ComponentProps,
} from "react";

import {
  AppText,
} from "@/components/ui";

import type {
  ServiceItem,
} from "@/hooks/services/useServices";

/* ==============================================================
   TYPES
============================================================== */

type IconName =
  ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

type ServiceWithCategory =
  ServiceItem & {
    categoryId?: string;
  };

interface Props {
  services: ServiceItem[];
}

/* ==============================================================
   CONSTANTS
============================================================== */

const DEFAULT_ICON: IconName =
  "tools";

const DEFAULT_COLOR =
  "#2563EB";

const DEFAULT_BACKGROUND =
  "#EFF6FF";

/* ==============================================================
   HELPERS
============================================================== */

function getSafeString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value !== "string"
  ) {
    return fallback;
  }

  const trimmed =
    value.trim();

  return trimmed || fallback;
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function ServicesGrid({
  services,
}: Props) {
  /* ============================================================
     OPEN SERVICE
  ============================================================ */

  const handleServicePress =
    useCallback(
      (
        service: ServiceItem,
      ) => {
        /* ======================================================
           SERVICE ID
        ====================================================== */

        const serviceId =
          getSafeString(
            service.id,
          );

        if (!serviceId) {
          console.error(
            "SERVICES_GRID_MISSING_SERVICE_ID",
            service,
          );

          return;
        }

        /* ======================================================
           SERVICE NAME
        ====================================================== */

        const serviceName =
          getSafeString(
            service.name,
          );

        if (!serviceName) {
          console.error(
            "SERVICES_GRID_MISSING_SERVICE_NAME",
            {
              serviceId,
              service,
            },
          );

          return;
        }

        /* ======================================================
           SERVICE ICON
        ====================================================== */

        const serviceIcon =
          getSafeString(
            service.icon,
            DEFAULT_ICON,
          );

        /* ======================================================
           SERVICE COLOR
        ====================================================== */

        const serviceColor =
          getSafeString(
            service.color,
            DEFAULT_COLOR,
          );

        /* ======================================================
           SERVICE BACKGROUND
        ====================================================== */

        const serviceBackgroundColor =
          getSafeString(
            service.backgroundColor,
            DEFAULT_BACKGROUND,
          );

        /* ======================================================
           CATEGORY ID
        ====================================================== */

        const serviceWithCategory =
          service as ServiceWithCategory;

        const categoryId =
          getSafeString(
            serviceWithCategory.categoryId,
          );

        /* ======================================================
           DEBUG
        ====================================================== */

        console.log(
          "OPEN_SERVICE_FROM_GRID",
          {
            serviceId,
            serviceName,
            serviceIcon,
            serviceColor,
            serviceBackgroundColor,
            categoryId,
          },
        );

        /* ======================================================
           NAVIGATE TO WORKERS
           
           IMPORTANT:
           Do NOT change this to "/services".
           
           This is the route that displays workers
           for the selected service.
        ====================================================== */

        router.push({
          pathname:
            "/(customer)/details/workers/[id]",

          params: {
            /* --------------------------------------------------
               Dynamic route parameter

               [id] = service ID
            -------------------------------------------------- */

            id: serviceId,

            /* --------------------------------------------------
               Explicit service ID
            -------------------------------------------------- */

            serviceId,

            /* --------------------------------------------------
               Service name
            -------------------------------------------------- */

            serviceName,

            /* --------------------------------------------------
               Backward compatibility
            -------------------------------------------------- */

            service:
              serviceName,

            /* --------------------------------------------------
               Service icon
            -------------------------------------------------- */

            serviceIcon,

            /* --------------------------------------------------
               Service icon color
            -------------------------------------------------- */

            serviceColor,

            /* --------------------------------------------------
               Service icon background
            -------------------------------------------------- */

            serviceBackgroundColor,

            /* --------------------------------------------------
               Category ID
            -------------------------------------------------- */

            ...(categoryId
              ? {
                  categoryId,
                }
              : {}),
          },
        });
      },
      [],
    );

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  if (
    !services ||
    services.length === 0
  ) {
    return null;
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.grid
      }
    >
      {services.map(
        (
          item,
        ) => {
          /* ====================================================
             SERVICE ICON
          ==================================================== */

          const iconName =
            getSafeString(
              item.icon,
              DEFAULT_ICON,
            ) as IconName;

          /* ====================================================
             SERVICE COLOR
          ==================================================== */

          const iconColor =
            getSafeString(
              item.color,
              DEFAULT_COLOR,
            );

          /* ====================================================
             SERVICE BACKGROUND
          ==================================================== */

          const iconBackground =
            getSafeString(
              item.backgroundColor,
              DEFAULT_BACKGROUND,
            );

          /* ====================================================
             BOOKING COUNT
          ==================================================== */

          const bookingCount =
            Number.isFinite(
              Number(
                item.bookingCount,
              ),
            )
              ? Number(
                  item.bookingCount,
                )
              : 0;

          return (
            <Pressable
              key={
                item.id
              }
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.name}`}
              accessibilityHint="Opens workers available for this service"
              onPress={() =>
                handleServicePress(
                  item,
                )
              }
              style={({
                pressed,
              }) => [
                styles.item,

                pressed &&
                  styles.itemPressed,
              ]}
            >
              <View
                style={
                  styles.card
                }
              >
                {/* =================================================
                    CARD TOP
                ================================================= */}

                <View
                  style={
                    styles.cardTop
                  }
                >
                  {/* ===============================================
                      SERVICE ICON
                  =============================================== */}

                  <View
                    style={[
                      styles.icon,
                      {
                        backgroundColor:
                          iconBackground,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        iconName
                      }
                      size={27}
                      color={
                        iconColor
                      }
                    />
                  </View>

                  {/* ===============================================
                      ARROW
                  =============================================== */}

                  <View
                    style={
                      styles.arrow
                    }
                  >
                    <MaterialCommunityIcons
                      name="arrow-top-right"
                      size={17}
                      color="#2563EB"
                    />
                  </View>
                </View>

                {/* =================================================
                    SERVICE INFORMATION
                ================================================= */}

                <View
                  style={
                    styles.info
                  }
                >
                  <AppText
                    weight="bold"
                    numberOfLines={2}
                    style={
                      styles.name
                    }
                  >
                    {item.name}
                  </AppText>

                  <AppText
                    style={
                      styles.bookings
                    }
                  >
                    {bookingCount}{" "}
                    {bookingCount ===
                    1
                      ? "booking"
                      : "bookings"}
                  </AppText>
                </View>
              </View>
            </Pressable>
          );
        },
      )}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       GRID
    ========================================================== */

    grid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "space-between",

      rowGap: 12,
    },

    /* ==========================================================
       PRESSABLE ITEM
    ========================================================== */

    item: {
      width: "48.5%",
    },

    itemPressed: {
      opacity: 0.88,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    /* ==========================================================
       CARD
    ========================================================== */

    card: {
      minHeight: 172,

      padding: 15,

      borderRadius: 20,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      shadowColor:
        "#0F172A",

      shadowOpacity:
        0.06,

      shadowRadius:
        9,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 3,
    },

    /* ==========================================================
       CARD TOP
    ========================================================== */

    cardTop: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    /* ==========================================================
       ICON
    ========================================================== */

    icon: {
      width: 54,

      height: 54,

      borderRadius: 16,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ==========================================================
       ARROW
    ========================================================== */

    arrow: {
      width: 32,

      height: 32,

      borderRadius: 10,

      backgroundColor:
        "#EFF6FF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ==========================================================
       INFO
    ========================================================== */

    info: {
      marginTop: 24,
    },

    /* ==========================================================
       SERVICE NAME
    ========================================================== */

    name: {
      fontSize: 16,

      lineHeight: 22,

      color:
        "#0F172A",
    },

    /* ==========================================================
       BOOKINGS
    ========================================================== */

    bookings: {
      marginTop: 7,

      fontSize: 12,

      color:
        "#64748B",
    },
  });