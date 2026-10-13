import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { auth } from "@/firebase/config";
import { AppText } from "@/components/ui";
import WorkerLocationSection from "@/components/worker/profile/WorkerLocationSection";

import {
  MAX_GALLERY_PHOTOS,
  WorkerProfile,
  WorkerProfileField,
} from "@/types/workerProfile";

import {
  Colors,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type UpdateField = <
  K extends WorkerProfileField,
>(
  field: K,
  value: WorkerProfile[K],
) => void;

type WorkerProfileFormProps = {
  profile: WorkerProfile;

  saving: boolean;

  uploadingPhoto: boolean;

  uploadingGallery: boolean;

  updateField: UpdateField;

  pickProfilePhoto: () =>
    | void
    | Promise<void>;

  addGalleryPhoto: () =>
    | void
    | Promise<void>;

  replaceGalleryPhoto: (
    index: number,
  ) =>
    | void
    | Promise<void>;

  removeGalleryPhoto: (
    index: number,
  ) =>
    | void
    | Promise<void>;

  saveProfile: () =>
    | void
    | Promise<void>;
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

function isHttpsUrl(
  value: unknown,
): value is string {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const normalized =
    value.trim();

  if (!normalized) {
    return false;
  }

  try {
    return (
      new URL(normalized).protocol ===
      "https:"
    );
  } catch {
    return false;
  }
}

function sanitizeDecimalInput(
  value: string,
): string {
  const cleaned =
    value.replace(
      /[^0-9.]/g,
      "",
    );

  const parts =
    cleaned.split(".");

  if (parts.length === 1) {
    return parts[0] ?? "";
  }

  const whole =
    parts.shift() ?? "";

  const decimal =
    parts
      .join("")
      .slice(0, 2);

  return `${whole}.${decimal}`;
}

function cloneProfile(
  profile: WorkerProfile,
): WorkerProfile {
  return {
    ...profile,

    selectedServices: [
      ...(profile.selectedServices ?? []),
    ],

    workGallery: [
      ...(profile.workGallery ?? []),
    ],

    serviceLocation:
      profile.serviceLocation
        ? {
            ...profile.serviceLocation,
          }
        : profile.serviceLocation,
  };
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerProfileForm({
  profile,
  saving,
  uploadingPhoto,
  uploadingGallery,
  updateField,
  pickProfilePhoto,
  addGalleryPhoto,
  replaceGalleryPhoto,
  removeGalleryPhoto,
  saveProfile,
}: WorkerProfileFormProps) {
  const router =
    useRouter();

  /* ==========================================================
     LOCAL DRAFT

     The form keeps its own editable draft so realtime Firestore
     updates cannot erase text while the user is typing.
  ========================================================== */

  const [
    draft,
    setDraft,
  ] = useState<WorkerProfile>(
    () => cloneProfile(profile),
  );

  const draftRef =
    useRef<WorkerProfile>(
      cloneProfile(profile),
    );

  const hasLocalChangesRef =
    useRef(false);

  const lastSavedProfileRef =
    useRef<WorkerProfile>(
      cloneProfile(profile),
    );

  /* ==========================================================
     SYNC SERVER PROFILE

     Important:
     - Do not replace the local draft while the user is editing.
     - Allow persisted photo/gallery changes to come from the
       latest profile received from the hook.
     - This prevents realtime Firestore updates from wiping text
       inputs while typing.
  ========================================================== */

  useEffect(() => {
    const nextProfile =
      cloneProfile(profile);

    if (
      hasLocalChangesRef.current
    ) {
      setDraft((current) => {
        const merged: WorkerProfile = {
          ...nextProfile,

          /*
           * Preserve locally edited values.
           */
          fullName:
            current.fullName,

          phoneNumber:
            current.phoneNumber,

          experience:
            current.experience,

          hourlyRate:
            current.hourlyRate,

          aboutMe:
            current.aboutMe,

          location:
            current.location,

          serviceLocation:
            current.serviceLocation,

          /*
           * Media follows the latest persisted profile.
           */
          photoUrl:
            nextProfile.photoUrl,

          workGallery: [
            ...(nextProfile.workGallery ?? []),
          ],
        };

        draftRef.current =
          merged;

        return merged;
      });

      return;
    }

    draftRef.current =
      nextProfile;

    lastSavedProfileRef.current =
      cloneProfile(nextProfile);

    setDraft(nextProfile);
  }, [profile]);

  /* ==========================================================
     ACCOUNT
  ========================================================== */

  const email =
    auth.currentUser?.email ??
    "";

  /* ==========================================================
     ACTION STATE
  ========================================================== */

  const actionsDisabled =
    saving ||
    uploadingPhoto ||
    uploadingGallery;

  /* ==========================================================
     UPDATE DRAFT
  ========================================================== */

  const handleUpdateField =
    useCallback(
      <
        K extends WorkerProfileField,
      >(
        field: K,
        value: WorkerProfile[K],
      ) => {
        hasLocalChangesRef.current =
          true;

        setDraft((current) => {
          const next: WorkerProfile = {
            ...current,
            [field]: value,
          };

          draftRef.current =
            next;

          return next;
        });

        /*
         * Keep the existing hook architecture synchronized.
         *
         * The form itself remains controlled by the local draft,
         * so a realtime profile update cannot visually erase the
         * value currently being typed.
         */
        updateField(
          field,
          value,
        );
      },
      [updateField],
    );

  /* ==========================================================
     PROFILE PHOTO
  ========================================================== */

  const profilePhoto =
    isHttpsUrl(
      draft.photoUrl,
    )
      ? draft.photoUrl
      : null;

  const profileInitial =
    cleanString(
      draft.fullName,
    )
      .charAt(0)
      .toUpperCase() || "W";

  const handlePickProfilePhoto =
    useCallback(async () => {
      if (
        actionsDisabled
      ) {
        return;
      }

      await pickProfilePhoto();
    }, [
      actionsDisabled,
      pickProfilePhoto,
    ]);

  /* ==========================================================
     GALLERY

     Keep original indexes so filtered gallery items never
     mutate the wrong original photo.
  ========================================================== */

  const galleryItems =
    useMemo(
      () =>
        (
          draft.workGallery ??
          []
        )
          .map(
            (
              photoUrl,
              originalIndex,
            ) => ({
              photoUrl,
              originalIndex,
            }),
          )
          .filter(
            ({
              photoUrl,
            }) =>
              isHttpsUrl(
                photoUrl,
              ),
          ),
      [
        draft.workGallery,
      ],
    );

  const galleryCount =
    galleryItems.length;

  const galleryFull =
    galleryCount >=
    MAX_GALLERY_PHOTOS;

  /* ==========================================================
     REMOVE GALLERY PHOTO
  ========================================================== */

  const handleRemoveGalleryPhoto =
    useCallback(
      (originalIndex: number) => {
        const gallery =
          draftRef.current
            .workGallery ?? [];

        if (
          originalIndex < 0 ||
          originalIndex >=
            gallery.length
        ) {
          return;
        }

        if (
          actionsDisabled
        ) {
          return;
        }

        Alert.alert(
          "Remove photo",
          "Are you sure you want to remove this photo from your work gallery?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Remove",
              style: "destructive",
              onPress: () => {
                void removeGalleryPhoto(
                  originalIndex,
                );
              },
            },
          ],
        );
      },
      [
        actionsDisabled,
        removeGalleryPhoto,
      ],
    );

  /* ==========================================================
     CHANGE GALLERY PHOTO
  ========================================================== */

  const handleReplaceGalleryPhoto =
    useCallback(
      (originalIndex: number) => {
        const gallery =
          draftRef.current
            .workGallery ?? [];

        if (
          originalIndex < 0 ||
          originalIndex >=
            gallery.length
        ) {
          return;
        }

        if (
          actionsDisabled
        ) {
          return;
        }

        Alert.alert(
          "Change photo",
          "Choose a new photo to replace this work photo.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Choose Photo",
              onPress: () => {
                void replaceGalleryPhoto(
                  originalIndex,
                );
              },
            },
          ],
        );
      },
      [
        actionsDisabled,
        replaceGalleryPhoto,
      ],
    );

  /* ==========================================================
     SAVE

     IMPORTANT:
     Do not call updateField() repeatedly immediately before
     saveProfile(). React state updates are asynchronous and
     doing so can cause saveProfile() to receive stale state.

     Every editable field is already synchronized through
     handleUpdateField().
  ========================================================== */

  const handleSave =
    useCallback(
      async () => {
        if (
          saving ||
          uploadingPhoto ||
          uploadingGallery
        ) {
          return;
        }

        const current =
          cloneProfile(
            draftRef.current,
          );

        /* ------------------------------------------------------
           FULL NAME VALIDATION
        ------------------------------------------------------ */

        if (
          !cleanString(
            current.fullName,
          )
        ) {
          Alert.alert(
            "Missing information",
            "Please enter your full name.",
          );

          return;
        }

        /* ------------------------------------------------------
           HOURLY RATE VALIDATION

           Empty values are rejected instead of accidentally
           being treated as 0.
        ------------------------------------------------------ */

        const hourlyRateText =
          cleanString(
            current.hourlyRate,
          );

        if (
          !hourlyRateText
        ) {
          Alert.alert(
            "Invalid hourly rate",
            "Please enter your hourly rate.",
          );

          return;
        }

        const hourlyRate =
          Number(
            hourlyRateText,
          );

        if (
          !Number.isFinite(
            hourlyRate,
          ) ||
          hourlyRate <= 0
        ) {
          Alert.alert(
            "Invalid hourly rate",
            "Please enter a valid hourly rate greater than 0.",
          );

          return;
        }

        /* ------------------------------------------------------
           SAVE
        ------------------------------------------------------ */

        try {
          await saveProfile();

          /*
           * Only mark the draft clean after save succeeds.
           */
          hasLocalChangesRef.current =
            false;

          const saved =
            cloneProfile(
              draftRef.current,
            );

          lastSavedProfileRef.current =
            saved;

          setDraft(saved);
        } catch {
          /*
           * Keep the user's local values protected if saving
           * fails.
           */
          hasLocalChangesRef.current =
            true;
        }
      },
      [
        saving,
        uploadingPhoto,
        uploadingGallery,
        saveProfile,
      ],
    );

  /* ==========================================================
     ABOUT COUNT
  ========================================================== */

  const aboutLength =
    draft.aboutMe.length;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <KeyboardAvoidingView
      style={
        styles.keyboardContainer
      }
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        style={
          styles.container
        }
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={25}
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              variant="heading2"
              style={
                styles.headerTitle
              }
            >
              Edit Profile
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.headerSubtitle
              }
            >
              Update your worker information
            </AppText>
          </View>
        </View>

        {/* ==================================================
            PROFILE CARD
        ================================================== */}

        <View
          style={
            styles.profileCard
          }
        >
          <View
            style={
              styles.profileRow
            }
          >
            <View
              style={
                styles.profilePhotoWrap
              }
            >
              <View
                style={
                  styles.profilePhoto
                }
              >
                {profilePhoto ? (
                  <Image
                    source={{
                      uri: profilePhoto,
                    }}
                    style={
                      styles.profilePhotoImage
                    }
                  />
                ) : (
                  <AppText
                    variant="heading2"
                    style={
                      styles.profileInitial
                    }
                  >
                    {
                      profileInitial
                    }
                  </AppText>
                )}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
                disabled={
                  actionsDisabled
                }
                onPress={
                  handlePickProfilePhoto
                }
                style={[
                  styles.cameraButton,
                  actionsDisabled &&
                    styles.disabled,
                ]}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name="camera-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                )}
              </Pressable>
            </View>

            <View
              style={
                styles.profileInfo
              }
            >
              <AppText
                variant="heading3"
                numberOfLines={1}
                style={
                  styles.profileName
                }
              >
                {cleanString(
                  draft.fullName,
                ) ||
                  "Worker"}
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.profileEmail
                }
              >
                {email ||
                  cleanString(
                    draft.phoneNumber,
                  ) ||
                  "Worker account"}
              </AppText>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change photo"
                disabled={
                  actionsDisabled
                }
                onPress={
                  handlePickProfilePhoto
                }
                style={
                  styles.changePhotoButton
                }
              >
                <AppText
                  variant="body"
                  style={
                    styles.changePhotoText
                  }
                >
                  Change photo
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ==================================================
            PERSONAL INFORMATION
        ================================================== */}

        <View
          style={
            styles.card
          }
        >
          <AppText
            variant="heading3"
            style={
              styles.cardTitle
            }
          >
            Personal Information
          </AppText>

          {/* FULL NAME */}

          <View
            style={
              styles.field
            }
          >
            <AppText
              variant="label"
              style={
                styles.label
              }
            >
              Full Name
            </AppText>

            <View
              style={
                styles.inputRow
              }
            >
              <Ionicons
                name="person-outline"
                size={21}
                color={
                  Colors.textSecondary
                }
                style={
                  styles.inputIcon
                }
              />

              <TextInput
                value={
                  draft.fullName
                }
                onChangeText={(
                  value,
                ) =>
                  handleUpdateField(
                    "fullName",
                    value,
                  )
                }
                placeholder="Enter full name"
                placeholderTextColor={
                  Colors.textSecondary
                }
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                textContentType="name"
                editable={
                  !actionsDisabled
                }
                style={
                  styles.inputText
                }
              />
            </View>
          </View>

          {/* PHONE */}

          <View
            style={
              styles.field
            }
          >
            <AppText
              variant="label"
              style={
                styles.label
              }
            >
              Phone Number
            </AppText>

            <View
              style={
                styles.inputRow
              }
            >
              <Ionicons
                name="call-outline"
                size={21}
                color={
                  Colors.textSecondary
                }
                style={
                  styles.inputIcon
                }
              />

              <TextInput
                value={
                  draft.phoneNumber
                }
                onChangeText={(
                  value,
                ) =>
                  handleUpdateField(
                    "phoneNumber",
                    value,
                  )
                }
                placeholder="Enter phone number"
                placeholderTextColor={
                  Colors.textSecondary
                }
                keyboardType="phone-pad"
                autoCorrect={false}
                returnKeyType="next"
                textContentType="telephoneNumber"
                editable={
                  !actionsDisabled
                }
                style={
                  styles.inputText
                }
              />
            </View>
          </View>

          {/* EXPERIENCE */}

          <View
            style={
              styles.field
            }
          >
            <AppText
              variant="label"
              style={
                styles.label
              }
            >
              Experience
            </AppText>

            <View
              style={
                styles.inputRow
              }
            >
              <Ionicons
                name="briefcase-outline"
                size={21}
                color={
                  Colors.textSecondary
                }
                style={
                  styles.inputIcon
                }
              />

              <TextInput
                value={
                  draft.experience
                }
                onChangeText={(
                  value,
                ) =>
                  handleUpdateField(
                    "experience",
                    value.replace(
                      /[^0-9]/g,
                      "",
                    ),
                  )
                }
                placeholder="Years of experience"
                placeholderTextColor={
                  Colors.textSecondary
                }
                keyboardType="number-pad"
                autoCorrect={false}
                returnKeyType="next"
                editable={
                  !actionsDisabled
                }
                style={
                  styles.inputText
                }
              />
            </View>
          </View>

          {/* HOURLY RATE */}

          <View
            style={
              styles.field
            }
          >
            <AppText
              variant="label"
              style={
                styles.label
              }
            >
              Hourly Rate
            </AppText>

            <View
              style={
                styles.inputRow
              }
            >
              <AppText
                variant="body"
                style={
                  styles.currencyIcon
                }
              >
                ₦
              </AppText>

              <TextInput
                value={
                  draft.hourlyRate
                }
                onChangeText={(
                  value,
                ) =>
                  handleUpdateField(
                    "hourlyRate",
                    sanitizeDecimalInput(
                      value,
                    ),
                  )
                }
                placeholder="Enter hourly rate"
                placeholderTextColor={
                  Colors.textSecondary
                }
                keyboardType="decimal-pad"
                autoCorrect={false}
                returnKeyType="next"
                editable={
                  !actionsDisabled
                }
                style={
                  styles.inputText
                }
              />
            </View>
          </View>
        </View>

        {/* ==================================================
            PROFESSIONAL INFORMATION
        ================================================== */}

        <View
          style={
            styles.card
          }
        >
          <AppText
            variant="heading3"
            style={
              styles.cardTitle
            }
          >
            Professional Information
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.cardDescription
            }
          >
            Your professional details are managed from
            your worker registration information.
          </AppText>

          {/* CATEGORY */}

          <View
            style={
              styles.field
            }
          >
            <AppText
              variant="label"
              style={
                styles.label
              }
            >
              Category
            </AppText>

            <View
              style={
                styles.readOnlyInputRow
              }
            >
              <Ionicons
                name="grid-outline"
                size={23}
                color={
                  Colors.textMuted
                }
                style={
                  styles.inputIcon
                }
              />

              <TextInput
                value={
                  cleanString(
                    draft.category,
                  )
                }
                editable={
                  false
                }
                selectTextOnFocus={
                  false
                }
                placeholder="No category"
                placeholderTextColor={
                  Colors.textMuted
                }
                style={
                  styles.readOnlyInputText
                }
              />
            </View>
          </View>

          {/* SUBCATEGORY */}

          <View
            style={
              styles.field
            }
          >
            <AppText
              variant="label"
              style={
                styles.label
              }
            >
              Subcategory
            </AppText>

            <View
              style={
                styles.readOnlyInputRow
              }
            >
              <Ionicons
                name="list-outline"
                size={23}
                color={
                  Colors.textMuted
                }
                style={
                  styles.inputIcon
                }
              />

              <TextInput
                value={
                  cleanString(
                    draft.subcategory,
                  )
                }
                editable={
                  false
                }
                selectTextOnFocus={
                  false
                }
                placeholder="No subcategory"
                placeholderTextColor={
                  Colors.textMuted
                }
                style={
                  styles.readOnlyInputText
                }
              />
            </View>
          </View>

          {/* SERVICES */}

          <View
            style={
              styles.field
            }
          >
            <AppText
              variant="label"
              style={
                styles.label
              }
            >
              Services
            </AppText>

            <View
              style={[
                styles.readOnlyInputRow,
                styles.readOnlyMultilineRow,
              ]}
            >
              <Ionicons
                name="construct-outline"
                size={23}
                color={
                  Colors.textMuted
                }
                style={
                  styles.readOnlyMultilineIcon
                }
              />

              <TextInput
                value={
                  (
                    draft.selectedServices ??
                    []
                  ).join(", ")
                }
                editable={
                  false
                }
                selectTextOnFocus={
                  false
                }
                multiline
                textAlignVertical="top"
                placeholder="No services"
                placeholderTextColor={
                  Colors.textMuted
                }
                style={
                  styles.readOnlyMultilineText
                }
              />
            </View>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.helperText
              }
            >
              Professional services cannot be changed here.
            </AppText>
          </View>
        </View>

        {/* ==================================================
            SERVICE LOCATION
        ================================================== */}

        <WorkerLocationSection
          profile={
            draft
          }
          updateField={
            handleUpdateField
          }
        />

        {/* ==================================================
            WORK GALLERY
        ================================================== */}

        <View
          style={
            styles.card
          }
        >
          <View
            style={
              styles.galleryHeader
            }
          >
            <View
              style={
                styles.galleryTitleWrap
              }
            >
              <AppText
                variant="heading3"
                style={
                  styles.cardTitle
                }
              >
                Work Gallery
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                style={
                  styles.cardDescription
                }
              >
                Show examples of your work.
              </AppText>
            </View>

            <View
              style={
                styles.galleryCount
              }
            >
              <AppText
                variant="button"
                style={
                  styles.galleryCountText
                }
              >
                {galleryCount}/
                {MAX_GALLERY_PHOTOS}
              </AppText>
            </View>
          </View>

          {galleryItems.length >
          0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.galleryScroll
              }
            >
              {galleryItems.map(
                ({
                  photoUrl,
                  originalIndex,
                }) => (
                  <View
                    key={`${photoUrl}-${originalIndex}`}
                    style={
                      styles.galleryItem
                    }
                  >
                    <Image
                      source={{
                        uri: photoUrl,
                      }}
                      style={
                        styles.galleryImage
                      }
                    />

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Change gallery photo ${
                        originalIndex + 1
                      }`}
                      disabled={
                        actionsDisabled
                      }
                      onPress={() =>
                        handleReplaceGalleryPhoto(
                          originalIndex,
                        )
                      }
                      style={[
                        styles.changeGalleryButton,
                        actionsDisabled &&
                          styles.disabled,
                      ]}
                    >
                      {uploadingGallery ? (
                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
                        />
                      ) : (
                        <>
                          <Ionicons
                            name="camera-outline"
                            size={13}
                            color="#FFFFFF"
                          />

                          <AppText
                            variant="button"
                            style={
                              styles.galleryButtonText
                            }
                          >
                            Change
                          </AppText>
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove gallery photo ${
                        originalIndex + 1
                      }`}
                      disabled={
                        actionsDisabled
                      }
                      onPress={() =>
                        handleRemoveGalleryPhoto(
                          originalIndex,
                        )
                      }
                      style={[
                        styles.removeButton,
                        actionsDisabled &&
                          styles.disabled,
                      ]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={13}
                        color="#FFFFFF"
                      />

                      <AppText
                        variant="button"
                        style={
                          styles.galleryButtonText
                        }
                      >
                        Remove
                      </AppText>
                    </Pressable>
                  </View>
                ),
              )}
            </ScrollView>
          ) : (
            <View
              style={
                styles.emptyGallery
              }
            >
              <Ionicons
                name="images-outline"
                size={28}
                color={
                  Colors.textSecondary
                }
              />

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.emptyGalleryText
                }
              >
                No work photos added yet.
              </AppText>
            </View>
          )}

          <View
            style={
              styles.galleryBottom
            }
          >
            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.gallerySwipeText
              }
            >
              Swipe to view photos
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                galleryFull
                  ? "Gallery full"
                  : "Add work photos"
              }
              disabled={
                actionsDisabled ||
                galleryFull
              }
              onPress={
                addGalleryPhoto
              }
              style={[
                styles.galleryAction,
                (actionsDisabled ||
                  galleryFull) &&
                  styles.disabled,
              ]}
            >
              {uploadingGallery ? (
                <ActivityIndicator
                  size="small"
                  color={
                    WorkerColors.primary
                  }
                />
              ) : (
                <>
                  <Ionicons
                    name="add"
                    size={17}
                    color={
                      WorkerColors.primary
                    }
                  />

                  <AppText
                    variant="button"
                    style={
                      styles.galleryActionText
                    }
                  >
                    {galleryFull
                      ? "Gallery Full"
                      : "Add Photos"}
                  </AppText>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* ==================================================
            ABOUT ME
        ================================================== */}

        <View
          style={
            styles.card
          }
        >
          <AppText
            variant="heading3"
            style={
              styles.cardTitle
            }
          >
            About Me
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.cardDescription
            }
          >
            Tell customers about your experience and service.
          </AppText>

          <View
            style={[
              styles.inputRow,
              styles.aboutRow,
            ]}
          >
            <TextInput
              value={
                draft.aboutMe
              }
              onChangeText={(
                value,
              ) =>
                handleUpdateField(
                  "aboutMe",
                  value,
                )
              }
              placeholder="Tell customers about your professional experience..."
              placeholderTextColor={
                Colors.textSecondary
              }
              multiline
              maxLength={1000}
              autoCorrect
              textAlignVertical="top"
              editable={
                !actionsDisabled
              }
              style={
                styles.aboutText
              }
            />
          </View>

          <View
            style={
              styles.characterCount
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
            >
              {aboutLength}/1000
            </AppText>
          </View>
        </View>

        {/* ==================================================
            SECURITY
        ================================================== */}

        <View
          style={
            styles.securityCard
          }
        >
          <View
            style={
              styles.securityIconBox
            }
          >
            <Ionicons
              name="shield-outline"
              size={24}
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.securityContent
            }
          >
            <AppText
              variant="body"
              style={
                styles.securityTitle
              }
            >
              Worker profile security
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.securityDescription
              }
            >
              Your worker information is securely
              stored and shown to customers through
              Fixxam.
            </AppText>
          </View>
        </View>

        {/* ==================================================
            SAVE
        ================================================== */}

        <View
          style={
            styles.saveSection
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save worker profile"
            disabled={
              actionsDisabled
            }
            onPress={
              handleSave
            }
            style={[
              styles.saveButton,
              actionsDisabled &&
                styles.disabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark"
                  size={23}
                  color="#FFFFFF"
                />

                <AppText
                  variant="button"
                  style={
                    styles.saveButtonText
                  }
                >
                  Save Changes
                </AppText>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    keyboardContainer: {
      flex: 1,
    },

    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal: 7,
      paddingTop: 3,
      paddingBottom: 10,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },

    backButton: {
      width: 38,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        Colors.surface,
      borderWidth: 1,
      borderColor:
        Colors.border,
      elevation: 1,
    },

    headerText: {
      flex: 1,
      marginLeft: 7,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
      fontWeight: "900",
      fontSize: 19,
      lineHeight: 22,
      letterSpacing: -0.3,
    },

    headerSubtitle: {
      marginTop: 0,
      fontSize: 11,
      lineHeight: 14,
    },

    /* ========================================================
       PROFILE
    ======================================================== */

    profileCard: {
      marginBottom: 5,
      padding: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        Colors.border,
      backgroundColor:
        Colors.surface,
      elevation: 1,
    },

    profileRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    profilePhotoWrap: {
      position: "relative",
    },

    profilePhoto: {
      width: 56,
      height: 56,
      borderRadius: 15,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        WorkerColors.primarySoft,
    },

    profilePhotoImage: {
      width: "100%",
      height: "100%",
    },

    profileInitial: {
      color:
        WorkerColors.primary,
      fontWeight: "900",
      fontSize: 18,
    },

    cameraButton: {
      position: "absolute",
      right: -3,
      bottom: -3,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        WorkerColors.primary,
      borderWidth: 2,
      borderColor:
        Colors.surface,
    },

    profileInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 7,
    },

    profileName: {
      color:
        Colors.textPrimary,
      fontWeight: "800",
      fontSize: 15,
      lineHeight: 18,
    },

    profileEmail: {
      marginTop: 0,
      fontSize: 10,
      lineHeight: 13,
    },

    changePhotoButton: {
      alignSelf: "flex-start",
      marginTop: 1,
    },

    changePhotoText: {
      color:
        WorkerColors.primary,
      fontWeight: "700",
      fontSize: 11,
    },

    /* ========================================================
       CARDS
    ======================================================== */

    card: {
      marginBottom: 5,
      padding: 9,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        Colors.border,
      backgroundColor:
        Colors.surface,
      elevation: 1,
    },

    cardTitle: {
      color:
        Colors.textPrimary,
      fontWeight: "800",
      fontSize: 17,
      lineHeight: 20,
      letterSpacing: -0.1,
    },

    cardDescription: {
      marginTop: 1,
      lineHeight: 14,
      fontSize: 11,
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       FIELDS
    ======================================================== */

    field: {
      marginTop: 6,
    },

    label: {
      marginBottom: 2,
      color:
        Colors.textPrimary,
      fontWeight: "700",
      fontSize: 11,
      lineHeight: 14,
    },

    inputRow: {
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        Colors.border,
      borderRadius: 10,
      backgroundColor:
        Colors.surface,
    },

    inputIcon: {
      marginLeft: 9,
    },

    currencyIcon: {
      width: 29,
      paddingLeft: 9,
      color:
        Colors.textPrimary,
      fontWeight: "800",
      fontSize: 15,
    },

    inputText: {
      flex: 1,
      minHeight: 38,
      paddingHorizontal: 6,
      color:
        Colors.textPrimary,
      fontSize: 13,
    },

    /* ========================================================
       READ ONLY PROFESSIONAL FIELDS
    ======================================================== */

    readOnlyInputRow: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        Colors.border,
      borderRadius: 11,
      backgroundColor:
        Colors.background,
    },

    readOnlyInputText: {
      flex: 1,
      minHeight: 50,
      paddingHorizontal: 6,
      color:
        Colors.textSecondary,
      fontSize: 14,
      fontWeight: "500",
    },

    readOnlyMultilineRow: {
      minHeight: 82,
      alignItems: "flex-start",
    },

    readOnlyMultilineIcon: {
      marginLeft: 9,
      marginTop: 13,
    },

    readOnlyMultilineText: {
      flex: 1,
      minHeight: 78,
      paddingHorizontal: 6,
      paddingTop: 11,
      paddingBottom: 8,
      color:
        Colors.textSecondary,
      fontSize: 14,
      lineHeight: 19,
    },

    helperText: {
      marginTop: 2,
      lineHeight: 13,
      fontSize: 10,
    },

    /* ========================================================
       GALLERY
    ======================================================== */

    galleryHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
    },

    galleryTitleWrap: {
      flex: 1,
      paddingRight: 4,
    },

    galleryCount: {
      minWidth: 39,
      height: 28,
      paddingHorizontal: 6,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        WorkerColors.primarySoft,
    },

    galleryCountText: {
      color:
        WorkerColors.primary,
      fontWeight: "900",
      fontSize: 11,
    },

    galleryScroll: {
      gap: 7,
      paddingTop: 7,
      paddingRight: 5,
    },

    galleryItem: {
      width: 118,
      height: 126,
      position: "relative",
      overflow: "hidden",
      borderRadius: 12,
      backgroundColor:
        Colors.background,
    },

    galleryImage: {
      width: "100%",
      height: "100%",
    },

    changeGalleryButton: {
      position: "absolute",
      left: 5,
      right: 5,
      bottom: 39,
      minHeight: 29,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      backgroundColor:
        WorkerColors.primary,
    },

    removeButton: {
      position: "absolute",
      left: 5,
      right: 5,
      bottom: 5,
      minHeight: 29,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      backgroundColor:
        "rgba(0,0,0,0.72)",
    },

    galleryButtonText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: 10,
    },

    emptyGallery: {
      minHeight: 72,
      marginTop: 6,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        Colors.background,
    },

    emptyGalleryText: {
      marginTop: 3,
      fontSize: 10,
    },

    galleryBottom: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginTop: 7,
    },

    gallerySwipeText: {
      flex: 1,
      paddingRight: 4,
      fontSize: 10,
    },

    galleryAction: {
      minHeight: 34,
      paddingHorizontal: 10,
      borderRadius: 9,
      borderWidth: 1,
      borderColor:
        WorkerColors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },

    galleryActionText: {
      color:
        WorkerColors.primary,
      fontWeight: "800",
      fontSize: 10,
    },

    /* ========================================================
       ABOUT
    ======================================================== */

    aboutRow: {
      minHeight: 90,
      marginTop: 6,
      alignItems: "flex-start",
    },

    aboutText: {
      flex: 1,
      width: "100%",
      minHeight: 84,
      paddingHorizontal: 9,
      paddingTop: 7,
      paddingBottom: 5,
      color:
        Colors.textPrimary,
      fontSize: 13,
      lineHeight: 16,
    },

    characterCount: {
      alignItems: "flex-end",
      marginTop: 1,
    },

    /* ========================================================
       SECURITY
    ======================================================== */

    securityCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 5,
      padding: 8,
      borderRadius: 15,
      backgroundColor:
        WorkerColors.primarySoft,
    },

    securityIconBox: {
      width: 34,
      height: 34,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        Colors.surface,
    },

    securityContent: {
      flex: 1,
      marginLeft: 7,
    },

    securityTitle: {
      color:
        WorkerColors.primary,
      fontWeight: "800",
      fontSize: 11,
    },

    securityDescription: {
      marginTop: 1,
      lineHeight: 13,
      fontSize: 10,
    },

    /* ========================================================
       SAVE
    ======================================================== */

    saveSection: {
      marginTop: 0,
      marginBottom: 5,
    },

    saveButton: {
      minHeight: 43,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      borderRadius: 11,
      backgroundColor:
        WorkerColors.primary,
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: 13,
    },

    disabled: {
      opacity: 0.5,
    },
  });

export default WorkerProfileForm;