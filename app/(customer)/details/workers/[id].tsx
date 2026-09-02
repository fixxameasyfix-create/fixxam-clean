import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";

import { AppText } from "@/components/ui";

import type {
  WorkerCardData,
} from "@/components/customer/worker/workercard";

import WorkersHeader from "@/components/customer/worker/WorkerHeader";

import WorkerFilterPopup from "@/components/customer/worker/WorkerFilterPopup";

import WorkerCardSkeleton from "@/components/customer/worker/WorkerCardSkeleton";

import WorkerSortBar from "@/components/customer/worker/WorkerSortBar";

import WorkerSortPopup from "@/components/customer/worker/WorkerSortPopup";

import WorkerCard from "@/components/customer/worker/workercard/WorkerCard";

import {
  getPublicWorkersByService,
} from "@/firebase/queries/workerPublicProfiles";

import {
  workerMapper,
} from "@/firebase/mappers/workerMapper";

import {
  calculateDistance,
} from "@/utils/location/calculateDistance";

import useCurrentLocation from "@/hooks/location/useCurrentLocation";

/* ==============================================================
   TYPES
============================================================== */

type SortOption =
  | "latest"
  | "rating"
  | "priceLow"
  | "priceHigh"
  | "nearest";

type WorkerFilters = {
  onlineOnly: boolean;
  verifiedOnly: boolean;
};

type WorkerReviewData =
  WorkerCardData & {
    reviewCount?: number;
    reviewsCount?: number;
    reviews?: number;
    jobs?: number;
    totalJobs?: number;
};

