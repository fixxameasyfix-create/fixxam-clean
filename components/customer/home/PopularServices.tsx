import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import ServiceIcon from "@/components/common/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import usePopularServices, {
  type PopularService,
} from "@/hooks/services/usePopularServices";

/* ==============================================================
   TYPES
============================================================== */

type ServiceCardProps = {
  service: PopularService;

  onPress: (
    service: PopularService,
  ) => void;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DEFAULT_ICON =
  "tools";

const SERVICE_CARD_WIDTH =
  154;

const SERVICE_CARD_HEIGHT =
  138;

/* ==============================================================
   HELPERS
============================================================== */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   SERVICE CARD
============================================================== */

const ServiceCard = memo(
  function ServiceCard({
    service,
    onPress,
  }: ServiceCardProps) {
    const serviceName =
      cleanText(
        service.name,
      ) || "Service";

    const serviceIcon =
      cleanText(
        service.icon,
      ) ||
      DEFAULT_ICON;

    const iconColor =
      cleanText(
        service.color,
      ) ||
      CustomerColors.primary;

    const iconBackground =
      cleanText(
        service.backgroundColor,
      ) ||
      CustomerColors.primarySoft;

    return (
      <Pressable
        onPress={() =>
          onPress(
            service,
          )
        }
        accessibilityRole="button"
        accessibilityLabel={`Open ${serviceName}`}
        accessibilityHint="View workers for this service"
        style={({
          pressed,
        }) => [
          styles.cardWrapper,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppCard
          role="customer"
          style={
            styles.card
          }
        >
          {/* ==================================================
              SERVICE ICON
          ================================================== */}

          <ServiceIcon
            icon={
              serviceIcon
            }
            color={
              iconColor
            }
            backgroundColor={
              iconBackground
            }
            size={
              FixxamTokens.size
                .iconLg
            }
            containerSize={
              FixxamTokens.size
                .iconBox
            }
            borderRadius={
              FixxamTokens.radius.md
            }
          />

          {/* ==================================================
              SERVICE NAME
          ================================================== */}

          <AppText
            variant="body"
            weight="bold"
            numberOfLines={
              2
            }
            ellipsizeMode="tail"
            style={
              styles.name
            }
          >
            {serviceName}
          </AppText>

          {/* ==================================================
              ARROW
          ================================================== */}

          <View
            style={
              styles.arrow
            }
          >
            <AppIcon
              name="next"
              role="customer"
              size="xs"
              color={
                CustomerColors.primary
              }
            />
          </View>
        </AppCard>
      </Pressable>
    );
  },
);

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
     SAFE SERVICES
  ============================================================ */

  const safeServices =
    useMemo(
      () =>
        services.filter(
          (
            service,
          ) =>
            Boolean(
              cleanText(
                service.id,
              ),
            ) &&
            Boolean(
              cleanText(
                service.name,
              ),
            ),
        ),
      [
        services,
      ],
    );

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
          cleanText(
            service.id,
          );

        const serviceName =
          cleanText(
            service.name,
          );

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

        const serviceIcon =
          cleanText(
            service.icon,
          ) ||
          DEFAULT_ICON;

        const serviceColor =
          cleanText(
            service.color,
          ) ||
          CustomerColors.primary;

        const serviceBackgroundColor =
          cleanText(
            service.backgroundColor,
          ) ||
          CustomerColors.primarySoft;

        const categoryId =
          cleanText(
            service.categoryId,
          );

        const fulfillmentMode =
          service.fulfillmentMode;

        /* ======================================================
           WORKER LIST
        ====================================================== */

        router.push({
          pathname:
            "/(customer)/details/workers/[id]",

          params: {
            id:
              serviceId,

            serviceId,

            serviceName,

            service:
              serviceName,

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
     SEE ALL
  ============================================================ */

  const handleSeeAll =
    useCallback(() => {
      router.push(
        "/services",
      );
    }, []);

  /* ============================================================
     RENDER SERVICE
  ============================================================ */

  const renderService =
    useCallback(
      ({
        item,
      }: {
        item: PopularService;
      }) => (
        <ServiceCard
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

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading
  ) {
    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={
            styles.header
          }
        >
          <AppText
            variant="heading3"
            weight="bold"
            style={
              styles.title
            }
          >
            Popular Services
          </AppText>
        </View>

        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.loadingText
            }
          >
            Loading services...
          </AppText>
        </View>
      </View>
    );
  }

  /* ============================================================
     EMPTY
  ============================================================ */

  if (
    safeServices.length ===
    0
  ) {
    return null;
  }

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
          variant="heading3"
          weight="bold"
          numberOfLines={
            1
          }
          style={
            styles.title
          }
        >
          Popular Services
        </AppText>

        <Pressable
          onPress={
            handleSeeAll
          }
          accessibilityRole="button"
          accessibilityLabel="See all popular services"
          hitSlop={
            8
          }
          style={({
            pressed,
          }) => [
            styles.seeAllButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.seeAll
            }
          >
            See All
          </AppText>

          <AppIcon
            name="next"
            role="customer"
            size="xs"
            color={
              CustomerColors.primary
            }
          />
        </Pressable>
      </View>

      {/* ======================================================
          SERVICES
      ====================================================== */}

      <FlatList
        horizontal
        data={
          safeServices
        }
        keyExtractor={(
          item,
        ) =>
          item.id
        }
        renderItem={
          renderService
        }
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.list
        }
        initialNumToRender={
          5
        }
        maxToRenderPerBatch={
          8
        }
        windowSize={
          3
        }
        keyboardShouldPersistTaps="handled"
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
      marginTop:
        FixxamTokens.spacing.xxs,

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    title: {
      flex: 1,

      minWidth: 0,

      marginRight:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    seeAllButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.sm,
    },

    seeAll: {
      color:
        CustomerColors.primary,
    },

    /* ==========================================================
       LIST
    ========================================================== */

    list: {
      paddingRight:
        FixxamTokens.spacing.sm,
    },

    /* ==========================================================
       CARD
    ========================================================== */

    cardWrapper: {
      width:
        SERVICE_CARD_WIDTH,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    card: {
      width:
        SERVICE_CARD_WIDTH,

      height:
        SERVICE_CARD_HEIGHT,

      padding:
        FixxamTokens.spacing.md,

      position:
        "relative",

      alignItems:
        "flex-start",

      justifyContent:
        "flex-start",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ==========================================================
       NAME
    ========================================================== */

    name: {
      width:
        "82%",

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight:
        18,

      color:
        Colors.textPrimary,
    },

    /* ==========================================================
       ARROW
    ========================================================== */

    arrow: {
      position:
        "absolute",

      right:
        FixxamTokens.spacing.sm,

      bottom:
        FixxamTokens.spacing.sm,

      width:
        28,

      height:
        28,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ==========================================================
       LOADING
    ========================================================== */

    loadingContainer: {
      minHeight:
        120,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ==========================================================
       PRESSED
    ========================================================== */

    pressed: {
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
  });