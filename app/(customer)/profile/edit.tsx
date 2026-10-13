import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import * as ImagePicker from "expo-image-picker";

import {
  router,
} from "expo-router";

import Toast from "react-native-toast-message"; 

import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
} from "@/theme";

import {
  auth,
  db,
  storage,
} from "@/firebase/config";

import useUserProfile from "@/hooks/auth/useUserProfile";

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_NAME_LENGTH = 60;

const MAX_PHONE_LENGTH = 30;

const MAX_PROFILE_PHOTO_BYTES =
  8 * 1024 * 1024;

/* ============================================================
   HELPERS
============================================================ */

function clean(
  value: string,
): string {
  return value.trim();
}

function isValidPhone(
  value: string,
): boolean {
  const cleaned =
    value.replace(
      /\s+/g,
      "",
    );

  return /^[0-9+()-]{7,20}$/.test(
    cleaned,
  );
}

function showErrorToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
}

function showInfoToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
  });
}

function showSuccessToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
  });
}

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerProfileEditScreen() {
  const {
    profile,
    loading,
  } =
    useUserProfile();

  /* ==========================================================
     MUTATION GUARDS
  ========================================================== */

  const saveInFlight =
    useRef(false);

  const photoUploadInFlight =
    useRef(false);

  /* ==========================================================
     FORM
  ========================================================== */

  const [
    firstName,
    setFirstName,
  ] =
    useState("");

  const [
    otherName,
    setOtherName,
  ] =
    useState("");

  const [
    surname,
    setSurname,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  /* ==========================================================
     PHOTO
  ========================================================== */

  const [
    photoUrl,
    setPhotoUrl,
  ] =
    useState<string | null>(
      null,
    );

  const [
    photoFailed,
    setPhotoFailed,
  ] =
    useState(false);

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  /* ==========================================================
     LOAD PROFILE
  ========================================================== */

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFirstName(
      profile.firstName ??
        "",
    );

    setOtherName(
      profile.otherName ??
        "",
    );

    setSurname(
      profile.surname ??
        "",
    );

    setPhone(
      profile.phone ??
        "",
    );

    /*
     * Firebase Auth is authoritative
     * for the account email.
     */
    setEmail(
      auth.currentUser
        ?.email ??
        profile.email ??
        "",
    );

    setPhotoUrl(
      profile.photoUrl ??
        null,
    );

    setPhotoFailed(
      false,
    );
  }, [
    profile,
  ]);

  /* ==========================================================
     FULL NAME
  ========================================================== */

  const fullName =
    useMemo(
      () =>
        [
          clean(
            firstName,
          ),
          clean(
            otherName,
          ),
          clean(
            surname,
          ),
        ]
          .filter(Boolean)
          .join(" "),
      [
        firstName,
        otherName,
        surname,
      ],
    );

  /* ==========================================================
     PICK + UPLOAD PHOTO
  ========================================================== */

  const handlePickPhoto =
    useCallback(async () => {
      if (
        photoUploadInFlight.current ||
        saveInFlight.current ||
        uploadingPhoto ||
        saving
      ) {
        return;
      }

      try {
        const permission =
          await ImagePicker
            .requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {
          showInfoToast(
            "Photo permission required",
            "Please allow photo access to change your profile photo.",
          );

          return;
        }

        const result =
          await ImagePicker
            .launchImageLibraryAsync({
              mediaTypes: [
                "images",
              ],

              allowsEditing:
                true,

              allowsMultipleSelection:
                false,

              aspect: [
                1,
                1,
              ],

              quality:
                0.85,
            });

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        const asset =
          result.assets[0];

        if (
          !asset?.uri
        ) {
          showErrorToast(
            "Photo unavailable",
            "The selected photo could not be read.",
          );

          return;
        }

        if (
          typeof asset.fileSize ===
            "number" &&
          asset.fileSize >
            MAX_PROFILE_PHOTO_BYTES
        ) {
          showErrorToast(
            "Photo is too large",
            "Please choose an image smaller than 8 MB.",
          );

          return;
        }

        if (
          asset.mimeType &&
          !asset.mimeType.startsWith(
            "image/",
          )
        ) {
          showErrorToast(
            "Invalid photo",
            "Please choose a valid image file.",
          );

          return;
        }

        const user =
          auth.currentUser;

        if (!user) {
          showErrorToast(
            "Sign in required",
            "Please sign in again before changing your profile photo.",
          );

          return;
        }

        photoUploadInFlight.current =
          true;

        setUploadingPhoto(
          true,
        );

        /* ----------------------------------------------------
           LOCAL IMAGE → BLOB
        ---------------------------------------------------- */

        const response =
          await fetch(
            asset.uri,
          );

        if (!response.ok) {
          throw new Error(
            "PROFILE_PHOTO_READ_FAILED",
          );
        }

        const blob =
          await response.blob();

        if (
          blob.size >
          MAX_PROFILE_PHOTO_BYTES
        ) {
          showErrorToast(
            "Photo is too large",
            "Please choose an image smaller than 8 MB.",
          );

          return;
        }

        /* ----------------------------------------------------
           STORAGE
        ---------------------------------------------------- */

        const storageRef =
          ref(
            storage,
            `users/${user.uid}/profile/profile-photo.jpg`,
          );

        await uploadBytes(
          storageRef,
          blob,
          {
            contentType:
              asset.mimeType ??
              "image/jpeg",
          },
        );

        const downloadURL =
          await getDownloadURL(
            storageRef,
          );

        /* ----------------------------------------------------
           FIRESTORE
        ---------------------------------------------------- */

        await updateDoc(
          doc(
            db,
            "users",
            user.uid,
          ),
          {
            photoUrl:
              downloadURL,

            updatedAt:
              serverTimestamp(),
          },
        );

        setPhotoUrl(
          downloadURL,
        );

        setPhotoFailed(
          false,
        );

        showSuccessToast(
          "Photo updated",
          "Your profile photo has been updated successfully.",
        );
      } catch (
        error
      ) {
        console.error(
          "CUSTOMER_PROFILE_PHOTO_UPLOAD_ERROR:",
          error,
        );

        showErrorToast(
          "Upload failed",
          "We could not update your profile photo. Please try again.",
        );
      } finally {
        photoUploadInFlight.current =
          false;

        setUploadingPhoto(
          false,
        );
      }
    }, [
      saving,
      uploadingPhoto,
    ]);

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validate =
    useCallback((): boolean => {
      if (
        !auth.currentUser
      ) {
        showErrorToast(
          "Sign in required",
          "Please sign in again before editing your profile.",
        );

        return false;
      }

      const cleanFirstName =
        clean(
          firstName,
        );

      const cleanOtherName =
        clean(
          otherName,
        );

      const cleanSurname =
        clean(
          surname,
        );

      const cleanPhone =
        clean(
          phone,
        );

      if (
        !cleanFirstName
      ) {
        showErrorToast(
          "First name required",
          "Please enter your first name.",
        );

        return false;
      }

      if (
        cleanFirstName.length >
        MAX_NAME_LENGTH
      ) {
        showErrorToast(
          "First name is too long",
          `First name must be ${MAX_NAME_LENGTH} characters or fewer.`,
        );

        return false;
      }

      if (
        cleanOtherName.length >
        MAX_NAME_LENGTH
      ) {
        showErrorToast(
          "Other name is too long",
          `Other name must be ${MAX_NAME_LENGTH} characters or fewer.`,
        );

        return false;
      }

      if (
        !cleanSurname
      ) {
        showErrorToast(
          "Surname required",
          "Please enter your surname.",
        );

        return false;
      }

      if (
        cleanSurname.length >
        MAX_NAME_LENGTH
      ) {
        showErrorToast(
          "Surname is too long",
          `Surname must be ${MAX_NAME_LENGTH} characters or fewer.`,
        );

        return false;
      }

      if (
        cleanPhone &&
        !isValidPhone(
          cleanPhone,
        )
      ) {
        showErrorToast(
          "Invalid phone",
          "Please enter a valid phone number.",
        );

        return false;
      }

      return true;
    }, [
      firstName,
      otherName,
      phone,
      surname,
    ]);

  /* ==========================================================
     SAVE PROFILE
  ========================================================== */

  const handleSave =
    useCallback(async () => {
      if (
        saveInFlight.current ||
        saving
      ) {
        return;
      }

      if (
        !validate()
      ) {
        return;
      }

      const user =
        auth.currentUser;

      if (!user) {
        return;
      }

      if (
        photoUploadInFlight.current ||
        uploadingPhoto
      ) {
        showInfoToast(
          "Photo is uploading",
          "Please wait for your profile photo to finish uploading.",
        );

        return;
      }

      saveInFlight.current =
        true;

      setSaving(
        true,
      );

      try {
        const profileRef =
          doc(
            db,
            "users",
            user.uid,
          );

        await updateDoc(
          profileRef,
          {
            firstName:
              clean(
                firstName,
              ),

            otherName:
              clean(
                otherName,
              ),

            surname:
              clean(
                surname,
              ),

            fullName,

            phone:
              clean(
                phone,
              ),

            /*
             * Firebase Auth remains the
             * authoritative email source.
             */
            email:
              user.email ??
              clean(
                email,
              ),

            updatedAt:
              serverTimestamp(),
          },
        );

        showSuccessToast(
          "Profile updated",
          "Your profile has been updated successfully.",
        );

        router.back();
      } catch (
        error
      ) {
        console.error(
          "CUSTOMER_PROFILE_UPDATE_ERROR:",
          error,
        );

        showErrorToast(
          "Unable to update",
          "We could not update your profile. Please try again.",
        );
      } finally {
        saveInFlight.current =
          false;

        setSaving(
          false,
        );
      }
    }, [
      email,
      firstName,
      fullName,
      otherName,
      phone,
      saving,
      surname,
      uploadingPhoto,
      validate,
    ]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.loading
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.loadingText
            }
          >
            Loading profile...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     AUTH
  ========================================================== */

  if (
    !auth.currentUser
  ) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.loading
          }
        >
          <View
            style={
              styles.authIcon
            }
          >
            <AppIcon
              name="profile"
              size="lg"
              color={
                Colors.textMuted
              }
            />
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={
              styles.authTitle
            }
          >
            Sign in required
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.authText
            }
          >
            Please sign in to edit your profile.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      contentContainerStyle={
        styles.screen
      }
    >
      <KeyboardAvoidingView
        style={
          styles.flex
        }
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
          keyboardDismissMode="on-drag"
          contentContainerStyle={
            styles.content
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
              onPress={() => {
                router.back();
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({
                pressed,
              }) => [
                styles.backButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="back"
                size="md"
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
                weight="bold"
                style={
                  styles.title
                }
              >
                Edit Profile
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.subtitle
                }
              >
                Update your personal information
              </AppText>
            </View>
          </View>

          {/* ==================================================
              PROFILE PREVIEW
          ================================================== */}

          <View
            style={
              styles.previewCard
            }
          >
            <Pressable
              onPress={
                handlePickPhoto
              }
              disabled={
                uploadingPhoto ||
                saving
              }
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              accessibilityState={{
                disabled:
                  uploadingPhoto ||
                  saving,

                busy:
                  uploadingPhoto,
              }}
              style={({
                pressed,
              }) => [
                styles.avatarButton,

                pressed &&
                !uploadingPhoto &&
                !saving
                  ? styles.avatarPressed
                  : null,
              ]}
            >
              {photoUrl &&
              !photoFailed ? (
                <Image
                  source={{
                    uri:
                      photoUrl,
                  }}
                  contentFit="cover"
                  cachePolicy="none"
                  accessibilityLabel="Profile photo"
                  onError={() => {
                    setPhotoFailed(
                      true,
                    );
                  }}
                  style={
                    styles.avatarImage
                  }
                />
              ) : (
                <View
                  style={
                    styles.avatarPlaceholder
                  }
                >
                  <AppIcon
                    name="profile"
                    role="customer"
                    size="lg"
                    color={
                      CustomerColors.primary
                    }
                  />
                </View>
              )}

              <View
                style={
                  styles.cameraBadge
                }
              >
                {uploadingPhoto ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      Colors.textInverse
                    }
                  />
                ) : (
                  <AppIcon
                    name="camera"
                    size="xs"
                    color={
                      Colors.textInverse
                    }
                  />
                )}
              </View>
            </Pressable>

            <View
              style={
                styles.previewContent
              }
            >
              <AppText
                variant="bodyLarge"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.previewName
                }
              >
                {fullName ||
                  "Your Name"}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.previewEmail
                }
              >
                {email ||
                  "No email address"}
              </AppText>

              <Pressable
                onPress={
                  handlePickPhoto
                }
                disabled={
                  uploadingPhoto ||
                  saving
                }
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.changePhotoText
                  }
                >
                  {uploadingPhoto
                    ? "Uploading..."
                    : "Change photo"}
                </AppText>
              </Pressable>
            </View>
          </View>

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <View
            style={
              styles.section
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              Personal Information
            </AppText>

            <InputField
              label="First Name"
              value={
                firstName
              }
              onChangeText={
                setFirstName
              }
              placeholder="Enter first name"
              icon="profile"
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              maxLength={
                MAX_NAME_LENGTH
              }
              editable={
                !saving
              }
            />

            <InputField
              label="Other Name"
              value={
                otherName
              }
              onChangeText={
                setOtherName
              }
              placeholder="Enter other name"
              icon="profile"
              autoCapitalize="words"
              autoComplete="additional-name"
              textContentType="middleName"
              maxLength={
                MAX_NAME_LENGTH
              }
              editable={
                !saving
              }
            />

            <InputField
              label="Surname"
              value={
                surname
              }
              onChangeText={
                setSurname
              }
              placeholder="Enter surname"
              icon="profile"
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              maxLength={
                MAX_NAME_LENGTH
              }
              editable={
                !saving
              }
            />

            <InputField
              label="Phone Number"
              value={
                phone
              }
              onChangeText={
                setPhone
              }
              placeholder="Enter phone number"
              icon="phone"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={
                MAX_PHONE_LENGTH
              }
              editable={
                !saving
              }
            />

            <InputField
              label="Email"
              value={
                email
              }
              onChangeText={
                setEmail
              }
              placeholder="Email address"
              icon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              editable={false}
              disabled
            />
          </View>

          {/* ==================================================
              SECURITY NOTE
          ================================================== */}

          <View
            style={
              styles.note
            }
          >
            <View
              style={
                styles.noteIcon
              }
            >
              <AppIcon
                name="shield"
                role="customer"
                size="sm"
                color={
                  CustomerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.noteContent
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.noteTitle
                }
              >
                Account security
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.noteText
                }
              >
                Your email is managed by your Firebase account and cannot be changed here.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              SAVE
          ================================================== */}

          <Pressable
            onPress={() => {
              void handleSave();
            }}
            disabled={
              saving ||
              uploadingPhoto
            }
            accessibilityRole="button"
            accessibilityLabel="Save profile changes"
            accessibilityState={{
              disabled:
                saving ||
                uploadingPhoto,

              busy:
                saving,
            }}
            style={({
              pressed,
            }) => [
              styles.saveButton,

              saving ||
              uploadingPhoto
                ? styles.saveDisabled
                : null,

              pressed &&
              !saving &&
              !uploadingPhoto
                ? styles.pressed
                : null,
            ]}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color={
                  Colors.textInverse
                }
              />
            ) : (
              <AppIcon
                name="check"
                size="sm"
                color={
                  Colors.textInverse
                }
              />
            )}

            <AppText
              variant="body"
              weight="bold"
              style={
                styles.saveText
              }
            >
              {saving
                ? "Saving..."
                : uploadingPhoto
                  ? "Uploading Photo..."
                  : "Save Changes"}
            </AppText>
          </Pressable>

          <View
            style={
              styles.bottomSpace
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

/* ============================================================
   INPUT FIELD
============================================================ */

const InputField =
  memo(
    function InputField({
      label,
      value,
      onChangeText,
      placeholder,
      icon,
      disabled = false,
      editable = true,
      ...inputProps
    }: {
      label: string;

      value: string;

      onChangeText:
        (value: string) => void;

      placeholder: string;

      icon: AppIconName;

      disabled?: boolean;

      editable?: boolean;
    } & Pick<
      TextInputProps,
      | "keyboardType"
      | "autoCapitalize"
      | "autoComplete"
      | "textContentType"
      | "maxLength"
    >) {
      const [
        focused,
        setFocused,
      ] =
        useState(false);

      return (
        <View
          style={
            styles.field
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.fieldLabel
            }
          >
            {label}
          </AppText>

          <View
            style={[
              styles.inputContainer,

              focused &&
              !disabled
                ? styles.inputFocused
                : null,

              disabled
                ? styles.inputDisabled
                : null,
            ]}
          >
            <AppIcon
              name={
                icon
              }
              role="customer"
              size="sm"
              color={
                disabled
                  ? Colors.disabled
                  : focused
                    ? CustomerColors.primary
                    : Colors.textSecondary
              }
            />

            <TextInput
              value={
                value
              }
              onChangeText={
                onChangeText
              }
              placeholder={
                placeholder
              }
              placeholderTextColor={
                Colors.textMuted
              }
              editable={
                editable &&
                !disabled
              }
              selectionColor={
                CustomerColors.primary
              }
              autoCorrect={false}
              onFocus={() => {
                setFocused(
                  true,
                );
              }}
              onBlur={() => {
                setFocused(
                  false,
                );
              }}
              accessibilityLabel={
                label
              }
              style={[
                styles.input,

                disabled
                  ? styles.inputTextDisabled
                  : null,
              ]}
              {...inputProps}
            />
          </View>
        </View>
      );
    },
  );

InputField.displayName =
  "InputField";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    flex: {
      flex: 1,
    },

    screen: {
      flex: 1,

      paddingHorizontal: 0,

      paddingTop: 0,

      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    /* ========================================================
       PREVIEW
    ======================================================== */

    previewCard: {
      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    avatarButton: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      position:
        "relative",
    },

    avatarPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    avatarImage: {
      width: "100%",

      height: "100%",

      borderRadius:
        FixxamTokens.radius.xl,
    },

    avatarPlaceholder: {
      width: "100%",

      height: "100%",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    cameraBadge: {
      position:
        "absolute",

      right: -4,

      bottom: -4,

      width: 30,

      height: 30,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 3,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    previewContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    previewName: {
      color:
        Colors.textPrimary,
    },

    previewEmail: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    changePhotoText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    section: {
      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    sectionTitle: {
      marginBottom:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       INPUT
    ======================================================== */

    field: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    fieldLabel: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    inputContainer: {
      minHeight:
        FixxamTokens.size.inputHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,
    },

    inputFocused: {
      borderColor:
        CustomerColors.primary,
    },

    inputDisabled: {
      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,
    },

    input: {
      flex: 1,

      minHeight:
        FixxamTokens.size.inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    inputTextDisabled: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SECURITY NOTE
    ======================================================== */

    note: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    noteIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    noteContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    noteTitle: {
      color:
        CustomerColors.primary,
    },

    noteText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SAVE
    ======================================================== */

    saveButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    saveDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    saveText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       LOADING / AUTH
    ======================================================== */

    loading: {
      flex: 1,

      minHeight: 350,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    authIcon: {
      width: 68,

      height: 68,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    authTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    authText: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    bottomSpace: {
      height:
        FixxamTokens.spacing.xl,
    },
  });