import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type StorageReference,
} from "firebase/storage";

import {
  auth,
  db,
  storage,
} from "../firebase/config";

import type {
  FirebaseShopRequest,
  FirebaseShopRequestStatus,
} from "../types/firebaseShopRequest";

/* ============================================================
   LIMITS
============================================================ */

const MAX_REQUEST_PHOTOS = 4;

const MAX_PHOTO_SIZE_BYTES =
  5 * 1024 * 1024;

const MAX_DESCRIPTION_LENGTH = 500;

const MAX_CUSTOMER_NAME_LENGTH = 120;

/* ============================================================
   TYPES
============================================================ */

export type CreateShopRequestInput = {
  requestId: string;
  shopId: string;
  serviceId: string;

  requestedDateKey: string;
  requestedDateLabel: string;
  requestedTime: string;

  description: string;

  photoUris: string[];
};

type ShopMedia = {
  shopPhotoUrl: string;
  shopLogoUrl: string;
};

type UploadedRequestPhoto = {
  url: string;
  storageRef: StorageReference;
};

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isHttpsUrl(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    /^https:\/\//i.test(
      value.trim(),
    )
  );
}

function normalizeStatus(
  value: unknown,
): FirebaseShopRequestStatus {
  if (
    value === "accepted" ||
    value === "declined" ||
    value === "completed" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "pending";
}

/* ============================================================
   CUSTOMER NAME
============================================================ */

function buildCustomerFullName(
  data: DocumentData,
): string {
  const fullName =
    cleanString(
      data.fullName,
    );

  if (fullName) {
    return fullName;
  }

  return [
    cleanString(
      data.firstName,
    ),
    cleanString(
      data.otherName,
    ),
    cleanString(
      data.surname,
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

/* ============================================================
   CUSTOMER PHOTO
============================================================ */

function getCustomerPhotoCandidate(
  data: DocumentData,
): string {
  const candidates = [
    data.photoUrl,
    data.profilePhotoUrl,
    data.photoURL,
    data.profileImageUrl,
    data.avatarUrl,
  ];

  for (const value of candidates) {
    const normalized =
      cleanString(value);

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

/* ============================================================
   SHOP PHOTO
============================================================ */

function getShopPhotoCandidate(
  data: DocumentData,
): string {
  const candidates = [
    data.coverPhotoUrl,
    data.shopPhotoUrl,
    data.coverImageUrl,
    data.photoUrl,
    data.imageUrl,
    data.image,
    data.photo,
  ];

  for (const value of candidates) {
    const normalized =
      cleanString(value);

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

/* ============================================================
   SHOP LOGO
============================================================ */

function getShopLogoCandidate(
  data: DocumentData,
): string {
  const candidates = [
    data.logoUrl,
    data.shopLogoUrl,
    data.logo,
    data.avatarUrl,
    data.profilePhotoUrl,
  ];

  for (const value of candidates) {
    const normalized =
      cleanString(value);

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

/* ============================================================
   SERVICE IMAGE
============================================================ */

function getServiceImageCandidate(
  data: DocumentData,
): string {
  const candidates = [
    data.serviceImageUrl,
    data.imageUrl,
    data.imageURL,
    data.photoUrl,
    data.photoURL,
    data.image,
    data.photo,
    data.coverPhotoUrl,
    data.coverImageUrl,
  ];

  for (const value of candidates) {
    const normalized =
      cleanString(value);

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

/* ============================================================
   RESOLVE STORAGE URL
============================================================ */

async function resolveStorageUrl(
  value: unknown,
): Promise<string> {
  const normalized =
    cleanString(value);

  if (!normalized) {
    return "";
  }

  if (
    isHttpsUrl(
      normalized,
    )
  ) {
    return normalized;
  }

  try {
    const storageRef =
      ref(
        storage,
        normalized,
      );

    const downloadUrl =
      await getDownloadURL(
        storageRef,
      );

    const secureUrl =
      cleanString(
        downloadUrl,
      );

    if (
      isHttpsUrl(
        secureUrl,
      )
    ) {
      return secureUrl;
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "Unable to resolve Storage URL:",
        error,
      );
    }
  }

  return "";
}

async function resolveCustomerPhotoUrl(
  value: unknown,
): Promise<string> {
  return resolveStorageUrl(
    value,
  );
}

async function resolveShopPhotoUrl(
  value: unknown,
): Promise<string> {
  return resolveStorageUrl(
    value,
  );
}

async function resolveServiceImageUrl(
  value: unknown,
): Promise<string> {
  return resolveStorageUrl(
    value,
  );
}

/* ============================================================
   LOAD CUSTOMER PROFILE PHOTO
============================================================ */

async function loadCustomerProfilePhoto(
  customerId: string,
): Promise<string> {
  const normalizedCustomerId =
    cleanString(
      customerId,
    );

  if (!normalizedCustomerId) {
    return "";
  }

  try {
    const customerProfileRef =
      doc(
        db,
        "users",
        normalizedCustomerId,
      );

    const snapshot =
      await getDoc(
        customerProfileRef,
      );

    if (
      !snapshot.exists()
    ) {
      return "";
    }

    const customerData =
      snapshot.data();

    const candidate =
      getCustomerPhotoCandidate(
        customerData,
      );

    if (!candidate) {
      return "";
    }

    return await resolveCustomerPhotoUrl(
      candidate,
    );
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "Customer profile photo lookup failed:",
        error,
      );
    }

    return "";
  }
}

/* ============================================================
   LOAD SHOP MEDIA
============================================================ */

async function loadShopMedia(
  shopId: string,
): Promise<ShopMedia> {
  const normalizedShopId =
    cleanString(
      shopId,
    );

  if (!normalizedShopId) {
    return {
      shopPhotoUrl: "",
      shopLogoUrl: "",
    };
  }

  try {
    const shopRef =
      doc(
        db,
        "shops",
        normalizedShopId,
      );

    const shopSnapshot =
      await getDoc(
        shopRef,
      );

    if (
      !shopSnapshot.exists()
    ) {
      return {
        shopPhotoUrl: "",
        shopLogoUrl: "",
      };
    }

    const shopData =
      shopSnapshot.data();

    const photoCandidate =
      getShopPhotoCandidate(
        shopData,
      );

    const logoCandidate =
      getShopLogoCandidate(
        shopData,
      );

    const [
      shopPhotoUrl,
      shopLogoUrl,
    ] =
      await Promise.all([
        resolveShopPhotoUrl(
          photoCandidate,
        ),
        resolveShopPhotoUrl(
          logoCandidate,
        ),
      ]);

    return {
      shopPhotoUrl,
      shopLogoUrl,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "Shop media lookup failed:",
        error,
      );
    }

    return {
      shopPhotoUrl: "",
      shopLogoUrl: "",
    };
  }
}

/* ============================================================
   LOAD SERVICE IMAGE
============================================================ */

async function loadServiceImage(
  shopId: string,
  serviceId: string,
): Promise<string> {
  const normalizedShopId =
    cleanString(
      shopId,
    );

  const normalizedServiceId =
    cleanString(
      serviceId,
    );

  if (
    !normalizedShopId ||
    !normalizedServiceId
  ) {
    return "";
  }

  try {
    const serviceRef =
      doc(
        db,
        "shops",
        normalizedShopId,
        "services",
        normalizedServiceId,
      );

    const serviceSnapshot =
      await getDoc(
        serviceRef,
      );

    if (
      !serviceSnapshot.exists()
    ) {
      return "";
    }

    const serviceData =
      serviceSnapshot.data();

    const candidate =
      getServiceImageCandidate(
        serviceData,
      );

    if (!candidate) {
      return "";
    }

    return await resolveServiceImageUrl(
      candidate,
    );
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "Service image lookup failed:",
        error,
      );
    }

    return "";
  }
}

/* ============================================================
   STORED CUSTOMER PHOTO
============================================================ */

function getStoredRequestPhotoUrl(
  data: DocumentData,
): string {
  const candidates = [
    data.customerPhotoUrl,
    data.customerPhotoURL,
  ];

  for (const value of candidates) {
    const normalized =
      cleanString(value);

    if (
      normalized &&
      isHttpsUrl(
        normalized,
      )
    ) {
      return normalized;
    }
  }

  return "";
}

/* ============================================================
   STORED SHOP PHOTO
============================================================ */

function getStoredShopPhotoUrl(
  data: DocumentData,
): string {
  const candidates = [
    data.shopPhotoUrl,
    data.shopCoverPhotoUrl,
    data.shopPhotoURL,
  ];

  for (const value of candidates) {
    const normalized =
      cleanString(value);

    if (
      normalized &&
      isHttpsUrl(
        normalized,
      )
    ) {
      return normalized;
    }
  }

  return "";
}

/* ============================================================
   STORED SHOP LOGO
============================================================ */

function getStoredShopLogoUrl(
  data: DocumentData,
): string {
  const candidates = [
    data.shopLogoUrl,
    data.shopLogoURL,
  ];

  for (const value of candidates) {
    const normalized =
      cleanString(value);

    if (
      normalized &&
      isHttpsUrl(
        normalized,
      )
    ) {
      return normalized;
    }
  }

  return "";
}

/* ============================================================
   STORED SERVICE IMAGE
============================================================ */

function getStoredServiceImageUrl(
  data: DocumentData,
): string {
  const value =
    cleanString(
      data.serviceImageUrl,
    );

  if (
    value &&
    isHttpsUrl(
      value,
    )
  ) {
    return value;
  }

  return "";
}

/* ============================================================
   REQUEST ID
============================================================ */

export function createShopRequestId(): string {
  return doc(
    collection(
      db,
      "shopRequests",
    ),
  ).id;
}

/* ============================================================
   IMAGE HELPERS
============================================================ */

function getImageContentType(
  uri: string,
): string {
  const cleanUri =
    uri
      .split("?")[0]
      .toLowerCase();

  if (
    cleanUri.endsWith(".png")
  ) {
    return "image/png";
  }

  if (
    cleanUri.endsWith(".webp")
  ) {
    return "image/webp";
  }

  if (
    cleanUri.endsWith(".heic") ||
    cleanUri.endsWith(".heif")
  ) {
    return "image/heic";
  }

  return "image/jpeg";
}

function getImageExtension(
  contentType: string,
): string {
  switch (contentType) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/heic":
      return "heic";

    default:
      return "jpg";
  }
}

/* ============================================================
   READ IMAGE BLOB
============================================================ */

async function readImageBlob(
  uri: string,
): Promise<Blob> {
  const normalizedUri =
    uri.trim();

  if (!normalizedUri) {
    throw new Error(
      "One of the selected photos is invalid.",
    );
  }

  let response: Response;

  try {
    response =
      await fetch(
        normalizedUri,
      );
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "Request photo read failed:",
        error,
      );
    }

    throw new Error(
      "Unable to read one of the selected photos.",
    );
  }

  if (!response.ok) {
    throw new Error(
      "Unable to read one of the selected photos.",
    );
  }

  const blob =
    await response.blob();

  if (
    !blob ||
    blob.size <= 0
  ) {
    throw new Error(
      "One of the selected photos is empty or invalid.",
    );
  }

  if (
    blob.size >
    MAX_PHOTO_SIZE_BYTES
  ) {
    throw new Error(
      "Each request photo must be 5 MB or smaller.",
    );
  }

  return blob;
}

/* ============================================================
   UPLOAD REQUEST PHOTO
============================================================ */

async function uploadRequestPhoto({
  customerId,
  requestId,
  uri,
  index,
}: {
  customerId: string;
  requestId: string;
  uri: string;
  index: number;
}): Promise<UploadedRequestPhoto> {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "Your session has expired. Please sign in again.",
    );
  }

  const authUid =
    cleanString(
      user.uid,
    );

  const normalizedCustomerId =
    cleanString(
      customerId,
    );

  const normalizedRequestId =
    cleanString(
      requestId,
    );

  if (!authUid) {
    throw new Error(
      "Authenticated user ID is unavailable.",
    );
  }

  if (!normalizedCustomerId) {
    throw new Error(
      "Customer ID is missing.",
    );
  }

  if (
    authUid !==
    normalizedCustomerId
  ) {
    throw new Error(
      "Customer authentication mismatch. Please sign in again.",
    );
  }

  if (!normalizedRequestId) {
    throw new Error(
      "Request ID is missing.",
    );
  }

  if (
    normalizedRequestId.length >
    128
  ) {
    throw new Error(
      "Request ID is too long.",
    );
  }

  if (
    index < 0 ||
    index >= MAX_REQUEST_PHOTOS
  ) {
    throw new Error(
      "Invalid request photo index.",
    );
  }

  const normalizedUri =
    uri.trim();

  if (!normalizedUri) {
    throw new Error(
      "One of the selected photos is invalid.",
    );
  }

  const contentType =
    getImageContentType(
      normalizedUri,
    );

  const extension =
    getImageExtension(
      contentType,
    );

  const fileName =
    `photo-${index}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${extension}`;

  const storagePath = [
    "shop-requests",
    normalizedCustomerId,
    normalizedRequestId,
    fileName,
  ].join("/");

  const imageRef =
    ref(
      storage,
      storagePath,
    );

  const blob =
    await readImageBlob(
      normalizedUri,
    );

  try {
    if (__DEV__) {
      console.log(
        "SHOP_REQUEST_STEP: photo-upload",
        {
          authUid,
          customerId:
            normalizedCustomerId,
          requestId:
            normalizedRequestId,
          storagePath,
          contentType,
          size: blob.size,
          bucket:
            storage.app.options
              .storageBucket ??
            null,
        },
      );
    }

    await uploadBytes(
      imageRef,
      blob,
      {
        contentType,

        cacheControl:
          "public,max-age=31536000,immutable",
      },
    );

    const url =
      await getDownloadURL(
        imageRef,
      );

    const normalizedUrl =
      cleanString(
        url,
      );

    if (
      !normalizedUrl ||
      !isHttpsUrl(
        normalizedUrl,
      )
    ) {
      throw new Error(
        "Photo upload did not return a valid secure URL.",
      );
    }

    return {
      url:
        normalizedUrl,

      storageRef:
        imageRef,
    };
  } catch (error) {
    if (__DEV__) {
      console.error(
        "SHOP_REQUEST_STEP_FAILED: photo-upload",
        {
          authUid,
          customerId:
            normalizedCustomerId,
          requestId:
            normalizedRequestId,
          storagePath,
          bucket:
            storage.app.options
              .storageBucket ??
            null,
          error,
        },
      );
    }

    try {
      await deleteObject(
        imageRef,
      );
    } catch {
      // Best-effort cleanup.
    }

    throw error;
  } finally {
    const closableBlob =
      blob as Blob & {
        close?: () => void;
      };

    try {
      closableBlob.close?.();
    } catch {
      // Ignore cleanup failure.
    }
  }
}

/* ============================================================
   DELETE UPLOADED REQUEST PHOTOS
============================================================ */

async function cleanupUploadedRequestPhotos(
  uploadedPhotos:
    UploadedRequestPhoto[],
): Promise<void> {
  if (
    uploadedPhotos.length === 0
  ) {
    return;
  }

  const results =
    await Promise.allSettled(
      uploadedPhotos.map(
        photo =>
          deleteObject(
            photo.storageRef,
          ),
      ),
    );

  const failed =
    results.some(
      result =>
        result.status ===
        "rejected",
    );

  if (
    failed &&
    __DEV__
  ) {
    console.warn(
      "Some shop request photos could not be cleaned up.",
    );
  }
}

/* ============================================================
   CREATE SHOP REQUEST
============================================================ */

export async function createShopRequest(
  input: CreateShopRequestInput,
): Promise<string> {
  let currentStep =
    "initialization";

  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in to send a shop request.",
    );
  }

  if (!input) {
    throw new Error(
      "Request information is missing.",
    );
  }

  const authUid =
    cleanString(
      user.uid,
    );

  if (!authUid) {
    throw new Error(
      "Authenticated user ID is unavailable.",
    );
  }

  const customerId =
    authUid;

  const requestId =
    cleanString(
      input.requestId,
    );

  const shopId =
    cleanString(
      input.shopId,
    );

  const serviceId =
    cleanString(
      input.serviceId,
    );

  const requestedDateKey =
    cleanString(
      input.requestedDateKey,
    );

  const requestedDateLabel =
    cleanString(
      input.requestedDateLabel,
    );

  const requestedTime =
    cleanString(
      input.requestedTime,
    );

  const description =
    cleanString(
      input.description,
    ).slice(
      0,
      MAX_DESCRIPTION_LENGTH,
    );

  const rawPhotoUris =
    Array.isArray(
      input.photoUris,
    )
      ? input.photoUris
      : [];

  const photoUris =
    Array.from(
      new Set(
        rawPhotoUris
          .filter(
            (
              uri,
            ): uri is string =>
              typeof uri ===
              "string",
          )
          .map(uri =>
            uri.trim(),
          )
          .filter(Boolean),
      ),
    );

  /* ==========================================================
     VALIDATION
  ========================================================== */

  if (!customerId) {
    throw new Error(
      "Customer information is unavailable.",
    );
  }

  if (!requestId) {
    throw new Error(
      "Request information is missing.",
    );
  }

  if (
    requestId.length >
    128
  ) {
    throw new Error(
      "Request ID is too long.",
    );
  }

  if (!shopId) {
    throw new Error(
      "Shop information is missing.",
    );
  }

  if (!serviceId) {
    throw new Error(
      "Service information is missing.",
    );
  }

  if (
    !requestedDateKey ||
    !requestedDateLabel
  ) {
    throw new Error(
      "Select a preferred date.",
    );
  }

  if (!requestedTime) {
    throw new Error(
      "Select a preferred time.",
    );
  }

  if (
    photoUris.length >
    MAX_REQUEST_PHOTOS
  ) {
    throw new Error(
      `You can upload up to ${MAX_REQUEST_PHOTOS} photos.`,
    );
  }

  /* ==========================================================
     REQUEST REFERENCE
  ========================================================== */

  const requestRef =
    doc(
      db,
      "shopRequests",
      requestId,
    );

  /*
   * IMPORTANT:
   *
   * Do NOT call getDoc(requestRef) here.
   *
   * A new shop request does not exist yet, so the Firestore
   * get rule cannot authorize the read using resource.data.
   *
   * The Firestore create rule remains the security authority.
   */

  /* ==========================================================
     LOAD SHOP
  ========================================================== */

  currentStep =
    "shop-read";

  let shopSnapshot:
    DocumentSnapshot<DocumentData>;

  try {
    shopSnapshot =
      await getDoc(
        doc(
          db,
          "shops",
          shopId,
        ),
      );
  } catch (error) {
    if (__DEV__) {
      console.error(
        "SHOP_REQUEST_STEP_FAILED: shop-read",
        error,
      );
    }

    throw error;
  }

  if (
    !shopSnapshot.exists()
  ) {
    throw new Error(
      "This shop is no longer available.",
    );
  }

  const shopData =
    shopSnapshot.data();

  if (
    shopData.isActive !==
    true
  ) {
    throw new Error(
      "This shop is currently unavailable.",
    );
  }

  const workerId =
    cleanString(
      shopData.ownerId,
    );

  const shopName =
    cleanString(
      shopData.name,
    );

  if (!workerId) {
    throw new Error(
      "Shop provider information is unavailable.",
    );
  }

  if (!shopName) {
    throw new Error(
      "Shop information is invalid.",
    );
  }

  if (
    workerId ===
    customerId
  ) {
    throw new Error(
      "You cannot send a service request to your own shop.",
    );
  }

  /* ==========================================================
     SHOP MEDIA
  ========================================================== */

  const shopPhotoUrl =
    cleanString(
      shopData.coverPhotoUrl,
    );

  const shopLogoUrl =
    cleanString(
      shopData.logoUrl,
    );

  if (
    !isHttpsUrl(
      shopPhotoUrl,
    )
  ) {
    throw new Error(
      "Shop cover photo is invalid.",
    );
  }

  if (
    !isHttpsUrl(
      shopLogoUrl,
    )
  ) {
    throw new Error(
      "Shop logo is invalid.",
    );
  }

  /* ==========================================================
     LOAD SERVICE
  ========================================================== */

  currentStep =
    "service-read";

  let serviceSnapshot:
    DocumentSnapshot<DocumentData>;

  try {
    serviceSnapshot =
      await getDoc(
        doc(
          db,
          "shops",
          shopId,
          "services",
          serviceId,
        ),
      );
  } catch (error) {
    if (__DEV__) {
      console.error(
        "SHOP_REQUEST_STEP_FAILED: service-read",
        error,
      );
    }

    throw error;
  }

  if (
    !serviceSnapshot.exists()
  ) {
    throw new Error(
      "This service is no longer available.",
    );
  }

  const serviceData =
    serviceSnapshot.data();

  if (
    serviceData.isActive !==
    true
  ) {
    throw new Error(
      "This service is currently unavailable.",
    );
  }

  const storedServiceId =
    cleanString(
      serviceData.id,
    );

  if (
    storedServiceId &&
    storedServiceId !==
      serviceId
  ) {
    throw new Error(
      "Service information is invalid.",
    );
  }

  const serviceName =
    cleanString(
      serviceData.name,
    );

  const servicePrice =
    typeof serviceData.startingPrice ===
      "number" &&
    Number.isFinite(
      serviceData.startingPrice,
    )
      ? serviceData.startingPrice
      : 0;

  if (!serviceName) {
    throw new Error(
      "Service information is invalid.",
    );
  }

  if (
    servicePrice <= 0
  ) {
    throw new Error(
      "Service price is invalid.",
    );
  }

  /* ==========================================================
     SERVICE IMAGE
  ========================================================== */

  const serviceImageUrl =
    cleanString(
      serviceData.imageUrl,
    );

  if (
    !isHttpsUrl(
      serviceImageUrl,
    )
  ) {
    throw new Error(
      "Service image is invalid.",
    );
  }

  /* ==========================================================
     CUSTOMER PROFILE
  ========================================================== */

  currentStep =
    "customer-profile-read";

  let customerName = "";

  let customerPhotoUrl = "";

  try {
    const customerProfileRef =
      doc(
        db,
        "users",
        customerId,
      );

    const customerProfileSnapshot =
      await getDoc(
        customerProfileRef,
      );

    if (
      customerProfileSnapshot.exists()
    ) {
      const customerData =
        customerProfileSnapshot.data();

      customerName =
        buildCustomerFullName(
          customerData,
        );

      const candidate =
        getCustomerPhotoCandidate(
          customerData,
        );

      customerPhotoUrl =
        await resolveCustomerPhotoUrl(
          candidate,
        );
    }
  } catch (profileError) {
    if (__DEV__) {
      console.warn(
        "Customer profile lookup failed. Continuing without profile photo/name.",
        profileError,
      );
    }
  }

  /* ==========================================================
     AUTH PHOTO FALLBACK
  ========================================================== */

  if (!customerPhotoUrl) {
    customerPhotoUrl =
      await resolveCustomerPhotoUrl(
        user.photoURL,
      );
  }

  /* ==========================================================
     CUSTOMER NAME FALLBACK
  ========================================================== */

  if (!customerName) {
    customerName =
      cleanString(
        user.displayName,
      );
  }

  if (!customerName) {
    customerName =
      cleanString(
        user.email?.split(
          "@",
        )[0],
      );
  }

  if (!customerName) {
    customerName =
      "Customer";
  }

  customerName =
    customerName
      .slice(
        0,
        MAX_CUSTOMER_NAME_LENGTH,
      )
      .trim();

  /* ==========================================================
     UPLOAD + CREATE
  ========================================================== */

  const uploadedPhotos:
    UploadedRequestPhoto[] = [];

  try {
    currentStep =
      "photo-upload";

    const uploadResults =
      await Promise.all(
        photoUris.map(
          (
            uri,
            index,
          ) =>
            uploadRequestPhoto({
              customerId,
              requestId,
              uri,
              index,
            }),
        ),
      );

    uploadedPhotos.push(
      ...uploadResults,
    );

    const photoUrls =
      uploadResults.map(
        photo =>
          photo.url,
      );

    /* ========================================================
       FINAL FIRESTORE WRITE
    ======================================================== */

    currentStep =
      "firestore-create";

    if (__DEV__) {
      console.log(
        "SHOP_REQUEST_STEP: firestore-create",
        {
          requestId,
          shopId,
          serviceId,
          customerId,
          workerId,
          photoCount:
            photoUrls.length,
        },
      );
    }

    await setDoc(
      requestRef,
      {
        id:
          requestId,

        shopId,

        shopName,

        shopPhotoUrl,

        shopLogoUrl,

        workerId,

        customerId,

        customerName,

        customerPhotoUrl:
          customerPhotoUrl ||
          null,

        serviceId,

        serviceName,

        servicePrice,

        serviceImageUrl,

        requestedDateKey,

        requestedDateLabel,

        requestedTime,

        description,

        photoUrls,

        status:
          "pending",

        deletedByCustomer:
          false,

        deletedByCustomerAt:
          null,

        deletedByWorker:
          false,

        deletedByWorkerAt:
          null,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
      {
        merge:
          false,
      },
    );

    if (__DEV__) {
      console.log(
        "SHOP_REQUEST_STEP: completed",
        {
          requestId,
        },
      );
    }

    return requestId;
  } catch (error) {
    await cleanupUploadedRequestPhotos(
      uploadedPhotos,
    );

    if (__DEV__) {
      console.error(
        "SHOP_REQUEST_STEP_FAILED",
        {
          step:
            currentStep,
          requestId,
          shopId,
          serviceId,
          customerId,
          error,
        },
      );
    }

    throw error;
  }
}

