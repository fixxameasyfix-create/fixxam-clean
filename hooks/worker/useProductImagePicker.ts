import { useState } from "react";

import * as ImagePicker from "expo-image-picker";

export default function useProductImagePicker() {

  const [image, setImage] =
    useState<string | null>(null);

  const pickImage =
    async () => {

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        permission.status !==
        "granted"
      ) {

        return;

      }

      const result =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,

          allowsEditing: true,

          aspect: [1, 1],

          quality: 0.8,

        });

      if (
        result.canceled
      ) {

        return;

      }

      setImage(
        result.assets[0].uri,
      );

    };

  return {

    image,

    pickImage,

  };

}