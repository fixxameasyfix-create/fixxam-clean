import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  isServiceFulfillmentMode,
  type ServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

/* ============================================================
   TYPES
============================================================ */

export interface PopularService {
  id: string;

  name: string;

  icon: string;

  color: string;

  backgroundColor: string;

  categoryId: string;

  subcategoryId: string;

  fulfillmentMode:
    ServiceFulfillmentMode;

  order: number;

  bookingCount: number;

  completedCount: number;

  active: boolean;
}

/* ============================================================
   DEFAULTS
============================================================ */

const DEFAULT_ICON =
  "tools";

const DEFAULT_COLOR =
  "#2563EB";

const DEFAULT_BACKGROUND_COLOR =
  "#EFF6FF";

/* ============================================================
   HELPERS
============================================================ */

function toString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function toNumber(
  value: unknown,
): number {
  return typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
    ? value
    : 0;
}

/* ============================================================
   HOOK
============================================================ */

export default function usePopularServices() {
  const [
    services,
    setServices,
  ] =
    useState<
      PopularService[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  useEffect(() => {
    /*
     * Most booked services are based
     * on completed bookings.
     *
     * completedCount was populated by
     * migrateCompletedServiceCounts.ts
     */

    const servicesQuery =
      query(
        collection(
          db,
          "services",
        ),

        where(
          "active",
          "==",
          true,
        ),

        orderBy(
          "completedCount",
          "desc",
        ),

        limit(10),
      );

    const unsubscribe =
      onSnapshot(
        servicesQuery,

        (
          snapshot,
        ) => {
          const nextServices:
            PopularService[] =
            snapshot.docs.map(
              (
                serviceDoc,
              ) => {
                const data =
                  serviceDoc.data();

                const fulfillmentMode =
                  isServiceFulfillmentMode(
                    data.fulfillmentMode,
                  )
                    ? data.fulfillmentMode
                    : "needs_review";

                return {
                  id:
                    serviceDoc.id,

                  name:
                    toString(
                      data.name,
                    ),

                  icon:
                    toString(
                      data.icon,
                    ) ||
                    DEFAULT_ICON,

                  color:
                    toString(
                      data.color,
                    ) ||
                    DEFAULT_COLOR,

                  backgroundColor:
                    toString(
                      data.backgroundColor,
                    ) ||
                    DEFAULT_BACKGROUND_COLOR,

                  categoryId:
                    toString(
                      data.categoryId,
                    ),

                  subcategoryId:
                    toString(
                      data.subcategoryId,
                    ),

                  fulfillmentMode,

                  order:
                    toNumber(
                      data.order,
                    ),

                  bookingCount:
                    toNumber(
                      data.bookingCount,
                    ),

                  completedCount:
                    toNumber(
                      data.completedCount,
                    ),

                  active:
                    data.active ===
                    true,
                };
              },
            );

          setServices(
            nextServices,
          );

          setLoading(
            false,
          );
        },

        (
          error,
        ) => {
          console.error(
            "Failed to load most booked services:",
            error,
          );

          setServices(
            [],
          );

          setLoading(
            false,
          );
        },
      );

    return unsubscribe;
  }, []);

  return {
    services,
    loading,
  };
}