/* ============================================================
   MAP REQUEST
============================================================ */

async function mapRequest(
  snapshot:
    DocumentSnapshot<DocumentData>,

  customerPhotoCache:
    Map<string, string>,

  shopMediaCache:
    Map<string, ShopMedia>,

  serviceImageCache:
    Map<string, string>,
): Promise<FirebaseShopRequest> {
  const data =
    snapshot.data();

  if (!data) {
    throw new Error(
      "Shop request data is unavailable.",
    );
  }

  /* ==========================================================
     SHOP
  ========================================================== */

  const shopId =
    cleanString(
      data.shopId,
    );

  const shopName =
    cleanString(
      data.shopName,
    ) ||
    "Service Shop";

  let shopPhotoUrl =
    getStoredShopPhotoUrl(
      data,
    );

  let shopLogoUrl =
    getStoredShopLogoUrl(
      data,
    );

  if (
    shopId &&
    (!shopPhotoUrl ||
      !shopLogoUrl)
  ) {
    if (
      shopMediaCache.has(
        shopId,
      )
    ) {
      const cached =
        shopMediaCache.get(
          shopId,
        );

      if (cached) {
        if (!shopPhotoUrl) {
          shopPhotoUrl =
            cached.shopPhotoUrl;
        }

        if (!shopLogoUrl) {
          shopLogoUrl =
            cached.shopLogoUrl;
        }
      }
    } else {
      const media =
        await loadShopMedia(
          shopId,
        );

      shopMediaCache.set(
        shopId,
        media,
      );

      if (!shopPhotoUrl) {
        shopPhotoUrl =
          media.shopPhotoUrl;
      }

      if (!shopLogoUrl) {
        shopLogoUrl =
          media.shopLogoUrl;
      }
    }
  }

  /* ==========================================================
     CUSTOMER
  ========================================================== */

  const customerId =
    cleanString(
      data.customerId,
    );

  const customerName =
    cleanString(
      data.customerName,
    ) ||
    "Customer";

  let customerPhotoUrl =
    getStoredRequestPhotoUrl(
      data,
    );

  if (
    !customerPhotoUrl &&
    customerId
  ) {
    if (
      customerPhotoCache.has(
        customerId,
      )
    ) {
      customerPhotoUrl =
        customerPhotoCache.get(
          customerId,
        ) ?? "";
    } else {
      customerPhotoUrl =
        await loadCustomerProfilePhoto(
          customerId,
        );

      customerPhotoCache.set(
        customerId,
        customerPhotoUrl,
      );
    }
  }

  /* ==========================================================
     SERVICE
  ========================================================== */

  const serviceId =
    cleanString(
      data.serviceId,
    );

  const serviceName =
    cleanString(
      data.serviceName,
    ) ||
    "Service";

  const servicePrice =
    typeof data.servicePrice ===
      "number" &&
    Number.isFinite(
      data.servicePrice,
    )
      ? data.servicePrice
      : 0;

  let serviceImageUrl =
    getStoredServiceImageUrl(
      data,
    );

  if (
    !serviceImageUrl &&
    shopId &&
    serviceId
  ) {
    const cacheKey =
      `${shopId}:${serviceId}`;

    if (
      serviceImageCache.has(
        cacheKey,
      )
    ) {
      serviceImageUrl =
        serviceImageCache.get(
          cacheKey,
        ) ?? "";
    } else {
      serviceImageUrl =
        await loadServiceImage(
          shopId,
          serviceId,
        );

      serviceImageCache.set(
        cacheKey,
        serviceImageUrl,
      );
    }
  }

  /* ==========================================================
     REQUEST PHOTOS
  ========================================================== */

  const photoUrls =
    Array.isArray(
      data.photoUrls,
    )
      ? Array.from(
          new Set(
            data.photoUrls
              .filter(
                (
                  value,
                ): value is string =>
                  typeof value ===
                  "string",
              )
              .map(value =>
                value.trim(),
              )
              .filter(
                value =>
                  Boolean(value) &&
                  isHttpsUrl(
                    value,
                  ),
              ),
          ),
        ).slice(
          0,
          MAX_REQUEST_PHOTOS,
        )
      : [];

  /* ==========================================================
     STATUS
  ========================================================== */

  const status =
    normalizeStatus(
      data.status,
    );

  return {
    id:
      snapshot.id,

    shopId,

    shopName,

    shopPhotoUrl:
      shopPhotoUrl ||
      null,

    shopLogoUrl:
      shopLogoUrl ||
      null,

    workerId:
      cleanString(
        data.workerId,
      ),

    customerId,

    customerName,

    customerPhotoUrl:
      customerPhotoUrl ||
      null,

    serviceId,

    serviceName,

    servicePrice,

    serviceImageUrl:
      serviceImageUrl ||
      null,

    requestedDateKey:
      cleanString(
        data.requestedDateKey,
      ),

    requestedDateLabel:
      cleanString(
        data.requestedDateLabel,
      ),

    requestedTime:
      cleanString(
        data.requestedTime,
      ),

    description:
      cleanString(
        data.description,
      ).slice(
        0,
        MAX_DESCRIPTION_LENGTH,
      ),

    photoUrls,

    status,

    deletedByCustomer:
      data.deletedByCustomer ===
      true,

    deletedByCustomerAt:
      data.deletedByCustomerAt ??
      null,

    deletedByWorker:
      data.deletedByWorker ===
      true,

    deletedByWorkerAt:
      data.deletedByWorkerAt ??
      null,

    createdAt:
      data.createdAt ??
      null,

    updatedAt:
      data.updatedAt ??
      null,
  };
}

