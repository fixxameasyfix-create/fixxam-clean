import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  AppScreen,
} from "@/components/ui";

import type {
  WorkerCardData,
} from "@/components/customer/worker/types";

import {
  getPublicWorkers,
} from "@/firebase/queries/workerPublicProfiles";

import {
  workerMapper,
} from "@/firebase/mappers/workerMapper";

import {
  calculateDistance,
} from "@/utils/location/calculateDistance";

import useCurrentLocation from "@/hooks/location/useCurrentLocation";

import NearbyWorkersHeader from "./NearbyWorkersHeader";
import NearbyWorkersList from "./NearbyWorkersList";
import NearbyWorkersLoading from "./NearbyWorkersLoading";
import NearbyWorkersEmpty from "./NearbyWorkersEmpty";

/* ==============================================================
   TYPES
============================================================== */

type Coordinates = {
  latitude: number;
  longitude: number;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DISCOUNTED_WORKER_LIMIT =
  5;

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function parseCoordinate(
  value: unknown,
  min: number,
  max: number,
): number | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const parsed =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed < min ||
    parsed > max
  ) {
    return null;
  }

  return parsed;
}

/* ==============================================================
   VALID COORDINATES

   Returns a fully narrowed coordinate object.
   This prevents number | null from reaching
   calculateDistance().
============================================================== */

