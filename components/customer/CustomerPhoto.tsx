import React, {
  memo,
  useCallback,
} from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Image } from "expo-image";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  photo: string | null;

  onTakePhoto: () => void;

  onChoosePhoto: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerPhoto({
  photo,
  onTakePhoto,
  onChoosePhoto,
}: Props) {
  const hasPhoto =
    typeof photo === "string" &&
    photo.trim().length > 0;

  /* ============================================================
     PHOTO ACTIONS

     The reference design only shows the
     avatar + camera badge.

     Tapping either opens the two choices.
  ============================================================ */

  const handlePhotoPress =
    useCallback(() => {
      Alert.alert(
        "Profile photo",
        "Choose how you'd like to add your photo.",
        [
          {
            text: "Upload photo",
            onPress:
              onChoosePhoto,
          },
          {
            text: "Capture photo",
            onPress:
              onTakePhoto,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        {
          cancelable: true,
        },
      );
    }, [
      onChoosePhoto,
      onTakePhoto,
    ]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          PROFILE PHOTO
      ======================================================== */}

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
          <Pressable
            onPress={
              handlePhotoPress
            }
            accessibilityRole="button"
            accessibilityLabel={
              hasPhoto
                ? "Change profile photo"
                : "Add profile photo"
            }
            style={({ pressed }) => [
              styles.avatar,
              pressed &&
                styles.avatarPressed,
            ]}
          >
            {hasPhoto ? (
              <Image
                source={{
                  uri: photo,
                }}
                contentFit="cover"
                transition={150}
                accessibilityLabel="Selected profile photo"
                style={
                  styles.photo
                }
              />
            ) : (
              <View
                style={
                  styles.placeholder
                }
              >
                <AppIcon
                  name="profile"
                  role="customer"
                  state="muted"
                  size="xl"
                />
              </View>
            )}
          </Pressable>

          {/* ====================================================
              CAMERA BADGE
          ==================================================== */}

          <Pressable
            onPress={
              handlePhotoPress
            }
            accessibilityRole="button"
            accessibilityLabel="Add profile photo"
            hitSlop={8}
            style={({ pressed }) => [
              styles.cameraBadge,
              pressed &&
                styles.cameraBadgePressed,
            ]}
          >
            <AppIcon
              name="camera"
              role="customer"
              state="active"
              size="sm"
              color={
                Colors.background
              }
            />
          </Pressable>
        </View>

        {/* ======================================================
            TITLE
        ====================================================== */}

        <AppText
          variant="bodyMedium"
          weight="semibold"
          center
          style={
            styles.title
          }
        >
          Add profile photo
        </AppText>

        {/* ======================================================
            SUBTITLE
        ====================================================== */}

        <AppText
          variant="caption"
          tone="secondary"
          center
          style={
            styles.subtitle
          }
        >
          This is optional. You can change it later.
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  CustomerPhoto,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    /* ==========================================================
       PHOTO SECTION
    ========================================================== */

    photoSection: {
      width: "100%",

      alignItems:
        "center",

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.lg,
    },

    /* ==========================================================
       AVATAR
    ========================================================== */

    avatarWrapper: {
      position: "relative",

      width: 132,

      height: 132,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    avatar: {
      width: 132,

      height: 132,

      overflow: "hidden",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    avatarPressed: {
      opacity: 0.86,
    },

    photo: {
      width: "100%",

      height: "100%",

      borderRadius:
        FixxamTokens.radius.full,
    },

    placeholder: {
      width: "100%",

      height: "100%",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ==========================================================
       CAMERA BADGE

       Matches the reference:
       blue circular badge positioned
       at the lower-right of the avatar.
    ========================================================== */

    cameraBadge: {
      position: "absolute",

      right: -3,

      bottom: 2,

      width: 48,

      height: 48,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      borderWidth: 3,

      borderColor:
        Colors.background,

      backgroundColor:
        CustomerColors.primary,
    },

    cameraBadgePressed: {
      opacity: 0.8,
    },

    /* ==========================================================
       TEXT
    ========================================================== */

    title: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 320,

      color:
        Colors.textSecondary,
    },
  });