/* ============================================================
   SINGLE CUSTOMER REQUEST
============================================================ */

export function subscribeToCustomerShopRequest(
  requestId: string,

  onChange: (
    request:
      | FirebaseShopRequest
      | null,
  ) => void,

  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in to view this request.",
    );
  }

  const customerId =
    cleanString(
      user.uid,
    );

  const normalizedRequestId =
    cleanString(
      requestId,
    );

  if (!customerId) {
    throw new Error(
      "Customer information is unavailable.",
    );
  }

  if (!normalizedRequestId) {
    throw new Error(
      "Request ID is required.",
    );
  }

  const requestRef =
    doc(
      db,
      "shopRequests",
      normalizedRequestId,
    );

  const customerPhotoCache =
    new Map<string, string>();

  const shopMediaCache =
    new Map<string, ShopMedia>();

  const serviceImageCache =
    new Map<string, string>();

  let active = true;

  const unsubscribe =
    onSnapshot(
      requestRef,

      snapshot => {
        if (!active) {
          return;
        }

        if (
          !snapshot.exists()
        ) {
          onChange(null);
          return;
        }

        const data =
          snapshot.data();

        if (
          cleanString(
            data.customerId,
          ) !== customerId
        ) {
          onChange(null);

          onError?.(
            new Error(
              "You cannot view this request.",
            ),
          );

          return;
        }

        if (
          data.deletedByCustomer ===
          true
        ) {
          onChange(null);
          return;
        }

        void mapRequest(
          snapshot,
          customerPhotoCache,
          shopMediaCache,
          serviceImageCache,
        )
          .then(request => {
            if (active) {
              onChange(
                request,
              );
            }
          })
          .catch(error => {
            if (__DEV__) {
              console.error(
                "Map customer shop request failed:",
                error,
              );
            }

            if (active) {
              onError?.(
                error instanceof Error
                  ? error
                  : new Error(
                      "Unable to load this request.",
                    ),
              );
            }
          });
      },

      error => {
        if (!active) {
          return;
        }

        if (__DEV__) {
          console.error(
            "Customer shop request subscription failed:",
            error,
          );
        }

        onError?.(
          error,
        );
      },
    );

  return () => {
    active = false;
    unsubscribe();
  };
}

