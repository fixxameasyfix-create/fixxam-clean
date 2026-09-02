import React from "react";

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

type Props = {
  photo: string | null;

  onUploadPhoto: () => void;
  onCapturePhoto: () => void;

  about: string;
  setAbout: (value: string) => void;

  workGallery: string[];

  onAddWorkPhoto: () => void;
  onRemoveWorkPhoto: (
    index: number,
  ) => void;
};

export default function WorkerStepFour({
  photo,

  onUploadPhoto,
  onCapturePhoto,

  about,
  setAbout,

  workGallery,

  onAddWorkPhoto,
  onRemoveWorkPhoto,
}: Props) {
  return (
    <View style={styles.container}>
      {/* =====================================================
          PROFILE PHOTO
      ===================================================== */}

      <ProfilePhotoPreview
        photo={photo}
        onUpload={onUploadPhoto}
        onCapture={onCapturePhoto}
        variant="worker"
      />

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <View style={styles.aboutSection}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          About you and your skills
        </AppText>

        <AppText style={styles.subtitle}>
          Tell customers a little about your
          experience and skills.
        </AppText>

        <AppInput
          label="About you (Optional)"
          placeholder="Describe your skills and experience..."
          value={about}
          onChangeText={setAbout}
          variant="worker"
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
        />

        <AppText style={styles.counter}>
          {about.length}/500
        </AppText>
      </View>

      {/* =====================================================
          WORK GALLERY
      ===================================================== */}

      <WorkerWorkGallery
        images={workGallery}
        onAdd={onAddWorkPhoto}
        onRemove={onRemoveWorkPhoto}
        maxImages={6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  aboutSection: {
    marginTop: 8,
    marginHorizontal: 12,

    padding: 12,

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  title: {
    fontSize: 17,

    color: "#111827",

    marginBottom: 4,
  },

  subtitle: {
    fontSize: 12,

    lineHeight: 17,

    color: "#64748B",

    marginBottom: 10,
  },

  counter: {
    fontSize: 10,

    color: "#94A3B8",

    textAlign: "right",

    marginTop: 4,
  },
});