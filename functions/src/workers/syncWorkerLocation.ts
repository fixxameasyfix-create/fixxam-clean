import {
  onDocumentWritten,
} from "firebase-functions/v2/firestore";

import {
  getFirestore,
} from "firebase-admin/firestore";

import {
  geohashForLocation,
} from "geofire-common";

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

/* ==============================================================
   SYNC WORKER GEOHASH
============================================================== */

export const syncWorkerLocation =
  onDocumentWritten(
    "users/{userId}",
    async (event) => {
      const after =
        event.data?.after;

      if (!after?.exists) {
        return;
      }

      const data =
        after.data();

      if (!data) {
        return;
      }

      if (
        !hasWorkerRole(
          data.roles,
        )
      ) {
        return;
      }

      const latitude =
        toNumber(
          data.latitude,
        );

      const longitude =
        toNumber(
          data.longitude,
        );

      if (
        latitude === null ||
        longitude === null ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return;
      }

      const geohash =
        geohashForLocation([
          latitude,
          longitude,
        ]);

      /*
       * Prevent recursive writes.
       */
      if (
        data.geohash ===
        geohash
      ) {
        return;
      }

      const db =
        getFirestore();

      await db
        .collection("users")
        .doc(event.params.userId)
        .update({
          geohash,
        });

      console.log(
        "WORKER GEOHASH SYNCED",
        {
          userId:
            event.params.userId,
          geohash,
        },
      );
    },
  );