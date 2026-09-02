import {
  File,
} from "expo-file-system";

export type ImageBase64Result = {
  base64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

function getMimeType(
  file: File,
): ImageBase64Result["mimeType"] {
  const type =
    file.type?.toLowerCase();

  if (type === "image/png") {
    return "image/png";
  }

  if (type === "image/webp") {
    return "image/webp";
  }

  if (
    type === "image/jpeg" ||
    type === "image/jpg"
  ) {
    return "image/jpeg";
  }

  const extension =
    file.extension
      ?.toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";

    case ".webp":
      return "image/webp";

    case ".jpg":
    case ".jpeg":
      return "image/jpeg";

    default:
      throw new Error(
        "Unsupported image format. Please use JPG, PNG, or WEBP.",
      );
  }
}

export async function imageToBase64(
  uri: string,
): Promise<ImageBase64Result> {
  const cleanUri =
    uri.trim();

  if (!cleanUri) {
    throw new Error(
      "Image URI is required.",
    );
  }

  try {
    const file =
      new File(cleanUri);

    if (!file.exists) {
      throw new Error(
        "The selected image could not be found.",
      );
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      throw new Error(
        "Image is too large. Please choose an image smaller than 5 MB.",
      );
    }

    const mimeType =
      getMimeType(file);

    const base64 =
      await file.base64();

    if (!base64) {
      throw new Error(
        "Unable to read the selected image.",
      );
    }

    return {
      base64,
      mimeType,
    };
  } catch (error) {
    console.error(
      "IMAGE TO BASE64 ERROR",
      error,
    );

    if (
      error instanceof Error
    ) {
      throw error;
    }

    throw new Error(
      "Unable to prepare the image.",
    );
  }
}