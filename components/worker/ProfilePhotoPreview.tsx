import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppButton,
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Variant =
  | "customer"
  | "worker";

type Props = {
  photo: string | null;

  onUpload: () => void;

  onCapture: () => void;

  onSkip?: () => void;

  variant?: Variant;
};

/* ============================================================
   COMPONENT
============================================================ */

function ProfilePhotoPreview({
  photo,
  onUpload,
  onCapture,
  onSkip,
  variant = "worker",
}: Props) {
  const isWorker =
    variant === "worker";

  const roleColor =
    isWorker
      ? WorkerColors.primary
      : CustomerColors.primary;

  const roleSoftColor =
    isWorker
      ? WorkerColors.primarySoft
      : CustomerColors.primarySoft;

  const hasPhoto =
    typeof photo === "string" &&
    photo.trim().length > 0;

  const subtitle =
    useMemo(
      () =>
        isWorker
          ? "Add a clear photo of yourself so customers and Fixxam can easily recognize your profile."
          : "Add a clear photo of yourself so workers and Fixxam can easily recognize your profile.",
      [isWorker],
    );

  return (
    <AppCard
      role={
        variant
      }
      variant="outlined"
      style={
        styles.container
      }
    >
      {/* ==================================================
          TITLE
      ================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        Add your profile photo
      </AppText>

      {/* ==================================================
          SUBTITLE
      ================================================== */}

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.subtitle
        }
      >
        {subtitle}
      </AppText>

      {/* ==================================================
          INFO
      ================================================== */}

      <View
        style={[
          styles.infoBox,
          {
            backgroundColor:
              roleSoftColor,
          },
        ]}
      >
        <AppIcon
          name="success"
          role={
            variant
          }
          size="sm"
          state="active"
        />

        <AppText
          variant="caption"
          weight="medium"
          style={[
            styles.infoText,
            {
              color:
                roleColor,
            },
          ]}
        >
          Use a clear, well-lit photo where your face is easy to see.
        </AppText>
      </View>

      {/* ==================================================
          PHOTO
      ================================================== */}

      <View
        style={
          styles.photoCircle
        }
      >
        {hasPhoto ? (
          <Image
            source={{
              uri:
                photo!,
            }}
            contentFit="cover"
            transition={150}
            accessibilityLabel="Profile photo preview"
            style={
              styles.previewImage
            }
          />
        ) : (
          <AppIcon
            name="profile"
            role={
              variant
            }
            size="lg"
            state="muted"
          />
        )}
      </View>

      {/* ==================================================
          BUTTONS
      ================================================== */}

      <View
        style={
          styles.buttonsRow
        }
      >
        <AppButton
          title="Take Photo"
          role={
            variant
          }
          variant="primary"
          size="md"
          leftIconName="camera"
          onPress={
            onCapture
          }
          style={
            styles.actionButton
          }
        />

        <AppButton
          title="Gallery"
          role={
            variant
          }
          variant="outline"
          size="md"
          leftIconName="image"
          onPress={
            onUpload
          }
          style={
            styles.actionButton
          }
        />
      </View>

      {/* ==================================================
          SKIP
      ================================================== */}

      {onSkip ? (
        <AppButton
          title="Skip for now"
          role={
            variant
          }
          variant="ghost"
          size="sm"
          onPress={
            onSkip
          }
          style={
            styles.skipButton
          }
        />
      ) : null}

      {/* ==================================================
          FOOTER
      ================================================== */}

      <AppText
        variant="caption"
        tone="secondary"
        center
        style={
          styles.footerText
        }
      >
        You can add or change your photo later from your profile.
      </AppText>
    </AppCard>
  );
}

export default memo(
  ProfilePhotoPreview,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.surface,
    },

    title: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    infoBox: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,
    },

    infoText: {
      flex: 1,
    },

    photoCircle: {
      width: 82,

      height: 82,

      alignSelf:
        "center",

      alignItems:
        "center",

      justifyContent:
        "center",

      overflow:
        "hidden",

      marginBottom:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.background,
    },

    previewImage: {
      width:
        "100%",

      height:
        "100%",
    },

    buttonsRow: {
      width:
        "100%",

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    actionButton: {
      flex: 1,
    },

    skipButton: {
      alignSelf:
        "center",

      marginTop:
        FixxamTokens.spacing.xs,
    },

    footerText: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textMuted,
    },
  });