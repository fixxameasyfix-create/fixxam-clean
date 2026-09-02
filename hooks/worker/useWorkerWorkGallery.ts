import {
  useCallback,
  useState,
} from "react";

import * as ImagePicker from "expo-image-picker";

import {
  showError,
} from "@/utils/showToast";

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
     ADD WORK PHOTOS
  ============================================================ */

  const addWorkPhoto =
    useCallback(async () => {
      if (loading) {
        return;
      }

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

        const remainingSlots =
          MAX_WORK_GALLERY_IMAGES -
          workGallery.length;

        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          showError(
            "Permission Required",
            "Please allow photo library access to add work photos.",
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],

            allowsMultipleSelection: true,

            selectionLimit:
              remainingSlots,

            allowsEditing: false,

            quality: 0.8,
          });

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        const selectedUris =
          result.assets
            .map(
              (asset) =>
                asset.uri?.trim(),
            )
            .filter(
              (
                uri,
              ): uri is string =>
                Boolean(uri),
            );

        if (
          selectedUris.length === 0
        ) {
          return;
        }

        setWorkGallery(
          (current) => {
            const existing =
              new Set(current);

            const newImages =
              selectedUris.filter(
                (uri) =>
                  !existing.has(uri),
              );

            return [
              ...current,
              ...newImages,
            ].slice(
              0,
              MAX_WORK_GALLERY_IMAGES,
            );
          },
        );
      } catch (error) {
        console.error(
          "Add Work Photo Error:",
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
     REMOVE WORK PHOTO
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
     CLEAR GALLERY
  ============================================================ */

  const clearWorkGallery =
    useCallback(() => {
      setWorkGallery([]);
    }, [setWorkGallery]);

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    loading,

    addWorkPhoto,

    removeWorkPhoto,

    clearWorkGallery,

    maxImages:
      MAX_WORK_GALLERY_IMAGES,

    canAddMore:
      workGallery.length <
      MAX_WORK_GALLERY_IMAGES,
  };
}