import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type WorkerProfile = {
  fullName: string;

  phoneNumber: string;

  photoUrl: string;

  experience: string;

  hourlyRate: string;

  location: string;

  workGallery: string[];

  aboutMe: string;
};

const MAX_GALLERY_PHOTOS = 6;

/* ============================================================
   EMPTY PROFILE
============================================================ */

const EMPTY_PROFILE: WorkerProfile = {
  fullName: "",

  phoneNumber: "",

  photoUrl: "",

  experience: "",

  hourlyRate: "",

  location: "",

  workGallery: [],

  aboutMe: "",
};

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isHttpUrl(
  value: string,
): boolean {
  return (
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

function isLocalUri(
  value: string,
): boolean {
  return (
    value.startsWith("file://") ||
    value.startsWith("content://")
  );
}

/* ============================================================
   SAFE IMAGE URL
============================================================ */

/**
 * VERY IMPORTANT:
 *
 * Never allow file:// or content://
 * to be saved into Firestore.
 */
function getSafeImageUrl(
  value: unknown,
): string {
  const url =
    cleanString(value);

  if (!url) {
    return "";
  }

  if (
    isLocalUri(url)
  ) {
    return "";
  }

  if (
    isHttpUrl(url)
  ) {
    return url;
  }

  /*
   * gs:// is also not suitable directly
   * for React Native <Image>.
   *
   * It must be converted by the
   * upload/resolve process.
   */
  return "";
}

/* ============================================================
   UPLOAD LOCAL IMAGE
============================================================ */

async function uploadImageToStorage(
  userId: string,
  localUri: string,
  storagePath: string,
  mimeType = "image/jpeg",
): Promise<string> {
  const uri =
    cleanString(localUri);

  if (!uri) {
    throw new Error(
      "Image URI is empty.",
    );
  }

  /*
   * Do not upload something that is
   * already a remote URL.
   */
  if (
    isHttpUrl(uri)
  ) {
    return uri;
  }

  /*
   * Only local Expo images should
   * reach this function.
   */
  if (
    !isLocalUri(uri)
  ) {
    throw new Error(
      "Invalid local image URI.",
    );
  }

  const response =
    await fetch(uri);

  if (!response.ok) {
    throw new Error(
      `Unable to read image: ${response.status}`,
    );
  }

  const blob =
    await response.blob();

  const storage =
    getStorage();

  const imageRef =
    ref(
      storage,
      storagePath,
    );

  await uploadBytes(
    imageRef,
    blob,
    {
      contentType:
        mimeType ||
        blob.type ||
        "image/jpeg",

      cacheControl:
        "public,max-age=3600",
    },
  );

  const downloadURL =
    await getDownloadURL(
      imageRef,
    );

  /*
   * Final safety check.
   */
  if (
    !isHttpUrl(
      downloadURL,
    )
  ) {
    throw new Error(
      "Firebase Storage did not return a valid HTTPS URL.",
    );
  }

  return downloadURL;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function BuildYourProfileScreen() {
  const {
    width: screenWidth,
  } =
    useWindowDimensions();

  /* ==========================================================
     GALLERY SIZE
  ========================================================== */

  const galleryWidth =
    Math.max(
      280,
      screenWidth - 32,
    );

  const galleryHeight =
    Math.floor(
      galleryWidth *
        (9 / 16),
    );

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    profile,
    setProfile,
  ] =
    useState<WorkerProfile>(
      EMPTY_PROFILE,
    );

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
     LOAD PROFILE
  ========================================================== */

  useEffect(() => {
    const user =
      auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const profileRef =
      doc(
        db,
        "workerPublicProfiles",
        user.uid,
      );

    const unsubscribe =
      onSnapshot(
        profileRef,
        (snapshot) => {
          if (
            !snapshot.exists()
          ) {
            setProfile(
              EMPTY_PROFILE,
            );

            setLoading(false);

            return;
          }

          const data =
            snapshot.data();

          /*
           * IMPORTANT:
           *
           * New structure:
           *
           * data.workerProfile
           *
           * Old structure:
           *
           * root fields
           *
           * We support both while migrating.
           */

          const workerProfile =
            data.workerProfile &&
            typeof data.workerProfile ===
              "object"
              ? data.workerProfile
              : {};

          /* ==================================================
             PHOTO
          ================================================== */

          const photoUrl =
            getSafeImageUrl(
              workerProfile.photoUrl,
            ) ||
            getSafeImageUrl(
              workerProfile.photoURL,
            ) ||
            getSafeImageUrl(
              data.photoURL,
            ) ||
            getSafeImageUrl(
              data.photoUrl,
            );

          /* ==================================================
             PHONE
          ================================================== */

          const phoneNumber =
            cleanString(
              workerProfile.phoneNumber,
            ) ||
            cleanString(
              data.phoneNumber,
            ) ||
            cleanString(
              data.phone,
            );

          /* ==================================================
             GALLERY
          ================================================== */

       const rawGallery: unknown[] =
  Array.isArray(data.workGallery)
    ? data.workGallery
    : [];

const workGallery: string[] =
  rawGallery
    .filter(
      (item: unknown): item is string => {
        if (typeof item !== "string") {
          return false;
        }

        const value = item.trim();

        return (
          value.length > 0 &&
          isHttpUrl(value)
        );
      },
    )
    .map(
      (item: string): string =>
        item.trim(),
    )
    .slice(
      0,
      MAX_GALLERY_PHOTOS,
    );

          /* ==================================================
             NAME
          ================================================== */

          const fullName =
            cleanString(
              data.fullName,
            ) ||
            cleanString(
              data.name,
            ) ||
            cleanString(
              workerProfile.fullName,
            );

          /* ==================================================
             EXPERIENCE
          ================================================== */

          const experienceValue =
            workerProfile.experience ??
            data.experience;

          const experience =
            typeof experienceValue ===
              "number"
              ? String(
                  experienceValue,
                )
              : cleanString(
                  experienceValue,
                );

          /* ==================================================
             RATE
          ================================================== */

          const rateValue =
            workerProfile.hourlyRate ??
            workerProfile.rate ??
            data.rate ??
            data.hourlyRate;

          const hourlyRate =
            typeof rateValue ===
              "number"
              ? String(rateValue)
              : cleanString(
                  rateValue,
                );

          /* ==================================================
             LOCATION
          ================================================== */

          const location =
            cleanString(
              workerProfile.location,
            ) ||
            cleanString(
              workerProfile.address,
            ) ||
            cleanString(
              data.location,
            );

          /* ==================================================
             ABOUT
          ================================================== */

          const aboutMe =
            cleanString(
              workerProfile.aboutMe,
            ) ||
            cleanString(
              workerProfile.about,
            ) ||
            cleanString(
              data.aboutMe,
            );

          /* ==================================================
             SET STATE
          ================================================== */

          setProfile({
            fullName,

            phoneNumber,

            photoUrl,

            experience,

            hourlyRate,

            location,

            workGallery,

            aboutMe,
          });

          setLoading(false);
        },
        (error) => {
          console.error(
            "BUILD_PROFILE_LISTENER_ERROR:",
            error,
          );

          setLoading(false);

          Alert.alert(
            "Unable to load profile",
            "Please try again.",
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ==========================================================
     UPDATE FIELD
  ========================================================== */

  const updateField = <
    K extends keyof WorkerProfile
  >(
    field: K,
    value: WorkerProfile[K],
  ) => {
    setProfile(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  };

  /* ==========================================================
     PICK PROFILE PHOTO
  ========================================================== */

  const pickProfilePhoto =
    async () => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {
          Alert.alert(
            "Permission required",
            "Please allow photo access to choose your profile photo.",
          );

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

              selectionLimit: 1,
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

        const localUri =
          cleanString(
            asset.uri,
          );

        if (
          !localUri
        ) {
          return;
        }

        const user =
          auth.currentUser;

        if (!user) {
          Alert.alert(
            "Session expired",
            "Please sign in again.",
          );

          return;
        }

        /*
         * IMPORTANT:
         *
         * Show loading while uploading.
         *
         * We do NOT put localUri into
         * profile.photoUrl.
         */

        setUploadingPhoto(
          true,
        );

        const downloadURL =
          await uploadImageToStorage(
            user.uid,
            localUri,
            `workerProfiles/${user.uid}/profile.jpg`,
            asset.mimeType ??
              "image/jpeg",
          );

        /*
         * Final HTTPS URL only.
         */

        if (
          !isHttpUrl(
            downloadURL,
          )
        ) {
          throw new Error(
            "Invalid profile image URL.",
          );
        }

        updateField(
          "photoUrl",
          downloadURL,
        );

        /*
         * Save the photo immediately.
         *
         * This means the image is already
         * safe in Firestore even if the
         * worker leaves the screen.
         */

        const profileRef =
          doc(
            db,
            "workerPublicProfiles",
            user.uid,
          );

        await setDoc(
          profileRef,
          {
            /*
             * Compatibility root field.
             */
            photoURL:
              downloadURL,

            /*
             * Canonical field.
             */
            workerProfile: {
              photoUrl:
                downloadURL,
            },

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          },
        );

        if (__DEV__) {
          console.log(
            "PROFILE_PHOTO_UPLOADED:",
            {
              userId:
                user.uid,

              url:
                downloadURL,

              isHttps:
                isHttpUrl(
                  downloadURL,
                ),
            },
          );
        }
      } catch (error) {
        console.error(
          "PROFILE_PHOTO_UPLOAD_ERROR:",
          error,
        );

        Alert.alert(
          "Upload failed",
          "Unable to upload your profile photo. Please try again.",
        );
      } finally {
        setUploadingPhoto(
          false,
        );
      }
    };

  /* ==========================================================
     ADD GALLERY PHOTO
  ========================================================== */

  const addGalleryPhoto =
    async () => {
      if (
        profile.workGallery
          .length >=
        MAX_GALLERY_PHOTOS
      ) {
        Alert.alert(
          "Gallery limit",
          `You can add up to ${MAX_GALLERY_PHOTOS} work photos.`,
        );

        return;
      }

      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {
          Alert.alert(
            "Permission required",
            "Please allow photo access to add work photos.",
          );

          return;
        }

        const remaining =
          MAX_GALLERY_PHOTOS -
          profile.workGallery
            .length;

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
          Alert.alert(
            "Session expired",
            "Please sign in again.",
          );

          return;
        }

        setUploadingGallery(
          true,
        );

        const uploadedURLs: string[] =
          [];

        for (
          const [
            index,
            asset,
          ] of result.assets.entries()
        ) {
          const localUri =
            cleanString(
              asset.uri,
            );

          if (
            !localUri
          ) {
            continue;
          }

          try {
            const uniqueId =
              `${Date.now()}-${index}-${Math.random()
                .toString(36)
                .slice(2, 9)}`;

            const url =
              await uploadImageToStorage(
                user.uid,
                localUri,
                `workerProfiles/${user.uid}/gallery/${uniqueId}.jpg`,
                asset.mimeType ??
                  "image/jpeg",
              );

            if (
              isHttpUrl(
                url,
              )
            ) {
              uploadedURLs.push(
                url,
              );
            }
          } catch (error) {
            console.error(
              "SINGLE_GALLERY_UPLOAD_ERROR:",
              {
                index,
                error,
              },
            );
          }
        }

        if (
          uploadedURLs.length ===
          0
        ) {
          throw new Error(
            "No gallery images were uploaded.",
          );
        }

        const newGallery =
          [
            ...profile.workGallery,
            ...uploadedURLs,
          ].slice(
            0,
            MAX_GALLERY_PHOTOS,
          );

        /*
         * Update UI.
         */

        updateField(
          "workGallery",
          newGallery,
        );

        /*
         * Save canonical gallery
         * immediately.
         */

        const profileRef =
          doc(
            db,
            "workerPublicProfiles",
            user.uid,
          );

        await setDoc(
          profileRef,
          {
            /*
             * Compatibility.
             */
            workGallery:
              newGallery,

            /*
             * Canonical.
             */
            workerProfile: {
              workGallery:
                newGallery,
            },

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          },
        );

        if (
          uploadedURLs.length <
          result.assets.length
        ) {
          Alert.alert(
            "Gallery partially uploaded",
            `${uploadedURLs.length} photo(s) uploaded successfully. Some photos could not be uploaded.`,
          );
        }
      } catch (error) {
        console.error(
          "WORK_GALLERY_UPLOAD_ERROR:",
          error,
        );

        Alert.alert(
          "Upload failed",
          "Unable to upload the selected work photos. Please try again.",
        );
      } finally {
        setUploadingGallery(
          false,
        );
      }
    };

  /* ==========================================================
     REMOVE GALLERY PHOTO
  ========================================================== */

  const removeGalleryPhoto =
    (
      index: number,
    ) => {
      Alert.alert(
        "Remove photo?",
        "This photo will be removed from your public gallery.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },

          {
            text: "Remove",

            style:
              "destructive",

            onPress:
              async () => {
                const user =
                  auth.currentUser;

                if (!user) {
                  Alert.alert(
                    "Session expired",
                    "Please sign in again.",
                  );

                  return;
                }

                const newGallery =
                  profile.workGallery.filter(
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
                  const profileRef =
                    doc(
                      db,
                      "workerPublicProfiles",
                      user.uid,
                    );

                  await setDoc(
                    profileRef,
                    {
                      workGallery:
                        newGallery,

                      workerProfile: {
                        workGallery:
                          newGallery,
                      },

                      updatedAt:
                        serverTimestamp(),
                    },
                    {
                      merge: true,
                    },
                  );
                } catch (error) {
                  console.error(
                    "REMOVE_GALLERY_PHOTO_ERROR:",
                    error,
                  );

                  /*
                   * Restore UI if Firestore
                   * update fails.
                   */

                  setProfile(
                    (
                      current,
                    ) => ({
                      ...current,

                      workGallery:
                        profile.workGallery,
                    }),
                  );

                  Alert.alert(
                    "Unable to remove",
                    "The photo could not be removed. Please try again.",
                  );
                }
              },
          },
        ],
      );
    };

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validateProfile =
    (): string | null => {
      const name =
        profile.fullName.trim();

      const phoneNumber =
        profile.phoneNumber.trim();

      const experience =
        Number(
          profile.experience,
        );

      const rate =
        Number(
          profile.hourlyRate,
        );

      const location =
        profile.location.trim();

      const aboutMe =
        profile.aboutMe.trim();

      if (!name) {
        return "Please enter your name.";
      }

      if (
        name.length < 2 ||
        name.length > 100
      ) {
        return "Name must be between 2 and 100 characters.";
      }

      const normalizedPhone =
        phoneNumber.replace(
          /[\s()-]/g,
          "",
        );

      if (
        !normalizedPhone
      ) {
        return "Please enter your phone number.";
      }

      if (
        !/^\+?\d{10,15}$/.test(
          normalizedPhone,
        )
      ) {
        return "Please enter a valid phone number.";
      }

      if (
        !Number.isInteger(
          experience,
        ) ||
        experience < 0 ||
        experience > 60
      ) {
        return "Enter a valid experience in years.";
      }

      if (
        !Number.isFinite(
          rate,
        ) ||
        rate <= 0 ||
        rate > 100000000
      ) {
        return "Enter a valid hourly rate.";
      }

      if (!location) {
        return "Please enter your location.";
      }

      if (
        location.length >
        200
      ) {
        return "Location is too long.";
      }

      if (
        aboutMe.length >
        1000
      ) {
        return "About Me must not exceed 1000 characters.";
      }

      /*
       * Never allow local image paths
       * into save operation.
       */

      if (
        profile.photoUrl &&
        !isHttpUrl(
          profile.photoUrl,
        )
      ) {
        return "Your profile photo is not uploaded correctly. Please choose the photo again.";
      }

      for (
        const photo of
          profile.workGallery
      ) {
        if (
          !isHttpUrl(
            photo,
          )
        ) {
          return "One of your gallery photos is invalid. Please remove it and upload it again.";
        }
      }

      return null;
    };

  /* ==========================================================
     SAVE PROFILE
  ========================================================== */

  const saveProfile =
    async () => {
      const user =
        auth.currentUser;

      if (!user) {
        Alert.alert(
          "Session expired",
          "Please sign in again.",
        );

        return;
      }

      const validationError =
        validateProfile();

      if (
        validationError
      ) {
        Alert.alert(
          "Check your profile",
          validationError,
        );

        return;
      }

      try {
        setSaving(true);

        const profileRef =
          doc(
            db,
            "workerPublicProfiles",
            user.uid,
          );

        const experience =
          Number(
            profile.experience,
          );

        const hourlyRate =
          Number(
            profile.hourlyRate,
          );

        const phoneNumber =
          profile.phoneNumber
            .trim()
            .replace(
              /[\s()-]/g,
              "",
            );

        const fullName =
          profile.fullName
            .trim();

        const photoUrl =
          getSafeImageUrl(
            profile.photoUrl,
          );

        const workGallery =
          profile.workGallery.filter(
            (
              photo,
            ) =>
              isHttpUrl(
                photo,
              ),
          );

        /*
         * ======================================================
         * CANONICAL PROFILE
         * ======================================================
         *
         * This is the structure workerMapper expects.
         */

        const workerProfile = {
          fullName,

          phoneNumber,

          photoUrl,

          workGallery,

          experience:
            String(
              experience,
            ),

          hourlyRate,

          location:
            profile.location.trim(),

          address:
            profile.location.trim(),

          aboutMe:
            profile.aboutMe.trim(),

          about:
            profile.aboutMe.trim(),
        };

        /*
         * ======================================================
         * SAVE
         * ======================================================
         */

        await setDoc(
          profileRef,
          {
            /*
             * Worker identity.
             */

            uid:
              user.uid,

            userId:
              user.uid,

            fullName,

            name:
              fullName,

            phoneNumber,

            /*
             * ==================================================
             * ROOT COMPATIBILITY FIELDS
             * ==================================================
             *
             * Keep these temporarily because older
             * parts of the application may still use them.
             */

            photoURL:
              photoUrl,

            photoUrl,

            experience,

            rate:
              hourlyRate,

            hourlyRate,

            location:
              profile.location.trim(),

            workGallery,

            aboutMe:
              profile.aboutMe.trim(),

            /*
             * ==================================================
             * CANONICAL WORKER PROFILE
             * ==================================================
             */

            workerProfile,

            /*
             * ==================================================
             * PROFILE STATE
             * ==================================================
             */

            published:
              true,

            available:
              true,

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          },
        );

        Alert.alert(
          "Profile Published",
          "Your worker profile has been updated successfully.",
        );

        if (__DEV__) {
          console.log(
            "WORKER_PROFILE_SAVED:",
            {
              uid:
                user.uid,

              fullName,

              photoUrl,

              photoIsHttps:
                isHttpUrl(
                  photoUrl,
                ),

              galleryCount:
                workGallery.length,

              galleryIsValid:
                workGallery.every(
                  (
                    photo,
                  ) =>
                    isHttpUrl(
                      photo,
                    ),
                ),
            },
          );
        }
      } catch (error) {
        console.error(
          "SAVE_WORKER_PROFILE_ERROR:",
          error,
        );

        Alert.alert(
          "Save failed",
          "Unable to save your profile. Please try again.",
        );
      } finally {
        setSaving(false);
      }
    };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen>
        <View
          style={
            styles.loading
          }
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <AppText
            style={
              styles.loadingText
            }
          >
            Loading your profile...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <AppScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.container
          }
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <AppText
              weight="bold"
              style={
                styles.title
              }
            >
              Build Your Profile
            </AppText>

            <AppText
              style={
                styles.subtitle
              }
            >
              Complete your professional
              profile so customers can know
              you better.
            </AppText>
          </View>

          {/* ==================================================
              PROFILE PHOTO
          ================================================== */}

          <SectionTitle
            icon="camera-outline"
            title="Profile Photo"
          />

          <View
            style={
              styles.photoSection
            }
          >
            <View
              style={
                styles.photoWrapper
              }
            >
              {profile.photoUrl &&
              isHttpUrl(
                profile.photoUrl,
              ) ? (
                <Image
                  source={{
                    uri: profile.photoUrl,
                  }}
                  style={
                    styles.profilePhoto
                  }
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={
                    styles.photoPlaceholder
                  }
                >
                  <Ionicons
                    name="person-outline"
                    size={46}
                    color="#94A3B8"
                  />
                </View>
              )}

              {uploadingPhoto && (
                <View
                  style={
                    styles.photoLoading
                  }
                >
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                </View>
              )}
            </View>

            <Pressable
              onPress={
                pickProfilePhoto
              }
              disabled={
                uploadingPhoto ||
                uploadingGallery ||
                saving
              }
              style={({
                pressed,
              }) => [
                styles.photoButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="camera-outline"
                size={18}
                color="#2563EB"
              />

              <AppText
                weight="bold"
                style={
                  styles.photoButtonText
                }
              >
                {profile.photoUrl
                  ? "Change Photo"
                  : "Add Photo"}
              </AppText>
            </Pressable>
          </View>

          {/* ==================================================
              NAME
          ================================================== */}

          <FieldLabel
            label="Name"
            required
          />

          <TextInput
            value={
              profile.fullName
            }
            onChangeText={(
              value,
            ) =>
              updateField(
                "fullName",
                value,
              )
            }
            placeholder="Enter your full name"
            placeholderTextColor="#94A3B8"
            maxLength={100}
            autoCapitalize="words"
            style={
              styles.input
            }
          />

          {/* ==================================================
              PHONE
          ================================================== */}

          <FieldLabel
            label="Phone Number"
            required
          />

          <View
            style={
              styles.inputIconWrapper
            }
          >
            <Ionicons
              name="call-outline"
              size={19}
              color="#64748B"
            />

            <TextInput
              value={
                profile.phoneNumber
              }
              onChangeText={(
                value,
              ) =>
                updateField(
                  "phoneNumber",
                  value.replace(
                    /[^\d+()\-\s]/g,
                    "",
                  ),
                )
              }
              placeholder="e.g. 08012345678"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={20}
              autoComplete="tel"
              textContentType="telephoneNumber"
              style={
                styles.iconInput
              }
            />
          </View>

          <AppText
            style={
              styles.phoneHelper
            }
          >
            Customers can use this number
            to contact you about a job.
          </AppText>

          {/* ==================================================
              EXPERIENCE
          ================================================== */}

          <FieldLabel
            label="Experience"
            required
          />

          <View
            style={
              styles.inputWithSuffix
            }
          >
            <TextInput
              value={
                profile.experience
              }
              onChangeText={(
                value,
              ) =>
                updateField(
                  "experience",
                  value.replace(
                    /[^0-9]/g,
                    "",
                  ),
                )
              }
              placeholder="e.g. 5"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={2}
              style={
                styles.suffixInput
              }
            />

            <AppText
              style={
                styles.suffix
              }
            >
              Years
            </AppText>
          </View>

          {/* ==================================================
              RATE
          ================================================== */}

          <FieldLabel
            label="Rate"
            required
          />

          <View
            style={
              styles.inputWithPrefix
            }
          >
            <AppText
              weight="bold"
              style={
                styles.prefix
              }
            >
              ₦
            </AppText>

            <TextInput
              value={
                profile.hourlyRate
              }
              onChangeText={(
                value,
              ) =>
                updateField(
                  "hourlyRate",
                  value.replace(
                    /[^0-9.]/g,
                    "",
                  ),
                )
              }
              placeholder="e.g. 5000"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              maxLength={12}
              style={
                styles.prefixInput
              }
            />

            <AppText
              style={
                styles.rateSuffix
              }
            >
              / hour
            </AppText>
          </View>

          {/* ==================================================
              LOCATION
          ================================================== */}

          <FieldLabel
            label="Location"
            required
          />

          <View
            style={
              styles.inputIconWrapper
            }
          >
            <Ionicons
              name="location-outline"
              size={19}
              color="#64748B"
            />

            <TextInput
              value={
                profile.location
              }
              onChangeText={(
                value,
              ) =>
                updateField(
                  "location",
                  value,
                )
              }
              placeholder="Enter your service location"
              placeholderTextColor="#94A3B8"
              maxLength={200}
              style={
                styles.iconInput
              }
            />
          </View>

          {/* ==================================================
              WORK GALLERY
          ================================================== */}

          <SectionTitle
            icon="images-outline"
            title="Work Gallery"
          />

          <AppText
            style={
              styles.helper
            }
          >
            Add photos of work you have
            completed. Customers will see
            these photos on your profile.
          </AppText>

          <View
            style={
              styles.gallerySection
            }
          >
            {profile.workGallery
              .length > 0 ? (
              <FlatList
                data={
                  profile.workGallery
                }
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                decelerationRate="fast"
                snapToInterval={
                  galleryWidth +
                  12
                }
                snapToAlignment="start"
                keyExtractor={(
                  photo,
                  index,
                ) =>
                  `${photo}-${index}`
                }
                contentContainerStyle={
                  styles.galleryList
                }
                ItemSeparatorComponent={() => (
                  <View
                    style={
                      styles.galleryGap
                    }
                  />
                )}
                renderItem={({
                  item: photo,
                  index,
                }) => (
                  <View
                    style={[
                      styles.galleryItem,
                      {
                        width:
                          galleryWidth,

                        height:
                          galleryHeight,
                      },
                    ]}
                  >
                    <Image
                      source={{
                        uri: photo,
                      }}
                      style={
                        styles.galleryImage
                      }
                      resizeMode="cover"
                    />

                    <View
                      style={
                        styles.galleryOverlay
                      }
                    />

                    <Pressable
                      onPress={() =>
                        removeGalleryPhoto(
                          index,
                        )
                      }
                      disabled={
                        uploadingGallery ||
                        saving
                      }
                      hitSlop={8}
                      style={
                        styles.removePhoto
                      }
                    >
                      <Ionicons
                        name="close"
                        size={17}
                        color="#FFFFFF"
                      />
                    </Pressable>

                    <View
                      style={
                        styles.photoNumber
                      }
                    >
                      <AppText
                        weight="bold"
                        style={
                          styles.photoNumberText
                        }
                      >
                        {index +
                          1}
                        /
                        {
                          profile
                            .workGallery
                            .length
                        }
                      </AppText>
                    </View>
                  </View>
                )}
                ListFooterComponent={
                  profile.workGallery
                    .length <
                  MAX_GALLERY_PHOTOS ? (
                    <View
                      style={
                        styles.footerAddWrapper
                      }
                    >
                      <Pressable
                        onPress={
                          addGalleryPhoto
                        }
                        disabled={
                          uploadingGallery ||
                          saving
                        }
                        style={({
                          pressed,
                        }) => [
                          styles.addGallery,

                          {
                            width:
                              galleryWidth,

                            height:
                              galleryHeight,
                          },

                          pressed &&
                            styles.pressed,
                        ]}
                      >
                        {uploadingGallery ? (
                          <ActivityIndicator
                            color="#2563EB"
                          />
                        ) : (
                          <>
                            <View
                              style={
                                styles.addGalleryIcon
                              }
                            >
                              <Ionicons
                                name="add"
                                size={27}
                                color="#2563EB"
                              />
                            </View>

                            <AppText
                              weight="bold"
                              style={
                                styles.addGalleryText
                              }
                            >
                              Add Photo
                            </AppText>

                            <AppText
                              style={
                                styles.galleryRatio
                              }
                            >
                              Add another
                            </AppText>
                          </>
                        )}
                      </Pressable>
                    </View>
                  ) : null
                }
              />
            ) : (
              <Pressable
                onPress={
                  addGalleryPhoto
                }
                disabled={
                  uploadingGallery ||
                  saving
                }
                style={({
                  pressed,
                }) => [
                  styles.emptyGallery,

                  {
                    width:
                      galleryWidth,

                    height:
                      galleryHeight,
                  },

                  pressed &&
                    styles.pressed,
                ]}
              >
                {uploadingGallery ? (
                  <ActivityIndicator
                    color="#2563EB"
                  />
                ) : (
                  <>
                    <View
                      style={
                        styles.addGalleryIcon
                      }
                    >
                      <Ionicons
                        name="images-outline"
                        size={27}
                        color="#2563EB"
                      />
                    </View>

                    <AppText
                      weight="bold"
                      style={
                        styles.addGalleryText
                      }
                    >
                      Add Work Photos
                    </AppText>

                    <AppText
                      style={
                        styles.galleryRatio
                      }
                    >
                      Up to{" "}
                      {
                        MAX_GALLERY_PHOTOS
                      }{" "}
                      photos · Landscape
                    </AppText>
                  </>
                )}
              </Pressable>
            )}
          </View>

          <AppText
            style={
              styles.swipeHint
            }
          >
            {profile.workGallery
              .length > 1
              ? "Swipe left or right to view photos"
              : "You can add up to 6 work photos"}
          </AppText>

          <AppText
            style={
              styles.galleryCount
            }
          >
            {
              profile.workGallery
                .length
            }
            /
            {
              MAX_GALLERY_PHOTOS
            }{" "}
            photos
          </AppText>

          {/* ==================================================
              ABOUT
          ================================================== */}

          <SectionTitle
            icon="person-circle-outline"
            title="About Me"
          />

          <TextInput
            value={
              profile.aboutMe
            }
            onChangeText={(
              value,
            ) =>
              updateField(
                "aboutMe",
                value,
              )
            }
            placeholder="Tell customers about your skills, experience and the type of work you do..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            maxLength={1000}
            style={
              styles.textArea
            }
          />

          <AppText
            style={
              styles.characterCount
            }
          >
            {
              profile.aboutMe
                .length
            }
            /1000
          </AppText>

          {/* ==================================================
              SAVE
          ================================================== */}

          <Pressable
            onPress={
              saveProfile
            }
            disabled={
              saving ||
              uploadingPhoto ||
              uploadingGallery
            }
            style={({
              pressed,
            }) => [
              styles.saveButton,

              pressed &&
                styles.savePressed,

              (saving ||
                uploadingPhoto ||
                uploadingGallery) &&
                styles.disabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#FFFFFF"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.saveText
                  }
                >
                  Save & Publish
                </AppText>
              </>
            )}
          </Pressable>

          <AppText
            style={
              styles.bottomNote
            }
          >
            Your professional profile information
            is stored securely. Profile photos are
            uploaded to Firebase Storage before they
            are published.
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

/* ============================================================
   FIELD LABEL
============================================================ */

function FieldLabel({
  label,
  required = false,
}: {
  label: string;

  required?: boolean;
}) {
  return (
    <View
      style={
        styles.labelRow
      }
    >
      <AppText
        weight="bold"
        style={
          styles.label
        }
      >
        {label}
      </AppText>

      {required && (
        <AppText
          style={
            styles.required
          }
        >
          *
        </AppText>
      )}
    </View>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];

  title: string;
}) {
  return (
    <View
      style={
        styles.sectionTitle
      }
    >
      <View
        style={
          styles.sectionIcon
        }
      >
        <Ionicons
          name={icon}
          size={19}
          color="#2563EB"
        />
      </View>

      <AppText
        weight="bold"
        style={
          styles.sectionText
        }
      >
        {title}
      </AppText>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    container: {
      padding: 16,

      paddingBottom: 45,
    },

    loading: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",
    },

    loadingText: {
      marginTop: 12,

      color: "#64748B",

      fontSize: 14,
    },

    header: {
      marginBottom: 24,
    },

    title: {
      fontSize: 28,

      color: "#0F172A",
    },

    subtitle: {
      marginTop: 7,

      fontSize: 14,

      lineHeight: 21,

      color: "#64748B",
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      flexDirection: "row",

      alignItems: "center",

      marginTop: 6,

      marginBottom: 14,
    },

    sectionIcon: {
      width: 38,

      height: 38,

      borderRadius: 12,

      backgroundColor: "#EFF6FF",

      alignItems: "center",

      justifyContent: "center",

      marginRight: 10,
    },

    sectionText: {
      fontSize: 18,

      color: "#0F172A",
    },

    /* ========================================================
       PHOTO
    ======================================================== */

    photoSection: {
      alignItems: "center",

      marginBottom: 25,
    },

    photoWrapper: {
      width: 116,

      height: 116,

      borderRadius: 58,

      overflow: "hidden",

      marginBottom: 12,

      backgroundColor: "#F1F5F9",
    },

    profilePhoto: {
      width: "100%",

      height: "100%",
    },

    photoPlaceholder: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",
    },

    photoLoading: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(15,23,42,0.45)",

      alignItems: "center",

      justifyContent: "center",
    },

    photoButton: {
      flexDirection: "row",

      alignItems: "center",

      gap: 7,

      paddingHorizontal: 17,

      paddingVertical: 10,

      borderRadius: 12,

      backgroundColor: "#EFF6FF",
    },

    photoButtonText: {
      color: "#2563EB",

      fontSize: 13,
    },

    /* ========================================================
       LABEL
    ======================================================== */

    labelRow: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 7,
    },

    label: {
      fontSize: 14,

      color: "#0F172A",
    },

    required: {
      marginLeft: 3,

      color: "#EF4444",
    },

    /* ========================================================
       INPUT
    ======================================================== */

    input: {
      minHeight: 52,

      borderWidth: 1,

      borderColor: "#E2E8F0",

      borderRadius: 14,

      paddingHorizontal: 15,

      fontSize: 15,

      color: "#0F172A",

      backgroundColor: "#FFFFFF",

      marginBottom: 18,
    },

    inputWithSuffix: {
      minHeight: 52,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor: "#E2E8F0",

      borderRadius: 14,

      backgroundColor: "#FFFFFF",

      marginBottom: 18,

      paddingRight: 15,
    },

    suffixInput: {
      flex: 1,

      minHeight: 52,

      paddingHorizontal: 15,

      fontSize: 15,

      color: "#0F172A",
    },

    suffix: {
      color: "#64748B",

      fontSize: 14,
    },

    inputWithPrefix: {
      minHeight: 52,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor: "#E2E8F0",

      borderRadius: 14,

      backgroundColor: "#FFFFFF",

      marginBottom: 18,
    },

    prefix: {
      paddingLeft: 15,

      color: "#2563EB",

      fontSize: 17,
    },

    prefixInput: {
      flex: 1,

      minHeight: 52,

      paddingHorizontal: 8,

      fontSize: 15,

      color: "#0F172A",
    },

    rateSuffix: {
      paddingRight: 15,

      color: "#64748B",

      fontSize: 13,
    },

    inputIconWrapper: {
      minHeight: 52,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 15,

      borderWidth: 1,

      borderColor: "#E2E8F0",

      borderRadius: 14,

      backgroundColor: "#FFFFFF",

      marginBottom: 24,
    },

    iconInput: {
      flex: 1,

      minHeight: 52,

      marginLeft: 9,

      fontSize: 15,

      color: "#0F172A",
    },

    phoneHelper: {
      marginTop: -18,

      marginBottom: 18,

      fontSize: 11,

      lineHeight: 17,

      color: "#94A3B8",
    },

    /* ========================================================
       GALLERY
    ======================================================== */

    helper: {
      fontSize: 13,

      lineHeight: 19,

      color: "#64748B",

      marginBottom: 12,
    },

    gallerySection: {
      width: "100%",

      overflow: "hidden",
    },

    galleryList: {
      paddingRight: 16,
    },

    galleryGap: {
      width: 12,
    },

    galleryItem: {
      borderRadius: 16,

      overflow: "hidden",

      backgroundColor: "#F1F5F9",

      position: "relative",

      borderWidth: 1,

      borderColor: "#E2E8F0",
    },

    galleryImage: {
      width: "100%",

      height: "100%",
    },

    galleryOverlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(15,23,42,0.04)",
    },

    removePhoto: {
      position: "absolute",

      top: 8,

      right: 8,

      width: 32,

      height: 32,

      borderRadius: 16,

      backgroundColor: "#EF4444",

      alignItems: "center",

      justifyContent: "center",

      zIndex: 10,

      elevation: 4,
    },

    photoNumber: {
      position: "absolute",

      bottom: 8,

      left: 8,

      paddingHorizontal: 9,

      paddingVertical: 5,

      borderRadius: 10,

      backgroundColor:
        "rgba(15,23,42,0.70)",
    },

    photoNumberText: {
      fontSize: 10,

      color: "#FFFFFF",
    },

    footerAddWrapper: {
      marginLeft: 12,
    },

    addGallery: {
      borderRadius: 16,

      borderWidth: 1.5,

      borderStyle: "dashed",

      borderColor: "#93C5FD",

      backgroundColor: "#F8FAFC",

      alignItems: "center",

      justifyContent: "center",
    },

    emptyGallery: {
      borderRadius: 16,

      borderWidth: 1.5,

      borderStyle: "dashed",

      borderColor: "#93C5FD",

      backgroundColor: "#F8FAFC",

      alignItems: "center",

      justifyContent: "center",
    },

    addGalleryIcon: {
      width: 42,

      height: 42,

      borderRadius: 21,

      backgroundColor: "#EFF6FF",

      alignItems: "center",

      justifyContent: "center",

      marginBottom: 6,
    },

    addGalleryText: {
      fontSize: 12,

      color: "#2563EB",
    },

    galleryRatio: {
      marginTop: 3,

      fontSize: 9,

      color: "#94A3B8",
    },

    swipeHint: {
      marginTop: 8,

      textAlign: "center",

      fontSize: 10,

      color: "#94A3B8",
    },

    galleryCount: {
      marginTop: 5,

      marginBottom: 24,

      fontSize: 12,

      color: "#64748B",
    },

    /* ========================================================
       ABOUT
    ======================================================== */

    textArea: {
      minHeight: 145,

      borderWidth: 1,

      borderColor: "#E2E8F0",

      borderRadius: 14,

      paddingHorizontal: 15,

      paddingTop: 14,

      paddingBottom: 14,

      fontSize: 15,

      lineHeight: 21,

      color: "#0F172A",

      backgroundColor: "#FFFFFF",
    },

    characterCount: {
      textAlign: "right",

      marginTop: 5,

      marginBottom: 22,

      fontSize: 11,

      color: "#94A3B8",
    },

    /* ========================================================
       SAVE
    ======================================================== */

    saveButton: {
      minHeight: 55,

      borderRadius: 15,

      backgroundColor: "#2563EB",

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 8,

      marginTop: 2,
    },

    savePressed: {
      opacity: 0.85,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    disabled: {
      opacity: 0.55,
    },

    saveText: {
      color: "#FFFFFF",

      fontSize: 15,
    },

    bottomNote: {
      textAlign: "center",

      marginTop: 13,

      fontSize: 11,

      lineHeight: 17,

      color: "#94A3B8",
    },

    pressed: {
      opacity: 0.75,
    },
  });