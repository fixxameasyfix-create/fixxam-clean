import {
  collection,
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
   GET SERVICES BY SUBCATEGORY
============================================================== */

export async function getServicesBySubcategory(
  subcategoryId: string,
): Promise<ServiceCardData[]> {
  const cleanSubcategoryId =
    subcategoryId.trim();

  if (!cleanSubcategoryId) {
    return [];
  }

  const servicesQuery = query(
    collection(db, "services"),
    where(
      "subcategoryId",
      "==",
      cleanSubcategoryId,
    ),
  );

  const snapshot =
    await getDocs(servicesQuery);

  return snapshot.docs.map(
    serviceMapper,
  );
}