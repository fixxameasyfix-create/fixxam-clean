import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
TYPES
============================================================ */

export type FixxamCallRole =
  | "customer"
  | "worker";

export type FixxamCallStatus =
  | "ringing"
  | "accepted"
  | "connected"
  | "declined"
  | "missed"
  | "ended"
  | "failed";

/* ============================================================
PARTICIPANT SNAPSHOT
============================================================ */

export type FixxamCallParticipantSnapshot = {
  name: string;
  image: string;
  service: string;
};

/* ============================================================
CALL SESSION
============================================================ */

export type FixxamCallSession = {
  id: string;

  callerId: string;
  callerRole: FixxamCallRole;

  calleeId: string;
  calleeRole: FixxamCallRole;

  orderId: string | null;
  shopRequestId: string | null;

  callerSnapshot:
    | FixxamCallParticipantSnapshot
    | null;

  calleeSnapshot:
    | FixxamCallParticipantSnapshot
    | null;

  status: FixxamCallStatus;

  createdAt: Date | null;
  acceptedAt: Date | null;
  connectedAt: Date | null;
  endedAt: Date | null;

  endedBy: string | null;
};

/* ============================================================
GENERIC CREATE CALL INPUT
============================================================ */

export type CreateCallSessionInput = {
  callerId: string;
  callerRole: FixxamCallRole;

  calleeId: string;
  calleeRole: FixxamCallRole;

  orderId?: string | null;

  shopRequestId?: string | null;

  callerSnapshot?:
    | Partial<FixxamCallParticipantSnapshot>
    | null;

  calleeSnapshot?:
    | Partial<FixxamCallParticipantSnapshot>
    | null;
};

/* ============================================================
WORKER CONTACT CALLBACK INPUT
============================================================ */

export type CreateWorkerContactCallSessionInput = {
  workerId: string;
  customerId: string;

  workerSnapshot?:
    | Partial<FixxamCallParticipantSnapshot>
    | null;
};

/* ============================================================
WORKER MARKET CALL INPUT
============================================================ */

export type CreateWorkerMarketCallSessionInput = {
  workerId: string;
  customerId: string;
  orderId: string;

  workerSnapshot?:
    | Partial<FixxamCallParticipantSnapshot>
    | null;

  customerSnapshot?:
    | Partial<FixxamCallParticipantSnapshot>
    | null;
};

/* ============================================================
WORKER SHOP REQUEST CALL INPUT
============================================================ */

export type CreateWorkerShopRequestCallSessionInput = {
  workerId: string;
  customerId: string;
  shopRequestId: string;

  workerSnapshot?:
    | Partial<FixxamCallParticipantSnapshot>
    | null;

  customerSnapshot?:
    | Partial<FixxamCallParticipantSnapshot>
    | null;
};

/* ============================================================
INCOMING CALL SUBSCRIPTION INPUT
============================================================ */

type SubscribeIncomingCallsInput = {
  userId: string;
  role: FixxamCallRole;

  onIncomingCall: (
    call: FixxamCallSession,
  ) => void;

  onNoIncomingCall?: () => void;

  onError?: (
    error: Error,
  ) => void;
};

/* ============================================================
CONSTANTS
============================================================ */

const CALLS_COLLECTION =
  "calls";

const WORKER_CONTACTS_COLLECTION =
  "workerContacts";

const CUSTOMERS_SUBCOLLECTION =
  "customers";

const WORKER_PUBLIC_PROFILES_COLLECTION =
  "workerPublicProfiles";

const USERS_COLLECTION =
  "users";

const MAX_ID_LENGTH = 128;

const MAX_NAME_LENGTH = 80;

const MAX_SERVICE_LENGTH = 120;

const MAX_IMAGE_URL_LENGTH = 2048;

const ACTIVE_CALL_STATUSES: FixxamCallStatus[] = [
  "ringing",
  "accepted",
  "connected",
];

/* ============================================================
LOCAL DUPLICATE GUARDS
============================================================ */

const creatingCalls =
  new Set<string>();

const creatingContactCalls =
  new Set<string>();

const creatingMarketCalls =
  new Set<string>();

const creatingShopRequestCalls =
  new Set<string>();

/* ============================================================
STRING HELPER
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
ID VALIDATION
============================================================ */

function isValidDocumentId(
  value: string,
): boolean {
  return (
    value.length > 0 &&
    value.length <= MAX_ID_LENGTH &&
    !value.includes("/")
  );
}

/* ============================================================
IMAGE VALIDATION
============================================================ */

function cleanHttpsImage(
  value: unknown,
): string {
  const image =
    cleanString(value);

  if (
    !image.startsWith("https://")
  ) {
    return "";
  }

  if (
    image.length >
    MAX_IMAGE_URL_LENGTH
  ) {
    return "";
  }

  return image;
}

/* ============================================================
ROLE VALIDATION
============================================================ */

function isCallRole(
  value: unknown,
): value is FixxamCallRole {
  return (
    value === "customer" ||
    value === "worker"
  );
}

/* ============================================================
STATUS VALIDATION
============================================================ */

function isCallStatus(
  value: unknown,
): value is FixxamCallStatus {
  return (
    value === "ringing" ||
    value === "accepted" ||
    value === "connected" ||
    value === "declined" ||
    value === "missed" ||
    value === "ended" ||
    value === "failed"
  );
}

/* ============================================================
ACTIVE STATUS
============================================================ */

function isActiveCallStatus(
  status: FixxamCallStatus,
): boolean {
  return (
    status === "ringing" ||
    status === "accepted" ||
    status === "connected"
  );
}

/* ============================================================
TIMESTAMP -> DATE
============================================================ */

function toDate(
  value: unknown,
): Date | null {
  if (
    value instanceof Timestamp
  ) {
    return value.toDate();
  }

  return null;
}

/* ============================================================
PLACEHOLDER CUSTOMER NAME
============================================================ */

function isPlaceholderCustomerName(
  value: unknown,
): boolean {
  const name =
    cleanString(value).toLowerCase();

  return (
    name === "fixxam customer" ||
    name === "customer"
  );
}

