import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppInput,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

export type CustomerRegistrationSource =
  | "new"
  | "worker";

export type CustomerPrefillMode =
  | "worker"
  | "blank";

type Props = {
  firstName: string;

  surname: string;

  otherName: string;

  setFirstName: (
    value: string,
  ) => void;

  setSurname: (
    value: string,
  ) => void;

  setOtherName: (
    value: string,
  ) => void;

  photo: string | null;

  onCapturePhoto: () => void;

  onUploadPhoto: () => void;

  registrationSource?: CustomerRegistrationSource;

  prefillMode?: CustomerPrefillMode;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_NAME_LENGTH = 20;

/* ============================================================
   COMPONENT
============================================================ */

function CustomerPersonalInfo({
  firstName,
  surname,
  otherName,
  setFirstName,
  setSurname,
  setOtherName,
  photo,
  onCapturePhoto,
  onUploadPhoto,
  registrationSource = "new",
  prefillMode = "blank",
}: Props) {
  const [
    touchedFirstName,
    setTouchedFirstName,
  ] = useState(false);

  const [
    touchedSurname,
    setTouchedSurname,
  ] = useState(false);

  /* ==========================================================
     MODE
  ========================================================== */

  const isWorkerPrefill =
    registrationSource === "worker" &&
    prefillMode === "worker";

  /*
   * When using worker details:
   *
   * First name  -> locked
   * Surname     -> locked
   * Other name  -> locked
   * Photo       -> editable
   */
  const personalFieldsLocked =
    isWorkerPrefill;

  /* ==========================================================
     FIRST NAME
  ========================================================== */

  const handleFirstNameChange =
    useCallback(
      (value: string) => {
        if (personalFieldsLocked) {
          return;
        }

        setFirstName(
          value.slice(
            0,
            MAX_NAME_LENGTH,
          ),
        );
      },
      [
        personalFieldsLocked,
        setFirstName,
      ],
    );

  /* ==========================================================
     SURNAME
  ========================================================== */

  const handleSurnameChange =
    useCallback(
      (value: string) => {
        if (personalFieldsLocked) {
          return;
        }

        setSurname(
          value.slice(
            0,
            MAX_NAME_LENGTH,
          ),
        );
      },
      [
        personalFieldsLocked,
        setSurname,
      ],
    );

  /* ==========================================================
     OTHER NAME
  ========================================================== */

  const handleOtherNameChange =
    useCallback(
      (value: string) => {
        if (personalFieldsLocked) {
          return;
        }

        setOtherName(
          value.slice(
            0,
            MAX_NAME_LENGTH,
          ),
        );
      },
      [
        personalFieldsLocked,
        setOtherName,
      ],
    );

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const firstNameError =
    touchedFirstName &&
    !firstName.trim()
      ? "First name is required."
      : undefined;

  const surnameError =
    touchedSurname &&
    !surname.trim()
      ? "Surname is required."
      : undefined;

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          WORKER PREFILL NOTICE
      ====================================================== */}

      {isWorkerPrefill ? (
        <View
          style={
            styles.prefillNotice
          }
        >
          <View
            style={
              styles.prefillNoticeHeader
            }
          >
            <AppIcon
              name="lock"
              role="customer"
              size="sm"
              state="active"
            />

            <AppText
              variant="caption"
              weight="semibold"
              style={
                styles.prefillNoticeTitle
              }
            >
              Using your worker details
            </AppText>
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.prefillNoticeText
            }
          >
            Your name and other personal details
            are copied from your worker profile.
            They cannot be changed here. Your
            customer profile remains separate.
          </AppText>
        </View>
      ) : null}

      {/* ======================================================
          PROFILE PHOTO
      ====================================================== */}

      <View
        style={
          styles.photoSection
        }
      >
        <View
          style={
            styles.avatarWrapper
          }
        >
          {photo ? (
            <Image
              source={{
                uri: photo,
              }}
              style={
                styles.avatar
              }
              accessibilityLabel="Customer profile photo"
            />
          ) : (
            <View
              style={
                styles.avatarPlaceholder
              }
              accessibilityLabel="Profile photo placeholder"
            >
              <View
                style={
                  styles.avatarHead
                }
              />

              <View
                style={
                  styles.avatarBody
                }
              />
            </View>
          )}
        </View>

        <AppText
          variant="bodyMedium"
          weight="semibold"
          style={
            styles.photoTitle
          }
        >
          {isWorkerPrefill
            ? "Profile photo"
            : "Add profile photo"}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          center
          style={
            styles.photoSubtitle
          }
        >
          {isWorkerPrefill
            ? "Your worker photo was copied. You can change it for your customer profile."
            : "This is optional. You can change it later."}
        </AppText>

        {/* ====================================================
            PHOTO ACTIONS
        ==================================================== */}

        <View
          style={
            styles.photoActions
          }
        >
          <Pressable
            onPress={
              onCapturePhoto
            }
            accessibilityRole="button"
            accessibilityLabel="Take customer profile photo"
            style={({ pressed }) => [
              styles.photoButton,
              styles.primaryPhotoButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <AppText
              variant="caption"
              weight="semibold"
              style={
                styles.primaryPhotoText
              }
            >
              Take Photo
            </AppText>
          </Pressable>

          <Pressable
            onPress={
              onUploadPhoto
            }
            accessibilityRole="button"
            accessibilityLabel="Choose customer profile photo from gallery"
            style={({ pressed }) => [
              styles.photoButton,
              styles.secondaryPhotoButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <AppText
              variant="caption"
              weight="semibold"
              style={
                styles.secondaryPhotoText
              }
            >
              Gallery
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* ======================================================
          FIRST NAME
      ====================================================== */}

      <View
        style={
          styles.field
        }
      >
        <View
          style={
            styles.labelRow
          }
        >
          <AppText
            variant="body"
            weight="medium"
            style={
              styles.lockedFieldLabel
            }
          >
            First name
          </AppText>

          {personalFieldsLocked ? (
            <AppIcon
              name="lock"
              role="customer"
              size="sm"
              state="muted"
            />
          ) : null}
        </View>

        <AppInput
          label=""
          placeholder="Enter your first name"
          value={
            firstName
          }
          onChangeText={
            handleFirstNameChange
          }
          onBlur={() =>
            setTouchedFirstName(
              true,
            )
          }
          variant="customer"
          required
          error={
            firstNameError
          }
          autoCapitalize="words"
          autoCorrect={false}
          editable={
            !personalFieldsLocked
          }
        />
      </View>

      {/* ======================================================
          SURNAME
      ====================================================== */}

      <View
        style={
          styles.field
        }
      >
        <View
          style={
            styles.labelRow
          }
        >
          <AppText
            variant="body"
            weight="medium"
            style={
              styles.lockedFieldLabel
            }
          >
            Surname
          </AppText>

          {personalFieldsLocked ? (
            <AppIcon
              name="lock"
              role="customer"
              size="sm"
              state="muted"
            />
          ) : null}
        </View>

        <AppInput
          label=""
          placeholder="Enter your surname"
          value={
            surname
          }
          onChangeText={
            handleSurnameChange
          }
          onBlur={() =>
            setTouchedSurname(
              true,
            )
          }
          variant="customer"
          required
          error={
            surnameError
          }
          autoCapitalize="words"
          autoCorrect={false}
          editable={
            !personalFieldsLocked
          }
        />
      </View>

      {/* ======================================================
          OTHER NAME
      ====================================================== */}

      <View
        style={
          styles.fieldLast
        }
      >
        <View
          style={
            styles.labelRow
          }
        >
          <AppText
            variant="body"
            weight="medium"
            style={
              styles.lockedFieldLabel
            }
          >
            Other name (optional)
          </AppText>

          {personalFieldsLocked ? (
            <AppIcon
              name="lock"
              role="customer"
              size="sm"
              state="muted"
            />
          ) : null}
        </View>

        <AppInput
          label=""
          placeholder="e.g. Ibrahim"
          value={
            otherName
          }
          onChangeText={
            handleOtherNameChange
          }
          variant="customer"
          autoCapitalize="words"
          autoCorrect={false}
          editable={
            !personalFieldsLocked
          }
        />
      </View>

      {/* ======================================================
          REQUIRED INFO
      ====================================================== */}

      <AppText
        variant="caption"
        tone="secondary"
        style={
          styles.requiredHint
        }
      >
        * First name and surname are required.
      </AppText>
    </View>
  );
}

export default memo(
  CustomerPersonalInfo,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    /* ========================================================
       WORKER PREFILL NOTICE
    ======================================================== */

    prefillNotice: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        "#EFF6FF",

      borderWidth: 1,

      borderColor:
        "#BFDBFE",
    },

    prefillNoticeHeader: {
      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    prefillNoticeTitle: {
      color:
        "#1D4ED8",

      flex: 1,
    },

    prefillNoticeText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 17,
    },

    /* ========================================================
       PROFILE PHOTO
    ======================================================== */

    photoSection: {
      width: "100%",

      alignItems: "center",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    avatarWrapper: {
      width: 96,

      height: 96,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    avatar: {
      width: 96,

      height: 96,

      borderRadius: 48,

      backgroundColor:
        "#F4F7FB",
    },

    avatarPlaceholder: {
      width: 96,

      height: 96,

      borderRadius: 48,

      backgroundColor:
        "#F4F7FB",

      alignItems: "center",

      justifyContent: "center",
    },

    avatarHead: {
      width: 24,

      height: 24,

      borderRadius: 12,

      borderWidth: 3,

      borderColor:
        "#64748B",

      marginBottom: 6,
    },

    avatarBody: {
      width: 44,

      height: 24,

      borderTopLeftRadius: 24,

      borderTopRightRadius: 24,

      borderWidth: 3,

      borderBottomWidth: 0,

      borderColor:
        "#64748B",
    },

    photoTitle: {
      color:
        Colors.textPrimary,

      marginBottom:
        FixxamTokens.spacing.xxs,
    },

    photoSubtitle: {
      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.sm,
    },

    photoActions: {
      width: "100%",

      flexDirection: "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    photoButton: {
      flex: 1,

      minHeight: 48,

      borderRadius: 14,

      alignItems: "center",

      justifyContent: "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,
    },

    primaryPhotoButton: {
      backgroundColor:
        "#2563EB",
    },

    secondaryPhotoButton: {
      backgroundColor:
        "#FFFFFF",

      borderWidth: 2,

      borderColor:
        "#2563EB",
    },

    primaryPhotoText: {
      color:
        "#FFFFFF",
    },

    secondaryPhotoText: {
      color:
        "#2563EB",
    },

    pressed: {
      opacity: 0.72,
    },

    /* ========================================================
       INPUTS
    ======================================================== */

    field: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    fieldLast: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    labelRow: {
      minHeight: 24,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "space-between",

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    lockedFieldLabel: {
      color:
        Colors.textPrimary,
    },

    requiredHint: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },
  });