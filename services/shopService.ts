import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import type {
  StorageReference,
} from 'firebase/storage';

import {
  auth,
  db,
} from '@/firebase/config';

import {
  isShopCategoryId,
  type ShopCategoryId,
} from '@/constants/shopCategories';

import type {
  ShopDraft,
} from '@/contexts/ShopRegistrationContext';

import type {
  FirebaseShop,
  FirebaseShopService,
} from '@/types/firebaseShop';

import {
  cleanupShopUploads,
  uploadShopImage,
} from './shopStorageService';

/* ============================================================
   LIMITS
============================================================ */

const MAX_SHOP_SERVICES = 30;

const MAX_SHOP_NAME_LENGTH = 100;
const MAX_SHOP_DESCRIPTION_LENGTH = 500;
const MAX_SHOP_PHONE_LENGTH = 30;
const MAX_SHOP_ADDRESS_LENGTH = 300;

const MAX_SERVICE_NAME_LENGTH = 100;
const MAX_SERVICE_DESCRIPTION_LENGTH = 1000;
const MAX_SERVICE_PRICE = 100_000_000;

/* ============================================================
   SHOP CATEGORY VALIDATION
============================================================ */

function normalizeShopCategory(
  value: unknown,
): ShopCategoryId {
  if (
    typeof value !== 'string'
  ) {
    throw new Error(
      'Please choose a valid shop category.',
    );
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  if (
    !isShopCategoryId(
      normalized,
    )
  ) {
    throw new Error(
      'Please choose a valid shop category.',
    );
  }

  return normalized;
}

function parseShopCategory(
  value: unknown,
): ShopCategoryId {
  if (
    typeof value !== 'string'
  ) {
    throw new Error(
      'Shop has an invalid category.',
    );
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  if (
    !isShopCategoryId(
      normalized,
    )
  ) {
    throw new Error(
      `Invalid shop category: ${
        normalized || 'empty'
      }`,
    );
  }

  return normalized;
}

/* ============================================================
   BUSINESS HOURS
============================================================ */

const BUSINESS_DAYS: Record<
  string,
  string
> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

function normalizeBusinessDay(
  value: string,
): string {
  const normalized =
    value
      .trim()
      .toLowerCase();

  const day =
    BUSINESS_DAYS[
      normalized
    ];

  if (!day) {
    throw new Error(
      `Invalid business day: ${value}`,
    );
  }

  return day;
}

function sanitizeBusinessHours(
  businessHours:
    ShopDraft['businessHours'],
): ShopDraft['businessHours'] {
  return businessHours.map(
    (item) => {
      const id =
        item.id.trim();

      const day =
        normalizeBusinessDay(
          item.day,
        );

      const openTime =
        item.openTime.trim();

      const closeTime =
        item.closeTime.trim();

      if (
        !id ||
        id.length > 80
      ) {
        throw new Error(
          `${day} has an invalid business hour ID.`,
        );
      }

      if (
        openTime.length > 10 ||
        closeTime.length > 10
      ) {
        throw new Error(
          `${day} has an invalid opening or closing time.`,
        );
      }

      if (
        item.isOpen &&
        (
          !openTime ||
          !closeTime
        )
      ) {
        throw new Error(
          `Set opening and closing time for ${day}.`,
        );
      }

      return {
        id,
        day,

        isOpen:
          item.isOpen ===
          true,

        openTime,
        closeTime,
      };
    },
  );
}

/* ============================================================
   HELPERS
============================================================ */

function isRemoteUrl(
  value: string,
): boolean {
  return /^https:\/\//i.test(
    value.trim(),
  );
}

function safeStorageName(
  value: string,
): string {
  const cleaned =
    value
      .trim()
      .replace(
        /[^a-zA-Z0-9_-]/g,
        '_',
      )
      .slice(
        0,
        80,
      );

  return (
    cleaned ||
    'service'
  );
}

function isValidLatitude(
  value: number,
): boolean {
  return (
    Number.isFinite(
      value,
    ) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(
  value: number,
): boolean {
  return (
    Number.isFinite(
      value,
    ) &&
    value >= -180 &&
    value <= 180
  );
}

/* ============================================================
   VALIDATION
============================================================ */

function assertValidShopDraft(
  draft: ShopDraft,
): void {
  const shopName =
    draft.name.trim();

  const description =
    draft.description.trim();

  const phone =
    draft.phone.trim();

  const address =
    draft.address.trim();

  if (
    shopName.length < 2
  ) {
    throw new Error(
      'Shop name must contain at least 2 characters.',
    );
  }

  if (
    shopName.length >
    MAX_SHOP_NAME_LENGTH
  ) {
    throw new Error(
      `Shop name must not exceed ${MAX_SHOP_NAME_LENGTH} characters.`,
    );
  }

  normalizeShopCategory(
    draft.category,
  );

  if (!description) {
    throw new Error(
      'Shop description is required.',
    );
  }

  if (
    description.length >
    MAX_SHOP_DESCRIPTION_LENGTH
  ) {
    throw new Error(
      `Shop description must not exceed ${MAX_SHOP_DESCRIPTION_LENGTH} characters.`,
    );
  }

  if (
    phone.length < 7
  ) {
    throw new Error(
      'Enter a valid shop phone number.',
    );
  }

  if (
    phone.length >
    MAX_SHOP_PHONE_LENGTH
  ) {
    throw new Error(
      'Shop phone number is too long.',
    );
  }

  if (
    address.length < 3
  ) {
    throw new Error(
      'Shop address is required.',
    );
  }

  if (
    address.length >
    MAX_SHOP_ADDRESS_LENGTH
  ) {
    throw new Error(
      `Shop address must not exceed ${MAX_SHOP_ADDRESS_LENGTH} characters.`,
    );
  }

  if (
    draft.latitude ===
      null ||
    draft.longitude ===
      null
  ) {
    throw new Error(
      'Shop coordinates are required.',
    );
  }

  if (
    !isValidLatitude(
      draft.latitude,
    ) ||
    !isValidLongitude(
      draft.longitude,
    )
  ) {
    throw new Error(
      'Shop coordinates are invalid.',
    );
  }

  if (
    !draft.coverPhoto?.trim() ||
    !draft.logo?.trim()
  ) {
    throw new Error(
      'Shop cover photo and logo are required.',
    );
  }

  if (
    draft.services
      .length === 0
  ) {
    throw new Error(
      'Add at least one service.',
    );
  }

  if (
    draft.services
      .length >
    MAX_SHOP_SERVICES
  ) {
    throw new Error(
      `You can add up to ${MAX_SHOP_SERVICES} services.`,
    );
  }

  const serviceIds =
    new Set<string>();

  for (
    const service of
    draft.services
  ) {
    const serviceId =
      service.id.trim();

    const serviceName =
      service.name.trim();

    const serviceDescription =
      service.description
        .trim();

    if (!serviceId) {
      throw new Error(
        'One of your services has an invalid ID.',
      );
    }

    if (
      serviceIds.has(
        serviceId,
      )
    ) {
      throw new Error(
        'Two services cannot use the same ID.',
      );
    }

    serviceIds.add(
      serviceId,
    );

    if (!serviceName) {
      throw new Error(
        'Every service must have a name.',
      );
    }

    if (
      serviceName.length >
      MAX_SERVICE_NAME_LENGTH
    ) {
      throw new Error(
        `${serviceName} has a name that is too long.`,
      );
    }

    if (
      !serviceDescription
    ) {
      throw new Error(
        `${serviceName} needs a description.`,
      );
    }

    if (
      serviceDescription
        .length >
      MAX_SERVICE_DESCRIPTION_LENGTH
    ) {
      throw new Error(
        `${serviceName}'s description is too long.`,
      );
    }

    if (
      !Number.isFinite(
        service.startingPrice,
      ) ||
      service.startingPrice <=
        0 ||
      service.startingPrice >
        MAX_SERVICE_PRICE
    ) {
      throw new Error(
        `${serviceName} needs a valid starting price.`,
      );
    }

    if (
      !service.imageUri
        .trim()
    ) {
      throw new Error(
        `${serviceName} needs a photo.`,
      );
    }
  }

  if (
    draft.businessHours
      .length === 0
  ) {
    throw new Error(
      'Business hours are required.',
    );
  }

  if (
    draft.businessHours
      .length > 7
  ) {
    throw new Error(
      'Business hours cannot contain more than 7 days.',
    );
  }

  if (
    !draft.businessHours.some(
      (item) =>
        item.isOpen,
    )
  ) {
    throw new Error(
      'Shop must be open at least one day.',
    );
  }

  sanitizeBusinessHours(
    draft.businessHours,
  );
}

/* ============================================================
   FIRESTORE MAPPERS
============================================================ */

function mapShopDocument(
  snapshot:
    DocumentSnapshot<DocumentData>,
): FirebaseShop {
  if (
    !snapshot.exists()
  ) {
    throw new Error(
      'Shop document does not exist.',
    );
  }

  const data =
    snapshot.data();

  return {
    id:
      snapshot.id,

    ownerId:
      String(
        data.ownerId ??
          '',
      ),

    name:
      String(
        data.name ??
          '',
      ),

    category:
      parseShopCategory(
        data.category,
      ),

    description:
      String(
        data.description ??
          '',
      ),

    phone:
      String(
        data.phone ??
          '',
      ),

    address:
      String(
        data.address ??
          '',
      ),

    latitude:
      Number(
        data.latitude ??
          0,
      ),

    longitude:
      Number(
        data.longitude ??
          0,
      ),

    coverPhotoUrl:
      String(
        data.coverPhotoUrl ??
          '',
      ),

    logoUrl:
      String(
        data.logoUrl ??
          '',
      ),

    businessHours:
      Array.isArray(
        data.businessHours,
      )
        ? data.businessHours
        : [],

    isActive:
      data.isActive ===
      true,

    rating:
      Number(
        data.rating ??
          0,
      ),

    reviewCount:
      Number(
        data.reviewCount ??
          0,
      ),

    serviceCount:
      Number(
        data.serviceCount ??
          0,
      ),

    minimumStartingPrice:
      typeof data.minimumStartingPrice ===
      'number'
        ? data.minimumStartingPrice
        : null,

    createdAt:
      data.createdAt ??
      null,

    updatedAt:
      data.updatedAt ??
      null,
  };
}

function mapServiceDocument(
  snapshot:
    DocumentSnapshot<DocumentData>,
): FirebaseShopService {
  if (
    !snapshot.exists()
  ) {
    throw new Error(
      'Service document does not exist.',
    );
  }

  const data =
    snapshot.data();

  return {
    id:
      snapshot.id,

    name:
      String(
        data.name ??
          '',
      ),

    description:
      String(
        data.description ??
          '',
      ),

    startingPrice:
      Number(
        data.startingPrice ??
          0,
      ),

    imageUrl:
      String(
        data.imageUrl ??
          '',
      ),

    isActive:
      data.isActive ===
      true,
  };
}

/* ============================================================
   IMAGE RESOLUTION
============================================================ */

async function resolveShopImage({
  ownerId,
  fileUri,
  path,
  uploadedRefs,
}: {
  ownerId: string;
  fileUri: string;
  path: string;
  uploadedRefs:
    StorageReference[];
}): Promise<string> {
  const normalizedFileUri =
    fileUri.trim();

  if (
    isRemoteUrl(
      normalizedFileUri,
    )
  ) {
    return normalizedFileUri;
  }

  const uploaded =
    await uploadShopImage({
      ownerId,

      fileUri:
        normalizedFileUri,

      path,
    });

  uploadedRefs.push(
    uploaded.storageRef,
  );

  return uploaded.url.trim();
}

/* ============================================================
   SHOP WRITE TYPES
============================================================ */

type UploadedShopService = {
  id: string;
  name: string;
  description: string;
  startingPrice: number;
  imageUrl: string;
  isActive: boolean;
};

type ShopWritePayload = {
  ownerId: string;
  name: string;
  category: ShopCategoryId;
  description: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  coverPhotoUrl: string;
  logoUrl: string;

  businessHours:
    ShopDraft['businessHours'];

  isActive: boolean;

  rating: number;
  reviewCount: number;

  serviceCount: number;

  minimumStartingPrice:
    | number
    | null;

  updatedAt: ReturnType<
    typeof serverTimestamp
  >;

  createdAt?: ReturnType<
    typeof serverTimestamp
  >;
};

/* ============================================================
   CREATE / UPDATE WORKER SHOP
============================================================ */

export async function createOrUpdateWorkerShop(
  draft: ShopDraft,
): Promise<string> {
  assertValidShopDraft(
    draft,
  );

  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      'You must be signed in to create or update a shop.',
    );
  }

  const ownerId =
    user.uid;

  const normalizedCategory =
    normalizeShopCategory(
      draft.category,
    );

  const sanitizedBusinessHours =
    sanitizeBusinessHours(
      draft.businessHours,
    );

  const shopRef =
    doc(
      db,
      'shops',
      ownerId,
    );

  const uploadedRefs:
    StorageReference[] = [];

  try {
    const existingShopSnapshot =
      await getDoc(
        shopRef,
      );

    const existingShopData =
      existingShopSnapshot.exists()
        ? existingShopSnapshot.data()
        : null;

    const uploadTimestamp =
      Date.now();

    /* --------------------------------------------------------
       COVER
    -------------------------------------------------------- */

    const coverPhotoUrl =
      await resolveShopImage({
        ownerId,

        fileUri:
          draft.coverPhoto!,

        path:
          `cover/${uploadTimestamp}.jpg`,

        uploadedRefs,
      });

    /* --------------------------------------------------------
       LOGO
    -------------------------------------------------------- */

    const logoUrl =
      await resolveShopImage({
        ownerId,

        fileUri:
          draft.logo!,

        path:
          `logo/${uploadTimestamp}.jpg`,

        uploadedRefs,
      });

    /* --------------------------------------------------------
       SERVICES
    -------------------------------------------------------- */

    const uploadedServices:
      UploadedShopService[] =
        [];

    for (
      let index = 0;
      index <
      draft.services.length;
      index += 1
    ) {
      const service =
        draft.services[
          index
        ];

      const serviceId =
        service.id.trim();

      const imageUrl =
        await resolveShopImage({
          ownerId,

          fileUri:
            service.imageUri,

          path:
            `services/${safeStorageName(
              serviceId,
            )}-${index}-${uploadTimestamp}.jpg`,

          uploadedRefs,
        });

      uploadedServices.push(
        {
          id:
            serviceId,

          name:
            service.name
              .trim(),

          description:
            service.description
              .trim(),

          startingPrice:
            service.startingPrice,

          imageUrl:
            imageUrl.trim(),

          isActive:
            service.isActive ===
            true,
        },
      );
    }

    /* --------------------------------------------------------
       DERIVED STATS
    -------------------------------------------------------- */

    const activePrices =
      uploadedServices
        .filter(
          (service) =>
            service.isActive,
        )
        .map(
          (service) =>
            service.startingPrice,
        );

    const minimumStartingPrice =
      activePrices.length > 0
        ? Math.min(
            ...activePrices,
          )
        : null;

    /* --------------------------------------------------------
       EXISTING SERVICES
    -------------------------------------------------------- */

    const servicesCollectionRef =
      collection(
        db,
        'shops',
        ownerId,
        'services',
      );

    const existingServicesSnapshot =
      await getDocs(
        servicesCollectionRef,
      );

    const incomingServiceIds =
      new Set(
        uploadedServices.map(
          (service) =>
            service.id,
        ),
      );

    /* --------------------------------------------------------
       SHOP PAYLOAD
    -------------------------------------------------------- */

    const shopPayload:
      ShopWritePayload = {
        ownerId,

        name:
          draft.name.trim(),

        category:
          normalizedCategory,

        description:
          draft.description
            .trim(),

        phone:
          draft.phone.trim(),

        address:
          draft.address.trim(),

        latitude:
          draft.latitude!,

        longitude:
          draft.longitude!,

        coverPhotoUrl:
          coverPhotoUrl.trim(),

        logoUrl:
          logoUrl.trim(),

        businessHours:
          sanitizedBusinessHours,

        isActive:
          existingShopData
            ? existingShopData.isActive !==
              false
            : true,

        rating:
          typeof existingShopData?.rating ===
          'number'
            ? existingShopData.rating
            : 0,

        reviewCount:
          typeof existingShopData?.reviewCount ===
          'number'
            ? existingShopData.reviewCount
            : 0,

        serviceCount:
          uploadedServices.length,

        minimumStartingPrice,

        updatedAt:
          serverTimestamp(),
      };

    if (
      !existingShopSnapshot.exists()
    ) {
      shopPayload.createdAt =
        serverTimestamp();
    }

    /* --------------------------------------------------------
       ATOMIC BATCH
    -------------------------------------------------------- */

    const batch =
      writeBatch(db);

    if (
      existingShopSnapshot.exists()
    ) {
      batch.update(
        shopRef,
        shopPayload,
      );
    } else {
      batch.set(
        shopRef,
        shopPayload,
      );
    }

    /* --------------------------------------------------------
       UPSERT SERVICES
    -------------------------------------------------------- */

    for (
      const service of
      uploadedServices
    ) {
      const serviceRef =
        doc(
          db,
          'shops',
          ownerId,
          'services',
          service.id,
        );

      batch.set(
        serviceRef,
        {
          id:
            service.id,

          name:
            service.name,

          description:
            service.description,

          startingPrice:
            service.startingPrice,

          imageUrl:
            service.imageUrl,

          isActive:
            service.isActive,

          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        },
      );
    }

    /* --------------------------------------------------------
       DELETE REMOVED SERVICES
    -------------------------------------------------------- */

    for (
      const oldService of
      existingServicesSnapshot.docs
    ) {
      if (
        !incomingServiceIds.has(
          oldService.id,
        )
      ) {
        batch.delete(
          oldService.ref,
        );
      }
    }

    await batch.commit();

    return ownerId;
  } catch (error) {
    try {
      await cleanupShopUploads(
        uploadedRefs,
      );
    } catch (
      cleanupError
    ) {
      console.error(
        'Shop upload cleanup failed:',
        cleanupError,
      );
    }

    console.error(
      'Create/update shop failed:',
      error,
    );

    throw error;
  }
}

/* ============================================================
   GET ONE SHOP
============================================================ */

export async function getShopById(
  shopId: string,
): Promise<
  FirebaseShop | null
> {
  const normalizedShopId =
    shopId.trim();

  if (
    !normalizedShopId
  ) {
    return null;
  }

  const snapshot =
    await getDoc(
      doc(
        db,
        'shops',
        normalizedShopId,
      ),
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return mapShopDocument(
    snapshot,
  );
}

/* ============================================================
   GET ONE SHOP SERVICE
============================================================ */

export async function getShopServiceById(
  shopId: string,
  serviceId: string,
): Promise<
  FirebaseShopService | null
> {
  const normalizedShopId =
    shopId.trim();

  const normalizedServiceId =
    serviceId.trim();

  if (
    !normalizedShopId ||
    !normalizedServiceId
  ) {
    return null;
  }

  const snapshot =
    await getDoc(
      doc(
        db,
        'shops',
        normalizedShopId,
        'services',
        normalizedServiceId,
      ),
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return mapServiceDocument(
    snapshot,
  );
}

/* ============================================================
   GET PUBLIC ACTIVE SHOP SERVICES
============================================================ */

export async function getShopServices(
  shopId: string,
): Promise<
  FirebaseShopService[]
> {
  const normalizedShopId =
    shopId.trim();

  if (
    !normalizedShopId
  ) {
    return [];
  }

  /*
   * Public query.
   *
   * Firestore rules permit guests to list active services
   * belonging to an active shop.
   *
   * Firestore rules are not filters, therefore the query
   * must explicitly constrain isActive == true.
   */
  const servicesQuery =
    query(
      collection(
        db,
        'shops',
        normalizedShopId,
        'services',
      ),

      where(
        'isActive',
        '==',
        true,
      ),
    );

  const snapshot =
    await getDocs(
      servicesQuery,
    );

  return snapshot.docs
    .map(
      (item) =>
        mapServiceDocument(
          item,
        ),
    )
    .sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
        ),
    );
}

/* ============================================================
   PUBLIC SHOPS — REALTIME
============================================================ */

export function subscribeToPublicShops(
  onChange: (
    shops: FirebaseShop[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  /*
   * Public browsing intentionally works without Firebase Auth.
   *
   * Firestore rules only expose active shops publicly.
   */
  if (__DEV__) {
    console.log(
      'FIXXAM_PUBLIC_SHOPS_DEBUG:',
      {
        uid:
          auth.currentUser
            ?.uid ??
          null,

        signedIn:
          auth.currentUser !==
          null,
      },
    );
  }

  /*
   * Firestore rules are not filters.
   *
   * This condition must remain aligned with:
   *
   * allow list:
   *   if resource.data.isActive == true;
   */
  const shopsQuery =
    query(
      collection(
        db,
        'shops',
      ),

      where(
        'isActive',
        '==',
        true,
      ),
    );

  return onSnapshot(
    shopsQuery,

    (snapshot) => {
      try {
        const shops =
          snapshot.docs
            .map(
              (item) =>
                mapShopDocument(
                  item,
                ),
            )
            .sort(
              (a, b) =>
                a.name.localeCompare(
                  b.name,
                ),
            );

        if (__DEV__) {
          console.log(
            'FIXXAM_PUBLIC_SHOPS_LOADED:',
            {
              count:
                shops.length,

              uid:
                auth
                  .currentUser
                  ?.uid ??
                null,

              signedIn:
                auth.currentUser !==
                null,
            },
          );
        }

        onChange(
          shops,
        );
      } catch (error) {
        console.error(
          'Public shops mapping failed:',
          error,
        );

        onError?.(
          error instanceof
            Error
            ? error
            : new Error(
                'Unable to process public shops.',
              ),
        );
      }
    },

    (error) => {
      console.error(
        'Public shops subscription failed:',
        {
          code:
            error.code,

          message:
            error.message,

          uid:
            auth
              .currentUser
              ?.uid ??
            null,

          signedIn:
            auth.currentUser !==
            null,
        },
      );

      onError?.(
        error,
      );
    },
  );
}

/* ============================================================
   ONE WORKER SHOP — REALTIME
============================================================ */

export function subscribeToWorkerShop(
  workerId: string,
  onChange: (
    shop:
      FirebaseShop | null,
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const normalizedWorkerId =
    workerId.trim();

  if (
    !normalizedWorkerId
  ) {
    throw new Error(
      'Worker ID is required.',
    );
  }

  const shopRef =
    doc(
      db,
      'shops',
      normalizedWorkerId,
    );

  return onSnapshot(
    shopRef,

    (snapshot) => {
      if (
        !snapshot.exists()
      ) {
        onChange(
          null,
        );

        return;
      }

      try {
        const nextShop =
          mapShopDocument(
            snapshot,
          );

        /*
         * A guest can only reach this snapshot when Firestore
         * permits the shop read. We still avoid exposing an
         * inactive shop through public UI.
         *
         * The owner can receive their inactive shop because
         * the Firestore get rule explicitly permits it.
         */
        if (
          !nextShop.isActive &&
          auth.currentUser?.uid !==
            normalizedWorkerId
        ) {
          onChange(
            null,
          );

          return;
        }

        onChange(
          nextShop,
        );
      } catch (error) {
        console.error(
          'Worker shop mapping failed:',
          {
            workerId:
              normalizedWorkerId,

            error,
          },
        );

        onError?.(
          error instanceof
            Error
            ? error
            : new Error(
                'Unable to process worker shop.',
              ),
        );
      }
    },

    (error) => {
      console.error(
        'Worker shop subscription failed:',
        {
          workerId:
            normalizedWorkerId,

          code:
            error.code,

          message:
            error.message,
        },
      );

      onError?.(
        error,
      );
    },
  );
}

/* ============================================================
   PUBLIC ACTIVE SHOP SERVICES — REALTIME
============================================================ */

export function subscribeToShopServices(
  shopId: string,
  onChange: (
    services:
      FirebaseShopService[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const normalizedShopId =
    shopId.trim();

  if (
    !normalizedShopId
  ) {
    throw new Error(
      'Shop ID is required.',
    );
  }

  /*
   * Public service listener.
   *
   * Firestore permits guests to list only active services
   * for an active shop, therefore isActive == true must be
   * part of the query.
   */
  const servicesQuery =
    query(
      collection(
        db,
        'shops',
        normalizedShopId,
        'services',
      ),

      where(
        'isActive',
        '==',
        true,
      ),
    );

  return onSnapshot(
    servicesQuery,

    (snapshot) => {
      try {
        const services =
          snapshot.docs
            .map(
              (item) =>
                mapServiceDocument(
                  item,
                ),
            )
            .sort(
              (a, b) =>
                a.name.localeCompare(
                  b.name,
                ),
            );

        if (__DEV__) {
          console.log(
            'FIXXAM_PUBLIC_SHOP_SERVICES_LOADED:',
            {
              shopId:
                normalizedShopId,

              count:
                services.length,

              signedIn:
                auth.currentUser !==
                null,
            },
          );
        }

        onChange(
          services,
        );
      } catch (error) {
        console.error(
          'Shop services mapping failed:',
          {
            shopId:
              normalizedShopId,

            error,
          },
        );

        onError?.(
          error instanceof
            Error
            ? error
            : new Error(
                'Unable to process shop services.',
              ),
        );
      }
    },

    (error) => {
      console.error(
        'Shop services subscription failed:',
        {
          shopId:
            normalizedShopId,

          code:
            error.code,

          message:
            error.message,

          signedIn:
            auth.currentUser !==
            null,
        },
      );

      onError?.(
        error,
      );
    },
  );
}