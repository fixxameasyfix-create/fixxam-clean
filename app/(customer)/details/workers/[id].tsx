import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import type {
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  WorkerCardData,
} from "@/components/customer/worker/types";

import WorkersHeader from "@/components/customer/worker/WorkerHeader";

import WorkerFilterPopup from "@/components/customer/worker/WorkerFilterPopup";

import WorkerCardSkeleton from "@/components/customer/worker/WorkerCardSkeleton";

import WorkerSortBar from "@/components/customer/worker/WorkerSortBar";

import WorkerSortPopup from "@/components/customer/worker/WorkerSortPopup";

import WorkerCard from "@/components/customer/worker/workercard/WorkerCard";

import {
  subscribeToPublicWorkersByService,
} from "@/firebase/queries/workerPublicProfiles";

import {
  workerMapper,
} from "@/firebase/mappers/workerMapper";

import {
  calculateDistance,
} from "@/utils/location/calculateDistance";

import useCurrentLocation from "@/hooks/location/useCurrentLocation";

import {
  isServiceFulfillmentMode,
  type ServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

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

  fulfillmentMode?:
    | string
    | string[];
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DEFAULT_SERVICE_ICON =
  "tools";

const DEFAULT_SERVICE_COLOR =
  CustomerColors.primary;

const DEFAULT_SERVICE_BACKGROUND =
  CustomerColors.primarySoft;

const DEFAULT_WORKER_NAME =
  "Selected Worker";

const DEFAULT_WORKER_CATEGORY =
  "Service Provider";

const LOADING_ITEMS = [
  "1",
  "2",
  "3",
  "4",
  "5",
];

const SORT_LABELS: Record<
  SortOption,
  string
> = {
  latest: "Latest",

  rating: "Highest Rated",

  priceLow: "Lowest Price",

  priceHigh: "Highest Price",

  nearest: "Nearest",
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function getParamValue(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(value)
  ) {
    return cleanString(
      value[0],
    );
  }

  return cleanString(
    value,
  );
}

function getWorkerProfileObject(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
}

/* ==============================================================
   COORDINATE VALIDATION
============================================================== */

function isValidLatitude(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    ) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    ) &&
    value >= -180 &&
    value <= 180
  );
}

function getWorkerName(
  worker: WorkerCardData,
): string {
  const fullName =
    cleanString(
      worker.fullName,
    );

  if (fullName) {
    return fullName;
  }

  const combined = [
    cleanString(
      worker.firstName,
    ),
    cleanString(
      worker.surname,
    ),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    combined ||
    DEFAULT_WORKER_NAME
  );
}

function getWorkerCategory(
  worker: WorkerCardData,
): string {
  const value = [
    cleanString(
      worker.category,
    ),
    cleanString(
      worker.subcategory,
    ),
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    value ||
    DEFAULT_WORKER_CATEGORY
  );
}

function getWorkerLocationName(
  worker: WorkerCardData,
): string {
  const address =
    cleanString(
      worker.workerProfile
        .address,
    );

  if (address) {
    return address;
  }

  return [
    cleanString(
      worker.workerProfile.lga,
    ),
    cleanString(
      worker.workerProfile.state,
    ),
  ]
    .filter(Boolean)
    .join(", ");
}

function getRemotePhotoUrl(
  value: unknown,
): string {
  const url =
    cleanString(value);

  if (
    url.startsWith(
      "https://",
    ) ||
    url.startsWith(
      "http://",
    )
  ) {
    return url;
  }

  return "";
}

