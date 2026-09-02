import React from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Variant = "customer" | "worker";

type Props = {
  photo: string | null;

  onUpload: () => void;
  onCapture: () => void;

  onSkip?: () => void;

  variant?: Variant;
};

export default function ProfilePhotoPreview({
  photo,
  onUpload,
  onCapture,
  onSkip,
  variant = "worker",
}: Props) {
  const isWorker = variant === "worker";

  const primaryColor = isWorker
    ? "#F97316"
    : "#2563EB";

  const infoBackground = isWorker
    ? "#FFF7ED"
    : "#EFF6FF";

  const infoTextColor = isWorker
    ? "#9A3412"
    : "#1D4ED8";

  return (
    <View style={styles.container}>
      {/* ==================================================
          TITLE
      ================================================== */}

      <AppText
        weight="bold"
        style={styles.title}
      >
        Add your profile photo
      </AppText>

      {/* ==================================================
          SUBTITLE
      ================================================== */}

      <AppText style={styles.subtitle}>
        Add a clear photo of yourself so customers and
        Fixxam can easily recognize your profile.
      </AppText>

      {/* ==================================================
          INFO
      ================================================== */}

      <View
        style={[
          styles.infoBox,
          {
            backgroundColor:
              infoBackground,
          },
        ]}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={18}
          color={primaryColor}
        />

        <AppText
          style={[
            styles.infoText,
            {
              color: infoTextColor,
            },
          ]}
        >
          Use a clear, well-lit photo where your face
          is easy to see.
        </AppText>
      </View>

      {/* ==================================================
          PHOTO
      ================================================== */}

      <View style={styles.photoCircle}>
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <Ionicons
            name="person-outline"
            size={38}
            color="#94A3B8"
          />
        )}
      </View>

      {/* ==================================================
          BUTTONS
      ================================================== */}

      <View style={styles.buttonsRow}>
        {/* TAKE PHOTO */}

        <Pressable
          onPress={onCapture}
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                primaryColor,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Take profile photo"
        >
          <Ionicons
            name="camera-outline"
            size={19}
            color="#FFFFFF"
          />

          <AppText
            color="#FFFFFF"
            weight="bold"
            style={
              styles.primaryButtonText
            }
          >
            Take Photo
          </AppText>
        </Pressable>

        {/* GALLERY */}

        <Pressable
          onPress={onUpload}
          style={styles.galleryButton}
          accessibilityRole="button"
          accessibilityLabel="Choose profile photo from gallery"
        >
          <Ionicons
            name="images-outline"
            size={19}
            color="#1E293B"
          />

          <AppText
            weight="bold"
            style={
              styles.galleryButtonText
            }
          >
            Gallery
          </AppText>
        </Pressable>
      </View>

      {/* ==================================================
          SKIP
      ================================================== */}

      {onSkip && (
        <Pressable
          onPress={onSkip}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Skip profile photo"
        >
          <AppText
            weight="bold"
            style={styles.skipText}
          >
            Skip for now
          </AppText>
        </Pressable>
      )}

      {/* ==================================================
          FOOTER
      ================================================== */}

      <AppText style={styles.footerText}>
        You can add or change your photo later
        from your profile.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,

    marginBottom: 8,
  },

  title: {
    fontSize: 17,
    lineHeight: 22,

    color: "#0F172A",

    marginBottom: 3,
  },

  subtitle: {
    fontSize: 11,
    lineHeight: 16,

    color: "#64748B",

    marginBottom: 9,
  },

  infoBox: {
    minHeight: 44,

    borderRadius: 11,

    paddingHorizontal: 10,
    paddingVertical: 7,

    flexDirection: "row",

    alignItems: "center",

    gap: 8,

    marginBottom: 12,
  },

  infoText: {
    flex: 1,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: "500",
  },

  photoCircle: {
    width: 82,
    height: 82,

    borderRadius: 41,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    backgroundColor: "#F8FAFC",

    alignSelf: "center",

    justifyContent: "center",
    alignItems: "center",

    overflow: "hidden",

    marginBottom: 12,
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  buttonsRow: {
    flexDirection: "row",

    gap: 8,

    width: "100%",
  },

  primaryButton: {
    flex: 1,

    height: 42,

    borderRadius: 11,

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    gap: 7,
  },

  primaryButtonText: {
    fontSize: 12,
  },

  galleryButton: {
    flex: 1,

    height: 42,

    borderRadius: 11,

    borderWidth: 1,

    borderColor: "#D1D5DB",

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    gap: 7,
  },

  galleryButtonText: {
    fontSize: 12,

    color: "#1E293B",
  },

  skipButton: {
    alignSelf: "center",

    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  skipText: {
    fontSize: 11,

    color: "#64748B",
  },

  footerText: {
    fontSize: 10,
    lineHeight: 14,

    color: "#94A3B8",

    textAlign: "center",

    marginTop: 0,
  },
});