import React from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  WorkerProfileForm,
} from "@/components/worker/profile/WorkerProfileForm";

import {
  useWorkerProfile,
} from "@/hooks/useWorkerProfile";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   BUILD WORKER PROFILE SCREEN
============================================================ */

export default function BuildProfileScreen() {
  const {
    profile,
    loading,
    saving,
    uploadingPhoto,
    uploadingGallery,
    updateField,
    pickProfilePhoto,
    addGalleryPhoto,
    removeGalleryPhoto,
    saveProfile,
  } =
    useWorkerProfile();

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="worker"
      >
        <View
          style={
            styles.loading
          }
        >
          <View
            style={
              styles.loadingIcon
            }
          >
            <ActivityIndicator
              size="large"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.loadingText
            }
          >
            Loading your profile...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     PROFILE FORM
  ========================================================== */

  return (
    <AppScreen
      role="worker"
    >
      <WorkerProfileForm
        profile={
          profile
        }
        saving={
          saving
        }
        uploadingPhoto={
          uploadingPhoto
        }
        uploadingGallery={
          uploadingGallery
        }
        updateField={
          updateField
        }
        pickProfilePhoto={
          pickProfilePhoto
        }
        addGalleryPhoto={
          addGalleryPhoto
        }
        removeGalleryPhoto={
          removeGalleryPhoto
        }
        saveProfile={
          saveProfile
        }
      />
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    loading: {
      flex: 1,

      minHeight: 420,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },
  });