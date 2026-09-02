import { getFirestore } from "firebase-admin/firestore";

import { SearchableService } from "./types";

const COLLECTION = "services";

function mapService(
  id: string,
  data: FirebaseFirestore.DocumentData,
): SearchableService {
  return {
    id,

    name:
      typeof data.name === "string"
        ? data.name
        : "",

    categoryId:
      typeof data.categoryId === "string"
        ? data.categoryId
        : "",

    categoryName:
      typeof data.categoryName === "string"
        ? data.categoryName
        : "",

    subcategoryId:
      typeof data.subcategoryId === "string"
        ? data.subcategoryId
        : "",

    subcategoryName:
      typeof data.subcategoryName === "string"
        ? data.subcategoryName
        : "",

    description:
      typeof data.description === "string"
        ? data.description
        : "",

    keywords: Array.isArray(
      data.keywords,
    )
      ? data.keywords.filter(
          (
            value,
          ): value is string =>
            typeof value ===
            "string",
        )
      : [],

    active:
      data.active === true,
  };
}

async function queryServices(
  query: FirebaseFirestore.Query,
): Promise<SearchableService[]> {
  const snapshot =
    await query.get();

  return snapshot.docs.map(
    (doc) =>
      mapService(
        doc.id,
        doc.data(),
      ),
  );
}

export async function getServicesByCategory(
  categoryId: string,
): Promise<SearchableService[]> {
  return queryServices(
    getFirestore()
      .collection(COLLECTION)
      .where(
        "active",
        "==",
        true,
      )
      .where(
        "categoryId",
        "==",
        categoryId,
      ),
  );
}

export async function getServicesBySubcategory(
  subcategoryId: string,
): Promise<SearchableService[]> {
  return queryServices(
    getFirestore()
      .collection(COLLECTION)
      .where(
        "active",
        "==",
        true,
      )
      .where(
        "subcategoryId",
        "==",
        subcategoryId,
      ),
  );
}

export async function getActiveServices(): Promise<
  SearchableService[]
> {
  return queryServices(
    getFirestore()
      .collection(COLLECTION)
      .where(
        "active",
        "==",
        true,
      ),
  );
}