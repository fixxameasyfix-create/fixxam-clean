import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import {
  auth,
  storage,
} from "@/firebase/config";

export type UploadedProductImage = {
  downloadURL: string;
  storagePath: string;
};

function getImageExtension(
  uri: string,
  contentType: string,
): string {
  const extensionFromUri =
    uri
      .split("?")[0]
      .split("#")[0]
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extensionFromUri &&
    ["jpg", "jpeg", "png", "webp", "gif"].includes(
      extensionFromUri,
    )
  ) {
    return extensionFromUri;
  }

  switch (contentType) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/gif":
      return "gif";

    case "image/jpeg":
    default:
      return "jpg";
  }
}

export default async function uploadProductImage(
  uri: string,
  workerId: string,
): Promise<UploadedProductImage> {
  const cleanWorkerId = workerId.trim();

  if (!cleanWorkerId) {
    throw new Error(
      "Cannot upload product image: worker ID is missing.",
    );
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error(
      "You must be signed in before uploading a product image.",
    );
  }

  /*
   * IMPORTANT:
   * The Storage path uses the authenticated user's UID.
   *
   * This must match:
   *
   * products/{workerId}/{fileName}
   *
   * in storage.rules.
   */
  if (currentUser.uid !== cleanWorkerId) {
    throw new Error(
      "Upload permission error: worker ID does not match the signed-in account.",
    );
  }

  const cleanUri = uri.trim();

  if (!cleanUri) {
    throw new Error(
      "Cannot upload product image: image URI is missing.",
    );
  }

  try {
    const response = await fetch(cleanUri);

    if (!response.ok) {
      throw new Error(
        `Failed to read image: ${response.status}`,
      );
    }

    const blob = await response.blob();

    if (blob.size <= 0) {
      throw new Error(
        "Cannot upload product image: image is empty.",
      );
    }

    const contentType =
      blob.type?.startsWith("image/")
        ? blob.type
        : "image/jpeg";

    const extension = getImageExtension(
      cleanUri,
      contentType,
    );

    const filename =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}.${extension}`;

    const storagePath =
      `products/${cleanWorkerId}/${filename}`;

    const storageRef = ref(
      storage,
      storagePath,
    );

    await uploadBytes(
      storageRef,
      blob,
      {
        contentType,
        cacheControl:
          "public,max-age=31536000",
      },
    );

    const downloadURL =
      await getDownloadURL(storageRef);

    return {
      downloadURL,
      storagePath,
    };
  } catch (error: unknown) {
    console.error(
      "FIXXAM_PRODUCT_IMAGE_UPLOAD_ERROR:",
      {
        error,
        workerId: cleanWorkerId,
        storagePath:
          `products/${cleanWorkerId}/`,
      },
    );

    throw error;
  }
}