/* ============================================================
PARTICIPANT SNAPSHOT MAPPER
============================================================ */

function mapParticipantSnapshot(
  value: unknown,
): FixxamCallParticipantSnapshot | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const data =
    value as Record<string, unknown>;

  const name =
    cleanString(data.name);

  if (!name) {
    return null;
  }

  return {
    name: name.slice(
      0,
      MAX_NAME_LENGTH,
    ),

    image:
      cleanHttpsImage(
        data.image,
      ),

    service:
      cleanString(
        data.service,
      ).slice(
        0,
        MAX_SERVICE_LENGTH,
      ),
  };
}

/* ============================================================
SNAPSHOT NORMALIZER
============================================================ */

function normalizeCallSnapshot(
  value:
    | Partial<FixxamCallParticipantSnapshot>
    | null
    | undefined,

  fallbackName: string,
): FixxamCallParticipantSnapshot {
  const rawName =
    cleanString(value?.name) ||
    fallbackName;

  const rawService =
    cleanString(value?.service);

  return {
    name: rawName.slice(
      0,
      MAX_NAME_LENGTH,
    ),

    image:
      cleanHttpsImage(
        value?.image,
      ),

    service:
      rawService.slice(
        0,
        MAX_SERVICE_LENGTH,
      ),
  };
}

/* ============================================================
CUSTOMER SNAPSHOT
============================================================ */

/**
 * Gets the authenticated customer's real identity.
 *
 * Priority:
 *
 * 1. users/{customerId}
 * 2. provided snapshot
 * 3. Firebase Auth
 * 4. safe fallback
 *
 * This is used when:
 *
 * Customer -> Worker
 *
 * The customer snapshot is stored inside the call document
 * and displayed by the worker incoming-call UI.
 */
async function getCustomerSnapshot(
  customerId: string,
  providedSnapshot?: Partial<FixxamCallParticipantSnapshot> | null,
): Promise<FixxamCallParticipantSnapshot> {
  const currentUser =
    auth.currentUser;

  if (!currentUser) {
    throw new Error(
      "Please sign in before starting a call.",
    );
  }

  if (
    currentUser.uid !==
    customerId
  ) {
    throw new Error(
      "Authenticated customer does not match the caller.",
    );
  }

  const providedName =
    cleanString(
      providedSnapshot?.name,
    );

  const providedImage =
    cleanHttpsImage(
      providedSnapshot?.image,
    );

  const providedService =
    cleanString(
      providedSnapshot?.service,
    );

  const authName =
    cleanString(
      currentUser.displayName,
    );

  const authImage =
    cleanHttpsImage(
      currentUser.photoURL,
    );

  let profileName = "";

  let profileImage = "";

  let profileService = "";

  try {
    const profileRef =
      doc(
        db,
        USERS_COLLECTION,
        customerId,
      );

    const profileSnapshot =
      await getDoc(
        profileRef,
      );

    if (
      profileSnapshot.exists()
    ) {
      const profileData =
        profileSnapshot.data();

      const firstName =
        cleanString(
          profileData?.firstName,
        );

      const otherName =
        cleanString(
          profileData?.otherName,
        );

      const surname =
        cleanString(
          profileData?.surname,
        );

      profileName =
        cleanString(
          profileData?.fullName,
        ) ||
        [
          firstName,
          otherName,
          surname,
        ]
          .filter(Boolean)
          .join(" ");

      profileImage =
        cleanHttpsImage(
          profileData?.photoUrl,
        ) ||
        cleanHttpsImage(
          profileData?.photoURL,
        ) ||
        cleanHttpsImage(
          profileData?.image,
        );

      profileService =
        cleanString(
          profileData?.service,
        ) ||
        cleanString(
          profileData?.serviceName,
        );
    }
  } catch (error) {
    console.warn(
      "CUSTOMER_PROFILE_SNAPSHOT_READ_FAILED:",
      error,
    );
  }

  const finalName =
    profileName ||
    (
      !isPlaceholderCustomerName(
        providedName,
      )
        ? providedName
        : ""
    ) ||
    authName ||
    "Fixxam Customer";

  const finalImage =
    profileImage ||
    providedImage ||
    authImage ||
    "";

  const finalService =
    profileService ||
    providedService ||
    "";

  return {
    name:
      finalName.slice(
        0,
        MAX_NAME_LENGTH,
      ),

    image:
      finalImage,

    service:
      finalService.slice(
        0,
        MAX_SERVICE_LENGTH,
      ),
  };
}

/* ============================================================
CALL SESSION MAPPER
============================================================ */

function mapCallSession(
  id: string,
  value: unknown,
): FixxamCallSession | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const data =
    value as Record<string, unknown>;

  const callerId =
    cleanString(data.callerId);

  const calleeId =
    cleanString(data.calleeId);

  if (
    !callerId ||
    !calleeId ||
    !isCallRole(
      data.callerRole,
    ) ||
    !isCallRole(
      data.calleeRole,
    ) ||
    !isCallStatus(
      data.status,
    )
  ) {
    if (__DEV__) {
      console.warn(
        "INVALID_FIXXAM_CALL_DOCUMENT:",
        {
          callId: id,
          callerId,
          calleeId,
          callerRole:
            data.callerRole,
          calleeRole:
            data.calleeRole,
          status:
            data.status,
        },
      );
    }

    return null;
  }

  return {
    id,

    callerId,

    callerRole:
      data.callerRole,

    calleeId,

    calleeRole:
      data.calleeRole,

    orderId:
      cleanString(
        data.orderId,
      ) || null,

    shopRequestId:
      cleanString(
        data.shopRequestId,
      ) || null,

    callerSnapshot:
      mapParticipantSnapshot(
        data.callerSnapshot,
      ),

    calleeSnapshot:
      mapParticipantSnapshot(
        data.calleeSnapshot,
      ),

    status:
      data.status,

    createdAt:
      toDate(
        data.createdAt,
      ),

    acceptedAt:
      toDate(
        data.acceptedAt,
      ),

    connectedAt:
      toDate(
        data.connectedAt,
      ),

    endedAt:
      toDate(
        data.endedAt,
      ),

    endedBy:
      cleanString(
        data.endedBy,
      ) || null,
  };
}

