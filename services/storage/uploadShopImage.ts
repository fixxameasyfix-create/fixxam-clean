// services/storage/uploadShopImage.ts

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import {
  storage,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

export type UploadedShopImage = {
  imageUrl: string;

  imagePath: string;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_SHOP_IMAGE_BYTES =
  8 * 1024 * 1024;

/* ============================================================
   HELPERS
============================================================ */

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getImageExtension(
  mimeType: string,
): string {
  switch (
    mimeType.toLowerCase()
  ) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/heic":
      return "heic";

    case "image/heif":
      return "heif";

    case "image/jpeg":
    case "image/jpg":
    default:
      return "jpg";
  }
}

function createFileName(
  mimeType: string,
): string {
  const extension =
    getImageExtension(
      mimeType,
    );

  const timestamp =
    Date.now();

  const random =
    Math.random()
      .toString(36)
      .slice(2, 10);

  return `shop-${timestamp}-${random}.${extension}`;
}

/* ============================================================
   UPLOAD SHOP IMAGE
============================================================ */

/**
 * Upload one shop image.
 *
 * Returns:
 *
 * {
 *   imageUrl,
 *   imagePath
 * }
 */
export default async function uploadShopImage(
  imageUri: string,
  workerId: string,
): Promise<UploadedShopImage> {
  const normalizedUri =
    normalizeString(
      imageUri,
    );

  const normalizedWorkerId =
    normalizeString(
      workerId,
    );

  /* ==========================================================
     VALIDATION
  ========================================================== */

  if (!normalizedUri) {
    throw new Error(
      "Shop image is required.",
    );
  }

  if (!normalizedWorkerId) {
    throw new Error(
      "Worker ID is required.",
    );
  }

  /* ==========================================================
     LOAD LOCAL IMAGE
  ========================================================== */

  let response:
    Response | null =
    null;

  try {
    response =
      await fetch(
        normalizedUri,
      );

    if (!response.ok) {
      throw new Error(
        "Unable to read the selected shop image.",
      );
    }
  } catch (error) {
    console.error(
      "SHOP_IMAGE_READ_ERROR:",
      error,
    );

    throw new Error(
      "Unable to read the selected shop image.",
    );
  }

  /* ==========================================================
     CREATE BLOB
  ========================================================== */

  const blob =
    await response.blob();

  if (
    blob.size <= 0
  ) {
    throw new Error(
      "Selected shop image is empty.",
    );
  }

  if (
    blob.size >
    MAX_SHOP_IMAGE_BYTES
  ) {
    throw new Error(
      "Shop image must be smaller than 8 MB.",
    );
  }

  /* ==========================================================
     MIME TYPE
  ========================================================== */

  const mimeType =
    normalizeString(
      blob.type,
    ) ||
    "image/jpeg";

  if (
    !mimeType.startsWith(
      "image/",
    )
  ) {
    throw new Error(
      "Selected file must be an image.",
    );
  }

  /* ==========================================================
     STORAGE PATH
  ========================================================== */

  const fileName =
    createFileName(
      mimeType,
    );

  const imagePath =
    `shops/${normalizedWorkerId}/images/${fileName}`;

  const imageRef =
    ref(
      storage,
      imagePath,
    );

  /* ==========================================================
     UPLOAD
  ========================================================== */

  try {
    await uploadBytes(
      imageRef,
      blob,
      {
        contentType:
          mimeType,

        customMetadata: {
          workerId:
            normalizedWorkerId,

          purpose:
            "shop-image",
        },
      },
    );

    const imageUrl =
      await getDownloadURL(
        imageRef,
      );

    return {
      imageUrl,
      imagePath,
    };
  } catch (error) {
    console.error(
      "SHOP_IMAGE_UPLOAD_ERROR:",
      error,
    );

    /*
     * If upload partially succeeded but
     * retrieving the URL failed, attempt
     * cleanup so orphaned files are reduced.
     */
    try {
      await deleteObject(
        imageRef,
      );
    } catch {
      // Ignore cleanup failure.
    }

    throw new Error(
      "Unable to upload shop image.",
    );
  }
}

/* ============================================================
   DELETE SHOP IMAGE
============================================================ */

/**
 * Used later by Edit Shop when replacing
 * or deleting the current shop photo.
 */
export async function deleteShopImage(
  imagePath:
    | string
    | null
    | undefined,
): Promise<void> {
  const normalizedPath =
    normalizeString(
      imagePath,
    );

  if (!normalizedPath) {
    return;
  }

  /*
   * Safety check:
   * only allow this service to delete
   * files inside the shops folder.
   */
  if (
    !normalizedPath.startsWith(
      "shops/",
    )
  ) {
    throw new Error(
      "Invalid shop image path.",
    );
  }

  const imageRef =
    ref(
      storage,
      normalizedPath,
    );

  try {
    await deleteObject(
      imageRef,
    );
  } catch (error) {
    console.error(
      "SHOP_IMAGE_DELETE_ERROR:",
      error,
    );

    throw new Error(
      "Unable to delete shop image.",
    );
  }
}