/* ============================================================
   SINGLE WORKER REQUEST
============================================================ */

export function subscribeToWorkerShopRequest(
  requestId: string,

  onChange: (
    request:
      | FirebaseShopRequest
      | null,
  ) => void,

  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in to view this request.",
    );
  }

  const workerId =
    cleanString(
      user.uid,
    );

  const normalizedRequestId =
    cleanString(
      requestId,
    );

  if (!workerId) {
    throw new Error(
      "Worker information is unavailable.",
    );
  }

  if (!normalizedRequestId) {
    throw new Error(
      "Request ID is required.",
    );
  }

  const requestRef =
    doc(
      db,
      "shopRequests",
      normalizedRequestId,
    );

  const customerPhotoCache =
    new Map<string, string>();

  const shopMediaCache =
    new Map<string, ShopMedia>();

  const serviceImageCache =
    new Map<string, string>();

  let active = true;

  const unsubscribe =
    onSnapshot(
      requestRef,

      snapshot => {
        if (!active) {
          return;
        }

        if (
          !snapshot.exists()
        ) {
          onChange(null);
          return;
        }

        const data =
          snapshot.data();

        if (
          cleanString(
            data.workerId,
          ) !== workerId
        ) {
          onChange(null);

          onError?.(
            new Error(
              "You cannot view this request.",
            ),
          );

          return;
        }

        if (
          data.deletedByWorker ===
          true
        ) {
          onChange(null);
          return;
        }

        void mapRequest(
          snapshot,
          customerPhotoCache,
          shopMediaCache,
          serviceImageCache,
        )
          .then(request => {
            if (active) {
              onChange(
                request,
              );
            }
          })
          .catch(error => {
            if (__DEV__) {
              console.error(
                "Map worker shop request failed:",
                error,
              );
            }

            if (active) {
              onError?.(
                error instanceof Error
                  ? error
                  : new Error(
                      "Unable to load this request.",
                    ),
              );
            }
          });
      },

      error => {
        if (!active) {
          return;
        }

        if (__DEV__) {
          console.error(
            "Worker shop request subscription failed:",
            error,
          );
        }

        onError?.(
          error,
        );
      },
    );

  return () => {
    active = false;
    unsubscribe();
  };
}

