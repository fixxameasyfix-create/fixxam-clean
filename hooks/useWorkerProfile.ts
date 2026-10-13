import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Alert } from "react-native";

import * as ImagePicker from "expo-image-picker";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/firebase/config";

import {
  MAX_GALLERY_PHOTOS,
  MAX_IMAGE_BYTES,
  EMPTY_WORKER_PROFILE,
  EMPTY_WORKER_SERVICE_LOCATION,
  WorkerProfile,
  WorkerProfileField,
  WorkerServiceLocation,
} from "@/types/workerProfile";

import {
  saveWorkerGallery,
  saveWorkerProfile,
  saveWorkerProfilePhoto,
  subscribeToWorkerProfile,
  uploadWorkerImage,
} from "@/services/worker/workerProfileService";

/* ============================================================
   TYPES
============================================================ */

export type UseWorkerProfileReturn = {
  profile: WorkerProfile;
  loading: boolean;
  saving: boolean;
  uploadingPhoto: boolean;
  uploadingGallery: boolean;

  updateField: <
    K extends WorkerProfileField,
  >(
    field: K,
    value: WorkerProfile[K],
  ) => void;

  pickProfilePhoto: () => Promise<void>;

  addGalleryPhoto: () => Promise<void>;

  replaceGalleryPhoto: (
    index: number,
  ) => Promise<void>;

  removeGalleryPhoto: (
    index: number,
  ) => Promise<void>;

  saveProfile: () => Promise<void>;
};

/* ============================================================
   CONSTANTS
============================================================ */

const IMAGE_PICKER_QUALITY = 0.85;

const PROFILE_IMAGE_FOLDER = "profile" as const;

const GALLERY_IMAGE_FOLDER = "gallery" as const;

const PROFILE_PHOTO_FALLBACK = "";

const MAX_NAME_LENGTH = 100;

/* ============================================================
   HELPERS
============================================================ */

function createEmptyWorkerProfile(): WorkerProfile {
  return {
    ...EMPTY_WORKER_PROFILE,

    selectedServices: [
      ...(EMPTY_WORKER_PROFILE.selectedServices ?? []),
    ],

    serviceLocation: {
      ...EMPTY_WORKER_SERVICE_LOCATION,
    },

    workGallery: [],
  };
}

/* ------------------------------------------------------------
   PHOTO URL
------------------------------------------------------------ */

function normalizePhotoUrl(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return PROFILE_PHOTO_FALLBACK;
  }

  const url = value.trim();

  if (!url) {
    return PROFILE_PHOTO_FALLBACK;
  }

  return /^https:\/\//i.test(url)
    ? url
    : PROFILE_PHOTO_FALLBACK;
}

/* ------------------------------------------------------------
   GALLERY
------------------------------------------------------------ */

function normalizeGallery(
  gallery: unknown,
): string[] {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return Array.from(
    new Set(
      gallery
        .filter(
          (url): url is string =>
            typeof url === "string",
        )
        .map((url) => url.trim())
        .filter(
          (url) =>
            url.length > 0 &&
            /^https:\/\//i.test(url),
        ),
    ),
  ).slice(0, MAX_GALLERY_PHOTOS);
}

/* ------------------------------------------------------------
   SERVICE LOCATION
------------------------------------------------------------ */

function normalizeServiceLocation(
  location:
    | WorkerServiceLocation
    | undefined,
): WorkerServiceLocation {
  if (!location) {
    return {
      ...EMPTY_WORKER_SERVICE_LOCATION,
    };
  }

  const latitude =
    typeof location.latitude === "number" &&
    Number.isFinite(location.latitude)
      ? location.latitude
      : null;

  const longitude =
    typeof location.longitude === "number" &&
    Number.isFinite(location.longitude)
      ? location.longitude
      : null;

  return {
    address:
      typeof location.address === "string"
        ? location.address.trim()
        : "",

    state:
      typeof location.state === "string"
        ? location.state.trim()
        : "",

    lga:
      typeof location.lga === "string"
        ? location.lga.trim()
        : "",

    latitude,
    longitude,
  };
}

/* ------------------------------------------------------------
   CLONE PROFILE
------------------------------------------------------------ */

