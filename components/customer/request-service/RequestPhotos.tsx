import React, {
  useCallback,
  useState,
} from "react";

import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  photos: string[];
  onAdd: () => void;
  onTakePhoto: () => void;
  onRemove: (uri: string) => void;
  disabled?: boolean;
};

const MAX_PHOTOS = 3;

export default function RequestPhotos({
  photos,
  onAdd,
  onTakePhoto,
  onRemove,
  disabled = false,
}: Props) {
  const [pickerVisible, setPickerVisible] =
    useState(false);

  const canAdd =
    !disabled &&
    photos.length < MAX_PHOTOS;

  const handleAddPress =
    useCallback(() => {
      if (!canAdd) {
        return;
      }

      setPickerVisible(true);
    }, [canAdd]);

  const handleTakePhoto =
    useCallback(() => {
      setPickerVisible(false);
      onTakePhoto();
    }, [onTakePhoto]);

  const handleGallery =
    useCallback(() => {
      setPickerVisible(false);
      onAdd();
    }, [onAdd]);

  return (
    <View style={styles.container}>
      {/* PHOTO GRID */}

      <View style={styles.grid}>
        <Pressable
          onPress={handleAddPress}
          disabled={!canAdd}
          accessibilityRole="button"
          accessibilityLabel="Add photo"
          style={({ pressed }) => [
            styles.addCard,
            !canAdd &&
              styles.disabledCard,
            pressed &&
              canAdd &&
              styles.pressed,
          ]}
        >
          <View
            style={
              styles.addIconContainer
            }
          >
            <Ionicons
              name="camera-outline"
              size={27}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={styles.addText}
          >
            Add photo
          </AppText>

          <AppText
            style={
              styles.addSubtext
            }
          >
            {photos.length >=
            MAX_PHOTOS
              ? "Limit reached"
              : "Optional"}
          </AppText>
        </Pressable>

        {photos.map(
          (uri, index) => (
            <View
              key={`${uri}-${index}`}
              style={
                styles.photoWrapper
              }
            >
              <Image
                source={{ uri }}
                style={
                  styles.photo
                }
                resizeMode="cover"
              />

              <View
                style={
                  styles.photoNumber
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.photoNumberText
                  }
                >
                  {index + 1}
                </AppText>
              </View>

              <Pressable
                onPress={() =>
                  onRemove(uri)
                }
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${
                  index + 1
                }`}
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed &&
                    styles.removeButtonPressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={17}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          ),
        )}
      </View>

      {/* FOOTER */}

      <View style={styles.footer}>
        <View
          style={
            styles.footerIcon
          }
        >
          <Ionicons
            name="sparkles-outline"
            size={14}
            color="#2563EB"
          />
        </View>

        <AppText
          style={styles.hint}
        >
          Clear photos help our
          pros understand the job
          better.
        </AppText>

        <AppText
          style={styles.count}
        >
          {photos.length}/{MAX_PHOTOS}
        </AppText>
      </View>

      {/* ======================================================
          PHOTO SOURCE MODAL
      ====================================================== */}

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setPickerVisible(false)
        }
      >
        <Pressable
          style={
            styles.modalBackdrop
          }
          onPress={() =>
            setPickerVisible(false)
          }
        >
          <Pressable
            style={
              styles.modalCard
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={
                styles.modalHandle
              }
            />

            <AppText
              weight="bold"
              style={
                styles.modalTitle
              }
            >
              Add a photo
            </AppText>

            <AppText
              style={
                styles.modalSubtitle
              }
            >
              Choose how you want to
              add the problem photo.
            </AppText>

            {/* CAMERA */}

            <Pressable
              onPress={
                handleTakePhoto
              }
              style={({ pressed }) => [
                styles.option,
                pressed &&
                  styles.optionPressed,
              ]}
            >
              <View
                style={
                  styles.optionIcon
                }
              >
                <Ionicons
                  name="camera"
                  size={24}
                  color="#2563EB"
                />
              </View>

              <View
                style={
                  styles.optionText
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.optionTitle
                  }
                >
                  Take a Photo
                </AppText>

                <AppText
                  style={
                    styles.optionSubtitle
                  }
                >
                  Use your camera
                </AppText>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#94A3B8"
              />
            </Pressable>

            {/* GALLERY */}

            <Pressable
              onPress={
                handleGallery
              }
              style={({ pressed }) => [
                styles.option,
                pressed &&
                  styles.optionPressed,
              ]}
            >
              <View
                style={
                  styles.optionIcon
                }
              >
                <Ionicons
                  name="images"
                  size={24}
                  color="#2563EB"
                />
              </View>

              <View
                style={
                  styles.optionText
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.optionTitle
                  }
                >
                  Choose from Gallery
                </AppText>

                <AppText
                  style={
                    styles.optionSubtitle
                  }
                >
                  Select an existing photo
                </AppText>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#94A3B8"
              />
            </Pressable>

            <Pressable
              onPress={() =>
                setPickerVisible(false)
              }
              style={
                styles.cancelButton
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.cancelText
                }
              >
                Cancel
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    addCard: {
      width: 105,
      height: 118,
      borderRadius: 18,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: "#93C5FD",
      backgroundColor: "#F8FBFF",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },

    addIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 7,
    },

    addText: {
      fontSize: 12.5,
      color: "#2563EB",
    },

    addSubtext: {
      marginTop: 2,
      fontSize: 10,
      color: "#94A3B8",
    },

    disabledCard: {
      opacity: 0.5,
    },

    pressed: {
      transform: [
        { scale: 0.97 },
      ],
      opacity: 0.85,
    },

    photoWrapper: {
      width: 105,
      height: 118,
      position: "relative",
      borderRadius: 18,
      backgroundColor: "#E2E8F0",
      shadowColor: "#0F172A",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 2,
    },

    photo: {
      width: "100%",
      height: "100%",
      borderRadius: 18,
      backgroundColor: "#E2E8F0",
    },

    photoNumber: {
      position: "absolute",
      left: 7,
      bottom: 7,
      minWidth: 23,
      height: 23,
      paddingHorizontal: 6,
      borderRadius: 8,
      backgroundColor:
        "rgba(15,23,42,0.78)",
      alignItems: "center",
      justifyContent: "center",
    },

    photoNumberText: {
      fontSize: 10,
      color: "#FFFFFF",
    },

    removeButton: {
      position: "absolute",
      right: -5,
      top: -5,
      width: 29,
      height: 29,
      borderRadius: 15,
      backgroundColor: "#0F172A",
      borderWidth: 2,
      borderColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
    },

    removeButtonPressed: {
      transform: [
        { scale: 0.9 },
      ],
    },

    footer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 11,
    },

    footerIcon: {
      width: 24,
      height: 24,
      borderRadius: 8,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 7,
    },

    hint: {
      flex: 1,
      fontSize: 11.5,
      lineHeight: 17,
      color: "#64748B",
    },

    count: {
      marginLeft: 8,
      fontSize: 11,
      color: "#94A3B8",
    },

    /* MODAL */

    modalBackdrop: {
      flex: 1,
      backgroundColor:
        "rgba(15,23,42,0.45)",
      justifyContent: "flex-end",
    },

    modalCard: {
      backgroundColor: "#FFFFFF",
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 28,
    },

    modalHandle: {
      alignSelf: "center",
      width: 42,
      height: 5,
      borderRadius: 3,
      backgroundColor: "#CBD5E1",
      marginBottom: 18,
    },

    modalTitle: {
      fontSize: 21,
      color: "#0F172A",
    },

    modalSubtitle: {
      marginTop: 4,
      marginBottom: 18,
      fontSize: 13,
      lineHeight: 19,
      color: "#64748B",
    },

    option: {
      minHeight: 72,
      borderRadius: 18,
      backgroundColor: "#F8FAFC",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 13,
      marginBottom: 10,
    },

    optionPressed: {
      opacity: 0.75,
      transform: [
        { scale: 0.985 },
      ],
    },

    optionIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    optionText: {
      flex: 1,
      marginLeft: 12,
    },

    optionTitle: {
      fontSize: 14.5,
      color: "#0F172A",
    },

    optionSubtitle: {
      marginTop: 2,
      fontSize: 11.5,
      color: "#64748B",
    },

    cancelButton: {
      height: 50,
      borderRadius: 16,
      backgroundColor: "#F1F5F9",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },

    cancelText: {
      fontSize: 14,
      color: "#475569",
    },
  });