/* ============================================================
   WORKER REALTIME REQUESTS
============================================================ */

export function subscribeToWorkerShopRequests(
  workerId: string,

  onChange: (
    requests:
      FirebaseShopRequest[],
  ) => void,

  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const normalizedWorkerId =
    cleanString(
      workerId,
    );

  if (!normalizedWorkerId) {
    throw new Error(
      "Worker ID is required.",
    );
  }

  const currentUser =
    auth.currentUser;

  if (
    !currentUser ||
    cleanString(
      currentUser.uid,
    ) !== normalizedWorkerId
  ) {
    throw new Error(
      "You can only load requests for the signed-in worker.",
    );
  }

  const requestQuery =
    query(
      collection(
        db,
        "shopRequests",
      ),
      where(
        "workerId",
        "==",
        normalizedWorkerId,
      ),
    );

  const customerPhotoCache =
    new Map<string, string>();

  const shopMediaCache =
    new Map<string, ShopMedia>();

  const serviceImageCache =
    new Map<string, string>();

  let active = true;

  let snapshotVersion = 0;

  const unsubscribe =
    onSnapshot(
      requestQuery,

      snapshot => {
        if (!active) {
          return;
        }

        const currentVersion =
          ++snapshotVersion;

        const visibleDocuments =
          snapshot.docs.filter(
            document =>
              document.data()
                .deletedByWorker !==
              true,
          );

        void Promise.all(
          visibleDocuments.map(
            document =>
              mapRequest(
                document,
                customerPhotoCache,
                shopMediaCache,
                serviceImageCache,
              ),
          ),
        )
          .then(requests => {
            if (
              !active ||
              currentVersion !==
                snapshotVersion
            ) {
              return;
            }

            requests.sort(
              (
                a,
                b,
              ) => {
                const aTime =
                  a.createdAt
                    ?.toMillis?.() ??
                  0;

                const bTime =
                  b.createdAt
                    ?.toMillis?.() ??
                  0;

                return (
                  bTime -
                  aTime
                );
              },
            );

            onChange(
              requests,
            );
          })
          .catch(error => {
            if (__DEV__) {
              console.error(
                "Worker shop requests mapping failed:",
                error,
              );
            }

            if (active) {
              onError?.(
                error instanceof Error
                  ? error
                  : new Error(
                      "Unable to load shop requests.",
                    ),
              );
            }
          });
      },

      error => {
        if (!active) {
          return;
        }

        if (__DEV__) {
          console.error(
            "Worker shop requests subscription failed:",
            error,
          );
        }

        onError?.(
          error,
        );
      },
    );

  return () => {
    active = false;
    unsubscribe();
  };
}

