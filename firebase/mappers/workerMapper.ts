import {
  QueryDocumentSnapshot,
} from "firebase/firestore";

import type {
  WorkerCardData,
  WorkerService,
} from "@/components/customer/worker/types";

/* ============================================================
   TYPES
============================================================ */

type ImageSource = {
  source: string;

  value: unknown;
};

/* ============================================================
   STRING
============================================================ */

function normalizeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/* ============================================================
   NUMBER
============================================================ */

function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  )
    ? value
    : fallback;
}

/* ============================================================
   NULLABLE NUMBER
============================================================ */

/**
 * Location values must remain null
 * when they do not exist.
 *
 * Returning 0 would incorrectly place
 * a worker at coordinates 0, 0.
 */
function normalizeNullableNumber(
  value: unknown,
): number | null {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  )
    ? value
    : null;
}

/* ============================================================
   RATING
============================================================ */

function normalizeRating(
  value: unknown,
): number {
  return Math.min(
    5,
    Math.max(
      0,
      normalizeNumber(
        value,
      ),
    ),
  );
}

/* ============================================================
   IMAGE URL
============================================================ */

/**
 * Public worker image values leaving
 * this mapper must be valid HTTPS URLs.
 *
 * Rejected:
 *
 * - file://
 * - content://
 * - gs://
 * - http://
 * - empty values
 */
function normalizeImageUrl(
  value: unknown,
): string {
  const url =
    normalizeString(
      value,
    );

  if (
    !url
  ) {
    return "";
  }

  if (
    !url.startsWith(
      "https://",
    )
  ) {
    return "";
  }

  return url;
}

/* ============================================================
   RESOLVE IMAGE URL
============================================================ */

/**
 * Resolve the first valid HTTPS image URL.
 */