/* ============================================================
MATCH CALL CONTEXT
============================================================ */

function matchesCallContext(
  call: FixxamCallSession,
  orderId: string | null,
  shopRequestId: string | null,
): boolean {
  return (
    call.orderId ===
      orderId &&
    call.shopRequestId ===
      shopRequestId
  );
}

/* ============================================================
MATCH PARTICIPANTS
============================================================ */

function matchesCallParticipants(
  call: FixxamCallSession,
  callerId: string,
  callerRole: FixxamCallRole,
  calleeId: string,
  calleeRole: FixxamCallRole,
): boolean {
  const sameDirection =
    call.callerId === callerId &&
    call.callerRole === callerRole &&
    call.calleeId === calleeId &&
    call.calleeRole === calleeRole;

  const reverseDirection =
    call.callerId === calleeId &&
    call.callerRole === calleeRole &&
    call.calleeId === callerId &&
    call.calleeRole === callerRole;

  return (
    sameDirection ||
    reverseDirection
  );
}

/* ============================================================
FIND ACTIVE CALL BETWEEN USERS
============================================================ */

async function findExistingActiveCallBetweenUsers(
  firstUserId: string,
  secondUserId: string,
  orderId: string | null = null,
  shopRequestId: string | null = null,
): Promise<FixxamCallSession[]> {
  const firstToSecondQuery =
    query(
      collection(
        db,
        CALLS_COLLECTION,
      ),

      where(
        "callerId",
        "==",
        firstUserId,
      ),

      where(
        "calleeId",
        "==",
        secondUserId,
      ),

      where(
        "status",
        "in",
        ACTIVE_CALL_STATUSES,
      ),

      limit(10),
    );

  const secondToFirstQuery =
    query(
      collection(
        db,
        CALLS_COLLECTION,
      ),

      where(
        "callerId",
        "==",
        secondUserId,
      ),

      where(
        "calleeId",
        "==",
        firstUserId,
      ),

      where(
        "status",
        "in",
        ACTIVE_CALL_STATUSES,
      ),

      limit(10),
    );

  const [
    firstToSecondSnapshot,
    secondToFirstSnapshot,
  ] = await Promise.all([
    getDocs(
      firstToSecondQuery,
    ),

    getDocs(
      secondToFirstQuery,
    ),
  ]);

  const uniqueCalls =
    new Map<
      string,
      FixxamCallSession
    >();

  const allDocuments = [
    ...firstToSecondSnapshot.docs,
    ...secondToFirstSnapshot.docs,
  ];

  for (
    const callDoc of allDocuments
  ) {
    const call =
      mapCallSession(
        callDoc.id,
        callDoc.data(),
      );

    if (!call) {
      continue;
    }

    if (
      !isActiveCallStatus(
        call.status,
      )
    ) {
      continue;
    }

    if (
      !matchesCallContext(
        call,
        orderId,
        shopRequestId,
      )
    ) {
      continue;
    }

    uniqueCalls.set(
      call.id,
      call,
    );
  }

  return Array.from(
    uniqueCalls.values(),
  ).sort(
    (a, b) =>
      (
        b.createdAt?.getTime() ??
        0
      ) -
      (
        a.createdAt?.getTime() ??
        0
      ),
  );
}

/* ============================================================
GET WORKER PROFILE SNAPSHOT
============================================================ */

async function getWorkerSnapshot(
  workerId: string,
  providedSnapshot?: Partial<FixxamCallParticipantSnapshot> | null,
): Promise<FixxamCallParticipantSnapshot> {
  const providedName =
    cleanString(
      providedSnapshot?.name,
    );

  const providedImage =
    cleanHttpsImage(
      providedSnapshot?.image,
    );

  const providedService =
    cleanString(
      providedSnapshot?.service,
    );

  let profileName = "";

  let profileImage = "";

  let profileService = "";

  try {
    const profileRef =
      doc(
        db,
        WORKER_PUBLIC_PROFILES_COLLECTION,
        workerId,
      );

    const profileSnapshot =
      await getDoc(
        profileRef,
      );

    if (
      profileSnapshot.exists()
    ) {
      const profileData =
        profileSnapshot.data();

      profileName =
        cleanString(
          profileData?.name,
        ) ||
        cleanString(
          profileData?.displayName,
        );

      profileImage =
        cleanHttpsImage(
          profileData?.image,
        ) ||
        cleanHttpsImage(
          profileData?.photoURL,
        ) ||
        cleanHttpsImage(
          profileData?.photoUrl,
        );

      profileService =
        cleanString(
          profileData?.service,
        ) ||
        cleanString(
          profileData?.serviceName,
        );
    }
  } catch (error) {
    console.warn(
      "WORKER_PROFILE_SNAPSHOT_READ_FAILED:",
      error,
    );
  }

  const finalName =
    profileName ||
    providedName ||
    "Fixxam Worker";

  const finalImage =
    profileImage ||
    providedImage ||
    "";

  const finalService =
    profileService ||
    providedService ||
    "";

  return {
    name:
      finalName.slice(
        0,
        MAX_NAME_LENGTH,
      ),

    image:
      finalImage,

    service:
      finalService.slice(
        0,
        MAX_SERVICE_LENGTH,
      ),
  };
}

/* ============================================================
GET WORKER CONTACT
============================================================ */

async function getWorkerContact(
  workerId: string,
  customerId: string,
): Promise<FixxamCallParticipantSnapshot> {
  const normalizedWorkerId =
    cleanString(workerId);

  const normalizedCustomerId =
    cleanString(customerId);

  if (
    !normalizedWorkerId ||
    !normalizedCustomerId
  ) {
    throw new Error(
      "Worker and customer information are required.",
    );
  }

  const contactRef =
    doc(
      db,
      WORKER_CONTACTS_COLLECTION,
      normalizedWorkerId,
      CUSTOMERS_SUBCOLLECTION,
      normalizedCustomerId,
    );

  try {
    const snapshot =
      await getDoc(
        contactRef,
      );

    if (
      !snapshot.exists()
    ) {
      return {
        name: "Fixxam Customer",
        image: "",
        service: "",
      };
    }

    const data =
      snapshot.data();

    const name =
      cleanString(
        data.name,
      );

    const image =
      cleanHttpsImage(
        data.image,
      );

    const service =
      cleanString(
        data.service,
      );

    return {
      name:
        name.slice(
          0,
          MAX_NAME_LENGTH,
        ),

      image,

      service:
        service.slice(
          0,
          MAX_SERVICE_LENGTH,
        ),
    };
  } catch (error) {
    console.warn(
      "WORKER_CONTACT_READ_FAILED:",
      error,
    );

    return {
      name: "Fixxam Customer",
      image: "",
      service: "",
    };
  }
}