/* ============================================================
   CUSTOMER REALTIME REQUESTS
============================================================ */

export function subscribeToCustomerShopRequests(
  customerId: string,

  onChange: (
    requests:
      FirebaseShopRequest[],
  ) => void,

  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const normalizedCustomerId =
    cleanString(
      customerId,
    );

  if (!normalizedCustomerId) {
    throw new Error(
      "Customer ID is required.",
    );
  }

  const currentUser =
    auth.currentUser;

  if (
    !currentUser ||
    cleanString(
      currentUser.uid,
    ) !== normalizedCustomerId
  ) {
    throw new Error(
      "You can only load requests for the signed-in customer.",
    );
  }

  const requestQuery =
    query(
      collection(
        db,
        "shopRequests",
      ),
      where(
        "customerId",
        "==",
        normalizedCustomerId,
      ),
    );

  const customerPhotoCache =
    new Map<string, string>();

  const shopMediaCache =
    new Map<string, ShopMedia>();

  const serviceImageCache =
    new Map<string, string>();

  let active = true;

  let snapshotVersion = 0;

  const unsubscribe =
    onSnapshot(
      requestQuery,

      snapshot => {
        if (!active) {
          return;
        }

        const currentVersion =
          ++snapshotVersion;

        const visibleDocuments =
          snapshot.docs.filter(
            document =>
              document.data()
                .deletedByCustomer !==
              true,
          );

        void Promise.all(
          visibleDocuments.map(
            document =>
              mapRequest(
                document,
                customerPhotoCache,
                shopMediaCache,
                serviceImageCache,
              ),
          ),
        )
          .then(requests => {
            if (
              !active ||
              currentVersion !==
                snapshotVersion
            ) {
              return;
            }

            requests.sort(
              (
                a,
                b,
              ) => {
                const aTime =
                  a.createdAt
                    ?.toMillis?.() ??
                  0;

                const bTime =
                  b.createdAt
                    ?.toMillis?.() ??
                  0;

                return (
                  bTime -
                  aTime
                );
              },
            );

            onChange(
              requests,
            );
          })
          .catch(error => {
            if (__DEV__) {
              console.error(
                "Customer shop requests mapping failed:",
                error,
              );
            }

            if (active) {
              onError?.(
                error instanceof Error
                  ? error
                  : new Error(
                      "Unable to load shop requests.",
                    ),
              );
            }
          });
      },

      error => {
        if (!active) {
          return;
        }

        if (__DEV__) {
          console.error(
            "Customer shop requests subscription failed:",
            error,
          );
        }

        onError?.(
          error,
        );
      },
    );

  return () => {
    active = false;
    unsubscribe();
  };
}

