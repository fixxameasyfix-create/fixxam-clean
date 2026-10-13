import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPublicWorkerLocation,
  type WorkerPublicLocation,
} from "@/firebase/queries/workerPublicProfiles";

import {
  type ServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

/* ==============================================================
   TYPES
============================================================== */

export type BookingProviderDataInput = {
  workerId: string;

  fulfillmentMode:
    ServiceFulfillmentMode;
};

export type BookingProviderData = {
  location:
    WorkerPublicLocation | null;

  /*
   * Exact customer-facing service address.
   *
   * Example:
   * "12 Zoo Road, Kano"
   */
  address: string;

  /*
   * Human-readable locality.
   *
   * Example:
   * "Nassarawa, Kano"
   */
  locality: string;

  valid: boolean;

  loading: boolean;
};

/* ==============================================================
   STRING
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   COORDINATE VALIDATION
============================================================== */

function isValidCoordinates(
  latitude:
    | number
    | null
    | undefined,

  longitude:
    | number
    | null
    | undefined,
): boolean {
  return (
    typeof latitude ===
      "number" &&
    Number.isFinite(
      latitude,
    ) &&
    latitude >= -90 &&
    latitude <= 90 &&

    typeof longitude ===
      "number" &&
    Number.isFinite(
      longitude,
    ) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/* ==============================================================
   PROVIDER ADDRESS
============================================================== */

/**
 * Returns the exact worker-selected
 * customer-facing service address.
 *
 * IMPORTANT:
 *
 * Do not rebuild this address from
 * LGA / State.
 *
 * The address comes directly from:
 *
 * workerProfile.serviceLocation.address
 */
function getProviderAddress(
  location:
    WorkerPublicLocation | null,
): string {
  if (!location) {
    return "";
  }

  return cleanString(
    location.address,
  );
}

/* ==============================================================
   PROVIDER LOCALITY
============================================================== */

/**
 * Secondary location description used
 * by the UI underneath the exact address.
 *
 * Example:
 *
 * "Nassarawa, Kano"
 */
function getProviderLocality(
  location:
    WorkerPublicLocation | null,
): string {
  if (!location) {
    return "";
  }

  const lga =
    cleanString(
      location.lga,
    );

  const state =
    cleanString(
      location.state,
    );

  return [
    lga,
    state,
  ]
    .filter(
      Boolean,
    )
    .join(
      ", ",
    );
}

/* ==============================================================
   HOOK
============================================================== */

export function useBookingProviderData({
  workerId,
  fulfillmentMode,
}: BookingProviderDataInput): BookingProviderData {
  const [
    location,
    setLocation,
  ] =
    useState<
      WorkerPublicLocation | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  /* ============================================================
     NORMALIZED WORKER ID
  ============================================================ */

  const normalizedWorkerId =
    useMemo(
      () =>
        cleanString(
          workerId,
        ),
      [
        workerId,
      ],
    );

  /* ============================================================
     PROVIDER LOCATION REQUIREMENT
  ============================================================ */

  const needsProviderLocation =
    useMemo(
      () =>
        fulfillmentMode ===
          "customer_visits_worker" ||
        fulfillmentMode ===
          "flexible",
      [
        fulfillmentMode,
      ],
    );

  /* ============================================================
     LOAD PROVIDER LOCATION
  ============================================================ */

  useEffect(() => {
    let cancelled =
      false;

    const loadLocation =
      async () => {
        /*
         * Clear provider location whenever
         * this booking mode does not require
         * the customer to visit the worker.
         */
        if (
          !normalizedWorkerId ||
          !needsProviderLocation
        ) {
          if (!cancelled) {
            setLocation(
              null,
            );

            setLoading(
              false,
            );
          }

          return;
        }

        /*
         * Prevent a previous worker's
         * location from remaining visible
         * while the next location loads.
         */
        setLocation(
          null,
        );

        setLoading(
          true,
        );

        try {
          const result =
            await getPublicWorkerLocation(
              normalizedWorkerId,
            );

          if (cancelled) {
            return;
          }

          setLocation(
            result,
          );

          if (__DEV__) {
            console.log(
              "BOOKING_PROVIDER_SERVICE_LOCATION:",
              {
                workerId:
                  normalizedWorkerId,

                fulfillmentMode,

                hasLocation:
                  Boolean(
                    result,
                  ),

                hasAddress:
                  Boolean(
                    cleanString(
                      result?.address,
                    ),
                  ),

                state:
                  result?.state ??
                  "",

                lga:
                  result?.lga ??
                  "",

                hasCoordinates:
                  isValidCoordinates(
                    result?.latitude,
                    result?.longitude,
                  ),
              },
            );
          }
        } catch (
          error
        ) {
          if (cancelled) {
            return;
          }

          setLocation(
            null,
          );

          if (__DEV__) {
            console.warn(
              "BOOKING_PROVIDER_SERVICE_LOCATION_ERROR:",
              {
                workerId:
                  normalizedWorkerId,

                fulfillmentMode,

                error,
              },
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(
              false,
            );
          }
        }
      };

    void loadLocation();

    return () => {
      cancelled =
        true;
    };
  }, [
    fulfillmentMode,
    needsProviderLocation,
    normalizedWorkerId,
  ]);

  /* ============================================================
     EXACT ADDRESS
  ============================================================ */

  const address =
    useMemo(
      () =>
        getProviderAddress(
          location,
        ),
      [
        location,
      ],
    );

  /* ============================================================
     LOCALITY
  ============================================================ */

  const locality =
    useMemo(
      () =>
        getProviderLocality(
          location,
        ),
      [
        location,
      ],
    );

  /* ============================================================
     VALID
  ============================================================ */

  const valid =
    useMemo(
      () => {
        if (
          !location ||
          !address
        ) {
          return false;
        }

        /*
         * Require all location information
         * needed for a real customer visit.
         */
        const hasState =
          Boolean(
            cleanString(
              location.state,
            ),
          );

        const hasLga =
          Boolean(
            cleanString(
              location.lga,
            ),
          );

        const hasCoordinates =
          isValidCoordinates(
            location.latitude,
            location.longitude,
          );

        return (
          hasState &&
          hasLga &&
          hasCoordinates
        );
      },
      [
        address,
        location,
      ],
    );

  /* ============================================================
     RETURN
  ============================================================ */

  return useMemo(
    () => ({
      location,

      address,

      locality,

      valid,

      loading,
    }),
    [
      address,
      loading,
      locality,
      location,
      valid,
    ],
  );
}