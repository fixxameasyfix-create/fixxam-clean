import React, {
  useCallback,
} from "react";

import {
  FlatList,
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
  PopularService,
} from "@/hooks/services/usePopularServices";

/* ==============================================================
   TYPES
============================================================== */

type IconName =
  ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

interface Props {
  services: PopularService[];
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
   COMPONENT
============================================================== */

export default function MostBookedServices({
  services,
}: Props) {
  /* ============================================================
     OPEN SERVICE
  ============================================================ */

  const handleServicePress =
    useCallback(
      (
        service: PopularService,
      ) => {
        /* ======================================================
           SERVICE ID
        ====================================================== */

        const serviceId =
          typeof service.id ===
            "string"
            ? service.id.trim()
            : "";

        if (!serviceId) {
          console.error(
            "MOST_BOOKED_MISSING_SERVICE_ID",
            service,
          );

          return;
        }

        /* ======================================================
           SERVICE NAME
        ====================================================== */

        const serviceName =
          typeof service.name ===
            "string"
            ? service.name.trim()
            : "";

        if (!serviceName) {
          console.error(
            "MOST_BOOKED_MISSING_SERVICE_NAME",
            service,
          );

          return;
        }

        /* ======================================================
           SERVICE ICON
        ====================================================== */

        const serviceIcon =
          typeof service.icon ===
            "string" &&
          service.icon.trim()
            ? service.icon.trim()
            : DEFAULT_ICON;

        /* ======================================================
           SERVICE COLOR
        ====================================================== */

        const serviceColor =
          typeof service.color ===
            "string" &&
          service.color.trim()
            ? service.color.trim()
            : DEFAULT_COLOR;

        /* ======================================================
           SERVICE BACKGROUND
        ====================================================== */

        const serviceBackgroundColor =
          typeof service.backgroundColor ===
            "string" &&
          service.backgroundColor.trim()
            ? service.backgroundColor.trim()
            : DEFAULT_BACKGROUND;

        /* ======================================================
           CATEGORY
        ====================================================== */

        const categoryId =
          typeof service.categoryId ===
            "string"
            ? service.categoryId.trim()
            : "";

        /* ======================================================
           DEBUG
        ====================================================== */

        console.log(
          "OPEN_MOST_BOOKED_SERVICE",
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
        ====================================================== */

        router.push({
          pathname:
            "/(customer)/details/workers/[id]",

          params: {
            /*
             * Dynamic route parameter.
             *
             * [id] = Firestore service document ID.
             */
            id: serviceId,

            /*
             * Explicit service ID.
             */
            serviceId,

            /*
             * Current service name.
             */
            serviceName,

            /*
             * Backward compatibility.
             */
            service: serviceName,

            /*
             * Exact MaterialCommunityIcons
             * icon from the service document.
             */
            serviceIcon,

            /*
             * Exact icon color.
             */
            serviceColor,

            /*
             * Exact icon background.
             */
            serviceBackgroundColor,

            /*
             * Optional category.
             */
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
     EMPTY
  ============================================================ */

  if (services.length === 0) {
    return null;
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerText
          }
        >
          <AppText
            weight="bold"
            style={
              styles.title
            }
          >
            Most booked
          </AppText>

          <AppText
            style={
              styles.subtitle
            }
          >
            Services customers book most
          </AppText>
        </View>

        <View
          style={
            styles.fire
          }
        >
          <AppText
            style={
              styles.fireText
            }
          >
            🔥
          </AppText>
        </View>
      </View>

      {/* =====================================================
          SERVICES
      ===================================================== */}

      <FlatList
        horizontal
        data={services}
        keyExtractor={(
          item,
        ) =>
          item.id
        }
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.list
        }
        renderItem={({
          item,
        }) => {
          /* ==================================================
             COMPLETED BOOKINGS
          ================================================== */

          const completedCount =
            Number(
              item.completedCount ??
                0,
            );

          /* ==================================================
             ICON
          ================================================== */

          const iconName =
            (
              typeof item.icon ===
                "string" &&
              item.icon.trim()
                ? item.icon.trim()
                : DEFAULT_ICON
            ) as IconName;

          /* ==================================================
             COLOR
          ================================================== */

          const iconColor =
            typeof item.color ===
              "string" &&
            item.color.trim()
              ? item.color.trim()
              : DEFAULT_COLOR;

          /* ==================================================
             BACKGROUND
          ================================================== */

          const iconBackground =
            typeof item.backgroundColor ===
              "string" &&
            item.backgroundColor.trim()
              ? item.backgroundColor.trim()
              : DEFAULT_BACKGROUND;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.name}`}
              onPress={() =>
                handleServicePress(
                  item,
                )
              }
              style={({
                pressed,
              }) => [
                styles.card,

                pressed &&
                  styles.cardPressed,
              ]}
            >
              {/* ============================================
                  TOP
              ============================================ */}

              <View
                style={
                  styles.cardTop
                }
              >
                {/* --------------------------------------------
                    SERVICE ICON
                -------------------------------------------- */}

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
                    size={24}
                    color={
                      iconColor
                    }
                  />
                </View>

                {/* --------------------------------------------
                    ARROW
                -------------------------------------------- */}

                <View
                  style={
                    styles.arrow
                  }
                >
                  <MaterialCommunityIcons
                    name="arrow-top-right"
                    size={16}
                    color="#2563EB"
                  />
                </View>
              </View>

              {/* ============================================
                  SERVICE NAME
              ============================================ */}

              <AppText
                weight="bold"
                numberOfLines={2}
                ellipsizeMode="tail"
                style={
                  styles.name
                }
              >
                {item.name}
              </AppText>

              {/* ============================================
                  COMPLETED BOOKINGS
              ============================================ */}

              <AppText
                style={
                  styles.bookings
                }
              >
                {completedCount}{" "}
                {completedCount ===
                1
                  ? "booking"
                  : "bookings"}
              </AppText>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop: 22,
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 11,
    },

    headerText: {
      flex: 1,
    },

    title: {
      fontSize: 18,
      color:
        "#0F172A",
    },

    subtitle: {
      marginTop: 2,
      fontSize: 11,
      color:
        "#94A3B8",
    },

    fire: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor:
        "#FFF7ED",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    fireText: {
      fontSize: 17,
    },

    list: {
      paddingRight: 12,
    },

    card: {
      width: 205,
      minHeight: 145,
      marginRight: 10,
      padding: 14,
      borderRadius: 18,
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
        8,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 3,
    },

    cardPressed: {
      opacity: 0.88,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    cardTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    icon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    arrow: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    name: {
      marginTop: 14,
      fontSize: 15,
      lineHeight: 20,
      color:
        "#0F172A",
    },

    bookings: {
      marginTop: 5,
      fontSize: 11,
      color:
        "#64748B",
    },
  });