/* ============================================================
   PENDING COUNT
============================================================ */

export function subscribeToWorkerPendingShopRequestCount(
  workerId: string,

  onChange: (
    count: number,
  ) => void,

  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  return subscribeToWorkerShopRequests(
    workerId,

    requests => {
      const pendingCount =
        requests.filter(
          request =>
            request.status ===
            "pending",
        ).length;

      onChange(
        pendingCount,
      );
    },

    onError,
  );
}

/* ============================================================
   STATUS TRANSITION
============================================================ */

function isValidStatusTransition(
  currentStatus:
    FirebaseShopRequestStatus,

  nextStatus:
    FirebaseShopRequestStatus,
): boolean {
  if (
    currentStatus ===
      "pending" &&
    (
      nextStatus ===
        "accepted" ||
      nextStatus ===
        "declined"
    )
  ) {
    return true;
  }

  if (
    currentStatus ===
      "accepted" &&
    nextStatus ===
      "completed"
  ) {
    return true;
  }

  return false;
}

/* ============================================================
   WORKER STATUS UPDATE
============================================================ */

export async function updateShopRequestStatus({
  requestId,
  status,
}: {
  requestId: string;
  status:
    FirebaseShopRequestStatus;
}): Promise<void> {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  const workerId =
    cleanString(
      user.uid,
    );

  const normalizedRequestId =
    cleanString(
      requestId,
    );

  if (!workerId) {
    throw new Error(
      "Worker information is unavailable.",
    );
  }

  if (!normalizedRequestId) {
    throw new Error(
      "Request ID is required.",
    );
  }

  if (
    status !== "accepted" &&
    status !== "declined" &&
    status !== "completed"
  ) {
    throw new Error(
      "Invalid shop request status.",
    );
  }

  const requestRef =
    doc(
      db,
      "shopRequests",
      normalizedRequestId,
    );

  await runTransaction(
    db,
    async transaction => {
      const snapshot =
        await transaction.get(
          requestRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Request not found.",
        );
      }

      const data =
        snapshot.data();

      if (
        cleanString(
          data.workerId,
        ) !== workerId
      ) {
        throw new Error(
          "You cannot update this request.",
        );
      }

      if (
        data.deletedByWorker ===
        true
      ) {
        throw new Error(
          "This request has been removed from your worker history.",
        );
      }

      const currentStatus =
        normalizeStatus(
          data.status,
        );

      if (
        !isValidStatusTransition(
          currentStatus,
          status,
        )
      ) {
        throw new Error(
          `Request cannot change from ${currentStatus} to ${status}.`,
        );
      }

      transaction.update(
        requestRef,
        {
          status,

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   CUSTOMER CANCEL REQUEST
============================================================ */

export async function cancelShopRequest(
  requestId: string,
): Promise<void> {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in to cancel this request.",
    );
  }

  const customerId =
    cleanString(
      user.uid,
    );

  const normalizedRequestId =
    cleanString(
      requestId,
    );

  if (!customerId) {
    throw new Error(
      "Customer information is unavailable.",
    );
  }

  if (!normalizedRequestId) {
    throw new Error(
      "Request ID is required.",
    );
  }

  const requestRef =
    doc(
      db,
      "shopRequests",
      normalizedRequestId,
    );

  await runTransaction(
    db,
    async transaction => {
      const snapshot =
        await transaction.get(
          requestRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Request not found.",
        );
      }

      const data =
        snapshot.data();

      const requestCustomerId =
        cleanString(
          data.customerId,
        );

      if (
        requestCustomerId !==
        customerId
      ) {
        throw new Error(
          "You cannot cancel this request.",
        );
      }

      if (
        data.deletedByCustomer ===
        true
      ) {
        throw new Error(
          "This request has been removed from your order history.",
        );
      }

      const currentStatus =
        normalizeStatus(
          data.status,
        );

      if (
        currentStatus ===
        "cancelled"
      ) {
        return;
      }

      if (
        currentStatus !==
        "pending"
      ) {
        throw new Error(
          "Only pending requests can be cancelled.",
        );
      }

      transaction.update(
        requestRef,
        {
          status:
            "cancelled",

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}