import React, {
  useCallback,
  useMemo,
} from "react";

import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

import SearchFilter from "@/components/search/SearchFilter";
import SearchInput from "@/components/search/SearchInput";

import {
  WorkerCard,
} from "@/components/customer/worker/workercard";

import type {
  WorkerCardData,
} from "@/components/customer/worker/workercard";

import CategoryCard from "@/components/categories/CategoryCard";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import useSearch from "@/hooks/search/useSearch";

import type {
  ServiceCardData,
} from "@/firebase/mappers/serviceMapper";

/* ============================================================
   TYPES
============================================================ */

type SearchItem =
  | WorkerCardData
  | ServiceCardData;

type SearchSection =
  | {
      title: string;

      type: "workers";

      data: WorkerCardData[];
    }
  | {
      title: string;

      type: "services";

      data: ServiceCardData[];
    };

type SearchParams = {
  serviceName?:
    | string
    | string[];
};

/* ============================================================
   HELPERS
============================================================ */

function getParamString(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

function getString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/* ============================================================
   SCREEN
============================================================ */

export default function SearchScreen() {
  /* ==========================================================
     ROUTE PARAMS
  ========================================================== */

  const params =
    useLocalSearchParams<SearchParams>();

  const routeServiceName =
    useMemo(
      () =>
        getParamString(
          params.serviceName,
        ),
      [
        params.serviceName,
      ],
    );

  /* ==========================================================
     SEARCH
  ========================================================== */

  const {
    loading,
    query,
    setQuery,
    filter,
    setFilter,
    sections,
  } =
    useSearch();

  /* ==========================================================
     OPEN SERVICE
  ========================================================== */

  const handleServicePress =
    useCallback(
      (
        service:
          ServiceCardData,
      ) => {
        const serviceId =
          getString(
            service.id,
          );

        const serviceName =
          getString(
            service.name,
          ) ||
          routeServiceName;

        if (!serviceId) {
          Toast.show({
            type: "error",

            text1:
              "Service unavailable",

            text2:
              "This service could not be opened.",
          });

          return;
        }

        if (!serviceName) {
          Toast.show({
            type: "error",

            text1:
              "Service unavailable",

            text2:
              "This service has no valid name.",
          });

          return;
        }

        /*
         * Preserve the exact Firebase
         * presentation used by CategoryCard.
         */
        const serviceIcon =
          getString(
            service.icon,
          );

        const serviceIconColor =
          getString(
            service.color,
          );

        const serviceIconBackground =
          getString(
            service.backgroundColor,
          );

        router.push({
          pathname:
            "/(customer)/details/workers/[id]",

          params: {
            id:
              serviceId,

            serviceId,

            /*
             * WorkersScreen expects
             * the service name as `service`.
             */
            service:
              serviceName,

            ...(serviceIcon
              ? {
                  serviceIcon,
                }
              : {}),

            ...(serviceIconColor
              ? {
                  serviceIconColor,
                }
              : {}),

            ...(serviceIconBackground
              ? {
                  serviceIconBackground,
                }
              : {}),
          },
        });
      },
      [
        routeServiceName,
      ],
    );

  /* ==========================================================
     WORKER PROFILE
  ========================================================== */

  const handleWorkerProfile =
    useCallback(
      (
        worker:
          WorkerCardData,
      ) => {
        const workerId =
          getString(
            worker.id,
          );

        if (!workerId) {
          Toast.show({
            type: "error",

            text1:
              "Worker unavailable",

            text2:
              "This worker profile could not be opened.",
          });

          return;
        }

        router.push({
          pathname:
            "/(customer)/details/worker-profile/[id]",

          params: {
            id:
              workerId,
          },
        });
      },
      [],
    );

  /* ==========================================================
     BOOK WORKER
  ========================================================== */

  const handleBookWorker =
    useCallback(
      (
        worker:
          WorkerCardData,
      ) => {
        const workerId =
          getString(
            worker.id,
          );

        if (!workerId) {
          Toast.show({
            type: "error",

            text1:
              "Worker unavailable",

            text2:
              "This worker cannot be booked right now.",
          });

          return;
        }

        const firstName =
          getString(
            worker.firstName,
          );

        const surname =
          getString(
            worker.surname,
          );

        const workerName =
          [
            firstName,
            surname,
          ]
            .filter(Boolean)
            .join(" ");

        const workerPhoto =
          getString(
            worker
              .workerProfile
              ?.photoUrl,
          );

        const serviceName =
          getString(
            worker
              .services?.[0]
              ?.name,
          );

        const hourlyRate =
          Number(
            worker
              .workerProfile
              ?.hourlyRate,
          );

        const basePrice =
          Number.isFinite(
            hourlyRate,
          ) &&
          hourlyRate >= 0
            ? hourlyRate
            : 0;

        /*
         * Preserve existing booking route
         * and parameter names.
         */
        router.push({
          pathname:
            "/(customer)/booking",

          params: {
            workerId,

            workerName,

            workerPhoto,

            serviceName,

            basePrice:
              String(
                basePrice,
              ),
          },
        });
      },
      [],
    );

  /* ==========================================================
     SECTION HEADER
  ========================================================== */

  const renderSectionHeader =
    useCallback(
      ({
        section,
      }: {
        section:
          SearchSection;
      }) => (
        <AppText
          variant="bodyLarge"
          weight="bold"
          style={
            styles.sectionTitle
          }
        >
          {section.title}
        </AppText>
      ),
      [],
    );

  /* ==========================================================
     ITEM
  ========================================================== */

  const renderItem =
    useCallback(
      ({
        item,
        section,
      }: {
        item:
          SearchItem;

        section:
          SearchSection;
      }) => {
        /* ====================================================
           WORKER
        ==================================================== */

        if (
          section.type ===
          "workers"
        ) {
          const worker =
            item as WorkerCardData;

          return (
            <WorkerCard
              worker={
                worker
              }
              onProfilePress={() => {
                handleWorkerProfile(
                  worker,
                );
              }}
              onBookPress={() => {
                handleBookWorker(
                  worker,
                );
              }}
            />
          );
        }

        /* ====================================================
           SERVICE
        ==================================================== */

        const service =
          item as ServiceCardData;

        return (
          <CategoryCard
            /*
             * Keep exact Firebase icon.
             */
            icon={
              service.icon
            }
            /*
             * Keep exact Firebase icon color.
             */
            iconColor={
              service.color
            }
            /*
             * Keep exact Firebase background.
             */
            backgroundColor={
              service.backgroundColor
            }
            title={
              service.name
            }
            onPress={() => {
              handleServicePress(
                service,
              );
            }}
          />
        );
      },
      [
        handleBookWorker,
        handleServicePress,
        handleWorkerProfile,
      ],
    );

  /* ==========================================================
     KEY
  ========================================================== */

  const keyExtractor =
    useCallback(
      (
        item:
          SearchItem,
        index:
          number,
      ) => {
        const id =
          getString(
            item.id,
          );

        return (
          id ||
          `search-item-${index}`
        );
      },
      [],
    );

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      contentContainerStyle={
        styles.screen
      }
    >
      {/* ======================================================
          SEARCH
      ====================================================== */}

      <SearchInput
        value={
          query
        }
        onChangeText={
          setQuery
        }
        onBack={() => {
          router.back();
        }}
      />

      {/* ======================================================
          FILTER
      ====================================================== */}

      <SearchFilter
        value={
          filter
        }
        onChange={
          setFilter
        }
      />

      {/* ======================================================
          RESULTS
      ====================================================== */}

      {loading ? (
        <View
          style={
            styles.center
          }
        >
          <ActivityIndicator
            size="large"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.loadingText
            }
          >
            Loading services...
          </AppText>
        </View>
      ) : (
        <SectionList<
          SearchItem,
          SearchSection
        >
          sections={
            sections
          }
          keyExtractor={
            keyExtractor
          }
          renderItem={
            renderItem
          }
          renderSectionHeader={
            renderSectionHeader
          }
          stickySectionHeadersEnabled={
            false
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={
            styles.content
          }
          initialNumToRender={
            10
          }
          maxToRenderPerBatch={
            10
          }
          windowSize={
            9
          }
          removeClippedSubviews
          ListEmptyComponent={
            <SearchEmptyState />
          }
        />
      )}
    </AppScreen>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function SearchEmptyState() {
  return (
    <View
      style={
        styles.empty
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <AppIcon
          name="search"
          role="customer"
          size="lg"
          color={
            CustomerColors.primary
          }
        />
      </View>

      <AppText
        variant="heading3"
        weight="bold"
        center
        style={
          styles.emptyTitle
        }
      >
        No results found
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.emptyText
        }
      >
        Try another word or describe the service differently.
      </AppText>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      paddingHorizontal: 0,

      paddingTop: 0,

      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    center: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      flex: 1,

      minHeight: 360,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 310,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });