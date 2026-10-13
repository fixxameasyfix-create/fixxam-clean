import React, {
  memo,
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

import {
  AppText,
} from "@/components/ui";

import type {
  ServiceItem,
} from "@/hooks/services/useServices";

import {
  isServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type IconName =
  keyof typeof MaterialCommunityIcons.glyphMap;

type Props = {
  services:
    ServiceItem[];
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DEFAULT_ICON: IconName =
  "tools";

/* ==============================================================
   HELPERS
============================================================== */

function getSafeString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  const trimmed =
    value.trim();

  return (
    trimmed ||
    fallback
  );
}

function getSafeCount(
  value: unknown,
): number {
  const parsed =
    typeof value ===
    "number"
      ? value
      : Number(value);

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      parsed,
    ),
  );
}

function resolveServiceIcon(
  value: unknown,
): IconName {
  const icon =
    getSafeString(
      value,
    );

  if (
    icon &&
    icon in
      MaterialCommunityIcons.glyphMap
  ) {
    return icon as IconName;
  }

  return DEFAULT_ICON;
}

function resolveServiceColor(
  value: unknown,
): string {
  return getSafeString(
    value,
    CustomerColors.primary,
  );
}

function resolveServiceBackground(
  value: unknown,
): string {
  return getSafeString(
    value,
    CustomerColors.primarySoft,
  );
}

/* ==============================================================
   SERVICE CARD
============================================================== */

