import React, {
  memo,
  useCallback,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppInput,
  AppText,
} from "@/components/ui";

import ProfilePhotoPreview from "@/components/worker/ProfilePhotoPreview";
import WorkerWorkGallery from "@/components/customer/WorkerWorkGallery";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  photo: string | null;

  onUploadPhoto: () => void;

  onCapturePhoto: () => void;

  about: string;

  setAbout: (
    value: string,
  ) => void;

  workGallery: string[];

  onAddWorkPhoto: () => void;

  onRemoveWorkPhoto: (
    index: number,
  ) => void;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_ABOUT_LENGTH = 500;
const MAX_WORK_IMAGES = 6;

/* ============================================================
   COMPONENT
============================================================ */

function WorkerStepFour({
  photo,

  onUploadPhoto,
  onCapturePhoto,

  about,
  setAbout,

  workGallery,

  onAddWorkPhoto,
  onRemoveWorkPhoto,
}: Props) {
  const handleAboutChange =
    useCallback(
      (
        value: string,
      ) => {
        setAbout(
          value.slice(
            0,
            MAX_ABOUT_LENGTH,
          ),
        );
      },
      [setAbout],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* =====================================================
          PROFILE PHOTO
      ===================================================== */}

      <ProfilePhotoPreview
        photo={
          photo
        }
        onUpload={
          onUploadPhoto
        }
        onCapture={
          onCapturePhoto
        }
        variant="worker"
      />

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <View
        style={
          styles.aboutSection
        }
      >
        <AppText
          variant="heading3"
          weight="bold"
          style={
            styles.title
          }
        >
          About you and your skills
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.subtitle
          }
        >
          Tell customers a little about your experience and skills.
        </AppText>

        <AppInput
          label="About you (Optional)"
          placeholder="Describe your skills and experience..."
          value={
            about
          }
          onChangeText={
            handleAboutChange
          }
          variant="worker"
          multiline
          numberOfLines={4}
          maxLength={
            MAX_ABOUT_LENGTH
          }
          textAlignVertical="top"
        />

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.counter
          }
        >
          {about.length}/{MAX_ABOUT_LENGTH}
        </AppText>
      </View>

      {/* =====================================================
          WORK GALLERY
      ===================================================== */}

      <WorkerWorkGallery
        images={
          workGallery
        }
        onAdd={
          onAddWorkPhoto
        }
        onRemove={
          onRemoveWorkPhoto
        }
        maxImages={
          MAX_WORK_IMAGES
        }
      />
    </View>
  );
}

export default memo(
  WorkerStepFour,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",
    },

    aboutSection: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginHorizontal:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      ...FixxamTokens.shadow.card,
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

    counter: {
      marginTop:
        FixxamTokens.spacing.xs,

      textAlign:
        "right",

      color:
        Colors.textMuted,
    },
  });