import React, {
  useCallback,
  useEffect,
  useMemo,
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

import * as ImagePicker from "expo-image-picker";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

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
  auth,
  db,
  storage,
} from "@/firebase/config";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import useUserProfile from "@/hooks/auth/useUserProfile";

/* ============================================================
   HELPERS
============================================================ */

function clean(value: string): string {
  return value.trim();
}

function isValidPhone(value: string): boolean {
  const cleaned = value.replace(/\s+/g, "");

  return /^[0-9+()-]{7,20}$/.test(
    cleaned,
  );
}

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerProfileEditScreen() {
  const {
    profile,
    loading,
  } = useUserProfile();

  /* ==========================================================
     FORM
  ========================================================== */

  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    otherName,
    setOtherName,
  ] = useState("");

  const [
    surname,
    setSurname,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  /* ==========================================================
     PHOTO
  ========================================================== */

  const [
    photoUrl,
    setPhotoUrl,
  ] = useState<string | null>(
    null,
  );

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  /* ==========================================================
     LOAD PROFILE
  ========================================================== */

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFirstName(
      profile.firstName ?? "",
    );

    setOtherName(
      profile.otherName ?? "",
    );

    setSurname(
      profile.surname ?? "",
    );

    setPhone(
      profile.phone ?? "",
    );

    setEmail(
      profile.email ??
        auth.currentUser?.email ??
        "",
    );

    setPhotoUrl(
      profile.photoUrl ?? null,
    );
  }, [profile]);

  /* ==========================================================
     FULL NAME
  ========================================================== */

  const fullName =
    useMemo(() => {
      return [
        clean(firstName),
        clean(otherName),
        clean(surname),
      ]
        .filter(Boolean)
        .join(" ");
    }, [
      firstName,
      otherName,
      surname,
    ]);

  /* ==========================================================
     PICK PHOTO
  ========================================================== */

  const handlePickPhoto =
    useCallback(async () => {
      try {
        if (uploadingPhoto || saving) {
          return;
        }

        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission required",
            "Please allow photo access so you can change your profile photo.",
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.85,
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

        if (!asset.uri) {
          return;
        }

        const user =
          auth.currentUser;

        if (!user) {
          Alert.alert(
            "Sign in required",
            "Please sign in again before changing your profile photo.",
          );

          return;
        }

        setUploadingPhoto(true);

        /* ------------------------------------------------------
           CONVERT LOCAL IMAGE TO BLOB
        ------------------------------------------------------ */

        const response =
          await fetch(asset.uri);

        if (!response.ok) {
          throw new Error(
            "Unable to read selected image.",
          );
        }

        const blob =
          await response.blob();

        /* ------------------------------------------------------
           FIREBASE STORAGE PATH
        ------------------------------------------------------ */

        const storageRef =
          ref(
            storage,
            `users/${user.uid}/profile/profile-photo.jpg`,
          );

        /* ------------------------------------------------------
           UPLOAD
        ------------------------------------------------------ */

        await uploadBytes(
          storageRef,
          blob,
          {
            contentType:
              asset.mimeType ??
              "image/jpeg",
          },
        );

        /* ------------------------------------------------------
           DOWNLOAD URL
        ------------------------------------------------------ */

        const downloadURL =
          await getDownloadURL(
            storageRef,
          );

        /* ------------------------------------------------------
           UPDATE FIRESTORE
        ------------------------------------------------------ */

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

        Alert.alert(
          "Photo updated",
          "Your profile photo has been updated successfully.",
        );
      } catch (error) {
        console.error(
          "CUSTOMER_PROFILE_PHOTO_UPLOAD_ERROR:",
          error,
        );

        Alert.alert(
          "Upload failed",
          "We could not update your profile photo. Please try again.",
        );
      } finally {
        setUploadingPhoto(false);
      }
    }, [
      uploadingPhoto,
      saving,
    ]);

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validate =
    useCallback(() => {
      if (!auth.currentUser) {
        Alert.alert(
          "Sign in required",
          "Please sign in again before editing your profile.",
        );

        return false;
      }

      if (!clean(firstName)) {
        Alert.alert(
          "First name required",
          "Please enter your first name.",
        );

        return false;
      }

      if (!clean(surname)) {
        Alert.alert(
          "Surname required",
          "Please enter your surname.",
        );

        return false;
      }

      const cleanedPhone =
        clean(phone);

      if (
        cleanedPhone &&
        !isValidPhone(
          cleanedPhone,
        )
      ) {
        Alert.alert(
          "Invalid phone",
          "Please enter a valid phone number.",
        );

        return false;
      }

      return true;
    }, [
      firstName,
      surname,
      phone,
    ]);

  /* ==========================================================
     SAVE PROFILE
  ========================================================== */

  const handleSave =
    useCallback(async () => {
      if (!validate()) {
        return;
      }

      const user =
        auth.currentUser;

      if (!user) {
        return;
      }

      if (uploadingPhoto) {
        Alert.alert(
          "Please wait",
          "Your profile photo is still uploading.",
        );

        return;
      }

      try {
        setSaving(true);

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
              clean(firstName),

            otherName:
              clean(otherName),

            surname:
              clean(surname),

            fullName:
              fullName,

            phone:
              clean(phone),

            /*
             * Email belongs to Firebase Auth.
             * We do not allow editing it here.
             */
            email:
              user.email ??
              clean(email),

            updatedAt:
              serverTimestamp(),
          },
        );

        Alert.alert(
          "Profile updated",
          "Your profile has been updated successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                router.back();
              },
            },
          ],
        );
      } catch (error) {
        console.error(
          "CUSTOMER_PROFILE_UPDATE_ERROR:",
          error,
        );

        Alert.alert(
          "Unable to update",
          "We could not update your profile. Please try again.",
        );
      } finally {
        setSaving(false);
      }
    }, [
      validate,
      firstName,
      otherName,
      surname,
      phone,
      email,
      fullName,
      uploadingPhoto,
    ]);

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
            size="small"
            color="#2563EB"
          />

          <AppText
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

  if (!auth.currentUser) {
    return (
      <AppScreen>
        <View
          style={
            styles.loading
          }
        >
          <Ionicons
            name="person-outline"
            size={42}
            color="#94A3B8"
          />

          <AppText
            weight="bold"
            style={
              styles.authTitle
            }
          >
            Sign in required
          </AppText>

          <AppText
            style={
              styles.authText
            }
          >
            Please sign in to edit your
            profile.
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
      contentContainerStyle={
        styles.screen
      }
    >
      <KeyboardAvoidingView
        style={
          styles.flex
        }
        behavior={
          Platform.OS === "ios"
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
              onPress={() =>
                router.back()
              }
              hitSlop={10}
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons
                name="chevron-back"
                size={23}
                color="#0F172A"
              />
            </Pressable>

            <View
              style={
                styles.headerText
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.title
                }
              >
                Edit Profile
              </AppText>

              <AppText
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
              style={({ pressed }) => [
                styles.avatarButton,
                pressed &&
                  !uploadingPhoto &&
                  !saving &&
                  styles.avatarPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              {photoUrl ? (
                <Image
                  source={{
                    uri: photoUrl,
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
                  <Ionicons
                    name="person"
                    size={34}
                    color="#64748B"
                  />
                </View>
              )}

              {/* CAMERA BADGE */}

              <View
                style={
                  styles.cameraBadge
                }
              >
                {uploadingPhoto ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name="camera"
                    size={15}
                    color="#FFFFFF"
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
              >
                <AppText
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
              icon="person-outline"
              autoCapitalize="words"
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
              icon="person-outline"
              autoCapitalize="words"
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
              icon="person-outline"
              autoCapitalize="words"
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
              icon="call-outline"
              keyboardType="phone-pad"
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
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
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
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.noteContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.noteTitle
                }
              >
                Account security
              </AppText>

              <AppText
                style={
                  styles.noteText
                }
              >
                Your email is managed by
                your Firebase account and
                cannot be changed here.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              SAVE
          ================================================== */}

          <Pressable
            onPress={
              handleSave
            }
            disabled={
              saving ||
              uploadingPhoto
            }
            style={({ pressed }) => [
              styles.saveButton,

              (saving ||
                uploadingPhoto) &&
                styles.saveDisabled,

              pressed &&
                !saving &&
                !uploadingPhoto &&
                styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Save profile changes"
            accessibilityState={{
              disabled:
                saving ||
                uploadingPhoto,
              busy: saving,
            }}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFFFFF"
              />
            )}

            <AppText
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

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType,
  autoCapitalize,
  editable = true,
  disabled = false,
}: {
  label: string;
  value: string;
  onChangeText: (
    value: string,
  ) => void;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?:
    | "default"
    | "email-address"
    | "phone-pad";
  autoCapitalize?:
    | "none"
    | "sentences"
    | "words";
  editable?: boolean;
  disabled?: boolean;
}) {
  return (
    <View
      style={
        styles.field
      }
    >
      <AppText
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
          disabled &&
            styles.inputDisabled,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={
            disabled
              ? "#CBD5E1"
              : "#64748B"
          }
        />

        <TextInput
          value={value}
          onChangeText={
            onChangeText
          }
          placeholder={
            placeholder
          }
          placeholderTextColor="#94A3B8"
          keyboardType={
            keyboardType
          }
          autoCapitalize={
            autoCapitalize
          }
          editable={
            editable &&
            !disabled
          }
          style={
            styles.input
          }
          selectionColor="#2563EB"
        />
      </View>
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

    screen: {
      flexGrow: 1,
      backgroundColor:
        "#F8FAFC",
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 30,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    headerText: {
      flex: 1,
      marginLeft: 12,
    },

    title: {
      fontSize: 22,
      lineHeight: 27,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 2,
      fontSize: 12,
      lineHeight: 17,
      color: "#94A3B8",
    },

    /* ========================================================
       PREVIEW
    ======================================================== */

    previewCard: {
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    avatarButton: {
      width: 76,
      height: 76,
      borderRadius: 24,
      position: "relative",
    },

    avatarPressed: {
      opacity: 0.75,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },

    avatarImage: {
      width: 76,
      height: 76,
      borderRadius: 24,
    },

    avatarPlaceholder: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    cameraBadge: {
      position: "absolute",
      right: -4,
      bottom: -4,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor:
        "#2563EB",
      borderWidth: 3,
      borderColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    previewContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 13,
    },

    previewName: {
      fontSize: 17,
      color: "#0F172A",
    },

    previewEmail: {
      marginTop: 4,
      fontSize: 11.5,
      color: "#64748B",
    },

    changePhotoText: {
      marginTop: 7,
      fontSize: 11.5,
      color: "#2563EB",
    },

    /* ========================================================
       SECTION
    ======================================================== */

    section: {
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    sectionTitle: {
      marginBottom: 12,
      fontSize: 15,
      color: "#0F172A",
    },

    /* ========================================================
       INPUT
    ======================================================== */

    field: {
      marginBottom: 12,
    },

    fieldLabel: {
      marginBottom: 6,
      fontSize: 11.5,
      color: "#334155",
    },

    inputContainer: {
      height: 48,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      backgroundColor:
        "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 13,
    },

    inputDisabled: {
      backgroundColor:
        "#F8FAFC",
      borderColor:
        "#E2E8F0",
    },

    input: {
      flex: 1,
      marginLeft: 9,
      paddingVertical: 0,
      fontSize: 14,
      color: "#0F172A",
    },

    /* ========================================================
       NOTE
    ======================================================== */

    note: {
      marginTop: 10,
      padding: 12,
      borderRadius: 15,
      backgroundColor:
        "#EFF6FF",
      flexDirection: "row",
      alignItems: "flex-start",
    },

    noteIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    noteContent: {
      flex: 1,
      marginLeft: 9,
    },

    noteTitle: {
      fontSize: 12,
      color: "#1D4ED8",
    },

    noteText: {
      marginTop: 2,
      fontSize: 10.5,
      lineHeight: 16,
      color: "#64748B",
    },

    /* ========================================================
       SAVE
    ======================================================== */

    saveButton: {
      height: 50,
      marginTop: 14,
      borderRadius: 14,
      backgroundColor:
        "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    saveDisabled: {
      opacity: 0.65,
    },

    saveText: {
      fontSize: 14,
      color: "#FFFFFF",
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loading: {
      flex: 1,
      minHeight: 350,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
    },

    loadingText: {
      marginTop: 9,
      fontSize: 12,
      color: "#64748B",
    },

    authTitle: {
      marginTop: 12,
      fontSize: 17,
      color: "#0F172A",
    },

    authText: {
      marginTop: 5,
      fontSize: 12,
      textAlign: "center",
      color: "#64748B",
    },

    /* ========================================================
       PRESS
    ======================================================== */

    pressed: {
      opacity: 0.78,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    bottomSpace: {
      height: 30,
    },
  });