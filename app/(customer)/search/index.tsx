import React from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  SectionList,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

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
  AppText,
} from "@/components/ui";

import useSearch from "@/hooks/search/useSearch";

import type {
  ServiceCardData,
} from "@/firebase/mappers/serviceMapper";

/* ==============================================================
   TYPES
============================================================== */

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

/* ==============================================================
   SCREEN
============================================================== */

export default function SearchScreen() {
  /* ============================================================
     ROUTE PARAMS
  ============================================================ */

  const {
    serviceName: routeServiceName,
  } =
    useLocalSearchParams<{
      serviceName?: string;
    }>();

  /* ============================================================
     SEARCH
  ============================================================ */

  const {
    loading,
    query,
    setQuery,
    filter,
    setFilter,
    sections,
  } = useSearch();

  /* ============================================================
     OPEN SERVICE
  ============================================================ */

  const handleServicePress = (
    service: ServiceCardData,
  ) => {
    /* ----------------------------------------------------------
       SERVICE ID
    ---------------------------------------------------------- */

    const serviceId =
      String(
        service.id ?? "",
      ).trim();

    /* ----------------------------------------------------------
       SERVICE NAME
    ---------------------------------------------------------- */

    const serviceName =
      String(
        service.name ??
          routeServiceName ??
          "",
      ).trim();

    /* ----------------------------------------------------------
       VALIDATION
    ---------------------------------------------------------- */

    if (!serviceId) {
      return;
    }

    if (!serviceName) {
      return;
    }

    /* ----------------------------------------------------------
       SERVICE ICON
       
       Keep the EXACT icon from Firestore.
    ---------------------------------------------------------- */

    const serviceIcon =
      typeof service.icon ===
        "string"
        ? service.icon.trim()
        : "";

    /* ----------------------------------------------------------
       ICON COLOR
       
       Keep the same color used by CategoryCard.
    ---------------------------------------------------------- */

    const serviceIconColor =
      typeof service.color ===
        "string"
        ? service.color.trim()
        : "";

    /* ----------------------------------------------------------
       ICON BACKGROUND
       
       Keep the same background used by CategoryCard.
    ---------------------------------------------------------- */

    const serviceIconBackground =
      typeof service.backgroundColor ===
        "string"
        ? service.backgroundColor.trim()
        : "";

    /* ==========================================================
       OPEN WORKERS
    ========================================================== */

    router.push({
      pathname:
        "/(customer)/details/workers/[id]",

      params: {
        /* ------------------------------------------------------
           ROUTE ID
        ------------------------------------------------------ */

        id: serviceId,

        /* ------------------------------------------------------
           SERVICE ID
        ------------------------------------------------------ */

        serviceId,

        /* ------------------------------------------------------
           SERVICE NAME
           
           WorkersScreen expects this
           as `service`.
        ------------------------------------------------------ */

        service: serviceName,

        /* ------------------------------------------------------
           SERVICE ICON
        ------------------------------------------------------ */

        ...(serviceIcon
          ? {
              serviceIcon,
            }
          : {}),

        /* ------------------------------------------------------
           SERVICE ICON COLOR
        ------------------------------------------------------ */

        ...(serviceIconColor
          ? {
              serviceIconColor,
            }
          : {}),

        /* ------------------------------------------------------
           SERVICE ICON BACKGROUND
        ------------------------------------------------------ */

        ...(serviceIconBackground
          ? {
              serviceIconBackground,
            }
          : {}),
      },
    });
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* ======================================================
          SEARCH INPUT
      ====================================================== */}

      <SearchInput
        value={query}
        onChangeText={
          setQuery
        }
        onBack={() =>
          router.back()
        }
      />

      {/* ======================================================
          FILTER
      ====================================================== */}

      <SearchFilter
        value={filter}
        onChange={setFilter}
      />

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <View
          style={styles.center}
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <AppText
            style={
              styles.loadingText
            }
          >
            Loading services...
          </AppText>
        </View>
      ) : (
        <SectionList<
          WorkerCardData |
            ServiceCardData,
          SearchSection
        >
          sections={
            sections
          }

          keyExtractor={(item) =>
            item.id
          }

          stickySectionHeadersEnabled={
            false
          }

          showsVerticalScrollIndicator={
            false
          }

          keyboardShouldPersistTaps="handled"

          contentContainerStyle={
            styles.content
          }

          /* ==================================================
             SECTION HEADER
          ================================================== */

          renderSectionHeader={({
            section,
          }) => (
            <AppText
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              {section.title}
            </AppText>
          )}

          /* ==================================================
             ITEMS
          ================================================== */

          renderItem={({
            item,
            section,
          }) => {
            /* ==================================================
               WORKER
            ================================================== */

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

                  onProfilePress={() =>
                    router.push({
                      pathname:
                        "/(customer)/details/worker-profile/[id]",

                      params: {
                        id:
                          worker.id,
                      },
                    })
                  }

                  onBookPress={() =>
                    router.push({
                      pathname:
                        "/(customer)/booking",

                      params: {
                        workerId:
                          worker.id,

                        workerName:
                          `${worker.firstName} ${worker.surname}`,

                        workerPhoto:
                          worker
                            .workerProfile
                            .photoUrl,

                        serviceName:
                          worker
                            .services?.[0]
                            ?.name ??
                          "",

                        basePrice:
                          String(
                            worker
                              .workerProfile
                              .hourlyRate ??
                              0,
                          ),
                      },
                    })
                  }
                />
              );
            }

            /* ==================================================
               SERVICE
            ================================================== */

            const service =
              item as ServiceCardData;

            return (
              <CategoryCard
                /* ------------------------------------------------
                   EXACT SERVICE ICON
                ------------------------------------------------ */

                icon={
                  service.icon
                }

                /* ------------------------------------------------
                   EXACT ICON COLOR
                ------------------------------------------------ */

                iconColor={
                  service.color
                }

                /* ------------------------------------------------
                   EXACT ICON BACKGROUND
                ------------------------------------------------ */

                backgroundColor={
                  service.backgroundColor
                }

                title={
                  service.name
                }

                onPress={() =>
                  handleServicePress(
                    service,
                  )
                }
              />
            );
          }}

          /* ==================================================
             EMPTY
          ================================================== */

          ListEmptyComponent={
            <View
              style={
                styles.empty
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.emptyTitle
                }
              >
                No results found
              </AppText>

              <AppText
                style={
                  styles.emptyText
                }
              >
                Try another word or
                describe the service
                differently.
              </AppText>
            </View>
          }
        />
      )}
    </SafeAreaView>
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
      flex: 1,

      backgroundColor:
        "#F8FAFC",
    },

    /* ==========================================================
       CONTENT
    ========================================================== */

    content: {
      paddingHorizontal: 16,

      paddingBottom: 32,

      flexGrow: 1,
    },

    /* ==========================================================
       LOADING
    ========================================================== */

    center: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    loadingText: {
      marginTop: 10,

      color:
        "#64748B",

      fontSize: 13,
    },

    /* ==========================================================
       SECTION
    ========================================================== */

    sectionTitle: {
      fontSize: 18,

      color:
        "#0F172A",

      marginTop: 8,

      marginBottom: 10,
    },

    /* ==========================================================
       EMPTY
    ========================================================== */

    empty: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",

      paddingHorizontal: 30,

      paddingTop: 100,
    },

    emptyTitle: {
      fontSize: 17,

      color:
        "#0F172A",
    },

    emptyText: {
      marginTop: 6,

      textAlign:
        "center",

      color:
        "#64748B",

      fontSize: 13,

      lineHeight: 20,
    },
  });