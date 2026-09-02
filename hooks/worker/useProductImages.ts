import { useState } from "react";

import * as ImagePicker from "expo-image-picker";

export default function useProductImages() {

  const [images, setImages] =
    useState<string[]>([]);

  async function pickImages() {

    if (images.length >= 5) {
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({

        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,

        allowsMultipleSelection: true,

        selectionLimit:
          5 - images.length,

        quality: 0.8,

      });

    if (result.canceled) {
      return;
    }

    const selected =
      result.assets.map(
        (item) => item.uri,
      );

    setImages((old) => [

      ...old,

      ...selected,

    ].slice(0, 5));

  }

  function removeImage(
    uri: string,
  ) {

    setImages((old) =>
      old.filter(
        (item) =>
          item !== uri,
      ),
    );

  }

  return {

    images,

    setImages,

    pickImages,

    removeImage,

  };

}