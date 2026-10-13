import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getFreshWorkerProfilePhotoUrl,
} from "@/firebase/queries/workerPublicProfiles";

import {
  getBookingParamValue,
  type BookingRouteParam,
} from "./BookingServiceData";

/* ==============================================================
   TYPES
============================================================== */

export type BookingWorkerDataInput = {
  workerId?: BookingRouteParam;
  workerName?: BookingRouteParam;
  workerPhoto?: BookingRouteParam;
  workerCategory?: BookingRouteParam;
  workerOnline?: BookingRouteParam;
  workerDistance?: BookingRouteParam;
};

export type BookingWorkerData = {
  id: string;
  name: string;
  photoUrl: string;
  category: string;
  online: boolean;
  distance?: number;
  photoLoading: boolean;
};

/* ==============================================================
   HELPERS
============================================================== */

function normalizeWorkerPhotoUrl(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  const url =
    value.trim();

  if (
    !url ||
    !url.startsWith(
      "https://",
    )
  ) {
    return "";
  }

  return url;
}

function normalizeDistance(
  value: BookingRouteParam,
): number | undefined {
  const raw =
    getBookingParamValue(
      value,
    );

  if (
    !raw
  ) {
    return undefined;
  }

  const distance =
    Number(
      raw,
    );

  if (
    !Number.isFinite(
      distance,
    )
  ) {
    return undefined;
  }

  return Math.max(
    0,
    distance,
  );
}

/* ==============================================================
   HOOK
============================================================== */

export function useBookingWorkerData({
  workerId,
  workerName,
  workerPhoto,
  workerCategory,
  workerOnline,
  workerDistance,
}: BookingWorkerDataInput): BookingWorkerData {
  /* ============================================================
     ROUTE DATA
  ============================================================ */

  const id =
    useMemo(
      () =>
        getBookingParamValue(
          workerId,
        ),
      [
        workerId,
      ],
    );

  const name =
    useMemo(
      () =>
        getBookingParamValue(
          workerName,
        ) ||
        "Selected Worker",
      [
        workerName,
      ],
    );

  const routePhotoUrl =
    useMemo(
      () =>
        normalizeWorkerPhotoUrl(
          getBookingParamValue(
            workerPhoto,
          ),
        ),
      [
        workerPhoto,
      ],
    );

  const category =
    useMemo(
      () =>
        getBookingParamValue(
          workerCategory,
        ) ||
        "Service Provider",
      [
        workerCategory,
      ],
    );

  const online =
    useMemo(
      () =>
        getBookingParamValue(
          workerOnline,
        ) ===
        "true",
      [
        workerOnline,
      ],
    );

  const distance =
    useMemo(
      () =>
        normalizeDistance(
          workerDistance,
        ),
      [
        workerDistance,
      ],
    );

  /* ============================================================
     FRESH PHOTO
  ============================================================ */

  const [
    freshPhotoUrl,
    setFreshPhotoUrl,
  ] =
    useState("");

  const [
    photoLoading,
    setPhotoLoading,
  ] =
    useState(false);

  useEffect(() => {
    let cancelled =
      false;

    const loadPhoto =
      async () => {
        if (
          !id
        ) {
          if (
            !cancelled
          ) {
            setFreshPhotoUrl(
              "",
            );

            setPhotoLoading(
              false,
            );
          }

          return;
        }

        setPhotoLoading(
          true,
        );

        try {
          const freshUrl =
            await getFreshWorkerProfilePhotoUrl(
              id,
            );

          if (
            cancelled
          ) {
            return;
          }

          const normalizedUrl =
            normalizeWorkerPhotoUrl(
              freshUrl,
            );

          setFreshPhotoUrl(
            normalizedUrl,
          );

          if (
            __DEV__
          ) {
            console.log(
              "BOOKING_FRESH_WORKER_PHOTO",
              {
                workerId:
                  id,

                hasFreshPhoto:
                  Boolean(
                    normalizedUrl,
                  ),
              },
            );
          }
        } catch (
          error
        ) {
          if (
            cancelled
          ) {
            return;
          }

          setFreshPhotoUrl(
            "",
          );

          if (
            __DEV__
          ) {
            console.warn(
              "BOOKING_FRESH_WORKER_PHOTO_ERROR",
              {
                workerId:
                  id,

                error,
              },
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setPhotoLoading(
              false,
            );
          }
        }
      };

    void loadPhoto();

    return () => {
      cancelled =
        true;
    };
  }, [
    id,
  ]);

  /* ============================================================
     FINAL PHOTO
  ============================================================ */

  const photoUrl =
    useMemo(
      () =>
        freshPhotoUrl ||
        routePhotoUrl,
      [
        freshPhotoUrl,
        routePhotoUrl,
      ],
    );

  /* ============================================================
     RETURN
  ============================================================ */

  return useMemo(
    () => ({
      id,
      name,
      photoUrl,
      category,
      online,
      distance,
      photoLoading,
    }),
    [
      category,
      distance,
      id,
      name,
      online,
      photoLoading,
      photoUrl,
    ],
  );
}