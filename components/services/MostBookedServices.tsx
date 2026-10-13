import React, {
  memo,
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

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import type {
  PopularService,
} from "@/hooks/services/usePopularServices";

import {
  isServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

/* ==============================================================
   TYPES
============================================================== */

type IconName =
  keyof typeof MaterialCommunityIcons.glyphMap;

type Props = {
  services:
    PopularService[];
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DEFAULT_ICON: IconName =
  "tools";

const CARD_WIDTH =
  205;

/* ==============================================================
   HELPERS
============================================================== */

function safeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function safeCount(
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
    safeString(
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

function getServiceColor(
  value: unknown,
): string {
  return (
    safeString(
      value,
    ) ||
    CustomerColors.primary
  );
}

function getServiceBackground(
  value: unknown,
): string {
  return (
    safeString(
      value,
    ) ||
    CustomerColors.primarySoft
  );
}

/* ==============================================================
   SERVICE CARD
============================================================== */

const MostBookedServiceCard =
  memo(
    function MostBookedServiceCard({
      service,
      onPress,
    }: {
      service:
        PopularService;

      onPress:
        (
          service:
            PopularService,
        ) => void;
    }) {
      const serviceName =
        safeString(
          service.name,
        ) ||
        "Service";

      const completedCount =
        safeCount(
          service.completedCount,
        );

      const iconName =
        resolveServiceIcon(
          service.icon,
        );

      const iconColor =
        getServiceColor(
          service.color,
        );

      const iconBackground =
        getServiceBackground(
          service.backgroundColor,
        );

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${serviceName}`}
          accessibilityHint="View workers who provide this service"
          onPress={() =>
            onPress(
              service,
            )
          }
          style={({
            pressed,
          }) => [
            styles.card,

            pressed
              ? styles.cardPressed
              : null,
          ]}
        >
          <View
            style={
              styles.cardTop
            }
          >
            {/* ==================================================
                SERVICE ICON
            ================================================== */}

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
                  FixxamTokens.size.iconMd
                }
                color={
                  iconColor
                }
              />
            </View>

            {/* ==================================================
                OPEN
            ================================================== */}

            <View
              style={
                styles.arrowBox
              }
            >
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={
                  FixxamTokens.size.iconSm
                }
                color={
                  CustomerColors.primary
                }
              />
            </View>
          </View>

          {/* ====================================================
              NAME
          ==================================================== */}

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

          {/* ====================================================
              BOOKINGS
          ==================================================== */}

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
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
    },
  );

MostBookedServiceCard.displayName =
  "MostBookedServiceCard";

/* ==============================================================
   COMPONENT
============================================================== */

function MostBookedServices({
  services,
}: Props) {
  /* ============================================================
     OPEN SERVICE
  ============================================================ */

  const handleServicePress =
    useCallback(
      (
        service:
          PopularService,
      ) => {
        const serviceId =
          safeString(
            service.id,
          );

        if (!serviceId) {
          console.error(
            "FIXXAM_MOST_BOOKED_MISSING_SERVICE_ID",
          );

          return;
        }

        const serviceName =
          safeString(
            service.name,
          );

        if (!serviceName) {
          console.error(
            "FIXXAM_MOST_BOOKED_MISSING_SERVICE_NAME",
          );

          return;
        }

        const serviceIcon =
          resolveServiceIcon(
            service.icon,
          );

        const serviceColor =
          getServiceColor(
            service.color,
          );

        const serviceBackgroundColor =
          getServiceBackground(
            service.backgroundColor,
          );

        const categoryId =
          safeString(
            service.categoryId,
          );

        const fulfillmentMode =
          isServiceFulfillmentMode(
            service.fulfillmentMode,
          )
            ? service.fulfillmentMode
            : "needs_review";

        /* ======================================================
           NAVIGATION

           Preserve the authoritative service fulfillment mode
           all the way into the worker-selection flow.
        ====================================================== */

        router.push({
          pathname:
            "/(customer)/details/workers/[id]",

          params: {
            id:
              serviceId,

            serviceId,

            serviceName,

            /*
             * Backward compatibility.
             */
            service:
              serviceName,

            /*
             * Exact MaterialCommunityIcons service icon.
             */
            serviceIcon,

            serviceColor,

            serviceBackgroundColor,

            fulfillmentMode,

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
     RENDER ITEM
  ============================================================ */

  const renderItem =
    useCallback(
      ({
        item,
      }: {
        item:
          PopularService;
      }) => (
        <MostBookedServiceCard
          service={
            item
          }
          onPress={
            handleServicePress
          }
        />
      ),
      [
        handleServicePress,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item:
          PopularService,
        index: number,
      ) => {
        const id =
          safeString(
            item.id,
          );

        return (
          id ||
          `popular-service-${index}`
        );
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
        styles.container
      }
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

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
            variant="heading3"
            weight="bold"
            style={
              styles.title
            }
          >
            Most booked
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Services customers book most
          </AppText>
        </View>

        <View
          style={
            styles.popularIcon
          }
        >
          <MaterialCommunityIcons
            name="fire"
            size={
              FixxamTokens.size.iconMd
            }
            color={
              Colors.warning
            }
          />
        </View>
      </View>

      {/* ========================================================
          SERVICES
      ======================================================== */}

      <FlatList
        horizontal
        data={
          services
        }
        keyExtractor={
          keyExtractor
        }
        renderItem={
          renderItem
        }
        showsHorizontalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.list
        }
      />
    </View>
  );
}

export default memo(
  MostBookedServices,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.xl,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
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

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    popularIcon: {
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
        Colors.warningSoft,
    },

    /* ==========================================================
       LIST
    ========================================================== */

    list: {
      paddingRight:
        FixxamTokens.spacing.md,
    },

    /* ==========================================================
       CARD
    ========================================================== */

    card: {
      width:
        CARD_WIDTH,

      minHeight: 145,

      marginRight:
        FixxamTokens.spacing.sm,

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

    cardPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
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

    /* ==========================================================
       SERVICE ICON
    ========================================================== */

    iconBox: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    arrowBox: {
      width: 32,

      height: 32,

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
       CONTENT
    ========================================================== */

    name: {
      marginTop:
        FixxamTokens.spacing.md,

      lineHeight: 20,

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