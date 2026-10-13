import {
  File,
} from "expo-file-system";

import {
  ImageManipulator,
  SaveFormat,
} from "expo-image-manipulator";

/* ==============================================================
   TYPES
============================================================== */

export type ImageBase64Result = {
  base64: string;

  mimeType:
    "image/jpeg";
};

/* ==============================================================
   CONFIG
============================================================== */

/*
 * Camera photos can be very large before compression.
 * We allow a reasonably large source file, then resize/compress it
 * before sending it to Firebase/Gemini.
 */
const MAX_SOURCE_FILE_SIZE =
  20 * 1024 * 1024;

/*
 * Keep the final Base64 well below the backend's 8,000,000-char
 * limit so there is room for the rest of the callable payload.
 */
const MAX_FINAL_BASE64_LENGTH =
  6_000_000;

/*
 * Processing passes.
 *
 * Start with good visual quality. If the encoded image is still
 * too large, progressively reduce dimensions and compression.
 */
const PROCESSING_PASSES = [
  {
    maxWidth: 1600,

    compress: 0.78,
  },

  {
    maxWidth: 1280,

    compress: 0.65,
  },

  {
    maxWidth: 1024,

    compress: 0.52,
  },
] as const;

/* ==============================================================
   URI
============================================================== */

function normalizeUri(
  uri: string,
): string {
  const value =
    uri.trim();

  if (!value) {
    throw new Error(
      "Image URI is required.",
    );
  }

  return value;
}

/* ==============================================================
   SOURCE FILE
============================================================== */

function validateSourceFile(
  uri: string,
): void {
  const file =
    new File(uri);

  if (!file.exists) {
    throw new Error(
      "The selected image could not be found.",
    );
  }

  const size =
    file.size;

  if (
    typeof size ===
      "number" &&
    Number.isFinite(size) &&
    size >
      MAX_SOURCE_FILE_SIZE
  ) {
    throw new Error(
      "This photo is too large to process. Please take another photo or choose a smaller image.",
    );
  }
}

/* ==============================================================
   PROCESS IMAGE
============================================================== */

async function processImage(
  uri: string,
  maxWidth: number,
  compress: number,
): Promise<string> {
  /*
   * Modern Expo ImageManipulator API.
   *
   * We intentionally convert uploads to JPEG:
   * - camera photos do not require lossless PNG
   * - payload becomes substantially smaller
   * - Gemini can still analyze the image
   *
   * The original photo URI is NOT replaced.
   * Booking Preview continues showing the customer's original
   * local image.
   */
  const context =
    ImageManipulator.manipulate(
      uri,
    );

  context.resize({
    width: maxWidth,

    height: null,
  });

  const renderedImage =
    await context.renderAsync();

  const result =
    await renderedImage.saveAsync({
      format:
        SaveFormat.JPEG,

      compress,

      base64: true,
    });

  const base64 =
    result.base64?.trim() ??
    "";

  if (!base64) {
    throw new Error(
      "Unable to prepare the selected image.",
    );
  }

  return base64;
}

/* ==============================================================
   PUBLIC
============================================================== */

export async function imageToBase64(
  uri: string,
): Promise<ImageBase64Result> {
  const cleanUri =
    normalizeUri(
      uri,
    );

  try {
    /* ==========================================================
       VALIDATE ORIGINAL IMAGE
    ========================================================== */

    validateSourceFile(
      cleanUri,
    );

    /* ==========================================================
       RESIZE + COMPRESS

       We retry with progressively smaller output instead of
       crashing or sending an oversized Firebase request.
    ========================================================== */

    for (
      const pass of
        PROCESSING_PASSES
    ) {
      const base64 =
        await processImage(
          cleanUri,
          pass.maxWidth,
          pass.compress,
        );

      if (
        base64.length <=
        MAX_FINAL_BASE64_LENGTH
      ) {
        if (__DEV__) {
          console.log(
            "[AI_BOOKING_IMAGE] Prepared",
            {
              width:
                pass.maxWidth,

              compress:
                pass.compress,

              base64Length:
                base64.length,
            },
          );
        }

        return {
          base64,

          mimeType:
            "image/jpeg",
        };
      }

      if (__DEV__) {
        console.log(
          "[AI_BOOKING_IMAGE] Retrying smaller image",
          {
            width:
              pass.maxWidth,

            compress:
              pass.compress,

            base64Length:
              base64.length,
          },
        );
      }
    }

    /* ==========================================================
       STILL TOO LARGE
    ========================================================== */

    throw new Error(
      "The photo is still too large after processing. Please take another photo or choose a smaller image.",
    );
  } catch (
    error: unknown
  ) {
    /*
     * Do not use console.error here.
     * This is a handled user-flow failure and should not trigger
     * Expo's development error overlay.
     */
    if (__DEV__) {
      console.warn(
        "[AI_BOOKING_IMAGE] Processing failed",
        {
          name:
            error instanceof Error
              ? error.name
              : "",

          message:
            error instanceof Error
              ? error.message
              : "Unknown image processing error.",
        },
      );
    }

    if (
      error instanceof Error
    ) {
      throw error;
    }

    throw new Error(
      "Unable to prepare the selected image.",
    );
  }
}