function getSafeRate(
  worker: WorkerCardData,
): number | null {
  const rate =
    Number(
      worker.workerProfile
        .hourlyRate,
    );

  if (
    !Number.isFinite(rate) ||
    rate <= 0
  ) {
    return null;
  }

  return rate;
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
    fulfillmentMode,
  } = params;

  /* ============================================================
     ROUTE CONTEXT
  ============================================================ */

  const selectedServiceId =
    useMemo(
      () =>
        getParamValue(
          serviceId,
        ) ||
        getParamValue(id),
      [
        id,
        serviceId,
      ],
    );

  const selectedServiceName =
    useMemo(
      () =>
        getParamValue(
          serviceName,
        ) ||
        getParamValue(
          service,
        ),
      [
        service,
        serviceName,
      ],
    );

  const selectedServiceIcon =
    useMemo(
      () =>
        getParamValue(
          serviceIcon,
        ) ||
        DEFAULT_SERVICE_ICON,
      [
        serviceIcon,
      ],
    );

  const selectedServiceColor =
    useMemo(
      () =>
        getParamValue(
          serviceColor,
        ) ||
        DEFAULT_SERVICE_COLOR,
      [
        serviceColor,
      ],
    );

  const selectedServiceBackgroundColor =
    useMemo(
      () =>
        getParamValue(
          serviceBackgroundColor,
        ) ||
        DEFAULT_SERVICE_BACKGROUND,
      [
        serviceBackgroundColor,
      ],
    );

  const resolvedReward =
    useMemo(
      () =>
        getParamValue(
          reward,
        ),
      [
        reward,
      ],
    );

  const resolvedCategoryId =
    useMemo(
      () =>
        getParamValue(
          categoryId,
        ),
      [
        categoryId,
      ],
    );

  const resolvedFulfillmentMode =
    useMemo<
      ServiceFulfillmentMode
    >(() => {
      const value =
        getParamValue(
          fulfillmentMode,
        );

      return isServiceFulfillmentMode(
        value,
      )
        ? value
        : "needs_review";
    }, [
      fulfillmentMode,
    ]);

  /* ============================================================
     STATE
  ============================================================ */

  const [
    workers,
    setWorkers,
  ] =
    useState<
      WorkerCardData[]
    >([]);

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
    loadError,
    setLoadError,
  ] =
    useState<string | null>(
      null,
    );

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

  const sortLabel =
    SORT_LABELS[sort];

  /* ============================================================
     MAP FIRESTORE WORKERS
  ============================================================ */

  const mapWorkers =
    useCallback(
      (
        snapshot:
          QuerySnapshot<DocumentData>,
      ): WorkerCardData[] => {
        return snapshot.docs.map(
          (
            docSnapshot,
          ) => {
            const worker =
              workerMapper(
                docSnapshot,
              );

            const data =
              docSnapshot.data();

            const rawWorkerProfile =
              getWorkerProfileObject(
                data.workerProfile,
              );

            const resolvedFullName =
              cleanString(
                data.fullName,
              ) ||
              cleanString(
                data.name,
              ) ||
              cleanString(
                rawWorkerProfile.fullName,
              ) ||
              cleanString(
                worker.fullName,
              );

            const photoUrl =
              cleanString(
                rawWorkerProfile.photoUrl,
              ) ||
              cleanString(
                rawWorkerProfile.photoURL,
              ) ||
              cleanString(
                data.photoURL,
              ) ||
              cleanString(
                data.photoUrl,
              ) ||
              cleanString(
                worker.workerProfile
                  .photoUrl,
              );

            const rawRate =
              Number(
                rawWorkerProfile.hourlyRate ??
                  rawWorkerProfile.rate ??
                  data.rate ??
                  data.hourlyRate ??
                  worker
                    .workerProfile
                    .hourlyRate,
              );

            const hourlyRate =
              Number.isFinite(
                rawRate,
              ) &&
              rawRate > 0
                ? rawRate
                : worker
                    .workerProfile
                    .hourlyRate;

            /*
             * Realtime public status.
             *
             * This comes directly from:
             *
             * workerPublicProfiles/{workerId}.online
             */
            const online =
              data.online === true;

            const mergedWorker: WorkerCardData =
              {
                ...worker,

                fullName:
                  resolvedFullName ||
                  worker.fullName,

                online,

                workerProfile: {
                  ...worker.workerProfile,

                  photoUrl,

                  hourlyRate,
                },
              };

            if (__DEV__) {
              console.log(
                "WORKER_PROFILE_RESOLVED",
                {
                  workerId:
                    mergedWorker.id,

                  workerName:
                    mergedWorker.fullName,

                  online:
                    mergedWorker.online,

                  photoURL:
                    mergedWorker
                      .workerProfile
                      .photoUrl,

                  hasPhoto:
                    Boolean(
                      mergedWorker
                        .workerProfile
                        .photoUrl,
                    ),
                },
              );
            }

            return mergedWorker;
          },
        );
      },
      [],
    );

  /* ============================================================
     REALTIME WORKERS
  ============================================================ */

  useEffect(() => {
    if (
      !selectedServiceId
    ) {
      setWorkers([]);

      setLoadError(
        "The selected service could not be identified.",
      );

      setLoading(false);
      setRefreshing(false);

      return;
    }

    setLoading(true);
    setLoadError(null);

    let isActive =
      true;

    let unsubscribe:
      (() => void) |
      undefined;

    try {
      unsubscribe =
        subscribeToPublicWorkersByService(
          selectedServiceId,

          snapshot => {
            if (!isActive) {
              return;
            }

            const mapped =
              mapWorkers(
                snapshot,
              );

            setWorkers(
              mapped,
            );

            setLoadError(
              null,
            );

            setLoading(
              false,
            );

            setRefreshing(
              false,
            );
          },

          error => {
            if (!isActive) {
              return;
            }

            console.error(
              "LOAD_PUBLIC_WORKERS_ERROR",
              error,
            );

            setLoadError(
              "We could not load workers right now. Please try again.",
            );

            setLoading(
              false,
            );

            setRefreshing(
              false,
            );

            Toast.show({
              type: "error",

              text1:
                "Unable to load workers",

              text2:
                "Please check your connection and try again.",
            });
          },
        );
    } catch (error) {
      console.error(
        "SUBSCRIBE_PUBLIC_WORKERS_SETUP_ERROR",
        error,
      );

      setWorkers([]);

      setLoadError(
        "We could not load workers right now. Please try again.",
      );

      setLoading(false);
      setRefreshing(false);

      Toast.show({
        type: "error",

        text1:
          "Unable to load workers",

        text2:
          "Please try again.",
      });
    }

    return () => {
      isActive =
        false;

      unsubscribe?.();
    };
  }, [
    mapWorkers,
    selectedServiceId,
  ]);

  /* ============================================================
     DISTANCE
  ============================================================ */

  const workersWithDistance =
    useMemo(() => {
      if (
        !location ||
        !isValidLatitude(
          location.latitude,
        ) ||
        !isValidLongitude(
          location.longitude,
        )
      ) {
        return workers;
      }

      const customerLatitude =
        location.latitude;

      const customerLongitude =
        location.longitude;

      return workers.map(
        (worker) => {
          const latitude =
            worker.workerProfile
              .latitude;

          const longitude =
            worker.workerProfile
              .longitude;

          if (
            !isValidLatitude(
              latitude,
            ) ||
            !isValidLongitude(
              longitude,
            )
          ) {
            return {
              ...worker,

              distance:
                undefined,
            };
          }

          return {
            ...worker,

            distance:
              calculateDistance(
                customerLatitude,
                customerLongitude,
                latitude,
                longitude,
              ),
          };
        },
      );
    }, [
      location,
      workers,
    ]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const onRefresh =
    useCallback(() => {
      /*
       * Firestore onSnapshot is already
       * keeping the workers synchronized.
       *
       * We keep RefreshControl for the
       * existing UI without creating a
       * second Firestore listener.
       */
      setRefreshing(
        true,
      );

      requestAnimationFrame(
        () => {
          setRefreshing(
            false,
          );
        },
      );
    }, []);

  /* ============================================================
     BOOK WORKER
  ============================================================ */

  const handleWorkerRequest =
    useCallback(
      (
        worker: WorkerCardData,
      ) => {
        if (
          !selectedServiceId
        ) {
          console.error(
            "BOOKING_MISSING_SERVICE_ID",
            {
              params,
            },
          );

          Toast.show({
            type: "error",

            text1:
              "Service unavailable",

            text2:
              "The selected service could not be identified.",
          });

          return;
        }

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

          Toast.show({
            type: "error",

            text1:
              "Service unavailable",

            text2:
              "The selected service name could not be identified.",
          });

          return;
        }

        const workerId =
          cleanString(
            worker.id,
          );

        if (
          !workerId
        ) {
          Toast.show({
            type: "error",

            text1:
              "Worker unavailable",

            text2:
              "This worker could not be identified.",
          });

          return;
        }

        const workerName =
          getWorkerName(
            worker,
          );

        const workerCategory =
          getWorkerCategory(
            worker,
          );

        const reviewCount =
          Number(
            worker.totalReviews,
          );

        const jobs =
          Number(
            worker.completedJobs ??
              0,
          );

        const workerLocation =
          getWorkerLocationName(
            worker,
          );

        const rawHourlyRate =
          Number(
            worker.workerProfile
              .hourlyRate,
          );

        const hourlyRate =
          Number.isFinite(
            rawHourlyRate,
          ) &&
          rawHourlyRate >= 0
            ? rawHourlyRate
            : 0;

        const workerPhoto =
          getRemotePhotoUrl(
            worker.workerProfile
              .photoUrl,
          );

        /* ======================================================
           BOOKING PARAMS
        ====================================================== */

        const bookingParams = {
          workerId,

          workerName,

          workerPhoto,

          workerCategory,

          workerRating:
            String(
              Number.isFinite(
                Number(
                  worker.rating,
                ),
              )
                ? Number(
                    worker.rating,
                  )
                : 0,
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

          workerLocation,

          workerDistance:
            typeof worker.distance ===
                "number" &&
              Number.isFinite(
                worker.distance,
              )
              ? String(
                  worker.distance,
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

          fulfillmentMode:
            resolvedFulfillmentMode,

          ...(resolvedCategoryId
            ? {
                categoryId:
                  resolvedCategoryId,
              }
            : {}),

          ...(resolvedReward
            ? {
                reward:
                  resolvedReward,
              }
            : {}),
        };

        if (__DEV__) {
          console.log(
            "OPEN_BOOKING_PARAMS",
            {
              workerId:
                bookingParams.workerId,

              workerName:
                bookingParams.workerName,

              workerPhoto:
                bookingParams.workerPhoto,

              photoIsHttps:
                bookingParams.workerPhoto.startsWith(
                  "https://",
                ),

              serviceId:
                bookingParams.serviceId,

              fulfillmentMode:
                bookingParams.fulfillmentMode,
            },
          );
        }

        /* ======================================================
           ROUTE
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
        resolvedCategoryId,
        resolvedFulfillmentMode,
        resolvedReward,
        selectedServiceBackgroundColor,
        selectedServiceColor,
        selectedServiceIcon,
        selectedServiceId,
        selectedServiceName,
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
        const workerId =
          cleanString(
            worker.id,
          );

        if (
          !workerId
        ) {
          Toast.show({
            type: "error",

            text1:
              "Worker unavailable",

            text2:
              "This worker could not be identified.",
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

  /* ============================================================
     FILTER + SEARCH + SORT
  ============================================================ */

  const filteredWorkers =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return [
        ...workersWithDistance,
      ]
        .filter(
          (worker) => {
            if (
              searchValue
            ) {
              const searchable =
                [
                  getWorkerName(
                    worker,
                  ),

                  cleanString(
                    worker.category,
                  ),

                  cleanString(
                    worker.subcategory,
                  ),

                  ...worker.services.map(
                    (serviceItem) =>
                      cleanString(
                        serviceItem.name,
                      ),
                  ),
                ]
                  .filter(
                    Boolean,
                  )
                  .join(" ")
                  .toLowerCase();

              if (
                !searchable.includes(
                  searchValue,
                )
              ) {
                return false;
              }
            }

            if (
              filters.onlineOnly &&
              !worker.online
            ) {
              return false;
            }

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
          (a, b) => {
            switch (sort) {
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

              case "priceLow": {
                const aRate =
                  getSafeRate(
                    a,
                  );

                const bRate =
                  getSafeRate(
                    b,
                  );

                if (
                  aRate === null
                ) {
                  return 1;
                }

                if (
                  bRate === null
                ) {
                  return -1;
                }

                return (
                  aRate -
                  bRate
                );
              }

              case "priceHigh": {
                const aRate =
                  getSafeRate(
                    a,
                  );

                const bRate =
                  getSafeRate(
                    b,
                  );

                if (
                  aRate === null
                ) {
                  return 1;
                }

                if (
                  bRate === null
                ) {
                  return -1;
                }

                return (
                  bRate -
                  aRate
                );
              }

              case "nearest": {
                const aDistance =
                  typeof a.distance ===
                      "number" &&
                    Number.isFinite(
                      a.distance,
                    )
                    ? a.distance
                    : Number.POSITIVE_INFINITY;

                const bDistance =
                  typeof b.distance ===
                      "number" &&
                    Number.isFinite(
                      b.distance,
                    )
                    ? b.distance
                    : Number.POSITIVE_INFINITY;

                return (
                  aDistance -
                  bDistance
                );
              }

              case "latest":
              default:
                return 0;
            }
          },
        );
    }, [
      filters,
      search,
      sort,
      workersWithDistance,
    ]);

  /* ============================================================
     EMPTY COPY
  ============================================================ */

  const emptyMessage =
    useMemo(() => {
      if (
        loadError
      ) {
        return loadError;
      }

      if (
        workersWithDistance.length >
          0 &&
        filteredWorkers.length ===
          0
      ) {
        return "No workers match your current search or filters.";
      }

      return `No workers are available for ${
        selectedServiceName ||
        "this service"
      }.`;
    }, [
      filteredWorkers.length,
      loadError,
      selectedServiceName,
      workersWithDistance.length,
    ]);

  /* ============================================================
     RENDER WORKER
  ============================================================ */

  const renderWorker =
    useCallback(
      ({
        item,
      }: {
        item: WorkerCardData;
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
      ),
      [
        handleWorkerProfile,
        handleWorkerRequest,
      ],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading
  ) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
        edges={[
          "top",
        ]}
      >
        <FlatList
          data={
            LOADING_ITEMS
          }
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
      edges={[
        "top",
      ]}
    >
      <FlatList
        data={
          filteredWorkers
        }
        keyExtractor={(
          item,
        ) => item.id}
        renderItem={
          renderWorker
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
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
              CustomerColors.primary,
            ]}
            tintColor={
              CustomerColors.primary
            }
          />
        }
        ListHeaderComponent={
          <>
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

            {isFreeService ? (
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
                  <AppIcon
                    name="star"
                    role="customer"
                    size="md"
                    state="active"
                  />
                </View>

                <View
                  style={
                    styles.rewardBannerContent
                  }
                >
                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    style={
                      styles.rewardBannerTitle
                    }
                  >
                    Free Service Reward
                  </AppText>

                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={
                      styles.rewardBannerText
                    }
                  >
                    Choose a worker for your
                    free service.
                  </AppText>
                </View>
              </View>
            ) : null}
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
              <AppIcon
                name="users"
                role="customer"
                size="xl"
                state="muted"
              />
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              center
              style={
                styles.emptyTitle
              }
            >
              {loadError
                ? "Unable to Load Workers"
                : "No Workers Found"}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.emptyText
              }
            >
              {emptyMessage}
            </AppText>
          </View>
        }
      />

      {/* ======================================================
          FILTER POPUP
      ====================================================== */}

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

      {/* ======================================================
          SORT POPUP
      ====================================================== */}

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
    /* ========================================================
       SCREEN
    ======================================================== */

    container: {
      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingList: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom: 0,
    },

    /* ========================================================
       LIST
    ======================================================== */

    listContent: {
      flexGrow: 1,

      paddingBottom: 0,
    },

    sortContainer: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       REWARD
    ======================================================== */

    rewardBanner: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        CustomerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    rewardIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    rewardBannerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    rewardBannerTitle: {
      color:
        CustomerColors.primary,
    },

    rewardBannerText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      flex: 1,

      minHeight: 320,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,
    },

    emptyIcon: {
      width: 80,

      height: 80,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,
    },
  });