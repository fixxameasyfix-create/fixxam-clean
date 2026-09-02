import React from "react";

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Ionicons,
} from "@expo/vector-icons";

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
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>
        <View>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Your Work Gallery
          </AppText>

          <AppText style={styles.subtitle}>
            Show customers examples of your work.
          </AppText>
        </View>

        <AppText style={styles.count}>
          {images.length}/{maxImages}
        </AppText>
      </View>

      {/* =====================================================
          HORIZONTAL GALLERY
      ===================================================== */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.gallery
        }
      >
        {/* ADD BUTTON */}

        {canAdd && (
          <Pressable
            onPress={onAdd}
            style={styles.addCard}
            accessibilityRole="button"
            accessibilityLabel="Add work photo"
          >
            <View
              style={
                styles.addIconContainer
              }
            >
              <Ionicons
                name="add"
                size={28}
                color="#FF6B00"
              />
            </View>

            <AppText
              style={styles.addText}
            >
              Add Photo
            </AppText>
          </Pressable>
        )}

        {/* WORK IMAGES */}

        {images.map(
          (uri, index) => (
            <View
              key={`${uri}-${index}`}
              style={styles.imageCard}
            >
              <Image
                source={{
                  uri,
                }}
                style={styles.image}
              />

              <Pressable
                onPress={() =>
                  onRemove(index)
                }
                style={
                  styles.removeButton
                }
                accessibilityRole="button"
                accessibilityLabel={`Remove work photo ${index + 1}`}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginHorizontal: 12,

    padding: 12,

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  header: {
    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent:
      "space-between",

    marginBottom: 10,
  },

  title: {
    fontSize: 16,

    color: "#111827",

    marginBottom: 3,
  },

  subtitle: {
    fontSize: 11,

    color: "#64748B",
  },

  count: {
    fontSize: 11,

    color: "#64748B",

    fontWeight: "700",
  },

  gallery: {
    flexDirection: "row",

    alignItems: "center",

    gap: 10,

    paddingRight: 4,
  },

  addCard: {
    width: 105,
    height: 115,

    borderRadius: 12,

    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#FF6B00",

    backgroundColor: "#FFF7ED",

    alignItems: "center",
    justifyContent: "center",
  },

  addIconContainer: {
    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 6,
  },

  addText: {
    fontSize: 11,

    color: "#FF6B00",

    fontWeight: "700",
  },

  imageCard: {
    width: 105,
    height: 115,

    borderRadius: 12,

    overflow: "hidden",

    backgroundColor: "#F1F5F9",

    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  removeButton: {
    position: "absolute",

    top: 6,
    right: 6,

    width: 26,
    height: 26,

    borderRadius: 13,

    backgroundColor:
      "rgba(0,0,0,0.65)",

    alignItems: "center",
    justifyContent: "center",
  },
});