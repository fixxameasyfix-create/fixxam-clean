import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import {
  storage,
} from "@/firebase/config";

export async function updateProductImages(
  images: string[],
  workerId: string,
  productId: string,
) {

  const uploadedImages: string[] = [];

  for (const image of images) {

    if (
      image.startsWith("https")
    ) {

      uploadedImages.push(
        image,
      );

      continue;

    }


    const response =
      await fetch(image);

    const blob =
      await response.blob();


    const imageRef =
      ref(
        storage,
        `products/${workerId}/${productId}/${Date.now()}`,
      );


    await uploadBytes(
      imageRef,
      blob,
    );


    const url =
      await getDownloadURL(
        imageRef,
      );


    uploadedImages.push(
      url,
    );

  }


  return {

    thumbnail:
      uploadedImages[0] ?? "",

    images:
      uploadedImages,

  };

}