/* ============================================================
GET CUSTOMER SNAPSHOT FOR WORKER
============================================================ */

/**
 * Resolves the customer identity when:
 *
 * Worker -> Customer
 *
 * Priority:
 *
 * 1. workerContacts/{workerId}/customers/{customerId}
 * 2. provided customer snapshot
 * 3. safe fallback
 */
async function getCustomerSnapshotForWorker(
  workerId: string,
  customerId: string,
  providedSnapshot?: Partial<FixxamCallParticipantSnapshot> | null,
): Promise<FixxamCallParticipantSnapshot> {
  const providedName =
    cleanString(
      providedSnapshot?.name,
    );

  const providedImage =
    cleanHttpsImage(
      providedSnapshot?.image,
    );

  const providedService =
    cleanString(
      providedSnapshot?.service,
    );

  const customerContact =
    await getWorkerContact(
      workerId,
      customerId,
    );

  const contactName =
    cleanString(
      customerContact.name,
    );

  const finalName =
    !isPlaceholderCustomerName(
      contactName,
    )
      ? contactName
      : !isPlaceholderCustomerName(
          providedName,
        )
        ? providedName
        : "Fixxam Customer";

  const finalImage =
    customerContact.image ||
    providedImage ||
    "";

  const finalService =
    customerContact.service ||
    providedService ||
    "";

  return {
    name:
      finalName.slice(
        0,
        MAX_NAME_LENGTH,
      ),

    image:
      finalImage,

    service:
      finalService.slice(
        0,
        MAX_SERVICE_LENGTH,
      ),
  };
}

/* ============================================================
CREATE GENERIC CALL
============================================================ */

export async function createCallSession({
  callerId,
  callerRole,
  calleeId,
  calleeRole,
  orderId = null,
  shopRequestId = null,
  callerSnapshot,
  calleeSnapshot,
}: CreateCallSessionInput): Promise<string> {
  const normalizedCallerId =
    cleanString(callerId);

  const normalizedCalleeId =
    cleanString(calleeId);

  const normalizedOrderId =
    cleanString(orderId);

  const normalizedShopRequestId =
    cleanString(shopRequestId);

  if (
    !normalizedCallerId ||
    !normalizedCalleeId
  ) {
    throw new Error(
      "Caller and callee information are required.",
    );
  }

  if (
    !isValidDocumentId(
      normalizedCallerId,
    ) ||
    !isValidDocumentId(
      normalizedCalleeId,
    )
  ) {
    throw new Error(
      "Invalid caller or callee information.",
    );
  }

  if (
    !isCallRole(callerRole) ||
    !isCallRole(calleeRole)
  ) {
    throw new Error(
      "Invalid call participant role.",
    );
  }

  if (
    callerRole === calleeRole
  ) {
    throw new Error(
      "Calls are only available between a customer and a worker.",
    );
  }

  if (
    normalizedCallerId ===
    normalizedCalleeId
  ) {
    throw new Error(
      "You cannot call your own account.",
    );
  }

  if (
    normalizedOrderId &&
    !isValidDocumentId(
      normalizedOrderId,
    )
  ) {
    throw new Error(
      "Invalid order information.",
    );
  }

  if (
    normalizedShopRequestId &&
    !isValidDocumentId(
      normalizedShopRequestId,
    )
  ) {
    throw new Error(
      "Invalid shop request information.",
    );
  }

  if (
    normalizedOrderId &&
    normalizedShopRequestId
  ) {
    throw new Error(
      "A call cannot belong to both an order and a shop request.",
    );
  }

  if (
    (
      normalizedOrderId ||
      normalizedShopRequestId
    ) &&
    callerRole !== "worker"
  ) {
    throw new Error(
      "Only workers can start contextual calls.",
    );
  }

  const authenticatedUserId =
    cleanString(
      auth.currentUser?.uid,
    );

  if (
    !authenticatedUserId
  ) {
    throw new Error(
      "Please sign in before starting a call.",
    );
  }

  if (
    authenticatedUserId !==
    normalizedCallerId
  ) {
    throw new Error(
      "Your session is no longer valid.",
    );
  }

  const participantKeys = [
    `${normalizedCallerId}:${callerRole}`,
    `${normalizedCalleeId}:${calleeRole}`,
  ].sort();

  const callKey = [
    ...participantKeys,
    normalizedOrderId,
    normalizedShopRequestId,
  ].join(":");

  if (
    creatingCalls.has(callKey)
  ) {
    throw new Error(
      "A call is already being started.",
    );
  }

  creatingCalls.add(
    callKey,
  );

  try {
    /* ========================================================
       RESOLVE CALLER SNAPSHOT
    ======================================================== */

    const safeCallerSnapshot =
      callerRole === "customer"
        ? await getCustomerSnapshot(
            normalizedCallerId,
            callerSnapshot,
          )
        : await getWorkerSnapshot(
            normalizedCallerId,
            callerSnapshot,
          );

    /* ========================================================
       RESOLVE CALLEE SNAPSHOT
    ======================================================== */

    const safeCalleeSnapshot =
      calleeRole === "worker"
        ? await getWorkerSnapshot(
            normalizedCalleeId,
            calleeSnapshot,
          )
        : await getCustomerSnapshotForWorker(
            normalizedCallerId,
            normalizedCalleeId,
            calleeSnapshot,
          );

    /* ========================================================
       CHECK EXISTING ACTIVE CALL
    ======================================================== */

    const existingCalls =
      await findExistingActiveCallBetweenUsers(
        normalizedCallerId,
        normalizedCalleeId,
        normalizedOrderId ||
          null,
        normalizedShopRequestId ||
          null,
      );

    const matchingExistingCall =
      existingCalls.find(
        (existingCall) =>
          matchesCallParticipants(
            existingCall,
            normalizedCallerId,
            callerRole,
            normalizedCalleeId,
            calleeRole,
          ),
      );

    if (
      matchingExistingCall
    ) {
      return matchingExistingCall.id;
    }

    /* ========================================================
       CREATE CALL DOCUMENT
    ======================================================== */

    const callDocument: Record<
      string,
      unknown
    > = {
      callerId:
        normalizedCallerId,

      callerRole,

      calleeId:
        normalizedCalleeId,

      calleeRole,

      callerSnapshot:
        safeCallerSnapshot,

      calleeSnapshot:
        safeCalleeSnapshot,

      status:
        "ringing",

      createdAt:
        serverTimestamp(),

      acceptedAt:
        null,

      connectedAt:
        null,

      endedAt:
        null,

      endedBy:
        null,
    };

    if (
      normalizedOrderId
    ) {
      callDocument.orderId =
        normalizedOrderId;
    }

    if (
      normalizedShopRequestId
    ) {
      callDocument.shopRequestId =
        normalizedShopRequestId;
    }

    const reference =
      await addDoc(
        collection(
          db,
          CALLS_COLLECTION,
        ),
        callDocument,
      );

    return reference.id;
  } finally {
    creatingCalls.delete(
      callKey,
    );
  }
}

