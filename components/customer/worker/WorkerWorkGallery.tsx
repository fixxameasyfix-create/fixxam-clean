import React, { memo } from "react";

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";
import { FixxamTokens } from "@/theme";

type Props = {
  workGallery: string[];
  onAddWorkPhoto: () => void;
  onRemoveWorkPhoto: (index: number) => void;
};

function WorkerWorkGallery({
  workGallery,
  onAddWorkPhoto,
  onRemoveWorkPhoto,
}: Props) {
  const canAddMore =
    workGallery.length < 6;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photoRow}
      >
        {workGallery.map((uri, index) => (
          <View
            key={`${uri}-${index}`}
            style={styles.photoWrapper}
          >
            <Image
              source={{ uri }}
              style={styles.photo}
              resizeMode="cover"
            />

            <Pressable
              onPress={() =>
                onRemoveWorkPhoto(index)
              }
              accessibilityRole="button"
              accessibilityLabel={`Remove work photo ${
                index + 1
              }`}
              hitSlop={8}
              style={styles.removeButton}
            >
              <AppText style={styles.removeText}>
                ×
              </AppText>
            </Pressable>
          </View>
        ))}

        {canAddMore ? (
          <Pressable
            onPress={onAddWorkPhoto}
            accessibilityRole="button"
            accessibilityLabel="Add work photo"
            style={({ pressed }) => [
              styles.addPhoto,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.plusCircle}>
              <AppText style={styles.plus}>
                +
              </AppText>
            </View>

            <AppText style={styles.addText}>
              Add Photo
            </AppText>
          </Pressable>
        ) : null}
      </ScrollView>

      {/* Horizontal separator */}
      <View style={styles.separator} />
    </View>
  );
}

export default memo(WorkerWorkGallery);

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: FixxamTokens.spacing.sm,
    paddingVertical: FixxamTokens.spacing.xs,
  },

  photoWrapper: {
    width: 120,
    height: 120,
    borderRadius: FixxamTokens.radius.md,
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },

  removeText: {
    color: "#FFFFFF",
    fontSize: 25,
    lineHeight: 28,
    fontWeight: "700",
  },

  addPhoto: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: FixxamTokens.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF9E9",
    flexShrink: 0,
  },

  plusCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  plus: {
    fontSize: 32,
    lineHeight: 36,
  },

  addText: {
    marginTop: FixxamTokens.spacing.xs,
    fontSize: 14,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.7,
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginTop: FixxamTokens.spacing.md,
  },
});