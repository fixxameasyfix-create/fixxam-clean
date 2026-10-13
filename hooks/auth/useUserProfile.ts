import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  useAuth,
} from "@/hooks/useAuth";

/* ============================================================
   TYPES
============================================================ */

export type UserRole =
  | "customer"
  | "worker";

/* ============================================================
   USER LOCATION
============================================================ */

export type UserLocation = {
  latitude: number;

  longitude: number;

  accuracy?: number | null;

  area?: string | null;

  city?: string | null;

  state?: string | null;

  country?: string | null;

  label?: string | null;

  source?: "device";

  updatedAt?: Timestamp | null;
};

/* ============================================================
   WORKER PROFILE
============================================================ */

export type WorkerProfile = {
  photoUrl?: string;

  category: string;

  subcategory: string;

  experience: string;

  state: string;

  lga: string;

  hourlyRate: number;

  verified?: boolean;

  totalJobs?: number;

  completedJobs?: number;

  rating?: number;

  earnings?: number;
};

/* ============================================================
   USER PROFILE
============================================================ */

export type UserProfile = {
  uid: string;

  firstName: string;

  otherName?: string;

  surname: string;

  email: string;

  phone: string;

  photoUrl?: string;

  roles: UserRole[];

  activeRole: UserRole | null;

  online?: boolean;

  /* ==========================================================
     CUSTOMER LOCATION
  ========================================================== */

  location?: UserLocation;

  /* ==========================================================
     CUSTOMER STATISTICS
  ========================================================== */

  verified?: boolean;

  totalOrders?: number;

  savedCount?: number;

  totalReviews?: number;

  /* ==========================================================
     WORKER STATISTICS
  ========================================================== */

  totalJobs?: number;

  completedJobs?: number;

  rating?: number;

  earnings?: number;

  workerProfile?: WorkerProfile;
};

/* ============================================================
   HELPERS
============================================================ */

function normalizeRoles(
  value: unknown,
): UserRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter(
        (
          role,
        ): role is UserRole =>
          role === "customer" ||
          role === "worker",
      ),
    ),
  );
}

function normalizeActiveRole(
  value: unknown,
  roles: UserRole[],
): UserRole | null {
  if (
    value !== "customer" &&
    value !== "worker"
  ) {
    return null;
  }

  return roles.includes(value)
    ? value
    : null;
}

/* ============================================================
   LOCATION NORMALIZER
============================================================ */

function normalizeLocation(
  value: unknown,
): UserLocation | undefined {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return undefined;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  const latitude =
    data.latitude;

  const longitude =
    data.longitude;

  if (
    typeof latitude !== "number" ||
    !Number.isFinite(
      latitude,
    ) ||
    typeof longitude !== "number" ||
    !Number.isFinite(
      longitude,
    )
  ) {
    return undefined;
  }

  const accuracy =
    typeof data.accuracy === "number" &&
    Number.isFinite(
      data.accuracy,
    )
      ? data.accuracy
      : null;

  const area =
    typeof data.area === "string"
      ? data.area.trim() || null
      : null;

  const city =
    typeof data.city === "string"
      ? data.city.trim() || null
      : null;

  const state =
    typeof data.state === "string"
      ? data.state.trim() || null
      : null;

  const country =
    typeof data.country === "string"
      ? data.country.trim() || null
      : null;

  const label =
    typeof data.label === "string"
      ? data.label.trim() || null
      : null;

  return {
    latitude,
    longitude,

    accuracy,

    area,
    city,
    state,
    country,
    label,

    source:
      data.source === "device"
        ? "device"
        : undefined,

    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt
        : null,
  };
}

/* ============================================================
   PHOTO NORMALIZER
============================================================ */