/* ============================================================
CREATE WORKER -> CUSTOMER CONTACT CALLBACK
============================================================ */

export async function createWorkerContactCallSession({
  workerId,
  customerId,
  workerSnapshot,
}: CreateWorkerContactCallSessionInput): Promise<string> {
  const normalizedWorkerId =
    cleanString(workerId);

  const normalizedCustomerId =
    cleanString(customerId);

  if (
    !normalizedWorkerId ||
    !normalizedCustomerId
  ) {
    throw new Error(
      "Worker and customer information are required.",
    );
  }

  if (
    !isValidDocumentId(
      normalizedWorkerId,
    ) ||
    !isValidDocumentId(
      normalizedCustomerId,
    )
  ) {
    throw new Error(
      "Invalid worker or customer information.",
    );
  }

  if (
    normalizedWorkerId ===
    normalizedCustomerId
  ) {
    throw new Error(
      "You cannot call your own account.",
    );
  }

  const authenticatedUserId =
    cleanString(
      auth.currentUser?.uid,
    );

  if (
    !authenticatedUserId
  ) {
    throw new Error(
      "Please sign in before calling a customer.",
    );
  }

  if (
    authenticatedUserId !==
    normalizedWorkerId
  ) {
    throw new Error(
      "Your worker session is no longer valid.",
    );
  }

  const callKey = [
    "contact-callback",
    normalizedWorkerId,
    normalizedCustomerId,
  ]
    .sort()
    .join(":");

  if (
    creatingContactCalls.has(
      callKey,
    )
  ) {
    throw new Error(
      "A callback is already being started.",
    );
  }

  creatingContactCalls.add(
    callKey,
  );

  try {
    const customerContact =
      await getWorkerContact(
        normalizedWorkerId,
        normalizedCustomerId,
      );

    const existingCalls =
      await findExistingActiveCallBetweenUsers(
        normalizedWorkerId,
        normalizedCustomerId,
        null,
        null,
      );

    const existingActiveCall =
      existingCalls.find(
        (existingCall) =>
          matchesCallParticipants(
            existingCall,
            normalizedWorkerId,
            "worker",
            normalizedCustomerId,
            "customer",
          ),
      );

    if (
      existingActiveCall
    ) {
      return existingActiveCall.id;
    }

    const safeWorkerSnapshot =
      await getWorkerSnapshot(
        normalizedWorkerId,
        workerSnapshot,
      );

    const safeCustomerSnapshot =
      await getCustomerSnapshotForWorker(
        normalizedWorkerId,
        normalizedCustomerId,
        customerContact,
      );

    return await createCallSession({
      callerId:
        normalizedWorkerId,

      callerRole:
        "worker",

      calleeId:
        normalizedCustomerId,

      calleeRole:
        "customer",

      callerSnapshot:
        safeWorkerSnapshot,

      calleeSnapshot:
        safeCustomerSnapshot,
    });
  } finally {
    creatingContactCalls.delete(
      callKey,
    );
  }
}

/* ============================================================
CREATE WORKER -> CUSTOMER MARKET CALL
============================================================ */

