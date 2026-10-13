import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

import { getAuth } from "firebase/auth";

const COLLECTION_NAME = "workerContacts";
const CUSTOMERS_SUBCOLLECTION = "customers";
const CONTACTS_LIMIT = 50;

export type RecentlyContactedCustomer = {
  id: string;
  name: string;
  image: string;
  contactedAt: string;
};

function cleanString(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function firstString(
  ...values: unknown[]
): string {
  for (const value of values) {
    const result = cleanString(value);

    if (result) {
      return result;
    }
  }

  return "";
}

function normalizeName(
  data: Record<string, unknown>,
): string {
  const snapshot =
    data.customerSnapshot;

  const snapshotData =
    snapshot &&
    typeof snapshot === "object"
      ? (snapshot as Record<
          string,
          unknown
        >)
      : null;

  return (
    firstString(
      data.name,
      data.customerName,
      data.displayName,
      data.fullName,

      snapshotData?.name,
      snapshotData?.customerName,
      snapshotData?.displayName,
      snapshotData?.fullName,
    ) ||
    "Fixxam Customer"
  );
}

function normalizeImage(
  data: Record<string, unknown>,
): string {
  const snapshot =
    data.customerSnapshot;

  const snapshotData =
    snapshot &&
    typeof snapshot === "object"
      ? (snapshot as Record<
          string,
          unknown
        >)
      : null;

  return firstString(
    data.image,
    data.customerImage,
    data.photoURL,
    data.photoUrl,
    data.avatar,

    snapshotData?.image,
    snapshotData?.customerImage,
    snapshotData?.photoURL,
    snapshotData?.photoUrl,
    snapshotData?.avatar,
  );
}

function timestampToIso(
  value: unknown,
): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);

    if (Number.isFinite(parsed)) {
      return new Date(
        parsed,
      ).toISOString();
    }
  }

  return new Date().toISOString();
}

export async function getRecentlyContactedCustomers(
  workerId?: string,
): Promise<
  RecentlyContactedCustomer[]
> {
  const authUser =
    getAuth().currentUser;

  const normalizedWorkerId =
    cleanString(
      workerId ??
        authUser?.uid,
    );

  if (!normalizedWorkerId) {
    return [];
  }

  /*
   * Security:
   * A worker can only request their own
   * contact list.
   */
  if (
    authUser?.uid &&
    authUser.uid !== normalizedWorkerId
  ) {
    throw new Error(
      "Unauthorized contact access.",
    );
  }

  const db = getFirestore();

  const contactsRef =
    collection(
      db,
      COLLECTION_NAME,
      normalizedWorkerId,
      CUSTOMERS_SUBCOLLECTION,
    );

  const contactsQuery =
    query(
      contactsRef,
      orderBy(
        "contactedAt",
        "desc",
      ),
      limit(
        CONTACTS_LIMIT,
      ),
    );

  const snapshot =
    await getDocs(
      contactsQuery,
    );

  return snapshot.docs.map(
    (contactDoc) => {
      const data =
        contactDoc.data();

      return {
        id:
          firstString(
            data.customerId,
            data.id,
          ) ||
          contactDoc.id,

        name:
          normalizeName(data),

        image:
          normalizeImage(data),

        contactedAt:
          timestampToIso(
            data.contactedAt,
          ),
      };
    },
  );
}