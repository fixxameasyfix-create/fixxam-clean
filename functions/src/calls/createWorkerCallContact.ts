import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

const db = getFirestore();

type CallSnapshot = {
  name?: unknown;
  image?: unknown;
  service?: unknown;
};

type CallDocument = {
  callerId: string;
  callerRole: "customer" | "worker";
  calleeId: string;
  calleeRole: "customer" | "worker";
  callerSnapshot?: CallSnapshot | null;
  calleeSnapshot?: CallSnapshot | null;
  status: string;
};

type CustomerProfile = {
  name?: unknown;
  displayName?: unknown;
  fullName?: unknown;
  image?: unknown;
  photoURL?: unknown;
  avatarUrl?: unknown;
  profileImage?: unknown;
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
    const normalized = cleanString(value);

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeImage(
  value: unknown,
): string {
  const image = cleanString(value);

  if (!image) {
    return "";
  }

  /*
   * Keep only safe image URL formats.
   *
   * Firebase Storage URLs and normal HTTPS
   * profile URLs are supported.
   */
  if (
    image.startsWith("https://") ||
    image.startsWith("http://") ||
    image.startsWith("gs://")
  ) {
    return image.slice(0, 2048);
  }

  return "";
}

export const createWorkerCallContact =
  onDocumentUpdated(
    "calls/{callId}",
    async (event) => {
      const before =
        event.data?.before.data() as
          | CallDocument
          | undefined;

      const after =
        event.data?.after.data() as
          | CallDocument
          | undefined;

      if (!before || !after) {
        return;
      }

      /*
       * Only create/update the worker contact
       * when the call becomes connected.
       */
      if (
        before.status === "connected" ||
        after.status !== "connected"
      ) {
        return;
      }

      /*
       * Only:
       *
       * customer → worker
       */
      if (
        after.callerRole !== "customer" ||
        after.calleeRole !== "worker"
      ) {
        return;
      }

      const customerId =
        cleanString(after.callerId);

      const workerId =
        cleanString(after.calleeId);

      if (
        !customerId ||
        !workerId ||
        customerId === workerId
      ) {
        return;
      }

      /*
       * Existing FIXXAM structure:
       *
       * workerContacts/{workerId}/customers/{customerId}
       *
       * This MUST match MyContactsScreen/service.
       */
      const contactRef = db
        .collection("workerContacts")
        .doc(workerId)
        .collection("customers")
        .doc(customerId);

      /*
       * First use the snapshot attached to the call.
       */
      const callerSnapshot =
        after.callerSnapshot ?? {};

      let customerName = firstString(
        callerSnapshot.name,
      );

      let customerImage =
        normalizeImage(
          callerSnapshot.image,
        );

      /*
       * If the call snapshot does not contain
       * customer information, load the customer's
       * account profile as the trusted fallback.
       */
      if (!customerName || !customerImage) {
        const customerRef = db
          .collection("users")
          .doc(customerId);

        const customerSnapshot =
          await customerRef.get();

        if (customerSnapshot.exists) {
          const profile =
            customerSnapshot.data() as CustomerProfile;

          if (!customerName) {
            customerName = firstString(
              profile.name,
              profile.displayName,
              profile.fullName,
            );
          }

          if (!customerImage) {
            customerImage =
              normalizeImage(
                firstString(
                  profile.image,
                  profile.photoURL,
                  profile.avatarUrl,
                  profile.profileImage,
                ),
              );
          }
        }
      }

      /*
       * Never store an empty customer name.
       */
      if (!customerName) {
        customerName = "Fixxam Customer";
      }

      /*
       * Keep the document small and predictable.
       */
      customerName =
        customerName.slice(0, 120);

      await contactRef.set(
        {
          customerId,
          name: customerName,
          image: customerImage,

          contactedAt:
            FieldValue.serverTimestamp(),

          updatedAt:
            FieldValue.serverTimestamp(),

          source: "customer_call",

          lastCallId:
            event.params.callId,
        },
        {
          merge: true,
        },
      );

      console.log(
        "FIXXAM_WORKER_CONTACT_CREATED",
        {
          workerId,
          customerId,
          customerName,
          hasImage: Boolean(customerImage),
          callId: event.params.callId,
        },
      );
    },
  );