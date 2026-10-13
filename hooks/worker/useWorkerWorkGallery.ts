import {
  useCallback,
  useState,
} from "react";

import * as ImagePicker from "expo-image-picker";

import {
  showError,
} from "@/utils/showToast";

import {
  uploadWorkerWorkPhotos,
} from "@/hooks/useWorkerPhoto";

const MAX_WORK_GALLERY_IMAGES = 6;

type UseWorkerWorkGalleryProps = {
  workGallery: string[];

  setWorkGallery: React.Dispatch<
    React.SetStateAction<string[]>
  >;
};

export default function useWorkerWorkGallery({
  workGallery,
  setWorkGallery,
}: UseWorkerWorkGalleryProps) {
  const [loading, setLoading] =
    useState(false);

  /* ============================================================
     CAMERA
  ============================================================ */

  const takeWorkPhoto =
    useCallback(async () => {
      if (loading) return;

      if (
        workGallery.length >=
        MAX_WORK_GALLERY_IMAGES
      ) {
        showError(
          "Gallery Full",
          `You can upload up to ${MAX_WORK_GALLERY_IMAGES} work photos.`,
        );

        return;
      }

      try {
        setLoading(true);

        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          showError(
            "Permission Required",
            "Please allow camera access to take a work photo.",
          );

          return;
        }

        const result =
          await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        const uri =
          result.assets[0]?.uri?.trim();

        if (!uri) return;

        setWorkGallery(
          (current) => {
            if (
              current.includes(uri)
            ) {
              return current;
            }

            return [
              ...current,
              uri,
            ].slice(
              0,
              MAX_WORK_GALLERY_IMAGES,
            );
          },
        );
      } catch (error) {
        console.error(
          "Take Work Photo Error:",
          error,
        );

        showError(
          "Camera Error",
          "Unable to take a work photo. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      loading,
      workGallery.length,
      setWorkGallery,
    ]);

  /* ============================================================
     GALLERY
  ============================================================ */

  const pickWorkPhotos =
    useCallback(async () => {
      if (loading) return;

      if (
        workGallery.length >=
        MAX_WORK_GALLERY_IMAGES
      ) {
        showError(
          "Gallery Full",
          `You can upload up to ${MAX_WORK_GALLERY_IMAGES} work photos.`,
        );

        return;
      }

      try {
        setLoading(true);

        const selected =
          await uploadWorkerWorkPhotos(
            workGallery.length,
            MAX_WORK_GALLERY_IMAGES,
          );

        if (!selected.length) {
          return;
        }

        setWorkGallery(
          (current) => {
            const existing =
              new Set(current);

            const unique =
              selected.filter(
                (uri) =>
                  !existing.has(uri),
              );

            return [
              ...current,
              ...unique,
            ].slice(
              0,
              MAX_WORK_GALLERY_IMAGES,
            );
          },
        );
      } catch (error) {
        console.error(
          "Pick Work Photos Error:",
          error,
        );

        showError(
          "Gallery Error",
          "Unable to add work photos. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      loading,
      workGallery.length,
      setWorkGallery,
    ]);

  /* ============================================================
     ADD PHOTO
  ============================================================ */

  const addWorkPhoto =
    useCallback(async () => {
      if (loading) return;

      if (
        workGallery.length >=
        MAX_WORK_GALLERY_IMAGES
      ) {
        showError(
          "Gallery Full",
          `You can upload up to ${MAX_WORK_GALLERY_IMAGES} work photos.`,
        );

        return;
      }

      // Native action sheet would be preferable here.
      // Alert keeps this component dependency-free.
      const {
        Alert,
      } = await import("react-native");

      Alert.alert(
        "Add Work Photo",
        "Choose how you want to add your work photo.",
        [
          {
            text: "Camera",
            onPress: () => {
              void takeWorkPhoto();
            },
          },
          {
            text: "Gallery",
            onPress: () => {
              void pickWorkPhotos();
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
    }, [
      loading,
      workGallery.length,
      takeWorkPhoto,
      pickWorkPhotos,
    ]);

  /* ============================================================
     REMOVE
  ============================================================ */

  const removeWorkPhoto =
    useCallback(
      (index: number) => {
        setWorkGallery(
          (current) => {
            if (
              index < 0 ||
              index >= current.length
            ) {
              return current;
            }

            return current.filter(
              (_, i) =>
                i !== index,
            );
          },
        );
      },
      [setWorkGallery],
    );

  /* ============================================================
     CLEAR
  ============================================================ */

  const clearWorkGallery =
    useCallback(() => {
      setWorkGallery([]);
    }, [setWorkGallery]);

  return {
    loading,

    addWorkPhoto,

    takeWorkPhoto,

    pickWorkPhotos,

    removeWorkPhoto,

    clearWorkGallery,

    maxImages:
      MAX_WORK_GALLERY_IMAGES,

    canAddMore:
      workGallery.length <
      MAX_WORK_GALLERY_IMAGES,
  };
}