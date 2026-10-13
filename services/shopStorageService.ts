import {
  File,
} from 'expo-file-system';

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type StorageReference,
  type UploadMetadata,
} from 'firebase/storage';

import {
  storage,
} from '@/firebase/config';

const MAX_IMAGE_SIZE_BYTES =
  10 * 1024 * 1024;

/* ============================================================
   CONTENT TYPE
============================================================ */

function getContentType(
  uri: string,
  detectedType?: string,
): string {
  const normalizedDetectedType =
    detectedType
      ?.trim()
      .toLowerCase();

  if (
    normalizedDetectedType ===
      'image/jpeg' ||
    normalizedDetectedType ===
      'image/png' ||
    normalizedDetectedType ===
      'image/webp' ||
    normalizedDetectedType ===
      'image/heic'
  ) {
    return normalizedDetectedType;
  }

  if (
    normalizedDetectedType ===
    'image/heif'
  ) {
    return 'image/heic';
  }

  const cleanUri =
    uri
      .split('?')[0]
      .toLowerCase();

  if (
    cleanUri.endsWith('.png')
  ) {
    return 'image/png';
  }

  if (
    cleanUri.endsWith('.webp')
  ) {
    return 'image/webp';
  }

  if (
    cleanUri.endsWith('.heic') ||
    cleanUri.endsWith('.heif')
  ) {
    return 'image/heic';
  }

  return 'image/jpeg';
}

/* ============================================================
   READ LOCAL FILE
============================================================ */

async function readLocalImage(
  uri: string,
): Promise<{
  bytes: Uint8Array;
  contentType: string;
}> {
  const normalizedUri =
    uri.trim();

  if (!normalizedUri) {
    throw new Error(
      'Selected image is invalid.',
    );
  }

  let file: File;

  try {
    file =
      new File(
        normalizedUri,
      );
  } catch {
    throw new Error(
      'Unable to access the selected image.',
    );
  }

  if (!file.exists) {
    throw new Error(
      'Selected image could not be found. Please choose it again.',
    );
  }

  if (
    !Number.isFinite(
      file.size,
    ) ||
    file.size <= 0
  ) {
    throw new Error(
      'Selected image is empty or invalid.',
    );
  }

  if (
    file.size >
    MAX_IMAGE_SIZE_BYTES
  ) {
    throw new Error(
      'Image must be 10 MB or smaller.',
    );
  }

  const bytes =
    await file.bytes();

  if (
    bytes.byteLength === 0
  ) {
    throw new Error(
      'Selected image is empty.',
    );
  }

  if (
    bytes.byteLength >
    MAX_IMAGE_SIZE_BYTES
  ) {
    throw new Error(
      'Image must be 10 MB or smaller.',
    );
  }

  return {
    bytes,

    contentType:
      getContentType(
        normalizedUri,
        file.type,
      ),
  };
}

/* ============================================================
   REACT NATIVE / FIREBASE STORAGE COMPATIBILITY
============================================================ */

/*
 * Firebase Storage's multipart uploader combines metadata and
 * binary data into a Blob when a native Blob implementation
 * exists.
 *
 * React Native's Blob implementation does not support creating
 * Blobs from ArrayBuffer / ArrayBufferView in this environment.
 *
 * Temporarily hiding Blob during the synchronous construction
 * of uploadBytes() makes Firebase use its Uint8Array path.
 *
 * Blob is restored immediately before the network Promise is
 * awaited, so the rest of the app is unaffected.
 */
function uploadBytesReactNativeSafe(
  storageRef: StorageReference,
  bytes: Uint8Array,
  metadata: UploadMetadata,
): ReturnType<
  typeof uploadBytes
> {
  const blobDescriptor =
    Object.getOwnPropertyDescriptor(
      globalThis,
      'Blob',
    );

  const originalBlob =
    globalThis.Blob;

  if (
    blobDescriptor &&
    blobDescriptor.configurable ===
      false
  ) {
    throw new Error(
      'Firebase Storage upload compatibility could not be initialized.',
    );
  }

  try {
    Reflect.deleteProperty(
      globalThis,
      'Blob',
    );

    return uploadBytes(
      storageRef,
      bytes,
      metadata,
    );
  } finally {
    if (blobDescriptor) {
      Object.defineProperty(
        globalThis,
        'Blob',
        blobDescriptor,
      );
    } else if (
      originalBlob !==
      undefined
    ) {
      Object.defineProperty(
        globalThis,
        'Blob',
        {
          configurable: true,
          enumerable: false,
          writable: true,
          value:
            originalBlob,
        },
      );
    }
  }
}

/* ============================================================
   UPLOAD SHOP IMAGE
============================================================ */

export async function uploadShopImage({
  ownerId,
  fileUri,
  path,
}: {
  ownerId: string;
  fileUri: string;
  path: string;
}): Promise<{
  url: string;
  storageRef: StorageReference;
}> {
  const normalizedOwnerId =
    ownerId.trim();

  const normalizedPath =
    path.trim();

  if (
    !normalizedOwnerId
  ) {
    throw new Error(
      'Shop owner information is missing.',
    );
  }

  if (
    !normalizedPath
  ) {
    throw new Error(
      'Image storage path is invalid.',
    );
  }

  const {
    bytes,
    contentType,
  } =
    await readLocalImage(
      fileUri,
    );

  const fileRef =
    ref(
      storage,
      `shops/${normalizedOwnerId}/${normalizedPath}`,
    );

  await uploadBytesReactNativeSafe(
    fileRef,
    bytes,
    {
      contentType,

      cacheControl:
        'public,max-age=31536000,immutable',
    },
  );

  const url =
    await getDownloadURL(
      fileRef,
    );

  return {
    url,
    storageRef:
      fileRef,
  };
}

/* ============================================================
   CLEANUP FAILED UPLOADS
============================================================ */

export async function cleanupShopUploads(
  refs: StorageReference[],
): Promise<void> {
  if (
    refs.length === 0
  ) {
    return;
  }

  await Promise.allSettled(
    refs.map(
      (item) =>
        deleteObject(
          item,
        ),
    ),
  );
}