type WorkersRouteParams = {
  id?: string | string[];

  serviceId?: string | string[];

  serviceName?: string | string[];

  service?: string | string[];

  serviceIcon?: string | string[];

  serviceColor?: string | string[];

  serviceBackgroundColor?:
    | string
    | string[];

  reward?: string | string[];

  categoryId?: string | string[];
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DEFAULT_SERVICE_ICON =
  "tools";

const DEFAULT_SERVICE_COLOR =
  "#EA580C";

const DEFAULT_SERVICE_BACKGROUND =
  "#FFF7E8";

const DEFAULT_WORKER_NAME =
  "Selected Worker";

const DEFAULT_WORKER_CATEGORY =
  "Service Provider";

/* ==============================================================
   PARAM HELPER
============================================================== */

function getParamValue(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (Array.isArray(value)) {
    return (
      value[0]?.trim() ?? ""
    );
  }

  return value?.trim() ?? "";
}

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkersScreen() {
  const params =
    useLocalSearchParams<WorkersRouteParams>();

  const {
    id,
    serviceId,
    serviceName,
    service,
    serviceIcon,
    serviceColor,
    serviceBackgroundColor,
    reward,
    categoryId,
  } = params;

  /* ============================================================
     SERVICE ID
  ============================================================ */

  const selectedServiceId =
    useMemo(() => {
      return (
        getParamValue(
          serviceId,
        ) ||
        getParamValue(id)
      );
    }, [
      serviceId,
      id,
    ]);

  /* ============================================================
     SERVICE NAME
  ============================================================ */

  const selectedServiceName =
    useMemo(() => {
      return (
        getParamValue(
          serviceName,
        ) ||
        getParamValue(
          service,
        ) ||
        ""
      );
    }, [
      serviceName,
      service,
    ]);

  /* ============================================================
     SERVICE ICON
  ============================================================ */

  const selectedServiceIcon =
    useMemo(() => {
      return (
        getParamValue(
          serviceIcon,
        ) ||
        DEFAULT_SERVICE_ICON
      );
    }, [
      serviceIcon,
    ]);

  /* ============================================================
     SERVICE COLOR
  ============================================================ */

  const selectedServiceColor =
    useMemo(() => {
      return (
        getParamValue(
          serviceColor,
        ) ||
        DEFAULT_SERVICE_COLOR
      );
    }, [
      serviceColor,
    ]);

  /* ============================================================
     SERVICE BACKGROUND
  ============================================================ */

  const selectedServiceBackgroundColor =
    useMemo(() => {
      return (
        getParamValue(
          serviceBackgroundColor,
        ) ||
        DEFAULT_SERVICE_BACKGROUND
      );
    }, [
      serviceBackgroundColor,
    ]);

  /* ============================================================
     REWARD
  ============================================================ */

  const resolvedReward =
    useMemo(() => {
      return getParamValue(
        reward,
      );
    }, [
      reward,
    ]);

  /* ============================================================
     CATEGORY
  ============================================================ */

  const resolvedCategoryId =
    useMemo(() => {
      return getParamValue(
        categoryId,
      );
    }, [
      categoryId,
    ]);

  /* ============================================================
     STATE
  ============================================================ */

  const [
    workers,
    setWorkers,
  ] =
    useState<WorkerCardData[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    sort,
    setSort,
  ] =
    useState<SortOption>(
      "latest",
    );

  const [
    filters,
    setFilters,
  ] =
    useState<WorkerFilters>({
      onlineOnly: false,
      verifiedOnly: false,
    });

  const [
    sortVisible,
    setSortVisible,
  ] =
    useState(false);

  const [
    filterVisible,
    setFilterVisible,
  ] =
    useState(false);

  /* ============================================================
     CURRENT CUSTOMER LOCATION
     
     IMPORTANT:
     Wannan location ɗin ba mu canza shi.
     Ana amfani da shi kawai wajen distance calculation.
  ============================================================ */

  const {
    location,
  } =
    useCurrentLocation();

  /* ============================================================
     FREE SERVICE
  ============================================================ */

  const isFreeService =
    resolvedReward ===
      "90-day-free-service" ||
    resolvedReward ===
      "service-promotion-free-service";

  /* ============================================================
     SORT LABEL
  ============================================================ */

  const sortLabel =
    {
      latest: "Latest",
      rating: "Highest Rated",
      priceLow: "Lowest Price",
      priceHigh: "Highest Price",
      nearest: "Nearest",
    }[sort];

  /* ============================================================
     MAP WORKERS
     
     IMPORTANT:
     
     We DO NOT replace workerProfile with a new narrow object.
     
     Instead:
     
     1. workerMapper() creates the complete WorkerCardData.
     2. We preserve the original workerProfile.
     3. We only override:
        - photoUrl
        - hourlyRate
     4. We use fullName for firstName.
     
     Location fields remain untouched.
  ============================================================ */

  const mapWorkers =
    useCallback(
      (
        snapshot:
          QuerySnapshot<DocumentData>,
      ): WorkerCardData[] => {
        return snapshot.docs
          .map(
            (
              docSnapshot,
            ) => {
              /*
               * ==================================================
               * ORIGINAL WORKER
               * ==================================================
               */

              const worker =
                workerMapper(
                  docSnapshot,
                );

              /*
               * ==================================================
               * RAW FIRESTORE PROFILE DATA
               * ==================================================
               *
               * These fields are coming from:
               *
               * workerPublicProfiles/{workerId}
               *
               * Build Your Profile saves:
               *
               * fullName
               * photoURL
               * rate
               *
               * ==================================================
               */

              const data =
                docSnapshot.data();

              /*
               * ==================================================
               * FULL NAME
               * ==================================================
               */

              const fullName =
                typeof data.fullName ===
                "string"
                  ? data.fullName.trim()
                  : "";

              /*
               * ==================================================
               * PROFILE PHOTO
               * ==================================================
               */

              const photoURL =
                typeof data.photoURL ===
                "string"
                  ? data.photoURL.trim()
                  : "";

              /*
               * ==================================================
               * HOURLY RATE
               * ==================================================
               */

              const rawRate =
                Number(
                  data.rate,
                );

              const hourlyRate =
                Number.isFinite(
                  rawRate,
                ) &&
                rawRate > 0
                  ? rawRate
                  : undefined;

              /*
               * ==================================================
               * KEEP ORIGINAL WORKER PROFILE
               * ==================================================
               *
               * VERY IMPORTANT:
               *
               * Do not create:
               *
               * {
               *   latitude,
               *   longitude
               * }
               *
               * alone.
               *
               * That was causing the TypeScript error because
               * WorkerCardData expects the complete profile.
               *
               * We spread the ORIGINAL profile first.
               * ==================================================
               */

              const mergedWorker =
                {
                  ...worker,

                  /*
                   * =================================================
                   * FULL NAME FROM BUILD YOUR PROFILE
                   *
                   * WorkerCard currently reads:
                   *
                   * firstName + surname
                   *
                   * Therefore we place the complete profile name
                   * into firstName and leave surname empty.
                   * =================================================
                   */

                  ...(fullName
                    ? {
                        firstName:
                          fullName,
                        surname:
                          "",
                      }
                    : {}),

                  /*
                   * =================================================
                   * PROFILE
                   *
                   * Preserve every existing property.
                   * Only update photoUrl and hourlyRate.
                   * =================================================
                   */

                  workerProfile: {
                    ...worker.workerProfile,

                    ...(photoURL
                      ? {
                          photoUrl:
                            photoURL,
                        }
                      : {}),

                    ...(hourlyRate !==
                    undefined
                      ? {
                          hourlyRate:
                            hourlyRate,
                        }
                      : {}),
                  },
                };

              return mergedWorker;
            },
          )
          .map(
            (
              worker,
            ) => {
              /*
               * ==================================================
               * LOCATION
               *
               * KEEP EXACTLY AS BEFORE.
               *
               * This is the worker's stored location.
               * We do NOT replace it with customer's location.
               * ==================================================
               */

              const latitude =
                worker
                  .workerProfile
                  ?.latitude;

              const longitude =
                worker
                  .workerProfile
                  ?.longitude;

              /*
               * ==================================================
               * DISTANCE CALCULATION
               *
               * Customer current location:
               *
               * location.latitude
               * location.longitude
               *
               * Worker location:
               *
               * workerProfile.latitude
               * workerProfile.longitude
               * ==================================================
               */

              if (
                location &&
                Number.isFinite(
                  latitude,
                ) &&
                Number.isFinite(
                  longitude,
                )
              ) {
                const distance =
                  calculateDistance(
                    location.latitude,
                    location.longitude,
                    latitude as number,
                    longitude as number,
                  );

                return {
                  ...worker,
                  distance,
                };
              }

              /*
               * No location changes.
               */

              return worker;
            },
          );
      },
      [
        location,
      ],
    );

  /* ============================================================
     LOAD WORKERS
  ============================================================ */

  const loadWorkers =
    useCallback(
      async (
        isRefresh = false,
      ) => {
        if (
          !selectedServiceId
        ) {
          setWorkers([]);
          setLoading(false);
          return;
        }

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        try {
          /*
           * ======================================================
           * GET WORKERS BY SERVICE
           * ======================================================
           */

          const snapshot =
            await getPublicWorkersByService(
              selectedServiceId,
            );

          /*
           * ======================================================
           * MAP + PROFILE DATA
           * ======================================================
           */

          const mapped =
            mapWorkers(
              snapshot,
            );

          setWorkers(
            mapped,
          );
        } catch (
          error
        ) {
          console.error(
            "LOAD_PUBLIC_WORKERS_ERROR",
            error,
          );

          setWorkers([]);

          if (isRefresh) {
            Alert.alert(
              "Refresh failed",
              "We could not refresh the workers. Please try again.",
            );
          }
        } finally {
          if (isRefresh) {
            setRefreshing(
              false,
            );
          } else {
            setLoading(false);
          }
        }
      },
      [
        selectedServiceId,
        mapWorkers,
      ],
    );

  /* ============================================================
     LOAD WHEN SERVICE CHANGES
  ============================================================ */

  useEffect(() => {
    void loadWorkers();
  }, [
    loadWorkers,
  ]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const onRefresh =
    useCallback(() => {
      return loadWorkers(
        true,
      );
    }, [
      loadWorkers,
    ]);

  /* ============================================================
     BOOK WORKER
  ============================================================ */

  const handleWorkerRequest =
    useCallback(
      (
        worker: WorkerCardData,
      ) => {
        /* ======================================================
           SERVICE ID
        ====================================================== */

        if (
          !selectedServiceId
        ) {
          console.error(
            "BOOKING_MISSING_SERVICE_ID",
            {
              params,
            },
          );

          Alert.alert(
            "Service unavailable",
            "The selected service could not be identified.",
          );

          return;
        }

        /* ======================================================
           SERVICE NAME
        ====================================================== */

        if (
          !selectedServiceName
        ) {
          console.error(
            "BOOKING_MISSING_SERVICE_NAME",
            {
              params,
              selectedServiceId,
            },
          );

          Alert.alert(
            "Service unavailable",
            "The selected service name could not be identified.",
          );

          return;
        }

        /* ======================================================
           WORKER ID
        ====================================================== */

        if (!worker.id) {
          Alert.alert(
            "Worker unavailable",
            "This worker could not be identified.",
          );

          return;
        }

        /* ======================================================
           WORKER DATA
        ====================================================== */

        const workerData =
          worker as WorkerReviewData;

        /*
         * IMPORTANT:
         *
         * Use the ORIGINAL workerProfile type.
         *
         * Do NOT cast it to another smaller type.
         */

        const profile =
          worker.workerProfile;

        /* ======================================================
           WORKER NAME
        ====================================================== */

        const workerName =
          [
            worker.firstName,
            worker.surname,
          ]
            .filter(
              (
                value,
              ): value is string =>
                typeof value ===
                  "string" &&
                value.trim()
                  .length > 0,
            )
            .join(" ")
            .trim();

        /* ======================================================
           WORKER CATEGORY
        ====================================================== */

        const workerCategory =
          [
            worker.category,
            worker.subcategory,
          ]
            .filter(
              (
                value,
              ) =>
                typeof value ===
                  "string" &&
                value.trim()
                  .length > 0,
            )
            .join(" • ");

        /* ======================================================
           REVIEW COUNT
        ====================================================== */

        const reviewCount =
          Number(
            workerData.reviewCount ??
              workerData.reviewsCount ??
              workerData.reviews ??
              0,
          );

        /* ======================================================
           JOB COUNT
        ====================================================== */

        const jobs =
          Number(
            workerData.jobs ??
              workerData.totalJobs ??
              0,
          );

      /* ======================================================
   LOCATION

   IMPORTANT:
   Keep existing worker location unchanged.
====================================================== */

const locationName =
  typeof profile?.address === "string"
    ? profile.address.trim()
    : "";

        /* ======================================================
           HOURLY RATE
           
           This now comes from:
           
           Build Your Profile
                 ↓
           workerPublicProfiles
                 ↓
           rate
                 ↓
           workerProfile.hourlyRate
        ====================================================== */

        const rawHourlyRate =
          Number(
            profile?.hourlyRate ??
              0,
          );

        const hourlyRate =
          Number.isFinite(
            rawHourlyRate,
          )
            ? rawHourlyRate
            : 0;

        /* ======================================================
           DISTANCE
        ====================================================== */

        const distance =
          typeof worker.distance ===
            "number" &&
          Number.isFinite(
            worker.distance,
          )
            ? worker.distance
            : undefined;

        /* ======================================================
           BOOKING PARAMS
        ====================================================== */

        const bookingParams = {
          /* ====================================================
             WORKER
          ==================================================== */

          workerId:
            worker.id,

          workerName:
            workerName ||
            DEFAULT_WORKER_NAME,

          workerPhoto:
            profile?.photoUrl?.trim() ||
            "",

          workerCategory:
            workerCategory ||
            DEFAULT_WORKER_CATEGORY,

          workerRating:
            String(
              Number(
                worker.rating ??
                  0,
              ),
            ),

          workerReviews:
            String(
              Number.isFinite(
                reviewCount,
              )
                ? reviewCount
                : 0,
            ),

          workerOnline:
            String(
              Boolean(
                worker.online,
              ),
            ),

          /*
           * Keep worker location.
           */

          workerLocation:
            locationName,

          workerDistance:
            distance !==
            undefined
              ? String(
                  distance,
                )
              : "",

          workerJobs:
            String(
              Number.isFinite(
                jobs,
              )
                ? jobs
                : 0,
            ),

          workerHourlyRate:
            String(
              hourlyRate,
            ),

          workerVerified:
            String(
              Boolean(
                worker.verified,
              ),
            ),

          /* ====================================================
             SERVICE
          ==================================================== */

          serviceId:
            selectedServiceId,

          serviceName:
            selectedServiceName,

          serviceIcon:
            selectedServiceIcon,

          serviceColor:
            selectedServiceColor,

          serviceBackgroundColor:
            selectedServiceBackgroundColor,

          /* ====================================================
             CATEGORY
          ==================================================== */

          ...(resolvedCategoryId
            ? {
                categoryId:
                  resolvedCategoryId,
              }
            : {}),

          /* ====================================================
             REWARD
          ==================================================== */

          ...(resolvedReward
            ? {
                reward:
                  resolvedReward,
              }
            : {}),
        };

        console.log(
          "OPEN_BOOKING_PARAMS",
          bookingParams,
        );

        /* ======================================================
           NAVIGATE
        ====================================================== */

        router.push({
          pathname:
            "/(customer)/booking",
          params:
            bookingParams,
        });
      },
      [
        params,
        selectedServiceId,
        selectedServiceName,
        selectedServiceIcon,
        selectedServiceColor,
        selectedServiceBackgroundColor,
        resolvedCategoryId,
        resolvedReward,
      ],
    );

  /* ============================================================
     WORKER PROFILE
  ============================================================ */

  const handleWorkerProfile =
    useCallback(
      (
        worker: WorkerCardData,
      ) => {
        if (!worker.id) {
          Alert.alert(
            "Worker unavailable",
            "This worker could not be identified.",
          );

          return;
        }

        router.push({
          pathname:
            "/(customer)/details/worker-profile/[id]",
          params: {
            id: worker.id,
          },
        });
      },
      [],
    );

  /* ============================================================
     FILTER + SEARCH + SORT
  ============================================================ */

  const filteredWorkers =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return [...workers]
        .filter(
          (
            worker,
          ) => {
            const fullName =
              `${worker.firstName ?? ""} ${
                worker.surname ?? ""
              }`
                .trim()
                .toLowerCase();

            /*
             * Search worker name only.
             */

            if (
              searchValue &&
              !fullName.includes(
                searchValue,
              )
            ) {
              return false;
            }

            /*
             * Online filter unchanged.
             */

            if (
              filters.onlineOnly &&
              !worker.online
            ) {
              return false;
            }

            /*
             * Verified filter unchanged.
             */

            if (
              filters.verifiedOnly &&
              !worker.verified
            ) {
              return false;
            }

            return true;
          },
        )
        .sort(
          (
            a,
            b,
          ) => {
            switch (
              sort
            ) {
              case "rating":
                return (
                  Number(
                    b.rating ??
                      0,
                  ) -
                  Number(
                    a.rating ??
                      0,
                  )
                );

              case "priceLow":
                return (
                  Number(
                    a
                      .workerProfile
                      ?.hourlyRate ??
                      0,
                  ) -
                  Number(
                    b
                      .workerProfile
                      ?.hourlyRate ??
                      0,
                  )
                );

              case "priceHigh":
                return (
                  Number(
                    b
                      .workerProfile
                      ?.hourlyRate ??
                      0,
                  ) -
                  Number(
                    a
                      .workerProfile
                      ?.hourlyRate ??
                      0,
                  )
                );

              case "nearest":
                return (
                  Number(
                    a.distance ??
                      Number.MAX_SAFE_INTEGER,
                  ) -
                  Number(
                    b.distance ??
                      Number.MAX_SAFE_INTEGER,
                  )
                );

              case "latest":
              default:
                return 0;
            }
          },
        );
    }, [
      workers,
      search,
      filters,
      sort,
    ]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <FlatList
          data={[
            "1",
            "2",
            "3",
            "4",
            "5",
          ]}
          keyExtractor={(
            item,
          ) => item}
          contentContainerStyle={
            styles.loadingList
          }
          renderItem={() => (
            <WorkerCardSkeleton />
          )}
          showsVerticalScrollIndicator={
            false
          }
        />
      </SafeAreaView>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <FlatList
        data={
          filteredWorkers
        }
        keyExtractor={(
          item,
          index,
        ) =>
          item.id ||
          `worker-${index}`
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            colors={[
              "#2563EB",
            ]}
            tintColor="#2563EB"
          />
        }
        ListHeaderComponent={
          <>
            {/* ==================================================
                HEADER
            ================================================== */}

            <WorkersHeader
              value={
                search
              }
              onChangeText={
                setSearch
              }
              total={
                filteredWorkers.length
              }
              onOpenFilter={() =>
                setFilterVisible(
                  true,
                )
              }
            />

            {/* ==================================================
                SORT
            ================================================== */}

            <View
              style={
                styles.sortContainer
              }
            >
              <WorkerSortBar
                label={
                  sortLabel
                }
                onPress={() =>
                  setSortVisible(
                    true,
                  )
                }
              />
            </View>

            {/* ==================================================
                FREE SERVICE
            ================================================== */}

            {isFreeService && (
              <View
                style={
                  styles.rewardBanner
                }
              >
                <View
                  style={
                    styles.rewardIcon
                  }
                >
                  <Ionicons
                    name="gift-outline"
                    size={22}
                    color="#2563EB"
                  />
                </View>

                <View
                  style={
                    styles.rewardBannerContent
                  }
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.rewardBannerTitle
                    }
                  >
                    Free Service Reward
                  </AppText>

                  <AppText
                    style={
                      styles.rewardBannerText
                    }
                  >
                    Choose a worker
                    for your free
                    service.
                  </AppText>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
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
              <Ionicons
                name="people-outline"
                size={38}
                color="#CBD5E1"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.emptyTitle
              }
            >
              No Workers Found
            </AppText>

            <AppText
              center
              style={
                styles.emptyText
              }
            >
              No workers are
              available for{" "}
              {selectedServiceName ||
                "this service"}.
            </AppText>
          </View>
        }
        renderItem={({
          item,
        }) => (
          <WorkerCard
            worker={
              item
            }
            onProfilePress={() =>
              handleWorkerProfile(
                item,
              )
            }
            onBookPress={() =>
              handleWorkerRequest(
                item,
              )
            }
          />
        )}
      />

      {/* ========================================================
          FILTER POPUP
      ======================================================== */}

      <WorkerFilterPopup
        visible={
          filterVisible
        }
        filters={
          filters
        }
        onClose={() =>
          setFilterVisible(
            false,
          )
        }
        onApply={(
          value,
        ) => {
          setFilters(
            value,
          );

          setFilterVisible(
            false,
          );
        }}
      />

      {/* ========================================================
          SORT POPUP
      ======================================================== */}

      <WorkerSortPopup
        visible={
          sortVisible
        }
        value={
          sort
        }
        onClose={() =>
          setSortVisible(
            false,
          )
        }
        onChange={(
          value,
        ) => {
          setSort(
            value,
          );

          setSortVisible(
            false,
          );
        }}
      />
    </SafeAreaView>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    loadingList: {
      padding: 16,
    },

    listContent: {
      paddingBottom: 40,
    },

    sortContainer: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },

    rewardBanner: {
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor:
        "#EFF6FF",
      flexDirection: "row",
      alignItems: "center",
    },

    rewardIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    rewardBannerContent: {
      flex: 1,
      marginLeft: 10,
    },

    rewardBannerTitle: {
      fontSize: 14,
      color: "#1D4ED8",
    },

    rewardBannerText: {
      marginTop: 2,
      fontSize: 12,
      color: "#64748B",
      lineHeight: 18,
    },

    empty: {
      marginTop: 80,
      alignItems: "center",
      paddingHorizontal: 30,
    },

    emptyIcon: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor:
        "#F1F5F9",
      alignItems: "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop: 18,
      fontSize: 20,
      color: "#0F172A",
    },

    emptyText: {
      marginTop: 8,
      color: "#64748B",
      fontSize: 13,
      lineHeight: 21,
    },
  });