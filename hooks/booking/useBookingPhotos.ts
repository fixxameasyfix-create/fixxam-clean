import {
  useCallback,
} from "react";

import * as ImagePicker from "expo-image-picker";

type Props = {
  photos: string[];

  addPhoto: (
    uri: string
  ) => void;

  replacePhoto: (
    index: number,
    uri: string
  ) => void;
};

export default function useBookingPhotos({

  photos,

  addPhoto,

  replacePhoto,

}: Props) {

  const openCamera =
    useCallback(

      async (
        index?: number
      ) => {

        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (
          !permission.granted
        ) {
          return;
        }

        const result =
          await ImagePicker.launchCameraAsync({

            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,

            allowsEditing: true,

            quality: 0.8,

          });

        if (
          result.canceled
        ) {
          return;
        }

        const uri =
          result.assets[0].uri;

        if (
          index === undefined
        ) {

          addPhoto(uri);

        } else {

          replacePhoto(
            index,
            uri
          );

        }

      },

      [

        addPhoto,

        replacePhoto,

      ]

    );

  const openGallery =
    useCallback(

      async (
        index?: number
      ) => {

        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {
          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync({

            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,

            allowsEditing: true,

            quality: 0.8,

          });

        if (
          result.canceled
        ) {
          return;
        }

        const uri =
          result.assets[0].uri;

        if (
          index === undefined
        ) {

          addPhoto(uri);

        } else {

          replacePhoto(
            index,
            uri
          );

        }

      },

      [

        addPhoto,

        replacePhoto,

      ]

    );

  return {

    openCamera,

    openGallery,

  };

}