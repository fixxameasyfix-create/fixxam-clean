import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";
import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

type Props = {
  photos: string[];
  onOpenPhoto: (url: string) => void;
};

export default function PhotosCard({
  photos,
  onOpenPhoto,
}: Props) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.photoHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons
            name="images-outline"
            size={16}
            color={CustomerColors.primary}
          />

          <AppText
            variant="caption"
            weight="bold"
          >
            Photos
          </AppText>
        </View>

        {photos.length > 0 ? (
          <View style={styles.photoCount}>
            <AppText
              variant="caption"
              weight="bold"
              style={styles.photoCountText}
            >
              {photos.length}
            </AppText>
          </View>
        ) : null}
      </View>

      {photos.length > 0 ? (
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <Pressable
              key={photo}
              onPress={() => onOpenPhoto(photo)}
              accessibilityRole="button"
              accessibilityLabel={`View request photo ${
                index + 1
              }`}
              style={({ pressed }) => [
                styles.photoButton,
                pressed && styles.pressed,
              ]}
            >
              <Image
                source={{ uri: photo }}
                resizeMode="cover"
                style={styles.photo}
              />

              <View style={styles.expandButton}>
                <Ionicons
                  name="expand-outline"
                  size={12}
                  color="#FFFFFF"
                />
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.noPhotos}>
          <Ionicons
            name="images-outline"
            size={17}
            color={Colors.textSecondary}
          />

          <AppText
            variant="caption"
            tone="secondary"
          >
            No photos attached.
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
  },

  sectionCard: {
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },

  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  photoCount: {
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
  },

  photoCountText: {
    color: CustomerColors.primary,
  },

  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 7,
  },

  photoButton: {
    position: "relative",
    width: 70,
    height: 70,
    overflow: "hidden",
    borderRadius: 9,
    backgroundColor: Colors.background,
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  expandButton: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  noPhotos: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
});