import React from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import usePopularServices from "@/hooks/services/usePopularServices";

/* ==============================================================
   TYPES
============================================================== */

type PopularService = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  backgroundColor?: string | null;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DEFAULT_ICON =
  "tools";

const DEFAULT_ICON_COLOR =
  "#EA580C";

const DEFAULT_BACKGROUND_COLOR =
  "#FFF7E8";

/* ==============================================================
   COMPONENT
============================================================== */

export default function PopularServices() {
  const {
    services,
    loading,
  } =
    usePopularServices();

  /* ============================================================
     LOADING / EMPTY
  ============================================================ */

  if (
    loading ||
    !services?.length
  ) {
    return null;
  }

  /* ============================================================
     OPEN SERVICE
  ============================================================ */

  const handleServicePress = (
    service: PopularService,
  ) => {
    const serviceId =
      service.id?.trim();

    const serviceName =
      service.name?.trim();

    if (
      !serviceId ||
      !serviceName
    ) {
      console.warn(
        "POPULAR_SERVICE_INVALID:",
        service,
      );

      return;
    }

    /* ----------------------------------------------------------
       RESOLVE CATEGORY-CARD VISUALS
    ---------------------------------------------------------- */

    const resolvedIcon =
      service.icon?.trim() ||
      DEFAULT_ICON;

    const resolvedColor =
      service.color?.trim() ||
      DEFAULT_ICON_COLOR;

    const resolvedBackgroundColor =
      service.backgroundColor?.trim() ||
      DEFAULT_BACKGROUND_COLOR;

    /* ----------------------------------------------------------
       NAVIGATE TO WORKERS
    ---------------------------------------------------------- */

    router.push({
      pathname:
        "/(customer)/details/workers/[id]",

      params: {
        /*
         * Existing dynamic route parameter.
         */
        id: serviceId,

        /*
         * Explicit service identity.
         */
        serviceId,

        serviceName,

        /*
         * IMPORTANT:
         * Same MaterialCommunityIcons name
         * used by CategoryCard.
         */
        serviceIcon:
          resolvedIcon,

        /*
         * Same icon color used
         * by CategoryCard.
         */
        serviceColor:
          resolvedColor,

        /*
         * Same icon background used
         * by CategoryCard.
         */
        serviceBackgroundColor:
          resolvedBackgroundColor,
      },
    });
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <AppText
          weight="bold"
          style={
            styles.title
          }
        >
          Popular Services
        </AppText>

        <Pressable
          onPress={() =>
            router.push(
              "/services",
            )
          }
          accessibilityRole="button"
          accessibilityLabel="See all popular services"
          hitSlop={8}
          style={({
            pressed,
          }) => [
            styles.seeAllButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <AppText
            weight="bold"
            style={
              styles.seeAll
            }
          >
            See All
          </AppText>
        </Pressable>
      </View>

      {/* ======================================================
          SERVICES
      ====================================================== */}

      <FlatList
        horizontal
        data={
          services as PopularService[]
        }
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
          /* ----------------------------------------------------
             SAFE VISUAL VALUES
          ---------------------------------------------------- */

          const icon =
            item.icon?.trim() ||
            DEFAULT_ICON;

          const iconColor =
            item.color?.trim() ||
            DEFAULT_ICON_COLOR;

          const backgroundColor =
            item.backgroundColor?.trim() ||
            DEFAULT_BACKGROUND_COLOR;

          return (
            <Pressable
              onPress={() =>
                handleServicePress(
                  item,
                )
              }
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.name}`}
              accessibilityHint="View workers for this service"
              style={({
                pressed,
              }) => [
                styles.cardWrapper,

                pressed &&
                  styles.pressed,
              ]}
            >
              <AppCard
                style={
                  styles.card
                }
              >
                {/* ==============================================
                    ICON
                ============================================== */}

                <View
                  style={[
                    styles.iconBox,

                    {
                      backgroundColor,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      icon as React.ComponentProps<
                        typeof MaterialCommunityIcons
                      >["name"]
                    }
                    size={27}
                    color={
                      iconColor
                    }
                  />
                </View>

                {/* ==============================================
                    SERVICE NAME
                ============================================== */}

                <AppText
                  weight="bold"
                  numberOfLines={
                    2
                  }
                  ellipsizeMode="tail"
                  style={
                    styles.name
                  }
                >
                  {
                    item.name
                  }
                </AppText>

                {/* ==============================================
                    ARROW
                ============================================== */}

                <View
                  style={
                    styles.arrow
                  }
                >
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={19}
                    color="#2563EB"
                  />
                </View>
              </AppCard>
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
    /* ==========================================================
       CONTAINER
    ========================================================== */

    container: {
      marginTop: 2,
      marginBottom: 20,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom: 11,
    },

    title: {
      fontSize: 17,

      lineHeight: 22,

      color:
        "#111827",
    },

    seeAllButton: {
      minHeight: 32,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal: 3,
    },

    seeAll: {
      fontSize: 12.5,

      color:
        "#2563EB",
    },

    /* ==========================================================
       LIST
    ========================================================== */

    list: {
      paddingRight: 8,
    },

    /* ==========================================================
       CARD WRAPPER
    ========================================================== */

    cardWrapper: {
      width: 154,

      marginRight: 10,
    },

    /* ==========================================================
       CARD
    ========================================================== */

    card: {
      width: 154,

      height: 138,

      paddingHorizontal: 13,

      paddingVertical: 13,

      borderRadius: 18,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#E5E7EB",

      alignItems:
        "flex-start",

      justifyContent:
        "flex-start",

      position:
        "relative",

      shadowColor:
        "#0F172A",

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        0.06,

      shadowRadius:
        6,

      elevation: 2,
    },

    /* ==========================================================
       ICON
    ========================================================== */

    iconBox: {
      width: 54,

      height: 54,

      borderRadius: 17,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom: 12,
    },

    /* ==========================================================
       NAME
    ========================================================== */

    name: {
      width: "82%",

      fontSize: 13.5,

      lineHeight: 18,

      color:
        "#111827",
    },

    /* ==========================================================
       ARROW
    ========================================================== */

    arrow: {
      position:
        "absolute",

      right: 11,

      bottom: 10,

      width: 25,

      height: 25,

      borderRadius: 8,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#EFF6FF",
    },

    /* ==========================================================
       PRESSED
    ========================================================== */

    pressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });