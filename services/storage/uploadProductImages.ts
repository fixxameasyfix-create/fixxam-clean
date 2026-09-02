import uploadProductImage, {
  UploadedProductImage,
} from "./uploadProductImage";

type UploadProductImagesResult = {
  thumbnail: string;
  images: string[];
};

export default async function uploadProductImages(
  images: string[],
  workerId: string,
): Promise<UploadProductImagesResult> {
  const normalizedWorkerId = workerId.trim();

  if (!normalizedWorkerId) {
    throw new Error(
      "Worker ID is required before uploading product images.",
    );
  }

  const validImages = images.filter(
    (image): image is string =>
      typeof image === "string" &&
      image.trim().length > 0,
  );

  if (validImages.length === 0) {
    return {
      thumbnail: "",
      images: [],
    };
  }

  const uploadedImages: UploadedProductImage[] =
    await Promise.all(
      validImages.map((image) =>
        uploadProductImage(
          image,
          normalizedWorkerId,
        ),
      ),
    );

  const imageUrls = uploadedImages.map(
    (image) => image.downloadURL,
  );

  return {
    thumbnail: imageUrls[0] ?? "",
    images: imageUrls,
  };
}