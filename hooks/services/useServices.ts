import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
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

export interface ServiceItem {
  id: string;

  name: string;

  icon: string;

  color: string;

  backgroundColor: string;

  categoryId: string;

  subcategoryId: string;

  fulfillmentMode:
    ServiceFulfillmentMode;

  bookingCount: number;

  completedCount: number;

  active: boolean;
}

/* ============================================================
   NORMALIZE ID
============================================================ */

function normalizeId(
  value: unknown,
): string {
  return String(
    value ?? "",
  )
    .trim()
    .toLowerCase();
}

/* ============================================================
   SAFE NUMBER
============================================================ */

function normalizeCount(
  value: unknown,
): number {
  const parsed =
    typeof value ===
    "number"
      ? value
      : Number(value);

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    parsed,
  );
}

/* ============================================================
   HOOK
============================================================ */

export default function useServices(
  search: string,
  categoryId?: string,
) {
  const [
    services,
    setServices,
  ] =
    useState<
      ServiceItem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  /* ==========================================================
     LOAD SERVICES
  ========================================================== */

  useEffect(() => {
    setLoading(true);

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
          "bookingCount",
          "desc",
        ),
      );

    const unsubscribe =
      onSnapshot(
        servicesQuery,

        (snapshot) => {
          const data:
            ServiceItem[] =
            snapshot.docs.map(
              (
                serviceDoc,
              ) => {
                const item =
                  serviceDoc.data();

                /* ==============================================
                   FULFILLMENT MODE
                ============================================== */

                const fulfillmentMode:
                  ServiceFulfillmentMode =
                  isServiceFulfillmentMode(
                    item.fulfillmentMode,
                  )
                    ? item.fulfillmentMode
                    : "needs_review";

                return {
                  /* ============================================
                     ID
                  ============================================ */

                  id:
                    serviceDoc.id,

                  /* ============================================
                     SERVICE
                  ============================================ */

                  name:
                    typeof item.name ===
                    "string"
                      ? item.name.trim()
                      : "",

                  icon:
                    typeof item.icon ===
                    "string" &&
                    item.icon.trim()
                      ? item.icon.trim()
                      : "tools",

                  color:
                    typeof item.color ===
                    "string" &&
                    item.color.trim()
                      ? item.color.trim()
                      : "#2563EB",

                  backgroundColor:
                    typeof item.backgroundColor ===
                      "string" &&
                    item.backgroundColor.trim()
                      ? item.backgroundColor.trim()
                      : "#EFF6FF",

                  /* ============================================
                     RELATIONSHIPS
                  ============================================ */

                  categoryId:
                    typeof item.categoryId ===
                    "string"
                      ? item.categoryId.trim()
                      : "",

                  subcategoryId:
                    typeof item.subcategoryId ===
                    "string"
                      ? item.subcategoryId.trim()
                      : "",

                  /* ============================================
                     FULFILLMENT
                  ============================================ */

                  fulfillmentMode,

                  /* ============================================
                     COUNTS
                  ============================================ */

                  bookingCount:
                    normalizeCount(
                      item.bookingCount,
                    ),

                  completedCount:
                    normalizeCount(
                      item.completedCount,
                    ),

                  /* ============================================
                     STATUS
                  ============================================ */

                  active:
                    item.active !==
                    false,
                };
              },
            );

          setServices(
            data,
          );

          setLoading(
            false,
          );
        },

        (error) => {
          console.error(
            "Failed to load services:",
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

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredServices =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      const selectedCategory =
        normalizeId(
          categoryId,
        );

      return services.filter(
        (service) => {
          /* ----------------------------------------------------
             SEARCH
          ---------------------------------------------------- */

          const matchesSearch =
            keyword.length ===
              0 ||
            service.name
              .toLowerCase()
              .includes(
                keyword,
              );

          if (
            !matchesSearch
          ) {
            return false;
          }

          /* ----------------------------------------------------
             ALL
          ---------------------------------------------------- */

          if (
            selectedCategory.length ===
              0 ||
            selectedCategory ===
              "all"
          ) {
            return true;
          }

          /* ----------------------------------------------------
             CATEGORY
          ---------------------------------------------------- */

          const serviceCategory =
            normalizeId(
              service.categoryId,
            );

          return (
            serviceCategory ===
            selectedCategory
          );
        },
      );
    }, [
      services,
      search,
      categoryId,
    ]);

  /* ==========================================================
     RESULT
  ========================================================== */

  return {
    services:
      filteredServices,

    loading,
  };
}