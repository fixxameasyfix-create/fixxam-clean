import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

const WORKER_CONTACTS_COLLECTION = "workerContacts";
const CUSTOMERS_SUBCOLLECTION = "customers";
const CONTACTS_LIMIT = 50;

export type RecentlyContactedCustomer = {
  id: string;
  name: string;
  image: string;
  service: string;
  contactedAt: Date | null;
};

function cleanString(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanImage(value: unknown): string {
  const image = cleanString(value);

  if (
    image.startsWith("https://") ||
    image.startsWith("http://")
  ) {
    return image;
  }

  return "";
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    try {
      const date = (
        value as {
          toDate: () => Date;
        }
      ).toDate();

      return date instanceof Date &&
        !Number.isNaN(date.getTime())
        ? date
        : null;
    } catch {
      return null;
    }
  }

  return null;
}

export async function getRecentlyContactedCustomers(
  workerId: string,
): Promise<RecentlyContactedCustomer[]> {
  const normalizedWorkerId =
    cleanString(workerId);

  if (!normalizedWorkerId) {
    return [];
  }

  const customersRef = collection(
    db,
    WORKER_CONTACTS_COLLECTION,
    normalizedWorkerId,
    CUSTOMERS_SUBCOLLECTION,
  );

  const customersQuery = query(
    customersRef,
    orderBy(
      "contactedAt",
      "desc",
    ),
    limit(CONTACTS_LIMIT),
  );

  const snapshot =
    await getDocs(customersQuery);

  return snapshot.docs.map(
    (customerDoc) => {
      const data =
        customerDoc.data();

      return {
        id:
          cleanString(
            data.customerId,
          ) ||
          customerDoc.id,

        name:
          cleanString(
            data.name,
          ) ||
          "Fixxam Customer",

        image:
          cleanImage(
            data.image ??
              data.photoURL ??
              data.photoUrl ??
              data.profileImage,
          ),

        service:
          cleanString(
            data.service,
          ),

        contactedAt:
          toDate(
            data.contactedAt,
          ),
      };
    },
  );
}