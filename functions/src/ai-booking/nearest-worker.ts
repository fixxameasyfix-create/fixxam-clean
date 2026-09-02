import {
  getFirestore,
} from "firebase-admin/firestore";

import {
  distanceBetween,
  geohashQueryBounds,
} from "geofire-common";

/* ==============================================================
   TYPES
============================================================== */

export type NearestWorker = {
  id: string;
  name: string;
  photoUrl: string;
  rating: number;
  completedJobs: number;
  verified: boolean;
  distanceKm: number;
};

type WorkerProfile = {
  selectedServices?: unknown;
  photoUrl?: unknown;
  rating?: unknown;
  completedJobs?: unknown;
  verified?: unknown;
};

type WorkerDocument = {
  roles?: unknown;
  available?: unknown;

  FirstName?: unknown;
  firstName?: unknown;

  surname?: unknown;
  Surname?: unknown;

  photoUrl?: unknown;
  rating?: unknown;
  completedJobs?: unknown;
  verified?: unknown;

  latitude?: unknown;
  longitude?: unknown;

  /*
   * New location index.
   */
  geohash?: unknown;

  workerProfile?: WorkerProfile;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const SEARCH_RADII_KM = [
  10,
  25,
  50,
  100,
] as const;

const MAX_RESULTS_PER_QUERY = 100;

/* ==============================================================
   HELPERS
============================================================== */

function toNumber(
  value: unknown,
): number | null {
  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function toString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function toBoolean(
  value: unknown,
): boolean {
  return value === true;
}

function hasWorkerRole(
  roles: unknown,
): boolean {
  return (
    Array.isArray(roles) &&
    roles.some(
      (role) =>
        typeof role === "string" &&
        role.trim().toLowerCase() ===
          "worker",
    )
  );
}

function supportsService(
  selectedServices: unknown,
  serviceId: string,
): boolean {
  if (
    !Array.isArray(
      selectedServices,
    )
  ) {
    return false;
  }

  return selectedServices.some(
    (service) =>
      typeof service === "string" &&
      service.trim() === serviceId,
  );
}

function getWorkerName(
  data: WorkerDocument,
): string {
  const firstName =
    toString(
      data.FirstName ??
        data.firstName,
    );

  const surname =
    toString(
      data.surname ??
        data.Surname,
    );

  return (
    `${firstName} ${surname}`.trim() ||
    "Fixxam Professional"
  );
}

function getWorkerProfile(
  data: WorkerDocument,
): WorkerProfile {
  return (
    data.workerProfile ?? {}
  );
}

function isValidCoordinate(
  latitude: number,
  longitude: number,
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/* ==============================================================
   FIND NEAREST WORKER
============================================================== */

export async function findNearestWorker(
  params: {
    serviceId: string;
    latitude: number;
    longitude: number;
  },
): Promise<NearestWorker | null> {
  const serviceId =
    params.serviceId.trim();

  const latitude =
    params.latitude;

  const longitude =
    params.longitude;

  if (
    !serviceId ||
    !isValidCoordinate(
      latitude,
      longitude,
    )
  ) {
    return null;
  }

  const db =
    getFirestore();

  const center: [
    number,
    number,
  ] = [
    latitude,
    longitude,
  ];

  /*
   * Search progressively farther away.
   *
   * This avoids reading the entire users
   * collection while still giving the
   * customer a nearby worker when possible.
   */
  for (
    const radiusKm of SEARCH_RADII_KM
  ) {
    const radiusInM =
      radiusKm * 1000;

    const bounds =
      geohashQueryBounds(
        center,
        radiusInM,
      );

    const snapshots =
      await Promise.all(
        bounds.map(
          async ([start, end]) => {
            return db
              .collection("users")
              .orderBy("geohash")
              .startAt(start)
              .endAt(end)
              .limit(
                MAX_RESULTS_PER_QUERY,
              )
              .get();
          },
        ),
      );

    const workers =
      new Map<
        string,
        NearestWorker
      >();

    /*
     * Each geohash query can overlap.
     * Map prevents duplicate workers.
     */
    for (
      const snapshot of snapshots
    ) {
      for (
        const doc of snapshot.docs
      ) {
        if (
          workers.has(doc.id)
        ) {
          continue;
        }

        const data =
          doc.data() as WorkerDocument;

        /*
         * Backend validation.
         */
        if (
          !hasWorkerRole(
            data.roles,
          )
        ) {
          continue;
        }

        if (
          data.available !== true
        ) {
          continue;
        }

        const profile =
          getWorkerProfile(data);

        if (
          !supportsService(
            profile.selectedServices,
            serviceId,
          )
        ) {
          continue;
        }

        const workerLatitude =
          toNumber(
            data.latitude,
          );

        const workerLongitude =
          toNumber(
            data.longitude,
          );

        if (
          workerLatitude === null ||
          workerLongitude === null
        ) {
          continue;
        }

        if (
          !isValidCoordinate(
            workerLatitude,
            workerLongitude,
          )
        ) {
          continue;
        }

        /*
         * GeoHash is only the query mechanism.
         *
         * Exact distance is calculated here.
         */
        const distance =
          distanceBetween(
            [
              workerLatitude,
              workerLongitude,
            ],
            center,
          );

        /*
         * Remove GeoHash false positives.
         */
        if (
          distance >
          radiusKm
        ) {
          continue;
        }

        workers.set(
          doc.id,
          {
            id: doc.id,

            name:
              getWorkerName(data),

            photoUrl:
              toString(
                data.photoUrl ??
                  profile.photoUrl,
              ),

            rating:
              toNumber(
                data.rating ??
                  profile.rating,
              ) ?? 0,

            completedJobs:
              toNumber(
                data.completedJobs,
              ) ?? 0,

            verified:
              toBoolean(
                data.verified ??
                  profile.verified,
              ),

            distanceKm:
              Math.round(
                distance * 100,
              ) / 100,
          },
        );
      }
    }

    if (
      workers.size === 0
    ) {
      continue;
    }

    const sortedWorkers =
      Array.from(
        workers.values(),
      ).sort(
        (a, b) => {
          /*
           * PRIMARY:
           * nearest worker.
           */
          if (
            a.distanceKm !==
            b.distanceKm
          ) {
            return (
              a.distanceKm -
              b.distanceKm
            );
          }

          /*
           * SECONDARY:
           * verified.
           */
          if (
            a.verified !==
            b.verified
          ) {
            return a.verified
              ? -1
              : 1;
          }

          /*
           * TERTIARY:
           * rating.
           */
          if (
            a.rating !==
            b.rating
          ) {
            return (
              b.rating -
              a.rating
            );
          }

          /*
           * LAST:
           * completed jobs.
           */
          return (
            b.completedJobs -
            a.completedJobs
          );
        },
      );

    const nearest =
      sortedWorkers[0];

    if (nearest) {
      console.log(
        "NEAREST WORKER FOUND",
        {
          serviceId,
          workerId:
            nearest.id,
          distanceKm:
            nearest.distanceKm,
          radiusKm,
        },
      );

      return nearest;
    }
  }

  console.log(
    "NO NEARBY WORKER FOUND",
    {
      serviceId,
      latitude,
      longitude,
    },
  );

  return null;
}