function normalizePhotoUrl(
  data: Record<
    string,
    unknown
  >,
): string | undefined {
  /*
   * New canonical field:
   * photoUrl
   */

  if (
    typeof data.photoUrl === "string" &&
    data.photoUrl.trim()
  ) {
    return data.photoUrl.trim();
  }

  /*
   * Backward compatibility:
   * older profiles may still contain photoURL.
   */

  if (
    typeof data.photoURL === "string" &&
    data.photoURL.trim()
  ) {
    return data.photoURL.trim();
  }

  return undefined;
}

/* ============================================================
   HOOK
============================================================ */

export default function useUserProfile() {
  const {
    user,
  } = useAuth();

  const [
    profile,
    setProfile,
  ] =
    useState<UserProfile | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  /* ==========================================================
     USER PROFILE LISTENER
  ========================================================== */

  useEffect(() => {
    const userId =
      user?.uid;

    if (!userId) {
      setProfile(null);
      setLoading(false);

      return;
    }

    setLoading(true);

    const userRef =
      doc(
        db,
        "users",
        userId,
      );

    const unsubscribe =
      onSnapshot(
        userRef,

        (snapshot) => {
          if (!snapshot.exists()) {
            setProfile(null);
            setLoading(false);

            return;
          }

          const data =
            snapshot.data();

          /*
           * IMPORTANT:
           *
           * Never default a missing/invalid role
           * to "customer".
           *
           * Role ownership must come directly from
           * the Firestore users/{uid}.roles field.
           */

          const roles =
            normalizeRoles(
              data.roles,
            );

          const activeRole =
            normalizeActiveRole(
              data.activeRole,
              roles,
            );

          const location =
            normalizeLocation(
              data.location,
            );

          const photoUrl =
            normalizePhotoUrl(
              data,
            );

          setProfile({
            uid:
              snapshot.id,

            firstName:
              typeof data.firstName ===
              "string"
                ? data.firstName
                : "",

            otherName:
              typeof data.otherName ===
              "string"
                ? data.otherName
                : undefined,

            surname:
              typeof data.surname ===
              "string"
                ? data.surname
                : "",

            email:
              typeof data.email ===
              "string"
                ? data.email
                : "",

            phone:
              typeof data.phone ===
              "string"
                ? data.phone
                : "",

            photoUrl,

            roles,

            activeRole,

            online:
              typeof data.online ===
              "boolean"
                ? data.online
                : undefined,

            location,

            verified:
              typeof data.verified ===
              "boolean"
                ? data.verified
                : undefined,

            totalOrders:
              typeof data.totalOrders ===
                "number" &&
              Number.isFinite(
                data.totalOrders,
              )
                ? data.totalOrders
                : undefined,

            savedCount:
              typeof data.savedCount ===
                "number" &&
              Number.isFinite(
                data.savedCount,
              )
                ? data.savedCount
                : undefined,

            totalReviews:
              typeof data.totalReviews ===
                "number" &&
              Number.isFinite(
                data.totalReviews,
              )
                ? data.totalReviews
                : undefined,

            totalJobs:
              typeof data.totalJobs ===
                "number" &&
              Number.isFinite(
                data.totalJobs,
              )
                ? data.totalJobs
                : undefined,

            completedJobs:
              typeof data.completedJobs ===
                "number" &&
              Number.isFinite(
                data.completedJobs,
              )
                ? data.completedJobs
                : undefined,

            rating:
              typeof data.rating ===
                "number" &&
              Number.isFinite(
                data.rating,
              )
                ? data.rating
                : undefined,

            earnings:
              typeof data.earnings ===
                "number" &&
              Number.isFinite(
                data.earnings,
              )
                ? data.earnings
                : undefined,

            workerProfile:
              data.workerProfile &&
              typeof data.workerProfile ===
                "object"
                ? (
                    data.workerProfile as WorkerProfile
                  )
                : undefined,
          });

          setLoading(false);
        },

        (error) => {
          console.error(
            "USE_USER_PROFILE_ERROR:",
            error,
          );

          setProfile(null);
          setLoading(false);
        },
      );

    return unsubscribe;
  }, [
    user?.uid,
  ]);

  return {
    profile,
    loading,
  };
}