export async function createWorkerMarketCallSession({
  workerId,
  customerId,
  orderId,
  workerSnapshot,
  customerSnapshot,
}: CreateWorkerMarketCallSessionInput): Promise<string> {
  const normalizedWorkerId =
    cleanString(workerId);

  const normalizedCustomerId =
    cleanString(customerId);

  const normalizedOrderId =
    cleanString(orderId);

  if (
    !normalizedWorkerId ||
    !normalizedCustomerId ||
    !normalizedOrderId
  ) {
    throw new Error(
      "Worker, customer, and order information are required.",
    );
  }

  if (
    !isValidDocumentId(
      normalizedWorkerId,
    ) ||
    !isValidDocumentId(
      normalizedCustomerId,
    ) ||
    !isValidDocumentId(
      normalizedOrderId,
    )
  ) {
    throw new Error(
      "Invalid worker, customer, or order information.",
    );
  }

  if (
    normalizedWorkerId ===
    normalizedCustomerId
  ) {
    throw new Error(
      "You cannot call your own account.",
    );
  }

  const authenticatedUserId =
    cleanString(
      auth.currentUser?.uid,
    );

  if (
    !authenticatedUserId
  ) {
    throw new Error(
      "Please sign in before starting a call.",
    );
  }

  if (
    authenticatedUserId !==
    normalizedWorkerId
  ) {
    throw new Error(
      "Your worker session is no longer valid.",
    );
  }

  const callKey = [
    "market",
    normalizedWorkerId,
    normalizedCustomerId,
    normalizedOrderId,
  ]
    .sort()
    .join(":");

  if (
    creatingMarketCalls.has(
      callKey,
    )
  ) {
    throw new Error(
      "A call is already being started.",
    );
  }

  creatingMarketCalls.add(
    callKey,
  );

  try {
    const orderRef =
      doc(
        db,
        "orders",
        normalizedOrderId,
      );

    const orderSnapshot =
      await getDoc(
        orderRef,
      );

    if (
      !orderSnapshot.exists()
    ) {
      throw new Error(
        "This market order no longer exists.",
      );
    }

    const orderData =
      orderSnapshot.data();

    const assignedWorkerId =
      cleanString(
        orderData.workerId,
      );

    const assignedCustomerId =
      cleanString(
        orderData.customerId,
      );

    if (
      assignedWorkerId !==
      normalizedWorkerId
    ) {
      throw new Error(
        "You are not assigned to this market order.",
      );
    }

    if (
      assignedCustomerId !==
      normalizedCustomerId
    ) {
      throw new Error(
        "This customer does not belong to the selected market order.",
      );
    }

    const existingCalls =
      await findExistingActiveCallBetweenUsers(
        normalizedWorkerId,
        normalizedCustomerId,
        normalizedOrderId,
        null,
      );

    const existingActiveCall =
      existingCalls.find(
        (existingCall) =>
          matchesCallParticipants(
            existingCall,
            normalizedWorkerId,
            "worker",
            normalizedCustomerId,
            "customer",
          ),
      );

    if (
      existingActiveCall
    ) {
      return existingActiveCall.id;
    }

    return createCallSession({
      callerId:
        normalizedWorkerId,

      callerRole:
        "worker",

      calleeId:
        normalizedCustomerId,

      calleeRole:
        "customer",

      orderId:
        normalizedOrderId,

      callerSnapshot:
        workerSnapshot,

      calleeSnapshot:
        customerSnapshot,
    });
  } finally {
    creatingMarketCalls.delete(
      callKey,
    );
  }
}

/* ============================================================
CREATE WORKER -> CUSTOMER SHOP REQUEST CALL
============================================================ */

export async function createWorkerShopRequestCallSession({
  workerId,
  customerId,
  shopRequestId,
  workerSnapshot,
  customerSnapshot,
}: CreateWorkerShopRequestCallSessionInput): Promise<string> {
  const normalizedWorkerId =
    cleanString(workerId);

  const normalizedCustomerId =
    cleanString(customerId);

  const normalizedShopRequestId =
    cleanString(shopRequestId);

  if (
    !normalizedWorkerId ||
    !normalizedCustomerId ||
    !normalizedShopRequestId
  ) {
    throw new Error(
      "Worker, customer, and shop request information are required.",
    );
  }

  if (
    !isValidDocumentId(
      normalizedWorkerId,
    ) ||
    !isValidDocumentId(
      normalizedCustomerId,
    ) ||
    !isValidDocumentId(
      normalizedShopRequestId,
    )
  ) {
    throw new Error(
      "Invalid worker, customer, or shop request information.",
    );
  }

  if (
    normalizedWorkerId ===
    normalizedCustomerId
  ) {
    throw new Error(
      "You cannot call your own account.",
    );
  }

  const authenticatedUserId =
    cleanString(
      auth.currentUser?.uid,
    );

  if (
    !authenticatedUserId
  ) {
    throw new Error(
      "Please sign in before starting a call.",
    );
  }

  if (
    authenticatedUserId !==
    normalizedWorkerId
  ) {
    throw new Error(
      "Your worker session is no longer valid.",
    );
  }

  const callKey = [
    "shop-request",
    normalizedWorkerId,
    normalizedCustomerId,
    normalizedShopRequestId,
  ]
    .sort()
    .join(":");

  if (
    creatingShopRequestCalls.has(
      callKey,
    )
  ) {
    throw new Error(
      "A call is already being started.",
    );
  }

  creatingShopRequestCalls.add(
    callKey,
  );

  try {
    const requestRef =
      doc(
        db,
        "shopRequests",
        normalizedShopRequestId,
      );

    const requestSnapshot =
      await getDoc(
        requestRef,
      );

    if (
      !requestSnapshot.exists()
    ) {
      throw new Error(
        "This shop request no longer exists.",
      );
    }

    const requestData =
      requestSnapshot.data();

    const assignedWorkerId =
      cleanString(
        requestData.workerId,
      );

    const assignedCustomerId =
      cleanString(
        requestData.customerId,
      );

    const requestStatus =
      cleanString(
        requestData.status,
      );

    if (
      assignedWorkerId !==
      normalizedWorkerId
    ) {
      throw new Error(
        "You are not assigned to this shop request.",
      );
    }

    if (
      assignedCustomerId !==
      normalizedCustomerId
    ) {
      throw new Error(
        "This customer does not belong to the selected shop request.",
      );
    }

    if (
      requestStatus !==
        "pending" &&
      requestStatus !==
        "accepted"
    ) {
      throw new Error(
        "Calls are no longer available for this request.",
      );
    }

    const existingCalls =
      await findExistingActiveCallBetweenUsers(
        normalizedWorkerId,
        normalizedCustomerId,
        null,
        normalizedShopRequestId,
      );

    const existingActiveCall =
      existingCalls.find(
        (existingCall) =>
          matchesCallParticipants(
            existingCall,
            normalizedWorkerId,
            "worker",
            normalizedCustomerId,
            "customer",
          ),
      );

    if (
      existingActiveCall
    ) {
      return existingActiveCall.id;
    }

    return createCallSession({
      callerId:
        normalizedWorkerId,

      callerRole:
        "worker",

      calleeId:
        normalizedCustomerId,

      calleeRole:
        "customer",

      shopRequestId:
        normalizedShopRequestId,

      callerSnapshot:
        workerSnapshot,

      calleeSnapshot:
        customerSnapshot,
    });
  } finally {
    creatingShopRequestCalls.delete(
      callKey,
    );
  }
}

/* ============================================================
GET CALL
============================================================ */