const ServiceCard =
  memo(
    function ServiceCard({
      service,
      onPress,
    }: {
      service:
        ServiceItem;

      onPress:
        (
          service:
            ServiceItem,
        ) => void;
    }) {
      const serviceName =
        getSafeString(
          service.name,
          "Service",
        );

      const iconName =
        resolveServiceIcon(
          service.icon,
        );

      const iconColor =
        resolveServiceColor(
          service.color,
        );

      const iconBackground =
        resolveServiceBackground(
          service.backgroundColor,
        );

      const bookingCount =
        getSafeCount(
          service.bookingCount,
        );

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${serviceName}`}
          accessibilityHint="Opens workers available for this service"
          onPress={() =>
            onPress(
              service,
            )
          }
          style={({
            pressed,
          }) => [
            styles.item,

            pressed
              ? styles.itemPressed
              : null,
          ]}
        >
          <View
            style={
              styles.card
            }
          >
            {/* ==================================================
                TOP
            ================================================== */}

            <View
              style={
                styles.cardTop
              }
            >
              {/* ================================================
                  SERVICE ICON
              ================================================ */}

              <View
                style={[
                  styles.iconBox,

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
                  size={
                    FixxamTokens
                      .size
                      .iconLg
                  }
                  color={
                    iconColor
                  }
                />
              </View>

              {/* ================================================
                  OPEN ICON
              ================================================ */}

              <View
                style={
                  styles.arrowBox
                }
              >
                <MaterialCommunityIcons
                  name="arrow-top-right"
                  size={
                    FixxamTokens
                      .size
                      .iconSm
                  }
                  color={
                    CustomerColors.primary
                  }
                />
              </View>
            </View>

            {/* ==================================================
                INFO
            ================================================== */}

            <View
              style={
                styles.info
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                numberOfLines={2}
                ellipsizeMode="tail"
                style={
                  styles.name
                }
              >
                {serviceName}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
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
  );

ServiceCard.displayName =
  "ServicesGridCard";

/* ==============================================================
   COMPONENT
============================================================== */

function ServicesGrid({
  services,
}: Props) {
  /* ============================================================
     OPEN SERVICE
  ============================================================ */

  const handleServicePress =
    useCallback(
      (
        service:
          ServiceItem,
      ) => {
        /* ======================================================
           SERVICE ID
        ====================================================== */

        const serviceId =
          getSafeString(
            service.id,
          );

        if (
          !serviceId
        ) {
          console.error(
            "FIXXAM_SERVICES_GRID_MISSING_SERVICE_ID",
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

        if (
          !serviceName
        ) {
          console.error(
            "FIXXAM_SERVICES_GRID_MISSING_SERVICE_NAME",
            {
              serviceId,
            },
          );

          return;
        }

        /* ======================================================
           SERVICE ICON
        ====================================================== */

        const serviceIcon =
          resolveServiceIcon(
            service.icon,
          );

        /* ======================================================
           SERVICE COLOR
        ====================================================== */

        const serviceColor =
          resolveServiceColor(
            service.color,
          );

        /* ======================================================
           SERVICE BACKGROUND
        ====================================================== */

        const serviceBackgroundColor =
          resolveServiceBackground(
            service.backgroundColor,
          );

        /* ======================================================
           CATEGORY
        ====================================================== */

        const categoryId =
          getSafeString(
            service.categoryId,
          );

        /* ======================================================
           FULFILLMENT MODE

           ServiceItem comes from the authoritative top-level
           services collection.

           Validate again before crossing the route boundary.
        ====================================================== */

        const fulfillmentMode =
          isServiceFulfillmentMode(
            service.fulfillmentMode,
          )
            ? service.fulfillmentMode
            : "needs_review";

        /* ======================================================
           DEVELOPMENT LOG
        ====================================================== */

        if (__DEV__) {
          console.log(
            "FIXXAM_OPEN_SERVICE_FROM_GRID:",
            {
              serviceId,
              serviceName,
              serviceIcon,
              serviceColor,
              serviceBackgroundColor,
              categoryId,
              fulfillmentMode,
            },
          );
        }

        /* ======================================================
           NAVIGATION
        ====================================================== */

        router.push({
          pathname:
            "/(customer)/details/workers/[id]",

          params: {
            /*
             * Dynamic route:
             * [id] = service ID
             */
            id:
              serviceId,

            /*
             * Explicit service ID.
             */
            serviceId,

            /*
             * Service name.
             */
            serviceName,

            /*
             * Backward compatibility.
             */
            service:
              serviceName,

            /*
             * Exact validated
             * MaterialCommunityIcons icon.
             */
            serviceIcon,

            /*
             * Exact service color.
             */
            serviceColor,

            /*
             * Exact service background.
             */
            serviceBackgroundColor,

            /*
             * Authoritative fulfillment mode.
             */
            fulfillmentMode,

            /*
             * Optional category ID.
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

  if (
    services.length ===
    0
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
          service,
          index,
        ) => {
          const serviceId =
            getSafeString(
              service.id,
            );

          return (
            <ServiceCard
              key={
                serviceId ||
                `service-${index}`
              }
              service={
                service
              }
              onPress={
                handleServicePress
              }
            />
          );
        },
      )}
    </View>
  );
}

export default memo(
  ServicesGrid,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       GRID
    ========================================================== */

    grid: {
      width: "100%",

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "space-between",

      rowGap:
        FixxamTokens.spacing.md,
    },

    /* ==========================================================
       ITEM
    ========================================================== */

    item: {
      width: "48.5%",
    },

    itemPressed: {
      opacity:
        FixxamTokens
          .motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens
              .motion
              .scalePressed,
        },
      ],
    },

    /* ==========================================================
       CARD
    ========================================================== */

    card: {
      width: "100%",

      minHeight: 172,

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

    /* ==========================================================
       TOP
    ========================================================== */

    cardTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ==========================================================
       SERVICE ICON
    ========================================================== */

    iconBox: {
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
    },

    /* ==========================================================
       ARROW
    ========================================================== */

    arrowBox: {
      width: 32,

      height: 32,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ==========================================================
       INFO
    ========================================================== */

    info: {
      flex: 1,

      marginTop:
        FixxamTokens.spacing.xl,

      justifyContent:
        "flex-end",
    },

    name: {
      lineHeight: 21,

      color:
        Colors.textPrimary,
    },

    bookings: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },
  });