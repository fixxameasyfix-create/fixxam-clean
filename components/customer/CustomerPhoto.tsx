import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import { CustomerColors } from "@/theme";

type Props = {
  photo: string | null;
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
  onSkip: () => void;
};

export default function CustomerPhoto({
  photo,
  onTakePhoto,
  onChoosePhoto,
  onSkip,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        Add your profile photo
      </AppText>

      <AppText style={styles.subtitle}>
        Add a clear photo of yourself so
        customers and Fixxam can easily
        recognize your profile.
      </AppText>

      <View style={styles.qualityNotice}>
        <Ionicons
          name="checkmark-circle-outline"
          size={18}
          color="#2563EB"
        />

        <AppText style={styles.qualityText}>
          Please use a clear, well-lit photo
          where your face is easy to see.
        </AppText>
      </View>

      <View style={styles.previewContainer}>
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={styles.photo}
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name="person-outline"
              size={42}
              color={
                CustomerColors.textSecondary
              }
            />
          </View>
        )}
      </View>

      <Pressable
        onPress={onTakePhoto}
        style={styles.primaryButton}
      >
        <Ionicons
          name="camera-outline"
          size={20}
          color="#FFFFFF"
        />

        <AppText style={styles.primaryText}>
          Take Photo
        </AppText>
      </Pressable>

      <Pressable
        onPress={onChoosePhoto}
        style={styles.secondaryButton}
      >
        <Ionicons
          name="images-outline"
          size={20}
          color={
            CustomerColors.textPrimary
          }
        />

        <AppText style={styles.secondaryText}>
          Choose from Gallery
        </AppText>
      </Pressable>

      <Pressable
        onPress={onSkip}
        style={styles.skipButton}
      >
        <AppText style={styles.skipText}>
          Skip for now
        </AppText>
      </Pressable>

      <AppText style={styles.hint}>
        You can add or change your photo
        later from your profile.
      </AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 18,
  },

  title: {
    fontSize: 20,
    lineHeight: 26,
    color: CustomerColors.textPrimary,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: CustomerColors.textSecondary,
    marginBottom: 12,
  },

  qualityNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },

  qualityText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#1E40AF",
  },

  previewContainer: {
    alignItems: "center",
    marginBottom: 18,
  },

  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  primaryButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryButton: {
    minHeight: 48,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  secondaryText: {
    color: CustomerColors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

  skipButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  skipText: {
    color: CustomerColors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },

  hint: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: CustomerColors.textSecondary,
  },
});