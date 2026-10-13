import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

/* ============================================================
   WORKER PROFILE
============================================================ */

export type WorkerProfile = {
  uid: string;

  fullName: string;

  firstName: string;

  otherName: string;

  surname: string;

  photoUrl: string;

  location: string;

  rating: number;

  online: boolean;

  available: boolean;

  category: string;

  subcategory: string;

  experience: string;

  hourlyRate: number;

  selectedServices: string[];

  workGallery: string[];
};

/* ============================================================
   HELPERS
============================================================ */

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

function getStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item ===
        "string",
    )
    .map(
      item =>
        item.trim(),
    )
    .filter(Boolean);
}

/* ============================================================
   HOOK
============================================================ */

export default function useWorkerProfile(
  workerId?: string,
) {
  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    worker,
    setWorker,
  ] =
    useState<WorkerProfile | null>(
      null,
    );

  useEffect(() => {
    const normalizedWorkerId =
      cleanString(
        workerId,
      );

    if (!normalizedWorkerId) {
      setWorker(null);
      setLoading(false);

      return;
    }

    setLoading(true);

    /*
     * Customer-facing worker profile.
     *
     * Worker Update Profile publishes
     * customer-facing information to:
     *
     * workerPublicProfiles/{workerId}
     */
    const workerRef =
      doc(
        db,
        "workerPublicProfiles",
        normalizedWorkerId,
      );

    const unsubscribe =
      onSnapshot(
        workerRef,

        snapshot => {
          if (
            !snapshot.exists()
          ) {
            setWorker(null);
            setLoading(false);

            return;
          }

          const data =
            snapshot.data();

          const profile =
            data.workerProfile &&
            typeof data.workerProfile ===
              "object" &&
            !Array.isArray(
              data.workerProfile,
            )
              ? (
                  data.workerProfile as Record<
                    string,
                    unknown
                  >
                )
              : {};

          /* ==================================================
             NAME
          ================================================== */

          const fullName =
            cleanString(
              data.fullName,
            ) ||
            cleanString(
              profile.fullName,
            ) ||
            cleanString(
              data.name,
            );

          /*
           * Legacy fields are preserved
           * for older screens.
           */
          const firstName =
            cleanString(
              data.firstName,
            );

          const otherName =
            cleanString(
              data.otherName,
            );

          const surname =
            cleanString(
              data.surname,
            );

          /* ==================================================
             PHOTO
          ================================================== */

          const photoUrl =
            cleanString(
              data.photoUrl,
            ) ||
            cleanString(
              profile.photoUrl,
            ) ||
            cleanString(
              data.photoURL,
            ) ||
            cleanString(
              profile.photoURL,
            );

          /* ==================================================
             LOCATION
          ================================================== */

          const location =
            cleanString(
              data.location,
            ) ||
            cleanString(
              profile.location,
            );

          /* ==================================================
             RATING
          ================================================== */

          const rawRating =
            Number(
              data.rating,
            );

          const rating =
            Number.isFinite(
              rawRating,
            ) &&
            rawRating > 0
              ? Math.min(
                  5,
                  Math.max(
                    0,
                    rawRating,
                  ),
                )
              : 0;

          /* ==================================================
             HOURLY RATE
          ================================================== */

          const rootHourlyRate =
            Number(
              data.hourlyRate,
            );

          const profileHourlyRate =
            Number(
              profile.hourlyRate,
            );

          const hourlyRate =
            Number.isFinite(
              rootHourlyRate,
            ) &&
            rootHourlyRate >= 0
              ? rootHourlyRate
              : Number.isFinite(
                    profileHourlyRate,
                  ) &&
                  profileHourlyRate >= 0
                ? profileHourlyRate
                : 0;

          /* ==================================================
             EXPERIENCE
          ================================================== */

          const experience =
            cleanString(
              profile.experience,
            ) ||
            cleanString(
              data.experience,
            );

          /* ==================================================
             CATEGORY
          ================================================== */

          const category =
            cleanString(
              profile.category,
            ) ||
            cleanString(
              data.category,
            );

          const subcategory =
            cleanString(
              profile.subcategory,
            ) ||
            cleanString(
              data.subcategory,
            );

          /* ==================================================
             SELECTED SERVICES
          ================================================== */

          const rawSelectedServices =
            Array.isArray(
              profile.selectedServices,
            )
              ? profile.selectedServices
              : Array.isArray(
                    data.selectedServices,
                  )
                ? data.selectedServices
                : [];

          const selectedServices =
            rawSelectedServices
              .filter(
                (
                  service,
                ): service is string =>
                  typeof service ===
                  "string",
              )
              .map(
                service =>
                  service.trim(),
              )
              .filter(Boolean);

          /* ==================================================
             WORK GALLERY
          ================================================== */

          /*
           * Primary source:
           *
           * workerPublicProfiles/{uid}
           *   .workerProfile.workGallery
           *
           * Fallback:
           *
           * workerPublicProfiles/{uid}
           *   .workGallery
           */
          const rawWorkGallery =
            Array.isArray(
              profile.workGallery,
            )
              ? profile.workGallery
              : Array.isArray(
                    data.workGallery,
                  )
                ? data.workGallery
                : [];

          const workGallery =
            getStringArray(
              rawWorkGallery,
            );

          /* ==================================================
             PUBLIC WORKER PROFILE
          ================================================== */

          setWorker({
            uid:
              snapshot.id,

            fullName,

            firstName,

            otherName,

            surname,

            photoUrl,

            location,

            rating,

            online:
              data.online ===
              true,

            available:
              data.available !==
              false,

            category,

            subcategory,

            experience,

            hourlyRate,

            selectedServices,

            workGallery,
          });

          setLoading(false);
        },

        error => {
          console.error(
            "LOAD_WORKER_PROFILE_ERROR:",
            error,
          );

          setWorker(null);

          setLoading(false);
        },
      );

    return unsubscribe;
  }, [
    workerId,
  ]);

  return {
    loading,
    worker,
  };
}