import React, { memo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  WorkerProfile,
} from "@/types/workerProfile";

type Props = {
  profile: WorkerProfile;
  uploadingPhoto: boolean;
  onPickPhoto: () => Promise<void>;
};

function WorkerProfileHeader({
  profile,
  uploadingPhoto,
  onPickPhoto,
}: Props) {
  const initials =
    profile.fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (item) =>
          item.charAt(0).toUpperCase(),
      )
      .join("") || "W";

  return (
    <View style={styles.container}>
      <AppText
        variant="heading2"
        style={styles.title}
      >
        Build Your Profile
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={styles.subtitle}
      >
        Complete your profile so
        customers can understand your
        services and experience.
      </AppText>

      <View style={styles.photoArea}>
        <View style={styles.photo}>
          {profile.photoUrl ? (
            <Image
              source={{
                uri: profile.photoUrl,
              }}
              style={styles.image}
            />
          ) : (
            <AppText
              variant="heading2"
              style={styles.initials}
            >
              {initials}
            </AppText>
          )}

          {uploadingPhoto && (
            <View
              style={styles.loading}
            >
              <ActivityIndicator
                size="small"
              />
            </View>
          )}
        </View>

        <Pressable
          onPress={onPickPhoto}
          disabled={uploadingPhoto}
          style={({ pressed }) => [
            styles.photoButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <AppText
            variant="body"
            style={styles.photoButtonText}
          >
            {uploadingPhoto
              ? "Uploading..."
              : profile.photoUrl
                ? "Change Photo"
                : "Add Profile Photo"}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

export default memo(
  WorkerProfileHeader,
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  title: {
    marginBottom: 6,
  },

  subtitle: {
    lineHeight: 21,
  },

  photoArea: {
    alignItems: "center",
    marginTop: 20,
  },

  photo: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2F6",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  initials: {
    fontWeight: "700",
  },

  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.7)",
  },

  photoButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D8DEE6",
  },

  photoButtonText: {
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.7,
  },
});