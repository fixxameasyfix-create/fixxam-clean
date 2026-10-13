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
  MAX_GALLERY_PHOTOS,
} from "@/types/workerProfile";

type Props = {
  gallery: string[];
  uploading: boolean;
  onAdd: () => Promise<void>;
  onRemove: (
    url: string,
  ) => Promise<void>;
};

function WorkerGallerySection({
  gallery,
  uploading,
  onAdd,
  onRemove,
}: Props) {
  const canAdd =
    gallery.length <
    MAX_GALLERY_PHOTOS;

  return (
    <View style={styles.card}>
      <AppText
        variant="heading3"
        style={styles.heading}
      >
        Work Gallery
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        style={styles.description}
      >
        Show customers examples of your
        previous work.
      </AppText>

      <View style={styles.grid}>
        {gallery.map(
          (url) => (
            <View
              key={url}
              style={styles.item}
            >
              <Image
                source={{
                  uri: url,
                }}
                style={styles.image}
              />

              <Pressable
                onPress={() =>
                  onRemove(url)
                }
                style={
                  styles.remove
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.removeText
                  }
                >
                  Remove
                </AppText>
              </Pressable>
            </View>
          ),
        )}

        {canAdd && (
          <Pressable
            onPress={onAdd}
            disabled={uploading}
            style={({ pressed }) => [
              styles.add,
              pressed &&
                styles.pressed,
            ]}
          >
            {uploading ? (
              <ActivityIndicator />
            ) : (
              <>
                <AppText
                  variant="heading2"
                  style={styles.plus}
                >
                  +
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.addText
                  }
                >
                  Add Photo
                </AppText>
              </>
            )}
          </Pressable>
        )}
      </View>

      <AppText
        variant="caption"
        tone="secondary"
        style={styles.counter}
      >
        {gallery.length}/
        {MAX_GALLERY_PHOTOS} photos
      </AppText>
    </View>
  );
}

export default memo(
  WorkerGallerySection,
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  heading: {
    marginBottom: 5,
  },

  description: {
    lineHeight: 19,
    marginBottom: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  item: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  remove: {
    position: "absolute",
    left: 5,
    right: 5,
    bottom: 5,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor:
      "rgba(0,0,0,0.65)",
  },

  removeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  add: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#C8D0D9",
    alignItems: "center",
    justifyContent: "center",
  },

  plus: {
    fontSize: 30,
    lineHeight: 34,
  },

  addText: {
    marginTop: 3,
    fontWeight: "600",
  },

  counter: {
    marginTop: 12,
  },

  pressed: {
    opacity: 0.65,
  },
});