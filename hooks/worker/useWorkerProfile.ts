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
};

/* ============================================================
   HOOK
============================================================ */

export default function useWorkerProfile(
  workerId?: string,
) {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    worker,
    setWorker,
  ] = useState<WorkerProfile | null>(
    null,
  );

  useEffect(() => {
    if (!workerId?.trim()) {
      setWorker(null);
      setLoading(false);

      return;
    }

    setLoading(true);

    /*
     * IMPORTANT:
     *
     * Worker public profiles are stored as:
     *
     * workerPublicProfiles/{workerId}
     *
     * Do NOT read:
     *
     * users/{workerId}
     *
     * because that collection contains private
     * worker/customer information.
     */
    const workerRef = doc(
      db,
      "workerPublicProfiles",
      workerId,
    );

    const unsubscribe = onSnapshot(
      workerRef,

      (snapshot) => {
        if (!snapshot.exists()) {
          setWorker(null);
          setLoading(false);

          return;
        }

        const data =
          snapshot.data();

        const profile =
          data.workerProfile ?? {};

        const firstName =
          typeof data.firstName === "string"
            ? data.firstName
            : "";

        const otherName =
          typeof data.otherName === "string"
            ? data.otherName
            : "";

        const surname =
          typeof data.surname === "string"
            ? data.surname
            : "";

        const state =
          typeof profile
            .serviceDetails?.state ===
            "string"
            ? profile.serviceDetails.state
            : "";

        const location =
          state.trim();

        const rating =
          typeof data.rating === "number" &&
          Number.isFinite(data.rating)
            ? data.rating
            : 0;

        const hourlyRate =
          typeof profile.hourlyRate ===
            "number" &&
          Number.isFinite(
            profile.hourlyRate,
          )
            ? profile.hourlyRate
            : 0;

        const selectedServices =
          Array.isArray(
            profile.selectedServices,
          )
            ? profile.selectedServices.filter(
                (
                  service: unknown,
                ): service is string =>
                  typeof service ===
                  "string",
              )
            : [];

        setWorker({
          uid: snapshot.id,

          firstName,

          otherName,

          surname,

          photoUrl:
            typeof profile.photoUrl ===
            "string"
              ? profile.photoUrl
              : "",

          location,

          rating,

          online:
            data.online === true,

          available:
            data.available !== false,

          category:
            typeof profile.category ===
            "string"
              ? profile.category
              : "",

          subcategory:
            typeof profile.subcategory ===
            "string"
              ? profile.subcategory
              : "",

          experience:
            typeof profile.experience ===
            "string"
              ? profile.experience
              : "",

          hourlyRate,

          selectedServices,
        });

        setLoading(false);
      },

      (error) => {
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