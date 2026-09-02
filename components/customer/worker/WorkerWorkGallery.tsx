import React from "react";

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  images: string[];

  onAdd: () => void;

  onRemove: (
    index: number,
  ) => void;

  maxImages?: number;
};

export default function WorkerWorkGallery({
  images,
  onAdd,
  onRemove,
  maxImages = 6,
}: Props) {
  const canAdd =
    images.length < maxImages;

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Work Gallery
          </AppText>

          <AppText style={styles.subtitle}>
            Show customers examples of your work.
          </AppText>
        </View>

        <AppText style={styles.count}>
          {images.length}/{maxImages}
        </AppText>
      </View>

      {/* HORIZONTAL GALLERY */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.gallery
        }
        keyboardShouldPersistTaps="handled"
      >
        {images.map(
          (image, index) => (
            <View
              key={`${image}-${index}`}
              style={styles.imageWrapper}
            >
              <Image
                source={{
                  uri: image,
                }}
                style={styles.image}
                resizeMode="cover"
              />

              <Pressable
                onPress={() =>
                  onRemove(index)
                }
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed &&
                    styles.removePressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Remove work photo ${index + 1}`}
                hitSlop={6}
              >
                <Ionicons
                  name="close"
                  size={15}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          ),
        )}

        {/* ADD BUTTON */}

        {canAdd && (
          <Pressable
            onPress={onAdd}
            style={({ pressed }) => [
              styles.addButton,
              pressed &&
                styles.addPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add work photo"
          >
            <View
              style={styles.addIcon}
            >
              <Ionicons
                name="add"
                size={25}
                color="#F97316"
              />
            </View>

            <AppText
              weight="bold"
              style={styles.addText}
            >
              Add Photo
            </AppText>
          </Pressable>
        )}
      </ScrollView>

      {/* NOTE */}

      <AppText style={styles.note}>
        Optional · You can add up to{" "}
        {maxImages} photos.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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

  header: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 17,

    color: "#111827",

    marginBottom: 3,
  },

  subtitle: {
    fontSize: 11,

    lineHeight: 16,

    color: "#64748B",
  },

  count: {
    fontSize: 11,

    fontWeight: "700",

    color: "#94A3B8",

    marginLeft: 8,
  },

  /*
   * ============================================================
   * HORIZONTAL GALLERY
   * ============================================================
   */

  gallery: {
    flexDirection: "row",

    alignItems: "center",

    gap: 10,

    paddingRight: 4,
  },

  /*
   * Landscape 16:9 image
   *
   * 128 x 72
   */

  imageWrapper: {
    width: 128,
    height: 72,

    borderRadius: 10,

    overflow: "hidden",

    backgroundColor: "#F8FAFC",

    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  /*
   * ============================================================
   * REMOVE
   * ============================================================
   */

  removeButton: {
    position: "absolute",

    top: 5,
    right: 5,

    width: 23,
    height: 23,

    borderRadius: 12,

    backgroundColor:
      "rgba(15, 23, 42, 0.78)",

    justifyContent: "center",
    alignItems: "center",

    zIndex: 2,
  },

  removePressed: {
    opacity: 0.65,
    transform: [
      {
        scale: 0.92,
      },
    ],
  },

  /*
   * ============================================================
   * ADD PHOTO
   * ============================================================
   */

  addButton: {
    width: 128,
    height: 72,

    borderRadius: 10,

    borderWidth: 1.5,

    borderColor: "#FDBA74",

    borderStyle: "dashed",

    backgroundColor: "#FFF7ED",

    justifyContent: "center",

    alignItems: "center",
  },

  addIcon: {
    width: 28,
    height: 28,

    borderRadius: 14,

    backgroundColor: "#FFEDD5",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 2,
  },

  addText: {
    fontSize: 10,

    color: "#F97316",
  },

  addPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  /*
   * ============================================================
   * NOTE
   * ============================================================
   */

  note: {
    fontSize: 9,

    color: "#94A3B8",

    marginTop: 9,
  },
});