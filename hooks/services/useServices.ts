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

import { db } from "@/firebase/config";

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
   HOOK
============================================================ */

export default function useServices(
  search: string,
  categoryId?: string,
) {
  const [
    services,
    setServices,
  ] = useState<ServiceItem[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

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
          const data: ServiceItem[] =
            snapshot.docs.map(
              (serviceDoc) => {
                const item =
                  serviceDoc.data();

                return {
                  id:
                    serviceDoc.id,

                  name:
                    typeof item.name ===
                    "string"
                      ? item.name.trim()
                      : "",

                  icon:
                    typeof item.icon ===
                    "string"
                      ? item.icon
                      : "tools",

                  color:
                    typeof item.color ===
                    "string"
                      ? item.color
                      : "#2563EB",

                  backgroundColor:
                    typeof item.backgroundColor ===
                    "string"
                      ? item.backgroundColor
                      : "#EFF6FF",

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

                  bookingCount:
                    Number(
                      item.bookingCount ??
                        0,
                    ),

                  completedCount:
                    Number(
                      item.completedCount ??
                        0,
                    ),

                  active:
                    item.active !==
                    false,
                };
              },
            );

          setServices(data);
          setLoading(false);
        },
        (error) => {
          console.error(
            "Failed to load services:",
            error,
          );

          setServices([]);
          setLoading(false);
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
            keyword.length === 0 ||
            service.name
              .toLowerCase()
              .includes(keyword);

          if (!matchesSearch) {
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