function cloneWorkerProfile(
  profile: WorkerProfile,
): WorkerProfile {
  return {
    ...profile,

    photoUrl: normalizePhotoUrl(
      profile.photoUrl,
    ),

    selectedServices: Array.from(
      new Set(
        (profile.selectedServices ?? [])
          .filter(
            (item): item is string =>
              typeof item === "string",
          )
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ),

    workGallery: normalizeGallery(
      profile.workGallery ?? [],
    ),

    serviceLocation:
      normalizeServiceLocation(
        profile.serviceLocation,
      ),
  };
}

/* ------------------------------------------------------------
   PROFILE VALUE COMPARISON
------------------------------------------------------------ */

function areProfileValuesEqual(
  first: unknown,
  second: unknown,
): boolean {
  if (Object.is(first, second)) {
    return true;
  }

  if (
    first === null ||
    second === null ||
    typeof first !== "object" ||
    typeof second !== "object"
  ) {
    return false;
  }

  try {
    return (
      JSON.stringify(first) ===
      JSON.stringify(second)
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------
   FILE SIZE
------------------------------------------------------------ */

async function getLocalFileSize(
  uri: string,
): Promise<number | null> {
  try {
    const response = await fetch(uri);

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    return Number.isFinite(blob.size)
      ? blob.size
      : null;
  } catch {
    return null;
  }
}

async function getAssetFileSize(
  asset: ImagePicker.ImagePickerAsset,
): Promise<number | null> {
  if (
    typeof asset.fileSize === "number" &&
    Number.isFinite(asset.fileSize) &&
    asset.fileSize >= 0
  ) {
    return asset.fileSize;
  }

  return getLocalFileSize(asset.uri);
}

/* ------------------------------------------------------------
   ERROR MESSAGE
------------------------------------------------------------ */

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return fallback;
}

/* ------------------------------------------------------------
   FILE NAME
------------------------------------------------------------ */

function getImageFileName(
  fileName: string | null | undefined,
  fallback: string,
): string {
  if (
    typeof fileName === "string" &&
    fileName.trim()
  ) {
    return fileName.trim();
  }

  return fallback;
}

/* ------------------------------------------------------------
   IMAGE PERMISSION
------------------------------------------------------------ */

async function requestImagePermission(
  message: string,
): Promise<boolean> {
  try {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      permission.status !==
      ImagePicker.PermissionStatus.GRANTED
    ) {
      Alert.alert(
        "Permission Required",
        message,
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "[useWorkerProfile] Permission error:",
      error,
    );

    Alert.alert(
      "Permission Error",
      "Unable to access your photo library.",
    );

    return false;
  }
}

/* ============================================================
   HOOK
============================================================ */

export function useWorkerProfile(): UseWorkerProfileReturn {
  /* ==========================================================
     STATE
  ========================================================== */

  const [profile, setProfile] =
    useState<WorkerProfile>(
      createEmptyWorkerProfile,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const [uploadingGallery, setUploadingGallery] =
    useState(false);

  /* ==========================================================
     REFS
  ========================================================== */

  const profileRef =
    useRef<WorkerProfile>(
      createEmptyWorkerProfile(),
    );

  const mountedRef =
    useRef(true);

  const dirtyFieldsRef =
    useRef<Set<WorkerProfileField>>(
      new Set(),
    );

  const savingRef =
    useRef(false);

  const uploadingPhotoRef =
    useRef(false);

  const uploadingGalleryRef =
    useRef(false);

  /* ==========================================================
     REPLACE PROFILE
  ========================================================== */

  const replaceProfile =
    useCallback(
      (
        nextProfile: WorkerProfile,
      ) => {
        const normalized =
          cloneWorkerProfile(
            nextProfile,
          );

        profileRef.current =
          normalized;

        if (mountedRef.current) {
          setProfile(normalized);
        }
      },
      [],
    );

  /* ==========================================================
     UPDATE FIELD
  ========================================================== */

  const updateField =
    useCallback(
      <
        K extends WorkerProfileField,
      >(
        field: K,
        value: WorkerProfile[K],
      ) => {
        dirtyFieldsRef.current.add(
          field,
        );

        const current =
          profileRef.current;

        const next = {
          ...current,
          [field]: value,
        } as WorkerProfile;

        profileRef.current =
          next;

        if (mountedRef.current) {
          setProfile(next);
        }
      },
      [],
    );

  /* ==========================================================
     AUTH + REALTIME PROFILE
  ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    let unsubscribeProfile:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          unsubscribeProfile?.();

          unsubscribeProfile =
            undefined;

          dirtyFieldsRef.current.clear();

          if (!user) {
            const empty =
              createEmptyWorkerProfile();

            profileRef.current =
              empty;

            if (mountedRef.current) {
              setProfile(empty);
              setLoading(false);
              setSaving(false);
              setUploadingPhoto(false);
              setUploadingGallery(false);
            }

            return;
          }

          if (mountedRef.current) {
            setLoading(true);
          }

          unsubscribeProfile =
            subscribeToWorkerProfile(
              user.uid,
              (incomingProfile) => {
                if (!mountedRef.current) {
                  return;
                }

                const current =
                  profileRef.current;

                const dirty =
                  dirtyFieldsRef.current;

                const merged =
                  cloneWorkerProfile(
                    incomingProfile,
                  );

                /* ------------------------------------------
                   DIRTY FIELD RECONCILIATION
                ------------------------------------------ */

                if (
                  dirty.has("fullName")
                ) {
                  if (
                    areProfileValuesEqual(
                      merged.fullName,
                      current.fullName,
                    )
                  ) {
                    dirty.delete(
                      "fullName",
                    );
                  } else {
                    merged.fullName =
                      current.fullName;
                  }
                }

                if (
                  dirty.has(
                    "phoneNumber",
                  )
                ) {
                  if (
                    areProfileValuesEqual(
                      merged.phoneNumber,
                      current.phoneNumber,
                    )
                  ) {
                    dirty.delete(
                      "phoneNumber",
                    );
                  } else {
                    merged.phoneNumber =
                      current.phoneNumber;
                  }
                }

                /* ------------------------------------------
                   PHOTO
                ------------------------------------------ */

                if (
                  dirty.has("photoUrl")
                ) {
                  const incomingPhoto =
                    normalizePhotoUrl(
                      merged.photoUrl,
                    );

                  const currentPhoto =
                    normalizePhotoUrl(
                      current.photoUrl,
                    );

                  if (
                    areProfileValuesEqual(
                      incomingPhoto,
                      currentPhoto,
                    )
                  ) {
                    dirty.delete(
                      "photoUrl",
                    );

                    merged.photoUrl =
                      currentPhoto;
                  } else {
                    /**
                     * Keep the latest local photo
                     * until Firestore confirms it.
                     */
                    merged.photoUrl =
                      currentPhoto;
                  }
                }

                if (
                  dirty.has("category")
                ) {
                  if (
                    areProfileValuesEqual(
                      merged.category,
                      current.category,
                    )
                  ) {
                    dirty.delete(
                      "category",
                    );
                  } else {
                    merged.category =
                      current.category;
                  }
                }

                if (
                  dirty.has("subcategory")
                ) {
                  if (
                    areProfileValuesEqual(
                      merged.subcategory,
                      current.subcategory,
                    )
                  ) {
                    dirty.delete(
                      "subcategory",
                    );
                  } else {
                    merged.subcategory =
                      current.subcategory;
                  }
                }

                if (
                  dirty.has(
                    "selectedServices",
                  )
                ) {
                  if (
                    areProfileValuesEqual(
                      merged.selectedServices,
                      current.selectedServices,
                    )
                  ) {
                    dirty.delete(
                      "selectedServices",
                    );
                  } else {
                    merged.selectedServices =
                      [
                        ...current.selectedServices,
                      ];
                  }
                }

                if (
                  dirty.has("experience")
                ) {
                  if (
                    areProfileValuesEqual(
                      merged.experience,
                      current.experience,
                    )
                  ) {
                    dirty.delete(
                      "experience",
                    );
                  } else {
                    merged.experience =
                      current.experience;
                  }
                }

                if (
                  dirty.has("hourlyRate")
                ) {
                  if (
                    areProfileValuesEqual(
                      merged.hourlyRate,
                      current.hourlyRate,
                    )
                  ) {
                    dirty.delete(
                      "hourlyRate",
                    );
                  } else {
                    merged.hourlyRate =
                      current.hourlyRate;
                  }
                }

                if (
                  dirty.has("location")
                ) {
                  if (
                    areProfileValuesEqual(
                      merged.location,
                      current.location,
                    )
                  ) {
                    dirty.delete(
                      "location",
                    );
                  } else {
                    merged.location =
                      current.location;
                  }
                }

                if (
                  dirty.has(
                    "serviceLocation",
                  )
                ) {
                  const incomingLocation =
                    normalizeServiceLocation(
                      merged.serviceLocation,
                    );

                  const currentLocation =
                    normalizeServiceLocation(
                      current.serviceLocation,
                    );

                  if (
                    areProfileValuesEqual(
                      incomingLocation,
                      currentLocation,
                    )
                  ) {
                    dirty.delete(
                      "serviceLocation",
                    );
                  } else {
                    merged.serviceLocation =
                      currentLocation;
                  }
                }

                if (
                  dirty.has(
                    "workGallery",
                  )
                ) {
                  const incomingGallery =
                    normalizeGallery(
                      merged.workGallery,
                    );

                  const currentGallery =
                    normalizeGallery(
                      current.workGallery,
                    );

                  if (
                    areProfileValuesEqual(
                      incomingGallery,
                      currentGallery,
                    )
                  ) {
                    dirty.delete(
                      "workGallery",
                    );
                  } else {
                    merged.workGallery = [
                      ...currentGallery,
                    ];
                  }
                }

                if (
                  dirty.has("aboutMe")
                ) {
                  if (
                    areProfileValuesEqual(
                      merged.aboutMe,
                      current.aboutMe,
                    )
                  ) {
                    dirty.delete(
                      "aboutMe",
                    );
                  } else {
                    merged.aboutMe =
                      current.aboutMe;
                  }
                }

                replaceProfile(
                  merged,
                );

                setLoading(false);
              },
              (error) => {
                if (!mountedRef.current) {
                  return;
                }

                setLoading(false);

                console.error(
                  "[useWorkerProfile] Profile subscription error:",
                  error,
                );

                Alert.alert(
                  "Profile Error",
                  getErrorMessage(
                    error,
                    "Unable to load your worker profile.",
                  ),
                );
              },
            );
        },
      );

    return () => {
      mountedRef.current = false;

      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, [replaceProfile]);

  /* ==========================================================
     PROFILE PHOTO
  ========================================================== */

  const pickProfilePhoto =
    useCallback(
      async (): Promise<void> => {
        if (
          uploadingPhotoRef.current
        ) {
          return;
        }

        try {
          uploadingPhotoRef.current =
            true;

          if (mountedRef.current) {
            setUploadingPhoto(true);
          }

          const hasPermission =
            await requestImagePermission(
              "Please allow photo library access to choose your profile photo.",
            );

          if (!hasPermission) {
            return;
          }

          const result =
            await ImagePicker.launchImageLibraryAsync(
              {
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                allowsMultipleSelection: false,
                selectionLimit: 1,
                quality:
                  IMAGE_PICKER_QUALITY,
              },
            );

          if (
            result.canceled ||
            !result.assets?.length
          ) {
            return;
          }

          const asset =
            result.assets[0];

          if (!asset?.uri) {
            throw new Error(
              "The selected image could not be read.",
            );
          }

          const fileSize =
            await getAssetFileSize(
              asset,
            );

          if (
            fileSize !== null &&
            fileSize > MAX_IMAGE_BYTES
          ) {
            throw new Error(
              "Profile photo must be smaller than 10 MB.",
            );
          }

          const uid =
            auth.currentUser?.uid;

          if (!uid) {
            throw new Error(
              "Your session has expired. Please sign in again.",
            );
          }

          const fileName =
            getImageFileName(
              asset.fileName,
              `profile-${Date.now()}.jpg`,
            );

          const uploadedPhotoUrl =
            await uploadWorkerImage(
              uid,
              asset.uri,
              fileName,
              PROFILE_IMAGE_FOLDER,
            );

          const photoUrl =
            normalizePhotoUrl(
              uploadedPhotoUrl,
            );

          if (!photoUrl) {
            throw new Error(
              "The uploaded profile photo is invalid.",
            );
          }

          /**
           * IMPORTANT:
           *
           * Persist Firestore first.
           * Only after Firestore succeeds do
           * we update the local profile.
           */
          await saveWorkerProfilePhoto(
            uid,
            photoUrl,
          );

          if (!mountedRef.current) {
            return;
          }

          /**
           * Keep the photo dirty until the
           * realtime listener confirms the
           * same URL.
           */
          dirtyFieldsRef.current.add(
            "photoUrl",
          );

          const nextProfile = {
            ...profileRef.current,
            photoUrl,
          };

          profileRef.current =
            nextProfile;

          setProfile(nextProfile);

          Alert.alert(
            "Photo Updated",
            "Your profile photo has been updated successfully.",
          );
        } catch (error) {
          console.error(
            "[useWorkerProfile] Profile photo error:",
            error,
          );

          Alert.alert(
            "Photo Upload Failed",
            getErrorMessage(
              error,
              "Unable to update your profile photo.",
            ),
          );
        } finally {
          uploadingPhotoRef.current =
            false;

          if (mountedRef.current) {
            setUploadingPhoto(false);
          }
        }
      },
      [],
    );

  /* ==========================================================
     ADD GALLERY PHOTO
  ========================================================== */

  const addGalleryPhoto =
    useCallback(
      async (): Promise<void> => {
        if (
          uploadingGalleryRef.current
        ) {
          return;
        }

        const currentGallery =
          normalizeGallery(
            profileRef.current
              .workGallery,
          );

        const remaining =
          MAX_GALLERY_PHOTOS -
          currentGallery.length;

        if (remaining <= 0) {
          Alert.alert(
            "Gallery Limit",
            `You can upload a maximum of ${MAX_GALLERY_PHOTOS} gallery photos.`,
          );

          return;
        }

        try {
          uploadingGalleryRef.current =
            true;

          if (mountedRef.current) {
            setUploadingGallery(true);
          }

          const hasPermission =
            await requestImagePermission(
              "Please allow photo library access to choose work photos.",
            );

          if (!hasPermission) {
            return;
          }

          const result =
            await ImagePicker.launchImageLibraryAsync(
              {
                mediaTypes: ["images"],
                allowsEditing: false,
                allowsMultipleSelection: true,
                selectionLimit: remaining,
                quality:
                  IMAGE_PICKER_QUALITY,
              },
            );

          if (
            result.canceled ||
            !result.assets?.length
          ) {
            return;
          }

          const assets =
            result.assets.slice(
              0,
              remaining,
            );

          const uid =
            auth.currentUser?.uid;

          if (!uid) {
            throw new Error(
              "Your session has expired. Please sign in again.",
            );
          }

          const uploadedUrls: string[] =
            [];

          let failedUploads = 0;

          for (
            const asset of assets
          ) {
            if (!asset?.uri) {
              failedUploads += 1;
              continue;
            }

            const fileSize =
              await getAssetFileSize(
                asset,
              );

            if (
              fileSize !== null &&
              fileSize > MAX_IMAGE_BYTES
            ) {
              failedUploads += 1;
              continue;
            }

            try {
              const fileName =
                getImageFileName(
                  asset.fileName,
                  `gallery-${Date.now()}-${uploadedUrls.length}.jpg`,
                );

              const uploadedUrl =
                await uploadWorkerImage(
                  uid,
                  asset.uri,
                  fileName,
                  GALLERY_IMAGE_FOLDER,
                );

              const validUrl =
                normalizePhotoUrl(
                  uploadedUrl,
                );

              if (!validUrl) {
                failedUploads += 1;
                continue;
              }

              uploadedUrls.push(
                validUrl,
              );
            } catch (error) {
              failedUploads += 1;

              console.error(
                "[useWorkerProfile] Gallery image upload error:",
                error,
              );
            }
          }

          if (!uploadedUrls.length) {
            Alert.alert(
              "Upload Failed",
              "None of the selected photos could be uploaded.",
            );

            return;
          }

          const nextGallery =
            normalizeGallery([
              ...currentGallery,
              ...uploadedUrls,
            ]);

          const previousGallery =
            [...currentGallery];

          dirtyFieldsRef.current.add(
            "workGallery",
          );

          if (mountedRef.current) {
            updateField(
              "workGallery",
              nextGallery,
            );
          }

          try {
            await saveWorkerGallery(
              uid,
              nextGallery,
            );
          } catch (error) {
            dirtyFieldsRef.current.delete(
              "workGallery",
            );

            if (mountedRef.current) {
              replaceProfile({
                ...profileRef.current,
                workGallery:
                  previousGallery,
              });
            }

            throw error;
          }

          Alert.alert(
            "Gallery Updated",
            failedUploads > 0
              ? `${uploadedUrls.length} photo(s) uploaded. ${failedUploads} photo(s) could not be uploaded.`
              : "Your work gallery has been updated successfully.",
          );
        } catch (error) {
          console.error(
            "[useWorkerProfile] Gallery error:",
            error,
          );

          Alert.alert(
            "Gallery Upload Failed",
            getErrorMessage(
              error,
              "Unable to update your work gallery.",
            ),
          );
        } finally {
          uploadingGalleryRef.current =
            false;

          if (mountedRef.current) {
            setUploadingGallery(false);
          }
        }
      },
      [replaceProfile, updateField],
    );

  /* ==========================================================
     REPLACE GALLERY PHOTO
  ========================================================== */

  const replaceGalleryPhoto =
    useCallback(
      async (
        index: number,
      ): Promise<void> => {
        if (
          uploadingGalleryRef.current
        ) {
          return;
        }

        const currentGallery =
          normalizeGallery(
            profileRef.current
              .workGallery,
          );

        if (
          index < 0 ||
          index >= currentGallery.length
        ) {
          Alert.alert(
            "Photo Not Found",
            "The selected gallery photo is no longer available.",
          );

          return;
        }

        const uid =
          auth.currentUser?.uid;

        if (!uid) {
          Alert.alert(
            "Session Expired",
            "Please sign in again and try again.",
          );

          return;
        }

        const previousGallery =
          [...currentGallery];

        try {
          uploadingGalleryRef.current =
            true;

          if (mountedRef.current) {
            setUploadingGallery(true);
          }

          const hasPermission =
            await requestImagePermission(
              "Please allow photo library access to change your work photo.",
            );

          if (!hasPermission) {
            return;
          }

          const result =
            await ImagePicker.launchImageLibraryAsync(
              {
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                allowsMultipleSelection: false,
                selectionLimit: 1,
                quality:
                  IMAGE_PICKER_QUALITY,
              },
            );

          if (
            result.canceled ||
            !result.assets?.length
          ) {
            return;
          }

          const asset =
            result.assets[0];

          if (!asset?.uri) {
            throw new Error(
              "The selected image could not be read.",
            );
          }

          const fileSize =
            await getAssetFileSize(
              asset,
            );

          if (
            fileSize !== null &&
            fileSize > MAX_IMAGE_BYTES
          ) {
            throw new Error(
              "The new gallery photo must be smaller than 10 MB.",
            );
          }

          const fileName =
            getImageFileName(
              asset.fileName,
              `gallery-replace-${Date.now()}.jpg`,
            );

          const uploadedUrl =
            await uploadWorkerImage(
              uid,
              asset.uri,
              fileName,
              GALLERY_IMAGE_FOLDER,
            );

          const newPhotoUrl =
            normalizePhotoUrl(
              uploadedUrl,
            );

          if (!newPhotoUrl) {
            throw new Error(
              "The new photo could not be uploaded.",
            );
          }

          const nextGallery =
            currentGallery.map(
              (
                photoUrl,
                photoIndex,
              ) =>
                photoIndex === index
                  ? newPhotoUrl
                  : photoUrl,
            );

          dirtyFieldsRef.current.add(
            "workGallery",
          );

          if (mountedRef.current) {
            updateField(
              "workGallery",
              nextGallery,
            );
          }

          try {
            await saveWorkerGallery(
              uid,
              nextGallery,
            );
          } catch (error) {
            dirtyFieldsRef.current.delete(
              "workGallery",
            );

            if (mountedRef.current) {
              replaceProfile({
                ...profileRef.current,
                workGallery:
                  previousGallery,
              });
            }

            throw error;
          }

          Alert.alert(
            "Photo Changed",
            "Your work gallery photo has been replaced successfully.",
          );
        } catch (error) {
          console.error(
            "[useWorkerProfile] Replace gallery photo error:",
            error,
          );

          Alert.alert(
            "Change Failed",
            getErrorMessage(
              error,
              "Unable to change this gallery photo.",
            ),
          );
        } finally {
          uploadingGalleryRef.current =
            false;

          if (mountedRef.current) {
            setUploadingGallery(false);
          }
        }
      },
      [replaceProfile, updateField],
    );

  /* ==========================================================
     REMOVE GALLERY PHOTO
  ========================================================== */

  const removeGalleryPhoto =
    useCallback(
      async (
        index: number,
      ): Promise<void> => {
        if (
          uploadingGalleryRef.current
        ) {
          return;
        }

        const currentGallery =
          normalizeGallery(
            profileRef.current
              .workGallery,
          );

        if (
          index < 0 ||
          index >= currentGallery.length
        ) {
          return;
        }

        const previousGallery =
          [...currentGallery];

        const nextGallery =
          previousGallery.filter(
            (_, itemIndex) =>
              itemIndex !== index,
          );

        const uid =
          auth.currentUser?.uid;

        if (!uid) {
          Alert.alert(
            "Session Expired",
            "Please sign in again and try again.",
          );

          return;
        }

        try {
          uploadingGalleryRef.current =
            true;

          if (mountedRef.current) {
            setUploadingGallery(true);
          }

          dirtyFieldsRef.current.add(
            "workGallery",
          );

          if (mountedRef.current) {
            updateField(
              "workGallery",
              nextGallery,
            );
          }

          try {
            await saveWorkerGallery(
              uid,
              nextGallery,
            );
          } catch (error) {
            dirtyFieldsRef.current.delete(
              "workGallery",
            );

            if (mountedRef.current) {
              replaceProfile({
                ...profileRef.current,
                workGallery:
                  previousGallery,
              });
            }

            throw error;
          }

          Alert.alert(
            "Photo Removed",
            "The gallery photo has been removed successfully.",
          );
        } catch (error) {
          console.error(
            "[useWorkerProfile] Gallery removal error:",
            error,
          );

          Alert.alert(
            "Remove Failed",
            getErrorMessage(
              error,
              "Unable to remove this photo.",
            ),
          );
        } finally {
          uploadingGalleryRef.current =
            false;

          if (mountedRef.current) {
            setUploadingGallery(false);
          }
        }
      },
      [replaceProfile, updateField],
    );

  /* ==========================================================
     SAVE PROFILE
  ========================================================== */

  const saveProfile =
    useCallback(
      async (): Promise<void> => {
        if (savingRef.current) {
          return;
        }

        const uid =
          auth.currentUser?.uid;

        if (!uid) {
          Alert.alert(
            "Session Expired",
            "Please sign in again before saving your profile.",
          );

          return;
        }

        const currentProfile =
          cloneWorkerProfile(
            profileRef.current,
          );

        currentProfile.photoUrl =
          normalizePhotoUrl(
            currentProfile.photoUrl,
          );

        currentProfile.workGallery =
          normalizeGallery(
            currentProfile.workGallery,
          );

        currentProfile.serviceLocation =
          normalizeServiceLocation(
            currentProfile.serviceLocation,
          );

        currentProfile.selectedServices =
          Array.from(
            new Set(
              (
                currentProfile.selectedServices ??
                []
              )
                .filter(
                  (item): item is string =>
                    typeof item === "string",
                )
                .map((item) => item.trim())
                .filter(Boolean),
            ),
          );

        currentProfile.fullName =
          currentProfile.fullName.trim();

        if (!currentProfile.fullName) {
          Alert.alert(
            "Profile Incomplete",
            "Please enter your full name.",
          );

          return;
        }

        if (
          currentProfile.fullName.length >
          MAX_NAME_LENGTH
        ) {
          Alert.alert(
            "Invalid Name",
            "Your name is too long.",
          );

          return;
        }

        try {
          savingRef.current = true;

          if (mountedRef.current) {
            setSaving(true);
          }

          /**
           * saveWorkerProfile() also protects
           * the persisted photo at service level.
           */
          await saveWorkerProfile(
            uid,
            currentProfile,
          );

          if (mountedRef.current) {
            const savedProfile =
              cloneWorkerProfile(
                currentProfile,
              );

            profileRef.current =
              savedProfile;

            setProfile(
              savedProfile,
            );
          }

          Alert.alert(
            "Profile Published",
            "Your worker profile has been saved and published successfully.",
          );
        } catch (error) {
          console.error(
            "[useWorkerProfile] Save profile error:",
            error,
          );

          Alert.alert(
            "Save Failed",
            getErrorMessage(
              error,
              "Unable to save your worker profile.",
            ),
          );
        } finally {
          savingRef.current = false;

          if (mountedRef.current) {
            setSaving(false);
          }
        }
      },
      [],
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    profile,
    loading,
    saving,
    uploadingPhoto,
    uploadingGallery,

    updateField,

    pickProfilePhoto,

    addGalleryPhoto,

    replaceGalleryPhoto,

    removeGalleryPhoto,

    saveProfile,
  };
}

export default useWorkerProfile;