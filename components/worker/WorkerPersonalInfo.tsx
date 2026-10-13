import React, {
  memo,
  useCallback,
} from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
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

  readOnly?: boolean;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_NAME_LENGTH = 20;

/* ============================================================
   COMPONENT
============================================================ */

function WorkerPersonalInfo({
  firstName,
  surname,
  otherName,
  setFirstName,
  setSurname,
  setOtherName,
  photo,
  onCapturePhoto,
  onUploadPhoto,
  readOnly = false,
}: Props) {
  /* ==========================================================
     FIRST NAME
  ========================================================== */

  const handleFirstNameChange =
    useCallback(
      (value: string) => {
        if (readOnly) {
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
        readOnly,
        setFirstName,
      ],
    );

  /* ==========================================================
     SURNAME
  ========================================================== */

  const handleSurnameChange =
    useCallback(
      (value: string) => {
        if (readOnly) {
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
        readOnly,
        setSurname,
      ],
    );

  /* ==========================================================
     OTHER NAME
  ========================================================== */

  const handleOtherNameChange =
    useCallback(
      (value: string) => {
        if (readOnly) {
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
        readOnly,
        setOtherName,
      ],
    );

  return (
    <View
      style={styles.container}
    >
      {/* ======================================================
          ACCOUNT INFORMATION NOTICE
      ====================================================== */}

      {readOnly ? (
        <View
          style={
            styles.accountNotice
          }
        >
          <View
            style={
              styles.lockBadge
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.lockText
              }
            >
              🔒
            </AppText>
          </View>

          <View
            style={
              styles.noticeContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              style={
                styles.noticeTitle
              }
            >
              Your customer details
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.noticeText
              }
            >
              These details come from your customer account and cannot be edited here.
            </AppText>
          </View>
        </View>
      ) : null}

      {/* ======================================================
          COMPACT PROFILE PHOTO
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
              accessibilityLabel="Profile photo"
            />
          ) : (
            <View
              style={
                styles.avatarPlaceholder
              }
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
          Add profile photo
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          center
          style={
            styles.photoSubtitle
          }
        >
          This is optional. You can change it later.
        </AppText>

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
            accessibilityLabel="Take profile photo"
            style={({ pressed }) => [
              styles.photoButton,
              styles.primaryButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <AppText
              variant="caption"
              weight="semibold"
              style={
                styles.primaryButtonText
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
            accessibilityLabel="Choose profile photo from gallery"
            style={({ pressed }) => [
              styles.photoButton,
              styles.secondaryButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <AppText
              variant="caption"
              weight="semibold"
              style={
                styles.secondaryButtonText
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
          readOnly
            ? styles.readOnlyField
            : undefined
        }
      >
        <AppInput
          label="First name *"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={
            handleFirstNameChange
          }
          variant="worker"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!readOnly}
        />

        {readOnly ? (
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.lockedLabel
            }
          >
            From your customer account
          </AppText>
        ) : null}
      </View>

      {/* ======================================================
          SURNAME
      ====================================================== */}

      <View
        style={
          readOnly
            ? styles.readOnlyField
            : undefined
        }
      >
        <AppInput
          label="Surname *"
          placeholder="Enter your surname"
          value={surname}
          onChangeText={
            handleSurnameChange
          }
          variant="worker"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!readOnly}
        />

        {readOnly ? (
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.lockedLabel
            }
          >
            From your customer account
          </AppText>
        ) : null}
      </View>

      {/* ======================================================
          OTHER NAME
      ====================================================== */}

      <View
        style={
          readOnly
            ? styles.readOnlyField
            : undefined
        }
      >
        <AppInput
          label="Other name (optional)"
          placeholder="e.g. Ibrahim"
          value={otherName}
          onChangeText={
            handleOtherNameChange
          }
          variant="worker"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!readOnly}
        />

        {readOnly ? (
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.lockedLabel
            }
          >
            From your customer account
          </AppText>
        ) : null}
      </View>

      {/* ======================================================
          HINT
      ====================================================== */}

      <AppText
        variant="caption"
        tone="secondary"
        style={
          styles.hint
        }
      >
        {readOnly
          ? "Your customer account information is protected."
          : "* First name and surname are required."}
      </AppText>
    </View>
  );
}

export default memo(
  WorkerPersonalInfo,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    accountNotice: {
      width: "100%",
      flexDirection: "row",
      alignItems: "flex-start",
      padding:
        FixxamTokens.spacing.md,
      marginBottom:
        FixxamTokens.spacing.md,
      borderWidth: 1,
      borderColor:
        Colors.border,
      borderRadius:
        FixxamTokens.radius.lg,
      backgroundColor:
        Colors.surface,
    },

    lockBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#F1F5F9",
    },

    lockText: {
      color:
        Colors.textSecondary,
    },

    noticeContent: {
      flex: 1,
      minWidth: 0,
      marginLeft:
        FixxamTokens.spacing.sm,
    },

    noticeTitle: {
      color:
        Colors.textPrimary,
    },

    noticeText: {
      marginTop:
        FixxamTokens.spacing.xxs,
      lineHeight: 18,
    },

    photoSection: {
      width: "100%",
      alignItems: "center",
      marginBottom:
        FixxamTokens.spacing.md,
    },

    avatarWrapper: {
      width: 88,
      height: 88,
      marginBottom:
        FixxamTokens.spacing.xs,
    },

    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor:
        "#F4F7FB",
    },

    avatarPlaceholder: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor:
        "#F4F7FB",
      alignItems: "center",
      justifyContent: "center",
    },

    avatarHead: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 3,
      borderColor:
        "#64748B",
      marginBottom: 6,
    },

    avatarBody: {
      width: 40,
      height: 22,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
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
        FixxamTokens.spacing.sm,
      paddingHorizontal:
        FixxamTokens.spacing.md,
    },

    photoActions: {
      width: "100%",
      flexDirection: "row",
      gap:
        FixxamTokens.spacing.sm,
    },

    photoButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal:
        FixxamTokens.spacing.sm,
    },

    primaryButton: {
      backgroundColor:
        "#2563EB",
    },

    secondaryButton: {
      backgroundColor:
        Colors.surface,
      borderWidth: 1.5,
      borderColor:
        "#2563EB",
    },

    primaryButtonText: {
      color: "#FFFFFF",
    },

    secondaryButtonText: {
      color: "#2563EB",
    },

    pressed: {
      opacity: 0.72,
    },

    readOnlyField: {
      opacity: 0.68,
    },

    lockedLabel: {
      marginTop:
        -FixxamTokens.spacing.xs,
      marginBottom:
        FixxamTokens.spacing.xs,
      marginLeft:
        FixxamTokens.spacing.xxs,
    },

    hint: {
      marginTop:
        FixxamTokens.spacing.xs,
      marginBottom:
        FixxamTokens.spacing.sm,
      color:
        Colors.textSecondary,
    },
  });