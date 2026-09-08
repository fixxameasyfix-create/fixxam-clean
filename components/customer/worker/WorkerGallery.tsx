import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

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

type GalleryImageProps = {
  image: string;
  index: number;
  onPress: (
    image: string,
  ) => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function resolveGalleryImage(
  item: GalleryItem,
): string {
  if (
    typeof item === "string"
  ) {
    return cleanString(item);
  }

  return (
    cleanString(item.url) ||
    cleanString(item.imageUrl) ||
    cleanString(item.uri)
  );
}

/* ==============================================================
   GALLERY IMAGE
============================================================== */

const GalleryImage =
  memo(function GalleryImage({
    image,
    index,
    onPress,
  }: GalleryImageProps) {
    const [
      failed,
      setFailed,
    ] = useState(false);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View work photo ${
          index + 1
        }`}
        onPress={() =>
          onPress(image)
        }
        style={({
          pressed,
        }) => [
          styles.imageCard,

          pressed
            ? styles.imagePressed
            : null,
        ]}
      >
        {!failed ? (
          <Image
            source={{
              uri: image,
            }}
            style={
              styles.image
            }
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={
              FixxamTokens.motion.fast
            }
            onError={() =>
              setFailed(true)
            }
          />
        ) : (
          <View
            style={
              styles.imageFallback
            }
          >
            <AppIcon
              name="image"
              role="customer"
              size="lg"
              state="muted"
            />
          </View>
        )}

        {/* ==================================================
            IMAGE NUMBER
        ================================================== */}

        <View
          style={
            styles.imageNumber
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.imageNumberText
            }
          >
            {index + 1}
          </AppText>
        </View>
      </Pressable>
    );
  });

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerGallery({
  images = [],
}: Props) {
  const insets =
    useSafeAreaInsets();

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState<string | null>(
      null,
    );

  const [
    previewFailed,
    setPreviewFailed,
  ] =
    useState(false);

  /* ============================================================
     NORMALIZE GALLERY
  ============================================================ */

  const galleryImages =
    useMemo(() => {
      if (
        !Array.isArray(
          images,
        )
      ) {
        return [];
      }

      return Array.from(
        new Set(
          images
            .map(
              resolveGalleryImage,
            )
            .filter(
              Boolean,
            ),
        ),
      );
    }, [
      images,
    ]);

  /* ============================================================
     OPEN IMAGE
  ============================================================ */

  const handleOpenImage =
    useCallback(
      (
        image: string,
      ) => {
        const normalizedImage =
          cleanString(
            image,
          );

        if (
          !normalizedImage
        ) {
          return;
        }

        setPreviewFailed(
          false,
        );

        setSelectedImage(
          normalizedImage,
        );
      },
      [],
    );

  /* ============================================================
     CLOSE IMAGE
  ============================================================ */

  const handleCloseImage =
    useCallback(() => {
      setSelectedImage(
        null,
      );

      setPreviewFailed(
        false,
      );
    }, []);

  /* ============================================================
     RENDER IMAGE
  ============================================================ */

  const renderImage =
    useCallback(
      ({
        item,
        index,
      }: {
        item: string;
        index: number;
      }) => (
        <GalleryImage
          image={
            item
          }
          index={
            index
          }
          onPress={
            handleOpenImage
          }
        />
      ),
      [
        handleOpenImage,
      ],
    );

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
              <AppIcon
                name="image"
                role="customer"
                size="md"
                state="active"
              />
            </View>

            <View
              style={
                styles.titleContent
              }
            >
              <AppText
                variant="bodyLarge"
                weight="bold"
                numberOfLines={1}
              >
                Work Gallery
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
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
          0 ? (
            <View
              style={
                styles.countChip
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.photoCount
                }
              >
                {
                  galleryImages.length
                }
              </AppText>
            </View>
          ) : null}
        </View>

        {/* ======================================================
            GALLERY
        ====================================================== */}

        {galleryImages.length >
        0 ? (
          <FlatList
            horizontal
            data={
              galleryImages
            }
            keyExtractor={(
              item,
            ) =>
              item
            }
            renderItem={
              renderImage
            }
            ItemSeparatorComponent={() => (
              <View
                style={
                  styles.separator
                }
              />
            )}
            showsHorizontalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.galleryWrapper
            }
            initialNumToRender={4}
            maxToRenderPerBatch={6}
            windowSize={5}
          />
        ) : (
          /* ====================================================
             EMPTY
          ==================================================== */

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
              <AppIcon
                name="image"
                role="customer"
                size="lg"
                state="muted"
              />
            </View>

            <AppText
              variant="bodyMedium"
              weight="bold"
              center
              style={
                styles.emptyTitle
              }
            >
              No work photos yet
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              center
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
          FULL SCREEN PREVIEW
      ======================================================== */}

      <Modal
        visible={
          Boolean(
            selectedImage,
          )
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          handleCloseImage
        }
      >
        <View
          style={
            styles.previewOverlay
          }
        >
          {/* ==================================================
              CLOSE
          ================================================== */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close image preview"
            hitSlop={8}
            onPress={
              handleCloseImage
            }
            style={({
              pressed,
            }) => [
              styles.closeButton,

              {
                top:
                  insets.top +
                  FixxamTokens
                    .spacing.sm,
              },

              pressed
                ? styles.closePressed
                : null,
            ]}
          >
            <AppIcon
              name="close"
              role="customer"
              size="md"
              color={
                Colors.textInverse
              }
            />
          </Pressable>

          {/* ==================================================
              PREVIEW
          ================================================== */}

          {selectedImage &&
          !previewFailed ? (
            <Image
              source={{
                uri:
                  selectedImage,
              }}
              style={
                styles.previewImage
              }
              contentFit="contain"
              cachePolicy="memory-disk"
              accessibilityLabel="Selected work photo"
              onError={() =>
                setPreviewFailed(
                  true,
                )
              }
            />
          ) : (
            <View
              style={
                styles.previewFallback
              }
            >
              <AppIcon
                name="image"
                role="customer"
                size="xl"
                color={
                  Colors.textInverse
                }
              />

              <AppText
                variant="body"
                center
                style={
                  styles.previewFallbackText
                }
              >
                Unable to display this
                image.
              </AppText>
            </View>
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
      marginTop:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    titleRow: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    iconBox: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    titleContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    countChip: {
      minWidth: 32,

      minHeight: 28,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    photoCount: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       GALLERY
    ======================================================== */

    galleryWrapper: {
      paddingRight:
        FixxamTokens.spacing.lg,
    },

    separator: {
      width:
        FixxamTokens.spacing.sm,
    },

    imageCard: {
      position:
        "relative",

      width: 160,

      height: 90,

      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    image: {
      width:
        "100%",

      height:
        "100%",
    },

    imageFallback: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
    },

    imagePressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    /* ========================================================
       IMAGE NUMBER
    ======================================================== */

    imageNumber: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.xs,

      right:
        FixxamTokens.spacing.xs,

      minWidth: 28,

      height: 28,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        "rgba(15,23,42,0.72)",
    },

    imageNumberText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyCard: {
      minHeight: 180,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xl,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    emptyIcon: {
      width:
        FixxamTokens.size
          .avatarLg,

      height:
        FixxamTokens.size
          .avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    emptyText: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       PREVIEW
    ======================================================== */

    previewOverlay: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      backgroundColor:
        "rgba(0,0,0,0.94)",
    },

    previewImage: {
      width:
        "100%",

      height:
        "82%",
    },

    previewFallback: {
      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    previewFallbackText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textInverse,
    },

    /* ========================================================
       CLOSE
    ======================================================== */

    closeButton: {
      position:
        "absolute",

      right:
        FixxamTokens.spacing.lg,

      zIndex: 10,

      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        "rgba(255,255,255,0.16)",
    },

    closePressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });

export default memo(
  WorkerGallery,
);