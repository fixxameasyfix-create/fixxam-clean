import React, {
  useMemo,
  useState,
} from "react";

import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type GalleryItem =
  | string
  | {
      url?: string;
      imageUrl?: string;
      uri?: string;
    };

type Props = {
  images?: GalleryItem[];
};

export default function WorkerGallery({
  images = [],
}: Props) {
  const [
    selectedImage,
    setSelectedImage,
  ] = useState<string | null>(null);

  /* ============================================================
     NORMALIZE GALLERY IMAGES
  ============================================================ */

  const galleryImages =
    useMemo(() => {
      if (!Array.isArray(images)) {
        return [];
      }

      return images
        .map((item) => {
          if (
            typeof item === "string"
          ) {
            return item.trim();
          }

          if (
            item &&
            typeof item === "object"
          ) {
            return (
              item.url ??
              item.imageUrl ??
              item.uri ??
              ""
            ).trim();
          }

          return "";
        })
        .filter(
          (
            image,
          ): image is string =>
            Boolean(image),
        );
    }, [images]);

  /* ============================================================
     OPEN IMAGE
  ============================================================ */

  const handleOpenImage = (
    image: string,
  ) => {
    setSelectedImage(image);
  };

  /* ============================================================
     CLOSE IMAGE
  ============================================================ */

  const handleCloseImage =
    () => {
      setSelectedImage(null);
    };

  return (
    <>
      <View
        style={
          styles.container
        }
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.titleRow
            }
          >
            <View
              style={
                styles.iconBox
              }
            >
              <Ionicons
                name="images-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.titleContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.title
                }
              >
                Work Gallery
              </AppText>

              <AppText
                style={
                  styles.subtitle
                }
              >
                Photos of work completed
                by this worker
              </AppText>
            </View>
          </View>

          {galleryImages.length >
            0 && (
            <AppText
              weight="bold"
              style={
                styles.photoCount
              }
            >
              {galleryImages.length}
            </AppText>
          )}
        </View>

        {/* ======================================================
            HORIZONTAL GALLERY
        ====================================================== */}

        {galleryImages.length >
        0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.galleryWrapper
            }
            keyboardShouldPersistTaps="handled"
            decelerationRate="fast"
          >
            {galleryImages.map(
              (
                image,
                index,
              ) => (
                <Pressable
                  key={`${image}-${index}`}
                  style={({ pressed }) => [
                    styles.imageCard,
                    pressed &&
                      styles.imagePressed,
                  ]}
                  onPress={() =>
                    handleOpenImage(
                      image,
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`View work photo ${
                    index + 1
                  }`}
                >
                  <Image
                    source={{
                      uri: image,
                    }}
                    style={
                      styles.image
                    }
                    resizeMode="cover"
                  />

                  {/* IMAGE NUMBER */}

                  <View
                    style={
                      styles.imageNumber
                    }
                  >
                    <AppText
                      weight="bold"
                      style={
                        styles.imageNumberText
                      }
                    >
                      {index + 1}
                    </AppText>
                  </View>
                </Pressable>
              ),
            )}
          </ScrollView>
        ) : (
          /* ======================================================
             EMPTY STATE
          ====================================================== */

          <View
            style={
              styles.emptyCard
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="images-outline"
                size={32}
                color="#94A3B8"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.emptyTitle
              }
            >
              No work photos yet
            </AppText>

            <AppText
              style={
                styles.emptyText
              }
            >
              This worker has not added
              any work photos yet.
            </AppText>
          </View>
        )}
      </View>

      {/* ========================================================
          FULL SCREEN IMAGE PREVIEW
      ======================================================== */}

      <Modal
        visible={
          Boolean(selectedImage)
        }
        transparent
        animationType="fade"
        onRequestClose={
          handleCloseImage
        }
        statusBarTranslucent
      >
        <View
          style={
            styles.previewOverlay
          }
        >
          {/* CLOSE BUTTON */}

          <Pressable
            style={
              styles.closeButton
            }
            onPress={
              handleCloseImage
            }
            accessibilityRole="button"
            accessibilityLabel="Close image preview"
            hitSlop={8}
          >
            <Ionicons
              name="close"
              size={28}
              color="#FFFFFF"
            />
          </Pressable>

          {/* IMAGE */}

          {selectedImage && (
            <Image
              source={{
                uri: selectedImage,
              }}
              style={
                styles.previewImage
              }
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop: 24,
      paddingHorizontal: 16,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom: 14,
    },

    titleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,
    },

    iconBox: {
      width: 48,
      height: 48,

      borderRadius: 16,

      backgroundColor:
        "#EFF6FF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    titleContent: {
      flex: 1,

      marginLeft: 12,
    },

    title: {
      fontSize: 19,

      lineHeight: 24,

      color:
        "#0F172A",
    },

    subtitle: {
      marginTop: 2,

      fontSize: 13,

      lineHeight: 19,

      color:
        "#64748B",
    },

    photoCount: {
      minWidth: 30,

      textAlign:
        "right",

      fontSize: 14,

      color:
        "#2563EB",
    },

    /* ==========================================================
       HORIZONTAL GALLERY
    ========================================================== */

    galleryWrapper: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 10,

      paddingRight: 16,
    },

    /*
     * Landscape 16:9
     *
     * 160 x 90
     */

    imageCard: {
      width: 160,
      height: 90,

      borderRadius: 14,

      overflow:
        "hidden",

      backgroundColor:
        "#E2E8F0",

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      position: "relative",
    },

    image: {
      width: "100%",
      height: "100%",
    },

    /* ==========================================================
       IMAGE NUMBER
    ========================================================== */

    imageNumber: {
      position:
        "absolute",

      top: 7,

      right: 7,

      minWidth: 25,

      height: 25,

      paddingHorizontal: 7,

      borderRadius: 13,

      backgroundColor:
        "rgba(15, 23, 42, 0.68)",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    imageNumberText: {
      fontSize: 11,

      color:
        "#FFFFFF",
    },

    imagePressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    /* ==========================================================
       EMPTY STATE
    ========================================================== */

    emptyCard: {
      minHeight: 180,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal: 24,

      paddingVertical: 28,

      shadowColor:
        "#0F172A",

      shadowOpacity: 0.04,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 2,
    },

    emptyIcon: {
      width: 62,

      height: 62,

      borderRadius: 20,

      backgroundColor:
        "#F1F5F9",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom: 12,
    },

    emptyTitle: {
      fontSize: 16,

      color:
        "#0F172A",

      textAlign:
        "center",
    },

    emptyText: {
      marginTop: 6,

      maxWidth: 280,

      fontSize: 13,

      lineHeight: 19,

      color:
        "#64748B",

      textAlign:
        "center",
    },

    /* ==========================================================
       FULL SCREEN PREVIEW
    ========================================================== */

    previewOverlay: {
      flex: 1,

      backgroundColor:
        "rgba(0, 0, 0, 0.94)",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal: 16,
    },

    previewImage: {
      width: "100%",

      height: "80%",
    },

    /* ==========================================================
       CLOSE BUTTON
    ========================================================== */

    closeButton: {
      position:
        "absolute",

      top: 50,

      right: 20,

      zIndex: 10,

      width: 46,

      height: 46,

      borderRadius: 23,

      backgroundColor:
        "rgba(255, 255, 255, 0.15)",

      alignItems:
        "center",

      justifyContent:
        "center",
    },
  });