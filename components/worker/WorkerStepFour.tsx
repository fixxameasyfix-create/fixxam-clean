import React, {
  memo,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import AppInput from "@/components/ui/AppInput";
import { AppText } from "@/components/ui";

import WorkerWorkGallery from "@/components/customer/worker/WorkerWorkGallery";
import WorkerPhotoSourceModal from "@/components/worker/WorkerPhotoSourceModal";

import { FixxamTokens } from "@/theme";

type Props = {
  about: string;
  setAbout: (value: string) => void;

  workGallery: string[];

  onAddWorkPhoto: () => void;
  onTakeWorkPhoto: () => void;
  onPickWorkPhotos: () => void;

  onRemoveWorkPhoto: (
    index: number,
  ) => void;

  loading?: boolean;
};

const MAX_ABOUT_LENGTH = 500;
const MAX_GALLERY_ITEMS = 6;

function WorkerStepFour({
  about,
  setAbout,
  workGallery,
  onAddWorkPhoto,
  onTakeWorkPhoto,
  onPickWorkPhotos,
  onRemoveWorkPhoto,
  loading = false,
}: Props) {
  const [photoModalVisible, setPhotoModalVisible] =
    useState(false);

  const openPhotoModal = () => {
    setPhotoModalVisible(true);
  };

  const closePhotoModal = () => {
    if (!loading) {
      setPhotoModalVisible(false);
    }
  };

  const handleCamera = () => {
    setPhotoModalVisible(false);
    onTakeWorkPhoto();
  };

  const handleGallery = () => {
    setPhotoModalVisible(false);
    onPickWorkPhotos();
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.aboutSection}>
          <AppInput
            label="About you (Optional)"
            value={about}
            onChangeText={setAbout}
            placeholder="Tell customers about your experience and skills..."
            multiline
            maxLength={MAX_ABOUT_LENGTH}
            textAlignVertical="top"
            style={styles.aboutInput}
          />

          <AppText
            variant="caption"
            color="secondary"
            style={styles.aboutCounter}
          >
            {about.length}/{MAX_ABOUT_LENGTH}
          </AppText>
        </View>

        <View style={styles.gallerySection}>
          <View style={styles.galleryHeader}>
            <AppText
              variant="heading2"
              style={styles.galleryTitle}
            >
              Your Work Gallery
            </AppText>

            <AppText
              variant="caption"
              color="secondary"
            >
              {workGallery.length}/{MAX_GALLERY_ITEMS}
            </AppText>
          </View>

          <AppText
            variant="body"
            color="secondary"
            style={styles.gallerySubtitle}
          >
            Show customers examples of your work.
          </AppText>

          <WorkerWorkGallery
            workGallery={workGallery}
            onAddWorkPhoto={openPhotoModal}
            onRemoveWorkPhoto={
              onRemoveWorkPhoto
            }
          />
        </View>
      </View>

      <WorkerPhotoSourceModal
        visible={photoModalVisible}
        loading={loading}
        onClose={closePhotoModal}
        onCamera={handleCamera}
        onGallery={handleGallery}
      />
    </>
  );
}

export default memo(WorkerStepFour);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal:
      FixxamTokens.spacing.lg,
    paddingBottom:
      FixxamTokens.spacing.md,
  },

  aboutSection: {
    marginTop:
      FixxamTokens.spacing.sm,
  },

  aboutInput: {
    minHeight: 104,
  },

  aboutCounter: {
    alignSelf: "flex-end",
    marginTop:
      -FixxamTokens.spacing.xs,
  },

  gallerySection: {
    marginTop:
      FixxamTokens.spacing.md,
  },

  galleryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  galleryTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  gallerySubtitle: {
    marginTop:
      FixxamTokens.spacing.xs,
    marginBottom:
      FixxamTokens.spacing.sm,
  },
});