function getValidCoordinates(
  latitude: unknown,
  longitude: unknown,
): Coordinates | null {
  if (
    typeof latitude !==
      "number" ||
    typeof longitude !==
      "number" ||
    !Number.isFinite(
      latitude,
    ) ||
    !Number.isFinite(
      longitude,
    ) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

function workerOffersService(
  worker: WorkerCardData,
  serviceId: string,
): boolean {
  if (
    !serviceId
  ) {
    return true;
  }

  if (
    Array.isArray(
      worker.serviceIds,
    ) &&
    worker.serviceIds.includes(
      serviceId,
    )
  ) {
    return true;
  }

  return (
    Array.isArray(
      worker.services,
    ) &&
    worker.services.some(
      (
        service,
      ) =>
        cleanString(
          service.id,
        ) ===
        serviceId,
    )
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function NearbyWorkersScreen() {
  const params =
    useLocalSearchParams<{
      source?: string;

      latitude?: string;

      longitude?: string;

      limit?: string;

      serviceId?: string;

      serviceName?: string;

      categoryId?: string;
    }>();

  const isDiscountedServices =
    params.source ===
    "discounted-services";

  /* ============================================================
     SERVICE CONTEXT
  ============================================================ */

  const selectedServiceId =
    cleanString(
      params.serviceId,
    );

  const selectedServiceName =
    cleanString(
      params.serviceName,
    );

  const selectedCategoryId =
    cleanString(
      params.categoryId,
    );

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
    search,
    setSearch,
  ] =
    useState("");

  const [
    workersLoading,
    setWorkersLoading,
  ] =
    useState(
      true,
    );

  const [
    workersError,
    setWorkersError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const requestIdRef =
    useRef(
      0,
    );

  /* ============================================================
     CUSTOMER LOCATION
  ============================================================ */

  const {
    location,
    loading:
      locationLoading,
    error:
      locationError,
    refresh:
      refreshLocation,
  } =
    useCurrentLocation();

  /* ============================================================
     RESOLVED CUSTOMER LOCATION

     Always returns either:

     {
       latitude: number,
       longitude: number
     }

     or null.
  ============================================================ */

  const customerLocation =
    useMemo<
      Coordinates | null
    >(
      () => {
        /* ======================================================
           DISCOUNTED FLOW ROUTE COORDINATES
        ====================================================== */

        if (
          isDiscountedServices
        ) {
          const latitude =
            parseCoordinate(
              params.latitude,
              -90,
              90,
            );

          const longitude =
            parseCoordinate(
              params.longitude,
              -180,
              180,
            );

          if (
            latitude !==
              null &&
            longitude !==
              null
          ) {
            return {
              latitude,
              longitude,
            };
          }
        }

        /* ======================================================
           DEVICE LOCATION
        ====================================================== */

        if (
          !location
        ) {
          return null;
        }

        return getValidCoordinates(
          location.latitude,
          location.longitude,
        );
      },
      [
        isDiscountedServices,
        location,
        params.latitude,
        params.longitude,
      ],
    );

  /* ============================================================
     LOAD WORKERS
  ============================================================ */

  const loadWorkers =
    useCallback(async () => {
      const requestId =
        ++requestIdRef.current;

      if (
        !customerLocation
      ) {
        if (
          requestId ===
          requestIdRef.current
        ) {
          setWorkersLoading(
            false,
          );
        }

        return;
      }

      try {
        setWorkersLoading(
          true,
        );

        setWorkersError(
          null,
        );

        const snapshot =
          await getPublicWorkers();

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        const mapped =
          snapshot.docs
            .map(
              workerMapper,
            )

            /* ================================================
               SERVICE MATCH
            ================================================ */

            .filter(
              (
                worker,
              ) =>
                workerOffersService(
                  worker,
                  selectedServiceId,
                ),
            )

            /* ================================================
               DISTANCE
            ================================================ */

            .map(
              (
                worker,
              ) => {
                const workerCoordinates =
                  getValidCoordinates(
                    worker
                      .workerProfile
                      ?.latitude,

                    worker
                      .workerProfile
                      ?.longitude,
                  );

                if (
                  !workerCoordinates
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
                      customerLocation
                        .latitude,

                      customerLocation
                        .longitude,

                      workerCoordinates
                        .latitude,

                      workerCoordinates
                        .longitude,
                    ),
                };
              },
            )

            /* ================================================
               ONLY WORKERS WITH VALID DISTANCE
            ================================================ */

            .filter(
              (
                worker,
              ): worker is WorkerCardData & {
                distance: number;
              } =>
                typeof worker
                  .distance ===
                  "number" &&
                Number.isFinite(
                  worker.distance,
                ) &&
                worker.distance >=
                  0,
            )

            /* ================================================
               NEAREST FIRST
            ================================================ */

            .sort(
              (
                a,
                b,
              ) =>
                a.distance -
                b.distance,
            );

        const visibleWorkers =
          isDiscountedServices
            ? mapped.slice(
                0,
                DISCOUNTED_WORKER_LIMIT,
              )
            : mapped;

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setWorkers(
          visibleWorkers,
        );
      } catch (
        err
      ) {
        console.error(
          "Failed to load public nearby workers:",
          err,
        );

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setWorkersError(
          "Unable to load nearby workers. Please try again.",
        );

        /*
         * Keep any existing workers instead of
         * replacing the screen with an empty list.
         */
        Toast.show({
          type:
            "error",

          text1:
            "Unable to load workers",

          text2:
            "Please check your connection and try again.",
        });
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
          setWorkersLoading(
            false,
          );
        }
      }
    }, [
      customerLocation,
      isDiscountedServices,
      selectedServiceId,
    ]);

  /* ============================================================
     LOAD
  ============================================================ */

  useEffect(() => {
    void loadWorkers();

    return () => {
      /*
       * Invalidate any request still running.
       */
      requestIdRef.current +=
        1;
    };
  }, [
    loadWorkers,
  ]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleRefresh =
    useCallback(async () => {
      /*
       * Discounted flow already received its
       * customer coordinates from route params.
       */
      if (
        !isDiscountedServices
      ) {
        try {
          await refreshLocation();
        } catch (
          err
        ) {
          console.error(
            "Failed to refresh customer location:",
            err,
          );
        }
      }

      await loadWorkers();
    }, [
      isDiscountedServices,
      loadWorkers,
      refreshLocation,
    ]);

  /* ============================================================
     SEARCH
  ============================================================ */

  const filteredWorkers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (
        !query
      ) {
        return workers;
      }

      return workers.filter(
        (
          worker,
        ) => {
          const name =
            [
              cleanString(
                worker.fullName,
              ),

              cleanString(
                worker.firstName,
              ),

              cleanString(
                worker.surname,
              ),
            ]
              .join(" ")
              .toLowerCase();

          const category =
            cleanString(
              worker.category,
            ).toLowerCase();

          const subcategory =
            cleanString(
              worker.subcategory,
            ).toLowerCase();

          const services =
            Array.isArray(
              worker.services,
            )
              ? worker.services
                  .map(
                    (
                      service,
                    ) =>
                      cleanString(
                        service.name,
                      ),
                  )
                  .filter(
                    Boolean,
                  )
                  .join(" ")
                  .toLowerCase()
              : "";

          return (
            name.includes(
              query,
            ) ||
            category.includes(
              query,
            ) ||
            subcategory.includes(
              query,
            ) ||
            services.includes(
              query,
            )
          );
        },
      );
    }, [
      search,
      workers,
    ]);

  /* ============================================================
     INITIAL LOADING
  ============================================================ */

  const initialLoading =
    (
      !customerLocation &&
      locationLoading &&
      !isDiscountedServices
    ) ||
    (
      workersLoading &&
      workers.length ===
        0
    );

  if (
    initialLoading
  ) {
    return (
      <NearbyWorkersLoading />
    );
  }

  /* ============================================================
     LOCATION ERROR
  ============================================================ */

  if (
    locationError &&
    !customerLocation
  ) {
    return (
      <NearbyWorkersEmpty
        message={
          locationError
        }
      />
    );
  }

  /* ============================================================
     WORKERS ERROR
  ============================================================ */

  if (
    workersError &&
    workers.length ===
      0
  ) {
    return (
      <NearbyWorkersEmpty
        message={
          workersError
        }
      />
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
      edges={[
        "top",
      ]}
    >
      <NearbyWorkersHeader
        search={
          search
        }
        onSearch={
          setSearch
        }
        title={
          isDiscountedServices
            ? "5 Workers Near You"
            : undefined
        }
        subtitle={
          isDiscountedServices
            ? "These are the 5 closest workers near your location."
            : undefined
        }
      />

      {filteredWorkers.length ===
      0 ? (
        <NearbyWorkersEmpty
          message={
            search.trim()
              ? "No workers match your search."
              : selectedServiceName
                ? `No nearby workers are currently available for ${selectedServiceName}.`
                : isDiscountedServices
                  ? "No workers were found near your location."
                  : undefined
          }
        />
      ) : (
        <NearbyWorkersList
          workers={
            filteredWorkers
          }
          refreshing={
            workersLoading ||
            (
              !isDiscountedServices &&
              locationLoading
            )
          }
          onRefresh={
            handleRefresh
          }

          /* ================================================
             SERVICE CONTEXT — PRESERVED
          ================================================ */

          serviceId={
            selectedServiceId
          }
          serviceName={
            selectedServiceName
          }
          categoryId={
            selectedCategoryId
          }
        />
      )}
    </AppScreen>
  );
}