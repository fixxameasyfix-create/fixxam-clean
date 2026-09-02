import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import { useLocalSearchParams } from "expo-router";

import {
  getPublicWorkers,
} from "@/firebase/queries/workerPublicProfiles";

import { workerMapper } from "@/firebase/mappers/workerMapper";

import { calculateDistance } from "@/utils/location/calculateDistance";

import useCurrentLocation from "@/hooks/location/useCurrentLocation";

import type {
  WorkerCardData,
} from "@/components/customer/worker/types";

import NearbyWorkersHeader from "./NearbyWorkersHeader";
import NearbyWorkersList from "./NearbyWorkersList";
import NearbyWorkersLoading from "./NearbyWorkersLoading";
import NearbyWorkersEmpty from "./NearbyWorkersEmpty";

const DISCOUNTED_WORKER_LIMIT = 5;

export default function NearbyWorkersScreen() {
  const params =
    useLocalSearchParams<{
      source?: string;

      latitude?: string;
      longitude?: string;
      limit?: string;

      /**
       * Service context
       *
       * These are passed when customer opens
       * Nearby Workers from a specific service.
       */
      serviceId?: string;
      serviceName?: string;
      categoryId?: string;
    }>();

  const isDiscountedServices =
    params.source ===
    "discounted-services";

  /*
   * ------------------------------------------------
   * SERVICE CONTEXT
   * ------------------------------------------------
   *
   * This is the important fix.
   *
   * When customer comes from:
   *
   * Category
   *   ↓
   * Subcategory
   *   ↓
   * Service
   *   ↓
   * Find Workers Nearby
   *
   * we keep the selected service here.
   */
  const selectedServiceId =
    typeof params.serviceId === "string"
      ? params.serviceId.trim()
      : "";

  const selectedServiceName =
    typeof params.serviceName === "string"
      ? params.serviceName.trim()
      : "";

  const selectedCategoryId =
    typeof params.categoryId === "string"
      ? params.categoryId.trim()
      : "";

  const [workers, setWorkers] =
    useState<WorkerCardData[]>([]);

  const [search, setSearch] =
    useState("");

  const {
    location,
    loading,
    error,
    refresh,
  } = useCurrentLocation();

  /*
   * ------------------------------------------------
   * CUSTOMER LOCATION
   * ------------------------------------------------
   */
  const customerLocation =
    useMemo(() => {
      if (
        isDiscountedServices &&
        params.latitude &&
        params.longitude
      ) {
        const latitude =
          Number(params.latitude);

        const longitude =
          Number(params.longitude);

        if (
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        ) {
          return {
            latitude,
            longitude,
          };
        }
      }

      return location;
    }, [
      isDiscountedServices,
      params.latitude,
      params.longitude,
      location,
    ]);

  /*
   * ------------------------------------------------
   * LOAD PUBLIC WORKERS
   * ------------------------------------------------
   */
  const loadWorkers =
    useCallback(async () => {
      if (!customerLocation) {
        return;
      }

      try {
        const snapshot =
          await getPublicWorkers();

        const mapped =
          snapshot.docs
            .map(workerMapper)
            .map((worker) => {
              const latitude =
                worker.workerProfile
                  ?.latitude;

              const longitude =
                worker.workerProfile
                  ?.longitude;

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
                    customerLocation.latitude,
                    customerLocation.longitude,
                    latitude,
                    longitude,
                  ),
              };
            })
            .filter(
              (worker) =>
                Number.isFinite(
                  worker.distance ??
                    NaN,
                ),
            )
            .sort(
              (a, b) =>
                (a.distance ?? 0) -
                (b.distance ?? 0),
            );

        /*
         * Discounted Services:
         *
         * Only show the closest 5 workers.
         */
        const visibleWorkers =
          isDiscountedServices
            ? mapped.slice(
                0,
                DISCOUNTED_WORKER_LIMIT,
              )
            : mapped;

        setWorkers(
          visibleWorkers,
        );
      } catch (err) {
        console.error(
          "Failed to load public nearby workers:",
          err,
        );

        setWorkers([]);
      }
    }, [
      customerLocation,
      isDiscountedServices,
    ]);

  useEffect(() => {
    void loadWorkers();
  }, [loadWorkers]);

  /*
   * ------------------------------------------------
   * SEARCH
   * ------------------------------------------------
   */
  const filteredWorkers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return workers;
      }

      return workers.filter(
        (worker) => {
          const name =
            `${worker.firstName ?? ""} ${
              worker.surname ?? ""
            }`
              .trim()
              .toLowerCase();

          const category =
            (
              worker.category ??
              ""
            ).toLowerCase();

          const subcategory =
            (
              worker.subcategory ??
              ""
            ).toLowerCase();

          /*
           * services is:
           *
           * {
           *   id?: string;
           *   name: string;
           * }[]
           */
          const services =
            Array.isArray(
              worker.services,
            )
              ? worker.services
                  .map(
                    (service) =>
                      service.name,
                  )
                  .join(" ")
                  .toLowerCase()
              : "";

          return (
            name.includes(query) ||
            category.includes(query) ||
            subcategory.includes(
              query,
            ) ||
            services.includes(query)
          );
        },
      );
    }, [
      workers,
      search,
    ]);

  /*
   * ------------------------------------------------
   * LOADING
   * ------------------------------------------------
   */
  if (
    loading &&
    !isDiscountedServices
  ) {
    return (
      <NearbyWorkersLoading />
    );
  }

  /*
   * ------------------------------------------------
   * LOCATION ERROR
   * ------------------------------------------------
   */
  if (
    error &&
    !customerLocation
  ) {
    return (
      <NearbyWorkersEmpty
        message={error}
      />
    );
  }

  /*
   * ------------------------------------------------
   * UI
   * ------------------------------------------------
   */
  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={["top"]}
    >
      <NearbyWorkersHeader
        search={search}
        onSearch={setSearch}
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
            isDiscountedServices
              ? "No workers were found near your location."
              : undefined
          }
        />
      ) : (
        <NearbyWorkersList
          workers={
            filteredWorkers
          }
          refreshing={loading}
          onRefresh={refresh}

          /*
           * IMPORTANT:
           * Pass selected service to the list.
           */
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
    </SafeAreaView>
  );
}