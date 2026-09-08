import React, {
  useEffect,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppIcon,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  photoUrl?: string;

  size?: number;

  editable?: boolean;

  role?: FixxamRole;

  onPress?: () => void;
};

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_SIZE =
  FixxamTokens.size.avatarXl;

/* ============================================================
   COMPONENT
============================================================ */

export default function ProfileAvatar({
  photoUrl,
  size = DEFAULT_SIZE,
  editable = false,
  role = "customer",
  onPress,
}: Props) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(false);

  /* ==========================================================
     SAFE VALUES
  ========================================================== */

  const safePhotoUrl =
    typeof photoUrl === "string"
      ? photoUrl.trim()
      : "";

  const safeSize =
    Number.isFinite(size) &&
    size > 0
      ? size
      : DEFAULT_SIZE;

  const roleColors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const canEdit =
    editable &&
    typeof onPress ===
      "function";

  const showImage =
    Boolean(safePhotoUrl) &&
    !imageFailed;

  const cameraSize =
    Math.max(
      24,
      Math.min(
        30,
        Math.round(
          safeSize * 0.34,
        ),
      ),
    );

  const profileIconSize =
    safeSize >= 68
      ? "lg"
      : safeSize >= 48
        ? "md"
        : "sm";

  /* ==========================================================
     RESET IMAGE ERROR
  ========================================================== */

  useEffect(() => {
    setImageFailed(false);
  }, [safePhotoUrl]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Pressable
      onPress={
        canEdit
          ? onPress
          : undefined
      }
      disabled={!canEdit}
      accessibilityRole={
        canEdit
          ? "button"
          : "image"
      }
      accessibilityLabel={
        canEdit
          ? "Change profile photo"
          : "Profile photo"
      }
      accessibilityState={
        canEdit
          ? undefined
          : {
              disabled: true,
            }
      }
      style={({ pressed }) => [
        styles.container,

        {
          width:
            safeSize,

          height:
            safeSize,
        },

        pressed &&
        canEdit
          ? styles.pressed
          : null,
      ]}
    >
      {/* ====================================================
          PHOTO / PLACEHOLDER
      ==================================================== */}

      <View
        style={[
          styles.avatarContainer,

          {
            width:
              safeSize,

            height:
              safeSize,

            backgroundColor:
              roleColors.primarySoft,
          },
        ]}
      >
        {showImage ? (
          <Image
            source={{
              uri:
                safePhotoUrl,
            }}
            style={
              styles.image
            }
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            onError={() =>
              setImageFailed(
                true,
              )
            }
          />
        ) : (
          <AppIcon
            name="profile"
            role={role}
            size={
              profileIconSize
            }
            color={
              roleColors.primary
            }
          />
        )}
      </View>

      {/* ====================================================
          EDIT CAMERA
      ==================================================== */}

      {canEdit ? (
        <View
          pointerEvents="none"
          style={[
            styles.camera,

            {
              width:
                cameraSize,

              height:
                cameraSize,

              backgroundColor:
                roleColors.primary,
            },
          ]}
        >
          <AppIcon
            name="camera"
            role={role}
            size="xs"
            color={
              Colors.textInverse
            }
          />
        </View>
      ) : null}
    </Pressable>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      position: "relative",

      flexShrink: 0,

      alignSelf: "center",
    },

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

    /* ========================================================
       AVATAR
    ======================================================== */

    avatarContainer: {
      overflow: "hidden",

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    image: {
      width: "100%",

      height: "100%",
    },

    /* ========================================================
       CAMERA
    ======================================================== */

    camera: {
      position: "absolute",

      right: -2,

      bottom: -2,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      ...FixxamTokens.shadow.card,
    },
  });