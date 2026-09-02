import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  serviceMapper,
  type ServiceCardData,
} from "@/firebase/mappers/serviceMapper";

/* ==============================================================
   GET SERVICES BY IDS
============================================================== */

export async function getServicesByIds(
  serviceIds: string[],
): Promise<ServiceCardData[]> {
  const cleanIds = Array.from(
    new Set(
      serviceIds
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );

  if (cleanIds.length === 0) {
    return [];
  }

  /*
   * Firestore `in` queries have a limit on the
   * number of values. We only need up to 4 here,
   * but chunking keeps this query reusable.
   */

  const chunks: string[][] = [];

  for (
    let index = 0;
    index < cleanIds.length;
    index += 30
  ) {
    chunks.push(
      cleanIds.slice(
        index,
        index + 30,
      ),
    );
  }

  const results =
    await Promise.all(
      chunks.map(async (chunk) => {
        const servicesQuery =
          query(
            collection(
              db,
              "services",
            ),
            where(
              documentId(),
              "in",
              chunk,
            ),
          );

        const snapshot =
          await getDocs(
            servicesQuery,
          );

        return snapshot.docs.map(
          serviceMapper,
        );
      }),
    );

  /*
   * Keep the same order as the IDs
   * stored on the worker.
   */

  const services =
    results.flat();

  const serviceMap =
    new Map(
      services.map(
        (service) => [
          service.id,
          service,
        ],
      ),
    );

  return cleanIds
    .map((id) =>
      serviceMap.get(id),
    )
    .filter(
      (
        service,
      ): service is ServiceCardData =>
        service !== undefined,
    );
}