function resolveImageUrl(
  ...values: ImageSource[]
): {
  url: string;

  source: string;
} {
  for (
    const item of
    values
  ) {
    const url =
      normalizeImageUrl(
        item.value,
      );

    if (
      url
    ) {
      return {
        url,

        source:
          item.source,
      };
    }
  }

  return {
    url: "",

    source:
      "none",
  };
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
  if (
    !Array.isArray(
      value,
    )
  ) {
    return {
      ids: [],

      services: [],
    };
  }

  const ids:
    string[] =
    [];

  const services:
    WorkerService[] =
    [];

  for (
    const item of
    value
  ) {
    /* --------------------------------------------------------
       STRING SERVICE ID
    -------------------------------------------------------- */

    if (
      typeof item ===
      "string"
    ) {
      const id =
        item.trim();

      if (
        id
      ) {
        ids.push(
          id,
        );
      }

      continue;
    }

    /* --------------------------------------------------------
       SERVICE OBJECT
    -------------------------------------------------------- */

    if (
      typeof item !==
        "object" ||
      item ===
        null ||
      Array.isArray(
        item,
      )
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
      normalizeString(
        service.id,
      ) ||
      normalizeString(
        service.serviceId,
      );

    const name =
      normalizeString(
        service.name,
      ) ||
      normalizeString(
        service.serviceName,
      );

    if (
      id
    ) {
      ids.push(
        id,
      );
    }

    if (
      name
    ) {
      services.push({
        ...(id
          ? {
              id,
            }
          : {}),

        name,

        icon:
          normalizeString(
            service.icon,
          ) ||
          undefined,

        color:
          normalizeString(
            service.color,
          ) ||
          undefined,

        backgroundColor:
          normalizeString(
            service.backgroundColor,
          ) ||
          undefined,
      });
    }
  }

  return {
    ids:
      Array.from(
        new Set(
          ids,
        ),
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
  const data =
    doc.data();

  /* ==========================================================
     WORKER PROFILE
  ========================================================== */

  const workerProfile =
    data.workerProfile &&
    typeof data.workerProfile ===
      "object" &&
    !Array.isArray(
      data.workerProfile,
    )
      ? data.workerProfile
      : {};

  /* ==========================================================
     FULL NAME
  ========================================================== */

  const suppliedFullName =
    normalizeString(
      data.fullName,
    ) ||
    normalizeString(
      workerProfile.fullName,
    ) ||
    normalizeString(
      data.displayName,
    ) ||
    normalizeString(
      data.name,
    );

  const rootFirstName =
    normalizeString(
      data.firstName,
    );

  const rootOtherName =
    normalizeString(
      data.otherName,
    );

  const rootSurname =
    normalizeString(
      data.surname,
    );

  const generatedFullName =
    [
      rootFirstName,
      rootOtherName,
      rootSurname,
    ]
      .filter(
        Boolean,
      )
      .join(
        " ",
      )
      .trim();

  const fullName =
    suppliedFullName ||
    generatedFullName;

  const nameParts =
    fullName
      .split(
        /\s+/,
      )
      .filter(
        Boolean,
      );

  const firstName =
    fullName
      ? nameParts[0] ??
        ""
      : rootFirstName;

  const surname =
    fullName
      ? nameParts
          .slice(
            1,
          )
          .join(
            " ",
          )
      : rootSurname;

  /* ==========================================================
     PROFILE PHOTO
  ========================================================== */

  const photoResult =
    resolveImageUrl(
      {
        source:
          "workerProfile.photoUrl",

        value:
          workerProfile.photoUrl,
      },

      {
        source:
          "workerProfile.photoURL",

        value:
          workerProfile.photoURL,
      },

      {
        source:
          "root.photoURL",

        value:
          data.photoURL,
      },

      {
        source:
          "root.photoUrl",

        value:
          data.photoUrl,
      },
    );

  const photoUrl =
    photoResult.url;

  const photoSource =
    photoResult.source;

  /* ==========================================================
     DEVELOPMENT IMAGE DIAGNOSTICS
  ========================================================== */

  if (
    __DEV__
  ) {
    const rawPhotoSources:
      ImageSource[] =
      [
        {
          source:
            "workerProfile.photoUrl",

          value:
            workerProfile.photoUrl,
        },

        {
          source:
            "workerProfile.photoURL",

          value:
            workerProfile.photoURL,
        },

        {
          source:
            "root.photoURL",

          value:
            data.photoURL,
        },

        {
          source:
            "root.photoUrl",

          value:
            data.photoUrl,
        },
      ];

    const rejected =
      rawPhotoSources.filter(
        (
          item,
        ) => {
          const value =
            normalizeString(
              item.value,
            );

          return (
            value.length >
              0 &&
            !normalizeImageUrl(
              value,
            )
          );
        },
      );

    if (
      rejected.length >
      0
    ) {
      console.warn(
        "WORKER_INVALID_IMAGE_URL_REJECTED:",
        {
          workerId:
            doc.id,

          values:
            rejected.map(
              (
                item,
              ) => ({
                source:
                  item.source,

                value:
                  normalizeString(
                    item.value,
                  ),
              }),
            ),
        },
      );
    }

    console.log(
      "WORKER_MAPPER_IMAGE:",
      {
        workerId:
          doc.id,

        workerName:
          fullName ||
          "Worker",

        photoUrl,

        photoSource,

        hasImage:
          Boolean(
            photoUrl,
          ),
      },
    );
  }

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
    new Map<
      string,
      WorkerService
    >();

  for (
    const service of
    [
      ...selectedServices.services,

      ...workerServices.services,

      ...profileServiceDetails.services,

      ...rootSelectedServices.services,

      ...rootServiceIds.services,
    ]
  ) {
    const key =
      service.id
        ?.trim() ||
      service.name.trim();

    if (
      !key
    ) {
      continue;
    }

    /*
     * Preserve only one service for
     * each ID/name.
     */
    if (
      !serviceMap.has(
        key,
      )
    ) {
      serviceMap.set(
        key,
        service,
      );
    }
  }

  const services =
    Array.from(
      serviceMap.values(),
    );

  /* ==========================================================
     LOCATION
  ========================================================== */

  const nestedLatitude =
    normalizeNullableNumber(
      workerProfile.latitude,
    );

  const nestedLongitude =
    normalizeNullableNumber(
      workerProfile.longitude,
    );

  const rootLatitude =
    normalizeNullableNumber(
      data.latitude,
    );

  const rootLongitude =
    normalizeNullableNumber(
      data.longitude,
    );

  const latitude =
    nestedLatitude ??
    rootLatitude;

  const longitude =
    nestedLongitude ??
    rootLongitude;

  /* ==========================================================
     LOCATION VALIDATION
  ========================================================== */

  const validLatitude =
    latitude !==
      null &&
    latitude >=
      -90 &&
    latitude <=
      90
      ? latitude
      : null;

  const validLongitude =
    longitude !==
      null &&
    longitude >=
      -180 &&
    longitude <=
      180
      ? longitude
      : null;

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    id:
      doc.id,

    fullName:
      fullName ||
      "Worker",

    firstName,

    surname,

    rating:
      normalizeRating(
        data.rating,
      ),

    totalReviews:
      normalizeNumber(
        data.reviewsCount,
      ),

    online:
      data.online ===
      true,

    verified:
      data.verified ===
      true,

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
      /*
       * Public mapper exposes only
       * HTTPS worker profile images.
       */
      photoUrl,

      /*
       * Phone number intentionally
       * does NOT leave this mapper.
       */

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
        ) ||
        normalizeString(
          data.state,
        ),

      lga:
        normalizeString(
          workerProfile.lga,
        ) ||
        normalizeString(
          data.lga,
        ),

      hourlyRate,

      latitude:
        validLatitude,

      longitude:
        validLongitude,

      geoPoint:
        workerProfile.geoPoint ??
        data.geoPoint ??
        null,

      geoHash:
        normalizeString(
          workerProfile.geoHash,
        ) ||
        normalizeString(
          data.geoHash,
        ),

      address:
        normalizeString(
          workerProfile.address,
        ) ||
        normalizeString(
          data.address,
        ),
    },
  };
}