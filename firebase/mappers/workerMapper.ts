import {
  QueryDocumentSnapshot,
} from "firebase/firestore";

import type {
  WorkerCardData,
  WorkerService,
} from "@/components/customer/worker/types";

/* ============================================================
   HELPERS
============================================================ */

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
}

/* ============================================================
   SERVICE REFERENCES
============================================================ */

function extractServiceReferences(
  value: unknown,
): {
  ids: string[];
  services: WorkerService[];
} {
  if (!Array.isArray(value)) {
    return {
      ids: [],
      services: [],
    };
  }

  const ids: string[] = [];
  const services: WorkerService[] = [];

  for (const item of value) {
    /*
     * STRING SERVICE ID
     */

    if (typeof item === "string") {
      const id = item.trim();

      if (id) {
        ids.push(id);
      }

      continue;
    }

    /*
     * SERVICE OBJECT
     */

    if (
      typeof item !== "object" ||
      item === null
    ) {
      continue;
    }

    const service =
      item as {
        id?: unknown;
        serviceId?: unknown;
        name?: unknown;
        serviceName?: unknown;
        icon?: unknown;
        color?: unknown;
        backgroundColor?: unknown;
      };

    const id =
      normalizeString(service.id) ||
      normalizeString(
        service.serviceId,
      );

    const name =
      normalizeString(service.name) ||
      normalizeString(
        service.serviceName,
      );

    if (id) {
      ids.push(id);
    }

    if (name) {
      services.push({
        ...(id ? { id } : {}),
        name,

        icon:
          normalizeString(
            service.icon,
          ) || undefined,

        color:
          normalizeString(
            service.color,
          ) || undefined,

        backgroundColor:
          normalizeString(
            service.backgroundColor,
          ) || undefined,
      });
    }
  }

  return {
    ids: Array.from(
      new Set(ids),
    ),

    services,
  };
}

/* ============================================================
   WORKER MAPPER
============================================================ */

export function workerMapper(
  doc: QueryDocumentSnapshot,
): WorkerCardData {
  const data = doc.data();

  const workerProfile =
    data.workerProfile &&
    typeof data.workerProfile ===
      "object"
      ? data.workerProfile
      : {};

  /* ==========================================================
     FULL NAME
  ========================================================== */

  const fullName =
    normalizeString(
      data.fullName,
    ) ||
    normalizeString(
      workerProfile.fullName,
    ) ||
    normalizeString(
      data.displayName,
    );

  const nameParts =
    fullName
      .split(/\s+/)
      .filter(Boolean);

  const firstName =
    fullName
      ? nameParts[0] ?? ""
      : normalizeString(
          data.firstName,
        );

  const surname =
    fullName
      ? nameParts
          .slice(1)
          .join(" ")
      : normalizeString(
          data.surname,
        );

  /* ==========================================================
     PROFILE PHOTO
  ========================================================== */

  const photoUrl =
    normalizeString(
      workerProfile.photoUrl,
    ) ||
    normalizeString(
      workerProfile.photoURL,
    ) ||
    normalizeString(
      data.photoURL,
    ) ||
    normalizeString(
      data.photoUrl,
    );

  /* ==========================================================
     PHONE NUMBER
  ========================================================== */

  /*
   * Build Your Profile saves:
   *
   * phoneNumber
   *
   * at the root of:
   *
   * workerPublicProfiles/{uid}
   */

  const phoneNumber =
    normalizeString(
      data.phoneNumber,
    ) ||
    normalizeString(
      workerProfile.phoneNumber,
    ) ||
    normalizeString(
      data.phone,
    ) ||
    normalizeString(
      workerProfile.phone,
    );

  /* ==========================================================
     HOURLY RATE
  ========================================================== */

  const hourlyRate =
    normalizeNumber(
      workerProfile.hourlyRate,
    ) ||
    normalizeNumber(
      workerProfile.rate,
    ) ||
    normalizeNumber(
      data.rate,
    ) ||
    normalizeNumber(
      data.hourlyRate,
    );

  /* ==========================================================
     SERVICES
  ========================================================== */

  const selectedServices =
    extractServiceReferences(
      workerProfile.selectedServices,
    );

  const workerServices =
    extractServiceReferences(
      workerProfile.services,
    );

  const profileServiceDetails =
    extractServiceReferences(
      workerProfile.serviceDetails,
    );

  const rootSelectedServices =
    extractServiceReferences(
      data.selectedServices,
    );

  const rootServiceIds =
    extractServiceReferences(
      data.serviceIds,
    );

  /* ==========================================================
     SERVICE IDS
  ========================================================== */

  const serviceIds =
    Array.from(
      new Set([
        ...selectedServices.ids,
        ...workerServices.ids,
        ...profileServiceDetails.ids,
        ...rootSelectedServices.ids,
        ...rootServiceIds.ids,
      ]),
    );

  /* ==========================================================
     SERVICE OBJECTS
  ========================================================== */

  const serviceMap =
    new Map<string, WorkerService>();

  for (const service of [
    ...selectedServices.services,
    ...workerServices.services,
    ...profileServiceDetails.services,
    ...rootSelectedServices.services,
    ...rootServiceIds.services,
  ]) {
    const key =
      service.id?.trim() ||
      service.name.trim();

    if (!key) {
      continue;
    }

    serviceMap.set(
      key,
      service,
    );
  }

  const services =
    Array.from(
      serviceMap.values(),
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    id: doc.id,

    /*
     * Build Your Profile name.
     */
    fullName,

    /*
     * Existing compatibility.
     */
    firstName,
    surname,

    rating:
      normalizeNumber(
        data.rating,
      ),

    totalReviews:
      normalizeNumber(
        data.reviewsCount,
      ),

    online:
      data.online === true,

    verified:
      data.verified === true,

    completedJobs:
      normalizeNumber(
        data.completedJobs,
      ),

    category:
      normalizeString(
        workerProfile.category,
      ) ||
      normalizeString(
        data.category,
      ),

    subcategory:
      normalizeString(
        workerProfile.subcategory,
      ) ||
      normalizeString(
        data.subcategory,
      ),

    services,

    serviceIds,

    workerProfile: {
      photoUrl,

      /*
       * Worker phone number.
       */
      phoneNumber,

      experience:
        normalizeString(
          workerProfile.experience,
        ) ||
        normalizeString(
          data.experience,
        ),

      state:
        normalizeString(
          workerProfile.state,
        ),

      lga:
        normalizeString(
          workerProfile.lga,
        ),

      hourlyRate,

      latitude:
        normalizeNumber(
          workerProfile.latitude,
        ),

      longitude:
        normalizeNumber(
          workerProfile.longitude,
        ),

      geoPoint:
        workerProfile.geoPoint ??
        null,

      geoHash:
        normalizeString(
          workerProfile.geoHash,
        ),

      address:
        normalizeString(
          workerProfile.address,
        ),
    },
  };
}