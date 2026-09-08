import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import Toast from "react-native-toast-message";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
} from "@/firebase/config";

import {
  EMPTY_WORKER_PROFILE,
  MAX_GALLERY_PHOTOS,
  type WorkerProfile,
} from "@/types/workerProfile";

import {
  saveWorkerGallery,
  saveWorkerProfile,
  saveWorkerProfilePhoto,
  subscribeToWorkerProfile,
  uploadWorkerImage,
} from "@/services/worker/workerProfileService";

import {
  cleanString,
  isHttpsUrl,
  validateImageSize,
  validateWorkerProfile,
} from "@/utils/workerProfile";

/* ============================================================
   TYPES
============================================================ */

type WorkerProfileField =
  keyof WorkerProfile;

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

  removeGalleryPhoto: (
    index: number,
  ) => void;

  saveProfile: () => Promise<void>;
};

/* ============================================================
   HOOK
============================================================ */

export function useWorkerProfile(): UseWorkerProfileReturn {
  /* ==========================================================
     STATE
  ========================================================== */

  const [
    profile,
    setProfile,
  ] =
    useState<WorkerProfile>({
      ...EMPTY_WORKER_PROFILE,

      workGallery: [],
    });

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] =
    useState(false);

  const [
    uploadingGallery,
    setUploadingGallery,
  ] =
    useState(false);

  /* ==========================================================
     REFS
  ========================================================== */

  const savingRef =
    useRef(false);

  const uploadingPhotoRef =
    useRef(false);

  const uploadingGalleryRef =
    useRef(false);

  /*
   * Keep the latest profile available
   * inside async callbacks.
   */
  const profileRef =
    useRef<WorkerProfile>(
      profile,
    );

  /*
   * Prevent realtime Firestore snapshots
   * from replacing fields the worker is
   * currently editing.
   */
  const dirtyFieldsRef =
    useRef<
      Set<WorkerProfileField>
    >(
      new Set(),
    );

  /* ==========================================================
     KEEP PROFILE REF UPDATED
  ========================================================== */

  useEffect(() => {
    profileRef.current =
      profile;
  }, [profile]);

  /* ==========================================================
     UPDATE PROFILE STATE
  ========================================================== */

  const replaceProfile =
    useCallback(
      (
        updater:
          | WorkerProfile
          | ((
              current:
                WorkerProfile,
            ) =>
              WorkerProfile),
      ) => {
        setProfile(
          current => {
            const nextProfile =
              typeof updater ===
              "function"
                ? updater(
                    current,
                  )
                : updater;

            profileRef.current =
              nextProfile;

            return nextProfile;
          },
        );
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

        replaceProfile(
          current => ({
            ...current,

            [field]:
              value,
          }),
        );
      },
      [
        replaceProfile,
      ],
    );

  /* ==========================================================
     LOAD PROFILE
  ========================================================== */

  useEffect(() => {
    let unsubscribeProfile:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        user => {
          unsubscribeProfile?.();

          unsubscribeProfile =
            undefined;

          dirtyFieldsRef.current.clear();

          if (!user) {
            replaceProfile({
              ...EMPTY_WORKER_PROFILE,

              workGallery: [],
            });

            setLoading(false);

            return;
          }

          setLoading(true);

          try {
            unsubscribeProfile =
              subscribeToWorkerProfile(
                user.uid,

                incomingProfile => {
                  replaceProfile(
                    current => {
                      const dirty =
                        dirtyFieldsRef.current;

                      return {
                        fullName:
                          dirty.has(
                            "fullName",
                          )
                            ? current.fullName
                            : incomingProfile.fullName,

                        phoneNumber:
                          dirty.has(
                            "phoneNumber",
                          )
                            ? current.phoneNumber
                            : incomingProfile.phoneNumber,

                        photoUrl:
                          dirty.has(
                            "photoUrl",
                          )
                            ? current.photoUrl
                            : incomingProfile.photoUrl,

                        experience:
                          dirty.has(
                            "experience",
                          )
                            ? current.experience
                            : incomingProfile.experience,

                        hourlyRate:
                          dirty.has(
                            "hourlyRate",
                          )
                            ? current.hourlyRate
                            : incomingProfile.hourlyRate,

                        location:
                          dirty.has(
                            "location",
                          )
                            ? current.location
                            : incomingProfile.location,

                        workGallery:
                          dirty.has(
                            "workGallery",
                          )
                            ? current.workGallery
                            : incomingProfile.workGallery,

                        aboutMe:
                          dirty.has(
                            "aboutMe",
                          )
                            ? current.aboutMe
                            : incomingProfile.aboutMe,
                      };
                    },
                  );

                  setLoading(false);
                },

                error => {
                  console.error(
                    "BUILD_PROFILE_LISTENER_ERROR:",
                    error,
                  );

                  setLoading(false);

                  Toast.show({
                    type: "error",

                    text1:
                      "Unable to load profile",

                    text2:
                      "Please check your connection and try again.",
                  });
                },
              );
          } catch (error) {
            console.error(
              "BUILD_PROFILE_SUBSCRIPTION_ERROR:",
              error,
            );

            setLoading(false);

            Toast.show({
              type: "error",

              text1:
                "Unable to load profile",

              text2:
                "Please try again.",
            });
          }
        },
      );

    return () => {
      unsubscribeProfile?.();

      unsubscribeAuth();
    };
  }, [
    replaceProfile,
  ]);

  /* ==========================================================
     PICK PROFILE PHOTO
  ========================================================== */

  const pickProfilePhoto =
    useCallback(
      async () => {
        if (
          uploadingPhotoRef.current ||
          uploadingGalleryRef.current ||
          savingRef.current
        ) {
          return;
        }

        try {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (
            !permission.granted
          ) {
            Toast.show({
              type: "error",

              text1:
                "Photo permission required",

              text2:
                "Allow photo access to choose your profile photo.",
            });

            return;
          }

          const result =
            await ImagePicker.launchImageLibraryAsync(
              {
                mediaTypes: [
                  "images",
                ],

                allowsEditing:
                  true,

                aspect: [
                  1,
                  1,
                ],

                quality:
                  0.85,

                selectionLimit:
                  1,
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

          if (
            !validateImageSize(
              asset.fileSize,
            )
          ) {
            Toast.show({
              type: "error",

              text1:
                "Photo is too large",

              text2:
                "Please choose an image smaller than 10 MB.",
            });

            return;
          }

          const localUri =
            cleanString(
              asset.uri,
            );

          if (!localUri) {
            Toast.show({
              type: "error",

              text1:
                "Invalid photo",

              text2:
                "Please choose another image.",
            });

            return;
          }

          const user =
            auth.currentUser;

          if (!user) {
            Toast.show({
              type: "error",

              text1:
                "Session expired",

              text2:
                "Please sign in again.",
            });

            return;
          }

          uploadingPhotoRef.current =
            true;

          setUploadingPhoto(
            true,
          );

          const downloadURL =
            await uploadWorkerImage(
              localUri,

              `workerProfiles/${user.uid}/profile.jpg`,

              asset.mimeType ??
                "image/jpeg",
            );

          updateField(
            "photoUrl",
            downloadURL,
          );

          await saveWorkerProfilePhoto(
            user.uid,
            downloadURL,
          );

          dirtyFieldsRef.current.delete(
            "photoUrl",
          );
        } catch (error) {
          console.error(
            "PROFILE_PHOTO_UPLOAD_ERROR:",
            error,
          );

          Toast.show({
            type: "error",

            text1:
              "Upload failed",

            text2:
              "Unable to upload your profile photo. Please try again.",
          });
        } finally {
          uploadingPhotoRef.current =
            false;

          setUploadingPhoto(
            false,
          );
        }
      },
      [
        updateField,
      ],
    );

  /* ==========================================================
     ADD GALLERY PHOTOS
  ========================================================== */

  const addGalleryPhoto =
    useCallback(
      async () => {
        if (
          uploadingGalleryRef.current ||
          uploadingPhotoRef.current ||
          savingRef.current
        ) {
          return;
        }

        const currentGallery =
          profileRef.current
            .workGallery;

        if (
          currentGallery.length >=
          MAX_GALLERY_PHOTOS
        ) {
          Toast.show({
            type: "info",

            text1:
              "Gallery is full",

            text2:
              `You can add up to ${MAX_GALLERY_PHOTOS} work photos.`,
          });

          return;
        }

        try {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (
            !permission.granted
          ) {
            Toast.show({
              type: "error",

              text1:
                "Photo permission required",

              text2:
                "Allow photo access to add work photos.",
            });

            return;
          }

          const remaining =
            MAX_GALLERY_PHOTOS -
            currentGallery.length;

          const result =
            await ImagePicker.launchImageLibraryAsync(
              {
                mediaTypes: [
                  "images",
                ],

                allowsMultipleSelection:
                  true,

                selectionLimit:
                  remaining,

                quality:
                  0.85,
              },
            );

          if (
            result.canceled ||
            !result.assets?.length
          ) {
            return;
          }

          const user =
            auth.currentUser;

          if (!user) {
            Toast.show({
              type: "error",

              text1:
                "Session expired",

              text2:
                "Please sign in again.",
            });

            return;
          }

          uploadingGalleryRef.current =
            true;

          setUploadingGallery(
            true,
          );

          const selectedAssets =
            result.assets.slice(
              0,
              remaining,
            );

          /*
           * Maximum gallery size is six,
           * therefore bounded parallel
           * uploads are safe here.
           */
          const uploadResults =
            await Promise.allSettled(
              selectedAssets.map(
                async (
                  asset,
                  index,
                ) => {
                  if (
                    !validateImageSize(
                      asset.fileSize,
                    )
                  ) {
                    throw new Error(
                      "Image exceeds 10 MB.",
                    );
                  }

                  const localUri =
                    cleanString(
                      asset.uri,
                    );

                  if (!localUri) {
                    throw new Error(
                      "Invalid gallery image URI.",
                    );
                  }

                  const uniqueId =
                    `${Date.now()}-${index}-${Math.random()
                      .toString(36)
                      .slice(2, 9)}`;

                  return uploadWorkerImage(
                    localUri,

                    `workerProfiles/${user.uid}/gallery/${uniqueId}.jpg`,

                    asset.mimeType ??
                      "image/jpeg",
                  );
                },
              ),
            );

          const uploadedURLs =
            uploadResults
              .filter(
                (
                  result,
                ): result is PromiseFulfilledResult<string> =>
                  result.status ===
                    "fulfilled" &&
                  isHttpsUrl(
                    result.value,
                  ),
              )
              .map(
                result =>
                  result.value,
              );

          uploadResults.forEach(
            (
              result,
              index,
            ) => {
              if (
                result.status ===
                "rejected"
              ) {
                console.error(
                  "SINGLE_GALLERY_UPLOAD_ERROR:",
                  {
                    index,

                    error:
                      result.reason,
                  },
                );
              }
            },
          );

          if (
            uploadedURLs.length ===
            0
          ) {
            throw new Error(
              "No gallery images were uploaded.",
            );
          }

          /*
           * Get the latest gallery again
           * in case state changed while the
           * image picker was open.
           */
          const latestGallery =
            profileRef.current
              .workGallery;

          const newGallery =
            Array.from(
              new Set([
                ...latestGallery,

                ...uploadedURLs,
              ]),
            ).slice(
              0,
              MAX_GALLERY_PHOTOS,
            );

          updateField(
            "workGallery",
            newGallery,
          );

          await saveWorkerGallery(
            user.uid,
            newGallery,
          );

          dirtyFieldsRef.current.delete(
            "workGallery",
          );

          if (
            uploadedURLs.length <
            selectedAssets.length
          ) {
            Toast.show({
              type: "info",

              text1:
                "Some photos were skipped",

              text2:
                `${uploadedURLs.length} of ${selectedAssets.length} photos uploaded successfully.`,
            });
          }
        } catch (error) {
          console.error(
            "WORK_GALLERY_UPLOAD_ERROR:",
            error,
          );

          Toast.show({
            type: "error",

            text1:
              "Upload failed",

            text2:
              "Unable to upload the selected work photos. Please try again.",
          });
        } finally {
          uploadingGalleryRef.current =
            false;

          setUploadingGallery(
            false,
          );
        }
      },
      [
        updateField,
      ],
    );

  /* ==========================================================
     REMOVE GALLERY PHOTO
  ========================================================== */

  const removeGalleryPhoto =
    useCallback(
      (
        index: number,
      ) => {
        if (
          uploadingGalleryRef.current ||
          savingRef.current
        ) {
          return;
        }

        const currentGallery =
          profileRef.current
            .workGallery;

        if (
          index < 0 ||
          index >=
            currentGallery.length
        ) {
          return;
        }

        Alert.alert(
          "Remove photo?",

          "This photo will be removed from your public gallery.",

          [
            {
              text:
                "Cancel",

              style:
                "cancel",
            },

            {
              text:
                "Remove",

              style:
                "destructive",

              onPress:
                async () => {
                  const user =
                    auth.currentUser;

                  if (!user) {
                    Toast.show({
                      type: "error",

                      text1:
                        "Session expired",

                      text2:
                        "Please sign in again.",
                    });

                    return;
                  }

                  const previousGallery =
                    profileRef.current
                      .workGallery;

                  const newGallery =
                    previousGallery.filter(
                      (
                        _,
                        photoIndex,
                      ) =>
                        photoIndex !==
                        index,
                    );

                  updateField(
                    "workGallery",
                    newGallery,
                  );

                  try {
                    await saveWorkerGallery(
                      user.uid,
                      newGallery,
                    );

                    dirtyFieldsRef.current.delete(
                      "workGallery",
                    );
                  } catch (error) {
                    console.error(
                      "REMOVE_GALLERY_PHOTO_ERROR:",
                      error,
                    );

                    /*
                     * Remove dirty state before
                     * rolling back so Firestore
                     * can continue syncing.
                     */
                    dirtyFieldsRef.current.delete(
                      "workGallery",
                    );

                    replaceProfile(
                      current => ({
                        ...current,

                        workGallery:
                          previousGallery,
                      }),
                    );

                    Toast.show({
                      type: "error",

                      text1:
                        "Unable to remove photo",

                      text2:
                        "Please try again.",
                    });
                  }
                },
            },
          ],
        );
      },
      [
        replaceProfile,
        updateField,
      ],
    );

  /* ==========================================================
     SAVE PROFILE
  ========================================================== */

  const saveProfile =
    useCallback(
      async () => {
        if (
          savingRef.current ||
          uploadingPhotoRef.current ||
          uploadingGalleryRef.current
        ) {
          return;
        }

        const user =
          auth.currentUser;

        if (!user) {
          Toast.show({
            type: "error",

            text1:
              "Session expired",

            text2:
              "Please sign in again.",
          });

          return;
        }

        const currentProfile =
          profileRef.current;

        const validationError =
          validateWorkerProfile(
            currentProfile,
          );

        if (
          validationError
        ) {
          Toast.show({
            type: "error",

            text1:
              "Check your profile",

            text2:
              validationError,
          });

          return;
        }

        savingRef.current =
          true;

        setSaving(true);

        try {
          await saveWorkerProfile(
            user.uid,
            currentProfile,
          );

          dirtyFieldsRef.current.clear();

          Toast.show({
            type: "success",

            text1:
              "Profile published",

            text2:
              "Your worker profile has been updated successfully.",
          });
        } catch (error) {
          console.error(
            "SAVE_WORKER_PROFILE_ERROR:",
            error,
          );

          Toast.show({
            type: "error",

            text1:
              "Save failed",

            text2:
              "Unable to save your profile. Please try again.",
          });
        } finally {
          savingRef.current =
            false;

          setSaving(false);
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

    removeGalleryPhoto,

    saveProfile,
  };
}