import {
  collection,
  documentId,
  getDocs,
  orderBy,
  query,
  where,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";

import { db } from "@/firebase/config";

const servicesCollection = collection(
  db,
  "services",
);

export function getServices(
  categoryId: string,
  subcategoryId: string,
): Promise<
  QuerySnapshot<DocumentData>
> {
  return getDocs(
    query(
      servicesCollection,
      where(
        "categoryId",
        "==",
        categoryId.trim(),
      ),
      where(
        "subcategoryId",
        "==",
        subcategoryId.trim(),
      ),
      orderBy("name", "asc"),
    ),
  );
}

export function getServicesBySubcategory(
  categoryId: string,
  subcategoryId: string,
): Promise<
  QuerySnapshot<DocumentData>
> {
  return getServices(
    categoryId,
    subcategoryId,
  );
}

export function getWorkerServices(
  serviceIds: string[],
): Promise<
  QuerySnapshot<DocumentData>
> {
  const normalizedIds =
    Array.from(
      new Set(
        serviceIds
          .filter(
            (id): id is string =>
              typeof id === "string",
          )
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    );

  if (!normalizedIds.length) {
    return getDocs(
      query(
        servicesCollection,
        where(
          documentId(),
          "in",
          ["__no_service__"],
        ),
      ),
    );
  }

  return getDocs(
    query(
      servicesCollection,
      where(
        documentId(),
        "in",
        normalizedIds.slice(0, 10),
      ),
    ),
  );
}