export async function getCallSession(
  callId: string,
): Promise<FixxamCallSession | null> {
  const normalizedId =
    cleanString(callId);

  if (
    !normalizedId ||
    !isValidDocumentId(
      normalizedId,
    )
  ) {
    return null;
  }

  const snapshot =
    await getDoc(
      doc(
        db,
        CALLS_COLLECTION,
        normalizedId,
      ),
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return mapCallSession(
    snapshot.id,
    snapshot.data(),
  );
}

/* ============================================================
SUBSCRIBE TO CALL
============================================================ */

export function subscribeToCall(
  callId: string,

  onChange: (
    call: FixxamCallSession,
  ) => void,

  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const normalizedId =
    cleanString(callId);

  if (
    !normalizedId ||
    !isValidDocumentId(
      normalizedId,
    )
  ) {
    throw new Error(
      "Call ID is required.",
    );
  }

  return onSnapshot(
    doc(
      db,
      CALLS_COLLECTION,
      normalizedId,
    ),

    (snapshot) => {
      if (
        !snapshot.exists()
      ) {
        return;
      }

      const call =
        mapCallSession(
          snapshot.id,
          snapshot.data(),
        );

      if (!call) {
        return;
      }

      onChange(call);
    },

    (error) => {
      if (__DEV__) {
        console.error(
          "CALL_SUBSCRIPTION_ERROR:",
          error,
        );
      }

      onError?.(error);
    },
  );
}

/* ============================================================
SUBSCRIBE TO INCOMING CALLS
============================================================ */

export function subscribeToIncomingCalls({
  userId,
  role,
  onIncomingCall,
  onNoIncomingCall,
  onError,
}: SubscribeIncomingCallsInput): Unsubscribe {
  const normalizedUserId =
    cleanString(userId);

  if (
    !normalizedUserId ||
    !isCallRole(role)
  ) {
    throw new Error(
      "Valid user ID and role are required.",
    );
  }

  const callsQuery =
    query(
      collection(
        db,
        CALLS_COLLECTION,
      ),

      where(
        "calleeId",
        "==",
        normalizedUserId,
      ),

      where(
        "status",
        "==",
        "ringing",
      ),

      limit(10),
    );

  return onSnapshot(
    callsQuery,

    (snapshot) => {
      const incomingCalls =
        snapshot.docs
          .map(
            (callDoc) =>
              mapCallSession(
                callDoc.id,
                callDoc.data(),
              ),
          )
          .filter(
            (
              call,
            ): call is FixxamCallSession =>
              Boolean(
                call &&
                  call.calleeId ===
                    normalizedUserId &&
                  call.calleeRole ===
                    role &&
                  call.status ===
                    "ringing",
              ),
          )
          .sort(
            (a, b) =>
              (
                b.createdAt?.getTime() ??
                0
              ) -
              (
                a.createdAt?.getTime() ??
                0
              ),
          );

      const latestCall =
        incomingCalls[0];

      if (!latestCall) {
        onNoIncomingCall?.();
        return;
      }

      onIncomingCall(
        latestCall,
      );
    },

    (error) => {
      if (__DEV__) {
        console.error(
          "INCOMING_CALL_LISTENER_ERROR:",
          {
            userId:
              normalizedUserId,
            role,
            error,
          },
        );
      }

      onError?.(error);
    },
  );
}

/* ============================================================
ACCEPT CALL
============================================================ */

export async function acceptIncomingCall(
  callId: string,
  userId: string,
): Promise<void> {
  const normalizedCallId =
    cleanString(callId);

  const normalizedUserId =
    cleanString(userId);

  if (
    !normalizedCallId ||
    !normalizedUserId
  ) {
    throw new Error(
      "Call ID and user ID are required.",
    );
  }

  if (
    !isValidDocumentId(
      normalizedCallId,
    )
  ) {
    throw new Error(
      "Invalid call ID.",
    );
  }

  const authenticatedUserId =
    cleanString(
      auth.currentUser?.uid,
    );

  if (
    authenticatedUserId !==
    normalizedUserId
  ) {
    throw new Error(
      "Your session is no longer valid.",
    );
  }

  const callRef =
    doc(
      db,
      CALLS_COLLECTION,
      normalizedCallId,
    );

  await runTransaction(
    db,
    async (transaction) => {
      const snapshot =
        await transaction.get(
          callRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Call does not exist.",
        );
      }

      const call =
        mapCallSession(
          snapshot.id,
          snapshot.data(),
        );

      if (!call) {
        throw new Error(
          "Invalid call session.",
        );
      }

      if (
        call.calleeId !==
        normalizedUserId
      ) {
        throw new Error(
          "You cannot accept this call.",
        );
      }

      if (
        call.status !==
        "ringing"
      ) {
        throw new Error(
          "This call is no longer ringing.",
        );
      }

      transaction.update(
        callRef,
        {
          status:
            "accepted",

          acceptedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
DECLINE CALL
============================================================ */

export async function declineIncomingCall(
  callId: string,
  userId: string,
): Promise<void> {
  const normalizedCallId =
    cleanString(callId);

  const normalizedUserId =
    cleanString(userId);

  if (
    !normalizedCallId ||
    !normalizedUserId
  ) {
    throw new Error(
      "Call ID and user ID are required.",
    );
  }

  if (
    !isValidDocumentId(
      normalizedCallId,
    )
  ) {
    throw new Error(
      "Invalid call ID.",
    );
  }

  const authenticatedUserId =
    cleanString(
      auth.currentUser?.uid,
    );

  if (
    authenticatedUserId !==
    normalizedUserId
  ) {
    throw new Error(
      "Your session is no longer valid.",
    );
  }

  const callRef =
    doc(
      db,
      CALLS_COLLECTION,
      normalizedCallId,
    );

  await runTransaction(
    db,
    async (transaction) => {
      const snapshot =
        await transaction.get(
          callRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Call does not exist.",
        );
      }

      const call =
        mapCallSession(
          snapshot.id,
          snapshot.data(),
        );

      if (!call) {
        throw new Error(
          "Invalid call session.",
        );
      }

      if (
        call.calleeId !==
        normalizedUserId
      ) {
        throw new Error(
          "You cannot decline this call.",
        );
      }

      if (
        call.status !==
        "ringing"
      ) {
        return;
      }

      transaction.update(
        callRef,
        {
          status:
            "declined",

          endedAt:
            serverTimestamp(),

          endedBy:
            normalizedUserId,
        },
      );
    },
  );
}

/* ============================================================
MARK CONNECTED
============================================================ */

export async function markCallConnected(
  callId: string,
  userId: string,
): Promise<void> {
  const normalizedCallId =
    cleanString(callId);

  const normalizedUserId =
    cleanString(userId);

  if (
    !normalizedCallId ||
    !normalizedUserId
  ) {
    throw new Error(
      "Call ID and user ID are required.",
    );
  }

  if (
    !isValidDocumentId(
      normalizedCallId,
    )
  ) {
    throw new Error(
      "Invalid call ID.",
    );
  }

  const authenticatedUserId =
    cleanString(
      auth.currentUser?.uid,
    );

  if (!authenticatedUserId) {
    throw new Error(
      "Please sign in before connecting the call.",
    );
  }

  if (
    authenticatedUserId !==
    normalizedUserId
  ) {
    throw new Error(
      "Your session is no longer valid.",
    );
  }

  const callRef =
    doc(
      db,
      CALLS_COLLECTION,
      normalizedCallId,
    );

  await runTransaction(
    db,
    async (transaction) => {
      const snapshot =
        await transaction.get(
          callRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Call does not exist.",
        );
      }

      const call =
        mapCallSession(
          snapshot.id,
          snapshot.data(),
        );

      if (!call) {
        throw new Error(
          "Invalid call session.",
        );
      }

      /* ======================================================
         VERIFY PARTICIPANT
      ====================================================== */

      const isCaller =
        call.callerId ===
        normalizedUserId;

      const isCallee =
        call.calleeId ===
        normalizedUserId;

      if (
        !isCaller &&
        !isCallee
      ) {
        throw new Error(
          "You are not a participant in this call.",
        );
      }

      /* ======================================================
         IDENTIFY WORKER
      ====================================================== */

      const isAuthenticatedWorker =
        (
          call.callerRole ===
            "worker" &&
          call.callerId ===
            normalizedUserId
        ) ||
        (
          call.calleeRole ===
            "worker" &&
          call.calleeId ===
            normalizedUserId
        );

      const customerIsCaller =
        call.callerRole ===
          "customer" &&
        call.calleeRole ===
          "worker";

      /* ======================================================
         SAVE CUSTOMER CONTACT
      ====================================================== */

      if (
        isAuthenticatedWorker &&
        customerIsCaller &&
        call.callerSnapshot?.name
      ) {
        const contactRef =
          doc(
            db,
            WORKER_CONTACTS_COLLECTION,
            call.calleeId,
            CUSTOMERS_SUBCOLLECTION,
            call.callerId,
          );

        const contactData:
          Record<string, unknown> = {
          customerId:
            call.callerId,

          name:
            call.callerSnapshot.name.slice(
              0,
              MAX_NAME_LENGTH,
            ),

          service:
            cleanString(
              call.callerSnapshot.service,
            ).slice(
              0,
              MAX_SERVICE_LENGTH,
            ),

          contactedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        };

        const customerImage =
          cleanHttpsImage(
            call.callerSnapshot.image,
          );

        if (customerImage) {
          contactData.image =
            customerImage;
        }

        transaction.set(
          contactRef,
          contactData,
          {
            merge: true,
          },
        );
      }

      /* ======================================================
         ALREADY CONNECTED
      ====================================================== */

      if (
        call.status ===
        "connected"
      ) {
        return;
      }

      /* ======================================================
         ONLY ACCEPTED CALL CAN CONNECT
      ====================================================== */

      if (
        call.status !==
        "accepted"
      ) {
        throw new Error(
          "Call must be accepted before connecting.",
        );
      }

      /* ======================================================
         UPDATE CALL
      ====================================================== */

      transaction.update(
        callRef,
        {
          status:
            "connected",

          connectedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
END CALL
============================================================ */

export async function endCall(
  callId: string,
  userId: string,
): Promise<void> {
  const normalizedCallId =
    cleanString(callId);

  const normalizedUserId =
    cleanString(userId);

  if (
    !normalizedCallId ||
    !normalizedUserId
  ) {
    throw new Error(
      "Call ID and user ID are required.",
    );
  }

  if (
    !isValidDocumentId(
      normalizedCallId,
    )
  ) {
    throw new Error(
      "Invalid call ID.",
    );
  }

  const authenticatedUserId =
    cleanString(
      auth.currentUser?.uid,
    );

  if (!authenticatedUserId) {
    throw new Error(
      "Please sign in before ending the call.",
    );
  }

  if (
    authenticatedUserId !==
    normalizedUserId
  ) {
    throw new Error(
      "Your session is no longer valid.",
    );
  }

  const callRef =
    doc(
      db,
      CALLS_COLLECTION,
      normalizedCallId,
    );

  await runTransaction(
    db,
    async (transaction) => {
      const snapshot =
        await transaction.get(
          callRef,
        );

      if (!snapshot.exists()) {
        throw new Error(
          "Call does not exist.",
        );
      }

      const call =
        mapCallSession(
          snapshot.id,
          snapshot.data(),
        );

      if (!call) {
        throw new Error(
          "Invalid call session.",
        );
      }

      const isCaller =
        call.callerId ===
        normalizedUserId;

      const isCallee =
        call.calleeId ===
        normalizedUserId;

      if (
        !isCaller &&
        !isCallee
      ) {
        throw new Error(
          "You are not a participant in this call.",
        );
      }

      /* ======================================================
         IDEMPOTENT END CALL
      ====================================================== */

      if (
        call.status === "ended" ||
        call.status === "declined" ||
        call.status === "missed" ||
        call.status === "failed"
      ) {
        return;
      }

      transaction.update(
        callRef,
        {
          status: "ended",

          endedAt:
            serverTimestamp(),

          endedBy:
            normalizedUserId,
        },
      );
    },
  );
}